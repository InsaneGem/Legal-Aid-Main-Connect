// // import { useState, useEffect } from 'react';
// // import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
// // import { Button } from '@/components/ui/button';
// // import { Badge } from '@/components/ui/badge';
// // import { supabase } from '@/integrations/supabase/client';
// // import { useAuth } from '@/contexts/AuthContext';
// // import { useToast } from '@/hooks/use-toast';
// // import { useNavigate } from 'react-router-dom';
// // import { 
// //   MessageSquare, Phone, Video, Wallet, CreditCard, 
// //   Clock, Shield, CheckCircle, Loader2, AlertCircle, 
// //   Zap, User
// // } from 'lucide-react';

// // interface LawyerInfo {
// //   id: string;
// //   user_id: string;
// //   full_name: string;
// //   avatar_url?: string | null;
// //   price_per_minute: number | null;
// //   rating: number | null;
// //   specializations: string[] | null;
// // }

// // interface BookingPaymentModalProps {
// //   isOpen: boolean;
// //   onClose: () => void;
// //   lawyer: LawyerInfo;
// //   consultationType: 'chat' | 'audio' | 'video';
// //   onSuccess?: () => void;
// // }

// // export const BookingPaymentModal = ({ 
// //   isOpen, 
// //   onClose, 
// //   lawyer, 
// //   consultationType,
// //   onSuccess 
// // }: BookingPaymentModalProps) => {
// //   const { user } = useAuth();
// //   const { toast } = useToast();
// //   const navigate = useNavigate();

// //   const [walletBalance, setWalletBalance] = useState<number>(0);
// //   const [loading, setLoading] = useState(true);
// //   const [processing, setProcessing] = useState(false);
// //   const [step, setStep] = useState<'review' | 'processing' | 'success'>('review');

// //   // Calculate session cost (e.g., 10 minutes minimum)
// //   const minimumMinutes = 10;
// //   const pricePerMinute = lawyer.price_per_minute || 5;
// //   const sessionCost = minimumMinutes * pricePerMinute;

// //   useEffect(() => {
// //     if (isOpen && user) {
// //       fetchWalletBalance();
// //     }
// //   }, [isOpen, user]);

// //   const fetchWalletBalance = async () => {
// //     if (!user) return;
// //     setLoading(true);

// //     const { data } = await supabase
// //       .from('wallets')
// //       .select('balance')
// //       .eq('user_id', user.id)
// //       .single();

// //     setWalletBalance(Number(data?.balance) || 0);
// //     setLoading(false);
// //   };

// //   const hasEnoughBalance = walletBalance >= sessionCost;

// //   const getTypeIcon = () => {
// //     switch (consultationType) {
// //       case 'video': return <Video className="h-5 w-5" />;
// //       case 'audio': return <Phone className="h-5 w-5" />;
// //       default: return <MessageSquare className="h-5 w-5" />;
// //     }
// //   };

// //   const getTypeLabel = () => {
// //     switch (consultationType) {
// //       case 'video': return 'Video Consultation';
// //       case 'audio': return 'Audio Call';
// //       default: return 'Chat Consultation';
// //     }
// //   };

// //   const getTypeColor = () => {
// //     switch (consultationType) {
// //       case 'video': return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
// //       case 'audio': return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
// //       default: return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
// //     }
// //   };

// //   const handlePayAndBook = async () => {
// //     if (!user || !hasEnoughBalance) return;

// //     setProcessing(true);
// //     setStep('processing');

// //     try {
// //       // 1. Deduct from wallet
// //       const { error: walletError } = await supabase
// //         .from('wallets')
// //         .update({ balance: walletBalance - sessionCost })
// //         .eq('user_id', user.id);

// //       if (walletError) throw walletError;

// //       // 2. Create transaction record
// //       await supabase.from('transactions').insert({
// //         user_id: user.id,
// //         type: 'consultation_fee',
// //         amount: -sessionCost,
// //         description: `${getTypeLabel()} with ${lawyer.full_name}`,
// //       });

// //       // 3. Create consultation with 'paid' indicator (using total_amount)
// //       const { data: consultation, error: consultationError } = await supabase
// //         .from('consultations')
// //         .insert({
// //           client_id: user.id,
// //           lawyer_id: lawyer.user_id,
// //           type: consultationType,
// //           status: 'pending',
// //           total_amount: sessionCost,
// //         })
// //         .select()
// //         .single();

