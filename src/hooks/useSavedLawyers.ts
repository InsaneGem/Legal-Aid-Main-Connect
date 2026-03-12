import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
export const useSavedLawyers = () => {
    const { user } = useAuth();
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const fetchSaved = useCallback(async () => {
        if (!user) return;
        const { data } = await supabase
            .from('saved_lawyers')
            .select('lawyer_profile_id')
            .eq('user_id', user.id);
        if (data) {
            setSavedIds(new Set(data.map(d => d.lawyer_profile_id)));
        }
    }, [user]);
    useEffect(() => {
        fetchSaved();
    }, [fetchSaved]);
    const toggleSave = useCallback(async (lawyerProfileId: string) => {
        if (!user) return false;
        setLoading(true);
        try {
            if (savedIds.has(lawyerProfileId)) {
                await supabase
                    .from('saved_lawyers')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('lawyer_profile_id', lawyerProfileId);
                setSavedIds(prev => {
                    const next = new Set(prev);
                    next.delete(lawyerProfileId);
                    return next;
                });
                return false;
            } else {
                await supabase
                    .from('saved_lawyers')
                    .insert({ user_id: user.id, lawyer_profile_id: lawyerProfileId });
                setSavedIds(prev => new Set(prev).add(lawyerProfileId));
                return true;
            }
        } finally {
            setLoading(false);
        }
    }, [user, savedIds]);
    const isSaved = useCallback((id: string) => savedIds.has(id), [savedIds]);
    return { savedIds, isSaved, toggleSave, loading, refetch: fetchSaved };
};