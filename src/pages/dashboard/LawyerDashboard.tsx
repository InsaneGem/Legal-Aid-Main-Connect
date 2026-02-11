import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// import { MainLayout } from '@/components/layout/MainLayout';
import { LawyerLayout } from '@/components/layout/LawyerLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Wallet, MessageSquare, Clock, Star, User, Edit, Video, Phone, 
  CheckCircle, XCircle, TrendingUp, Zap, Shield, Activity, 
  DollarSign, Users, ArrowRight, AlertTriangle, Settings, History,
  Mail, Calendar
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { OnboardingAlert } from '@/components/dashboard/OnboardingAlert';

interface ConsultationWithClient {
  id: string;
  type: 'chat' | 'audio' | 'video';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  client_id: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  client_avatar?: string | null;
}

const LawyerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [stats, setStats] = useState({
    walletBalance: 0,
    totalConsultations: 0,
    rating: 0,
    totalReviews: 0,
    isAvailable: false,
    status: 'pending',
  });
  const [lawyerProfile, setLawyerProfile] = useState<{
    bio: string | null;
    specializations: string[] | null;
    bar_council_number: string | null;
    price_per_minute: number | null;
    languages: string[] | null;
  } | null>(null);
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [pendingConsultations, setPendingConsultations] = useState<ConsultationWithClient[]>([]);
  const [activeConsultations, setActiveConsultations] = useState<ConsultationWithClient[]>([]);
  const [completedConsultations, setCompletedConsultations] = useState<ConsultationWithClient[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate profile completion
  const { completionPercentage, missingFields } = useMemo(() => {
    if (!lawyerProfile) return { completionPercentage: 0, missingFields: ['All fields'] };
    
    const fields = [
      { key: 'bio', label: 'Professional Bio', check: (lawyerProfile.bio?.trim().length || 0) >= 50 },
      { key: 'specializations', label: 'Specializations', check: (lawyerProfile.specializations?.length || 0) > 0 },
      { key: 'bar_council_number', label: 'Bar Council Number', check: (lawyerProfile.bar_council_number?.trim().length || 0) > 0 },
      { key: 'price_per_minute', label: 'Pricing', check: (lawyerProfile.price_per_minute || 0) >= 1 },
      { key: 'languages', label: 'Languages', check: (lawyerProfile.languages?.length || 0) > 0 },
    ];
    
    const completed = fields.filter(f => f.check).length;
    const missing = fields.filter(f => !f.check).map(f => f.label);
    
    return {
      completionPercentage: Math.round((completed / fields.length) * 100),
      missingFields: missing,
    };
  }, [lawyerProfile]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchDashboardData();
      
      // Set up realtime subscription for lawyer's consultations
      const channel = supabase
        .channel('lawyer-consultations')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'consultations',
            filter: `lawyer_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Realtime update:', payload);
            fetchDashboardData();
            
            // Show toast for new bookings
            if (payload.eventType === 'INSERT') {
              toast({
                title: '🔔 New Consultation Request!',
                description: 'A client has booked a consultation with you.',
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    if (!user) return;

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();

    if (profileData) setProfile(profileData);

    const { data: walletData } = await supabase.from('wallets').select('balance').eq('user_id', user.id).maybeSingle();
    const { data: lawyerProfileData } = await supabase.from('lawyer_profiles').select('*').eq('user_id', user.id).maybeSingle();    
 
    // Fetch all consultations for this lawyer
    const { data: allConsultations } = await supabase
      .from('consultations')
      .select('id, type, created_at, client_id, status')
      .eq('lawyer_id', user.id)
      .order('created_at', { ascending: false });

    setStats({
      walletBalance: Number(walletData?.balance) || 0,
      totalConsultations: lawyerProfileData?.total_consultations || 0,
      rating: Number(lawyerProfileData?.rating) || 0,
      totalReviews: lawyerProfileData?.total_reviews || 0,
      isAvailable: lawyerProfileData?.is_available || false,
      status: lawyerProfileData?.status || 'pending',
    });
     
  // Set lawyer profile for completion calculation
    if (lawyerProfileData) {
      setLawyerProfile({
        bio: lawyerProfileData.bio,
        specializations: lawyerProfileData.specializations,
        bar_council_number: lawyerProfileData.bar_council_number,
        price_per_minute: lawyerProfileData.price_per_minute,
        languages: lawyerProfileData.languages,
      });
    }

    // Enrich consultations with client data
    if (allConsultations && allConsultations.length > 0) {
      const clientIds = [...new Set(allConsultations.map(c => c.client_id))];
      
      const { data: clientProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, avatar_url')
        .in('id', clientIds);

      const enrichConsultation = (consultation: any): ConsultationWithClient => {
        const clientProfile = clientProfiles?.find(cp => cp.id === consultation.client_id);
        return {
          ...consultation,
          client_name: clientProfile?.full_name || 'Client',
          client_email: clientProfile?.email || '',
          client_phone: clientProfile?.phone || '',
          client_avatar: clientProfile?.avatar_url,
        };
      };

      const enrichedConsultations = allConsultations.map(enrichConsultation);
      
      setPendingConsultations(enrichedConsultations.filter(c => c.status === 'pending'));
      setActiveConsultations(enrichedConsultations.filter(c => c.status === 'active'));
      setCompletedConsultations(enrichedConsultations.filter(c => c.status === 'completed'));
    } else {
      setPendingConsultations([]);
      setActiveConsultations([]);
      setCompletedConsultations([]);
    }

    setLoading(false);
  };

  const toggleAvailability = async () => {
    if (!user) return;
    const newStatus = !stats.isAvailable;
    
    const { error } = await supabase.from('lawyer_profiles').update({ is_available: newStatus }).eq('user_id', user.id);

    if (!error) {
      setStats(prev => ({ ...prev, isAvailable: newStatus }));
      toast({ title: newStatus ? '✅ You are now online' : '⏸️ You are now offline' });
    }
  };

  const handleConsultation = async (consultationId: string, action: 'accept' | 'reject') => {
    const newStatus = action === 'accept' ? 'active' : 'cancelled';
    
    const { error } = await supabase
      .from('consultations')
      .update({ 
        status: newStatus,
        started_at: action === 'accept' ? new Date().toISOString() : null,
      })
      .eq('id', consultationId);

    if (!error) {
      toast({ 
        title: action === 'accept' ? '✅ Consultation accepted!' : '❌ Consultation declined',
        description: action === 'accept' ? 'Redirecting to consultation...' : 'The client has been notified.',
      });
      
      if (action === 'accept') {
        navigate(`/consultation/${consultationId}`);
      } else {
        fetchDashboardData();
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Phone className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'audio': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    }
  };

  // Get unique clients who have booked consultations
  const uniqueClients = [...new Map(
    [...pendingConsultations, ...activeConsultations, ...completedConsultations]
      .map(c => [c.client_id, c])
  ).values()];

  if (authLoading || loading) {
    return (
        <LawyerLayout> 
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-12 w-64 mb-2" />
            <Skeleton className="h-6 w-48 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-40 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </LawyerLayout>
    );
  }

  return (
      <LawyerLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-10">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Welcome back</p>
                  <h1 className="font-serif text-3xl font-bold">{profile?.full_name || 'Lawyer'}</h1>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Badge variant="outline" className="gap-1.5">
                  <Activity className="h-3 w-3" />
                  Real-time Sync
                </Badge>
                {stats.status === 'approved' && (
                  <Badge className="gap-1.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    <Shield className="h-3 w-3" />
                    Verified Lawyer
                  </Badge>
                )}
                {stats.status === 'pending' && (
                  <Badge className="gap-1.5 bg-amber-500/10 text-amber-600 border-amber-500/20">
                    <Clock className="h-3 w-3" />
                    Pending Approval
                  </Badge>
                )}
                {stats.status === 'rejected' && (
                  <Badge className="gap-1.5 bg-red-500/10 text-red-600 border-red-500/20">
                    <XCircle className="h-3 w-3" />
                    Not Approved
                  </Badge>
                )}
              </div>
            </div>        
            <div className="flex items-center gap-4 flex-wrap">
              {/* <Button variant="outline" className="gap-2" onClick={() => navigate('/settings')}> */}
                {/* edited line below */}
                <Button variant="outline" className="gap-2" onClick={() => navigate('/lawyer/manage-account')}>
                <Settings className="h-4 w-4" />
                {/* Settingssssss
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => navigate('/lawyer/profile-setup')}>
                <Edit className="h-4 w-4" />
                Edit Profile */}
{/* edited line */}
                MANAGE ACCOUNT
              </Button>
              {stats.status === 'approved' && (
                <div className="flex items-center gap-3 bg-card p-3 px-4 rounded-xl border shadow-sm">
                  <div className={`w-3 h-3 rounded-full ${stats.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
                  <span className="text-sm font-medium">{stats.isAvailable ? 'Online' : 'Offline'}</span>
                  <Switch checked={stats.isAvailable} onCheckedChange={toggleAvailability} />
                </div>
              )}
            </div>
          </div>

          <OnboardingAlert 
            status={stats.status}
            completionPercentage={completionPercentage}
            missingFields={missingFields}
          />
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* Earnings */}
            {/* <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-primary to-accent"> */}
                 <Card 
              className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-primary to-accent cursor-pointer hover:-translate-y-1"
              onClick={() => navigate('/lawyer/earnings')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent opacity-90" />
              <CardContent className="relative p-6 text-primary-foreground">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm opacity-80 font-medium">Total Earnings</p>
                    <p className="text-4xl font-bold mt-2">${stats.walletBalance.toFixed(2)}</p>
                    <p className="text-xs opacity-70 mt-2 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Available for withdrawal
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
                    <DollarSign className="h-7 w-7" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4 text-xs opacity-0 group-hover:opacity-80 transition-opacity">
                  View Details <ArrowRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>

            {/* Total Consultations */}
            {/* <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card"> */}
              <Card 
              className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card cursor-pointer hover:-translate-y-1"
              onClick={() => navigate('/lawyer/consultations')}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Consultations</p>
                    <p className="text-4xl font-bold mt-2">{stats.totalConsultations}</p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Users className="h-3 w-3 text-blue-500" />
                      Clients served
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                    <MessageSquare className="h-7 w-7 text-blue-600" />
                  </div>
                </div>
                 <div className="flex items-center gap-1 mt-4 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  View All <ArrowRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>

            {/* Rating */}
            {/* <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card"> */}
              <Card 
              className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card cursor-pointer hover:-translate-y-1"
              onClick={() => navigate('/lawyer/rating')}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Rating</p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-4xl font-bold">{stats.rating.toFixed(1)}</p>
                      <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {stats.totalReviews} reviews
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                    <Star className="h-7 w-7 text-amber-600" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  View Reviews <ArrowRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>

            {/* Pending Requests */}
            {/* <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card"> */}
               <Card 
              className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card cursor-pointer hover:-translate-y-1"
              onClick={() => navigate('/lawyer/pending-requests')}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Pending Requests</p>
                    <p className="text-4xl font-bold mt-2">{pendingConsultations.length}</p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Zap className="h-3 w-3 text-amber-500" />
                      Awaiting response
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                    <Clock className="h-7 w-7 text-amber-600" />
                  </div>
                </div>
                 <div className="flex items-center gap-1 mt-4 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  View All <ArrowRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Consultations */}
          {activeConsultations.length > 0 && (
            <Card className="mb-8 border-2 border-emerald-500/30 bg-emerald-500/5 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                  </span>
                  Active Consultations
                </CardTitle>
                <CardDescription>Sessions currently in progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeConsultations.map((c) => (
                    <div 
                      key={c.id} 
                      className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-emerald-500/30 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/consultation/${c.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center overflow-hidden">
                          {c.client_avatar ? (
                            <img src={c.client_avatar} alt={c.client_name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="h-6 w-6 text-emerald-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{c.client_name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            {getTypeIcon(c.type)}
                            <span className="capitalize">{c.type} Session</span>
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

          {/* Pending Consultations */}
          {pendingConsultations.length > 0 && (
            <Card className="mb-8 border-2 border-amber-500/30 bg-amber-500/5 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Pending Requests
                </CardTitle>
                <CardDescription>Clients waiting for your response</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingConsultations.map((c) => (
                    <div 
                      key={c.id} 
                      className="p-4 bg-card rounded-xl border border-border"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center overflow-hidden">
                            {c.client_avatar ? (
                              <img src={c.client_avatar} alt={c.client_name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="h-7 w-7 text-amber-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-lg">{c.client_name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Mail className="h-3.5 w-3.5" />
                              <span className="truncate">{c.client_email}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge className={getTypeColor(c.type)}>
                                {getTypeIcon(c.type)}
                                <span className="ml-1.5 capitalize">{c.type}</span>
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(c.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            variant="outline"
                            className="gap-1.5 hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/30"
                            onClick={() => handleConsultation(c.id, 'reject')}
                          >
                            <XCircle className="h-4 w-4" />
                            Decline
                          </Button>
                          <Button 
                            size="sm"
                            className="gap-1.5"
                            onClick={() => handleConsultation(c.id, 'accept')}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Accept
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* My Clients Section - Only shows clients who have booked */}
          {uniqueClients.length > 0 && (
            <Card className="mb-8 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Users className="h-5 w-5" />
                  My Clients
                </CardTitle>
                <CardDescription>Clients who have booked consultations with you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uniqueClients.slice(0, 6).map((client) => (
                    <div 
                      key={client.client_id}
                      className="p-4 bg-secondary/30 rounded-xl border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
                          {client.client_avatar ? (
                            <img src={client.client_avatar} alt={client.client_name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{client.client_name}</p>
                          <p className="text-sm text-muted-foreground truncate">{client.client_email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Consultation History */}
          {/* <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <History className="h-5 w-5" />
                  Consultation History
                </CardTitle>
                <CardDescription className="mt-1">Your completed consultations</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {completedConsultations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">No Completed Consultations</h3>
                  <p className="text-muted-foreground text-sm">
                    Your completed consultations will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {completedConsultations.slice(0, 10).map((c) => (
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
                          <p className="font-semibold group-hover:text-primary transition-colors">
                            {c.client_name}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1.5">
                              {getTypeIcon(c.type)}
                              <span className="capitalize">{c.type}</span>
                            </span>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                            <span>{new Date(c.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          Completed
                        </Badge>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card> */}
        </div>
      </div>
    </LawyerLayout>
  );
};

export default LawyerDashboard;
