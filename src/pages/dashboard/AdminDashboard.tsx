import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users, Briefcase, TrendingUp, CheckCircle, XCircle, Clock, Shield, Eye,
  GraduationCap, Languages, DollarSign, Search, Edit, Ban, UserCheck,
  MessageSquare, Calendar, Wallet, Save, CreditCard, ArrowDownUp, Trash2, FileText
} from 'lucide-react';
import { DocumentVerification } from '@/components/admin/DocumentVerification';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { formatLawyerName } from '@/lib/lawyer-utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LawyerVerificationPanel } from '@/components/admin/LawyerVerificationPanel';

interface LawyerProfile {
  id: string;
  user_id: string;
  bio: string | null;
  education: string | null;
  bar_council_number: string | null;
  experience_years: number | null;
  specializations: string[] | null;
  languages: string[] | null;
  price_per_minute: number | null;
  session_price: number | null;
  status: string | null;
  is_available: boolean | null;
  rating: number | null;
  total_consultations: number | null;
  created_at: string;
  full_name?: string;
  email?: string;
}

interface ClientProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  wallet_balance?: number;
  total_consultations?: number;
}

interface Consultation {
  id: string;
  client_id: string;
  lawyer_id: string;
  type: string;
  status: string;
  total_amount: number | null;
  commission_amount: number | null;
  lawyer_amount: number | null;
  notes: string | null;
  created_at: string;
  client_name?: string;
  lawyer_name?: string;
}

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  description: string | null;
  created_at: string;
  user_name?: string;
}

interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  bank_details: any;
  created_at: string;
  user_name?: string;
}

