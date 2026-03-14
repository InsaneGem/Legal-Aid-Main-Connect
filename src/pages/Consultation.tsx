// import { useState, useEffect, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// // import { MainLayout } from '@/components/layout/MainLayout';
// import { LawyerLayout } from '@/components/layout/LawyerLayout';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { supabase } from '@/integrations/supabase/client';
// import { useAuth } from '@/contexts/AuthContext';
// import { RatingDialog } from '@/components/consultation/RatingDialog';
// import {
//   Send, Phone, Video, Clock, ArrowLeft,
//   Loader2, PhoneOff, VideoOff, MessageSquare,
//   User, Shield, DollarSign, CheckCircle,
//   MoreVertical, Paperclip, Smile, Mic
// } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';
// import { VideoCall } from '@/components/consultation/VideoCall';
// import { AudioCall } from '@/components/consultation/AudioCall';

// interface Message {
//   id: string;
//   content: string;
//   sender_id: string;
//   created_at: string;
// }

// interface ConsultationDetails {
//   id: string;
//   type: string;
//   status: string;
//   client_id: string;
//   lawyer_id: string;
//   started_at: string | null;
//   created_at: string;
//   total_amount: number | null;
// }

// interface ParticipantInfo {
//   id: string;
//   full_name: string;
//   avatar_url: string | null;
//   role: 'client' | 'lawyer';
// }

// const Consultation = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const { toast } = useToast();
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);

//   const [consultation, setConsultation] = useState<ConsultationDetails | null>(null);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [sending, setSending] = useState(false);
//   const [elapsedTime, setElapsedTime] = useState(0);
//   const [isVideoCallActive, setIsVideoCallActive] = useState(false);
//   const [isAudioCallActive, setIsAudioCallActive] = useState(false);
//   const [participant, setParticipant] = useState<ParticipantInfo | null>(null);
//   const [isTyping, setIsTyping] = useState(false);
//   const [showRatingDialog, setShowRatingDialog] = useState(false);

//   const isLawyer = consultation?.lawyer_id === user?.id;

//   useEffect(() => {
//     if (id) {
//       fetchConsultation();
//       fetchMessages();
//       const unsubscribe = subscribeToMessages();
//       return unsubscribe;
//     }
//   }, [id]);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   useEffect(() => {
//     let interval: NodeJS.Timeout;
//     if (consultation?.status === 'active' && consultation.started_at) {
//       interval = setInterval(() => {
//         const start = new Date(consultation.started_at!).getTime();
//         const now = Date.now();
//         setElapsedTime(Math.floor((now - start) / 1000));
//       }, 1000);
//     }
//     return () => clearInterval(interval);
//   }, [consultation]);

//   const fetchConsultation = async () => {
//     const { data, error } = await supabase
//       .from('consultations')
//       .select('*')
//       .eq('id', id)
//       .single();

//     if (error) {
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: 'Consultation not found.',
//       });
//       navigate('/dashboard');
//     } else {
//       setConsultation(data);

//       // Fetch participant info
//       const otherUserId = data.client_id === user?.id ? data.lawyer_id : data.client_id;
//       const { data: profile } = await supabase
//         .from('profiles')
//         .select('id, full_name, avatar_url')
//         .eq('id', otherUserId)
//         .single();

//       if (profile) {
//         setParticipant({
//           ...profile,
//           role: data.client_id === user?.id ? 'lawyer' : 'client',
//         });
//       }
//     }
//     setLoading(false);
//   };

//   const fetchMessages = async () => {
//     const { data } = await supabase
//       .from('messages')
//       .select('*')
//       .eq('consultation_id', id)
//       .order('created_at', { ascending: true });

//     setMessages(data || []);
//   };

//   const subscribeToMessages = () => {
//     const channel = supabase
//       .channel(`messages:${id}`)
//       .on(
//         'postgres_changes',
//         {
//           event: 'INSERT',
//           schema: 'public',
//           table: 'messages',
//           filter: `consultation_id=eq.${id}`,
//         },
//         (payload) => {
//           setMessages(prev => [...prev, payload.new as Message]);
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   };

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const sendMessage = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newMessage.trim() || !user) return;

//     setSending(true);
//     const { error } = await supabase
//       .from('messages')
//       .insert({
//         consultation_id: id,
//         sender_id: user.id,
//         content: newMessage.trim(),
//       });

//     if (error) {
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: 'Failed to send message.',
//       });
//     } else {
//       setNewMessage('');
//       inputRef.current?.focus();
//     }
//     setSending(false);
//   };

//   const startConsultation = async () => {
//     const { error } = await supabase
//       .from('consultations')
//       .update({
//         status: 'active',
//         started_at: new Date().toISOString(),
//       })
//       .eq('id', id);

//     if (!error) {
//       setConsultation(prev => prev ? {
//         ...prev,
//         status: 'active',
//         started_at: new Date().toISOString(),
//       } : null);
//       toast({
//         title: '✅ Consultation started',
//         description: 'You can now communicate.',
//       });
//     }
//   };

//   const endConsultation = async () => {
//     const { error } = await supabase
//       .from('consultations')
//       .update({
//         status: 'completed',
//         ended_at: new Date().toISOString(),
//         duration_minutes: Math.ceil(elapsedTime / 60),
//       })
//       .eq('id', id);

