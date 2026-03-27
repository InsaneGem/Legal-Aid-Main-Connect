// import { useState, useEffect, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { MainLayout } from '@/components/layout/MainLayout';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { supabase } from '@/integrations/supabase/client';
// import { useAuth } from '@/contexts/AuthContext';
// import { RatingDialog } from '@/components/consultation/RatingDialog';


// import {
//   Send, Phone, Video, Clock, ArrowLeft,
//   Loader2, MessageSquare, Shield, DollarSign,
//   CheckCircle, Paperclip, Smile, Star,
//   FileText, Calendar, User, Mic, Lock
// } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';
// import { VideoCall } from '@/components/consultation/VideoCall';
// import { AudioCall } from '@/components/consultation/AudioCall';
// import { ClientLayout } from '@/components/layout/ClientLayout';
// import { calculateAge } from '@/lib/ageUtils';

// interface Message {
//   id: string;
//   content: string;
//   sender_id: string;
//   created_at: string;
//   date_of_birth?: string | null;
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
//   duration_minutes: number | null;
//   payment_status: string | null;
// }
// interface LawyerInfo {
//   id: string;
//   full_name: string;
//   avatar_url: string | null;
//   specializations?: string[];
//   rating?: number;
//   experience_years?: number;
// }
// const ClientConsultation = () => {
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
//   const [lawyer, setLawyer] = useState<LawyerInfo | null>(null);
//   const [showRatingDialog, setShowRatingDialog] = useState(false);


//   // Access control: only client can access
//   useEffect(() => {
//     if (!user) {
//       navigate('/login');
//       return;
//     }
//   }, [user]);
//   useEffect(() => {
//     if (id && user) {
//       fetchConsultation();
//       fetchMessages();
//       const unsubscribe = subscribeToMessages();
//       return unsubscribe;
//     }
//   }, [id, user]);
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);
//   useEffect(() => {
//     let interval: NodeJS.Timeout;
//     if (consultation?.status === 'active' && consultation.started_at) {
//       interval = setInterval(() => {
//         const start = new Date(consultation.started_at!).getTime();
//         setElapsedTime(Math.floor((Date.now() - start) / 1000));
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
//     if (error || !data) {
//       toast({ variant: 'destructive', title: 'Error', description: 'Consultation not found.' });
//       navigate('/dashboard');
//       return;
//     }
//     // Verify client access
//     if (data.client_id !== user?.id) {
//       toast({ variant: 'destructive', title: 'Access Denied', description: 'You do not have access to this consultation.' });
//       navigate('/dashboard');
//       return;
//     }
//     setConsultation(data);

//     // If completed, check if already rated
//     if (data.status === 'completed') {
//       const { data: existingReview } = await supabase
//         .from('reviews')
//         .select('id')
//         .eq('consultation_id', data.id)
//         .eq('client_id', user!.id)
//         .maybeSingle();
//       if (!existingReview) {
//         setShowRatingDialog(true);
//       }
//     }


