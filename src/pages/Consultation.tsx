
// *******************************************


import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Send, Phone, Video, Clock, ArrowLeft,
  Loader2, MessageSquare, User, Shield,
  CheckCircle, Star, Lock, Timer,
  AlertTriangle, Wallet, PhoneOff,
  Mic, Paperclip, Smile, XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VideoCall } from '@/components/consultation/VideoCall';
import { AudioCall } from '@/components/consultation/AudioCall';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

interface ConsultationData {
  id: string;
  type: 'chat' | 'audio' | 'video';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  client_id: string;
  lawyer_id: string;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  total_amount: number | null;
  duration_minutes: number | null;
  notes: string | null;
  accepted_at: string | null;
}

interface ParticipantInfo {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

const Consultation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Core state
  const [consultation, setConsultation] = useState<ConsultationData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participant, setParticipant] = useState<ParticipantInfo | null>(null);
  const [loading, setLoading] = useState(true);


  // Message state
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Flow state
  const [lawyerAccepted, setLawyerAccepted] = useState(false);
  const [acceptedAt, setAcceptedAt] = useState<string | null>(null);
  const [paymentCountdown, setPaymentCountdown] = useState(120);
  const [sessionCountdown, setSessionCountdown] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [paying, setPaying] = useState(false);

  // Call state
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isAudioCallActive, setIsAudioCallActive] = useState(false);

  // End state
  const [showRating, setShowRating] = useState(false);
  const [showMoodDialog, setShowMoodDialog] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const autoCompleteRef = useRef(false);

  // Derived
  const isClient = consultation?.client_id === user?.id;
  const isLawyer = consultation?.lawyer_id === user?.id;
  const isPending = consultation?.status === 'pending';
  const isActive = consultation?.status === 'active';

  const isCompleted = consultation?.status === 'completed';
  const isCancelled = consultation?.status === 'cancelled';

  // const isWaitingForAccept =
  //   consultation?.status === 'pending' &&
  //   consultation?.started_at === null &&
  //   !consultation?.accepted_at;
  const isWaitingForAccept =
    consultation?.status === 'pending' &&
    consultation?.started_at === null &&
    !consultation?.accepted_at &&
    !lawyerAccepted;

  // const isWaitingForPayment =
  //   consultation?.status === 'pending' &&
  //   consultation?.started_at === null &&
  //   consultation?.accepted_at !== null;
  const isWaitingForPayment =
    consultation?.status === 'pending' &&
    consultation?.started_at === null &&
    (consultation?.accepted_at !== null || lawyerAccepted);

  const chatEnabled =
    consultation?.status === 'active' &&
    consultation?.started_at !== null;
  const bookedMinutes = consultation?.duration_minutes || 10;

  // ─── Fetch ───
  const fetchConsultation = useCallback(async () => {
    if (!id || !user) return;
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', id)
      .or(`client_id.eq.${user.id},lawyer_id.eq.${user.id}`)
      .single();

    if (error || !data) {
      toast({ variant: 'destructive', title: 'Error', description: 'Consultation not found.' });
      // navigate('/dashboard');
      navigate(user?.role === 'lawyer' ? '/lawyer/dashboard' : '/dashboard');
      return;
    }

    setConsultation(data as ConsultationData);
    // 🔥 FORCE lawyerAccepted if accept signal exists OR still pending

    // 🔥 ALWAYS check if accepted signal exists
    const { data: acceptSignal } = await supabase
      .from('call_signals')
      .select('created_at')
      .eq('consultation_id', id)
      .eq('type', 'lawyer-accepted')
      .order('created_at', { ascending: false })
      .limit(1);

    if (acceptSignal && acceptSignal.length > 0) {
      setLawyerAccepted(true);
      setAcceptedAt(acceptSignal[0].created_at);
    } else {
      setLawyerAccepted(false);
    }

    // Fetch participant
    const otherUserId = data.client_id === user.id ? data.lawyer_id : data.client_id;
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', otherUserId)
      .single();

    if (profile) setParticipant(profile);

    // If client, fetch wallet
    if (data.client_id === user.id) {
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();
      setWalletBalance(Number(wallet?.balance) || 0);
    }

    setLoading(false);
  }, [id, user, navigate, toast]);

  const fetchMessages = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('consultation_id', id)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  }, [id]);

  // ─── Init ───
  useEffect(() => {
    if (id && user) {
      fetchConsultation();
      fetchMessages();
    }
  }, [id, user, fetchConsultation, fetchMessages]);

  // ─── Realtime: consultation changes ───
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`consultation-${id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'consultations',
        filter: `id=eq.${id}`,
      }, (payload) => {
        const updated = payload.new as ConsultationData;
        setConsultation(updated);

        // If status became completed and user is lawyer → redirect
        if (updated.status === 'completed' && updated.lawyer_id === user?.id) {
          toast({ title: 'Session Complete', description: 'The consultation has ended.' });
          setTimeout(() => navigate('/lawyer/dashboard'), 2000);
        }

        // If status became completed and user is client → show rating
        if (updated.status === 'completed' && updated.client_id === user?.id) {
          setShowRating(true);
        }

        // If cancelled
        if (updated.status === 'cancelled') {
          toast({ title: 'Consultation Cancelled', description: 'This consultation was cancelled.' });
          setTimeout(() => navigate(updated.lawyer_id === user?.id ? '/lawyer/dashboard' : '/dashboard'), 2000);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, user, navigate, toast]);

  // ─── Realtime: messages ───
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`messages-${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `consultation_id=eq.${id}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  // ─── Realtime: signals (for lawyer-accepted) ───
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`signals-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_signals',
          filter: `consultation_id=eq.${id}`,
        },
        async (payload) => {
          const signal = payload.new as {
            sender_id: string;
            type: string;
            created_at: string;
          };

          // if (signal.type === 'lawyer-accepted') {
          //   console.log("✅ Lawyer accepted signal received");

          //   setLawyerAccepted(true);
          //   setAcceptedAt(signal.created_at);

          //   // 🔥 FORCE FULL REFRESH
          //   await fetchConsultation();
          // }
          if (signal.type === 'lawyer-accepted') {
            console.log("✅ Lawyer accepted signal received");

            // 🔥 FORCE UI CHANGE IMMEDIATELY
            setConsultation(prev => prev ? {
              ...prev,
              accepted_at: signal.created_at
            } : prev);

            setLawyerAccepted(true);
            setAcceptedAt(signal.created_at);

            // 🔥 OPTIONAL: still fetch for safety
            fetchConsultation();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, fetchConsultation]);

  // ─── Scroll to bottom ───
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Session countdown ───
  useEffect(() => {
    if (!isActive || !consultation?.started_at || !consultation?.duration_minutes) return;

    const interval = setInterval(() => {
      const startTime = new Date(consultation.started_at!).getTime();
      const endTime = startTime + consultation.duration_minutes! * 60 * 1000;
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setSessionCountdown(remaining);

      if (remaining <= 0 && !autoCompleteRef.current) {
        autoCompleteRef.current = true;
        handleAutoComplete();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, consultation?.started_at, consultation?.duration_minutes]);

  // ─── Payment countdown (lawyer side) ───
  useEffect(() => {
    if (!isWaitingForPayment || !acceptedAt) return;

    const interval = setInterval(() => {
      const acceptTime = new Date(acceptedAt).getTime();
      const deadline = acceptTime + 2 * 60 * 1000;
      const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setPaymentCountdown(remaining);

      if (remaining <= 0 && isLawyer) {
        setShowMoodDialog(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isWaitingForPayment, acceptedAt, isLawyer]);

  // ─── Actions ───

  const handleLawyerAccept = async () => {
    if (!user || !id) return;

    const now = new Date().toISOString();

    // 1. Send signal (for realtime)
    await supabase.from('call_signals').insert({
      consultation_id: id,
      sender_id: user.id,
      type: 'lawyer-accepted',
      data: {},
    });

    // ✅ 2. UPDATE CONSULTATION (CRITICAL FIX)
    await supabase
      .from('consultations')
      .update({
        status: 'pending',
        started_at: null,
        accepted_at: now   // 🔥 THIS IS THE MAIN FIX
      })
      .eq('id', id);

    // 3. Local state update
    setLawyerAccepted(true);
    setAcceptedAt(now);

    toast({
      title: '✅ Request Accepted',
      description: 'Waiting for client payment.',
    });
  };

  const handleClientPay = async () => {
    if (!user || !id || !consultation) return;
    const totalAmount = consultation.total_amount || 0;

    if (walletBalance < totalAmount) {
      toast({ variant: 'destructive', title: 'Insufficient Balance', description: 'Please add funds to your wallet.' });
      return;
    }

    setPaying(true);
    try {
      // Deduct wallet
      await supabase
        .from('wallets')
        .update({ balance: walletBalance - totalAmount })
        .eq('user_id', user.id);

      // Create transaction
      await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'consultation_fee' as const,
        amount: -totalAmount,
        description: `${consultation.type} consultation`,
        reference_id: id,
      });

      // Activate consultation
      await supabase
        .from('consultations')
        .update({
          status: 'active' as const,
          started_at: new Date().toISOString(),
        })
        .eq('id', id);

      setWalletBalance(prev => prev - totalAmount);
      toast({ title: '✅ Payment Successful', description: 'Session is now active!' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Payment Failed', description: 'Please try again.' });
    } finally {
      setPaying(false);
    }
  };

  const handleEndConsultation = async () => {
    if (!id || !consultation) return;
    await supabase
      .from('consultations')
      .update({
        status: 'completed' as const,
        ended_at: new Date().toISOString(),
        duration_minutes: Math.ceil(
          (Date.now() - new Date(consultation.started_at!).getTime()) / 60000
        ),
      })
      .eq('id', id);
    setShowRating(true);
  };

  const handleAutoComplete = async () => {
    if (!id) return;
    await supabase
      .from('consultations')
      .update({
        status: 'completed' as const,
        ended_at: new Date().toISOString(),
      })
      .eq('id', id);
  };

  const handleCancelPaymentTimeout = async () => {
    if (!id) return;
    await supabase
      .from('consultations')
      .update({ status: 'cancelled' as const })
      .eq('id', id);
    setShowMoodDialog(false);
    navigate('/lawyer/dashboard');
  };

  const handleSubmitRating = async () => {
    if (!user || !id || !consultation || selectedRating === 0) return;
    setSubmittingRating(true);
    try {
      await supabase.from('reviews').insert({
        client_id: user.id,
        lawyer_id: consultation.lawyer_id,
        consultation_id: id,
        rating: selectedRating,
        comment: ratingComment || null,
      });
      toast({ title: '⭐ Rating Submitted', description: 'Thank you for your feedback!' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit rating.' });
    }
    setSubmittingRating(false);
    setShowRating(false);
    navigate('/dashboard');
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !chatEnabled) return;
    setSending(true);
    const { error } = await supabase.from('messages').insert({
      consultation_id: id,
      sender_id: user.id,
      content: newMessage.trim(),
    });
    if (!error) {
      setNewMessage('');
      inputRef.current?.focus();
    }
    setSending(false);
  };

  // ─── Helpers ───
  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getTypeIcon = () => {
    switch (consultation?.type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Phone className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  // ─── Loading ───
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading consultation...</p>
        </div>
      </div>
    );
  }

  // ─── Render ───
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* ═══ HEADER ═══ */}
      <header className="h-14 sm:h-16 border-b border-border bg-card/80 backdrop-blur-sm px-3 sm:px-6 flex items-center justify-between flex-shrink-0 animate-fade-in z-10">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9"
            onClick={() => navigate(isLawyer ? '/lawyer/dashboard' : '/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
            <AvatarImage src={participant?.avatar_url || undefined} />
            <AvatarFallback className="text-xs bg-primary/10">
              {participant?.full_name?.charAt(0) || 'P'}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <h3 className="font-semibold text-sm sm:text-base truncate">
              {participant?.full_name}
            </h3>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] sm:text-xs gap-1 px-1.5 py-0">
                {getTypeIcon()}
                <span className="capitalize">{consultation?.type}</span>
              </Badge>
              {isActive && (
                <Badge className="gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] sm:text-xs px-1.5 py-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Session countdown */}
          {isActive && (
            <div className={cn(
              "flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-mono text-xs sm:text-sm font-semibold",
              sessionCountdown <= 60
                ? "bg-destructive/10 text-destructive animate-pulse"
                : "bg-primary/10 text-primary"
            )}>
              <Timer className="h-3.5 w-3.5" />
              {formatCountdown(sessionCountdown)}
            </div>
          )}

          {/* Audio/Video buttons */}
          {isActive && (consultation?.type === 'audio' || consultation?.type === 'video') && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9"
              onClick={() => setIsAudioCallActive(true)}
            >
              <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          )}
          {isActive && consultation?.type === 'video' && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9"
              onClick={() => setIsVideoCallActive(true)}
            >
              <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          )}

          {/* End button - CLIENT ONLY */}
          {isActive && isClient && (
            <Button
              variant="destructive"
              size="sm"
              className="h-8 sm:h-9 text-xs sm:text-sm gap-1 px-2 sm:px-3"
              onClick={handleEndConsultation}
            >
              <PhoneOff className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">End</span>
            </Button>
          )}
        </div>
      </header>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop sidebar */}
        {isActive && (
          <div className="hidden lg:flex w-72 border-r border-border flex-col bg-card/30 flex-shrink-0 animate-fade-in">
            <div className="p-5 border-b border-border">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14 border-2 border-primary/10">
                  <AvatarImage src={participant?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-lg font-semibold">
                    {participant?.full_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{participant?.full_name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    {isClient ? (
                      <><Shield className="h-3 w-3 text-blue-500" /> Legal Advisor</>
                    ) : (
                      <><User className="h-3 w-3" /> Client</>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-semibold">{bookedMinutes} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remainingggsss</span>
                <span className={cn(
                  "font-mono font-bold",
                  sessionCountdown <= 60 ? "text-destructive" : "text-primary"
                )}>
                  {formatCountdown(sessionCountdown)}
                </span>
              </div>
              {consultation?.total_amount && (
                <div className="flex justify-between p-3 bg-emerald-500/10 rounded-lg mt-2">
                  <span className="text-sm font-medium">Session Fee</span>
                  <span className="font-semibold text-emerald-600">
                    ${consultation.total_amount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-auto p-5 border-t border-border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                <span>End-to-end encrypted</span>
              </div>
            </div>
          </div>
        )}

        {/* Chat + Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* ─── WAITING FOR ACCEPT ─── */}
          {isWaitingForAccept && (
            <div className="flex-1 flex items-center justify-center p-6 animate-fade-in">
              <div className="text-center max-w-sm">
                {isLawyer ? (
                  <>
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-scale-in">
                      <User className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-2">New Consultation Request</h2>
                    <p className="text-muted-foreground mb-2">
                      <span className="font-semibold text-foreground">{participant?.full_name}</span> wants a{' '}
                      <span className="capitalize font-medium">{consultation?.type}</span> consultation.
                    </p>
                    {consultation?.total_amount && (
                      <p className="text-sm text-muted-foreground mb-6">
                        Session fee: <span className="font-semibold text-emerald-600">${consultation.total_amount.toFixed(2)}</span>
                        {' '}for {bookedMinutes} minutes
                      </p>
                    )}
                    <Button size="lg" className="gap-2 px-8" onClick={handleLawyerAccept}>
                      <CheckCircle className="h-5 w-5" />
                      Accept Request
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                      <Clock className="h-10 w-10 text-amber-600 animate-pulse" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-2">Waiting for Lawyer</h2>
                    <p className="text-muted-foreground">
                      <span className="font-semibold text-foreground">{participant?.full_name}</span> will accept your request shortly.
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-4">
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ─── WAITING FOR PAYMENT ─── */}
          {isWaitingForPayment && (
            <div className="flex-1 flex items-center justify-center p-6 animate-fade-in">
              <div className="text-center max-w-sm w-full">
                {isClient ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-5 animate-scale-in">
                      <Wallet className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-bold mb-1">Complete Payment</h2>
                    <p className="text-sm text-muted-foreground mb-5">
                      {participant?.full_name} accepted your request. Pay to start the session.
                    </p>

                    <div className="rounded-xl border border-border bg-card p-4 text-left space-y-3 mb-5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Session Type</span>
                        <span className="font-medium capitalize">{consultation?.type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">{bookedMinutes} min</span>
                      </div>
                      <div className="border-t border-border pt-3 flex justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="text-xl font-bold text-primary">
                          ${(consultation?.total_amount || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs pt-1">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Wallet className="h-3 w-3" /> Wallet Balance
                        </span>
                        <span className={cn(
                          "font-medium",
                          walletBalance >= (consultation?.total_amount || 0) ? "text-emerald-600" : "text-destructive"
                        )}>
                          ${walletBalance.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {walletBalance < (consultation?.total_amount || 0) && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-sm mb-4">
                        <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                        <span className="text-destructive">
                          Insufficient balance.{' '}
                          <button onClick={() => navigate('/dashboard')} className="underline font-medium">
                            Add funds
                          </button>
                        </span>
                      </div>
                    )}

                    <Button
                      size="lg"
                      className="w-full gap-2"
                      disabled={paying || walletBalance < (consultation?.total_amount || 0)}
                      onClick={handleClientPay}
                    >
                      {paying ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Pay ${(consultation?.total_amount || 0).toFixed(2)}
                    </Button>

                    <p className="text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
                      <Shield className="h-3 w-3" /> Secure payment
                    </p>
                  </>
                ) : (
                  // Lawyer waiting for payment
                  <>
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-5">
                      <Lock className="h-8 w-8 text-amber-600" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Waiting for Paymenttt</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      {participant?.full_name} is completing payment. Chat will unlock once paid.
                    </p>

                    <div className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono text-lg font-bold mb-4",
                      paymentCountdown <= 30
                        ? "bg-destructive/10 text-destructive animate-pulse"
                        : "bg-amber-500/10 text-amber-600"
                    )}>
                      <Timer className="h-5 w-5" />
                      {formatCountdown(paymentCountdown)}
                    </div>

                    <div className="flex items-center justify-center gap-1 mt-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ─── ACTIVE SESSION: CHAT ─── */}
          {/* {(isActive || isCompleted) && ( */}
          {!isWaitingForAccept && !isWaitingForPayment && (isActive || isCompleted) && (
            <>
              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
                <div className="max-w-2xl mx-auto space-y-3">
                  {/* Encryption badge */}
                  <div className="flex justify-center my-4">
                    <div className="bg-secondary/50 border border-border rounded-full px-3 py-1.5 text-xs text-muted-foreground flex items-center gap-1.5">
                      <Shield className="h-3 w-3" />
                      End-to-end encrypted
                    </div>
                  </div>

                  {messages.length === 0 && isActive && (
                    <div className="text-center py-12">
                      <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                        <MessageSquare className="h-7 w-7 text-emerald-600" />
                      </div>
                      <h3 className="font-semibold mb-1">Session Started</h3>
                      <p className="text-sm text-muted-foreground">Send a message to begin.</p>
                    </div>
                  )}

                  {messages.map((message, index) => {
                    const isOwn = message.sender_id === user?.id;
                    const showAvatar = index === 0 || messages[index - 1]?.sender_id !== message.sender_id;

                    return (
                      <div
                        key={message.id}
                        className={cn("flex gap-2 sm:gap-3 animate-fade-in", isOwn && "flex-row-reverse")}
                      >
                        {showAvatar ? (
                          <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                            <AvatarImage src={isOwn ? user?.user_metadata?.avatar_url : participant?.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {isOwn ? user?.email?.charAt(0).toUpperCase() : participant?.full_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-7 sm:w-8" />
                        )}

                        <div className={cn("max-w-[75%] sm:max-w-[70%]", isOwn ? "items-end" : "items-start")}>
                          <div className={cn(
                            "px-3 sm:px-4 py-2 sm:py-3 rounded-2xl text-sm leading-relaxed",
                            isOwn
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-card border border-border rounded-bl-md"
                          )}>
                            {message.content}
                          </div>
                          <p className={cn("text-[10px] sm:text-xs text-muted-foreground mt-0.5 px-1", isOwn && "text-right")}>
                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message input */}
              {chatEnabled && (
                <div className="p-2 sm:p-3 border-t border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
                  <form onSubmit={sendMessage} className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-secondary/50 rounded-xl p-1.5 sm:p-2">
                      <Button type="button" variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                      </Button>

                      <Input
                        ref={inputRef}
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-sm sm:text-base h-8 sm:h-9"
                        disabled={sending}
                      />

                      <Button type="button" variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8">
                        <Smile className="h-4 w-4 text-muted-foreground" />
                      </Button>

                      <Button
                        type="submit"
                        size="icon"
                        disabled={sending || !newMessage.trim()}
                        className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9 rounded-lg"
                      >
                        {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Completed footer */}
              {isCompleted && !showRating && (
                <div className="p-4 sm:p-6 border-t border-border bg-secondary/30 text-center flex-shrink-0">
                  <p className="text-muted-foreground text-sm mb-2">This consultation has ended.</p>
                  <Button variant="outline" onClick={() => navigate(isLawyer ? '/lawyer/dashboard' : '/dashboard')}>
                    Return to Dashboard
                  </Button>
                </div>
              )}
            </>
          )}

          {/* ─── CANCELLED ─── */}
          {isCancelled && (
            <div className="flex-1 flex items-center justify-center p-6 animate-fade-in">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-xl font-bold mb-2">Consultation Cancelled</h2>
                <p className="text-sm text-muted-foreground mb-6">This consultation has been cancelled.</p>
                <Button onClick={() => navigate(isLawyer ? '/lawyer/dashboard' : '/dashboard')}>
                  Return to Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ RATING DIALOG ═══ */}
      <Dialog open={showRating && isClient} onOpenChange={(open) => { if (!open) { setShowRating(false); navigate('/dashboard'); } }}>
        <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden rounded-2xl">
          <div className="p-6 sm:p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Star className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-1">Rate Your Experience</h3>
            <p className="text-sm text-muted-foreground mb-5">
              How was your session with {participant?.full_name}?
            </p>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star className={cn(
                    "h-8 w-8 sm:h-10 sm:w-10 transition-colors",
                    star <= selectedRating
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                  )} />
                </button>
              ))}
            </div>

            <textarea
              placeholder="Share your experience (optional)..."
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary/30 p-3 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 mb-4"
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setShowRating(false); navigate('/dashboard'); }}
              >
                Skip
              </Button>
              <Button
                className="flex-1 gap-1.5"
                disabled={selectedRating === 0 || submittingRating}
                onClick={handleSubmitRating}
              >
                {submittingRating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ MOOD DIALOG (Lawyer - payment timeout) ═══ */}
      <Dialog open={showMoodDialog} onOpenChange={() => { }}>
        <DialogContent className="sm:max-w-[380px] p-0 gap-0 overflow-hidden rounded-2xl [&>button]:hidden">
          <div className="p-6 sm:p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-7 w-7 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold mb-1">Client Changed Their Mind</h3>
            <p className="text-sm text-muted-foreground mb-6">
              The client was unable to complete the payment within the allotted time. The consultation has been cancelled.
            </p>
            <Button className="w-full" onClick={handleCancelPaymentTimeout}>
              Return to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ VIDEO / AUDIO CALL OVERLAYS ═══ */}
      <VideoCall
        isActive={isVideoCallActive}
        onEnd={() => setIsVideoCallActive(false)}
        participantName={participant?.full_name || 'Participant'}
        consultationId={id || ''}
      />
      <AudioCall
        isActive={isAudioCallActive}
        onEnd={() => setIsAudioCallActive(false)}
        participantName={participant?.full_name || 'Participant'}
        consultationId={id || ''}
      />
    </div>
  );
};

export default Consultation;


// ********************************************8
// *******************************************8




