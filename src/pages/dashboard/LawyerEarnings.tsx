import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { MainLayout } from '@/components/layout/MainLayout';
import { LawyerLayout } from '@/components/layout/LawyerLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DollarSign, TrendingUp, ArrowLeft, ArrowUpRight, ArrowDownLeft, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
const LawyerEarnings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!authLoading && !user) { navigate('/login'); return; }
    if (user) fetchData();
  }, [user, authLoading]);
  const fetchData = async () => {
    if (!user) return;
    const [{ data: wallet }, { data: txns }] = await Promise.all([
      supabase.from('wallets').select('balance').eq('user_id', user.id).maybeSingle(),
      supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
    ]);
    setWalletBalance(Number(wallet?.balance) || 0);
    setTransactions(txns || []);
    setLoading(false);
  };
  const getTypeStyle = (type: string) => {
    if (type === 'consultation_fee') return { icon: <ArrowDownLeft className="h-4 w-4" />, color: 'text-emerald-600', bg: 'bg-emerald-500/10' };
    if (type === 'withdrawal') return { icon: <ArrowUpRight className="h-4 w-4" />, color: 'text-red-600', bg: 'bg-red-500/10' };
    if (type === 'commission') return { icon: <ArrowUpRight className="h-4 w-4" />, color: 'text-amber-600', bg: 'bg-amber-500/10' };
    return { icon: <DollarSign className="h-4 w-4" />, color: 'text-blue-600', bg: 'bg-blue-500/10' };
  };
  if (authLoading || loading) {
    return (
        <LawyerLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-10 w-48 mb-6" />
            <Skeleton className="h-40 rounded-2xl mb-6" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </LawyerLayout>
    );
  }
  return (
      <LawyerLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" className="gap-2 mb-6" onClick={() => navigate('/lawyer/dashboard')}>
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-accent mb-8">
            <CardContent className="p-8 text-primary-foreground">
              <p className="text-sm opacity-80 font-medium">Total Earnings</p>
              <p className="text-5xl font-bold mt-2">${walletBalance.toFixed(2)}</p>
              <p className="text-sm opacity-70 mt-3 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" /> Available for withdrawal
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <DollarSign className="h-5 w-5" /> Transaction History
              </CardTitle>
              <CardDescription>All your earnings and withdrawals</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                    <DollarSign className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">No Transactions Yet</h3>
                  <p className="text-muted-foreground text-sm">Your transactions will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((t) => {
                    const style = getTypeStyle(t.type);
                    return (
                      <div key={t.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-secondary/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center ${style.color}`}>
                            {style.icon}
                          </div>
                          <div>
                            <p className="font-medium capitalize">{t.type.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(t.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className={`font-bold ${t.type === 'withdrawal' || t.type === 'commission' ? 'text-red-600' : 'text-emerald-600'}`}>
                          {t.type === 'withdrawal' || t.type === 'commission' ? '-' : '+'}${t.amount.toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </LawyerLayout>
  );
};
export default LawyerEarnings;