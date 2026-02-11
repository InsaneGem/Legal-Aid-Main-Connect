import { useIncomingCalls } from '@/hooks/useIncomingCalls';
import { IncomingCallNotification } from './IncomingCallNotification';

interface CallNotificationProviderProps {
  children: React.ReactNode;
}

export const CallNotificationProvider = ({ children }: CallNotificationProviderProps) => {
  const { incomingCall, acceptCall, rejectCall } = useIncomingCalls();

  return (
    <>
      {children}
      <IncomingCallNotification
        isVisible={!!incomingCall}
        callerName={incomingCall?.callerName || ''}
        callType={incomingCall?.callType || 'audio'}
        consultationId={incomingCall?.consultationId || ''}
        onAccept={acceptCall}
        onReject={rejectCall}
      />
    </>
  );
};