// //       if (consultationError) throw consultationError;

// //       // 4. Show success state
// //       setStep('success');

// //       toast({
// //         title: '✅ Payment Successful!',
// //         description: `Your ${consultationType} consultation has been booked. The lawyer will be notified.`,
// //       });

// //       // Wait a moment to show success state, then navigate
// //       setTimeout(() => {
// //         onSuccess?.();
// //         onClose();
// //         navigate(`/consultation/${consultation.id}`);
// //       }, 1500);

// //     } catch (error) {
// //       console.error('Payment error:', error);
// //       setStep('review');
// //       toast({
// //         variant: 'destructive',
// //         title: 'Payment Failed',
// //         description: 'Unable to process payment. Please try again.',
// //       });
// //     } finally {
// //       setProcessing(false);
// //     }
// //   };

// //   return (
// //     <Dialog open={isOpen} onOpenChange={onClose}>
// //       <DialogContent className="sm:max-w-md">
// //         <DialogHeader>
// //           <DialogTitle className="flex items-center gap-2">
// //             <CreditCard className="h-5 w-5 text-primary" />
// //             Confirm & Pay
// //           </DialogTitle>
// //           <DialogDescription>
// //             Review your consultation details and complete payment
// //           </DialogDescription>
// //         </DialogHeader>

// //         {loading ? (
// //           <div className="flex items-center justify-center py-12">
// //             <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
// //           </div>
// //         ) : step === 'success' ? (
// //           <div className="py-8 text-center">
// //             <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
// //               <CheckCircle className="h-8 w-8 text-emerald-600" />
// //             </div>
// //             <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
// //             <p className="text-muted-foreground">Redirecting to consultation...</p>
// //           </div>
// //         ) : step === 'processing' ? (
// //           <div className="py-8 text-center">
// //             <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
// //             <h3 className="text-lg font-semibold mb-2">Processing Payment...</h3>
// //             <p className="text-muted-foreground text-sm">Please wait while we secure your booking</p>
// //           </div>
// //         ) : (
// //           <div className="space-y-6">
// //             {/* Lawyer Info */}
// //             <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl border">
// //               <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
// //                 {lawyer.avatar_url ? (
// //                   <img src={lawyer.avatar_url} alt={lawyer.full_name} className="w-full h-full object-cover" />
// //                 ) : (
// //                   <User className="h-7 w-7 text-primary" />
// //                 )}
// //               </div>
// //               <div className="flex-1">
// //                 <h4 className="font-semibold">{lawyer.full_name}</h4>
// //                 <div className="flex items-center gap-2 mt-1">
// //                   <Badge variant="outline" className={getTypeColor()}>
// //                     {getTypeIcon()}
// //                     <span className="ml-1">{getTypeLabel()}</span>
// //                   </Badge>
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Pricing Breakdown */}
// //             <div className="space-y-3 p-4 bg-card rounded-xl border">
// //               <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Session Details</h4>

// //               <div className="flex items-center justify-between py-2">
// //                 <div className="flex items-center gap-2 text-sm">
// //                   <Clock className="h-4 w-4 text-muted-foreground" />
// //                   <span>Minimum Duration</span>
// //                 </div>
// //                 <span className="font-medium">{minimumMinutes} minutes</span>
// //               </div>

// //               <div className="flex items-center justify-between py-2 border-t">
// //                 <div className="flex items-center gap-2 text-sm">
// //                   <Zap className="h-4 w-4 text-muted-foreground" />
// //                   <span>Rate per minute</span>
// //                 </div>
// //                 <span className="font-medium">${pricePerMinute.toFixed(2)}</span>
// //               </div>

// //               <div className="flex items-center justify-between py-3 border-t bg-primary/5 -mx-4 px-4 rounded-b-lg">
// //                 <span className="font-semibold">Total to Pay</span>
// //                 <span className="text-2xl font-bold text-primary">${sessionCost.toFixed(2)}</span>
// //               </div>
// //             </div>

