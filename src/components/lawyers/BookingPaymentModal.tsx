

// import { useState, useEffect } from 'react';
// import { Dialog, DialogContent } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { supabase } from '@/integrations/supabase/client';
// import { useAuth } from '@/contexts/AuthContext';
// import { useToast } from '@/hooks/use-toast';
// import { useNavigate } from 'react-router-dom';
// import {
//   MessageSquare, Phone, Video, Wallet, CreditCard,
//   Clock, Shield, CheckCircle, Loader2, AlertCircle,
//   Star, ChevronRight, Banknote
// } from 'lucide-react';

// interface LawyerInfo {
//   id: string;
//   user_id: string;
//   full_name: string;
//   avatar_url?: string | null;
//   price_per_minute: number | null;
//   rating: number | null;
//   specializations: string[] | null;
// }

// interface BookingPaymentModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   lawyer: LawyerInfo;
//   consultationType: 'chat' | 'audio' | 'video';
//   onSuccess?: () => void;
// }

// const TYPE_CONFIG = {
//   chat: { icon: MessageSquare, label: 'Chat', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
//   audio: { icon: Phone, label: 'Audio Call', color: 'text-blue-600', bg: 'bg-blue-500/10' },
//   video: { icon: Video, label: 'Video Call', color: 'text-purple-600', bg: 'bg-purple-500/10' },
// };

// export const BookingPaymentModal = ({
//   isOpen,
//   onClose,
//   lawyer,
//   consultationType,
//   onSuccess,
// }: BookingPaymentModalProps) => {
//   const { user } = useAuth();
//   const { toast } = useToast();
//   const navigate = useNavigate();

//   const [walletBalance, setWalletBalance] = useState<number>(0);
//   const [loading, setLoading] = useState(true);
//   const [processing, setProcessing] = useState(false);
//   const [step, setStep] = useState<'review' | 'processing' | 'success'>('review');
//   const [payMethod, setPayMethod] = useState<'wallet' | 'card'>('wallet');

//   const minimumMinutes = 10;
//   const pricePerMinute = lawyer.price_per_minute || 5;
//   const sessionCost = minimumMinutes * pricePerMinute;
//   const typeConfig = TYPE_CONFIG[consultationType];
//   const TypeIcon = typeConfig.icon;

//   useEffect(() => {
//     if (isOpen && user) {
//       fetchWalletBalance();
//       setStep('review');
//     }
//   }, [isOpen, user]);

//   const fetchWalletBalance = async () => {
//     if (!user) return;
//     setLoading(true);
//     const { data } = await supabase
//       .from('wallets')
//       .select('balance')
//       .eq('user_id', user.id)
//       .single();
//     setWalletBalance(Number(data?.balance) || 0);
//     setLoading(false);
//   };

//   const hasEnoughBalance = walletBalance >= sessionCost;

//   const handlePayAndBook = async () => {
//     if (!user) return;

//     if (payMethod === 'wallet' && !hasEnoughBalance) {
//       toast({ variant: 'destructive', title: 'Insufficient balance', description: 'Please add funds or pay with card.' });
//       return;
//     }

//     setProcessing(true);
//     setStep('processing');

//     try {
//       const { data: consultation, error: consultationError } = await supabase
//         .from('consultations')
//         .insert({
//           client_id: user.id,
//           lawyer_id: lawyer.user_id,
//           type: consultationType,
//           status: 'pending' as const,
//           total_amount: sessionCost,
//           duration_minutes: minimumMinutes,
//         })
//         .select()
//         .single();

//       if (consultationError) throw consultationError;
//       setStep('success');

//       toast({
//         title: '✅ Payment Successful!',
//         description: `Your ${consultationType} consultation has been booked. The lawyer will be notified.`,
//       });

//       // Wait a moment to show success state, then navigate
//       setTimeout(() => {
//         onSuccess?.();
//         onClose();
//         // navigate(`/client/consultation/${consultation.id}`);
//         navigate(`/consultation/${consultation.id}`);
//       }, 1500);

