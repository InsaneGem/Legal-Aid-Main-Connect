import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, Video, Phone, User, ArrowLeft, ArrowRight, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
interface ConsultationWithClient {
  id: string;
  type: 'chat' | 'audio' | 'video';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
  client_id: string;
  client_name?: string;
  client_email?: string;
  client_avatar?: string | null;
  total_amount?: number | null;
}
const LawyerConsultations = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState<ConsultationWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!authLoading && !user) { navigate('/login'); return; }
    if (user) fetchData();
  }, [user, authLoading]);
  const fetchData = async () => {
    if (!user) return;
    const { data: allConsultations } = await supabase
      .from('consultations')
      .select('id, type, created_at, client_id, status, started_at, ended_at, total_amount')
      .eq('lawyer_id', user.id)
      .order('created_at', { ascending: false });
    if (allConsultations && allConsultations.length > 0) {
      const clientIds = [...new Set(allConsultations.map(c => c.client_id))];
      const { data: clientProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', clientIds);
      setConsultations(allConsultations.map(c => {
        const cp = clientProfiles?.find(p => p.id === c.client_id);
        return { ...c, client_name: cp?.full_name || 'Client', client_email: cp?.email || '', client_avatar: cp?.avatar_url };
      }));
    }
    setLoading(false);
  };
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Phone className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Active</Badge>;
      case 'completed': return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Completed</Badge>;
      case 'cancelled': return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Cancelled</Badge>;
      default: return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>;
    }
  };
  const renderList = (items: ConsultationWithClient[]) => (
    items.length === 0 ? (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-2">No Consultations</h3>
        <p className="text-muted-foreground text-sm">No consultations found in this category</p>
      </div>
    ) : (
      <div className="space-y-3">
        {items.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/20 hover:bg-secondary/30 transition-all cursor-pointer group"
            onClick={() => navigate(`/consultation/${c.id}`)}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center overflow-hidden">
                {c.client_avatar ? (
                  <img src={c.client_avatar} alt={c.client_name} className="w-full h-full object-cover" />
                ) : (
                  <User className="h-6 w-6 text-foreground/70" />
                )}
              </div>
              <div>
                <p className="font-semibold group-hover:text-primary transition-colors">{c.client_name}</p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1.5">{getTypeIcon(c.type)}<span className="capitalize">{c.type}</span></span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {c.total_amount != null && <span className="font-semibold text-sm">${c.total_amount.toFixed(2)}</span>}
              {getStatusBadge(c.status)}
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        ))}
      </div>
    )
  );
  if (authLoading || loading) {
    return (
      <MainLayout showFooter={false}>
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-10 w-48 mb-6" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </MainLayout>
    );
  }
  const pending = consultations.filter(c => c.status === 'pending');
  const active = consultations.filter(c => c.status === 'active');
  const completed = consultations.filter(c => c.status === 'completed');
  const cancelled = consultations.filter(c => c.status === 'cancelled');
  return (
    <MainLayout showFooter={false}>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" className="gap-2 mb-6" onClick={() => navigate('/lawyer/dashboard')}>
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'All', count: consultations.length, color: 'bg-primary/10 text-primary' },
              { label: 'Active', count: active.length, color: 'bg-emerald-500/10 text-emerald-600' },
              { label: 'Pending', count: pending.length, color: 'bg-amber-500/10 text-amber-600' },
              { label: 'Completed', count: completed.length, color: 'bg-blue-500/10 text-blue-600' },
            ].map(s => (
              <Card key={s.label} className="border-0 shadow-md">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold">{s.count}</p>
                  <Badge className={`mt-2 ${s.color}`}>{s.label}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <MessageSquare className="h-5 w-5" /> All Consultations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
                <TabsContent value="all">{renderList(consultations)}</TabsContent>
                <TabsContent value="active">{renderList(active)}</TabsContent>
                <TabsContent value="pending">{renderList(pending)}</TabsContent>
                <TabsContent value="completed">{renderList(completed)}</TabsContent>
                <TabsContent value="cancelled">{renderList(cancelled)}</TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};
export default LawyerConsultations;