// //             {/* Wallet Balance */}
// //             <div className={`flex items-center justify-between p-4 rounded-xl border ${
// //               hasEnoughBalance 
// //                 ? 'bg-emerald-500/5 border-emerald-500/30' 
// //                 : 'bg-red-500/5 border-red-500/30'
// //             }`}>
// //               <div className="flex items-center gap-3">
// //                 <Wallet className={`h-5 w-5 ${hasEnoughBalance ? 'text-emerald-600' : 'text-red-600'}`} />
// //                 <div>
// //                   <p className="text-sm font-medium">Wallet Balance</p>
// //                   <p className={`text-lg font-bold ${hasEnoughBalance ? 'text-emerald-600' : 'text-red-600'}`}>
// //                     ${walletBalance.toFixed(2)}
// //                   </p>
// //                 </div>
// //               </div>
// //               {hasEnoughBalance ? (
// //                 <CheckCircle className="h-5 w-5 text-emerald-600" />
// //               ) : (
// //                 <AlertCircle className="h-5 w-5 text-red-600" />
// //               )}
// //             </div>

// //             {/* Insufficient Balance Warning */}
// //             {!hasEnoughBalance && (
// //               <div className="flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
// //                 <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
// //                 <div>
// //                   <p className="text-sm font-medium text-red-600">Insufficient Balance</p>
// //                   <p className="text-xs text-muted-foreground mt-1">
// //                     You need ${(sessionCost - walletBalance).toFixed(2)} more to book this session.
// //                   </p>
// //                   <Button 
// //                     size="sm" 
// //                     variant="outline" 
// //                     className="mt-3 gap-2 border-red-500/30 text-red-600 hover:bg-red-500/10"
// //                     onClick={() => navigate('/dashboard')}
// //                   >
// //                     Add Funds
// //                   </Button>
// //                 </div>
// //               </div>
// //             )}

// //             {/* Security Note */}
// //             <div className="flex items-center gap-2 text-xs text-muted-foreground">
// //               <Shield className="h-4 w-4" />
// //               <span>Secure payment · Money-back guarantee if lawyer doesn't respond</span>
// //             </div>

// //             {/* Actions */}
// //             <div className="flex gap-3">
// //               <Button variant="outline" onClick={onClose} className="flex-1">
// //                 Cancel
// //               </Button>
// //               <Button 
// //                 onClick={handlePayAndBook} 
// //                 disabled={!hasEnoughBalance || processing}
// //                 className="flex-1 gap-2"
// //               >
// //                 {processing ? (
// //                   <Loader2 className="h-4 w-4 animate-spin" />
// //                 ) : (
// //                   <CreditCard className="h-4 w-4" />
// //                 )}
// //                 Pay ${sessionCost.toFixed(2)}
// //               </Button>
// //             </div>
// //           </div>
// //         )}
// //       </DialogContent>
// //     </Dialog>
// //   );
// // };

// // *************************************

// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Star, MessageSquare, Video, Phone, Clock, Verified, Zap, CreditCard, Award, ChevronRight } from 'lucide-react';
// import { useAuth } from '@/contexts/AuthContext';
// import { useToast } from '@/hooks/use-toast';
// import { BookingPaymentModal } from './BookingPaymentModal';

// interface LawyerWithProfile {
//   id: string;
//   user_id: string;
//   bio: string | null;
//   experience_years: number | null;
//   specializations: string[] | null;
//   languages: string[] | null;
//   price_per_minute: number | null;
//   rating: number | null;
//   total_reviews: number | null;
//   is_available: boolean | null;
//   status: string | null;
//   full_name?: string;
//   avatar_url?: string | null;
// }

// interface LawyerCardProps {
//   lawyer: LawyerWithProfile;
//   showActions?: boolean;
//   onBooking?: () => void;
// }

// export const LawyerCard = ({ lawyer, showActions = true, onBooking }: LawyerCardProps) => {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const { toast } = useToast();
//   const isOnline = lawyer.is_available;
//   const isApproved = lawyer.status === 'approved';

//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [selectedType, setSelectedType] = useState<'chat' | 'audio' | 'video'>('chat');

//   const handleBookClick = (type: 'chat' | 'audio' | 'video', e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!user) {
//       toast({
//         title: 'Login Required',
//         description: 'Please login to book a consultation.',
//         variant: 'destructive',
//       });
//       navigate('/login');
//       return;
//     }

//     setSelectedType(type);
//     setShowPaymentModal(true);
//   };

//   const handleCardClick = () => {
//     navigate(`/lawyer/${lawyer.id}`);
//   };

//   const ratingValue = lawyer.rating?.toFixed(1) || '0.0';
//   const reviewCount = lawyer.total_reviews || 0;

