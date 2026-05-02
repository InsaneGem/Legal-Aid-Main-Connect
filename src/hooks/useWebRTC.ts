
import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseWebRTCProps {
  consultationId: string;
  isActive: boolean;
  isVideo: boolean;
  onRemoteStream?: (stream: MediaStream | null) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onIncomingCall?: () => void;
  onCallEnded?: () => void;
}

interface SignalData {
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
};

export const useWebRTC = ({
  consultationId,
  isActive,
  isVideo,
  onRemoteStream,
  onConnectionStateChange,
  onIncomingCall,
  onCallEnded,
}: UseWebRTCProps) => {
  const { user } = useAuth();
  const isCallerRef = useRef(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasIncomingCall, setHasIncomingCall] = useState(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const hasInitiatedRef = useRef(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const sendSignal = useCallback(
    async (type: string, data: SignalData) => {
      if (!user) return;
      const { error } = await supabase.from('call_signals').insert({
        consultation_id: consultationId,
        sender_id: user.id,
        type,
        data,
      } as any);
      if (error) console.error('sendSignal error:', error);
    },
    [consultationId, user]
  );

  const startLocalStream = useCallback(async () => {
    try {
      if (localStreamRef.current) return localStreamRef.current;
      // const stream = await navigator.mediaDevices.getUserMedia({
      //   video: isVideo,
      //   audio: true,
      // });
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: true,
      });

      // Start with mic muted by default
      // stream.getAudioTracks().forEach((track) => {
      //   track.enabled = false;
      // });

      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      return null;
    }
  }, [isVideo]);

  const stopStreams = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    onRemoteStream?.(null);
  }, [onRemoteStream]);

  const createPeerConnection = useCallback(
    (stream: MediaStream) => {
      if (peerConnectionRef.current) return peerConnectionRef.current;

      const pc = new RTCPeerConnection(ICE_SERVERS);

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        const [remoteMediaStream] = event.streams;
        setRemoteStream(remoteMediaStream);
        onRemoteStream?.(remoteMediaStream);
      };

      pc.onicecandidate = async (event) => {
        if (event.candidate && user) {
          await sendSignal('ice-candidate', {
            candidate: event.candidate.toJSON(),
          });
        }
      };

      pc.onconnectionstatechange = () => {
        setConnectionState(pc.connectionState);
        onConnectionStateChange?.(pc.connectionState);
      };

      peerConnectionRef.current = pc;
      return pc;
    },
    [user, sendSignal, onRemoteStream, onConnectionStateChange]
  );

  const createOffer = useCallback(
    async (pc: RTCPeerConnection) => {
      try {
        if (pc.signalingState !== 'stable') return;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await sendSignal('offer', { sdp: offer });
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    },
    [sendSignal]
  );

  const drainPendingCandidates = useCallback(async () => {
    if (!peerConnectionRef.current) return;
    for (const candidate of pendingCandidatesRef.current) {
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error('Error adding queued ICE candidate:', e);
      }
    }
    pendingCandidatesRef.current = [];
  }, []);

  const handleOffer = useCallback(
    async (sdp: RTCSessionDescriptionInit) => {
      try {
        let stream = localStreamRef.current;
        if (!stream) stream = await startLocalStream();
        if (!stream) return;
        const pc = createPeerConnection(stream);

        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        await drainPendingCandidates();

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await sendSignal('answer', { sdp: answer });
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    },
    [startLocalStream, createPeerConnection, sendSignal, drainPendingCandidates]
  );

  const handleAnswer = useCallback(
    async (sdp: RTCSessionDescriptionInit) => {
      if (!peerConnectionRef.current) return;
      try {
        if (peerConnectionRef.current.signalingState === 'have-local-offer') {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(sdp)
          );
        }
        await drainPendingCandidates();
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    },
    [drainPendingCandidates]
  );

  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    if (!peerConnectionRef.current || !peerConnectionRef.current.remoteDescription) {
      pendingCandidatesRef.current.push(candidate);
      return;
    }
    try {
      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }, []);

  const initiateCall = useCallback(async () => {
    if (!user || hasInitiatedRef.current) return;

    setIsConnecting(true);
    hasInitiatedRef.current = true;
    isCallerRef.current = true;

    // Clear old signals
    await supabase.from('call_signals').delete().eq('consultation_id', consultationId);

    const stream = await startLocalStream();
    if (!stream) {
      setIsConnecting(false);
      hasInitiatedRef.current = false;
      return;
    }

    createPeerConnection(stream);

    // Send call-start signal so the other user knows to join
    await sendSignal('call-start', {});

    setIsConnecting(false);
  }, [user, startLocalStream, createPeerConnection, sendSignal, consultationId]);

  const joinCall = useCallback(async () => {
    if (!user) return;

    setIsConnecting(true);
    hasInitiatedRef.current = true;
    isCallerRef.current = false;
    setHasIncomingCall(false);

    const stream = await startLocalStream();
    if (!stream) {
      setIsConnecting(false);
      return;
    }

    createPeerConnection(stream);
    await sendSignal('call-accepted', {});

    setIsConnecting(false);
  }, [user, startLocalStream, createPeerConnection, sendSignal]);

  const rejectCall = useCallback(async () => {
    setHasIncomingCall(false);
    await sendSignal('call-rejected', {});
  }, [sendSignal]);

  // const endCall = useCallback(async () => {
  //   if (user) await sendSignal('call-end', {});
  //   if (peerConnectionRef.current) {
  //     peerConnectionRef.current.close();
  //     peerConnectionRef.current = null;
  //   }
  //   stopStreams();
  //   pendingCandidatesRef.current = [];
  //   hasInitiatedRef.current = false;
  //   isCallerRef.current = false;
  //   setConnectionState('new');
  //   setHasIncomingCall(false);
  // }, [user, sendSignal, stopStreams]);
  const endCall = useCallback(async () => {
    try {
      if (user) {
        await sendSignal('call-end', {});
      }
    } catch (error) {
      console.error('Error sending call-end:', error);
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    stopStreams();
    pendingCandidatesRef.current = [];
    hasInitiatedRef.current = false;
    isCallerRef.current = false;
    setConnectionState('new');
    setHasIncomingCall(false);

    onCallEnded?.();
  }, [user, sendSignal, stopStreams, onCallEnded]);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
      return !localStreamRef.current.getAudioTracks()[0]?.enabled;
    }
    return false;
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
      return !localStreamRef.current.getVideoTracks()[0]?.enabled;
    }
    return false;
  }, []);

  // Subscribe to signaling channel
  useEffect(() => {
    if (!isActive || !user) return;

    const channel = supabase
      .channel(`call-signals:${consultationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_signals',
          filter: `consultation_id=eq.${consultationId}`,
        },
        async (payload) => {
          const signal = payload.new as {
            sender_id: string;
            type: string;
            data: SignalData;
          };

          // Ignore our own signals
          if (signal.sender_id === user.id) return;

          console.log('📡 Received signal:', signal.type);

          try {
            switch (signal.type) {
              case 'call-start':
                // When other user initiates a call, auto-join immediately so we're ready
                if (!isCallerRef.current && !hasInitiatedRef.current) {
                  console.log('📞 Incoming call detected → auto-joining');
                  hasInitiatedRef.current = true;
                  isCallerRef.current = false;
                  const stream = await startLocalStream();
                  if (stream) {
                    createPeerConnection(stream);
                  }
                }
                break;

              case 'call-accepted':
                if (isCallerRef.current && peerConnectionRef.current) {
                  console.log('✅ Call accepted → sending offer');
                  await createOffer(peerConnectionRef.current);
                }
                break;

              case 'call-rejected':
                if (isCallerRef.current) {
                  if (peerConnectionRef.current) {
                    peerConnectionRef.current.close();
                    peerConnectionRef.current = null;
                  }
                  stopStreams();
                  pendingCandidatesRef.current = [];
                  hasInitiatedRef.current = false;
                  isCallerRef.current = false;
                  setConnectionState('new');
                  onCallEnded?.();
                }
                break;

              case 'offer':
                if (!isCallerRef.current && signal.data.sdp) {
                  await handleOffer(signal.data.sdp);
                }
                break;

              case 'answer':
                if (isCallerRef.current && signal.data.sdp) {
                  await handleAnswer(signal.data.sdp);
                }
                break;

              case 'ice-candidate':
                if (signal.data.candidate) {
                  await handleIceCandidate(signal.data.candidate);
                }
                break;

              case 'call-end':
                if (peerConnectionRef.current) {
                  peerConnectionRef.current.close();
                  peerConnectionRef.current = null;
                }
                stopStreams();
                pendingCandidatesRef.current = [];
                hasInitiatedRef.current = false;
                isCallerRef.current = false;
                setConnectionState('new');
                setHasIncomingCall(false);
                onCallEnded?.();
                break;
            }
          } catch (error) {
            console.error('Error handling signal:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 CHANNEL STATUS:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Channel subscribed successfully');
        } else if (status === 'CLOSED') {
          console.warn('⚠️ Channel closed - attempting to resubscribe...');
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [isActive, user, consultationId]);

  useEffect(() => {
    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      hasInitiatedRef.current = false;
      isCallerRef.current = false;
    };
  }, []);

  return {
    localStream,
    remoteStream,
    connectionState,
    isConnecting,
    hasIncomingCall,
    initiateCall,
    joinCall,
    rejectCall,
    toggleAudio,
    toggleVideo,
    endCall,
    sendSignal,
  };
};


