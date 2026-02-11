import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, Video, PhoneOff, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IncomingCallNotificationProps {
  isVisible: boolean;
  callerName: string;
  callType: 'audio' | 'video';
  consultationId: string;
  onAccept: () => void;
  onReject: () => void;
}

export const IncomingCallNotification = ({
  isVisible,
  callerName,
  callType,
  consultationId,
  onAccept,
  onReject,
}: IncomingCallNotificationProps) => {
  const [isRinging, setIsRinging] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsRinging(true);
      // Play ringtone (browser notification sound)
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
        audio.loop = true;
        audio.volume = 0.3;
        audio.play().catch(() => {});
        
        return () => {
          audio.pause();
          audio.currentTime = 0;
        };
      } catch (e) {
        // Audio not supported
      }
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <Card className="w-full max-w-sm mx-4 p-6 shadow-2xl border-2 border-primary/20 bg-card">
        {/* Animated rings */}
        <div className="relative flex justify-center mb-6">
          <div className={cn(
            "absolute w-24 h-24 rounded-full bg-primary/10",
            isRinging && "animate-ping"
          )} />
          <div className={cn(
            "absolute w-20 h-20 rounded-full bg-primary/20",
            isRinging && "animate-ping animation-delay-200"
          )} />
          <Avatar className="relative w-20 h-20 border-4 border-primary/30">
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
              {callerName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Caller info */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold">{callerName}</h3>
          <p className="text-muted-foreground flex items-center justify-center gap-2 mt-1">
            {callType === 'video' ? (
              <>
                <Video className="h-4 w-4" />
                Incoming Video Call...
              </>
            ) : (
              <>
                <Phone className="h-4 w-4" />
                Incoming Audio Call...
              </>
            )}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-6">
          <Button
            variant="destructive"
            size="lg"
            className="rounded-full w-16 h-16 shadow-lg hover:scale-105 transition-transform"
            onClick={onReject}
          >
            <PhoneOff className="h-7 w-7" />
          </Button>
          
          <Button
            size="lg"
            className="rounded-full w-16 h-16 shadow-lg hover:scale-105 transition-transform bg-primary hover:bg-primary/90"
            onClick={onAccept}
          >
            {callType === 'video' ? (
              <Video className="h-7 w-7" />
            ) : (
              <Phone className="h-7 w-7" />
            )}
          </Button>
        </div>

        {/* Dismiss hint */}
        <p className="text-xs text-center text-muted-foreground mt-4">
          Press <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground">Esc</kbd> to dismiss
        </p>
      </Card>
    </div>
  );
};
