import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LawyerLayout } from '@/components/layout/LawyerLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
    ArrowLeft, ArrowRight, Video, Phone, MessageSquare, Clock,
    User, Activity, Shield, RefreshCw, XCircle
} from 'lucide-react';

interface ActiveSession {
    id: string;
    type: 'chat' | 'audio' | 'video';
    status: string;
    started_at: string | null;
    total_amount: number | null;
    client_id: string;
    client_name: string;
    client_avatar: string | null;
}

const LawyerActiveSessions = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [sessions, setSessions] = useState<ActiveSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [endingId, setEndingId] = useState<string | null>(null);
    const [, setTick] = useState(0);

    // Live refresh timer
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
            return;
        }

        if (user) {
            fetchSessions();

            const channel = supabase
                .channel('lawyer-active-sessions')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'consultations',
                        filter: `lawyer_id=eq.${user.id}`,
                    },
                    () => fetchSessions()
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user, authLoading]);

    const fetchSessions = useCallback(async () => {
        if (!user) return;

        const { data } = await supabase
            .from('consultations')
            .select('id, type, status, started_at, total_amount, client_id')
            .eq('lawyer_id', user.id)
            .eq('status', 'active')
            .order('started_at', { ascending: false });

        if (data && data.length > 0) {
            const clientIds = [...new Set(data.map(c => c.client_id))];

            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .in('id', clientIds);

            setSessions(
                data.map(s => {
                    const p = profiles?.find(p => p.id === s.client_id);
                    return {
                        ...s,
                        client_name: p?.full_name || 'Client',
                        client_avatar: p?.avatar_url || null,
                    };
                })
            );
        } else {
            setSessions([]);
        }

        setLoading(false);
    }, [user]);

    const handleEndSession = async (id: string) => {
        setEndingId(id);

        try {
            await supabase
                .from('consultations')
                .update({
                    status: 'completed',
                    ended_at: new Date().toISOString(),
                })
                .eq('id', id);

            toast({
                title: 'Session Ended',
                description: 'Consultation completed successfully.',
            });

            fetchSessions();
        } catch {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not end session.',
            });
        } finally {
            setEndingId(null);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="h-3.5 w-3.5" />;
            case 'audio': return <Phone className="h-3.5 w-3.5" />;
            default: return <MessageSquare className="h-3.5 w-3.5" />;
        }
    };

    const getElapsedTime = (startedAt: string | null) => {
        if (!startedAt) return '< 1 min';
        const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000);
        if (diff < 1) return '< 1 min';
        if (diff < 60) return `${diff}m`;
        return `${Math.floor(diff / 60)}h ${diff % 60}m`;
    };

    if (authLoading || loading) {
        return (
            <LawyerLayout>
                <div className="container mx-auto px-4 py-6 max-w-3xl">
                    <Skeleton className="h-8 w-40 mb-4" />
                    <div className="space-y-3">
                        {[1, 2].map(i => (
                            <Skeleton key={i} className="h-24 rounded-xl" />
                        ))}
                    </div>
                </div>
            </LawyerLayout>
        );
    }

    return (
        <LawyerLayout>
            <div className="container mx-auto px-4 py-6 max-w-3xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/lawyer/dashboard')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="font-serif text-xl sm:text-2xl font-bold flex items-center gap-2">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" />
                                </span>
                                Active Sessions
                            </h1>
                            <p className="text-muted-foreground text-xs mt-0.5">Manage Ongoing Consultations In Real-Time</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1 text-[10px] px-2 py-1 hidden sm:flex">
                            <Activity className="h-3 w-3 text-blue-500" /> Live
                        </Badge>
                        <Button variant="outline" size="sm" onClick={fetchSessions} className="gap-1.5 h-8 text-xs">
                            <RefreshCw className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
                {/* Summary */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                        { label: 'Active', value: sessions.length, color: 'text-blue-600' },
                        { label: 'Video', value: sessions.filter(s => s.type === 'video').length, color: 'text-purple-600' },
                        { label: 'Chat/Audio', value: sessions.filter(s => s.type !== 'video').length, color: 'text-emerald-600' },
                    ].map((s, i) => (
                        <Card key={i} className="border-0 shadow-sm">
                            <CardContent className="p-3 text-center">
                                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                                <p className="text-[10px] text-muted-foreground">{s.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Sessions */}
                {sessions.length === 0 ? (
                    <Card className="border-0 shadow-md">
                        <CardContent className="py-14 text-center">
                            <div className="w-14 h-14 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center animate-pulse">
                                <Activity className="h-7 w-7 text-muted-foreground" />
                            </div>

                            <h3 className="text-lg font-semibold font-serif">No Active Sessions</h3>
                            <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1 mb-4">
                                You don't have any ongoing consultations right now.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {sessions.map((session, index) => (
                            <Card key={session.id} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden animate-fade-in relative"
                                style={{ animationDelay: `${index * 0.08}s` }}
                            >
                                <div className="absolute top-0 left-0 w-0.5 h-full bg-blue-500" />
                                <CardContent className="p-4 ">
                                    <div className="flex items-center justify-between gap-3">
                                        {/* Client */}
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="relative shrink-0">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden ring-1 ring-blue-500/30">
                                                    {session.client_avatar ? (
                                                        <img src={session.client_avatar} alt={session.client_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="h-5 w-5 test-primary" />
                                                    )}
                                                </div>
                                                <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-background" />
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-sm truncate">{session.client_name}</h3>
                                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                    <Badge variant="outline" className="gap-1 text-[10px] px-1.5 py-0 h-5">
                                                        {getTypeIcon(session.type)} {session.type}
                                                    </Badge>
                                                    <span className="text-[10px] text-blue-600 flex items-center gap-1">
                                                        <Clock className="h-2.5 w-2.5" />
                                                        {getElapsedTime(session.started_at)}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* </div> */}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                size="sm"
                                                className="gap-1 h-7 text-xs px-3"
                                                // onClick={(e) => { navigate(`/consultation/${session.id}`); window.scrollTo(0, 0);
                                                onClick={(e) => {
                                                    e.stopPropagation(); navigate(`/consultation/${session.id}`); window.scrollTo(0, 0)
                                                }}
                                            >
                                                Continue <ArrowRight className="h-3 w-3" />
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-1 h-7 text-xs px-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                                                disabled={endingId === session.id}
                                                // onClick={(e) => handleEndSession(session.id)}
                                                onClick={(e) => { e.stopPropagation(); handleEndSession(session.id); }}
                                            >
                                                {endingId === session.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                                                End
                                            </Button>
                                        </div>
                                    </div>
                                    {/* Footer info */}
                                    <div className="mt-2.5 pt-2.5 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-2.5 w-2.5" />
                                            Started {session.started_at ? new Date(session.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                                        </span>
                                        {session.total_amount && (
                                            <span className="font-medium text-foreground">${Number(session.total_amount).toFixed(2)}</span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Shield className="h-2.5 w-2.5 text-emerald-500" /> Encrypted
                                        </span>
                                    </div>

                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

            </div>
        </LawyerLayout>
    );
};

export default LawyerActiveSessions;