//     // Fetch lawyer info
//     const { data: profile } = await supabase
//       .from('profiles')
//       // .select('id, full_name, avatar_url')
//       .select('id, full_name, avatar_url, email, date_of_birth')
//       .eq('id', data.lawyer_id)
//       .single();
//     const { data: lawyerProfile } = await supabase
//       .from('lawyer_profiles')
//       .select('specializations, rating, experience_years')
//       .eq('user_id', data.lawyer_id)
//       .single();
//     if (profile) {
//       setLawyer({
//         ...profile,
//         specializations: lawyerProfile?.specializations || [],
//         rating: lawyerProfile?.rating || 0,
//         experience_years: lawyerProfile?.experience_years || 0,
//       });
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
//       .channel(`client-messages:${id}`)
//       .on('postgres_changes', {
//         event: 'INSERT',
//         schema: 'public',
//         table: 'messages',
//         filter: `consultation_id=eq.${id}`,
//       }, (payload) => {
//         setMessages(prev => [...prev, payload.new as Message]);
//       })
//       .on('postgres_changes', {
//         event: 'UPDATE',
//         schema: 'public',
//         table: 'consultations',
//         filter: `id=eq.${id}`,
//       }, (payload) => {
//         const updated = payload.new as ConsultationDetails;
//         setConsultation(updated);
//         if (updated.status === 'completed') {
//           setShowRatingDialog(true);
//         }
//       })
//       .subscribe();
//     return () => { supabase.removeChannel(channel); };
//   };
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };
//   const sendMessage = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newMessage.trim() || !user) return;
//     setSending(true);
//     const { error } = await supabase.from('messages').insert({
//       consultation_id: id,
//       sender_id: user.id,
//       content: newMessage.trim(),
//     });
//     if (error) {
//       toast({ variant: 'destructive', title: 'Error', description: 'Failed to send message.' });
//     } else {
//       setNewMessage('');
//       inputRef.current?.focus();
//     }
//     setSending(false);
//   };
//   const formatTime = (seconds: number) => {
//     const hrs = Math.floor(seconds / 3600);
//     const mins = Math.floor((seconds % 3600) / 60);
//     const secs = seconds % 60;
//     if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
//       <ClientLayout>
//         <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/20">
//           <div className="text-center">
//             <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
//             <p className="mt-4 text-muted-foreground">Loading your consultation...</p>
//           </div>
//         </div>
//         {/* </MainLayout> */}
//       </ClientLayout>
//     );
//   }
//   return (
//     // <MainLayout showFooter={false}>
//     <ClientLayout>
//       <div className="h-[calc(100vh-64px)] flex bg-gradient-to-br from-background via-background to-secondary/10">
//         {/* Client Sidebar - Lawyer Info */}
//         <div className="hidden lg:flex w-80 border-r border-border flex-col bg-card/50">
//           {/* Lawyer Card */}
//           <div className="p-6 border-b border-border">
//             <div className="flex items-center gap-4">
//               <Avatar className="h-16 w-16 border-2 border-primary/20 ring-2 ring-primary/10">
//                 <AvatarImage src={lawyer?.avatar_url || undefined} />
//                 <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-lg font-semibold">
//                   {lawyer?.full_name?.charAt(0) || 'L'}
//                 </AvatarFallback>
//               </Avatar>
//               <div>
//                 <h3 className="font-semibold text-lg">{lawyer?.full_name}</h3>
//                 <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
//                   <Shield className="h-3.5 w-3.5 text-blue-500" />
//                   <span>Your Legal Advisor</span>
//                 </div>
//                 {lawyer?.rating ? (
//                   <div className="flex items-center gap-1 mt-1">
//                     <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
//                     <span className="text-xs font-medium">{lawyer.rating.toFixed(1)}</span>
//                   </div>
//                 ) : null}

//               </div>
//             </div>
//             {/* Lawyer specializations */}
//             {lawyer?.specializations && lawyer.specializations.length > 0 && (
//               <div className="mt-4 flex flex-wrap gap-1.5">
//                 {lawyer.specializations.slice(0, 3).map((spec, i) => (
//                   <Badge key={i} variant="secondary" className="text-xs">{spec}</Badge>
//                 ))}
//               </div>
//             )}
//           </div>
//           {/* Session Details */}
//           <div className="p-6 space-y-4">
//             <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Session Details</h4>

