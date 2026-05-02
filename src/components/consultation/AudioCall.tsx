// // AUDIOCALL.TSX
// import { useState, useRef, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, User, Circle, Loader2 } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { useWebRTC } from '@/hooks/useWebRTC';
// import { useCallRecording } from '@/hooks/useCallRecording';
// import { useToast } from '@/hooks/use-toast';

// interface AudioCallProps {
//   isActive: boolean;
//   onEnd: () => void;
//   participantName: string;
//   consultationId: string;
//   isInitiatedByMe?: boolean;
// }

// export const AudioCall = ({
//   isActive,
//   onEnd,
//   participantName,
//   consultationId,
//   isInitiatedByMe = false,
// }: AudioCallProps) => {
//   const { toast } = useToast();
//   const [isMuted, setIsMuted] = useState(false);
//   const [isSpeakerOn, setIsSpeakerOn] = useState(true);
//   const [callDuration, setCallDuration] = useState(0);

//   const remoteAudioRef = useRef<HTMLAudioElement>(null);
//   const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
//   const hasStartedRef = useRef(false);

//   const {
//     localStream,
//     remoteStream,
//     connectionState,
//     isConnecting,
//     toggleAudio,
//     endCall,
//     initiateCall,
//     joinCall,
//     // sendSignal,
//   } = useWebRTC({
//     consultationId,
//     isActive,
//     isVideo: false,
//     onRemoteStream: (stream) => {
//       if (remoteAudioRef.current && stream) {
//         remoteAudioRef.current.srcObject = stream;
//       }
//     },
//   });

//   const {
//     isRecording,
//     recordingDuration,
//     startRecording,
//     stopRecording,
//     formatDuration,
//     cleanup: cleanupRecording,
//   } = useCallRecording({
//     consultationId,
//     localStream,
//     remoteStream,
//   });

//   // Caller auto-initiates the call once when the component becomes active
//   useEffect(() => {
//     if (isActive && isInitiatedByMe && !hasStartedRef.current) {
//       hasStartedRef.current = true;
//       initiateCall();
//     }
//   }, [isActive, isInitiatedByMe, initiateCall]);

//   // Non-initiator (receiver) auto-joins the call when component becomes active
//   useEffect(() => {
//     if (isActive && !isInitiatedByMe && !hasStartedRef.current && connectionState === 'new') {
//       hasStartedRef.current = true;
//       handleAcceptCall();
//     }
//   }, [isActive, isInitiatedByMe, connectionState]);

//   // Reset start flag when the call closes
//   useEffect(() => {
//     if (!isActive) {
//       hasStartedRef.current = false;
//     }
//   }, [isActive]);

//   // Track call duration when connected
//   useEffect(() => {
//     if (connectionState === 'connected') {
//       durationIntervalRef.current = setInterval(() => {
//         setCallDuration((prev) => prev + 1);
//       }, 1000);
//     }

//     return () => {
//       if (durationIntervalRef.current) {
//         clearInterval(durationIntervalRef.current);
//         durationIntervalRef.current = null;
//       }
//     };
//   }, [connectionState]);

//   // Update remote audio when stream changes
//   useEffect(() => {
//     if (remoteAudioRef.current && remoteStream) {
//       remoteAudioRef.current.srcObject = remoteStream;
//     }
//   }, [remoteStream]);

//   const handleToggleMute = () => {
//     const muted = toggleAudio();
//     setIsMuted(muted);
//   };

//   const toggleSpeaker = () => {
//     if (remoteAudioRef.current) {
//       // When speaker is ON (isSpeakerOn = true), audio should NOT be muted (muted = false)
//       remoteAudioRef.current.muted = !isSpeakerOn;
//     }
//     setIsSpeakerOn(!isSpeakerOn);
//   };

//   const handleAcceptCall = async () => {
//     hasStartedRef.current = true;
//     await sendSignal('call-accepted', {});
//     await joinCall();
//   };

