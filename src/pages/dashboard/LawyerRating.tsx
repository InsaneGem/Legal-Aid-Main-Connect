import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { MainLayout } from '@/components/layout/MainLayout';
import { LawyerLayout } from '@/components/layout/LawyerLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Star, ArrowLeft, User, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
const LawyerRating = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!authLoading && !user) { navigate('/login'); return; }
    if (user) fetchData();
  }, [user, authLoading]);
  const fetchData = async () => {
    if (!user) return;
    const [{ data: lp }, { data: revs }] = await Promise.all([
      supabase.from('lawyer_profiles').select('rating, total_reviews').eq('user_id', user.id).maybeSingle(),
      supabase.from('reviews').select('*').eq('lawyer_id', user.id).order('created_at', { ascending: false }),
    ]);
    setRating(Number(lp?.rating) || 0);
    setTotalReviews(lp?.total_reviews || 0);
    if (revs && revs.length > 0) {
      const clientIds = [...new Set(revs.map(r => r.client_id))];
      const { data: profiles } = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', clientIds);
      setReviews(revs.map(r => {
        const p = profiles?.find(pr => pr.id === r.client_id);
        return { ...r, client_name: p?.full_name || 'Client', client_avatar: p?.avatar_url };
      }));
    }
    setLoading(false);
  };
  if (authLoading || loading) {
    return (
      // <MainLayout showFooter={false}>
         <LawyerLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-10 w-48 mb-6" />
            <Skeleton className="h-40 rounded-2xl mb-6" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      {/* </MainLayout> */}
       </LawyerLayout>
    );
  }
  return (
    // <MainLayout showFooter={false}>
       <LawyerLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" className="gap-2 mb-6" onClick={() => navigate('/lawyer/dashboard')}>
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
          <Card className="border-0 shadow-lg mb-8">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <p className="text-6xl font-bold">{rating.toFixed(1)}</p>
                <Star className="h-10 w-10 fill-amber-400 text-amber-400" />
              </div>
              <div className="flex items-center justify-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className={`h-6 w-6 ${i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />
                ))}
              </div>
              <p className="text-muted-foreground mt-3">{totalReviews} total reviews</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Star className="h-5 w-5" /> Client Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                    <Star className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">No Reviews Yet</h3>
                  <p className="text-muted-foreground text-sm">Client reviews will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="p-4 rounded-xl border border-border">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                          {r.client_avatar ? <img src={r.client_avatar} alt="" className="w-full h-full object-cover" /> : <User className="h-5 w-5 text-muted-foreground" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{r.client_name}</p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                              <Star key={i} className={`h-3.5 w-3.5 ${i <= (r.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />{new Date(r.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    {/* </MainLayout> */}
     </LawyerLayout>
  );
};
export default LawyerRating;