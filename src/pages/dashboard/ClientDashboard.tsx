import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Wallet, MessageSquare, Clock, Plus, History, User, Video, Phone, 
  TrendingUp, Calendar, ArrowRight, Zap, Shield, Activity, Settings,
  Search, Users, Star
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { LawyerCard } from '@/components/lawyers/LawyerCard';

interface ConsultationWithLawyer {
  id: string;
  type: 'chat' | 'audio' | 'video';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  total_amount: number | null;
  lawyer_id: string;
  lawyer_profile?: {
    bio: string | null;
    specializations: string[] | null;
    rating: number | null;
  };
  lawyer_name?: string;
}

interface LawyerWithProfile {
  id: string;
  user_id: string;
  bio: string | null;
  experience_years: number | null;
  specializations: string[] | null;
  languages: string[] | null;
  price_per_minute: number | null;
  rating: number | null;
  total_reviews: number | null;
  is_available: boolean | null;
  status: string | null;
  full_name?: string;
  avatar_url?: string | null;
}

const ClientDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [consultations, setConsultations] = useState<ConsultationWithLawyer[]>([]);
  const [lawyers, setLawyers] = useState<LawyerWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchDashboardData();
      
      // Set up realtime subscription for consultations
      const consultationsChannel = supabase
        .channel('client-consultations')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'consultations',
            filter: `client_id=eq.${user.id}`,
          },
          () => {
            fetchDashboardData();
          }
        )
        .subscribe();

      // Set up realtime subscription for lawyer availability
      const lawyersChannel = supabase
        .channel('lawyer-availability-client')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'lawyer_profiles',
          },
          () => {
            fetchLawyers();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(consultationsChannel);
        supabase.removeChannel(lawyersChannel);
      };
    }
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    await Promise.all([
      fetchProfile(),
      fetchWallet(),
      fetchConsultations(),
      fetchLawyers(),
    ]);
    
    setLoading(false);
  };

  const fetchProfile = async () => {
    if (!user) return;
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();
    if (profileData) setProfile(profileData);
  };

  const fetchWallet = async () => {
    if (!user) return;
    const { data: walletData } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();
    if (walletData) {
      setWalletBalance(Number(walletData.balance) || 0);
    }
  };

  const fetchConsultations = async () => {
    if (!user) return;
    
    const { data: consultationsData } = await supabase
      .from('consultations')
      .select('id, type, status, created_at, total_amount, lawyer_id')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (consultationsData && consultationsData.length > 0) {
      const lawyerIds = [...new Set(consultationsData.map(c => c.lawyer_id))];
      
      const { data: lawyerProfiles } = await supabase
        .from('lawyer_profiles')
        .select('user_id, bio, specializations, rating')
        .in('user_id', lawyerIds);

      const { data: lawyerNames } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', lawyerIds);

      const enrichedConsultations = consultationsData.map(consultation => {
        const lawyerProfile = lawyerProfiles?.find(lp => lp.user_id === consultation.lawyer_id);
        const lawyerName = lawyerNames?.find(ln => ln.id === consultation.lawyer_id);
        return {
          ...consultation,
          lawyer_profile: lawyerProfile || undefined,
          lawyer_name: lawyerName?.full_name || 'Legal Professional',
        };
      });

      setConsultations(enrichedConsultations);
    } else {
      setConsultations([]);
    }
  };

  const fetchLawyers = async () => {
    const { data: lawyerData, error } = await supabase
      .from('lawyer_profiles')
      .select('*')
      .eq('status', 'approved')
      .order('is_available', { ascending: false })
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching lawyers:', error);
      return;
    }

    if (lawyerData && lawyerData.length > 0) {
      const userIds = lawyerData.map(l => l.user_id);
      
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      const enrichedLawyers = lawyerData.map(lawyer => {
        const profile = profilesData?.find(p => p.id === lawyer.user_id);
        return {
          ...lawyer,
          full_name: profile?.full_name || 'Legal Professional',
          avatar_url: profile?.avatar_url,
        };
      });

      setLawyers(enrichedLawyers as LawyerWithProfile[]);
    } else {
      setLawyers([]);
    }
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
      case 'completed': return { variant: 'default' as const, className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
      case 'active': return { variant: 'secondary' as const, className: 'bg-blue-500/10 text-blue-600 border-blue-500/20 animate-pulse' };
      case 'pending': return { variant: 'outline' as const, className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
      default: return { variant: 'destructive' as const, className: 'bg-red-500/10 text-red-600 border-red-500/20' };
    }
  };

  const filteredLawyers = lawyers.filter(lawyer => {
    const specializations = lawyer.specializations?.join(' ').toLowerCase() || '';
    const lawyerName = lawyer.full_name?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return !query || specializations.includes(query) || lawyerName.includes(query);
  });

  const onlineLawyers = filteredLawyers.filter(l => l.is_available);
  const offlineLawyers = filteredLawyers.filter(l => !l.is_available);

  const activeConsultations = consultations.filter(c => c.status === 'active');
  const pendingConsultations = consultations.filter(c => c.status === 'pending');

  if (authLoading || loading) {
    return (
      <MainLayout showFooter={false}>
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-12 w-64 mb-2" />
            <Skeleton className="h-6 w-48 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-40 rounded-2xl" />
              ))}
            </div>
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showFooter={false}>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-10">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Welcome back</p>
                  <h1 className="font-serif text-3xl font-bold">{profile?.full_name || 'User'}</h1>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline" className="gap-1.5">
                  <Activity className="h-3 w-3" />
                  Real-time Sync
                </Badge>
                <Badge variant="secondary" className="gap-1.5">
                  <Shield className="h-3 w-3" />
                  Verified Account
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline"
                onClick={() => navigate('/settings')}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <Button 
                size="lg" 
                className="gap-2 shadow-lg hover:shadow-xl transition-all"
                onClick={() => navigate('/lawyers')}
              >
                <Plus className="h-5 w-5" />
                Browse All Lawyers
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* Wallet Balance */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-primary to-accent">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent opacity-90" />
              <CardContent className="relative p-6 text-primary-foreground">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm opacity-80 font-medium">Wallet Balance</p>
                    <p className="text-4xl font-bold mt-2">${walletBalance.toFixed(2)}</p>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="mt-4 gap-1.5"
                    >
                      <Plus className="h-4 w-4" />
                      Add Funds
                    </Button>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
                    <Wallet className="h-7 w-7" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Sessions */}
            <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Active Sessions</p>
                    <p className="text-4xl font-bold mt-2">{activeConsultations.length}</p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Zap className="h-3 w-3 text-amber-500" />
                      In progress now
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                    <Clock className="h-7 w-7 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Consultations */}
            <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Total Consultations</p>
                    <p className="text-4xl font-bold mt-2">{consultations.length}</p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                      All time
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <MessageSquare className="h-7 w-7 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Lawyers */}
            <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Available Lawyers</p>
                    <p className="text-4xl font-bold mt-2">{onlineLawyers.length}</p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Users className="h-3 w-3 text-emerald-500" />
                      Online now
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <Users className="h-7 w-7 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Consultations Alert */}
          {activeConsultations.length > 0 && (
            <Card className="mb-8 border-2 border-blue-500/30 bg-blue-500/5 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                  </span>
                  Active Consultations
                </CardTitle>
                <CardDescription>You have ongoing sessions that need your attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeConsultations.map((consultation) => (
                    <div 
                      key={consultation.id} 
                      className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/consultation/${consultation.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{consultation.lawyer_name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            {getTypeIcon(consultation.type)}
                            <span className="capitalize">{consultation.type} Session</span>
                          </div>
                        </div>
                      </div>
                      <Button className="gap-2 group-hover:gap-3 transition-all">
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Available Lawyers Section */}
          <Card className="mb-8 border-0 shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Users className="h-5 w-5" />
                  Available Lawyers
                </CardTitle>
                <CardDescription className="mt-1">
                  {onlineLawyers.length} lawyers online • Book instantly via chat, call, or video
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1.5 px-3 py-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Live Updates
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name or specialization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base bg-background border-border"
                />
              </div>

              {filteredLawyers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">No Lawyers Found</h3>
                  <p className="text-muted-foreground text-sm">
                    {searchQuery ? 'Try adjusting your search' : 'No lawyers are available at the moment'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Online Lawyers */}
                  {onlineLawyers.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-full">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span className="font-medium text-sm">Available Now</span>
                        </div>
                        <span className="text-muted-foreground text-sm">
                          {onlineLawyers.length} lawyer{onlineLawyers.length !== 1 ? 's' : ''} online
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {onlineLawyers.slice(0, 6).map((lawyer) => (
                          <LawyerCard 
                            key={lawyer.id} 
                            lawyer={lawyer} 
                            showActions={true}
                            onBooking={fetchDashboardData}
                          />
                        ))}
                      </div>
                      {onlineLawyers.length > 6 && (
                        <div className="text-center mt-6">
                          <Button variant="outline" onClick={() => navigate('/lawyers')} className="gap-2">
                            View All {onlineLawyers.length} Online Lawyers
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Offline Lawyers */}
                  {offlineLawyers.length > 0 && (
                    <div>
                      {onlineLawyers.length > 0 && (
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-muted-foreground"></span>
                            <span className="font-medium text-sm text-muted-foreground">Currently Offline</span>
                          </div>
                          <span className="text-muted-foreground text-sm">
                            {offlineLawyers.length} lawyer{offlineLawyers.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {offlineLawyers.slice(0, 3).map((lawyer) => (
                          <LawyerCard 
                            key={lawyer.id} 
                            lawyer={lawyer} 
                            showActions={true}
                            onBooking={fetchDashboardData}
                          />
                        ))}
                      </div>
                      {offlineLawyers.length > 3 && (
                        <div className="text-center mt-6">
                          <Button variant="ghost" onClick={() => navigate('/lawyers')} className="gap-2">
                            View All Lawyers
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Consultation History */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <History className="h-5 w-5" />
                  Consultation History
                </CardTitle>
                <CardDescription className="mt-1">Your recent legal consultations</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {consultations.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-20 h-20 rounded-full bg-secondary mx-auto mb-6 flex items-center justify-center">
                    <MessageSquare className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Consultations Yet</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                    Start your first consultation with a verified legal professional today
                  </p>
                  <Button onClick={() => navigate('/lawyers')} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Find a Lawyer
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {consultations.map((consultation) => {
                    const statusConfig = getStatusConfig(consultation.status);
                    return (
                      <div 
                        key={consultation.id} 
                        className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/20 hover:bg-secondary/30 transition-all cursor-pointer group"
                        onClick={() => navigate(`/consultation/${consultation.id}`)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                            <User className="h-6 w-6 text-foreground/70" />
                          </div>
                          <div>
                            <p className="font-semibold group-hover:text-primary transition-colors">
                              {consultation.lawyer_name}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1.5">
                                {getTypeIcon(consultation.type)}
                                <span className="capitalize">{consultation.type}</span>
                              </span>
                              <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                              <span>{new Date(consultation.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={statusConfig.className}>
                            {consultation.status}
                          </Badge>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ClientDashboard;