//     if (!error) {
//       setConsultation(prev => prev ? { ...prev, status: 'completed' } : null);
//       toast({
//         title: 'Consultation ended',
//         description: 'Thank you for using LEGALMATE.',
//       });
//       // navigate(isLawyer ? '/lawyer/dashboard' : '/dashboard');
//       if (isLawyer) {
//         navigate('/lawyer/dashboard');
//       } else {
//         setShowRatingDialog(true);
//       }
//     }
//   };

//   const formatTime = (seconds: number) => {
//     const hrs = Math.floor(seconds / 3600);
//     const mins = Math.floor((seconds % 3600) / 60);
//     const secs = seconds % 60;
//     if (hrs > 0) {
//       return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//     }
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   const getTypeIcon = () => {
//     switch (consultation?.type) {
//       case 'video': return <Video className="h-4 w-4" />;
//       case 'audio': return <Phone className="h-4 w-4" />;
//       default: return <MessageSquare className="h-4 w-4" />;
//     }
//   };

//   const getStatusBadge = () => {
//     switch (consultation?.status) {
//       case 'active':
//         return (
//           <Badge className="gap-1.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
//             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
//             Live
//           </Badge>
//         );
//       case 'completed':
//         return (
//           <Badge variant="secondary" className="gap-1.5">
//             <CheckCircle className="h-3 w-3" />
//             Completed
//           </Badge>
//         );
//       default:
//         return (
//           <Badge variant="outline" className="gap-1.5">
//             <Clock className="h-3 w-3" />
//             Pending
//           </Badge>
//         );
//     }
//   };

//   if (loading) {
//     return (
//       // <MainLayout showFooter={false}>
//       <LawyerLayout>
//         <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/20">
//           <div className="text-center">
//             <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
//             <p className="mt-4 text-muted-foreground">Loading consultation...</p>
//           </div>
//         </div>
//         {/* </MainLayout> */}
//       </LawyerLayout>
//     );
//   }

//   return (
//     // <MainLayout showFooter={false}>
//     <LawyerLayout>
//       <div className="h-[calc(100vh-64px)] flex bg-gradient-to-br from-background via-background to-secondary/10">
//         {/* Sidebar - Participant Info */}
//         <div className="hidden lg:flex w-80 border-r border-border flex-col bg-card/50">
//           {/* Participant Card */}
//           <div className="p-6 border-b border-border">
//             <div className="flex items-center gap-4">
//               <Avatar className="h-16 w-16 border-2 border-primary/20">
//                 <AvatarImage src={participant?.avatar_url || undefined} />
//                 <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-lg font-semibold">
//                   {participant?.full_name?.charAt(0) || 'P'}
//                 </AvatarFallback>
//               </Avatar>
//               <div>
//                 <h3 className="font-semibold text-lg">{participant?.full_name}</h3>
//                 <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
//                   {participant?.role === 'lawyer' ? (
//                     <>
//                       <Shield className="h-3.5 w-3.5 text-blue-500" />
//                       <span>Legal Advisor</span>
//                     </>
//                   ) : (
//                     <>
//                       <User className="h-3.5 w-3.5" />
//                       <span>Client</span>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Session Info */}
//           <div className="p-6 space-y-4">
//             <div className="flex items-center justify-between">
//               <span className="text-sm text-muted-foreground">Session Type</span>
//               <Badge variant="outline" className="capitalize gap-1.5">
//                 {getTypeIcon()}
//                 {consultation?.type}
//               </Badge>
//             </div>

//             <div className="flex items-center justify-between">
//               <span className="text-sm text-muted-foreground">Status</span>
//               {getStatusBadge()}
//             </div>

//             {consultation?.status === 'active' && (
//               <div className="flex items-center justify-between">
//                 <span className="text-sm text-muted-foreground">Duration</span>
//                 <span className="font-mono text-lg font-semibold text-primary">
//                   {formatTime(elapsedTime)}
//                 </span>
//               </div>
//             )}

//             {consultation?.total_amount && (
//               <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg">
//                 <div className="flex items-center gap-2">
//                   <DollarSign className="h-4 w-4 text-emerald-600" />
//                   <span className="text-sm font-medium">Session Fee</span>
//                 </div>
//                 <span className="font-semibold text-emerald-600">
//                   ₹{consultation.total_amount.toFixed(2)}
//                 </span>
//               </div>
//             )}
//           </div>

//           {/* Quick Actions */}
//           <div className="p-6 border-t border-border mt-auto">
//             {consultation?.status === 'pending' && (
//               <Button onClick={startConsultation} className="w-full gap-2 mb-3">
//                 <CheckCircle className="h-4 w-4" />
//                 Start Consultation
//               </Button>
//             )}

//             {consultation?.status === 'active' && (
//               <div className="space-y-2">
//                 {(consultation.type === 'audio' || consultation.type === 'video') && (
//                   <Button
//                     variant="outline"
//                     className="w-full gap-2"
//                     onClick={() => setIsAudioCallActive(true)}
//                   >
//                     <Phone className="h-4 w-4" />
//                     Start Audio Call
//                   </Button>
//                 )}
//                 {consultation.type === 'video' && (
//                   <Button
//                     variant="outline"
//                     className="w-full gap-2"
//                     onClick={() => setIsVideoCallActive(true)}
//                   >
//                     <Video className="h-4 w-4" />
//                     Start Video Call
//                   </Button>
//                 )}
//                 <Button
//                   variant="destructive"
//                   className="w-full gap-2"
//                   onClick={endConsultation}
//                 >
//                   End Consultation
//                 </Button>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Main Chat Area */}
//         <div className="flex-1 flex flex-col">
//           {/* Header */}
//           <div className="h-16 border-b border-border bg-card/80 backdrop-blur-sm px-4 flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="lg:hidden">
//                 <ArrowLeft className="h-5 w-5" />
//               </Button>

//               {/* Mobile: Show participant info */}
//               <div className="flex items-center gap-3 lg:hidden">
//                 <Avatar className="h-10 w-10">
//                   <AvatarImage src={participant?.avatar_url || undefined} />
//                   <AvatarFallback>{participant?.full_name?.charAt(0)}</AvatarFallback>
//                 </Avatar>
//                 <div>
//                   <h3 className="font-semibold">{participant?.full_name}</h3>
//                   <div className="flex items-center gap-2">
//                     {getStatusBadge()}
//                     {consultation?.status === 'active' && (
//                       <span className="text-xs text-muted-foreground font-mono">
//                         {formatTime(elapsedTime)}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Desktop title */}
//               <div className="hidden lg:block">
//                 <h2 className="font-semibold">
//                   {consultation?.type?.charAt(0).toUpperCase()}{consultation?.type?.slice(1)} Consultation
//                 </h2>
//                 <p className="text-sm text-muted-foreground">
//                   with {participant?.full_name}
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               {consultation?.status === 'active' && (
//                 <>
//                   {(consultation.type === 'audio' || consultation.type === 'video') && (
//                     <Button
//                       variant="outline"
//                       size="icon"
//                       onClick={() => setIsAudioCallActive(true)}
//                       className="hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30"
//                     >
//                       <Phone className="h-4 w-4" />
//                     </Button>
//                   )}
//                   {consultation.type === 'video' && (
//                     <Button
//                       variant="outline"
//                       size="icon"
//                       onClick={() => setIsVideoCallActive(true)}
//                       className="hover:bg-purple-500/10 hover:text-purple-600 hover:border-purple-500/30"
//                     >
//                       <Video className="h-4 w-4" />
//                     </Button>
//                   )}
//                   <Button variant="ghost" size="icon">
//                     <MoreVertical className="h-4 w-4" />
//                   </Button>
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Messages Area */}
//           <div className="flex-1 overflow-y-auto p-4 lg:p-6">
//             <div className="max-w-3xl mx-auto space-y-4">
//               {/* Session Start Card */}
//               {consultation?.status !== 'pending' && (
//                 <div className="flex justify-center my-6">
//                   <div className="bg-secondary/50 border border-border rounded-full px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
//                     <Shield className="h-4 w-4" />
//                     <span>This conversation is end-to-end encrypted</span>
//                   </div>
//                 </div>
//               )}

//               {messages.length === 0 && consultation?.status === 'pending' && (
//                 <div className="text-center py-20">
//                   <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
//                     <MessageSquare className="h-10 w-10 text-primary" />
//                   </div>
//                   <h3 className="text-xl font-semibold mb-2">Waiting to Start</h3>
//                   <p className="text-muted-foreground max-w-sm mx-auto">
//                     {isLawyer
//                       ? 'Click "Start Consultation" to begin the session with your client.'
//                       : 'Your lawyer will start the consultation shortly.'}
//                   </p>
//                   {isLawyer && (
//                     <Button onClick={startConsultation} className="mt-6 gap-2">
//                       <CheckCircle className="h-4 w-4" />
//                       Start Consultation
//                     </Button>
//                   )}
//                 </div>
//               )}

//               {messages.length === 0 && consultation?.status === 'active' && (
//                 <div className="text-center py-16">
//                   <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
//                     <CheckCircle className="h-8 w-8 text-emerald-600" />
//                   </div>
//                   <h3 className="text-lg font-semibold mb-2">Session Started</h3>
//                   <p className="text-muted-foreground">Start the conversation by sending a messageeeeeeeeeeeeeeeee.</p>
//                 </div>
//               )}

//               {messages.map((message, index) => {
//                 const isOwn = message.sender_id === user?.id;
//                 const showAvatar = index === 0 || messages[index - 1]?.sender_id !== message.sender_id;

//                 return (
//                   <div
//                     key={message.id}
//                     className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
//                   >
//                     {showAvatar ? (
//                       <Avatar className="h-8 w-8 flex-shrink-0">
//                         <AvatarImage src={isOwn ? user?.user_metadata?.avatar_url : participant?.avatar_url || undefined} />
//                         <AvatarFallback className="text-xs">
//                           {isOwn ? user?.email?.charAt(0).toUpperCase() : participant?.full_name?.charAt(0)}
//                         </AvatarFallback>
//                       </Avatar>
//                     ) : (
//                       <div className="w-8" />
//                     )}

//                     <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
//                       <div className={`px-4 py-3 rounded-2xl ${isOwn
//                         ? 'bg-primary text-primary-foreground rounded-br-md'
//                         : 'bg-card border border-border rounded-bl-md'
//                         }`}>
//                         <p className="text-sm leading-relaxed">{message.content}</p>
//                       </div>
//                       <p className={`text-xs text-muted-foreground mt-1 px-1 ${isOwn ? 'text-right' : ''}`}>
//                         {new Date(message.created_at).toLocaleTimeString([], {
//                           hour: '2-digit',
//                           minute: '2-digit'
//                         })}
//                       </p>
//                     </div>
//                   </div>
//                 );
//               })}

//               <div ref={messagesEndRef} />
//             </div>
//           </div>

//           {/* Message Input */}
//           {consultation?.status === 'active' && (
//             <div className="p-4 border-t border-border bg-card/80 backdrop-blur-sm">
//               <form onSubmit={sendMessage} className="max-w-3xl mx-auto">
//                 <div className="flex items-center gap-2 bg-secondary/50 rounded-xl p-2">
//                   <Button type="button" variant="ghost" size="icon" className="flex-shrink-0">
//                     <Paperclip className="h-5 w-5 text-muted-foreground" />
//                   </Button>

//                   <Input
//                     ref={inputRef}
//                     placeholder="Type your message..."
//                     value={newMessage}
//                     onChange={(e) => setNewMessage(e.target.value)}
//                     className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-base"
//                     disabled={sending}
//                   />

//                   <Button type="button" variant="ghost" size="icon" className="flex-shrink-0">
//                     <Smile className="h-5 w-5 text-muted-foreground" />
//                   </Button>

//                   <Button
//                     type="submit"
//                     size="icon"
//                     disabled={sending || !newMessage.trim()}
//                     className="flex-shrink-0 rounded-lg"
//                   >
//                     {sending ? (
//                       <Loader2 className="h-4 w-4 animate-spin" />
//                     ) : (
//                       <Send className="h-4 w-4" />
//                     )}
//                   </Button>
//                 </div>
//               </form>
//             </div>
//           )}

//           {consultation?.status === 'completed' && (
//             <div className="p-6 border-t border-border bg-secondary/30 text-center">
//               <p className="text-muted-foreground mb-2">This consultation has ended.</p>
//               <Button variant="outline" onClick={() => navigate(isLawyer ? '/lawyer/dashboard' : '/dashboard')}>
//                 Return to Dashboard
//               </Button>
//             </div>
//           )}
//         </div>

//         {/* Video Call Component */}
//         <VideoCall
//           isActive={isVideoCallActive}
//           onEnd={() => setIsVideoCallActive(false)}
//           participantName={participant?.full_name || 'Participant'}
//           consultationId={id || ''}
//         />

//         {/* Audio Call Component */}
//         <AudioCall
//           isActive={isAudioCallActive}
//           onEnd={() => setIsAudioCallActive(false)}
//           participantName={participant?.full_name || 'Participant'}
//           consultationId={id || ''}
//         />
//         {consultation && user && !isLawyer && (
//           <RatingDialog
//             open={showRatingDialog}
//             onOpenChange={setShowRatingDialog}
//             consultationId={consultation.id}
//             lawyerId={consultation.lawyer_id}
//             clientId={user.id}
//             lawyerName={participant?.full_name || 'Lawyer'}
//             lawyerAvatar={participant?.avatar_url}
//           />
//         )}
//       </div>
//       {/* </MainLayout> */}
//     </LawyerLayout>
//   );
// };

// export default Consultation;


// ****************************************
// import { useState, useEffect, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { LawyerLayout } from '@/components/layout/LawyerLayout';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { supabase } from '@/integrations/supabase/client';
// import { useAuth } from '@/contexts/AuthContext';
// import { RatingDialog } from '@/components/consultation/RatingDialog';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// import {
//   Send, Phone, Video, Clock, ArrowLeft,
//   Loader2, MessageSquare, User, Shield,
//   DollarSign, CheckCircle, MoreVertical, Timer, XCircle,
//   Paperclip, Smile
// } from 'lucide-react';

// import { useToast } from '@/hooks/use-toast';
// import { VideoCall } from '@/components/consultation/VideoCall';
// import { AudioCall } from '@/components/consultation/AudioCall';

// interface Message {
//   id: string
//   content: string
//   sender_id: string
//   created_at: string
// }

// interface ConsultationDetails {
//   id: string
//   type: string
//   status: string
//   client_id: string
//   lawyer_id: string
//   started_at: string | null
//   created_at: string
//   total_amount: number | null
//   payment_status?: string
// }

// interface ParticipantInfo {
//   id: string
//   full_name: string
//   avatar_url: string | null
//   role: 'client' | 'lawyer'
// }
// const SESSION_DURATION_SECONDS = 5 * 60; // 5 minutes

// const Consultation = () => {

//   const { id } = useParams()
//   const navigate = useNavigate()
//   const { user } = useAuth()
//   const { toast } = useToast()

//   const messagesEndRef = useRef<HTMLDivElement>(null)
//   const inputRef = useRef<HTMLInputElement>(null)

//   const [consultation, setConsultation] = useState<ConsultationDetails | null>(null)
//   const [messages, setMessages] = useState<Message[]>([])
//   const [newMessage, setNewMessage] = useState('')
//   const [loading, setLoading] = useState(true)
//   const [sending, setSending] = useState(false)
//   const [elapsedTime, setElapsedTime] = useState(0)


//   const [isVideoCallActive, setIsVideoCallActive] = useState(false)
//   const [isAudioCallActive, setIsAudioCallActive] = useState(false)

//   const [participant, setParticipant] = useState<ParticipantInfo | null>(null)

//   const [showRatingDialog, setShowRatingDialog] = useState(false)

//   const [paymentCountdown, setPaymentCountdown] = useState(120)

//   const isLawyer = consultation?.lawyer_id === user?.id
//   const isPaid = consultation?.payment_status === 'paid'
//   const isLocked = consultation?.status === 'active' && !isPaid

//   useEffect(() => {

//     if (id) {
//       fetchConsultation()
//       fetchMessages()
//       const unsubscribe = subscribeToMessages()
//       return unsubscribe
//     }

//   }, [id])

//   useEffect(() => {
//     scrollToBottom()
//   }, [messages])

//   useEffect(() => {

//     let interval: NodeJS.Timeout

//     if (consultation?.status === 'active' && consultation.started_at) {

//       interval = setInterval(() => {

//         const start = new Date(consultation.started_at!).getTime()
//         const now = Date.now()

//         setElapsedTime(Math.floor((now - start) / 1000))

//       }, 1000)

//     }

//     return () => clearInterval(interval)

//   }, [consultation])

//   useEffect(() => {

//     let timer: NodeJS.Timeout

//     if (consultation?.status === 'active' && !isPaid && paymentCountdown > 0) {

//       timer = setInterval(() => {

//         setPaymentCountdown(prev => prev - 1)

//       }, 1000)

//     }

//     if (paymentCountdown === 0 && consultation?.status === 'active' && !isPaid) {

//       handlePaymentTimeout()

//     }

//     return () => clearInterval(timer)

//   }, [paymentCountdown, consultation])

//   const handlePaymentTimeout = async () => {

//     await supabase
//       .from('consultations')
//       .update({ status: 'expired' })
//       .eq('id', id)

//     toast({
//       title: 'Payment timeout',
//       description: 'Client did not complete payment'
//     })

//     if (isLawyer) {
//       navigate('/lawyer/dashboard')
//     }

//   }

//   const fetchConsultation = async () => {

//     const { data, error } = await supabase
//       .from('consultations')
//       .select('*')
//       .eq('id', id)
//       .single()

//     if (error) {

//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: 'Consultation not found'
//       })

//       navigate('/dashboard')

//     } else {

//       setConsultation(data)

//       const otherUserId = data.client_id === user?.id ? data.lawyer_id : data.client_id

//       const { data: profile } = await supabase
//         .from('profiles')
//         .select('id,full_name,avatar_url')
//         .eq('id', otherUserId)
//         .single()

//       if (profile) {

//         setParticipant({
//           ...profile,
//           role: data.client_id === user?.id ? 'lawyer' : 'client'
//         })

//       }

//     }

//     setLoading(false)

//   }

//   const fetchMessages = async () => {

//     const { data } = await supabase
//       .from('messages')
//       .select('*')
//       .eq('consultation_id', id)
//       .order('created_at', { ascending: true })

//     setMessages(data || [])

//   }

//   const subscribeToMessages = () => {


//     const channel = supabase
//       .channel(`messages:${id}`)
//       .on(
//         'postgres_changes',
//         {
//           event: 'INSERT',
//           schema: 'public',
//           table: 'messages',
//           filter: `consultation_id=eq.${id}`
//         },
//         (payload) => {
//           setMessages(prev => [...prev, payload.new as Message])
//         }
//       )
//       .subscribe()

//     return () => {

//       supabase.removeChannel(channel)

//     }

//   }

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }

//   const sendMessage = async (e: React.FormEvent) => {

//     e.preventDefault()

//     if (!newMessage.trim() || !user || isLocked) return

//     setSending(true)

//     const { error } = await supabase
//       .from('messages')
//       .insert({
//         consultation_id: id,
//         sender_id: user.id,
//         content: newMessage.trim()
//       })

//     if (error) {

//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: 'Failed to send message.'
//       })

//     } else {

//       setNewMessage('')
//       inputRef.current?.focus()

//     }

//     setSending(false)

//   }

//   const startConsultation = async () => {

//     const { error } = await supabase
//       .from('consultations')
//       .update({
//         status: 'active',
//         started_at: new Date().toISOString()
//       })
//       .eq('id', id)

//     if (!error) {

//       setConsultation(prev => prev ? {
//         ...prev,
//         status: 'active',
//         started_at: new Date().toISOString()
//       } : null)

//       toast({
//         title: 'Consultation started',
//         description: 'Waiting for client payment'
//       })

//     }

//   }

//   const endConsultation = async () => {

//     const { error } = await supabase
//       .from('consultations')
//       .update({
//         status: 'completed'
//       })
//       .eq('id', id)

//     if (!error) {

//       setConsultation(prev => prev ? { ...prev, status: 'completed' } : null)

//       toast({
//         title: 'Consultation ended'
//       })

//       if (isLawyer) {
//         navigate('/lawyer/dashboard')
//       } else {
//         setShowRatingDialog(true)
//       }

//     }

//   }

//   const formatTime = (seconds: number) => {

//     const mins = Math.floor(seconds / 60)
//     const secs = seconds % 60

//     return `${mins}:${secs.toString().padStart(2, '0')}`

//   }

//   if (loading) {

//     return (

//       <LawyerLayout>

//         <div className="flex items-center justify-center min-h-screen">

//           <Loader2 className="h-10 w-10 animate-spin" />

//         </div>

//       </LawyerLayout>

//     )

//   }

//   return (

//     <LawyerLayout>

//       <div className="h-[calc(100vh-64px)] flex">

//         <div className="flex-1 flex flex-col">

//           {/* CHAT HEADER COUNTDOWN */}

//           {isLocked && (

//             <div className="border-b p-3 flex justify-center text-sm bg-amber-50">

//               Client payment window:

//               <span className="font-mono ml-2 font-semibold">

//                 {formatTime(paymentCountdown)}

//               </span>

//             </div>

//           )}

//           {/* MESSAGES AREA */}

//           <div className="flex-1 overflow-y-auto p-6">

//             {isLocked && (

//               <div className="flex justify-center py-20">

//                 <div className="border rounded-xl p-6 bg-card text-center max-w-md">

//                   <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">

//                     <Clock className="h-6 w-6 text-amber-600" />

//                   </div>

//                   <h3 className="font-semibold text-lg mb-2">

//                     Waiting for client payment

//                   </h3>

//                   <p className="text-sm text-muted-foreground mb-4">

//                     Chat will unlock automatically once the client completes payment.

//                   </p>

//                   <div className="font-mono text-lg">

//                     {formatTime(paymentCountdown)}

//                   </div>

//                 </div>

//               </div>

//             )}

//             <div className="max-w-3xl mx-auto space-y-4">

//               {messages.map((message) => {

//                 const isOwn = message.sender_id === user?.id

//                 return (

//                   <div key={message.id} className={`flex ${isOwn ? 'justify-end' : ''}`}>

//                     <div className={`px-4 py-2 rounded-lg ${isOwn ? 'bg-primary text-white' : 'bg-secondary'}`}>

//                       {message.content}

//                     </div>

//                   </div>

//                 )

//               })}

//               <div ref={messagesEndRef} />

//             </div>

//           </div>

//           {/* INPUT */}

//           {consultation?.status === 'active' && !isLocked && (

//             <div className="border-t p-4">

//               <form onSubmit={sendMessage} className="flex gap-2">

//                 <Input
//                   ref={inputRef}
//                   value={newMessage}
//                   onChange={(e) => setNewMessage(e.target.value)}
//                   placeholder="Type your message..."
//                 />

//                 <Button type="submit" disabled={sending}>

//                   {sending ? <Loader2 className="animate-spin" /> : <Send />}

//                 </Button>

//               </form>

//             </div>

//           )}

//         </div>

//       </div>

//       <VideoCall
//         isActive={isVideoCallActive}
//         onEnd={() => setIsVideoCallActive(false)}
//         participantName={participant?.full_name || 'Participant'}
//         consultationId={id || ''}
//       />

//       <AudioCall
//         isActive={isAudioCallActive}
//         onEnd={() => setIsAudioCallActive(false)}
//         participantName={participant?.full_name || 'Participant'}
//         consultationId={id || ''}
//       />

//       {consultation && user && !isLawyer && (

//         <RatingDialog
//           open={showRatingDialog}
//           onOpenChange={setShowRatingDialog}
//           consultationId={consultation.id}
//           lawyerId={consultation.lawyer_id}
//           clientId={user.id}
//           lawyerName={participant?.full_name || 'Lawyer'}
//           lawyerAvatar={participant?.avatar_url}
//         />

//       )}

//     </LawyerLayout>

//   )

// }

// export default Consultation



// *********************


import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Send, Phone, Video, Clock, ArrowLeft,
  Loader2, PhoneOff, VideoOff, MessageSquare,
  User, Shield, DollarSign, CheckCircle,
  MoreVertical, Paperclip, Smile, Mic, Lock, Timer, XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VideoCall } from '@/components/consultation/VideoCall';