//   return (
//     <div className="group block">
//       <div
//         className={`relative bg-card rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer ${
//           isOnline
//             ? 'border-emerald-500/30 hover:border-emerald-500/50 shadow-emerald-500/5'
//             : 'border-border hover:border-primary/20'
//         }`}
//         onClick={handleCardClick}
//       >
//         {/* Pending Banner */}
//         {lawyer.status === 'pending' && (
//           <div className="bg-amber-500/90 text-white text-center py-1 text-[11px] font-medium tracking-wide">
//             <Award className="h-3 w-3 inline mr-1" />
//             PENDING VERIFICATION
//           </div>
//         )}

//         {/* Top Section: Avatar + Info */}
//         <div className="p-4">
//           <div className="flex gap-3">
//             {/* Avatar */}
//             <div className="relative shrink-0">
//               <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-lg font-bold overflow-hidden ring-2 ring-background shadow-md">
//                 {lawyer.avatar_url ? (
//                   <img src={lawyer.avatar_url} alt={lawyer.full_name} className="w-full h-full object-cover" />
//                 ) : (
//                   <span className="text-primary">{lawyer.full_name?.charAt(0).toUpperCase() || 'L'}</span>
//                 )}
//               </div>
//               {/* Online dot on avatar */}
//               <span
//                 className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-card ${
//                   isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/40'
//                 }`}
//               />
//               {isApproved && (
//                 <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center border-2 border-card">
//                   <Verified className="h-3 w-3 text-white" />
//                 </span>
//               )}
//             </div>

//             {/* Name, Rating, Experience */}
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center gap-1.5">
//                 <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
//                   {lawyer.full_name || 'Legal Professional'}
//                 </h3>
//               </div>

//               <div className="flex items-center gap-2 mt-1">
//                 <div className="flex items-center gap-0.5">
//                   <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
//                   <span className="text-xs font-semibold text-amber-600">{ratingValue}</span>
//                   <span className="text-[10px] text-muted-foreground">({reviewCount})</span>
//                 </div>
//                 {lawyer.experience_years && lawyer.experience_years > 0 && (
//                   <>
//                     <span className="text-muted-foreground/30">•</span>
//                     <div className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
//                       <Clock className="h-3 w-3" />
//                       <span>{lawyer.experience_years}y exp</span>
//                     </div>
//                   </>
//                 )}
//               </div>

//               {/* Status badge */}
//               <div className="mt-1.5">
//                 {isOnline ? (
//                   <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
//                     <span className="relative flex h-1.5 w-1.5">
//                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
//                       <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
//                     </span>
//                     Available Now
//                   </span>
//                 ) : (
//                   <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
//                     <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
//                     Offline
//                   </span>
//                 )}
//               </div>
//             </div>

//             {/* Price - right aligned */}
//             <div className="text-right shrink-0">
//               <span className="text-lg font-bold text-foreground">${lawyer.price_per_minute || 5}</span>
//               <span className="text-[10px] text-muted-foreground block -mt-0.5">/min</span>
//             </div>
//           </div>
//         </div>

//         {/* Specializations */}
//         {lawyer.specializations && lawyer.specializations.length > 0 && (
//           <div className="px-4 pb-2">
//             <div className="flex flex-wrap gap-1">
//               {lawyer.specializations.slice(0, 3).map((spec) => (
//                 <Badge key={spec} variant="secondary" className="text-[10px] font-normal py-0 px-1.5 h-5 bg-secondary/60">
//                   {spec}
//                 </Badge>
//               ))}
//               {lawyer.specializations.length > 3 && (
//                 <Badge variant="outline" className="text-[10px] font-normal py-0 px-1.5 h-5">
//                   +{lawyer.specializations.length - 3}
//                 </Badge>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Bio */}
//         <div className="px-4 pb-3">
//           <p className="text-xs text-muted-foreground line-clamp-1">
//             {lawyer.bio || 'Experienced legal professional ready to help.'}
//           </p>
//         </div>

