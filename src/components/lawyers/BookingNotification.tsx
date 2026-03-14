// import { useEffect, useState, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { supabase } from '@/integrations/supabase/client';
// import { useAuth } from '@/contexts/AuthContext';
// import { useToast } from '@/hooks/use-toast';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import {
//   MessageSquare, Phone, Video, DollarSign,
//   User, Clock, X, CheckCircle, Bell, XCircle, FileText
// } from 'lucide-react';

// interface IncomingRequest {
//   id: string;
//   consultationId: string;
//   clientName: string;
//   clientAvatar?: string;
//   type: 'chat' | 'audio' | 'video';
//   amount: number;
//   agenda?: string | null;
//   countdown: number;
// }

// interface BookingNotificationProviderProps {
//   children: React.ReactNode;
// }
// const parseAgenda = (agenda: string | null | undefined) => {
//   if (!agenda) return { category: '', urgency: '', details: '' };
//   const categoryMatch = agenda.match(/^\[(.+?)\]/);
//   const urgencyMatch = agenda.match(/\]\s*\[(.+?)\]/);
//   const details = agenda.replace(/^\[.+?\](\s*\[.+?\])*/g, '').replace(/^\n/, '');
//   return {
//     category: categoryMatch?.[1] || '',
//     urgency: urgencyMatch?.[1] || '',
//     details: details || agenda,
//   };
// };

// export const BookingNotificationProvider = ({ children }: BookingNotificationProviderProps) => {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const [requests, setRequests] = useState<IncomingRequest[]>([]);
//   const intervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());


//   useEffect(() => {
//     if (!user) return;

//     // Check if user is a lawyer
//     const checkLawyerAndSubscribe = async () => {
//       const { data: lawyerProfile } = await supabase
//         .from('lawyer_profiles')
//         .select('user_id')
//         .eq('user_id', user.id)
//         .single();


//       if (!lawyerProfile) return;

//       const channel = supabase
//         .channel('lawyer-booking-notifications-global')
//         .on(
//           'postgres_changes',
//           {
//             event: 'INSERT',
//             schema: 'public',
//             table: 'consultations',
//             filter: `lawyer_id=eq.${user.id}`,
//           },
//           async (payload) => {
//             const consultation = payload.new as any;
//             if (consultation.status === 'pending') {
//               const { data: clientProfile } = await supabase
//                 .from('profiles')
//                 .select('full_name, avatar_url')
//                 .eq('id', consultation.client_id)
//                 .single();

//               const reqId = consultation.id;
//               const newReq: IncomingRequest = {
//                 id: reqId,
//                 consultationId: consultation.id,
//                 clientName: clientProfile?.full_name || 'Client',
//                 clientAvatar: clientProfile?.avatar_url || undefined,
//                 type: consultation.type,
//                 amount: consultation.total_amount || 0,
//                 agenda: consultation.agenda,
//                 countdown: 60,
//               };

//               setRequests(prev => [newReq, ...prev]);
//               // Start countdown
//               const interval = setInterval(() => {
//                 setRequests(prev => {
//                   const updated = prev.map(r => {
//                     if (r.id === reqId) {
//                       if (r.countdown <= 1) {
//                         // Auto-expire
//                         clearInterval(intervalsRef.current.get(reqId)!);
//                         intervalsRef.current.delete(reqId);
//                         return null;
//                       }
//                       return { ...r, countdown: r.countdown - 1 };
//                     }
//                     return r;
//                   }).filter(Boolean) as IncomingRequest[];
//                   return updated;
//                 });
//               }, 1000);
//               intervalsRef.current.set(reqId, interval);
//               // Browser notification
//               try {
//                 if (Notification.permission === 'granted') {
//                   new Notification('🔔 New Consultation Request!', {
//                     body: `${clientProfile?.full_name || 'A client'} wants a ${consultation.type} consultation`,
//                     icon: '/favicon.svg',
//                     tag: 'new-booking',
//                   });
//                 }
//               } catch { }
//               // Play sound
//               try {
//                 const audio = new Audio('/notification.mp3');
//                 audio.volume = 0.5;
//                 audio.play().catch(() => { });
//               } catch { }