//   const handleEndCall = async () => {
//     if (isRecording) {
//       stopRecording();
//     }
//     cleanupRecording();
//     if (durationIntervalRef.current) {
//       clearInterval(durationIntervalRef.current);
//       durationIntervalRef.current = null;
//     }
//     // Notify the other side first, then tear down
//     try {
//       await sendSignal('call-end', {});
//     } catch (e) {
//       console.warn('Failed to send call-end signal', e);
//     }
//     await endCall();
//     onEnd();
//   };

//   const handleToggleRecording = () => {
//     if (isRecording) {
//       stopRecording();
//     } else {
//       startRecording();
//     }
//   };

//   const formatCallDuration = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   const getStatusText = () => {
//     switch (connectionState) {
//       case 'connecting':
//         return 'Connecting...';
//       case 'connected':
//         return isMuted ? 'You are muted' : 'Connected';
//       case 'disconnected':
//         return 'Disconnected';
//       case 'failed':
//         return 'Connection failed';
//       default:
//         return isInitiatedByMe ? 'Calling...' : 'Incoming call...';
//     }
//   };

//   if (!isActive) return null;

//   // Show "Accept Call" screen for the receiver until they accept
//   const showAcceptScreen =
//     !isInitiatedByMe &&
//     !hasStartedRef.current &&
//     (connectionState === 'new' || connectionState === 'closed');

//   return (
//     <div className="fixed inset-0 z-50 bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center">
//       {/* Hidden audio element for remote stream */}
//       <audio ref={remoteAudioRef} autoPlay playsInline />

//       <Card className="w-full max-w-md mx-4 shadow-2xl border-0">
//         <CardContent className="p-8 text-center">
//           {/* Avatar */}
//           <div className="relative mx-auto mb-6">
//             <div
//               className={cn(
//                 'w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto',
//                 connectionState === 'connected' && 'animate-pulse'
//               )}
//             >
//               {isConnecting ? (
//                 <Loader2 className="h-16 w-16 text-primary-foreground animate-spin" />
//               ) : (
//                 <User className="h-16 w-16 text-primary-foreground" />
//               )}
//             </div>
//             {/* Sound waves animation */}
//             {connectionState === 'connected' && (
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <div className="w-36 h-36 rounded-full border-4 border-primary/30 animate-ping" />
//               </div>
//             )}
//           </div>

//           {/* Participant Info */}
//           <h2 className="text-2xl font-bold mb-2">{participantName}</h2>
//           <p className="text-muted-foreground mb-2">Voice Call</p>

//           {/* Duration / Status */}
//           <div className="flex items-center justify-center gap-2 mb-4">
//             {connectionState === 'connected' ? (
//               <>
//                 <Phone className="h-4 w-4 text-emerald-500" />
//                 <span className="text-lg font-mono font-semibold text-emerald-600">
//                   {formatCallDuration(callDuration)}
//                 </span>
//               </>
//             ) : (
//               <span
//                 className={cn(
//                   'text-sm px-3 py-1 rounded-full',
//                   connectionState === 'connecting'
//                     ? 'bg-amber-500/20 text-amber-600'
//                     : connectionState === 'failed'
//                       ? 'bg-red-500/20 text-red-600'
//                       : 'bg-muted text-muted-foreground'
//                 )}
//               >
//                 {getStatusText()}
//               </span>
//             )}
//           </div>

//           {/* Recording indicator */}
//           {isRecording && (
//             <div className="flex items-center justify-center gap-2 mb-4 px-3 py-1.5 bg-red-500/20 rounded-full mx-auto w-fit">
//               <Circle className="h-3 w-3 fill-red-500 text-red-500 animate-pulse" />
//               <span className="text-sm font-medium text-red-600">
//                 Recording {formatDuration(recordingDuration)}
//               </span>
//             </div>
//           )}

