import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseWebRTCProps {
  consultationId: string;
  isActive: boolean;
  isVideo: boolean;
  onRemoteStream?: (stream: MediaStream | null) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
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
  ],
};

export const useWebRTC = ({
  consultationId,
  isActive,
  isVideo,
  onRemoteStream,
  onConnectionStateChange,
}: UseWebRTCProps) => {
  const { user } = useAuth();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const [isConnecting, setIsConnecting] = useState(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const hasInitiatedRef = useRef(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Start local media stream
  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: true,
      });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      return null;
    }
  }, [isVideo]);

  // Stop all streams
  const stopStreams = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
    onRemoteStream?.(null);
  }, [localStream, onRemoteStream]);

  // Create peer connection
  const createPeerConnection = useCallback((stream: MediaStream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks to peer connection
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    // Handle remote stream
    pc.ontrack = (event) => {
      const [remoteMediaStream] = event.streams;
      setRemoteStream(remoteMediaStream);
      onRemoteStream?.(remoteMediaStream);
    };

    // Handle ICE candidates
    pc.onicecandidate = async (event) => {
      if (event.candidate && user) {
        await supabase.from('call_signals').insert({
          consultation_id: consultationId,
          sender_id: user.id,
          type: 'ice-candidate',
          data: { candidate: event.candidate.toJSON() },
        } as any);
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      setConnectionState(pc.connectionState);
      onConnectionStateChange?.(pc.connectionState);
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [consultationId, user, onRemoteStream, onConnectionStateChange]);

  // Send signaling data
  const sendSignal = useCallback(async (type: string, data: SignalData) => {
    if (!user) return;

    await supabase.from('call_signals').insert({
      consultation_id: consultationId,
      sender_id: user.id,
      type,
      data,
    } as any);
  }, [consultationId, user]);

  // Create and send offer
  const createOffer = useCallback(async (pc: RTCPeerConnection) => {
    try {
      // Prevent duplicate offer creation
      if (pc.signalingState !== "stable") return;

      const offer = await pc.createOffer();

      await pc.setLocalDescription(offer);

      await sendSignal('offer', {
        sdp: offer
      });

    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }, [sendSignal]);

  // Handle received offer
 const handleOffer = useCallback(async (sdp: RTCSessionDescriptionInit) => {
  if (!peerConnectionRef.current) return;

  try {
    if (
      peerConnectionRef.current.signalingState !== "stable"
    ) return;

    await peerConnectionRef.current.setRemoteDescription(
      new RTCSessionDescription(sdp)
    );

    for (const candidate of pendingCandidatesRef.current) {
      await peerConnectionRef.current.addIceCandidate(
        new RTCIceCandidate(candidate)
      );
    }

    pendingCandidatesRef.current = [];

    const answer = await peerConnectionRef.current.createAnswer();

    await peerConnectionRef.current.setLocalDescription(answer);

    await sendSignal('answer', {
      sdp: answer
    });

  } catch (error) {
    console.error('Error handling offer:', error);
  }
}, [sendSignal]);

  // Handle received answer
  const handleAnswer = useCallback(async (sdp: RTCSessionDescriptionInit) => {
  if (!peerConnectionRef.current) return;

  try {
    if (
      peerConnectionRef.current.signalingState === "have-local-offer"
    ) {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(sdp)
      );
    }

    for (const candidate of pendingCandidatesRef.current) {
      await peerConnectionRef.current.addIceCandidate(
        new RTCIceCandidate(candidate)
      );
    }

    pendingCandidatesRef.current = [];

  } catch (error) {
    console.error('Error handling answer:', error);
  }
}, []);

  // Handle received ICE candidate
  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    if (!peerConnectionRef.current) {
      pendingCandidatesRef.current.push(candidate);
      return;
    }

    if (peerConnectionRef.current.remoteDescription) {
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    } else {
      pendingCandidatesRef.current.push(candidate);
    }
  }, []);

  // Initialize the call
  const initiateCall = useCallback(async () => {
  if (!user || hasInitiatedRef.current) return;

  setIsConnecting(true);
  hasInitiatedRef.current = true;

  const stream = await startLocalStream();

  if (!stream) {
    setIsConnecting(false);
    return;
  }

  const pc = createPeerConnection(stream);

  // Signal call start
  await sendSignal('call-start', {});

  // IMPORTANT: Create only ONE offer
  setTimeout(async () => {
    if (pc.signalingState === "stable") {
      await createOffer(pc);
    }
  }, 1000);

  setIsConnecting(false);
}, [
  user,
  startLocalStream,
  createPeerConnection,
  sendSignal,
  createOffer
]);

  // Join an existing call
  const joinCall = useCallback(async () => {
    if (!user || hasInitiatedRef.current) return;

    setIsConnecting(true);
    hasInitiatedRef.current = true;

    const stream = await startLocalStream();
    if (!stream) {
      setIsConnecting(false);
      return;
    }

    createPeerConnection(stream);
    setIsConnecting(false);
  }, [user, startLocalStream, createPeerConnection]);

  // End the call
  const endCall = useCallback(async () => {
    if (user) {
      await sendSignal('call-end', {});
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    stopStreams();
    hasInitiatedRef.current = false;
    setConnectionState('new');
  }, [user, sendSignal, stopStreams]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      return !localStream.getAudioTracks()[0]?.enabled;
    }
    return false;
  }, [localStream]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      return !localStream.getVideoTracks()[0]?.enabled;
    }
    return false;
  }, [localStream]);

  // Subscribe to signaling channel
  useEffect(() => {
    if (!isActive || !user) return;

    // Check for existing call-start signals first
 

    // Subscribe to new signals
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

switch (signal.type) {
case 'call-start':
  if (
    !hasInitiatedRef.current &&
    !peerConnectionRef.current
  ) {
    await joinCall();
  }
  break;

  case 'offer':
    if (signal.data.sdp) {
      await handleOffer(signal.data.sdp);
    }
    break;

  case 'answer':
    if (signal.data.sdp) {
      await handleAnswer(signal.data.sdp);
    }
    break;

  case 'ice-candidate':
    if (signal.data.candidate) {
      await handleIceCandidate(signal.data.candidate);
    }
    break;

  case 'call-accepted':
    console.log('Call accepted by remote user');
    break;

  case 'call-end':
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    stopStreams();
    hasInitiatedRef.current = false;
    setConnectionState('new');
    pendingCandidatesRef.current = [];
    break;
}
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [isActive, user, consultationId, initiateCall, joinCall, handleOffer, handleAnswer, handleIceCandidate, endCall]);

  // Cleanup on unmount
  useEffect(() => {
  return () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    hasInitiatedRef.current = false;
    stopStreams();
  };
}, [stopStreams]);

  return {
  localStream,
  remoteStream,
  connectionState,
  isConnecting,
  initiateCall,
  joinCall,
  toggleAudio,
  toggleVideo,
  endCall,
  };
};