//               // Browser notification
//               // if (Notification.permission === 'granted') {
//               //   new Notification('💰 New Paid Booking!', {
//               //     body: `${clientProfile?.full_name || 'A client'} paid $${consultation.total_amount} for a ${consultation.type} consultation`,
//               //     icon: '/favicon.ico',
//               //     tag: 'new-booking',
//               //   });
//               // }
//             }
//           }
//         )
//         .subscribe();

//       // Request notification permission
//       if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
//         Notification.requestPermission();
//       }

//       return () => {
//         supabase.removeChannel(channel);
//         intervalsRef.current.forEach(interval => clearInterval(interval));
//         intervalsRef.current.clear();
//       };
//     };

//     const cleanup = checkLawyerAndSubscribe();
//     return () => { cleanup.then(fn => fn?.()); };
//   }, [user]);

//   const dismissRequest = (id: string) => {
//     if (intervalsRef.current.has(id)) {
//       clearInterval(intervalsRef.current.get(id)!);
//       intervalsRef.current.delete(id);
//     }
//     setRequests(prev => prev.filter(r => r.id !== id));
//   };
//   const handleAccept = async (req: IncomingRequest) => {
//     const { error } = await supabase
//       .from('consultations')
//       .update({ status: 'active', started_at: new Date().toISOString() })
//       .eq('id', req.consultationId);
//     if (!error) {
//       toast({
//         title: '✅ Accepted!',
//         description: 'Waiting for client payment. Redirecting to consultation...',
//       });
//       dismissRequest(req.id);
//       navigate(`/consultation/${req.consultationId}`);
//     }
//   };
//   const handleReject = async (req: IncomingRequest) => {
//     await supabase
//       .from('consultations')
//       .update({ status: 'cancelled' })
//       .eq('id', req.consultationId);
//     toast({ title: '❌ Declined', description: 'The client has been notified.' });
//     dismissRequest(req.id);
//   };

//   const getTypeIcon = (type: string) => {
//     switch (type) {
//       case 'video': return <Video className="h-4 w-4" />;
//       case 'audio': return <Phone className="h-4 w-4" />;
//       default: return <MessageSquare className="h-4 w-4" />;
//     }
//   };

//   const getTypeColor = (type: string) => {
//     switch (type) {
//       case 'video': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
//       case 'audio': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
//       default: return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
//     }
//   };

//   return (
//     <>
//       {children}

//       {/* Floating Notifications - fixed position, no layout shift */}
//       <div className="fixed top-20 right-4 z-[100] space-y-3 max-w-sm pointer-events-none">
//         {requests.map((req) => {
//           const { category, urgency, details } = parseAgenda(req.agenda);
//           return (
//             <div
//               key={req.id}
//               className="pointer-events-auto bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-right-5 duration-300"
//             >
//               {/* Header */}
//               <div className="bg-primary px-4 py-2 flex items-center justify-between">
//                 <div className="flex items-center gap-2 text-primary-foreground">
//                   <Bell className="h-4 w-4 animate-bounce" />
//                   <span className="font-medium text-sm">New Request!</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <span className={`text-xs font-bold ${req.countdown <= 10 ? 'text-red-300' : 'text-primary-foreground/80'}`}>
//                     {req.countdown}s
//                   </span>
//                   <button
//                     onClick={() => { handleReject(req); }}
//                     className="text-primary-foreground/70 hover:text-primary-foreground"
//                   >
//                     <X className="h-4 w-4" />
//                   </button>
//                 </div>
//               </div>
//               {/* Countdown bar */}
//               <div className="h-1 bg-muted">
//                 <div
//                   className={`h-full transition-all duration-1000 ease-linear ${req.countdown <= 10 ? 'bg-red-500' : 'bg-primary'}`}
//                   style={{ width: `${(req.countdown / 60) * 100}%` }}
//                 />
//               </div>
//               {/* Content */}
//               <div className="p-4 space-y-3">
//                 {/* Client info */}
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
//                     {req.clientAvatar ? (
//                       <img src={req.clientAvatar} alt={req.clientName} className="w-full h-full object-cover" />
//                     ) : (
//                       <User className="h-5 w-5 text-muted-foreground" />
//                     )}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="font-semibold text-sm truncate">{req.clientName}</p>
//                     <div className="flex items-center gap-2 mt-0.5">
//                       <Badge className={`text-xs ${getTypeColor(req.type)}`}>
//                         {getTypeIcon(req.type)}
//                         <span className="ml-1 capitalize">{req.type}</span>
//                       </Badge>
//                       <span className="text-xs font-medium text-primary">₹{req.amount}</span>
//                     </div>

