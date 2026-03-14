import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import {
    ArrowLeft, RefreshCw, Clock, DollarSign, Wallet, TrendingUp, TrendingDown,
    ArrowDownLeft, ArrowUpRight, Filter, CheckCircle, XCircle, AlertCircle,
    Banknote, CreditCard, RotateCcw, Receipt, ChevronDown
} from 'lucide-react';
type FilterType = 'all' | 'deposit' | 'withdrawal' | 'consultation_fee' | 'commission' | 'refund';
interface Transaction {
    id: string;
    type: string;
    amount: number;
    description: string | null;
    created_at: string;
    reference_id: string | null;
}
const typeConfig: Record<string, { label: string; icon: typeof DollarSign; color: string; bg: string; border: string }> = {
    deposit: { label: 'Deposit', icon: ArrowDownLeft, color: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    withdrawal: { label: 'Withdrawal', icon: ArrowUpRight, color: 'text-orange-600', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    consultation_fee: { label: 'Consultation', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    commission: { label: 'Commission', icon: Banknote, color: 'text-purple-600', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    refund: { label: 'Refund', icon: RotateCcw, color: 'text-teal-600', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
};
const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'deposit', label: 'Deposits' },
    { key: 'withdrawal', label: 'Withdrawals' },
    { key: 'consultation_fee', label: 'Consultations' },
    { key: 'refund', label: 'Refunds' },
];
const ClientTransactionHistory = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [walletBalance, setWalletBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [showAll, setShowAll] = useState(false);
    useEffect(() => {
        if (!authLoading && !user) { navigate('/login'); return; }
        if (user) {
            fetchAll();
            const channel = supabase
                .channel('txn-history')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, () => fetchTransactions())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'wallets', filter: `user_id=eq.${user.id}` }, () => fetchWallet())
                .subscribe();
            return () => { supabase.removeChannel(channel); };
        }
    }, [user, authLoading]);
    const fetchAll = useCallback(async () => {
        if (!user) return;
        await Promise.all([fetchTransactions(), fetchWallet()]);
        setLoading(false);
    }, [user]);
    const fetchWallet = async () => {
        if (!user) return;
        const { data } = await supabase.from('wallets').select('balance').eq('user_id', user.id).maybeSingle();
        setWalletBalance(Number(data?.balance) || 0);
    };
    const fetchTransactions = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        setTransactions(data || []);
    };
    const filtered = activeFilter === 'all' ? transactions : transactions.filter(t => t.type === activeFilter);
    const displayed = showAll ? filtered : filtered.slice(0, 20);
    const totalIn = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const totalOut = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    const getConfig = (type: string) => typeConfig[type] || { label: type, icon: DollarSign, color: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border' };
    if (authLoading || loading) {
        return (
            <ClientLayout>
                <div className="container mx-auto px-4 py-6 max-w-3xl">
                    <Skeleton className="h-8 w-48 mb-4" />
                    <div className="grid grid-cols-3 gap-3 mb-5">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
                    </div>
                    <div className="space-y-3">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
                </div>
            </ClientLayout>
        );
    }
    return (
        <ClientLayout>
            <div className="container mx-auto px-4 py-6 max-w-3xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/dashboard')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="font-serif text-xl sm:text-2xl font-bold flex items-center gap-2">
                                {/* <Receipt className="h-5 w-5 text-primary" /> */}
                                Transaction History
                            </h1>
                            <p className="text-muted-foreground text-xs mt-0.5">All your payment activity in one place</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => fetchAll()} className="gap-1.5 h-8 text-xs">
                        <RefreshCw className="h-3 w-3" />
                    </Button>
                </div>
                {/* Summary Cards */}

                {/* Filters */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
                    <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {filters.map(f => (
                        <Button
                            key={f.key}
                            variant={activeFilter === f.key ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 text-xs px-3 shrink-0"
                            onClick={() => setActiveFilter(f.key)}
                        >
                            {f.label}
                            {f.key !== 'all' && (
                                <span className="ml-1 opacity-70">
                                    ({transactions.filter(t => t.type === f.key).length})
                                </span>
                            )}
                        </Button>
                    ))}
                </div>
                {/* Transaction Count */}
                <p className="text-xs text-muted-foreground mb-3">
                    Showing {displayed.length} of {filtered.length} transactions
                </p>
                {/* Transactions */}
                {filtered.length === 0 ? (
                    <Card className="border-0 shadow-md">
                        <CardContent className="py-14 text-center">
                            <div className="w-14 h-14 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                                <Receipt className="h-7 w-7 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold font-serif">No Transactions Found</h3>
                            <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1">
                                {activeFilter === 'all' ? "You haven't made any transactions yet." : `No ${activeFilter.replace('_', ' ')} transactions found.`}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {displayed.map((txn, index) => {
                            const cfg = getConfig(txn.type);
                            const IconComp = cfg.icon;
                            const isPositive = txn.amount > 0;
                            return (
                                <Card
                                    key={txn.id}
                                    className="border-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden animate-fade-in"
                                    style={{ animationDelay: `${index * 0.04}s` }}
                                >
                                    <CardContent className="p-3">
                                        <div className="flex items-center gap-3">
                                            {/* Icon */}
                                            <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                                                <IconComp className={`h-4 w-4 ${cfg.color}`} />
                                            </div>
                                            {/* Details */}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-sm truncate">{cfg.label}</h3>
                                                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                                        {txn.type.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                                    {txn.description || 'No description'}
                                                </p>
                                            </div>
                                            {/* Amount + Date */}
                                            <div className="text-right shrink-0">
                                                <p className={`text-sm font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {isPositive ? '+' : '-'}${Math.abs(txn.amount).toFixed(2)}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                                                    <Clock className="h-2.5 w-2.5" />
                                                    {new Date(txn.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                        {/* Show More */}
                        {filtered.length > 20 && !showAll && (
                            <Button
                                variant="outline"
                                className="w-full gap-1.5 h-9 text-xs mt-2"
                                onClick={() => setShowAll(true)}
                            >
                                <ChevronDown className="h-3.5 w-3.5" />
                                Show All ({filtered.length - 20} more)
                            </Button>
                        )}
                    </div>
                )}
                {/* Monthly Summary */}
                {transactions.length > 0 && (
                    <Card className="mt-6 border-0 shadow-sm bg-secondary/30">
                        <CardHeader className="pb-2 pt-4 px-4">
                            <CardTitle className="text-sm font-serif flex items-center gap-1.5">
                                <DollarSign className="h-3.5 w-3.5 text-primary" /> Quick Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                {[
                                    { label: 'Total Txns', value: transactions.length, icon: Receipt, color: 'text-primary', bg: 'bg-primary/10' },
                                    { label: 'Deposits', value: transactions.filter(t => t.type === 'deposit').length, icon: ArrowDownLeft, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
                                    { label: 'Payments', value: transactions.filter(t => t.type === 'consultation_fee').length, icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-500/10' },
                                    { label: 'Refunds', value: transactions.filter(t => t.type === 'refund').length, icon: RotateCcw, color: 'text-teal-600', bg: 'bg-teal-500/10' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className={`w-7 h-7 rounded-md ${item.bg} flex items-center justify-center shrink-0`}>
                                            <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{item.value}</p>
                                            <p className="text-muted-foreground text-[10px]">{item.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </ClientLayout>
    );
};
export default ClientTransactionHistory;
