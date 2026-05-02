// import { useState, useRef, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import {
//   Video, VideoOff, Mic, MicOff, PhoneOff,
//   Maximize2, Minimize2, Users, Circle, Loader2
// } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { useWebRTC } from '@/hooks/useWebRTC';
// import { useCallRecording } from '@/hooks/useCallRecording';

// interface VideoCallProps {
//   isActive: boolean;
//   onEnd: () => void;
//   participantName: string;
//   consultationId: string;
//   isInitiatedByMe?: boolean;
// }

// export const VideoCall = ({ isActive, onEnd, participantName, consultationId, isInitiatedByMe }: VideoCallProps) => {
//   const [isMuted, setIsMuted] = useState(false);
//   const [isVideoOn, setIsVideoOn] = useState(true);
//   const [isFullscreen, setIsFullscreen] = useState(false);

//   const localVideoRef = useRef<HTMLVideoElement>(null);
//   const remoteVideoRef = useRef<HTMLVideoElement>(null);
//   const containerRef = useRef<HTMLDivElement>(null);

//   const {
//     localStream,
//     remoteStream,
//     connectionState,
//     isConnecting,
//     toggleAudio,
//     toggleVideo,
//     endCall,
//     initiateCall,
//     joinCall,
//   } = useWebRTC({
//     consultationId,
//     isActive,
//     isVideo: true,
//     onRemoteStream: (stream) => {
//       if (remoteVideoRef.current && stream) {
//         remoteVideoRef.current.srcObject = stream;
//       }
//     },
//   });

//   // Start the call when component becomes active
//   useEffect(() => {
//     if (isActive) {
//       if (isInitiatedByMe) {
//         initiateCall();
//       } else {
//         joinCall();
//       }
//     }
//   }, [isActive, isInitiatedByMe, initiateCall, joinCall]);

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

//   // Update local video ref when stream changes
//   useEffect(() => {
//     if (localVideoRef.current && localStream) {
//       localVideoRef.current.srcObject = localStream;
//     }
//   }, [localStream]);

//   // Update remote video ref when stream changes
//   useEffect(() => {
//     if (remoteVideoRef.current && remoteStream) {
//       remoteVideoRef.current.srcObject = remoteStream;
//     }
//   }, [remoteStream]);

//   const handleToggleMute = () => {
//     const muted = toggleAudio();
//     setIsMuted(muted);
//   };

//   const handleToggleVideo = () => {
//     const videoOff = toggleVideo();
//     setIsVideoOn(!videoOff);
//   };

//   const toggleFullscreen = () => {
//     if (!document.fullscreenElement && containerRef.current) {
//       containerRef.current.requestFullscreen();
//       setIsFullscreen(true);
//     } else {
//       document.exitFullscreen();
//       setIsFullscreen(false);
//     }
//   };

//   const handleEndCall = async () => {
//     if (isRecording) {
//       stopRecording();
//     }
//     cleanupRecording();
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

//   const getConnectionStatusText = () => {
//     switch (connectionState) {
//       case 'connecting':
//         return 'Connecting...';
//       case 'connected':
//         return 'Connected';
//       case 'disconnected':
//         return 'Disconnected';
//       case 'failed':
//         return 'Connection failed';
//       default:
//         return 'Waiting for connection...';
//     }
//   };

//   if (!isActive) return null;

//   return (
//     <div
//       ref={containerRef}
//       className={cn(
//         "fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col",
//         isFullscreen && "bg-black"
//       )}
//     >
//       {/* Header */}
//       <div className="flex items-center justify-between p-4 border-b border-border bg-background/80">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
//             <Users className="h-5 w-5 text-primary" />
//           </div>
//           <div>
//             <h3 className="font-semibold">Video Call</h3>
//             <div className="flex items-center gap-2">
//               <p className="text-sm text-muted-foreground">with {participantName}</p>
//               <span className={cn(
//                 "text-xs px-2 py-0.5 rounded-full",
//                 connectionState === 'connected' ? 'bg-emerald-500/20 text-emerald-600' :
//                   connectionState === 'connecting' ? 'bg-amber-500/20 text-amber-600' :
//                     'bg-muted text-muted-foreground'
//               )}>
//                 {getConnectionStatusText()}
//               </span>
//             </div>
//           </div>
//         </div>
//         <div className="flex items-center gap-2">
//           {isRecording && (
//             <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 rounded-full">
//               <Circle className="h-3 w-3 fill-red-500 text-red-500 animate-pulse" />
//               <span className="text-sm font-medium text-red-600">
//                 REC {formatDuration(recordingDuration)}
//               </span>
//             </div>
//           )}
//           <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
//             {isFullscreen ? (
//               <Minimize2 className="h-5 w-5" />
//             ) : (
//               <Maximize2 className="h-5 w-5" />
//             )}
//           </Button>
//         </div>
//       </div>