const AdminDashboard = () => {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stats, setStats] = useState({ totalClients: 0, totalLawyers: 0, pendingLawyers: 0, totalConsultations: 0, totalRevenue: 0 });
  const [lawyers, setLawyers] = useState<LawyerProfile[]>([]);
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected items for editing
  const [selectedLawyer, setSelectedLawyer] = useState<LawyerProfile | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

  // Dialog states
  const [lawyerEditOpen, setLawyerEditOpen] = useState(false);
  const [clientEditOpen, setClientEditOpen] = useState(false);
  const [consultationEditOpen, setConsultationEditOpen] = useState(false);

  // Edit form states
  const [editLawyerForm, setEditLawyerForm] = useState<Partial<LawyerProfile>>({});
  const [editClientForm, setEditClientForm] = useState<Partial<ClientProfile & { wallet_balance: number }>>({});
  const [editConsultationForm, setEditConsultationForm] = useState<Partial<Consultation>>({});

  const [searchTerm, setSearchTerm] = useState('');
  const [lawyerFilter, setLawyerFilter] = useState<string>('all');

  useEffect(() => {
    if (!authLoading) {
      if (!user) { navigate('/login'); return; }
      if (role !== 'admin') { navigate('/dashboard'); return; }
      fetchDashboardData();
    }
  }, [user, role, authLoading]);

  // Realtime subscriptions for live data updates
  useEffect(() => {
    if (!user || role !== 'admin') return;

    const channel = supabase
      .channel('admin-dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        console.log('Profiles changed - refreshing data');
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lawyer_profiles' }, () => {
        console.log('Lawyer profiles changed - refreshing data');
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallets' }, () => {
        console.log('Wallets changed - refreshing data');
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'consultations' }, () => {
        console.log('Consultations changed - refreshing data');
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        console.log('Transactions changed - refreshing data');
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawal_requests' }, () => {
        console.log('Withdrawals changed - refreshing data');
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_roles' }, () => {
        console.log('User roles changed - refreshing data');
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, role]);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const [clientsRes, lawyersRes, pendingRes, consultationsRes] = await Promise.all([
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
        supabase.from('lawyer_profiles').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('lawyer_profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('consultations').select('*', { count: 'exact', head: true }),
      ]);

      const { data: revenueData } = await supabase
        .from('consultations')
        .select('commission_amount')
        .eq('status', 'completed');

      const totalRevenue = revenueData?.reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0;

      setStats({
        totalClients: clientsRes.count || 0,
        totalLawyers: lawyersRes.count || 0,
        pendingLawyers: pendingRes.count || 0,
        totalConsultations: consultationsRes.count || 0,
        totalRevenue,
      });

      // Fetch all lawyers
      const { data: lawyersData } = await supabase
        .from('lawyer_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (lawyersData) {
        const userIds = lawyersData.map(l => l.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        const enrichedLawyers = lawyersData.map(lawyer => {
          const profile = profiles?.find(p => p.id === lawyer.user_id);
          return {
            ...lawyer,
            // full_name: profile?.full_name || 'Unknown',
            full_name: formatLawyerName(profile?.full_name, 'Unknown'),
            email: profile?.email || 'N/A',
          };
        });
        setLawyers(enrichedLawyers);
      }

      // Fetch all clients
      const { data: clientRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'client');

      if (clientRoles) {
        const clientUserIds = clientRoles.map(r => r.user_id);
        const { data: clientProfiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', clientUserIds);

        const { data: wallets } = await supabase
          .from('wallets')
          .select('user_id, balance')
          .in('user_id', clientUserIds);

        const { data: consultationCounts } = await supabase
          .from('consultations')
          .select('client_id')
          .in('client_id', clientUserIds);

        const enrichedClients = (clientProfiles || []).map(client => {
          const wallet = wallets?.find(w => w.user_id === client.id);
          const consultCount = consultationCounts?.filter(c => c.client_id === client.id).length || 0;
          return {
            ...client,
            wallet_balance: wallet?.balance || 0,
            total_consultations: consultCount,
          };
        });
        setClients(enrichedClients);
      }

      // Fetch consultations
      const { data: consultationsData } = await supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (consultationsData) {
        const allUserIds = [...new Set([
          ...consultationsData.map(c => c.client_id),
          ...consultationsData.map(c => c.lawyer_id)
        ])];

        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', allUserIds);

        const enrichedConsultations = consultationsData.map(consultation => {
          const clientProfile = allProfiles?.find(p => p.id === consultation.client_id);
          const lawyerProfile = allProfiles?.find(p => p.id === consultation.lawyer_id);
          return {
            ...consultation,
            client_name: clientProfile?.full_name || 'Unknown',
            // lawyer_name: lawyerProfile?.full_name || 'Unknown',
            lawyer_name: formatLawyerName(lawyerProfile?.full_name, 'Unknown'),
          };
        });
        setConsultations(enrichedConsultations);
      }

      // Fetch transactions
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (transactionsData) {
        const txUserIds = [...new Set(transactionsData.map(t => t.user_id))];
        const { data: txProfiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', txUserIds);

        const enrichedTransactions = transactionsData.map(tx => {
          const profile = txProfiles?.find(p => p.id === tx.user_id);
          return { ...tx, user_name: profile?.full_name || 'Unknown' };
        });
        setTransactions(enrichedTransactions);
      }

      // Fetch withdrawals
      const { data: withdrawalsData } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (withdrawalsData) {
        const wdUserIds = [...new Set(withdrawalsData.map(w => w.user_id))];
        const { data: wdProfiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', wdUserIds);

        const enrichedWithdrawals = withdrawalsData.map(wd => {
          const profile = wdProfiles?.find(p => p.id === wd.user_id);
          return { ...wd, user_name: profile?.full_name || 'Unknown' };
        });
        setWithdrawals(enrichedWithdrawals);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // LAWYER EDIT FUNCTIONS
  const openLawyerEdit = (lawyer: LawyerProfile) => {
    setSelectedLawyer(lawyer);
    setEditLawyerForm({
      bio: lawyer.bio || '',
      education: lawyer.education || '',
      bar_council_number: lawyer.bar_council_number || '',
      experience_years: lawyer.experience_years || 0,
      price_per_minute: lawyer.price_per_minute || 0,
      session_price: lawyer.session_price || 0,
      status: lawyer.status,
      is_available: lawyer.is_available,
      specializations: lawyer.specializations || [],
      languages: lawyer.languages || [],
    });
    setLawyerEditOpen(true);
  };

  const saveLawyerEdit = async () => {
    if (!selectedLawyer) return;

    const { error } = await supabase
      .from('lawyer_profiles')
      .update({
        bio: editLawyerForm.bio,
        education: editLawyerForm.education,
        bar_council_number: editLawyerForm.bar_council_number,
        experience_years: editLawyerForm.experience_years,
        price_per_minute: editLawyerForm.price_per_minute,
        session_price: editLawyerForm.session_price,
        status: editLawyerForm.status as any,
        is_available: editLawyerForm.is_available,
        specializations: editLawyerForm.specializations,
        languages: editLawyerForm.languages,
      })
      .eq('id', selectedLawyer.id);

    if (!error) {
      toast({ title: 'Success', description: 'Lawyer profile updated.' });
      fetchDashboardData();
      setLawyerEditOpen(false);
    } else {
      toast({ title: 'Error', description: 'Failed to update lawyer.', variant: 'destructive' });
    }
  };

  // CLIENT EDIT FUNCTIONS
  const openClientEdit = (client: ClientProfile) => {
    setSelectedClient(client);
    setEditClientForm({
      full_name: client.full_name,
      email: client.email,
      phone: client.phone || '',
      wallet_balance: client.wallet_balance || 0,
    });
    setClientEditOpen(true);
  };

  const saveClientEdit = async () => {
    if (!selectedClient) return;

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: editClientForm.full_name,
        phone: editClientForm.phone,
      })
      .eq('id', selectedClient.id);

    // Update wallet balance
    const { error: walletError } = await supabase
      .from('wallets')
      .update({ balance: editClientForm.wallet_balance })
      .eq('user_id', selectedClient.id);

    if (!profileError && !walletError) {
      toast({ title: 'Success', description: 'Client profile updated.' });
      fetchDashboardData();
      setClientEditOpen(false);
    } else {
      toast({ title: 'Error', description: 'Failed to update client.', variant: 'destructive' });
    }
  };

  // CONSULTATION EDIT FUNCTIONS
  const openConsultationEdit = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setEditConsultationForm({
      status: consultation.status,
      total_amount: consultation.total_amount,
      commission_amount: consultation.commission_amount,
      lawyer_amount: consultation.lawyer_amount,
      notes: consultation.notes || '',
    });
    setConsultationEditOpen(true);
  };

  const saveConsultationEdit = async () => {
    if (!selectedConsultation) return;

    const { error } = await supabase
      .from('consultations')
      .update({
        status: editConsultationForm.status as any,
        total_amount: editConsultationForm.total_amount,
        commission_amount: editConsultationForm.commission_amount,
        lawyer_amount: editConsultationForm.lawyer_amount,
        notes: editConsultationForm.notes,
      })
      .eq('id', selectedConsultation.id);

    if (!error) {
      toast({ title: 'Success', description: 'Consultation updated.' });
      fetchDashboardData();
      setConsultationEditOpen(false);
    } else {
      toast({ title: 'Error', description: 'Failed to update consultation.', variant: 'destructive' });
    }
  };

  // WITHDRAWAL STATUS UPDATE
  const updateWithdrawalStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('withdrawal_requests')
      .update({ status, processed_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      toast({ title: 'Success', description: `Withdrawal ${status}.` });
      fetchDashboardData();
    } else {
      toast({ title: 'Error', description: 'Failed to update withdrawal.', variant: 'destructive' });
    }
  };

  // LAWYER APPROVAL FUNCTIONS
  const approveLawyer = async (lawyer: LawyerProfile) => {
    const { error } = await supabase
      .from('lawyer_profiles')
      .update({ status: 'approved' })
      .eq('id', lawyer.id);

    if (!error) {
      toast({ title: 'Lawyer Approved', description: `${lawyer.full_name} is now approved and visible to clients.` });
      fetchDashboardData();
    } else {
      toast({ title: 'Error', description: 'Failed to approve lawyer.', variant: 'destructive' });
    }
  };

  const rejectLawyer = async (lawyer: LawyerProfile) => {
    const { error } = await supabase
      .from('lawyer_profiles')
      .update({ status: 'rejected' })
      .eq('id', lawyer.id);

    if (!error) {
      toast({ title: 'Lawyer Rejected', description: `${lawyer.full_name} has been rejected.` });
      fetchDashboardData();
    } else {
      toast({ title: 'Error', description: 'Failed to reject lawyer.', variant: 'destructive' });
    }
  };

  // DELETE FUNCTIONS
  const deleteLawyer = async (lawyer: LawyerProfile) => {
    if (!confirm(`Are you sure you want to delete lawyer ${lawyer.full_name}? This will also delete their profile and role.`)) return;

    try {
      // Delete lawyer profile first
      const { error: lawyerError } = await supabase
        .from('lawyer_profiles')
        .delete()
        .eq('id', lawyer.id);

      if (lawyerError) throw lawyerError;

      // Delete user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', lawyer.user_id);

      if (roleError) throw roleError;

      // Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', lawyer.user_id);

      if (profileError) throw profileError;

      // Delete wallet
      await supabase
        .from('wallets')
        .delete()
        .eq('user_id', lawyer.user_id);

      toast({ title: 'Success', description: 'Lawyer deleted successfully.' });
      fetchDashboardData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete lawyer.', variant: 'destructive' });
    }
  };

  const deleteClient = async (client: ClientProfile) => {
    if (!confirm(`Are you sure you want to delete client ${client.full_name}? This will also delete their profile and wallet.`)) return;

    try {
      // Delete user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', client.id);

      if (roleError) throw roleError;

      // Delete wallet
      await supabase
        .from('wallets')
        .delete()
        .eq('user_id', client.id);

      // Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', client.id);

      if (profileError) throw profileError;

      toast({ title: 'Success', description: 'Client deleted successfully.' });
      fetchDashboardData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete client.', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Rejected</Badge>;
      case 'suspended':
        return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">Suspended</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getConsultationStatusBadge = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Completed</Badge>;
      case 'active':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Active</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredLawyers = lawyers.filter(lawyer => {
    const matchesSearch = lawyer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lawyer.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = lawyerFilter === 'all' || lawyer.status === lawyerFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredClients = clients.filter(client =>
    client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <MainLayout showFooter={false}>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showFooter={false}>
      <div className="min-h-screen bg-secondary/30">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Shield className="h-8 w-8" />
            <div>
              <h1 className="font-serif text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Full control over platform data</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Clients</p>
                    <p className="text-2xl font-bold">{stats.totalClients}</p>
                  </div>
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Lawyers</p>
                    <p className="text-2xl font-bold">{stats.totalLawyers}</p>
                  </div>
                  <Briefcase className="h-6 w-6 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">{stats.pendingLawyers}</p>
                  </div>
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Consultations</p>
                    <p className="text-2xl font-bold">{stats.totalConsultations}</p>
                  </div>
                  <MessageSquare className="h-6 w-6 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(0)}</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different sections */}
          <Tabs defaultValue="verification" className="space-y-6">
            <TabsList className="grid w-full max-w-3xl grid-cols-6">
              <TabsTrigger value="verification" className="flex items-center gap-1 text-xs">
                <Briefcase className="h-3 w-3" />
                Verification
              </TabsTrigger>
              <TabsTrigger value="lawyers" className="flex items-center gap-1 text-xs">
                <Briefcase className="h-3 w-3" />
                Lawyers
              </TabsTrigger>
              <TabsTrigger value="clients" className="flex items-center gap-1 text-xs">
                <Users className="h-3 w-3" />
                Clients
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-1 text-xs">
                <FileText className="h-3 w-3" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="consultations" className="flex items-center gap-1 text-xs">
                <MessageSquare className="h-3 w-3" />
                Sessions
              </TabsTrigger>
              <TabsTrigger value="transactions" className="flex items-center gap-1 text-xs">
                <CreditCard className="h-3 w-3" />
                Transactions
              </TabsTrigger>
              <TabsTrigger value="withdrawals" className="flex items-center gap-1 text-xs">
                <ArrowDownUp className="h-3 w-3" />
                Withdrawals
              </TabsTrigger>
            </TabsList>

            {/* Lawyer Verification Tab - NEW */}
            <TabsContent value="verification">
              <LawyerVerificationPanel onRefresh={fetchDashboardData} />
            </TabsContent>

            {/* Lawyers Tab */}
            <TabsContent value="lawyers">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle>Manage Lawyers</CardTitle>
                    <div className="flex gap-2">
                      <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search lawyers..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <Select value={lawyerFilter} onValueChange={setLawyerFilter}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Experience</TableHead>
                          <TableHead>Pricing</TableHead>
                          <TableHead>Available</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLawyers.map((lawyer) => (
                          <TableRow key={lawyer.id}>
                            <TableCell className="font-medium">{lawyer.full_name}</TableCell>
                            <TableCell className="text-muted-foreground text-xs">{lawyer.email}</TableCell>
                            <TableCell>{getStatusBadge(lawyer.status)}</TableCell>
                            <TableCell>{lawyer.experience_years || 0} yrs</TableCell>
                            <TableCell className="text-xs">₹{lawyer.price_per_minute}/min</TableCell>
                            <TableCell>
                              <Badge variant={lawyer.is_available ? "default" : "outline"}>
                                {lawyer.is_available ? 'Online' : 'Offline'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                {lawyer.status === 'pending' && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-green-600 hover:text-green-700 hover:bg-green-100"
                                      onClick={() => approveLawyer(lawyer)}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-100"
                                      onClick={() => rejectLawyer(lawyer)}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                {lawyer.status === 'rejected' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-100"
                                    onClick={() => approveLawyer(lawyer)}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                {lawyer.status === 'approved' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-100"
                                    onClick={() => rejectLawyer(lawyer)}
                                    title="Reject lawyer"
                                  >
                                    <Ban className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button variant="ghost" size="sm" onClick={() => openLawyerEdit(lawyer)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => deleteLawyer(lawyer)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredLawyers.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              No lawyers found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Clients Tab */}
            <TabsContent value="clients">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle>Manage Clients</CardTitle>
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Wallet</TableHead>
                          <TableHead>Sessions</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredClients.map((client) => (
                          <TableRow key={client.id}>
                            <TableCell className="font-medium">{client.full_name}</TableCell>
                            <TableCell className="text-muted-foreground text-xs">{client.email}</TableCell>
                            <TableCell>{client.phone || 'N/A'}</TableCell>
                            <TableCell>${client.wallet_balance?.toFixed(2) || '0.00'}</TableCell>
                            <TableCell>{client.total_consultations || 0}</TableCell>
                            <TableCell className="text-xs">{new Date(client.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right space-x-1">
                              <Button variant="ghost" size="sm" onClick={() => openClientEdit(client)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => deleteClient(client)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredClients.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              No clients found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {/* Documents Tab */}
            <TabsContent value="documents">
              <DocumentVerification />
            </TabsContent>


            {/* Consultations Tab */}
            <TabsContent value="consultations">
              <Card>
                <CardHeader>
                  <CardTitle>All Consultations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client</TableHead>
                          <TableHead>Lawyer</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {consultations.map((consultation) => (
                          <TableRow key={consultation.id}>
                            <TableCell className="font-medium">{consultation.client_name}</TableCell>
                            <TableCell>{consultation.lawyer_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">{consultation.type}</Badge>
                            </TableCell>
                            <TableCell>{getConsultationStatusBadge(consultation.status)}</TableCell>
                            <TableCell>${consultation.total_amount?.toFixed(2) || '0.00'}</TableCell>
                            <TableCell className="text-xs">{new Date(consultation.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => openConsultationEdit(consultation)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {consultations.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              No consultations found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>All Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell className="font-medium">{tx.user_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">{tx.type.replace('_', ' ')}</Badge>
                            </TableCell>
                            <TableCell className={tx.type === 'deposit' ? 'text-green-600' : ''}>
                              {tx.type === 'deposit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">{tx.description || 'N/A'}</TableCell>
                            <TableCell className="text-xs">{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                        {transactions.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No transactions found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Withdrawals Tab */}
            <TabsContent value="withdrawals">
              <Card>
                <CardHeader>
                  <CardTitle>Withdrawal Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Requested</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {withdrawals.map((wd) => (
                          <TableRow key={wd.id}>
                            <TableCell className="font-medium">{wd.user_name}</TableCell>
                            <TableCell>${wd.amount.toFixed(2)}</TableCell>
                            <TableCell>{getStatusBadge(wd.status)}</TableCell>
                            <TableCell className="text-xs">{new Date(wd.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              {wd.status === 'pending' && (
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => updateWithdrawalStatus(wd.id, 'approved')}>
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => updateWithdrawalStatus(wd.id, 'rejected')}>
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {withdrawals.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No withdrawal requests
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Lawyer Edit Dialog */}
      <Dialog open={lawyerEditOpen} onOpenChange={setLawyerEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lawyer: {selectedLawyer?.full_name}</DialogTitle>
            <DialogDescription>{selectedLawyer?.email}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editLawyerForm.status || ''} onValueChange={(v) => setEditLawyerForm({ ...editLawyerForm, status: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Availability</Label>
                <Select value={editLawyerForm.is_available ? 'online' : 'offline'} onValueChange={(v) => setEditLawyerForm({ ...editLawyerForm, is_available: v === 'online' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={editLawyerForm.bio || ''}
                onChange={(e) => setEditLawyerForm({ ...editLawyerForm, bio: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Education</Label>
                <Input
                  value={editLawyerForm.education || ''}
                  onChange={(e) => setEditLawyerForm({ ...editLawyerForm, education: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Bar Council Number</Label>
                <Input
                  value={editLawyerForm.bar_council_number || ''}
                  onChange={(e) => setEditLawyerForm({ ...editLawyerForm, bar_council_number: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Experience (years)</Label>
                <Input
                  type="number"
                  value={editLawyerForm.experience_years || 0}
                  onChange={(e) => setEditLawyerForm({ ...editLawyerForm, experience_years: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Price/Minute ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editLawyerForm.price_per_minute || 0}
                  onChange={(e) => setEditLawyerForm({ ...editLawyerForm, price_per_minute: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Session Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editLawyerForm.session_price || 0}
                  onChange={(e) => setEditLawyerForm({ ...editLawyerForm, session_price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Specializations (comma-separated)</Label>
              <Input
                value={editLawyerForm.specializations?.join(', ') || ''}
                onChange={(e) => setEditLawyerForm({ ...editLawyerForm, specializations: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Languages (comma-separated)</Label>
              <Input
                value={editLawyerForm.languages?.join(', ') || ''}
                onChange={(e) => setEditLawyerForm({ ...editLawyerForm, languages: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setLawyerEditOpen(false)}>Cancel</Button>
            <Button onClick={saveLawyerEdit}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Client Edit Dialog */}
      <Dialog open={clientEditOpen} onOpenChange={setClientEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client: {selectedClient?.full_name}</DialogTitle>
            <DialogDescription>{selectedClient?.email}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={editClientForm.full_name || ''}
                onChange={(e) => setEditClientForm({ ...editClientForm, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={editClientForm.phone || ''}
                onChange={(e) => setEditClientForm({ ...editClientForm, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Wallet Balance ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={editClientForm.wallet_balance || 0}
                onChange={(e) => setEditClientForm({ ...editClientForm, wallet_balance: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setClientEditOpen(false)}>Cancel</Button>
            <Button onClick={saveClientEdit}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Consultation Edit Dialog */}
      <Dialog open={consultationEditOpen} onOpenChange={setConsultationEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Consultation</DialogTitle>
            <DialogDescription>
              {selectedConsultation?.client_name} → {selectedConsultation?.lawyer_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editConsultationForm.status || ''} onValueChange={(v) => setEditConsultationForm({ ...editConsultationForm, status: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Total Amount ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editConsultationForm.total_amount || 0}
                  onChange={(e) => setEditConsultationForm({ ...editConsultationForm, total_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Commission ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editConsultationForm.commission_amount || 0}
                  onChange={(e) => setEditConsultationForm({ ...editConsultationForm, commission_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Lawyer Amount ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editConsultationForm.lawyer_amount || 0}
                  onChange={(e) => setEditConsultationForm({ ...editConsultationForm, lawyer_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={editConsultationForm.notes || ''}
                onChange={(e) => setEditConsultationForm({ ...editConsultationForm, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setConsultationEditOpen(false)}>Cancel</Button>
            <Button onClick={saveConsultationEdit}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default AdminDashboard;
