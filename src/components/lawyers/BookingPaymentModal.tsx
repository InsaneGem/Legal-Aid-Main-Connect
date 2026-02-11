import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, Phone, Video, Wallet, CreditCard, 
  Clock, Shield, CheckCircle, Loader2, AlertCircle, 
  Zap, User
} from 'lucide-react';

interface LawyerInfo {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string | null;
  price_per_minute: number | null;
  rating: number | null;
  specializations: string[] | null;
}

interface BookingPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lawyer: LawyerInfo;
  consultationType: 'chat' | 'audio' | 'video';
  onSuccess?: () => void;
}

export const BookingPaymentModal = ({ 
  isOpen, 
  onClose, 
  lawyer, 
  consultationType,
  onSuccess 
}: BookingPaymentModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'review' | 'processing' | 'success'>('review');

  // Calculate session cost (e.g., 10 minutes minimum)
  const minimumMinutes = 10;
  const pricePerMinute = lawyer.price_per_minute || 5;
  const sessionCost = minimumMinutes * pricePerMinute;

  useEffect(() => {
    if (isOpen && user) {
      fetchWalletBalance();
    }
  }, [isOpen, user]);

  const fetchWalletBalance = async () => {
    if (!user) return;
    setLoading(true);
    
    const { data } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();
    
    setWalletBalance(Number(data?.balance) || 0);
    setLoading(false);
  };

  const hasEnoughBalance = walletBalance >= sessionCost;

  const getTypeIcon = () => {
    switch (consultationType) {
      case 'video': return <Video className="h-5 w-5" />;
      case 'audio': return <Phone className="h-5 w-5" />;
      default: return <MessageSquare className="h-5 w-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (consultationType) {
      case 'video': return 'Video Consultation';
      case 'audio': return 'Audio Call';
      default: return 'Chat Consultation';
    }
  };

  const getTypeColor = () => {
    switch (consultationType) {
      case 'video': return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
      case 'audio': return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      default: return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
    }
  };

  const handlePayAndBook = async () => {
    if (!user || !hasEnoughBalance) return;

    setProcessing(true);
    setStep('processing');

    try {
      // 1. Deduct from wallet
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ balance: walletBalance - sessionCost })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      // 2. Create transaction record
      await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'consultation_fee',
        amount: -sessionCost,
        description: `${getTypeLabel()} with ${lawyer.full_name}`,
      });

      // 3. Create consultation with 'paid' indicator (using total_amount)
      const { data: consultation, error: consultationError } = await supabase
        .from('consultations')
        .insert({
          client_id: user.id,
          lawyer_id: lawyer.user_id,
          type: consultationType,
          status: 'pending',
          total_amount: sessionCost,
        })
        .select()
        .single();

      if (consultationError) throw consultationError;

      // 4. Show success state
      setStep('success');
      
      toast({
        title: '✅ Payment Successful!',
        description: `Your ${consultationType} consultation has been booked. The lawyer will be notified.`,
      });

      // Wait a moment to show success state, then navigate
      setTimeout(() => {
        onSuccess?.();
        onClose();
        navigate(`/consultation/${consultation.id}`);
      }, 1500);

    } catch (error) {
      console.error('Payment error:', error);
      setStep('review');
      toast({
        variant: 'destructive',
        title: 'Payment Failed',
        description: 'Unable to process payment. Please try again.',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Confirm & Pay
          </DialogTitle>
          <DialogDescription>
            Review your consultation details and complete payment
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : step === 'success' ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground">Redirecting to consultation...</p>
          </div>
        ) : step === 'processing' ? (
          <div className="py-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Processing Payment...</h3>
            <p className="text-muted-foreground text-sm">Please wait while we secure your booking</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Lawyer Info */}
            <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl border">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
                {lawyer.avatar_url ? (
                  <img src={lawyer.avatar_url} alt={lawyer.full_name} className="w-full h-full object-cover" />
                ) : (
                  <User className="h-7 w-7 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{lawyer.full_name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={getTypeColor()}>
                    {getTypeIcon()}
                    <span className="ml-1">{getTypeLabel()}</span>
                  </Badge>
                </div>
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-3 p-4 bg-card rounded-xl border">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Session Details</h4>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Minimum Duration</span>
                </div>
                <span className="font-medium">{minimumMinutes} minutes</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span>Rate per minute</span>
                </div>
                <span className="font-medium">${pricePerMinute.toFixed(2)}</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-t bg-primary/5 -mx-4 px-4 rounded-b-lg">
                <span className="font-semibold">Total to Pay</span>
                <span className="text-2xl font-bold text-primary">${sessionCost.toFixed(2)}</span>
              </div>
            </div>

            {/* Wallet Balance */}
            <div className={`flex items-center justify-between p-4 rounded-xl border ${
              hasEnoughBalance 
                ? 'bg-emerald-500/5 border-emerald-500/30' 
                : 'bg-red-500/5 border-red-500/30'
            }`}>
              <div className="flex items-center gap-3">
                <Wallet className={`h-5 w-5 ${hasEnoughBalance ? 'text-emerald-600' : 'text-red-600'}`} />
                <div>
                  <p className="text-sm font-medium">Wallet Balance</p>
                  <p className={`text-lg font-bold ${hasEnoughBalance ? 'text-emerald-600' : 'text-red-600'}`}>
                    ${walletBalance.toFixed(2)}
                  </p>
                </div>
              </div>
              {hasEnoughBalance ? (
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
            </div>

            {/* Insufficient Balance Warning */}
            {!hasEnoughBalance && (
              <div className="flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-600">Insufficient Balance</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You need ${(sessionCost - walletBalance).toFixed(2)} more to book this session.
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-3 gap-2 border-red-500/30 text-red-600 hover:bg-red-500/10"
                    onClick={() => navigate('/dashboard')}
                  >
                    Add Funds
                  </Button>
                </div>
              </div>
            )}

            {/* Security Note */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Secure payment · Money-back guarantee if lawyer doesn't respond</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handlePayAndBook} 
                disabled={!hasEnoughBalance || processing}
                className="flex-1 gap-2"
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                Pay ${sessionCost.toFixed(2)}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
