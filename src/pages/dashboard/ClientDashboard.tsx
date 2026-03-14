import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { MainLayout } from '@/components/layout/MainLayout';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import dashboardHeroBg from '@/assets/Header.jpg';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Wallet, MessageSquare, Clock, Plus, History, User, Video, Phone,
  TrendingUp, Calendar, ArrowRight, Zap, Shield, Activity, Settings,
  Search, Users, Star, Heart,
  Lock,
  CreditCard,
  BadgeCheck,
  Award,
  Globe,
  Eye,
  ArrowDownLeft, ArrowUpRight, FileText,
  Currency,
  IndianRupee
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { LawyerCard } from '@/components/lawyers/LawyerCard';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatLawyerName } from '@/lib/lawyer-utils';
import Consultation from './../Consultation';
import { initiateRazorpayPayment } from '@/lib/razorpay';
import { useToast } from '@/hooks/use-toast';

interface ConsultationWithLawyer {
  id: string;
  type: 'chat' | 'audio' | 'video';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  total_amount: number | null;
  ended_at: string | null;
  started_at: string | null;
  duration_minutes: number | null;
  lawyer_id: string;
  agenda?: string | null;
  payment_status?: string | null;
  lawyer_profile?: {
    bio: string | null;
    specializations: string[] | null;
    rating: number | null;

  };
  lawyer_name?: string;
  lawyer_avatar?: string | null;
}
interface TransactionRecord {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  created_at: string;
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
  date_of_birth?: string | null;
}

const ClientDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [consultations, setConsultations] = useState<ConsultationWithLawyer[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [lawyers, setLawyers] = useState<LawyerWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  // const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [profile, setProfile] = useState<{ full_name: string; avatar_url: string | null } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [payingConsultationId, setPayingConsultationId] = useState<string | null>(null);

  const [showMore, setShowMore] = useState({
    active: false,
    accepted: false,
    pending: false
  });

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
      fetchTransactions(),
    ]);

    setLoading(false);
  };

  const fetchProfile = async () => {
    if (!user) return;
    const { data: profileData } = await supabase
      .from('profiles')
      // .select('full_name')
      .select('full_name, avatar_url')
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
  const fetchTransactions = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('transactions')
      .select('id, type, amount, description, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setTransactions(data || []);
  };
  const handleRazorpayPayment = async (consultationId: string) => {
    setPayingConsultationId(consultationId);
    await initiateRazorpayPayment({
      consultationId,
      onSuccess: (id) => {
        toast({
          title: '✅ Payment Successful!',
          description: 'Consultation is now active. Redirecting...',
        });
        setPayingConsultationId(null);
        fetchDashboardData();
        setTimeout(() => navigate(`/consultation/${id}`), 1500);
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: 'Payment Failed',
          description: error,
        });
        setPayingConsultationId(null);
      },
    });
  };
  const fetchConsultations = async () => {
    if (!user) return;

    const { data: consultationsData } = await supabase
      .from('consultations')
      .select('id, type, status, created_at, total_amount, lawyer_id, started_at, duration_minutes, agenda, payment_status')
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
        .select('id, full_name,avatar_url')
        .in('id', lawyerIds);

      const enrichedConsultations = consultationsData.map(consultation => {
        const lawyerProfile = lawyerProfiles?.find(lp => lp.user_id === consultation.lawyer_id);
        const lawyerName = lawyerNames?.find(ln => ln.id === consultation.lawyer_id);
        return {
          ...consultation,
          lawyer_profile: lawyerProfile || undefined,
          // lawyer_name: lawyerName?.full_name || 'Legal Professional',
          lawyer_name: formatLawyerName(lawyerName?.full_name),
          lawyer_avatar: lawyerName?.avatar_url || null
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
        .select('id, full_name, avatar_url, date_of_birth')
        .in('id', userIds);

      const enrichedLawyers = lawyerData.map(lawyer => {
        const profile = profilesData?.find(p => p.id === lawyer.user_id);
        return {
          ...lawyer,

          full_name: formatLawyerName(profile?.full_name),
          avatar_url: profile?.avatar_url,
          date_of_birth: profile?.date_of_birth,

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
  // Consultations accepted by lawyer but not yet paid
  const acceptedUnpaid = consultations.filter(c => c.status === 'active' && c.payment_status === 'unpaid');

  if (authLoading || loading) {
    return (

      <ClientLayout>
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

      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container mx-auto px-4 py-8">

          {/* Header Section */}
          <div
            className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12 rounded-2xl p-6 sm:p-8 lg:p-10 overflow-hidden border border-border min-h-[280px] sm:min-h-[340px] lg:min-h-[400px] bg-black" style={{
              backgroundImage: `url(${dashboardHeroBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/50 backdrop-blur-[2px]"></div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 w-full">

              {/* LEFT SIDE */}
              <div className="flex flex-col text-sm text-gray-300 max-w-xl">

                {/* Avatar + Greeting */}
                <div className="flex items-center gap-4 mb-4">

                  <Avatar className="h-16 w-16 sm:h-18 sm:w-18 lg:h-20 lg:w-20 ring-2 ring-white/20 shadow-lg">
                    <AvatarImage
                      src={profile?.avatar_url || undefined}
                      alt={profile?.full_name || "User"}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <User className="h-7 w-7" />
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="text-sm text-gray-300">
                      Welcome Back
                    </p>

                    <h1 className="font-serif text-2xl lg:text-3xl font-bold text-white tracking-tight">
                      {profile?.full_name || "Client"}
                    </h1>

                    <p className="text-xs text-gray-200 mt-1">
                      Manage your legal consultations and connect with trusted lawyers
                    </p>
                  </div>
                </div>

                {/* Status badges */}
                <div className="flex flex-wrap items-center gap-2 mt-2">

                  <Badge variant="outline" className="gap-1.5 bg-white ">
                    <Activity className="h-3 w-3" />
                    Real-time Sync
                  </Badge>

                  <Badge variant="outline" className="gap-1.5 bg-white">
                    <Shield className="h-3 w-3" />
                    Verified Account
                  </Badge>

                  <Badge variant="outline" className="gap-1.5 bg-white">
                    <Lock className="h-3 w-3" />
                    Secure Legal Platform
                  </Badge>

                  <Badge variant="outline" className="gap-1.5 bg-white ">
                    <Calendar className="h-3 w-3" />
                    {new Date().toLocaleDateString()}
                  </Badge>

                  <Badge variant="outline" className="gap-1.5 bg-white ">
                    <CreditCard className="h-3 w-3" />
                    Secure Payment
                  </Badge>
                  <Badge variant="outline" className="gap-1.5 bg-white ">
                    <BadgeCheck className="h-3 w-3" />
                    Licensed Lawyer
                  </Badge>

                </div>

                {/* Platform description */}
                <p className="text-sm text-gray-300 mt-4 leading-relaxed">
                  Your secure peer-to-peer platform to connect with verified lawyers,
                  manage legal consultations, track cases, and store important legal
                  documents safely.
                </p>
                {/* <Button
                  variant="outline"
                  onClick={() => navigate('/saved-lawyers')}
                  className="gap-2"
                >
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">Saved</span>
                </Button> */}
              </div>

            </div>

          </div>


          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">

            {/* Wallet Balance */}
            <Card
              onClick={() => navigate("/dashboard/transactions")}
              className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-primary to-accent">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent opacity-90" />
              <CardContent className="relative p-3 sm:p-5 text-primary-foreground h-full flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm opacity-80 font-medium">Transactions</p>
                    <p className="text-xs opacity-70">Your payment history</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </div>
              </CardContent>
            </Card>

            {/* Active Sessions */}
            <Card
              onClick={() => navigate('/dashboard/active-sessions')}
              className="group border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-card"
            >
              <CardContent className="p-3 sm:p-5">
                <div className="flex items-start justify-between gap-2">

                  <div className="flex-1 space-y-1">

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium whitespace-nowrap">

                        {activeConsultations.length > 0 && (
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                          </span>
                        )}

                        <span>Active Session</span>
                      </div>

                      <span className="text-xl sm:text-3xl font-bold leading-none">
                        {activeConsultations.length}
                      </span>
                    </div>

                    <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                      <Zap className="h-3 w-3 text-amber-500" />
                      In progress now
                    </p>

                    <p className="text-[10px] text-muted-foreground">
                      • Lawyers currently assisting clients
                    </p>

                    <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                      • Real-time session tracking
                    </p>

                  </div>

                  {/* <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                  </div> */}

                </div>
              </CardContent>
            </Card>

            {/* Total Consultations */}
            <Card
              onClick={() => navigate("/consultation-history")}
              className="group border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-card"
            >
              <CardContent className="p-3 sm:p-5">
                <div className="flex items-start justify-between gap-2">

                  <div className="flex-1 space-y-1">

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium whitespace-nowrap">
                        <span>Total Consultations</span>
                      </div>

                      <span className="text-xl sm:text-3xl font-bold leading-none">
                        {activeConsultations.length}
                      </span>
                    </div>

                    <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                      All time
                    </p>

                    <p className="text-[10px] text-muted-foreground">
                      • Includes completed & active sessions
                    </p>

                    <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                      • Last updated just now
                    </p>

                  </div>

                  {/* <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-600" />
                  </div> */}

                </div>
              </CardContent>
            </Card>

            {/* Available Lawyers */}
            <Card
              onClick={() => navigate("/lawyers")}
              className="group border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-card"
            >
              <CardContent className="p-3 sm:p-5">
                <div className="flex items-start justify-between gap-2">

                  <div className="flex-1 space-y-1">

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium whitespace-nowrap">
                        <span>Available Lawyers</span>
                      </div>

                      <span className="text-xl sm:text-3xl font-bold leading-none">
                        {onlineLawyers.length}
                      </span>
                    </div>

                    <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3 text-emerald-500" />
                      Online now
                    </p>

                    <p className="text-[10px] text-muted-foreground">
                      • Verified | 24/7 Support
                    </p>

                    <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                      • Updated in real-time
                    </p>

                  </div>

                  {/* <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Users className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-600" />
                  </div> */}

                </div>
              </CardContent>
            </Card>

            {/* Pending Requests */}
            <Card
              onClick={() => navigate('/dashboard/processing')}
              className="group border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-card"
            >
              <CardContent className="p-3 sm:p-5">
                <div className="flex items-start justify-between gap-2">

                  <div className="flex-1 space-y-1">

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium whitespace-nowrap">

                        {pendingConsultations.length > 0 && (
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                          </span>
                        )}

                        <span>Processing</span>
                      </div>

                      <span className="text-xl sm:text-3xl font-bold leading-none">
                        {pendingConsultations.length}
                      </span>
                    </div>

                    <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3 text-amber-500" />
                      Awating for response
                    </p>

                    <p className="text-[10px] text-muted-foreground">
                      • Waiting for Lawyer to confirm your booking
                    </p>

                    <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                      Click to know more.
                    </p>

                  </div>

                  {/* <div className="w-8 h-8 sm:h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-amber-600" />
                  </div> */}

                </div>
              </CardContent>
            </Card>

            {/* Accepted — Complete Payment */}
            <Card
              onClick={() => navigate("/dashboard/payments")}
              className="group border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-card"
            >
              <CardContent className="p-3 sm:p-5">
                <div className="flex items-start justify-between gap-2">

                  <div className="flex-1 space-y-1">

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium whitespace-nowrap">

                        {acceptedUnpaid.length > 0 && (
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                          </span>
                        )}

                        <span>Payment</span>
                      </div>

                      <span className="text-xl sm:text-3xl font-bold leading-none">
                        {acceptedUnpaid.length}
                      </span>
                    </div>

                    <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                      <CreditCard className="h-3 w-3 text-green-500" />
                      Secure and Trusted
                    </p>

                    <p className="text-[10px] text-muted-foreground">
                      • Proceed with the payment, Lawyer is waiting
                    </p>

                    <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                      Click to know more.
                    </p>

                  </div>
                  {/* 
                  <div className="w-8 h-8 sm:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <CreditCard className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-600" />
                  </div> */}

                </div>
              </CardContent>
            </Card>

          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

            {/* Active Consultations */}
            {activeConsultations.length > 0 && (
              <Card className="border border-blue-500/30 bg-blue-500/5 shadow-sm">

                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                    </span>
                    Active Consultations
                  </CardTitle>

                  <CardDescription className="text-xs">
                    Ongoing sessions
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-3 pb-3">

                  {(() => {

                    const isMobile = window.innerWidth < 640
                    const limit = isMobile ? 1 : 2

                    const visible = showMore.active
                      ? activeConsultations
                      : activeConsultations.slice(0, limit)

                    const remaining = activeConsultations.length - limit

                    return (
                      <>

                        <div className="divide-y">

                          {visible.map((consultation) => (

                            <div
                              key={consultation.id}
                              onClick={() => navigate(`/client/consultation/${consultation.id}`)}
                              className="flex items-center justify-between py-2 cursor-pointer hover:bg-blue-500/5 rounded-md px-1"
                            >

                              <div className="flex items-center gap-2 min-w-0">

                                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                                  <User className="h-3.5 w-3.5 text-primary" />
                                </div>

                                <div className="min-w-0">
                                  <p className="text-xs font-medium truncate">
                                    {consultation.lawyer_name}
                                  </p>

                                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    {getTypeIcon(consultation.type)}
                                    <span className="capitalize">{consultation.type}</span>
                                  </div>
                                </div>

                              </div>

                              <Button size="sm" className="h-7 text-xs px-2">
                                Continue
                              </Button>

                            </div>

                          ))}

                        </div>

                        {!showMore.active && remaining > 0 && (
                          <button
                            onClick={() => setShowMore(prev => ({ ...prev, active: true }))}
                            className="mt-2 text-xs text-blue-600 flex items-center gap-1 hover:underline"
                          >
                            Show {remaining} more →
                          </button>
                        )}

                      </>
                    )

                  })()}

                </CardContent>
              </Card>
            )}



            {/* Accepted - Complete Payment */}
            {acceptedUnpaid.length > 0 && (
              <Card className="border border-emerald-500/30 bg-emerald-500/5 shadow-sm">

                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    Payment Pending
                  </CardTitle>

                  <CardDescription className="text-xs">
                    Lawyer accepted request
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-3 pb-3">

                  {(() => {

                    const isMobile = window.innerWidth < 640
                    const limit = isMobile ? 1 : 2

                    const visible = showMore.accepted
                      ? acceptedUnpaid
                      : acceptedUnpaid.slice(0, limit)

                    const remaining = acceptedUnpaid.length - limit

                    return (
                      <>

                        <div className="divide-y">

                          {visible.map((c) => (

                            <div
                              key={c.id}
                              className="flex items-center justify-between py-2 gap-2 hover:bg-emerald-500/5 rounded-md px-1"
                            >

                              <div className="flex items-center gap-2 min-w-0">

                                <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                                  <User className="h-3.5 w-3.5 text-emerald-600" />
                                </div>

                                <div className="min-w-0">

                                  <p className="text-xs font-medium truncate">
                                    {c.lawyer_name}
                                  </p>

                                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    {getTypeIcon(c.type)}
                                    <span className="capitalize">{c.type}</span>
                                    <span>₹{c.total_amount?.toFixed(0)}</span>
                                  </div>

                                </div>

                              </div>

                              <Button
                                size="sm"
                                className="h-7 text-xs px-2"
                                disabled={payingConsultationId === c.id}
                                onClick={() => handleRazorpayPayment(c.id)}
                              >
                                Pay
                              </Button>

                            </div>

                          ))}

                        </div>

                        {!showMore.accepted && remaining > 0 && (
                          <button
                            onClick={() => setShowMore(prev => ({ ...prev, accepted: true }))}
                            className="mt-2 text-xs text-emerald-600 hover:underline"
                          >
                            Show {remaining} more →
                          </button>
                        )}

                      </>
                    )

                  })()}

                </CardContent>
              </Card>
            )}



            {/* Pending Requests */}
            {/* {pendingConsultations.length > 0 && (
              <Card className="border shadow-sm">

                <CardHeader className="pb-2 pt-3 px-4">

                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <Clock className="h-4 w-4 text-amber-600" />
                    Pending Requests
                  </CardTitle>

                  <CardDescription className="text-xs">
                    Awaiting lawyer responseeee
                  </CardDescription>

                </CardHeader>

                <CardContent className="px-3 pb-3">

                  {(() => {

                    const isMobile = window.innerWidth < 640
                    const limit = isMobile ? 1 : 2

                    const visible = showMore.pending
                      ? pendingConsultations
                      : pendingConsultations.slice(0, limit)

                    const remaining = pendingConsultations.length - limit


                    return (
                      <>

                        <div className="divide-y">

                          {visible.map((c) => (

                            <div
                              key={c.id}
                              className="flex items-center justify-between py-2 gap-2 hover:bg-muted/30 rounded-md px-1"
                            >

                              <div className="flex items-center gap-2 min-w-0">

                                <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                                  <User className="h-3.5 w-3.5 text-amber-600" />
                                </div>

                                <div className="min-w-0">

                                  <p className="text-xs font-medium truncate">
                                    {c.lawyer_name}
                                  </p>

                                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    {getTypeIcon(c.type)}
                                    <span className="capitalize">{c.type}</span>
                                  </div>

                                </div>

                              </div>

                              <Badge className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-600">
                                Waiting
                              </Badge>

                            </div>

                          ))}

                        </div>

                        {!showMore.pending && remaining > 0 && (
                          <button
                            onClick={() => setShowMore(prev => ({ ...prev, pending: true }))}
                            className="mt-2 text-xs text-amber-600 hover:underline"
                          >
                            Show {remaining} more →
                          </button>
                        )}

                      </>
                    )

                  })()}

                </CardContent>
              </Card>
            )} */}

          </div>

          {/* Available Lawyers Section */}
          <Card className="mb-8 border-0 shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Users className="h-5 w-5" />
                  Available Lawyers
                </CardTitle>
                <CardDescription className="mt-1">
                  Book instantly via chat, call, or video
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
                          <span className="font-medium text-sm">Available {onlineLawyers.length} lawyer{onlineLawyers.length !== 1 ? 's' : ''} online</span>
                        </div>

                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {onlineLawyers.slice(0, 3).map((lawyer) => (
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
                          <Button variant="outline" onClick={() => navigate('#')} className="gap-2">
                            View All {onlineLawyers.length} Online Lawyerssssss
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
                          <Button variant="ghost" onClick={() => navigate('#')} className="gap-2">
                            View All Lawyers
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
              {/* View All Button */}
              <div className="flex justify-center mt-5">
                <Button
                  variant="outline"
                  size="sm"
                  className="
        flex items-center gap-2
        px-4 py-2
        text-sm
        hover:bg-primary
        hover:text-white
        transition-all
      "
                  onClick={() => navigate("/lawyers")}
                >
                  See More...
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>



          {/* Consultation History */}

          <Card className="border-0 shadow-lg overflow-hidden mb-12">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <History className="h-5 w-5" />
                  Consultation History
                </CardTitle>
                <CardDescription className="mt-1"> Review your previous consultations and track your legal discussions.</CardDescription>
              </div>
            </CardHeader>


            <CardContent className="pt-0">
              {consultations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Consultations Yet</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-4">
                    Start your first consultation with a verified legal professional
                  </p>
                  <Button onClick={() => navigate('/lawyers')} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Find a Lawyer
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">

                  {consultations.slice(0, 3).map((consultation) => {

                    const formattedDate = new Date(consultation.created_at).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )

                    const formattedTime = consultation.started_at
                      ? new Date(consultation.started_at).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                      : null

                    return (

                      <div
                        key={consultation.id}
                        onClick={() => navigate(`/client/consultation/${consultation.id}`)}
                        className="
      w-full
      border
      rounded-xl
      p-4
      bg-card

      hover:shadow-md
      hover:-translate-y-[2px]

      transition-all
      duration-300
      cursor-pointer
      "
                      >

                        {/* TOP ROW */}
                        <div className="flex items-center justify-between gap-3">

                          <div className="flex items-center gap-3">

                            {/* AVATAR */}
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">

                              <Avatar className="h-12 w-12">
                                <AvatarImage src={consultation.lawyer_avatar || undefined} />
                                <AvatarFallback className="bg-primary/20">
                                  <User className='h-6 w-6 text-primary' />
                                </AvatarFallback>
                              </Avatar>

                            </div>

                            {/* NAME */}
                            <div>

                              <p className="font-semibold text-sm sm:text-base">
                                {consultation.lawyer_name}
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {consultation.lawyer_profile?.specializations?.[0] ?? "General Law"}
                              </p>

                            </div>

                          </div>

                          {/* STATUS */}
                          <Badge className="text-xs px-2 py-1 bg-green-100 text-green-700">
                            {consultation.status}
                          </Badge>

                        </div>


                        {/* DETAILS SECTION */}
                        <div className="
      mt-3
      grid
      grid-cols-2
      sm:grid-cols-4
      gap-2
      text-xs
      text-muted-foreground
      ">

                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formattedDate}
                          </div>

                          <div className="flex items-center gap-1">
                            {getTypeIcon(consultation.type)}
                            {consultation.type}
                          </div>

                          {consultation.duration_minutes && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {consultation.duration_minutes} min
                            </div>
                          )}

                          {formattedTime && (
                            <div className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              {formattedTime}
                            </div>
                          )}

                        </div>


                        {/* BOTTOM ROW */}
                        <div className="
      mt-3
      flex
      items-center
      justify-between
      ">

                          {/* PRICE */}
                          <span className="text-sm font-medium text-primary">
                            {consultation.total_amount
                              ? `₹${consultation.total_amount}`
                              : "Free"}
                          </span>


                          {/* RATING */}
                          {consultation.lawyer_profile?.rating && (

                            <div className="flex items-center gap-1 text-sm">

                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />

                              {consultation.lawyer_profile.rating.toFixed(1)}

                            </div>

                          )}

                        </div>


                      </div>

                    )

                  })}
                  {/* View All Button */}
                  <div className="flex justify-center mt-5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="
        flex items-center gap-2
        px-4 py-2
        text-sm
        hover:bg-primary
        hover:text-white
        transition-all
      "
                      onClick={() => navigate("/consultation-history")}
                    >
                      See more...
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>

                </div>

              )}
            </CardContent>
          </Card>
          {/* Platform Trust Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12">

            {[
              { icon: Shield, value: '100%', label: 'Verified Lawyers', desc: 'All attorneys are bar-certified' },
              { icon: Lock, value: 'End-to-End', label: 'Encrypted Chats', desc: 'Your data stays private' },
              { icon: Award, value: '4.8/5', label: 'Client Rating', desc: 'Average satisfaction score' },
              { icon: Globe, value: '24/7', label: 'Always Available', desc: 'Legal help, any time' },
            ].map((item, i) => (
              <div
                key={i}
                className="
          group
          relative
          text-center
          p-4 sm:p-5 lg:p-6
          rounded-xl
          bg-card
          border
          border-border
          shadow-sm
          hover:shadow-lg
          hover:-translate-y-[2px]
          transition-all
          duration-300
          "
              >

                <div
                  className="
            w-10 h-10 sm:w-12 sm:h-12
            rounded-full
            bg-primary/10
            flex
            items-center
            justify-center
            mx-auto
            mb-3
            group-hover:scale-110
            transition
            "
                >
                  <item.icon className="h-5 w-5 text-primary" />
                </div>

                <p className="text-base sm:text-lg font-bold">
                  {item.value}
                </p>

                <p className="text-xs sm:text-sm font-semibold mt-1">
                  {item.label}
                </p>

                <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 leading-relaxed">
                  {item.desc}
                </p>

              </div>
            ))}

          </div>

          {/* Why Clients Trust Us */}
          <div className="mb-8 rounded-2xl bg-primary text-primary-foreground p-6 sm:p-8">
            <div className="text-center mb-6">
              <h2 className="font-serif text-2xl font-bold mb-2">Why Clients Trust LegalMate</h2>
              <p className="text-sm opacity-80 max-w-xl mx-auto">
                We bridge the gap between clients and qualified legal professionals, making expert legal advice accessible, affordable, and convenient for everyone.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: Eye, title: 'Transparent Pricing', desc: 'No hidden fees. See lawyer rates upfront before you book. Pay only for the time you use during consultations.' },
                { icon: Shield, title: 'Verified Professionals', desc: 'Every lawyer on our platform is bar-certified and thoroughly vetted. Your case is in safe, qualified hands.' },
                { icon: Lock, title: 'Confidential & Secure', desc: 'Attorney-client privilege is honored. All communications are encrypted and your personal data is never shared.' },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm">
                  <item.icon className="h-5 w-5 mb-3 opacity-90" />
                  <h4 className="font-semibold text-sm mb-1.5">{item.title}</h4>
                  <p className="text-xs opacity-75 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ClientDashboard;
