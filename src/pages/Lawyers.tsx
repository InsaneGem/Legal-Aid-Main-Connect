import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter, Users, Zap, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { LawyerCard } from '@/components/lawyers/LawyerCard';

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

const Lawyers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  
  const [lawyers, setLawyers] = useState<LawyerWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLawyers();

    // Set up real-time subscription for lawyer availability
    const channel = supabase
      .channel('lawyer-availability')
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
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLawyers = async () => {
    const { data: lawyerData, error } = await supabase
      .from('lawyer_profiles')
      .select('*')
      .order('is_available', { ascending: false })
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching lawyers:', error);
      setLoading(false);
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
    setLoading(false);
  };

  const filteredLawyers = lawyers.filter(lawyer => {
    const specializations = lawyer.specializations?.join(' ').toLowerCase() || '';
    const lawyerName = lawyer.full_name?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = !query || specializations.includes(query) || lawyerName.includes(query);
    const matchesCategory = !categoryFilter || 
      lawyer.specializations?.some(s => s.toLowerCase().includes(categoryFilter.toLowerCase()));
    
    return matchesSearch && matchesCategory;
  });

  const onlineLawyers = filteredLawyers.filter(l => l.is_available);
  const offlineLawyers = filteredLawyers.filter(l => !l.is_available);

  const clearCategoryFilter = () => {
    setSearchParams({});
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        {/* Header */}
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-serif text-4xl font-bold">Find a Lawyer</h1>
                <p className="text-muted-foreground">
                  {filteredLawyers.length} legal professionals • {onlineLawyers.length} online now
                </p>
              </div>
            </div>
            
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name or specialization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base bg-background border-border"
                />
              </div>
              <Button variant="outline" size="lg" className="gap-2 h-12">
                <Filter className="h-5 w-5" />
                Filters
              </Button>
            </div>

            {/* Active Filters */}
            {categoryFilter && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Filtering by:</span>
                <Badge variant="secondary" className="gap-1.5 pr-1.5">
                  {categoryFilter}
                  <button 
                    onClick={clearCategoryFilter}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Lawyers Grid */}
        <div className="container mx-auto px-4 py-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border">
                  <div className="p-6">
                    <div className="flex gap-4">
                      <Skeleton className="w-20 h-20 rounded-2xl" />
                      <div className="flex-1">
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-full mt-4" />
                    <Skeleton className="h-16 w-full mt-4" />
                  </div>
                  <div className="p-6 bg-secondary/30 border-t border-border">
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredLawyers.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-secondary mx-auto mb-6 flex items-center justify-center">
                <Users className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">No Lawyers Found</h2>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters to find legal professionals
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  clearCategoryFilter();
                }}
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              {/* Online Lawyers Section */}
              {onlineLawyers.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-full">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="font-medium text-sm">Available Now</span>
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {onlineLawyers.length} lawyer{onlineLawyers.length !== 1 ? 's' : ''} online
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {onlineLawyers.map((lawyer) => (
                      <LawyerCard key={lawyer.id} lawyer={lawyer} />
                    ))}
                  </div>
                </div>
              )}

              {/* Offline Lawyers Section */}
              {offlineLawyers.length > 0 && (
                <div>
                  {onlineLawyers.length > 0 && (
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                        <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground"></span>
                        <span className="font-medium text-sm text-muted-foreground">Currently Offline</span>
                      </div>
                      <span className="text-muted-foreground text-sm">
                        {offlineLawyers.length} lawyer{offlineLawyers.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offlineLawyers.map((lawyer) => (
                      <LawyerCard key={lawyer.id} lawyer={lawyer} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Lawyers;