//     } catch (error) {
//       console.error('Payment error:', error);
//       setStep('review');
//       toast({ variant: 'destructive', title: 'Payment Failed', description: 'Please try again.' });
//     } finally {
//       setProcessing(false);
//     }
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-[380px] p-0 gap-0 overflow-hidden rounded-2xl">
//         {loading ? (
//           <div className="flex items-center justify-center py-16">
//             <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
//           </div>
//         ) : step === 'success' ? (
//           <div className="py-12 text-center px-6">
//             <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
//               <CheckCircle className="h-7 w-7 text-emerald-600" />
//             </div>
//             <h3 className="text-lg font-semibold">Booking Confirmed!</h3>
//             <p className="text-sm text-muted-foreground mt-1">Redirecting to consultation…</p>
//           </div>
//         ) : step === 'processing' ? (
//           <div className="py-12 text-center px-6">
//             <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
//             <h3 className="font-semibold">Processing Payment…</h3>
//             <p className="text-xs text-muted-foreground mt-1">Securing your booking</p>
//           </div>
//         ) : (
//           <>
//             {/* Header with lawyer info */}
//             <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-transparent p-5 pb-4">
//               <div className="flex items-center gap-3">
//                 <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden ring-2 ring-background shadow">
//                   {lawyer.avatar_url ? (
//                     <img src={lawyer.avatar_url} alt={lawyer.full_name} className="w-full h-full object-cover" />
//                   ) : (
//                     <span className="text-sm font-bold text-primary">{lawyer.full_name.charAt(0)}</span>
//                   )}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <h4 className="font-semibold text-sm truncate">{lawyer.full_name}</h4>
//                   <div className="flex items-center gap-2 mt-0.5">
//                     <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
//                     <span className="text-xs text-muted-foreground">{lawyer.rating?.toFixed(1) || '0.0'}</span>
//                     <span className="text-muted-foreground/30">•</span>
//                     <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${typeConfig.color}`}>
//                       <TypeIcon className="h-3 w-3" />
//                       {typeConfig.label}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="px-5 pb-5 space-y-4">
//               {/* Pricing breakdown */}
//               <div className="rounded-xl border border-border bg-muted/20 divide-y divide-border text-sm">
//                 <div className="flex justify-between items-center px-3.5 py-2.5">
//                   <span className="text-muted-foreground flex items-center gap-1.5">
//                     <Clock className="h-3.5 w-3.5" /> Min. duration
//                   </span>
//                   <span className="font-medium">{minimumMinutes} min</span>
//                 </div>
//                 <div className="flex justify-between items-center px-3.5 py-2.5">
//                   <span className="text-muted-foreground flex items-center gap-1.5">
//                     <Banknote className="h-3.5 w-3.5" /> Rate
//                   </span>
//                   <span className="font-medium">${pricePerMinute.toFixed(2)}/min</span>
//                 </div>
//                 <div className="flex justify-between items-center px-3.5 py-3 bg-primary/5">
//                   <span className="font-semibold text-sm">Total</span>
//                   <span className="text-xl font-bold text-primary">${sessionCost.toFixed(2)}</span>
//                 </div>
//               </div>

//               {/* Payment method selector */}
//               <div className="space-y-2">
//                 <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pay with</p>
//                 <div className="grid grid-cols-2 gap-2">
//                   <button
//                     onClick={() => setPayMethod('wallet')}
//                     className={`relative flex flex-col items-center gap-1 p-3 rounded-lg border text-xs font-medium transition-all ${payMethod === 'wallet'
//                       ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/20'
//                       : 'border-border hover:border-primary/30 text-muted-foreground'
//                       }`}
//                   >
//                     <Wallet className="h-4 w-4" />
//                     <span>Wallet</span>
//                     <span className={`text-[10px] font-normal ${hasEnoughBalance ? 'text-emerald-600' : 'text-destructive'}`}>
//                       ₹{walletBalance.toFixed(2)}
//                     </span>
//                   </button>
//                   <button
//                     onClick={() => setPayMethod('card')}
//                     className={`relative flex flex-col items-center gap-1 p-3 rounded-lg border text-xs font-medium transition-all ${payMethod === 'card'
//                       ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/20'
//                       : 'border-border hover:border-primary/30 text-muted-foreground'
//                       }`}
//                   >
//                     <CreditCard className="h-4 w-4" />
//                     <span>Card</span>
//                     <span className="text-[10px] font-normal">Visaaaaa/MC</span>
//                   </button>
//                 </div>
//               </div>

//               {/* Wallet insufficient warning */}
//               {payMethod === 'wallet' && !hasEnoughBalance && (
//                 <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/5 border border-destructive/20 text-xs">
//                   <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
//                   <span className="text-destructive">
//                     Need ${(sessionCost - walletBalance).toFixed(2)} more.{' '}
//                     <button onClick={() => navigate('/dashboard')} className="underline font-medium">Add funds</button>
//                   </span>
//                 </div>
//               )}

//               {/* Card coming soon notice */}
//               {payMethod === 'card' && (
//                 <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs">
//                   <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
//                   <span className="text-amber-700">Card payments coming soon. Use wallet for now.</span>
//                 </div>
//               )}

//               {/* Security */}
//               <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
//                 <Shield className="h-3 w-3" />
//                 <span>Secure payment · Refund if no response</span>
//               </div>

//               {/* Actions */}
//               <div className="flex gap-2 pt-1">
//                 <Button variant="outline" size="sm" onClick={onClose} className="flex-1 h-9 text-xs">
//                   Cancel
//                 </Button>
//                 <Button
//                   size="sm"
//                   onClick={handlePayAndBook}
//                   disabled={processing}
//                   className="flex-1 h-9 text-xs gap-1.5"
//                 >
//                   {processing ? (
//                     <Loader2 className="h-3.5 w-3.5 animate-spin" />
//                   ) : (
//                     <CheckCircle className="h-3.5 w-3.5" />
//                   )}
//                   Confirm Booking
//                   <ChevronRight className="h-3 w-3" />
//                 </Button>
//               </div>
//             </div>
//           </>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// };
