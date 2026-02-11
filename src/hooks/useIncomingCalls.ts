import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface IncomingCall {
  consultationId: string;
  callType: 'audio' | 'video';
  callerName: string;
  callerId: string;
}

export const useIncomingCalls = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);

  // Fetch caller name from profiles
  const fetchCallerName = useCallback(async (callerId: string): Promise<string> => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', callerId)
      .single();
    return data?.full_name || 'Unknown Caller';
  }, []);

  // Accept the incoming call
  const acceptCall = useCallback(() => {
    if (incomingCall) {
      navigate(`/consultation/${incomingCall.consultationId}`);
      setIncomingCall(null);
    }
  }, [incomingCall, navigate]);

  // Reject the incoming call
  const rejectCall = useCallback(async () => {
    if (incomingCall && user) {
      // Send call-rejected signal
      await supabase.from('call_signals').insert({
        consultation_id: incomingCall.consultationId,
        sender_id: user.id,
        type: 'call-rejected',
        data: { rejected_by: user.id },
      });
      setIncomingCall(null);
      toast({
        title: 'Call declined',
        description: 'You declined the incoming call.',
      });
    }
  }, [incomingCall, user, toast]);

  // Dismiss notification (same as reject but silent)
  const dismissCall = useCallback(() => {
    setIncomingCall(null);
  }, []);

  // Listen for keyboard events (Escape to dismiss)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && incomingCall) {
        dismissCall();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [incomingCall, dismissCall]);

  // Subscribe to call signals for this user
  useEffect(() => {
    if (!user) return;

    // Get all consultations where this user is a participant
    const fetchUserConsultations = async () => {
      const { data: consultations } = await supabase
        .from('consultations')
        .select('id, client_id, lawyer_id, type')
        .or(`client_id.eq.${user.id},lawyer_id.eq.${user.id}`)
        .in('status', ['pending', 'active']);

      if (!consultations || consultations.length === 0) return;

      const consultationIds = consultations.map(c => c.id);

      // Subscribe to call signals for these consultations
      const channel = supabase
        .channel('incoming-calls-global')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'call_signals',
          },
          async (payload) => {
            const signal = payload.new as {
              consultation_id: string;
              sender_id: string;
              type: string;
              data: any;
            };

            // Ignore our own signals
            if (signal.sender_id === user.id) return;

            // Only process if it's our consultation
            if (!consultationIds.includes(signal.consultation_id)) return;

            // Handle call-start signal
            if (signal.type === 'call-start') {
              const consultation = consultations.find(c => c.id === signal.consultation_id);
              if (!consultation) return;

              const callerName = await fetchCallerName(signal.sender_id);
              const callType = consultation.type === 'video' ? 'video' : 'audio';

              setIncomingCall({
                consultationId: signal.consultation_id,
                callType: callType as 'audio' | 'video',
                callerName,
                callerId: signal.sender_id,
              });

              // Show browser notification if permitted
              if (Notification.permission === 'granted') {
                new Notification(`Incoming ${callType} call`, {
                  body: `${callerName} is calling you`,
                  icon: '/favicon.ico',
                  tag: 'incoming-call',
                });
              }
            }

            // Handle call-end signal (clear incoming call if active)
            if (signal.type === 'call-end' || signal.type === 'call-rejected') {
              if (incomingCall?.consultationId === signal.consultation_id) {
                setIncomingCall(null);
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    fetchUserConsultations();

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [user, fetchCallerName, incomingCall]);

  return {
    incomingCall,
    acceptCall,
    rejectCall,
    dismissCall,
  };
};
