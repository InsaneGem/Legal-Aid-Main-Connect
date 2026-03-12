import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Send, Phone, Video, Clock, ArrowLeft,
  Loader2, MessageSquare, Shield, DollarSign,
  CheckCircle, Paperclip, Smile, User,
  PlayCircle, StopCircle, MoreVertical
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VideoCall } from '@/components/consultation/VideoCall';
import { AudioCall } from '@/components/consultation/AudioCall';
import { LawyerLayout } from '@/components/layout/LawyerLayout';
import { calculateAge } from '@/lib/ageUtils';
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
}
interface ClientInfo {
  id: string;
  full_name: string;
  avatar_url: string | null;
  email?: string;
  phone?: string;
  date_of_birth?: string | null;
}
const LawyerConsultation = () => {
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
  const [client, setClient] = useState<ClientInfo | null>(null);
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user]);
  useEffect(() => {
    if (id && user) {
      fetchConsultation();
      fetchMessages();
      const unsubscribe = subscribeToMessages();
      return unsubscribe;
    }
  }, [id, user]);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
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
  const fetchConsultation = async () => {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) {
      toast({ variant: 'destructive', title: 'Error', description: 'Consultation not found.' });
      navigate('/lawyer/dashboard');
      return;
    }
    // Verify lawyer access
    if (data.lawyer_id !== user?.id) {
      toast({ variant: 'destructive', title: 'Access Denied', description: 'You do not have access to this consultation.' });
      navigate('/lawyer/dashboard');
      return;
    }
    setConsultation(data);
    // Fetch client info
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, email, date_of_birth')
      .eq('id', data.client_id)
      .single();
    if (profile) {
      setClient(profile);
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
      .channel(`lawyer-messages:${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `consultation_id=eq.${id}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    setSending(true);
    const { error } = await supabase.from('messages').insert({
      consultation_id: id,
      sender_id: user.id,
      content: newMessage.trim(),
    });
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to send message.' });
    } else {
      setNewMessage('');
      inputRef.current?.focus();
    }
    setSending(false);
  };
  const startConsultation = async () => {
    const { error } = await supabase
      .from('consultations')
      .update({ status: 'active', started_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      setConsultation(prev => prev ? { ...prev, status: 'active', started_at: new Date().toISOString() } : null);
      toast({ title: '✅ Consultation started', description: 'You can now communicate with the client.' });
    }
  };
  const endConsultation = async () => {
    const { error } = await supabase
      .from('consultations')
      .update({ status: 'completed', ended_at: new Date().toISOString(), duration_minutes: Math.ceil(elapsedTime / 60) })
      .eq('id', id);
    if (!error) {
      toast({ title: 'Consultation ended', description: 'Session completed successfully.' });
      navigate('/lawyer/dashboard');
    }
  };
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      // <MainLayout showFooter={false}>
      <LawyerLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/20">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Loading consultation...</p>
          </div>
        </div>
        {/* </MainLayout> */}
      </LawyerLayout>
    );
  }
  return (
    // <MainLayout showFooter={false}>
    <LawyerLayout>
      <div className="h-[calc(100vh-64px)] flex bg-gradient-to-br from-background via-background to-secondary/10">
        {/* Lawyer Sidebar - Client Info & Session Controls */}
        <div className="hidden lg:flex w-80 border-r border-border flex-col bg-card/50">
          {/* Client Card */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-accent/20">
                <AvatarImage src={client?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-accent/20 to-secondary/20 text-lg font-semibold">
                  {client?.full_name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{client?.full_name}</h3>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                  <User className="h-3.5 w-3.5" />
                  <span>Client</span>
                </div>
                {client?.email && (
                  <p className="text-xs text-muted-foreground mt-1 truncate max-w-[180px]">{client.email}</p>
                )}
                {calculateAge(client?.date_of_birth) !== null && (
                  <span className="ml-1">• {calculateAge(client?.date_of_birth)} yrs</span>
                )}
              </div>
            </div>
          </div>
          {/* Session Details */}
          <div className="p-6 space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Session Controls</h4>
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
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                <span className="text-sm text-muted-foreground">Duration</span>
                <span className="font-mono text-xl font-bold text-primary">
                  {formatTime(elapsedTime)}
                </span>
              </div>
            )}
            {consultation?.total_amount && (
              <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium">Session Fee</span>
                </div>
                <span className="font-semibold text-emerald-600">
                  ₹{consultation.total_amount.toFixed(2)}
                </span>
              </div>
            )}
          </div>
          {/* Lawyer Session Actions */}
          <div className="p-6 border-t border-border mt-auto space-y-2">
            {consultation?.status === 'pending' && (
              <Button onClick={startConsultation} className="w-full gap-2 h-12 text-base">
                <PlayCircle className="h-5 w-5" />
                Start Consultation
              </Button>
            )}
            {consultation?.status === 'active' && (
              <>
                {(consultation.type === 'audio' || consultation.type === 'video') && (
                  <Button variant="outline" className="w-full gap-2" onClick={() => setIsAudioCallActive(true)}>
                    <Phone className="h-4 w-4" />
                    Start Audio Call
                  </Button>
                )}
                {consultation.type === 'video' && (
                  <Button variant="outline" className="w-full gap-2" onClick={() => setIsVideoCallActive(true)}>
                    <Video className="h-4 w-4" />
                    Start Video Call
                  </Button>
                )}
                <Button variant="destructive" className="w-full gap-2" onClick={endConsultation}>
                  <StopCircle className="h-4 w-4" />
                  End Consultation
                </Button>
              </>
            )}
          </div>
        </div>
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="h-16 border-b border-border bg-card/80 backdrop-blur-sm px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/lawyer/dashboard')} className="lg:hidden">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3 lg:hidden">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={client?.avatar_url || undefined} />
                  <AvatarFallback>{client?.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{client?.full_name}</h3>
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
                <p className="text-sm text-muted-foreground">with {client?.full_name} (Client)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile controls */}
              {consultation?.status === 'pending' && (
                <Button size="sm" onClick={startConsultation} className="lg:hidden gap-1.5">
                  <PlayCircle className="h-4 w-4" />
                  Start
                </Button>
              )}
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
                  <Button variant="destructive" size="icon" onClick={endConsultation} className="lg:hidden">
                    <StopCircle className="h-4 w-4" />
                  </Button>
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
                  <h3 className="text-xl font-semibold mb-2">Ready to Begin</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Click "Start Consultation" to begin the session with your client.
                  </p>
                  <Button onClick={startConsultation} className="mt-6 gap-2">
                    <PlayCircle className="h-4 w-4" />
                    Start Consultation
                  </Button>
                </div>
              )}
              {messages.length === 0 && consultation?.status === 'active' && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Session Active</h3>
                  <p className="text-muted-foreground">Send a message to begin advising your client.</p>
                </div>
              )}
              {messages.map((message, index) => {
                const isOwn = message.sender_id === user?.id;
                const showAvatar = index === 0 || messages[index - 1]?.sender_id !== message.sender_id;
                return (
                  <div key={message.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    {showAvatar ? (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={isOwn ? user?.user_metadata?.avatar_url : client?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {isOwn ? user?.email?.charAt(0).toUpperCase() : client?.full_name?.charAt(0)}
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
              <Button variant="outline" onClick={() => navigate('/lawyer/dashboard')}>Return to Dashboard</Button>
            </div>
          )}
        </div>
        <VideoCall isActive={isVideoCallActive} onEnd={() => setIsVideoCallActive(false)}
          participantName={client?.full_name || 'Client'} consultationId={id || ''} />
        <AudioCall isActive={isAudioCallActive} onEnd={() => setIsAudioCallActive(false)}
          participantName={client?.full_name || 'Client'} consultationId={id || ''} />
      </div>
      {/* </MainLayout> */}
    </LawyerLayout>
  );
};
export default LawyerConsultation;