//             <div className="flex items-center justify-between">
//               <span className="text-sm text-muted-foreground">Type</span>
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
//                   <span className="text-sm font-medium">Fee Paid</span>
//                 </div>
//                 <span className="font-semibold text-emerald-600">
//                   ₹{consultation.total_amount.toFixed(2)}
//                 </span>
//               </div>
//             )}
//             <div className="flex items-center justify-between">
//               <span className="text-sm text-muted-foreground">Booked</span>
//               <span className="text-sm">
//                 {consultation?.created_at ? new Date(consultation.created_at).toLocaleDateString() : '-'}
//               </span>
//             </div>
//           </div>
//           {/* Client Actions */}
//           <div className="p-6 border-t border-border mt-auto space-y-2">
//             {consultation?.status === 'pending' && (
//               <div className="text-center p-4 bg-amber-500/10 rounded-lg">
//                 <Clock className="h-8 w-8 text-amber-600 mx-auto mb-2" />
//                 <p className="text-sm font-medium">Waiting for lawyer</p>
//                 <p className="text-xs text-muted-foreground mt-1">Your lawyer will start the session shortly</p>
//               </div>
//             )}
//             {consultation?.status === 'active' && (
//               <>
//                 {(consultation.type === 'audio' || consultation.type === 'video') && (
//                   <Button variant="outline" className="w-full gap-2" onClick={() => setIsAudioCallActive(true)}>
//                     <Phone className="h-4 w-4" />
//                     Join Audio Call
//                   </Button>
//                 )}
//                 {consultation.type === 'video' && (
//                   <Button variant="outline" className="w-full gap-2" onClick={() => setIsVideoCallActive(true)}>
//                     <Video className="h-4 w-4" />
//                     Join Video Call
//                   </Button>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//         {/* Main Chat Area */}
//         <div className="flex-1 flex flex-col">
//           {/* Header */}
//           <div className="h-16 border-b border-border bg-card/80 backdrop-blur-sm px-4 flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="lg:hidden">
//                 <ArrowLeft className="h-5 w-5" />
//               </Button>
//               <div className="flex items-center gap-3 lg:hidden">
//                 <Avatar className="h-10 w-10">
//                   <AvatarImage src={lawyer?.avatar_url || undefined} />
//                   <AvatarFallback>{lawyer?.full_name?.charAt(0)}</AvatarFallback>
//                 </Avatar>
//                 <div>
//                   <h3 className="font-semibold">{lawyer?.full_name}</h3>
//                   <div className="flex items-center gap-2">
//                     {getStatusBadge()}
//                     {consultation?.status === 'active' && (
//                       <span className="text-xs text-muted-foreground font-mono">{formatTime(elapsedTime)}</span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//               <div className="hidden lg:block">
//                 <h2 className="font-semibold">
//                   {consultation?.type?.charAt(0).toUpperCase()}{consultation?.type?.slice(1)} Consultation
//                 </h2>
//                 <p className="text-sm text-muted-foreground">with {lawyer?.full_name}</p>
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               {consultation?.status === 'active' && (
//                 <>
//                   {(consultation.type === 'audio' || consultation.type === 'video') && (
//                     <Button variant="outline" size="icon" onClick={() => setIsAudioCallActive(true)}
//                       className="hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30">
//                       <Phone className="h-4 w-4" />
//                     </Button>
//                   )}
//                   {consultation.type === 'video' && (
//                     <Button variant="outline" size="icon" onClick={() => setIsVideoCallActive(true)}
//                       className="hover:bg-purple-500/10 hover:text-purple-600 hover:border-purple-500/30">
//                       <Video className="h-4 w-4" />
//                     </Button>
//                   )}
//                 </>
//               )}
//             </div>
//           </div>
//           {/* Messages */}
//           <div className="flex-1 overflow-y-auto p-4 lg:p-6">
//             <div className="max-w-3xl mx-auto space-y-4">
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
//                   <h3 className="text-xl font-semibold mb-2">Waiting for Your Lawyer</h3>
//                   <p className="text-muted-foreground max-w-sm mx-auto">
//                     Your lawyer will start the consultation shortly. Please wait.
//                   </p>
//                 </div>
//               )}
//               {messages.length === 0 && consultation?.status === 'active' && (
//                 <div className="text-center py-16">
//                   <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
//                     <CheckCircle className="h-8 w-8 text-emerald-600" />
//                   </div>
//                   <h3 className="text-lg font-semibold mb-2">Session Started</h3>
//                   <p className="text-muted-foreground">Start the conversation by sending a message to your lawyer.</p>
//                 </div>
//               )}
//               {messages.map((message, index) => {
//                 const isOwn = message.sender_id === user?.id;
//                 const showAvatar = index === 0 || messages[index - 1]?.sender_id !== message.sender_id;
//                 return (
//                   <div key={message.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
//                     {showAvatar ? (
//                       <Avatar className="h-8 w-8 flex-shrink-0">
//                         <AvatarImage src={isOwn ? user?.user_metadata?.avatar_url : lawyer?.avatar_url || undefined} />
//                         <AvatarFallback className="text-xs">
//                           {isOwn ? user?.email?.charAt(0).toUpperCase() : lawyer?.full_name?.charAt(0)}
//                         </AvatarFallback>
//                       </Avatar>
//                     ) : <div className="w-8" />}
//                     <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
//                       <div className={`px-4 py-3 rounded-2xl ${isOwn ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-card border border-border rounded-bl-md'
//                         }`}>
//                         <p className="text-sm leading-relaxed">{message.content}</p>
//                       </div>
//                       <p className={`text-xs text-muted-foreground mt-1 px-1 ${isOwn ? 'text-right' : ''}`}>
//                         {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                       </p>
//                     </div>
//                   </div>
//                 );
//               })}
//               <div ref={messagesEndRef} />
//             </div>
//           </div>


//           {/* Input */}
//           {consultation?.status === 'active' && (
//             <div className="p-4 border-t border-border bg-card/80 backdrop-blur-sm">
//               <form onSubmit={sendMessage} className="max-w-3xl mx-auto">
//                 <div className="flex items-center gap-2 bg-secondary/50 rounded-xl p-2">
//                   <Button type="button" variant="ghost" size="icon" className="flex-shrink-0">
//                     <Paperclip className="h-5 w-5 text-muted-foreground" />
//                   </Button>
//                   <Input ref={inputRef} placeholder="Type your message..." value={newMessage}
//                     onChange={(e) => setNewMessage(e.target.value)}
//                     className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-base" disabled={sending} />
//                   <Button type="button" variant="ghost" size="icon" className="flex-shrink-0">
//                     <Smile className="h-5 w-5 text-muted-foreground" />
//                   </Button>
//                   <Button type="submit" size="icon" disabled={sending || !newMessage.trim()} className="flex-shrink-0 rounded-lg">
//                     {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
//                   </Button>
//                 </div>
//               </form>
//             </div>
//           )}
//           {consultation?.status === 'completed' && (
//             <div className="p-6 border-t border-border bg-secondary/30 text-center">
//               <p className="text-muted-foreground mb-2">This consultation has ended.</p>
//               <Button variant="outline" onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
//             </div>
//           )}
//         </div>
//         <VideoCall isActive={isVideoCallActive} onEnd={() => setIsVideoCallActive(false)}
//           participantName={lawyer?.full_name || 'Lawyer'} consultationId={id || ''} />
//         <AudioCall isActive={isAudioCallActive} onEnd={() => setIsAudioCallActive(false)}
//           participantName={lawyer?.full_name || 'Lawyer'} consultationId={id || ''} />

//         {consultation && user && (
//           <RatingDialog
//             open={showRatingDialog}
//             onOpenChange={setShowRatingDialog}
//             consultationId={consultation.id}
//             lawyerId={consultation.lawyer_id}
//             clientId={user.id}
//             lawyerName={lawyer?.full_name || 'Lawyer'}
//             lawyerAvatar={lawyer?.avatar_url}
//           />
//         )}
//       </div>
//       {/* </MainLayout> */}
//     </ClientLayout>
//   );
// };
// export default ClientConsultation;

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RatingDialog } from '@/components/consultation/RatingDialog';

import {
  Send,
  Phone,
  Video,
  Clock,
  ArrowLeft,
  Loader2,
  MessageSquare,
  Shield,
  DollarSign,
  CheckCircle,
  Paperclip,
  Smile,
  Star
} from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { VideoCall } from '@/components/consultation/VideoCall';
import { AudioCall } from '@/components/consultation/AudioCall';
import { ClientLayout } from '@/components/layout/ClientLayout';

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
  duration_minutes: number | null;
  payment_status: string | null;
}