//       {/* Video Grid */}
//       <div className="flex-1 p-4 flex gap-4 relative">
//         {/* Remote Video */}
//         <Card className="flex-1 bg-muted/50 flex items-center justify-center relative overflow-hidden">
//           {remoteStream ? (
//             <video
//               ref={remoteVideoRef}
//               autoPlay
//               playsInline
//               className="w-full h-full object-cover"
//             />
//           ) : (
//             <div className="text-center">
//               {isConnecting ? (
//                 <>
//                   <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
//                   <p className="text-muted-foreground">Connecting...</p>
//                 </>
//               ) : (
//                 <>
//                   <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
//                     <Users className="h-12 w-12 text-muted-foreground" />
//                   </div>
//                   <p className="text-muted-foreground">Waiting for {participantName}...</p>
//                   <p className="text-sm text-muted-foreground mt-1">{getConnectionStatusText()}</p>
//                 </>
//               )}
//             </div>
//           )}
//         </Card>

//         {/* Local Video */}
//         <Card className="w-64 h-48 absolute bottom-24 right-8 overflow-hidden shadow-xl border-2 border-primary/20">
//           {isVideoOn && localStream ? (
//             <video
//               ref={localVideoRef}
//               autoPlay
//               muted
//               playsInline
//               className="w-full h-full object-cover"
//             />
//           ) : (
//             <div className="w-full h-full bg-muted flex items-center justify-center">
//               <VideoOff className="h-8 w-8 text-muted-foreground" />
//             </div>
//           )}
//           <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
//             You
//           </div>
//         </Card>
//       </div>

//       {/* Controls */}
//       <div className="flex items-center justify-center gap-4 p-6 bg-background/80 border-t border-border">
//         <Button
//           variant={isMuted ? "destructive" : "outline"}
//           size="lg"
//           className="rounded-full w-14 h-14"
//           onClick={handleToggleMute}
//         >
//           {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
//         </Button>

//         <Button
//           variant={!isVideoOn ? "destructive" : "outline"}
//           size="lg"
//           className="rounded-full w-14 h-14"
//           onClick={handleToggleVideo}
//         >
//           {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
//         </Button>

//         <Button
//           variant={isRecording ? "destructive" : "outline"}
//           size="lg"
//           className="rounded-full w-14 h-14"
//           onClick={handleToggleRecording}
//           title={isRecording ? "Stop Recording" : "Start Recording"}
//         >
//           <Circle className={cn("h-6 w-6", isRecording && "fill-current")} />
//         </Button>

//         <Button
//           variant="destructive"
//           size="lg"
//           className="rounded-full w-16 h-16"
//           onClick={handleEndCall}
//         >
//           <PhoneOff className="h-7 w-7" />
//         </Button>
//       </div>
//     </div>
//   );
// };


// ***********************

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Video, VideoOff, Mic, MicOff, PhoneOff,
  Maximize2, Minimize2, Users, Circle, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useCallRecording } from '@/hooks/useCallRecording';
import { useToast } from '@/hooks/use-toast';

interface VideoCallProps {
  isActive: boolean;
  onEnd: () => void;
  participantName: string;
  consultationId: string;
  isInitiatedByMe?: boolean;
}

