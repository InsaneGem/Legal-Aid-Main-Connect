import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, Phone, Video, DollarSign, 
  User, Clock, X, CheckCircle, Bell
} from 'lucide-react';

interface BookingNotification {
  id: string;
  consultationId: string;
  clientName: string;
  clientAvatar?: string;
  type: 'chat' | 'audio' | 'video';
  amount: number;
  timestamp: Date;
}

interface BookingNotificationProviderProps {
  children: React.ReactNode;
}

export const BookingNotificationProvider = ({ children }: BookingNotificationProviderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<BookingNotification[]>([]);

  useEffect(() => {
    if (!user) return;

    // Check if user is a lawyer
    const checkLawyerAndSubscribe = async () => {
      const { data: lawyerProfile } = await supabase
        .from('lawyer_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (!lawyerProfile) return; // Not a lawyer

      // Subscribe to new consultations
      const channel = supabase
        .channel('lawyer-booking-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'consultations',
            filter: `lawyer_id=eq.${user.id}`,
          },
          async (payload) => {
            const consultation = payload.new as {
              id: string;
              client_id: string;
              type: 'chat' | 'audio' | 'video';
              total_amount: number;
              status: string;
            };

            // Only notify for paid consultations (pending with amount)
            if (consultation.status === 'pending' && consultation.total_amount > 0) {
              // Fetch client info
              const { data: clientProfile } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', consultation.client_id)
                .single();

              const notification: BookingNotification = {
                id: crypto.randomUUID(),
                consultationId: consultation.id,
                clientName: clientProfile?.full_name || 'Client',
                clientAvatar: clientProfile?.avatar_url || undefined,
                type: consultation.type,
                amount: consultation.total_amount,
                timestamp: new Date(),
              };

              setNotifications(prev => [notification, ...prev]);

              // Play notification sound
              try {
                const audio = new Audio('/notification.mp3');
                audio.volume = 0.5;
                audio.play().catch(() => {});
              } catch {}

              // Browser notification
              if (Notification.permission === 'granted') {
                new Notification('💰 New Paid Booking!', {
                  body: `${clientProfile?.full_name || 'A client'} paid $${consultation.total_amount} for a ${consultation.type} consultation`,
                  icon: '/favicon.ico',
                  tag: 'new-booking',
                });
              }
            }
          }
        )
        .subscribe();

      // Request notification permission
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }

      return () => {
        supabase.removeChannel(channel);
      };
    };

    checkLawyerAndSubscribe();
  }, [user]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const acceptAndStart = (notification: BookingNotification) => {
    dismissNotification(notification.id);
    navigate(`/consultation/${notification.consultationId}`);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-5 w-5" />;
      case 'audio': return <Phone className="h-5 w-5" />;
      default: return <MessageSquare className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-purple-500 text-white';
      case 'audio': return 'bg-blue-500 text-white';
      default: return 'bg-emerald-500 text-white';
    }
  };

  return (
    <>
      {children}

      {/* Floating Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm">
        {notifications.map((notification) => (
          <div 
            key={notification.id}
            className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-right-5"
          >
            {/* Header */}
            <div className="bg-emerald-500 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Bell className="h-4 w-4 animate-bounce" />
                <span className="font-medium text-sm">New Paid Booking!</span>
              </div>
              <button 
                onClick={() => dismissNotification(notification.id)}
                className="text-white/80 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                  {notification.clientAvatar ? (
                    <img 
                      src={notification.clientAvatar} 
                      alt={notification.clientName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{notification.clientName}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getTypeColor(notification.type)}`}>
                      {getTypeIcon(notification.type)}
                    </div>
                    <span className="text-sm text-muted-foreground capitalize">
                      {notification.type} session
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg mb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-medium">Payment Received</span>
                </div>
                <span className="text-lg font-bold text-emerald-600">
                  ${notification.amount.toFixed(2)}
                </span>
              </div>

              {/* Time */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                <Clock className="h-3 w-3" />
                <span>Just now</span>
              </div>

              {/* Action */}
              <Button 
                onClick={() => acceptAndStart(notification)}
                className="w-full gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Start Consultation
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