import { AudioCall } from '@/components/consultation/AudioCall';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

interface ConsultationDetails {
  id: string;
  type: string;
  status: string;
  client_id: string;
  lawyer_id: string;
  started_at: string | null;
  created_at: string;
  total_amount: number | null;
  payment_status: string | null;
}

interface ParticipantInfo {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: 'client' | 'lawyer';
}

const SESSION_DURATION_SECONDS = 5 * 60; // 5 minutes

const Consultation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [consultation, setConsultation] = useState<ConsultationDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [remainingTime, setRemainingTime] = useState(SESSION_DURATION_SECONDS);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isAudioCallActive, setIsAudioCallActive] = useState(false);
  const [participant, setParticipant] = useState<ParticipantInfo | null>(null);
  const [showCancelledDialog, setShowCancelledDialog] = useState(false);

  const isLawyer = consultation?.lawyer_id === user?.id;
  const isClient = consultation?.client_id === user?.id;
  const isPaid = consultation?.payment_status === 'paid';
  const isActive = consultation?.status === 'active';
  const isUnlocked = isActive && isPaid;
  const isWaitingForPayment = isActive && !isPaid;

  useEffect(() => {
    if (id) {
      fetchConsultation();
      fetchMessages();
      const unsubMessages = subscribeToMessages();
      const unsubConsultation = subscribeToConsultation();
      return () => { unsubMessages(); unsubConsultation(); };
    }
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 5-minute countdown when consultation is unlocked
  useEffect(() => {
    if (!isUnlocked || !consultation?.started_at) return;

    const interval = setInterval(() => {
      const start = new Date(consultation.started_at!).getTime();
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const remaining = Math.max(0, SESSION_DURATION_SECONDS - elapsed);
      setRemainingTime(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        // Auto-complete (only client triggers the DB update to avoid double-write)
        if (isClient) {
          autoEndConsultation();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [consultation, isUnlocked, isClient]);

  // Auto-start video/audio if type is video/audio and unlocked
  useEffect(() => {
    if (!isUnlocked || !consultation) return;
    if (consultation.type === 'video' && !isVideoCallActive) {
      setIsVideoCallActive(true);
    } else if (consultation.type === 'audio' && !isAudioCallActive) {
      setIsAudioCallActive(true);
    }
  }, [isUnlocked, consultation?.type]);

  const fetchConsultation = async () => {
    const { data, error } = await supabase
      .from('consultations')
      .select('id, type, status, client_id, lawyer_id, started_at, created_at, total_amount, payment_status')
      .eq('id', id)
      .single();

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Consultation not found.' });
      navigate('/dashboard');
    } else {
      setConsultation(data);
      const otherUserId = data.client_id === user?.id ? data.lawyer_id : data.client_id;
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', otherUserId)
        .single();

      if (profile) {
        setParticipant({
          ...profile,
          role: data.client_id === user?.id ? 'lawyer' : 'client',
        });
      }
    }
    setLoading(false);
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('consultation_id', id)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages:${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `consultation_id=eq.${id}` },
        (payload) => { setMessages(prev => [...prev, payload.new as Message]); }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  };

  const subscribeToConsultation = () => {
    const channel = supabase
      .channel(`consultation-status:${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'consultations', filter: `id=eq.${id}` },
        (payload) => {
          const updated = payload.new as any;
          setConsultation(prev => prev ? { ...prev, ...updated } : null);

          if (updated.payment_status === 'paid' && updated.status === 'active') {
            toast({ title: '🎉 Consultation Unlocked!', description: 'You can now communicate freely.' });
          }
          if (updated.status === 'completed') {
            toast({ title: 'Consultation Ended', description: 'This session has been completed.' });
          }
          // if (updated.status === 'cancelled') {
          //   if (isLawyer || consultation?.lawyer_id === user?.id) {
          //     setShowCancelledDialog(true);
          //   }
          // }
          if (updated.status === 'cancelled') {

            // Show cancel popup
            setShowCancelledDialog(true);

            toast({
              title: "Client cancelled the booking",
              description: "Redirecting to dashboard..."
            });

            // Auto redirect after 2 seconds
            setTimeout(() => {
              navigate('/lawyer/dashboard');
            }, 2000);

          }
        }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !isUnlocked) return;

    setSending(true);
    const { error } = await supabase
      .from('messages')
      .insert({ consultation_id: id, sender_id: user.id, content: newMessage.trim() });

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to send message.' });
    } else {
      setNewMessage('');
      inputRef.current?.focus();
    }
    setSending(false);
  };

  const endConsultation = async () => {
    if (!isClient) return;
    const elapsed = consultation?.started_at
      ? Math.ceil((Date.now() - new Date(consultation.started_at).getTime()) / 60000)
      : 0;
    const { error } = await supabase
      .from('consultations')
      .update({ status: 'completed', ended_at: new Date().toISOString(), duration_minutes: elapsed })
      .eq('id', id);

    if (!error) {
      toast({ title: 'Consultation ended', description: 'Thank you for using LEGALMATE.' });
      navigate('/dashboard');
    }
  };

  const autoEndConsultation = async () => {
    const elapsed = consultation?.started_at
      ? Math.ceil((Date.now() - new Date(consultation.started_at).getTime()) / 60000)
      : SESSION_DURATION_SECONDS / 60;
    await supabase
      .from('consultations')
      .update({ status: 'completed', ended_at: new Date().toISOString(), duration_minutes: elapsed })
      .eq('id', id);
    toast({ title: '⏱️ Time\'s Up!', description: 'The consultation session has ended.' });
    navigate(isLawyer ? '/lawyer/dashboard' : '/dashboard');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeIcon = () => {
    switch (consultation?.type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Phone className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusBadge = () => {
    if (isWaitingForPayment) {
      return (
        <Badge variant="outline" className="gap-1.5 bg-amber-500/10 text-amber-600 border-amber-500/30">
          <Lock className="h-3 w-3" />
          Waiting for Payment
        </Badge>
      );
    }
    switch (consultation?.status) {
      case 'active':
        return (
          <Badge className="gap-1.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="secondary" className="gap-1.5">
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1.5">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
    }
  };

  const countdownColor = remainingTime <= 60 ? 'text-red-500' : remainingTime <= 120 ? 'text-amber-500' : 'text-primary';

  if (loading) {
    return (
      <MainLayout showFooter={false}>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/20">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Loading consultation...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showFooter={false}>
      {/* Cancelled Dialog for Lawyer */}
      <Dialog open={showCancelledDialog} onOpenChange={setShowCancelledDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Booking Cancelled
            </DialogTitle>
            <DialogDescription>
              The client has cancelled this consultation booking.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-muted-foreground mb-4">You will be redirected to your dashboard.</p>
            {/* <Button onClick={() => { setShowCancelledDialog(false); navigate('/lawyer/dashboard'); }}> */}
            <Button onClick={() => navigate('/lawyer/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="h-[calc(100vh-64px)] flex bg-gradient-to-br from-background via-background to-secondary/10">
        {/* Sidebar */}
        <div className="hidden lg:flex w-80 border-r border-border flex-col bg-card/50">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarImage src={participant?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-lg font-semibold">
                  {participant?.full_name?.charAt(0) || 'P'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{participant?.full_name}</h3>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                  {participant?.role === 'lawyer' ? (
                    <><Shield className="h-3.5 w-3.5 text-blue-500" /><span>Legal Advisor</span></>
                  ) : (
                    <><User className="h-3.5 w-3.5" /><span>Client</span></>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Session Type</span>
              <Badge variant="outline" className="capitalize gap-1.5">
                {getTypeIcon()}
                {consultation?.type}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              {getStatusBadge()}
            </div>
            {isUnlocked && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Time Left</span>
                <span className={`font-mono text-lg font-semibold ${countdownColor}`}>
                  <Timer className="h-4 w-4 inline mr-1" />
                  {formatTime(remainingTime)}
                </span>
              </div>
            )}
            {consultation?.total_amount && (
              <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium">Session Fee</span>
                </div>
                <span className="font-semibold text-emerald-600">₹{consultation.total_amount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-border mt-auto">
            {isUnlocked && (
              <div className="space-y-2">
                {consultation?.type === 'chat' && isClient && (
                  <Button variant="destructive" className="w-full gap-2" onClick={endConsultation}>
                    End Consultation
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="h-16 border-b border-border bg-card/80 backdrop-blur-sm px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="lg:hidden">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3 lg:hidden">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={participant?.avatar_url || undefined} />
                  <AvatarFallback>{participant?.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{participant?.full_name}</h3>
                  <div className="flex items-center gap-2">
                    {getStatusBadge()}
                    {isUnlocked && (
                      <span className={`text-xs font-mono font-semibold ${countdownColor}`}>{formatTime(remainingTime)}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <h2 className="font-semibold">
                  {consultation?.type?.charAt(0).toUpperCase()}{consultation?.type?.slice(1)} Consultation
                </h2>
                <p className="text-sm text-muted-foreground">with {participant?.full_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isUnlocked && (
                <>
                  {isUnlocked && (
                    <span className={`text-sm font-mono font-bold hidden lg:flex items-center gap-1 ${countdownColor}`}>
                      <Timer className="h-4 w-4" />
                      {formatTime(remainingTime)}
                    </span>
                  )}
                  {isClient && (
                    <Button variant="destructive" size="sm" onClick={endConsultation} className="gap-1">
                      End
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Locked state - waiting for payment */}
              {isWaitingForPayment && (
                <div className="text-center py-20">
                  <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                    <Lock className="h-10 w-10 text-amber-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Consultation Locked</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    {isLawyer
                      ? 'Waiting for the client to complete payment. The session will unlock automatically once payment is confirmed.'
                      : 'Please complete payment from your dashboard to unlock this consultation.'}
                  </p>
                  {isLawyer && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Waiting for payment...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Encrypted notice */}
              {isUnlocked && (
                <div className="flex justify-center my-6">
                  <div className="bg-secondary/50 border border-border rounded-full px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>This conversation is end-to-end encrypted</span>
                  </div>
                </div>
              )}

              {messages.length === 0 && isUnlocked && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Session Started</h3>
                  <p className="text-muted-foreground">Start the conversation by sending a message.</p>
                </div>
              )}

              {messages.map((message, index) => {
                const isOwn = message.sender_id === user?.id;
                const showAvatar = index === 0 || messages[index - 1]?.sender_id !== message.sender_id;

                return (
                  <div key={message.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    {showAvatar ? (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={isOwn ? user?.user_metadata?.avatar_url : participant?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {isOwn ? user?.email?.charAt(0).toUpperCase() : participant?.full_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-8" />
                    )}
                    <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-3 rounded-2xl ${isOwn
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-card border border-border rounded-bl-md'
                        }`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                      <p className={`text-xs text-muted-foreground mt-1 px-1 ${isOwn ? 'text-right' : ''}`}>
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input - only when unlocked */}
          {isUnlocked && (
            <div className="p-4 border-t border-border bg-card/80 backdrop-blur-sm">
              <form onSubmit={sendMessage} className="max-w-3xl mx-auto">
                <div className="flex items-center gap-2 bg-secondary/50 rounded-xl p-2">
                  <Button type="button" variant="ghost" size="icon" className="flex-shrink-0">
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <Input
                    ref={inputRef}
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-base"
                    disabled={sending}
                  />
                  <Button type="button" variant="ghost" size="icon" className="flex-shrink-0">
                    <Smile className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <Button type="submit" size="icon" disabled={sending || !newMessage.trim()} className="flex-shrink-0 rounded-lg">
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Locked input placeholder */}
          {isWaitingForPayment && (
            <div className="p-4 border-t border-border bg-secondary/30 text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span className="text-sm">Chat locked until payment is completed</span>
              </div>
            </div>
          )}

          {consultation?.status === 'completed' && (
            <div className="p-6 border-t border-border bg-secondary/30 text-center">
              <p className="text-muted-foreground mb-2">This consultation has ended.</p>
              <Button variant="outline" onClick={() => navigate(isLawyer ? '/lawyer/dashboard' : '/dashboard')}>
                Return to Dashboard
              </Button>
            </div>
          )}
        </div>

        <VideoCall
          isActive={isVideoCallActive}
          onEnd={() => setIsVideoCallActive(false)}
          participantName={participant?.full_name || 'Participant'}
          consultationId={id || ''}
        />
        <AudioCall
          isActive={isAudioCallActive}
          onEnd={() => setIsAudioCallActive(false)}
          participantName={participant?.full_name || 'Participant'}
          consultationId={id || ''}
        />
      </div>
    </MainLayout>
  );
};

export default Consultation;
