import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LawyerLayout } from '@/components/layout/LawyerLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatLawyerName } from '@/lib/lawyer-utils';
import { calculateAge } from '@/lib/ageUtils';
import dashboardHeroBg from '@/assets/Header.jpg';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Wallet, MessageSquare, Clock, Star, User, Edit, Video, Phone,
  CheckCircle, XCircle, TrendingUp, Zap, Shield, Activity,
  DollarSign, Users, ArrowRight, AlertTriangle, Settings, History,
  Mail, Calendar,
  BadgeCheck,
  Scale,
  ChevronRight,
  CakeSlice,
  Verified,
  Bell, Timer, FileText
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { OnboardingAlert } from '@/components/dashboard/OnboardingAlert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Consultation from '../Consultation';




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
  client_dob?: string | null;
  total_amount?: number | null;
  ended_at: string | null;
  started_at: string | null;
  duration_minutes: number | null;
  agenda?: string | null;
  payment_status?: string | null;

}
interface IncomingBooking {
  consultation: ConsultationWithClient;
  countdown: number;
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
  // const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [profile, setProfile] = useState<{ full_name: string; avatar_url: string | null } | null>(null);
  const [pendingConsultations, setPendingConsultations] = useState<ConsultationWithClient[]>([]);
  const [activeConsultations, setActiveConsultations] = useState<ConsultationWithClient[]>([]);
  const [completedConsultations, setCompletedConsultations] = useState<ConsultationWithClient[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time incoming booking notification
  const [incomingBooking, setIncomingBooking] = useState<IncomingBooking | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Countdown for incoming booking
  useEffect(() => {
    if (!incomingBooking) return;
    if (incomingBooking.countdown <= 0) {
      // Time expired - auto-dismiss
      clearInterval(countdownRef.current!);
      setIncomingBooking(null);
      toast({
        title: '⏰ Request Expired',
        description: 'You did not respond in time. The request has been auto-cancelled.',
      });
      return;
    }
  }, [incomingBooking?.countdown]);
  const startCountdown = (consultation: ConsultationWithClient) => {
    if (countdownRef.current) clearInterval(countdownRef.current);

    setIncomingBooking({ consultation, countdown: 60 });

    countdownRef.current = setInterval(() => {
      setIncomingBooking(prev => {
        if (!prev || prev.countdown <= 1) {
          clearInterval(countdownRef.current!);
          return null;
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);
    // Play notification sound
    try {
      if (Notification.permission === 'granted') {
        new Notification('🔔 New Consultation Request!', {
          body: `${consultation.client_name} wants a ${consultation.type} consultation`,
          icon: '/favicon.svg',
          tag: 'new-booking',
        });
      }
    } catch (e) { }
  };


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

      // Request notification permission
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      // Set up realtime subscription for lawyer's consultations
      const channel = supabase
        .channel('lawyer-consultations-rt')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'consultations',
            filter: `lawyer_id=eq.${user.id}`,
          },
          async (payload) => {
            const newConsultation = payload.new as any;
            if (newConsultation.status === 'pending') {
              // Fetch client info
              const { data: clientProfile } = await supabase
                .from('profiles')
                .select('full_name, email, phone, avatar_url')
                .eq('id', newConsultation.client_id)
                .single();
              const enriched: ConsultationWithClient = {
                ...newConsultation,
                client_name: clientProfile?.full_name || 'Client',
                client_email: clientProfile?.email || '',
                client_phone: clientProfile?.phone || '',
                client_avatar: clientProfile?.avatar_url,
              };
              startCountdown(enriched);
              fetchDashboardData();
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'consultations',
            filter: `lawyer_id=eq.${user.id}`,
          },
          (payload) => {
            const updated = payload.new as any;
            // If payment completed, notify lawyer
            if (updated.payment_status === 'paid' && updated.status === 'active') {
              toast({
                title: '💰 Payment Received!',
                description: 'The client has completed payment. Consultation is now unlocked.',
              });
            }
            fetchDashboardData();
          }
        )
        .subscribe();

      // Real-time subscription for notifications
      const notificationChannel = supabase
        .channel('lawyer-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const notification = payload.new as { type: string; message: string };
            toast({
              title: '🔔 New Notification',
              description: notification.message || 'You have a new consultation request.',
            });
            fetchDashboardData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(notificationChannel);
      };
    }
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    if (!user) return;

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      // .select('full_name')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    if (profileData) setProfile(profileData);

    const { data: walletData } = await supabase.from('wallets').select('balance').eq('user_id', user.id).maybeSingle();
    const { data: lawyerProfileData } = await supabase.from('lawyer_profiles').select('*').eq('user_id', user.id).maybeSingle();

    // Fetch all consultations for this lawyer
    const { data: allConsultations } = await supabase
      .from('consultations')
      .select('id, type, created_at, client_id, status, duration_minutes, total_amount, started_at, agenda, payment_status, total_amount')
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
        .select('id, full_name, email, phone, avatar_url, date_of_birth')
        .in('id', clientIds);

      const enrichConsultation = (consultation: any): ConsultationWithClient => {
        const clientProfile = clientProfiles?.find(cp => cp.id === consultation.client_id);
        return {
          ...consultation,
          client_name: clientProfile?.full_name || 'Client',
          client_email: clientProfile?.email || '',
          // client_phone: clientProfile?.phone || '',
          client_avatar: clientProfile?.avatar_url,
          client_dob: clientProfile?.date_of_birth,
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
        // Keep payment_status as 'unpaid' so client gets prompted to pay via Razorpay
      })
      .eq('id', consultationId);

    if (!error) {
      toast({
        title: action === 'accept' ? '✅ Consultation accepted!' : '❌ Consultation declined',
        // description: action === 'accept' ? 'Redirecting to consultation...' : 'The client has been notified.',
        description: action === 'accept'
          ? 'The client will now be prompted to complete payment.'
          : 'The client has been notified.',
      });

      // Dismiss incoming booking dialog if it matches
      if (incomingBooking?.consultation.id === consultationId) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        setIncomingBooking(null);
      }

      // if (action === 'accept') {
      //   navigate(`/lawyer/consultation/${consultationId}`);
      // } else {
      //   fetchDashboardData();
      // }
      fetchDashboardData();
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
  const parseAgenda = (agenda: string | null | undefined) => {
    if (!agenda) return { category: '', urgency: '', details: '' };
    const categoryMatch = agenda.match(/^\[(.+?)\]/);
    const urgencyMatch = agenda.match(/\]\s*\[(.+?)\]/);
    const details = agenda.replace(/^\[.+?\]\s*\[.+?\]\n?/, '');
    return {
      category: categoryMatch?.[1] || '',
      urgency: urgencyMatch?.[1] || '',
      details: details || agenda,
    };
  };
  const uniqueClients = [...new Map(
    [...pendingConsultations, ...activeConsultations, ...completedConsultations]
      .map(c => [c.client_id, c])
  ).values()];

  if (authLoading || loading) {
    return (
      <LawyerLayout>
        {/* ──── Incoming Booking Real-Time Dialog ──── */}
        <Dialog open={!!incomingBooking} onOpenChange={() => { }}>
          <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary animate-bounce" />
                New Consultation Request!
              </DialogTitle>
              <DialogDescription>
                Respond within the time limit
              </DialogDescription>
            </DialogHeader>
            {incomingBooking && (
              <div className="space-y-5">
                {/* Countdown */}
                <div className="flex justify-center">
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                      <circle
                        cx="50" cy="50" r="45" fill="none"
                        stroke={incomingBooking.countdown <= 10 ? 'hsl(0 84% 60%)' : 'hsl(var(--primary))'}
                        strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - incomingBooking.countdown / 60)}`}
                        className="transition-all duration-1000 ease-linear"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-2xl font-bold ${incomingBooking.countdown <= 10 ? 'text-red-500' : ''}`}>
                        {incomingBooking.countdown}s
                      </span>
                    </div>
                  </div>
                </div>
                {/* Client Info */}
                <div className="flex items-center gap-4 p-3 bg-secondary/30 rounded-xl border">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
                    {incomingBooking.consultation.client_avatar ? (
                      <img src={incomingBooking.consultation.client_avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{incomingBooking.consultation.client_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getTypeColor(incomingBooking.consultation.type)}>
                        {getTypeIcon(incomingBooking.consultation.type)}
                        <span className="ml-1 capitalize">{incomingBooking.consultation.type}</span>
                      </Badge>
                      {incomingBooking.consultation.total_amount && (
                        <span className="text-sm font-medium text-primary">
                          ₹{incomingBooking.consultation.total_amount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Agenda Details */}
                {incomingBooking.consultation.agenda && (() => {
                  const { category, urgency, details } = parseAgenda(incomingBooking.consultation.agenda);
                  return (
                    <div className="space-y-2 p-3 bg-secondary/20 rounded-lg border">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <FileText className="h-3 w-3" /> Consultation Agenda
                      </p>
                      {category && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{category}</Badge>
                          {urgency && <Badge variant="outline" className="text-xs">{urgency}</Badge>}
                        </div>
                      )}
                      <p className="text-sm">{details}</p>
                    </div>
                  );
                })()}
                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 gap-1.5 hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/30"
                    onClick={() => handleConsultation(incomingBooking.consultation.id, 'reject')}
                  >
                    <XCircle className="h-4 w-4" />
                    Decline
                  </Button>
                  <Button
                    className="flex-1 gap-1.5"
                    onClick={() => handleConsultation(incomingBooking.consultation.id, 'accept')}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Accept
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

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
          {/* Header Section */}
          <div
            className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between
  mb-10 rounded-2xl p-6 sm:p-8 lg:p-10 overflow-hidden border border-border
  min-h-[280px] sm:min-h-[340px] lg:min-h-[400px] bg-black"
            style={{
              backgroundImage: `url(${dashboardHeroBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/50 backdrop-blur-[2px]" />

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
                    <p className="text-sm text-gray-300">Welcome Back</p>

                    <h1 className="font-serif text-2xl lg:text-3xl font-bold text-white tracking-tight">
                      {formatLawyerName(profile?.full_name)}
                    </h1>

                    <p className="text-xs text-gray-200 mt-1">
                      Manage consultations, respond to client requests, and grow your legal practice
                    </p>
                  </div>

                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-2 mt-2">

                  <Badge variant="outline" className="gap-1.5 bg-white">
                    <Activity className="h-3 w-3" />
                    Real-time Sync
                  </Badge>

                  {stats.status === 'approved' && (
                    <Badge variant='outline' className="gap-1.5 bg-white">
                      <Shield className="h-3 w-3" />
                      Verified Lawyer
                    </Badge>
                  )}

                  {stats.status === 'pending' && (
                    <Badge variant="outline" className="gap-1.5 bg-indigo-100 text-red-700 border-indigo-200">
                      <Clock className="h-3 w-3" />
                      Pending Approval
                    </Badge>
                  )}

                  {stats.status === 'rejected' && (
                    <Badge variant="outline" className="gap-1.5 bg-indigo-100 text-red-700 border-indigo-200">
                      <XCircle className="h-3 w-3" />
                      ApplicationNot Approved
                    </Badge>
                  )}

                  <Badge variant="outline" className="gap-1.5 bg-white">
                    <Calendar className="h-3 w-3" />
                    {new Date().toLocaleDateString()}
                  </Badge>

                  <Badge variant="outline" className="gap-1.5 bg-white">
                    <Scale className="h-3 w-3" />
                    Legal Professional
                  </Badge>

                  <Badge variant="outline" className="gap-1.5 bg-white">
                    <BadgeCheck className="h-3 w-3" />
                    Licensed Advocate
                  </Badge>

                </div>

                {/* Platform description */}
                <p className="text-sm text-gray-300 mt-4 leading-relaxed">
                  Your professional dashboard to manage client consultations, track legal
                  cases, securely communicate with clients, and provide trusted legal
                  services through the LegalMate platform.
                </p>

              </div>

              {/* RIGHT SIDE */}
              <div className="flex flex-col gap-4 lg:items-end">
                {/* Availability Toggle */}
                {stats.status === 'approved' && (
                  <div className="flex items-center justify-between gap-3 bg-white/10 backdrop-blur-md px-4 py-3 sm:px-5 sm:py-3  rounded-xl border border-white/20  shadow-lg transition-all duration-300  hover:bg-white/15 w-full sm:w-auto">

                    {/* Status Indicator */}
                    <div className="flex items-center gap-2">

                      <div
                        className={`relative flex h-3 w-3 ${stats.isAvailable ? "text-emerald-400" : "text-gray-400"
                          }`}
                      >
                        {stats.isAvailable && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        )}
                        <span
                          className={`relative inline-flex rounded-full h-3 w-3 ${stats.isAvailable ? "bg-emerald-400" : "bg-gray-400"
                            }`}
                        ></span>
                      </div>

                      <span className="text-sm sm:text-base font-medium text-white transition-colors">
                        {stats.isAvailable ? "Available for Clients" : "Currently Offline"}
                      </span>

                    </div>

                    {/* Toggle Switch */}
                    <Switch
                      checked={stats.isAvailable}
                      onCheckedChange={toggleAvailability}
                      className="data-[state=checked]:bg-emerald-500 transition-all duration-300"
                    />

                  </div>
                )}

              </div>

            </div>
          </div>

          <OnboardingAlert
            status={stats.status}
            completionPercentage={completionPercentage}
            missingFields={missingFields}
          />
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">

            {/* Earnings */}
            <Card
              onClick={() => navigate('/lawyer/earnings')}
              className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-primary to-accent"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent opacity-90" />

              <CardContent className="relative p-4 sm:p-5 text-primary-foreground">
                <div className="flex items-center justify-between gap-2">

                  <div className="min-w-0 space-y-1">
                    <p className="text-xs sm:text-sm opacity-80 font-medium">
                      Total Earnings
                    </p>

                    <p className="text-2xl sm:text-3xl font-bold truncate">
                      ₹{stats.walletBalance.toFixed(2)}
                    </p>

                    <p className="text-[10px] sm:text-xs opacity-80 flex items-center gap-1">
                      <TrendingUp className="h-2.5 w-2.5" />
                      Available for withdrawal
                    </p>

                    <p className="text-[10px] opacity-70">
                      Secure payments
                    </p>

                    <p className="text-[10px] opacity-70">
                      Withdraw anytime to your bank
                    </p>
                  </div>

                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center shrink-0">
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>

                </div>
              </CardContent>
            </Card>


            {/* Consultations */}
            <Card
              onClick={() => navigate('/lawyer/consultations')}
              className="group border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-card"
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2">

                  <div className="min-w-0 space-y-1">
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                      Consultations
                    </p>

                    <p className="text-2xl sm:text-3xl font-bold">
                      {stats.totalConsultations}
                    </p>

                    <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-2.5 w-2.5 text-blue-500" />
                      Clients served
                    </p>

                    <p className="text-[10px] text-muted-foreground">
                      Includes completed & ongoing consultations
                    </p>

                    <p className="text-[10px] text-muted-foreground">
                      Updated in real-time
                    </p>
                  </div>

                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>

                </div>
              </CardContent>
            </Card>


            {/* Rating */}
            <Card
              onClick={() => navigate('/lawyer/rating')}
              className="group border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-card"
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2">

                  <div className="min-w-0 space-y-1">
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                      Rating
                    </p>

                    <div className="flex items-center gap-1">
                      <p className="text-2xl sm:text-3xl font-bold">
                        {stats.rating.toFixed(1)}
                      </p>
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    </div>

                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {stats.totalReviews} client reviews
                    </p>

                    <p className="text-[10px] text-muted-foreground">
                      Based on completed consultations
                    </p>

                    <p className="text-[10px] text-muted-foreground">
                      Trusted legal professional rating
                    </p>
                  </div>

                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Star className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                  </div>

                </div>
              </CardContent>
            </Card>


            {/* Pending Requests */}
            <Card
              onClick={() => navigate('/lawyer/pending-requests')}
              className="group border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-card"
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2">

                  <div className="min-w-0 space-y-1">
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                      Pending Requests
                    </p>

                    <p className="text-2xl sm:text-3xl font-bold">
                      {pendingConsultations.length}
                    </p>

                    <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                      <Zap className="h-2.5 w-2.5 text-amber-500" />
                      Awaiting response
                    </p>

                    <p className="text-[10px] text-muted-foreground">
                      Client consultation requests
                    </p>

                    <p className="text-[10px] text-muted-foreground">
                      Accept or decline in real-time
                    </p>
                  </div>

                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                  </div>

                </div>
              </CardContent>
            </Card>

          </div>

          {/* Active Consultations (paid & unlocked) */}
          {activeConsultations.filter(c => c.payment_status === 'paid').length > 0 && (
            <Card className="mb-8 border-2 border-emerald-500/30 bg-emerald-500/5 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                  </span>
                  Active Consultations
                </CardTitle>
                <CardDescription>Sessions ready — client has paid</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeConsultations.filter(c => c.payment_status === 'paid').map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-emerald-500/30 transition-colors cursor-pointer group"
                      // onClick={() => navigate(`/consultation/${c.id}`)}
                      onClick={() => navigate(`/lawyer/consultation/${c.id}`)}
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
                        Start Session
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {/* Accepted but awaiting payment */}
          {activeConsultations.filter(c => c.payment_status === 'unpaid').length > 0 && (
            <Card className="mb-8 border-2 border-blue-500/30 bg-blue-500/5 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Timer className="h-5 w-5 text-blue-500" />
                  Awaiting Client Payment
                </CardTitle>
                <CardDescription>You accepted — waiting for the client to pay</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeConsultations.filter(c => c.payment_status === 'unpaid').map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-primary/20 flex items-center justify-center overflow-hidden">
                          {c.client_avatar ? (
                            <img src={c.client_avatar} alt={c.client_name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="h-6 w-6 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{c.client_name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            {getTypeIcon(c.type)}
                            <span className="capitalize">{c.type}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                        <Clock className="h-3 w-3 mr-1" />
                        Payment Pending
                      </Badge>
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
                  {pendingConsultations.map((c) => {
                    const { category, urgency, details } = parseAgenda(c.agenda);
                    return (
                      <div key={c.id} className="p-4 bg-card rounded-xl border border-border">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center overflow-hidden">
                              {c.client_avatar ? (
                                <img src={c.client_avatar} alt={c.client_name} className="w-full h-full object-cover" />
                              ) : (
                                <User className="h-7 w-7 text-amber-600" />
                              )}
                              {calculateAge(c.client_dob) !== null && (
                                <span>• {calculateAge(c.client_dob)} yrs</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-lg">{c.client_name}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Mail className="h-3.5 w-3.5" />
                                <span className="truncate">{c.client_email}</span>
                              </div>
                              <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <Badge className={getTypeColor(c.type)}>
                                  {getTypeIcon(c.type)}
                                  <span className="ml-1.5 capitalize">{c.type}</span>
                                </Badge>
                                {category && <Badge variant="outline" className="text-xs">{category}</Badge>}
                                {urgency && <Badge variant="outline" className="text-xs">{urgency}</Badge>}
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(c.created_at).toLocaleString()}
                                </span>
                              </div>
                              {details && (
                                <div className="mt-2 p-2 bg-secondary/50 rounded-lg">
                                  <p className="text-xs text-muted-foreground font-medium mb-1">📋 Client's Issue:</p>
                                  <p className="text-sm">{details}</p>
                                </div>
                              )}
                              {c.total_amount && (
                                <p className="text-sm font-medium text-primary mt-2">Session: ₹{c.total_amount}</p>
                              )}
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
                          {/* </div>
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
                          </Button> */}
                        </div>
                      </div>
                      //   </div>
                      // ))}
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* My Clients Section */}
          {uniqueClients.length > 0 && (
            <Card className="mb-8 border-0 shadow-lg">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Users className="h-5 w-5 text-primary" />
                    My Clients
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Clients who booked consultations
                  </CardDescription>
                </div>

                {uniqueClients.length > 4 && (
                  <Button size="sm" variant="outline">
                    View More
                  </Button>
                )}
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

                  {uniqueClients.slice(0, 4).map((c) => (
                    <div
                      key={c.id}
                      onClick={() => window.location.href = "#"}
                      className="cursor-pointer rounded-lg border border-border bg-background p-3 hover:border-primary/40 hover:shadow-md transition-all duration-200"
                    >
                      {/* Top Section */}
                      <div className="flex items-center gap-2">

                        <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                          {c.client_avatar ? (
                            <img
                              src={c.client_avatar}
                              alt={c.client_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5 text-primary" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">
                            {c.client_name}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {c.client_email}
                          </p>
                        </div>
                        <span className="flex items-center gap-1 text-[11px] px-5 py-5 font-medium capitalize text-green-700">
                          <Verified className="h-4 w-4 bg-green-50  " />
                          {c.status}
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="border-t my-2"></div>

                      {/* Client Details */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">


                        <span className="flex items-center gap-1 ">
                          <CakeSlice className="h-3 w-3 bg-blue-50 text-blue-700" />
                          {calculateAge(c.client_dob)} yrs
                        </span>

                        <span className="flex items-center gap-1  ">
                          {getTypeIcon(c.type)}
                          <span className="capitalize">{c.type}</span>
                        </span>



                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 bg-yellow-50 text-yellow-700" />
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>

                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 bg-red-50 text-red-700" />
                          {c.duration_minutes} min
                        </span>
                      </div>

                    </div>
                  ))}

                </div>
              </CardContent>
            </Card>
          )}


        </div>
      </div>
    </LawyerLayout>
  );
};

export default LawyerDashboard;