//         {/* Action Buttons */}
//         {showActions && (
//           <div className="px-3 py-2.5 border-t border-border bg-muted/30 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
//             <Button
//               size="sm"
//               variant="ghost"
//               className="h-8 w-8 p-0 hover:bg-emerald-500/10 hover:text-emerald-600"
//               onClick={(e) => handleBookClick('chat', e)}
//               title="Chat"
//             >
//               <MessageSquare className="h-3.5 w-3.5" />
//             </Button>
//             <Button
//               size="sm"
//               variant="ghost"
//               className="h-8 w-8 p-0 hover:bg-blue-500/10 hover:text-blue-600"
//               onClick={(e) => handleBookClick('audio', e)}
//               title="Call"
//             >
//               <Phone className="h-3.5 w-3.5" />
//             </Button>
//             <Button
//               size="sm"
//               variant="ghost"
//               className="h-8 w-8 p-0 hover:bg-purple-500/10 hover:text-purple-600"
//               onClick={(e) => handleBookClick('video', e)}
//               title="Video"
//             >
//               <Video className="h-3.5 w-3.5" />
//             </Button>

//             <Button
//               size="sm"
//               className="ml-auto h-8 text-xs gap-1.5 px-3"
//               onClick={(e) => handleBookClick('video', e)}
//             >
//               <CreditCard className="h-3 w-3" />
//               Book Now
//               <ChevronRight className="h-3 w-3" />
//             </Button>
//           </div>
//         )}
//       </div>

//       {/* Payment Modal */}
//       <BookingPaymentModal
//         isOpen={showPaymentModal}
//         onClose={() => setShowPaymentModal(false)}
//         lawyer={{
//           id: lawyer.id,
//           user_id: lawyer.user_id,
//           full_name: lawyer.full_name || 'Legal Professional',
//           avatar_url: lawyer.avatar_url,
//           price_per_minute: lawyer.price_per_minute,
//           rating: lawyer.rating,
//           specializations: lawyer.specializations,
//         }}
//         consultationType={selectedType}
//         onSuccess={onBooking}
//       />
//     </div>
//   );
// };

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, Phone, Video, Wallet, CreditCard,
  Clock, Shield, CheckCircle, Loader2, AlertCircle,
  Star, ChevronRight, Banknote
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