//           {/* Accept Call screen for receiver */}
//           {showAcceptScreen ? (
//             <div className="flex items-center justify-center gap-4 mt-4">
//               <Button
//                 variant="default"
//                 size="lg"
//                 className="rounded-full px-8 h-16 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
//                 onClick={handleAcceptCall}
//               >
//                 <Phone className="h-6 w-6 mr-2" />
//                 Accept Call
//               </Button>
//               <Button
//                 variant="destructive"
//                 size="lg"
//                 className="rounded-full w-16 h-16 shadow-lg"
//                 onClick={handleEndCall}
//               >
//                 <PhoneOff className="h-7 w-7" />
//               </Button>
//             </div>
//           ) : (
//             /* In-call controls */
//             <div className="flex items-center justify-center gap-4 mt-4">
//               <Button
//                 variant={isMuted ? 'destructive' : 'outline'}
//                 size="lg"
//                 className="rounded-full w-16 h-16"
//                 onClick={handleToggleMute}
//               >
//                 {isMuted ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
//               </Button>

//               <Button
//                 variant={isRecording ? 'destructive' : 'outline'}
//                 size="lg"
//                 className="rounded-full w-16 h-16"
//                 onClick={handleToggleRecording}
//                 title={isRecording ? 'Stop Recording' : 'Start Recording'}
//               >
//                 <Circle className={cn('h-7 w-7', isRecording && 'fill-current')} />
//               </Button>

//               <Button
//                 variant="destructive"
//                 size="lg"
//                 className="rounded-full w-20 h-20 shadow-lg"
//                 onClick={handleEndCall}
//               >
//                 <PhoneOff className="h-9 w-9" />
//               </Button>

//               <Button
//                 variant={!isSpeakerOn ? 'destructive' : 'outline'}
//                 size="lg"
//                 className="rounded-full w-16 h-16"
//                 onClick={toggleSpeaker}
//               >
//                 {isSpeakerOn ? <Volume2 className="h-7 w-7" /> : <VolumeX className="h-7 w-7" />}
//               </Button>
//             </div>
//           )}

//           {/* Status */}
//           <p className="text-sm text-muted-foreground mt-6">{getStatusText()}</p>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };


// ********************




import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, User, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useCallRecording } from '@/hooks/useCallRecording';
import { useToast } from '@/hooks/use-toast';

interface AudioCallProps {
  isActive: boolean;
  onEnd: () => void;
  participantName: string;
  consultationId: string;
  isInitiatedByMe?: boolean;
}

