

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft, MessageSquare, Phone, Video,
  Clock, Calendar, ChevronRight,
  CheckCircle, XCircle, Play, History,
  DollarSign,
  Star,
  Loader2,
  Download
} from 'lucide-react';
import { LawyerLayout } from '@/components/layout/LawyerLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { DialogHeader } from '@/components/ui/dialog';
// import { TabsContent } from '@radix-ui/react-tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConsultationWithClient {
  id: string;
  type: 'chat' | 'audio' | 'video';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
  total_amount: number | null;
  client_id: string;
  client_name: string;
  client_avatar: string | null;
  duration_minutes: number | null;
  rating?: number | null;



}
interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}
interface Recording {
  id: string;
  storage_path: string;
  duration_seconds: number | null;
  created_at: string;
}

const LawyerConsultations = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [consultations, setConsultations] = useState<ConsultationWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const CONSULTATIONS_PER_PAGE = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationWithClient | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('consultations')
      .select('*')
      .eq('lawyer_id', user.id)
      .order('created_at', { ascending: false });

    const consultationIds = data?.map(c => c.id) || [];

    const { data: reviews } = await supabase
      .from('reviews')
      .select('consultation_id, rating')
      .in('consultation_id', consultationIds);

    if (data && data.length > 0) {
      const clientIds = [...new Set(data.map(c => c.client_id))];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', clientIds);

      const enriched = data.map(c => {
        const cp = profiles?.find(p => p.id === c.client_id);

        const review = reviews?.find(r => r.consultation_id === c.id);

        return {
          ...c,
          client_name: cp?.full_name || 'Client',
          client_avatar: cp?.avatar_url || null,

          // ✅ THIS LINE IS THE MAIN FIX
          rating: review?.rating ?? null,
        };
      });



      setConsultations(enriched);
    }

    setLoading(false);
  };

  const openDetail = async (consultation: ConsultationWithClient) => {
    setSelectedConsultation(consultation);
    setDetailOpen(true);
    setDetailLoading(true);
    const [{ data: msgs }, { data: recs }] = await Promise.all([
      supabase.from('messages').select('*').eq('consultation_id', consultation.id).order('created_at', { ascending: true }),
      supabase.from('call_recordings').select('*').eq('consultation_id', consultation.id).order('created_at', { ascending: true }),
    ]);
    setChatMessages(msgs || []);
    setRecordings(recs || []);
    setDetailLoading(false);
  };

  const formatDuration = (mins: number | null) => {
    if (!mins) return '—';
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };


  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Phone className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed': return { className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: <CheckCircle className="h-3 w-3" /> };
      case 'active': return { className: 'bg-blue-500/10 text-blue-600 border-blue-500/20 animate-pulse', icon: <Play className="h-3 w-3" /> };
      case 'pending': return { className: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: <Clock className="h-3 w-3" /> };
      default: return { className: 'bg-red-500/10 text-red-600 border-red-500/20', icon: <XCircle className="h-3 w-3" /> };
    }
  };

  const filtered = consultations.filter(c =>
    filterStatus === 'all' || c.status === filterStatus
  );

  const totalPages = Math.ceil(filtered.length / CONSULTATIONS_PER_PAGE);

  const paginated = filtered.slice(
    (currentPage - 1) * CONSULTATIONS_PER_PAGE,
    currentPage * CONSULTATIONS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  const stats = {
    total: consultations.length,
    completed: consultations.filter(c => c.status === 'completed').length,
    earnings: consultations.reduce((sum, c) => sum + (c.total_amount || 0), 0),
  };

  if (authLoading || loading) {
    return (
      <LawyerLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-10 w-64 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-xl mb-3" />)}
          </div>
        </div>
      </LawyerLayout>
    );
  }

  return (
    <LawyerLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-5xl">
          {/* HEADER */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/lawyer/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold">Consultation History</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Your sessions with clients</p>
            </div>
          </div>
          {/* STATS */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
            <Card className="border-0 shadow-md bg-card">
              <CardContent className="p-4 text-center">
                <p className="text-2xl sm:text-3xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-1">Total</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-card">
              <CardContent className="p-4 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-emerald-600">{stats.completed}</p>
                <p className="text-xs text-muted-foreground mt-1">Completed</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-card">
              <CardContent className="p-4 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-primary">₹{stats.earnings.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground mt-1">Earnings</p>
              </CardContent>
            </Card>
          </div>
          {/* FILTER */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Tabs value={filterStatus} onValueChange={setFilterStatus}>
              <TabsList className="h-10">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="completed" className="text-xs">Completed</TabsTrigger>
                <TabsTrigger value="active" className="text-xs">Active</TabsTrigger>
                <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
                <TabsTrigger value="cancelled" className="text-xs">Cancelled</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {/* LIST */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                <History className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">No consultations found</h3>
              {/* <p className="text-sm text-muted-foreground">
                {searchQuery || filterStatus !== 'all' ? 'Try adjusting your filters' : 'Book your first consultation'}
              </p> */}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginated.map((c, index) => {
                  const sc = getStatusConfig(c.status);


                  // Need to add dialouge box
                  return (
                    <Card
                      key={c.id}
                      className="border shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer group animate-fade-in overflow-hidden"
                      // onClick={() => navigate(`/consultation/${c.id}`)}
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => openDetail(c)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-11 w-11 flex-shrink-0 border border-border">
                            <AvatarImage src={c.client_avatar || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-sm font-semibold">
                              {c.client_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                                {c.client_name}
                              </p>
                              <Badge className={`text-[10px] px-1.5 py-0 gap-1 ${sc.className}`}>
                                {sc.icon}
                                {c.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                              <span className="flex items-center gap-1">
                                {getTypeIcon(c.type)}
                                <span className="capitalize">{c.type}</span>
                              </span>
                              <span className="w-1 h-1 rounded-full bg-muted-foreground hidden sm:block" />

                              <span className="hidden sm:inline">
                                {new Date(c.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-muted-foreground hidden sm:block" />

                              <span className="hidden sm:inline">
                                {new Date(c.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>



                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">

                            {c.total_amount && (
                              <span className="text-sm font-semibold text-foreground hidden sm:block">
                                ₹{c.total_amount.toFixed(2)}
                              </span>
                            )}
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="mt-8 flex flex-col items-center gap-4">

                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * CONSULTATIONS_PER_PAGE + 1}
                    –
                    {Math.min(currentPage * CONSULTATIONS_PER_PAGE, filtered.length)}
                    of {filtered.length} consultations
                  </p>

                  <div className="flex items-center gap-2">

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      Previous
                    </Button>

                    {/* CURRENT PAGE */}
                    <Button
                      variant="default"
                      size="sm"
                      className="w-9 h-9 p-0"
                    >
                      {currentPage}
                    </Button>

                    {/* NEXT PAGE */}
                    {currentPage + 1 <= totalPages && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-9 h-9 p-0"
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        {currentPage + 1}
                      </Button>
                    )}

                    {/* ELLIPSIS */}
                    {currentPage + 1 < totalPages && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Next
                    </Button>

                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 overflow-hidden">
          {selectedConsultation && (
            <>
              {/* Detail Header */}
              <div className="p-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-accent/5">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarImage src={selectedConsultation.client_avatar || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 font-semibold">
                        {selectedConsultation.client_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-lg font-bold">{selectedConsultation.client_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-[10px] gap-1 ${getStatusConfig(selectedConsultation.status).className}`}>
                          {getStatusConfig(selectedConsultation.status).icon}
                          {selectedConsultation.status}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] capitalize gap-1">
                          {getTypeIcon(selectedConsultation.type)}
                          {selectedConsultation.type}
                        </Badge>
                      </div>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                {/* Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="bg-card p-3 rounded-lg border text-center">
                    <Calendar className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-sm font-semibold">{new Date(selectedConsultation.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border text-center">
                    <Clock className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-semibold">{formatDuration(selectedConsultation.duration_minutes)}</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border text-center">
                    <DollarSign className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">Cost</p>
                    <p className="text-sm font-semibold">₹{(selectedConsultation.total_amount || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border text-center">
                    <Star className="h-4 w-4 mx-auto text-amber-500 mb-1" />
                    <p className="text-xs text-muted-foreground">Rating</p>
                    <p className="text-sm font-semibold">{selectedConsultation.rating ? `${selectedConsultation.rating}/5` : '—'}</p>
                  </div>

                </div>
              </div>
              {/* Content Tabs */}
              <div className="px-6 pb-6">
                {detailLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <Tabs defaultValue="chat" className="mt-4">
                    <TabsList className="w-full">
                      <TabsTrigger value="chat" className="flex-1 gap-1.5 text-xs">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Chat ({chatMessages.length})
                      </TabsTrigger>
                      <TabsTrigger value="recordings" className="flex-1 gap-1.5 text-xs">
                        <Play className="h-3.5 w-3.5" />
                        Recordings ({recordings.length})
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="chat" className="mt-3">
                      {chatMessages.length === 0 ? (
                        <div className="text-center py-10">
                          <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">No messages in this session</p>
                        </div>
                      ) : (
                        <ScrollArea className="h-[300px] pr-3">
                          <div className="space-y-3">
                            {chatMessages.map(msg => {
                              const isOwn = msg.sender_id === user?.id;
                              return (
                                <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${isOwn
                                    ? 'bg-primary text-primary-foreground rounded-br-md'
                                    : 'bg-secondary text-secondary-foreground rounded-bl-md'
                                    }`}>
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                    <p className={`text-[10px] mt-1 ${isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                                      {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      )}
                    </TabsContent>
                    <TabsContent value="recordings" className="mt-3">
                      {recordings.length === 0 ? (
                        <div className="text-center py-10">
                          <Play className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">No recordings for this session</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {recordings.map((rec, i) => (
                            <Card key={rec.id} className="border">
                              <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Play className="h-4 w-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Recording {i + 1}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {rec.duration_seconds ? `${Math.floor(rec.duration_seconds / 60)}m ${rec.duration_seconds % 60}s` : 'Unknown duration'}
                                      {' · '}
                                      {new Date(rec.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                                <Button size="sm" variant="outline" className="gap-1.5">
                                  <Download className="h-3.5 w-3.5" />
                                  <span className="hidden sm:inline">Download</span>
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                )}
                <div className="flex gap-3 mt-4 pt-4 border-t">
                  {selectedConsultation.status === 'active' && (
                    <Button
                      className="flex-1 gap-2"
                      onClick={() => {
                        setDetailOpen(false);
                        navigate(`/consultation/${selectedConsultation.id}`);
                      }}
                    >
                      Continue Session
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setDetailOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>

            </>
          )}
        </DialogContent>
      </Dialog>
    </LawyerLayout >
  );
};

export default LawyerConsultations;