const TYPE_CONFIG = {
  chat: { icon: MessageSquare, label: 'Chat', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  audio: { icon: Phone, label: 'Audio Call', color: 'text-blue-600', bg: 'bg-blue-500/10' },
  video: { icon: Video, label: 'Video Call', color: 'text-purple-600', bg: 'bg-purple-500/10' },
};

export const BookingPaymentModal = ({
  isOpen,
  onClose,
  lawyer,
  consultationType,
  onSuccess,
}: BookingPaymentModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'review' | 'processing' | 'success'>('review');
  const [payMethod, setPayMethod] = useState<'wallet' | 'card'>('wallet');

  const minimumMinutes = 10;
  const pricePerMinute = lawyer.price_per_minute || 5;
  const sessionCost = minimumMinutes * pricePerMinute;
  const typeConfig = TYPE_CONFIG[consultationType];
  const TypeIcon = typeConfig.icon;

  useEffect(() => {
    if (isOpen && user) {
      fetchWalletBalance();
      setStep('review');
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

  const handlePayAndBook = async () => {
    if (!user) return;

    if (payMethod === 'wallet' && !hasEnoughBalance) {
      toast({ variant: 'destructive', title: 'Insufficient balance', description: 'Please add funds or pay with card.' });
      return;
    }

    setProcessing(true);
    setStep('processing');

    try {
      if (payMethod === 'wallet') {
        const { error: walletError } = await supabase
          .from('wallets')
          .update({ balance: walletBalance - sessionCost })
          .eq('user_id', user.id);
        if (walletError) throw walletError;

        await supabase.from('transactions').insert({
          user_id: user.id,
          type: 'consultation_fee' as const,
          amount: -sessionCost,
          description: `${typeConfig.label} with ${lawyer.full_name}`,
        });
      }

      const { data: consultation, error: consultationError } = await supabase
        .from('consultations')
        .insert({
          client_id: user.id,
          lawyer_id: lawyer.user_id,
          type: consultationType,
          status: 'pending' as const,
          total_amount: sessionCost,
        })
        .select()
        .single();

      if (consultationError) throw consultationError;

      // setStep('success');
      // toast({ title: '✅ Booking Confirmed!', description: `Your ${typeConfig.label.toLowerCase()} session is booked.` });

      // setTimeout(() => {
      //   onSuccess?.();
      //   onClose();
      //   navigate(`/consultation/${consultation.id}`);
      // }, 1200);
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
        // navigate(`/consultation/${consultation.id}`);
        navigate(`/client/consultation/${consultation.id}`);
      }, 1500);

    } catch (error) {
      console.error('Payment error:', error);
      setStep('review');
      toast({ variant: 'destructive', title: 'Payment Failed', description: 'Please try again.' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[380px] p-0 gap-0 overflow-hidden rounded-2xl">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : step === 'success' ? (
          <div className="py-12 text-center px-6">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-7 w-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold">Booking Confirmed!</h3>
            <p className="text-sm text-muted-foreground mt-1">Redirecting to consultation…</p>
          </div>
        ) : step === 'processing' ? (
          <div className="py-12 text-center px-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <h3 className="font-semibold">Processing Payment…</h3>
            <p className="text-xs text-muted-foreground mt-1">Securing your booking</p>
          </div>
        ) : (
          <>
            {/* Header with lawyer info */}
            <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-transparent p-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden ring-2 ring-background shadow">
                  {lawyer.avatar_url ? (
                    <img src={lawyer.avatar_url} alt={lawyer.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-primary">{lawyer.full_name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{lawyer.full_name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    <span className="text-xs text-muted-foreground">{lawyer.rating?.toFixed(1) || '0.0'}</span>
                    <span className="text-muted-foreground/30">•</span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${typeConfig.color}`}>
                      <TypeIcon className="h-3 w-3" />
                      {typeConfig.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 space-y-4">
              {/* Pricing breakdown */}
              <div className="rounded-xl border border-border bg-muted/20 divide-y divide-border text-sm">
                <div className="flex justify-between items-center px-3.5 py-2.5">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Min. duration
                  </span>
                  <span className="font-medium">{minimumMinutes} min</span>
                </div>
                <div className="flex justify-between items-center px-3.5 py-2.5">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Banknote className="h-3.5 w-3.5" /> Rate
                  </span>
                  <span className="font-medium">${pricePerMinute.toFixed(2)}/min</span>
                </div>
                <div className="flex justify-between items-center px-3.5 py-3 bg-primary/5">
                  <span className="font-semibold text-sm">Total</span>
                  <span className="text-xl font-bold text-primary">${sessionCost.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment method selector */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pay with</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPayMethod('wallet')}
                    className={`relative flex flex-col items-center gap-1 p-3 rounded-lg border text-xs font-medium transition-all ${payMethod === 'wallet'
                        ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/20'
                        : 'border-border hover:border-primary/30 text-muted-foreground'
                      }`}
                  >
                    <Wallet className="h-4 w-4" />
                    <span>Wallet</span>
                    <span className={`text-[10px] font-normal ${hasEnoughBalance ? 'text-emerald-600' : 'text-destructive'}`}>
                      ₹{walletBalance.toFixed(2)}
                    </span>
                  </button>
                  <button
                    onClick={() => setPayMethod('card')}
                    className={`relative flex flex-col items-center gap-1 p-3 rounded-lg border text-xs font-medium transition-all ${payMethod === 'card'
                        ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/20'
                        : 'border-border hover:border-primary/30 text-muted-foreground'
                      }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Card</span>
                    <span className="text-[10px] font-normal">Visa/MC</span>
                  </button>
                </div>
              </div>

              {/* Wallet insufficient warning */}
              {payMethod === 'wallet' && !hasEnoughBalance && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/5 border border-destructive/20 text-xs">
                  <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                  <span className="text-destructive">
                    Need ${(sessionCost - walletBalance).toFixed(2)} more.{' '}
                    <button onClick={() => navigate('/dashboard')} className="underline font-medium">Add funds</button>
                  </span>
                </div>
              )}

              {/* Card coming soon notice */}
              {payMethod === 'card' && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span className="text-amber-700">Card payments coming soon. Use wallet for now.</span>
                </div>
              )}

              {/* Security */}
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>Secure payment · Refund if no response</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={onClose} className="flex-1 h-9 text-xs">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handlePayAndBook}
                  disabled={processing || (payMethod === 'wallet' && !hasEnoughBalance) || payMethod === 'card'}
                  className="flex-1 h-9 text-xs gap-1.5"
                >
                  {processing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CreditCard className="h-3.5 w-3.5" />
                  )}
                  Pay ${sessionCost.toFixed(2)}
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