//                   </div>
//                   {/* Agenda summary */}
//                   {req.agenda && (
//                     <div className="p-2.5 bg-secondary/50 rounded-lg border text-xs space-y-1">
//                       <p className="font-medium text-muted-foreground flex items-center gap-1">
//                         <FileText className="h-3 w-3" /> Agenda
//                       </p>
//                       <div className="flex flex-wrap gap-1">
//                         {category && <Badge variant="outline" className="text-[10px] h-5">{category}</Badge>}
//                         {urgency && <Badge variant="outline" className="text-[10px] h-5">{urgency}</Badge>}
//                       </div>
//                       {details && <p className="text-foreground line-clamp-2">{details}</p>}
//                     </div>
//                   )}
//                   {/* Actions */}
//                   <div className="flex gap-2">
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       className="flex-1 gap-1 text-xs hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/30"
//                       onClick={() => handleReject(req)}
//                     >
//                       <XCircle className="h-3.5 w-3.5" />
//                       Decline
//                     </Button>
//                     <Button
//                       size="sm"
//                       className="flex-1 gap-1 text-xs"
//                       onClick={() => handleAccept(req)}
//                     >
//                       <CheckCircle className="h-3.5 w-3.5" />
//                       Accept
//                     </Button>
//                   </div>
//                 </div>
//               </div>


//             </div>
//           );
//         })}
//       </div>
//     </>
//   );
// };


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
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (!lawyerProfile) return;

      const channel = supabase
        .channel('lawyer-booking-notifications-global')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'consultations',
            filter: `lawyer_id=eq.${user.id}`,
          },
          async (payload) => {

            const consultation = payload.new as any;

            if (consultation.status === 'pending') {

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

              try {
                const audio = new Audio('/notification.mp3');
                audio.volume = 0.5;
                audio.play().catch(() => { });
              } catch { }

              if (Notification.permission === 'granted') {
                new Notification('New Consultation Request', {
                  body: `${clientProfile?.full_name || 'Client'} requested ${consultation.type} consultation`
                });
              }

            }

          }
        )
        .subscribe();

      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }

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

    const { error } = await supabase
      .from('consultations')
      .update({
        status: 'active',
        started_at: new Date().toISOString()
      })
      .eq('id', req.consultationId);

    if (!error) {

      toast({
        title: 'Accepted',
        description: 'Opening consultation...'
      });

      dismissRequest(req.id);
      navigate(`/consultation/${req.consultationId}`);
    }

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

        <div className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-none">

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

                          {urgency && (
                            <Badge variant="outline">{urgency}</Badge>
                          )}

                        </div>

                        <p className="text-muted-foreground">
                          {details}
                        </p>

                      </div>

                    )}

                    {/* ACTIONS */}

                    <div className="flex gap-3">

                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleReject(req)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>

                      <Button
                        className="flex-1"
                        onClick={() => handleAccept(req)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept
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