interface LawyerInfo {
  id: string;
  full_name: string;
  avatar_url: string | null;
  specializations?: string[];
  rating?: number;
  experience_years?: number;
}

const ClientConsultation = () => {

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
  const [elapsedTime, setElapsedTime] = useState(0);

  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isAudioCallActive, setIsAudioCallActive] = useState(false);

  const [lawyer, setLawyer] = useState<LawyerInfo | null>(null);
  const [showRatingDialog, setShowRatingDialog] = useState(false);

  // AUTH GUARD
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user]);

  // INITIAL LOAD
  useEffect(() => {
    if (!id || !user) return;

    fetchConsultation();
    fetchMessages();

    const unsubscribe = subscribeToRealtime();

    return unsubscribe;

  }, [id, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // TIMER
  useEffect(() => {

    let interval: NodeJS.Timeout;

    if (consultation?.status === 'active' && consultation.started_at) {

      interval = setInterval(() => {

        const start = new Date(consultation.started_at!).getTime();
        setElapsedTime(Math.floor((Date.now() - start) / 1000));

      }, 1000);

    }

    return () => clearInterval(interval);

  }, [consultation]);

  // FETCH CONSULTATION
  const fetchConsultation = async () => {

    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {

      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Consultation not found'
      });

      navigate('/dashboard');
      return;
    }

    if (data.client_id !== user?.id) {

      toast({
        variant: 'destructive',
        title: 'Access denied'
      });

      navigate('/dashboard');
      return;
    }

    setConsultation(data);

    // CHECK REVIEW

    if (data.status === 'completed') {

      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('consultation_id', data.id)
        .eq('client_id', user!.id)
        .maybeSingle();

      if (!existingReview) {
        setShowRatingDialog(true);
      }

    }

    // FETCH LAWYER

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', data.lawyer_id)
      .single();

    const { data: lawyerProfile } = await supabase
      .from('lawyer_profiles')
      .select('specializations, rating, experience_years')
      .eq('user_id', data.lawyer_id)
      .single();

    if (profile) {

      setLawyer({
        ...profile,
        specializations: lawyerProfile?.specializations || [],
        rating: lawyerProfile?.rating || 0,
        experience_years: lawyerProfile?.experience_years || 0
      });

    }

    setLoading(false);

  };

  // FETCH MESSAGES
  const fetchMessages = async () => {

    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('consultation_id', id)
      .order('created_at', { ascending: true });

    setMessages(data || []);

  };

  // REALTIME
  const subscribeToRealtime = () => {

    const channel = supabase.channel(`consultation-${id}`);

    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `consultation_id=eq.${id}`
      },
      payload => {
        setMessages(prev => [...prev, payload.new as Message]);
      }
    );

    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'consultations',
        filter: `id=eq.${id}`
      },
      payload => {

        const updated = payload.new as ConsultationDetails;

        setConsultation(updated);

        if (updated.status === 'completed') {
          setShowRatingDialog(true);
        }

      }
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // SEND MESSAGE
  const sendMessage = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!newMessage.trim()) return;
    if (!user) return;
    if (consultation?.status !== 'active') return;

    setSending(true);

    const { error } = await supabase
      .from('messages')
      .insert({
        consultation_id: id,
        sender_id: user.id,
        content: newMessage.trim()
      });

    if (error) {

      toast({
        variant: 'destructive',
        title: 'Error sending message'
      });

    } else {

      setNewMessage('');
      inputRef.current?.focus();

    }

    setSending(false);

  };

  const formatTime = (seconds: number) => {

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0)
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;

    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;

  };
  const getTypeIcon = () => {
    switch (consultation?.type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Phone className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };
  const getStatusBadge = () => {
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
  if (loading) {

    return (
      <ClientLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      </ClientLayout>
    );

  }

  return (
    <ClientLayout>
      <div className="h-[calc(100vh-64px)] flex bg-gradient-to-br from-background via-background to-secondary/10">
        {/* Client Sidebar - Lawyer Info */}
        <div className="hidden lg:flex w-80 border-r border-border flex-col bg-card/50">
          {/* Lawyer Card */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/20 ring-2 ring-primary/10">
                <AvatarImage src={lawyer?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-lg font-semibold">
                  {lawyer?.full_name?.charAt(0) || 'L'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{lawyer?.full_name}</h3>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                  <Shield className="h-3.5 w-3.5 text-blue-500" />                   <span>Your Legal Advisor</span>
                </div>
                {lawyer?.rating ? (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium">{lawyer.rating.toFixed(1)}</span>
                  </div>
                ) : null}

              </div>
            </div>
            {/* Lawyer specializations */}
            {lawyer?.specializations && lawyer.specializations.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {lawyer.specializations.slice(0, 3).map((spec, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{spec}</Badge>
                ))}
              </div>
            )}
          </div>
          {/* Session Details */}
          <div className="p-6 space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Session Details</h4>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Type</span>
              <Badge variant="outline" className="capitalize gap-1.5">
                {getTypeIcon()}
                {consultation?.type}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              {getStatusBadge()}
            </div>
            {consultation?.status === 'active' && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Duration</span>
                <span className="font-mono text-lg font-semibold text-primary">
                  {formatTime(elapsedTime)}
                </span>
              </div>
            )}
            {consultation?.total_amount && (
              <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium">Fee Paid</span>
                </div>
                <span className="font-semibold text-emerald-600">
                  ₹{consultation.total_amount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Bookedddd</span>
              <span className="text-sm">
                {consultation?.created_at ? new Date(consultation.created_at).toLocaleDateString() : '-'}
              </span>
            </div>
          </div>
          {/* Client Actions */}
          <div className="p-6 border-t border-border mt-auto space-y-2">
            {consultation?.status === 'pending' && (
              <div className="text-center p-4 bg-amber-500/10 rounded-lg">
                <Clock className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Waiting for lawyer</p>
                <p className="text-xs text-muted-foreground mt-1">Your lawyer will start the session shortly</p>
              </div>
            )}
            {consultation?.status === 'active' && (
              <>
                {(consultation.type === 'audio' || consultation.type === 'video') && (
                  <Button variant="outline" className="w-full gap-2" onClick={() => setIsAudioCallActive(true)}>
                    <Phone className="h-4 w-4" />
                    Join Audio Call
                  </Button>
                )}
                {consultation.type === 'video' && (
                  <Button variant="outline" className="w-full gap-2" onClick={() => setIsVideoCallActive(true)}>
                    <Video className="h-4 w-4" />
                    Join Video Call
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="h-16 border-b border-border bg-card/80 backdrop-blur-sm px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="lg:hidden">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3 lg:hidden">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={lawyer?.avatar_url || undefined} />
                  <AvatarFallback>{lawyer?.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{lawyer?.full_name}</h3>
                  <div className="flex items-center gap-2">
                    {getStatusBadge()}
                    {consultation?.status === 'active' && (
                      <span className="text-xs text-muted-foreground font-mono">{formatTime(elapsedTime)}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <h2 className="font-semibold">
                  {consultation?.type?.charAt(0).toUpperCase()}{consultation?.type?.slice(1)} Consultation
                </h2>
                <p className="text-sm text-muted-foreground">with {lawyer?.full_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {consultation?.status === 'active' && (
                <>
                  {(consultation.type === 'audio' || consultation.type === 'video') && (
                    <Button variant="outline" size="icon" onClick={() => setIsAudioCallActive(true)}
                      className="hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30">
                      <Phone className="h-4 w-4" />
                    </Button>
                  )}
                  {consultation.type === 'video' && (
                    <Button variant="outline" size="icon" onClick={() => setIsVideoCallActive(true)}
                      className="hover:bg-purple-500/10 hover:text-purple-600 hover:border-purple-500/30">
                      <Video className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="max-w-3xl mx-auto space-y-4">
              {consultation?.status !== 'pending' && (
                <div className="flex justify-center my-6">
                  <div className="bg-secondary/50 border border-border rounded-full px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>This conversation is end-to-end encrypted</span>
                  </div>
                </div>
              )}
              {messages.length === 0 && consultation?.status === 'pending' && (
                <div className="text-center py-20">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Waiting for Your Lawyer</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Your lawyer will start the consultation shortly. Please wait.
                  </p>
                </div>
              )}
              {messages.length === 0 && consultation?.status === 'active' && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Session Started</h3>
                  <p className="text-muted-foreground">Start the conversation by sending a message to your lawyer.</p>
                </div>
              )}
              {messages.map((message, index) => {
                const isOwn = message.sender_id === user?.id;
                const showAvatar = index === 0 || messages[index - 1]?.sender_id !== message.sender_id;
                return (
                  <div key={message.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    {showAvatar ? (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={isOwn ? user?.user_metadata?.avatar_url : lawyer?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {isOwn ? user?.email?.charAt(0).toUpperCase() : lawyer?.full_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ) : <div className="w-8" />}
                    <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-3 rounded-2xl ${isOwn ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-card border border-border rounded-bl-md'
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


          {/* Input */}
          {consultation?.status === 'active' && (
            <div className="p-4 border-t border-border bg-card/80 backdrop-blur-sm">
              <form onSubmit={sendMessage} className="max-w-3xl mx-auto">
                <div className="flex items-center gap-2 bg-secondary/50 rounded-xl p-2">
                  <Button type="button" variant="ghost" size="icon" className="flex-shrink-0">
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <Input ref={inputRef} placeholder="Type your message..." value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-base" disabled={sending} />
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
          {consultation?.status === 'completed' && (
            <div className="p-6 border-t border-border bg-secondary/30 text-center">
              <p className="text-muted-foreground mb-2">This consultation has ended.</p>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
            </div>
          )}
        </div>
        <VideoCall isActive={isVideoCallActive} onEnd={() => setIsVideoCallActive(false)}
          participantName={lawyer?.full_name || 'Lawyer'} consultationId={id || ''} />
        <AudioCall isActive={isAudioCallActive} onEnd={() => setIsAudioCallActive(false)}
          participantName={lawyer?.full_name || 'Lawyer'} consultationId={id || ''} />

        {consultation && user && (
          <RatingDialog
            open={showRatingDialog}
            onOpenChange={setShowRatingDialog}
            consultationId={consultation.id}
            lawyerId={consultation.lawyer_id}
            clientId={user.id}
            lawyerName={lawyer?.full_name || 'Lawyer'}
            lawyerAvatar={lawyer?.avatar_url}
          />
        )}
      </div>
      {/* </MainLayout> */}
    </ClientLayout>
  );

};

export default ClientConsultation;