export const VideoCall = ({
  isActive, onEnd, participantName, consultationId, isInitiatedByMe = false,
}: VideoCallProps) => {
  const { toast } = useToast();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);

  const {
    localStream, remoteStream, connectionState, isConnecting,
    toggleAudio, toggleVideo, endCall, initiateCall, joinCall,
  } = useWebRTC({
    consultationId,
    isActive,
    isVideo: true,
    onRemoteStream: (stream) => {
      if (remoteVideoRef.current && stream) remoteVideoRef.current.srcObject = stream;
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
    isRecording, recordingDuration, startRecording, stopRecording,
    formatDuration, cleanup: cleanupRecording,
  } = useCallRecording({ consultationId, localStream, remoteStream });

  useEffect(() => {
    if (!isActive || hasStartedRef.current) return;
    hasStartedRef.current = true;
    if (isInitiatedByMe) initiateCall();
    else joinCall();
  }, [isActive, isInitiatedByMe, initiateCall, joinCall]);

  useEffect(() => {
    if (!isActive) hasStartedRef.current = false;
  }, [isActive]);

  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  const handleToggleMute = () => setIsMuted(toggleAudio());
  const handleToggleVideo = () => setIsVideoOn(!toggleVideo());

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleEndCall = async () => {
    if (isRecording) stopRecording();
    cleanupRecording();
    await endCall();
    onEnd();
  };

  const handleToggleRecording = () => (isRecording ? stopRecording() : startRecording());

  const getConnectionStatusText = () => {
    switch (connectionState) {
      case 'connecting': return 'Connecting...';
      case 'connected': return 'Connected';
      case 'disconnected': return 'Disconnected';
      case 'failed': return 'Connection failed';
      default: return isInitiatedByMe ? 'Calling...' : 'Joining...';
    }
  };

  if (!isActive) return null;

  return (
    <div ref={containerRef} className={cn('fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col', isFullscreen && 'bg-black')}>
      <div className="flex items-center justify-between p-4 border-b border-border bg-background/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Video Call</h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">with {participantName}</p>
              <span className={cn('text-xs px-2 py-0.5 rounded-full',
                connectionState === 'connected' ? 'bg-emerald-500/20 text-emerald-600' :
                  connectionState === 'connecting' ? 'bg-amber-500/20 text-amber-600' :
                    'bg-muted text-muted-foreground')}>
                {getConnectionStatusText()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isRecording && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 rounded-full">
              <Circle className="h-3 w-3 fill-red-500 text-red-500 animate-pulse" />
              <span className="text-sm font-medium text-red-600">REC {formatDuration(recordingDuration)}</span>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 flex gap-4 relative">
        <Card className="flex-1 bg-muted/50 flex items-center justify-center relative overflow-hidden">
          {remoteStream ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              {isConnecting ? (
                <>
                  <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                  <p className="text-muted-foreground">Connecting...</p>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Waiting for {participantName}...</p>
                  <p className="text-sm text-muted-foreground mt-1">{getConnectionStatusText()}</p>
                </>
              )}
            </div>
          )}
        </Card>

        <Card className="w-64 h-48 absolute bottom-24 right-8 overflow-hidden shadow-xl border-2 border-primary/20">
          {isVideoOn && localStream ? (
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <VideoOff className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">You</div>
        </Card>
      </div>

      <div className="flex items-center justify-center gap-4 p-6 bg-background/80 border-t border-border">
        <Button variant={isMuted ? 'destructive' : 'outline'} size="lg" className="rounded-full w-14 h-14" onClick={handleToggleMute}>
          {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </Button>
        <Button variant={!isVideoOn ? 'destructive' : 'outline'} size="lg" className="rounded-full w-14 h-14" onClick={handleToggleVideo}>
          {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
        </Button>
        <Button variant={isRecording ? 'destructive' : 'outline'} size="lg" className="rounded-full w-14 h-14" onClick={handleToggleRecording}>
          <Circle className={cn('h-6 w-6', isRecording && 'fill-current')} />
        </Button>
        <Button variant="destructive" size="lg" className="rounded-full w-16 h-16" onClick={handleEndCall}>
          <PhoneOff className="h-7 w-7" />
        </Button>
      </div>
    </div>
  );
};
