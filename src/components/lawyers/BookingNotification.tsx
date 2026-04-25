import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Phone,
  Video,
  User,
  Bell,
  XCircle,
  CheckCircle,
  FileText
} from 'lucide-react';

interface IncomingRequest {
  id: string;
  consultationId: string;
  clientName: string;
  clientAvatar?: string;
  type: 'chat' | 'audio' | 'video';
  amount: number;
  agenda?: string | null;
  countdown: number;
  statusMessage?: string;
}

interface BookingNotificationProviderProps {
  children: React.ReactNode;
}

const parseAgenda = (agenda: string | null | undefined) => {
  if (!agenda) return { category: '', urgency: '', details: '' };

  const categoryMatch = agenda.match(/^\[(.+?)\]/);
  const urgencyMatch = agenda.match(/\]\s*\[(.+?)\]/);
  const details = agenda
    .replace(/^\[.+?\](\s*\[.+?\])*/g, '')
    .replace(/^\n/, '');

  return {
    category: categoryMatch?.[1] || '',
    urgency: urgencyMatch?.[1] || '',
    details: details || agenda,
  };
};

export const BookingNotificationProvider = ({ children }: BookingNotificationProviderProps) => {

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [requests, setRequests] = useState<IncomingRequest[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const intervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  useEffect(() => {

    if (!user) return;

    const checkLawyerAndSubscribe = async () => {

      const { data: lawyerProfile } = await supabase
        .from('lawyer_profiles')
        // .from('lawyer_profile')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (!lawyerProfile) return;

      const channel = supabase
        .channel('lawyer-booking-notifications-global')
        .on(
          'postgres_changes',
          {
            event: '*', // ✅ IMPORTANT: listen to INSERT + UPDATE
            schema: 'public',
            table: 'consultations',
            filter: `lawyer_id=eq.${user.id}`,
          },
          async (payload) => {
            console.log("🔥 Realtime triggered:", payload); // DEBUG

            const consultation = payload.new as any;

            // =========================
            // ✅ NEW REQUEST (INSERT)
            // =========================
            if (
              payload.eventType === 'INSERT' &&
              consultation.status === 'pending'
            ) {

              const { data: clientProfile } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', consultation.client_id)
                .single();

              const reqId = consultation.id;

              const newReq: IncomingRequest = {
                id: reqId,
                consultationId: consultation.id,
                clientName: clientProfile?.full_name || 'Client',
                clientAvatar: clientProfile?.avatar_url || undefined,
                type: consultation.type,
                amount: consultation.total_amount || 0,
                agenda: consultation.agenda,
                countdown: 60,
              };

              setRequests(prev => [newReq, ...prev]);

              // ⏱ countdown logic (unchanged)
              const interval = setInterval(() => {

                setRequests(prev => {

                  const updated = prev.map(r => {

                    if (r.id === reqId) {

                      if (r.countdown <= 1) {
                        clearInterval(intervalsRef.current.get(reqId)!);
                        intervalsRef.current.delete(reqId);
                        return null;
                      }

                      return { ...r, countdown: r.countdown - 1 };
                    }

                    return r;

                  }).filter(Boolean) as IncomingRequest[];

                  return updated;

                });

              }, 1000);

              intervalsRef.current.set(reqId, interval);

              // 🔔 sound
              try {
                const audio = new Audio('/notification.mp3');
                audio.volume = 0.5;
                audio.play().catch(() => { });
              } catch { }

              // 🔔 browser notification
              if (Notification.permission === 'granted') {
                new Notification('New Consultation Request', {
                  body: `${clientProfile?.full_name || 'Client'} requested ${consultation.type} consultation`
                });
              }
            }

            // =========================
            // ❌ CLIENT CANCELLED (UPDATE)
            // =========================
            if (payload.eventType === 'UPDATE') {

              // 🔥 remove instantly if cancelled
              if (consultation.status === 'cancelled') {
                if (intervalsRef.current.has(consultation.id)) {
                  clearInterval(intervalsRef.current.get(consultation.id)!);
                  intervalsRef.current.delete(consultation.id);
                }

                // 2. Show message instead of removing
                setRequests(prev =>
                  prev.map(r =>
                    r.id === consultation.id
                      ? { ...r, statusMessage: 'Client changed their mind' }
                      : r
                  )
                );

                // 3. Remove after 3 seconds
                setTimeout(() => {
                  setRequests(prev => prev.filter(r => r.id !== consultation.id));
                }, 3000);
              }

              // 🔥 also remove if already accepted
              if (consultation.accepted_at) {
                dismissRequest(consultation.id);
              }
            }

          }
        )
        .subscribe();


      // 🔔 request permission
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }

      // 🧹 cleanup
      return () => {
        supabase.removeChannel(channel);
      };

    };

    const cleanup = checkLawyerAndSubscribe();
    return () => { cleanup.then(fn => fn?.()); };
  }, [user]);

  // Also listen for cancellation of pending consultations (client cancelled while waiting)
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('lawyer-booking-cancel-listener')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'consultations',
          filter: `lawyer_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as any;
          if (updated.status === 'cancelled') {
            // Remove from requests if still showing
            dismissRequest(updated.id);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };

  }, [user]);

  const dismissRequest = (id: string) => {

    if (intervalsRef.current.has(id)) {
      clearInterval(intervalsRef.current.get(id)!);
      intervalsRef.current.delete(id);
    }

    setRequests(prev => prev.filter(r => r.id !== id));
    setExpanded(null);

  };

  const handleAccept = async (req: IncomingRequest) => {

    const now = new Date().toISOString();

    // 1. Send signal (keep it)
    await supabase.from('call_signals').insert({
      consultation_id: req.consultationId,
      sender_id: user.id,
      type: 'lawyer-accepted',
      data: {}
    });

    // 2. 🔥 UPDATE CONSULTATION (THIS IS THE REAL FIX)
    await supabase
      .from('consultations')
      .update({
        status: 'pending',
        started_at: null,
        accepted_at: now   // ✅ IMPORTANT
      })
      .eq('id', req.consultationId);

    toast({
      title: 'Accepted',
      description: 'Waiting for client payment...'
    });

    dismissRequest(req.id);

    navigate(`/consultation/${req.consultationId}`);
  };

  const handleReject = async (req: IncomingRequest) => {

    await supabase
      .from('consultations')
      .update({ status: 'cancelled' })
      .eq('id', req.consultationId);

    toast({
      title: 'Declined',
      description: 'Client has been notified'
    });

    dismissRequest(req.id);

  };

  const getTypeIcon = (type: string) => {

    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'audio':
        return <Phone className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }

  };

  return (
    <>
      {children}

      {requests.length > 0 && (

        // <div className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-none">
        <div className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-auto">

          {requests.map(req => {

            const { category, urgency, details } = parseAgenda(req.agenda);

            return (

              <div
                key={req.id}
                className="pointer-events-auto bg-card border rounded-xl shadow-2xl w-[90%] max-w-md animate-in zoom-in-95 duration-200"
              >

                {/* SMALL CARD */}


                {expanded !== req.id && (

                  <div
                    onClick={() => setExpanded(req.id)}
                    className="
      cursor-pointer
      p-4
      flex items-center gap-4
      rounded-2xl
      border border-white/10
      bg-black/60
      backdrop-blur-xl
      hover:bg-black/70
      transition-all duration-300
      shadow-[0_8px_30px_rgba(0,0,0,0.35)]
      hover:shadow-[0_10px_40px_rgba(0,0,0,0.55)]
    "
                  >

                    {/* Bell Icon */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/20">

                      <Bell className="h-5 w-5 text-red-500 animate-pulse" />

                    </div>

                    {/* Content */}
                    <div className="flex-1">

                      <p className="font-semibold text-sm text-white tracking-wide">
                        New Consultation Request
                      </p>

                      <p className="text-xs text-white/70 mt-1">
                        {req.clientName} • ₹{req.amount}
                      </p>

                      <p className="text-[11px] text-white/50 mt-1">
                        Tap to review this consultation
                      </p>

                    </div>

                    {/* Countdown */}
                    <div className="flex flex-col items-end">

                      <Badge
                        variant="outline"
                        className="
          border-red-400/40
          text-red-400
          bg-red-500/10
          font-semibold
          px-2.5
          py-0.5
        "
                      >
                        {req.countdown}s
                      </Badge>

                      <span className="text-[10px] text-white/50 mt-1">
                        remaining
                      </span>

                    </div>

                  </div>

                )}

                {/* EXPANDED DIALOG */}

                {expanded === req.id && (

                  <div className="p-5 space-y-4">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">

                        {req.clientAvatar ? (
                          <img
                            src={req.clientAvatar}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5" />
                        )}

                      </div>

                      <div className="flex-1">

                        <p className="font-semibold">
                          {req.clientName}
                        </p>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">

                          {getTypeIcon(req.type)}

                          <span className="capitalize">
                            {req.type}
                          </span>

                          <span className="text-primary font-medium">
                            ₹{req.amount}
                          </span>

                        </div>

                      </div>

                      <Badge variant="outline">
                        {req.countdown}s
                      </Badge>

                    </div>

                    {/* AGENDA */}

                    {req.agenda && (

                      <div className="bg-secondary/40 p-3 rounded-lg space-y-2 text-sm">

                        <p className="font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Agenda
                        </p>

                        <div className="flex gap-2 flex-wrap">

                          {category && (
                            <Badge variant="outline">{category}</Badge>
                          )}
                        </div>

                        {req.statusMessage && (
                          <p className="text-xs text-red-400 mt-1 flex justify-center">
                            {req.statusMessage}
                          </p>
                        )}
                      </div>

                    )}


                    {/* ACTIONS */}

                    <div className="flex gap-3">

                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleReject(req)}
                        disabled={!!req.statusMessage}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>

                      <Button
                        className="flex-1"
                        onClick={() => handleAccept(req)}
                        disabled={!!req.statusMessage}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Acceptt
                      </Button>

                    </div>

                  </div>

                )}

              </div>

            );

          })}

        </div>

      )}

    </>
  );

};