export const AudioCall = ({
  isActive,
  onEnd,
  participantName,
  consultationId,
  isInitiatedByMe = false,
}: AudioCallProps) => {
  const { toast } = useToast();
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedRef = useRef(false);

  const {
    localStream,
    remoteStream,
    connectionState,
    isConnecting,
    toggleAudio,
    endCall,
    initiateCall,
    joinCall,
  } = useWebRTC({
    consultationId,
    isActive,
    isVideo: false,
    onRemoteStream: (stream) => {
      if (remoteAudioRef.current && stream) {
        remoteAudioRef.current.srcObject = stream;
      }
    },
    onCallEnded: (reason) => {
      if (reason === 'rejected') {
        toast({ title: 'Call declined', description: `${participantName} declined the call.` });
      } else {
        toast({ title: 'Call ended' });
      }
      onEnd();
    },
  });

  const {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    formatDuration,
    cleanup: cleanupRecording,
  } = useCallRecording({ consultationId, localStream, remoteStream });

  // Auto start the call: caller initiates, receiver joins (after accepting popup)
  useEffect(() => {
    if (!isActive || hasStartedRef.current) return;
    hasStartedRef.current = true;
    if (isInitiatedByMe) {
      initiateCall();
    } else {
      joinCall();
    }
  }, [isActive, isInitiatedByMe, initiateCall, joinCall]);

  // Reset start flag when call closes
  useEffect(() => {
    if (!isActive) hasStartedRef.current = false;
  }, [isActive]);

  // Track duration when connected
  useEffect(() => {
    if (connectionState === 'connected') {
      durationIntervalRef.current = setInterval(() => setCallDuration((p) => p + 1), 1000);
    }
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    };
  }, [connectionState]);

  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleToggleMute = () => setIsMuted(toggleAudio());

  const toggleSpeaker = () => {
    if (remoteAudioRef.current) remoteAudioRef.current.muted = isSpeakerOn;
    setIsSpeakerOn(!isSpeakerOn);
  };

  const handleEndCall = async () => {
    if (isRecording) stopRecording();
    cleanupRecording();
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    await endCall();
    onEnd();
  };

  const handleToggleRecording = () => (isRecording ? stopRecording() : startRecording());

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    switch (connectionState) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return isMuted ? 'You are muted' : 'Connected';
      case 'disconnected':
        return 'Disconnected';
      case 'failed':
        return 'Connection failed';
      default:
        return isInitiatedByMe ? 'Calling...' : 'Joining...';
    }
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center">
      <audio ref={remoteAudioRef} autoPlay playsInline />
      <Card className="w-full max-w-md mx-4 shadow-2xl border-0">
        <CardContent className="p-8 text-center">
          <div className="relative mx-auto mb-6">
            <div
              className={cn(
                'w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto',
                connectionState === 'connected' && 'animate-pulse'
              )}
            >
              {isConnecting ? (
                <Loader2 className="h-16 w-16 text-primary-foreground animate-spin" />
              ) : (
                <User className="h-16 w-16 text-primary-foreground" />
              )}
            </div>
            {connectionState === 'connected' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-36 h-36 rounded-full border-4 border-primary/30 animate-ping" />
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold mb-2">{participantName}</h2>
          <p className="text-muted-foreground mb-2">Voice Call</p>

          <div className="flex items-center justify-center gap-2 mb-4">
            {connectionState === 'connected' ? (
              <>
                <Phone className="h-4 w-4 text-emerald-500" />
                <span className="text-lg font-mono font-semibold text-emerald-600">
                  {formatCallDuration(callDuration)}
                </span>
              </>
            ) : (
              <span
                className={cn(
                  'text-sm px-3 py-1 rounded-full',
                  connectionState === 'connecting'
                    ? 'bg-amber-500/20 text-amber-600'
                    : connectionState === 'failed'
                      ? 'bg-red-500/20 text-red-600'
                      : 'bg-muted text-muted-foreground'
                )}
              >
                {getStatusText()}
              </span>
            )}
          </div>

          {isRecording && (
            <div className="flex items-center justify-center gap-2 mb-4 px-3 py-1.5 bg-red-500/20 rounded-full mx-auto w-fit">
              <Circle className="h-3 w-3 fill-red-500 text-red-500 animate-pulse" />
              <span className="text-sm font-medium text-red-600">
                Recording {formatDuration(recordingDuration)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 mt-4">
            <Button
              variant={isMuted ? 'destructive' : 'outline'}
              size="lg"
              className="rounded-full w-16 h-16"
              onClick={handleToggleMute}
            >
              {isMuted ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
            </Button>

            <Button
              variant={isRecording ? 'destructive' : 'outline'}
              size="lg"
              className="rounded-full w-16 h-16"
              onClick={handleToggleRecording}
            >
              <Circle className={cn('h-7 w-7', isRecording && 'fill-current')} />
            </Button>

            <Button
              variant="destructive"
              size="lg"
              className="rounded-full w-20 h-20 shadow-lg"
              onClick={handleEndCall}
            >
              <PhoneOff className="h-9 w-9" />
            </Button>

            <Button
              variant={!isSpeakerOn ? 'destructive' : 'outline'}
              size="lg"
              className="rounded-full w-16 h-16"
              onClick={toggleSpeaker}
            >
              {isSpeakerOn ? <Volume2 className="h-7 w-7" /> : <VolumeX className="h-7 w-7" />}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">{getStatusText()}</p>
        </CardContent>
      </Card>
    </div>
  );
};
