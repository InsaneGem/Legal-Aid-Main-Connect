// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { MainLayout } from '@/components/layout/MainLayout';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { supabase } from '@/integrations/supabase/client';
// import { useAuth } from '@/contexts/AuthContext';
// import { 
//   Star, MessageSquare, Video, Phone, Clock, Award, 
//   GraduationCap, Languages, ArrowLeft, Loader2 
// } from 'lucide-react';
// import { Skeleton } from '@/components/ui/skeleton';
// import { useToast } from '@/hooks/use-toast';
// import { formatLawyerName } from '@/lib/Lawyer-utils';

// const LawyerProfile = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user, role } = useAuth();
//   const { toast } = useToast();

//   const [lawyer, setLawyer] = useState<any>(null);
//   const [reviews, setReviews] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [startingConsultation, setStartingConsultation] = useState(false);

//   useEffect(() => {
//     if (id) {
//       fetchLawyerDetails();
//       fetchReviews();
//     }
//   }, [id]);

//   const fetchLawyerDetails = async () => {
//     const { data, error } = await supabase
//       .from('lawyer_profiles')
//       .select('*')
//       .eq('id', id)
//       .single();

//     if (error) {
//       console.error('Error fetching lawyer:', error);
//       navigate('/lawyers');
//     } else {
//       setLawyer(data);
//     }
//     setLoading(false);
//   };

//   const fetchReviews = async () => {
//     const { data: lawyerData } = await supabase
//       .from('lawyer_profiles')
//       .select('user_id')
//       .eq('id', id)
//       .single();

//     if (lawyerData) {
//       const { data } = await supabase
//         .from('reviews')
//         .select('*')
//         .eq('lawyer_id', lawyerData.user_id)
//         .order('created_at', { ascending: false })
//         .limit(10);

//       setReviews(data || []);
//     }
//   };

//   const startConsultation = async (type: 'chat' | 'audio' | 'video') => {
//     if (!user) {
//       navigate('/login');
//       return;
//     }

//     if (role !== 'client') {
//       toast({
//         variant: 'destructive',
//         title: 'Not allowed',
//         description: 'Only clients can start consultations.',
//       });
//       return;
//     }

//     setStartingConsultation(true);

//     const { data, error } = await supabase
//       .from('consultations')
//       .insert({
//         client_id: user.id,
//         lawyer_id: lawyer?.user_id,
//         type,
//         status: 'pending',
//       })
//       .select()
//       .single();

//     if (error) {
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: 'Failed to start consultation. Please try again.',
//       });
//     } else {
//       navigate(`/consultation/${data.id}`);
//     }
//     setStartingConsultation(false);
//   };

//   if (loading) {
//     return (
//       <MainLayout>
//         <div className="container mx-auto px-4 py-12">
//           <div className="max-w-4xl mx-auto">
//             <Skeleton className="h-8 w-32 mb-8" />
//             <div className="flex gap-8">
//               <Skeleton className="w-32 h-32 rounded-full" />
//               <div className="flex-1">
//                 <Skeleton className="h-8 w-48 mb-4" />
//                 <Skeleton className="h-4 w-32 mb-2" />
//                 <Skeleton className="h-4 w-64" />

//               </div>
//             </div>
//           </div>
//         </div>
//       </MainLayout>
//     );
//   }

//   if (!lawyer) {
//     return (
//       <MainLayout>
//         <div className="container mx-auto px-4 py-12 text-center">
//           <p>Lawyer not found</p>
//           <Button onClick={() => navigate('/lawyers')} className="mt-4">
//             Back to Lawyerss
//           </Button>
//         </div>
//       </MainLayout>
//     );
//   }

//   return (
//     <MainLayout>
//       <div className="min-h-screen bg-secondary/30">
//         <div className="container mx-auto px-4 py-8">
//           <Button variant="ghost" className="mb-6" onClick={() => navigate('/lawyers')}>
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Back to Lawyers
//           </Button>

//           <div className="max-w-4xl mx-auto">
//             <Card className="mb-8">
//               <CardContent className="p-8">
//                 <div className="flex flex-col md:flex-row gap-8">
//                   <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-semibold shrink-0">
//                     L
//                   </div>
//                   <div className="flex-1">
//                     <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
//                       <div>
//                         {/* <h1 className="font-serif text-3xl font-bold mb-2">Legal Professional</h1> */}
//                          <h1 className="font-serif text-3xl font-bold mb-2">{formatLawyerName(lawyer.full_name)}</h1>
//                         <div className="flex items-center gap-4 text-muted-foreground">
//                           <div className="flex items-center gap-1">
//                             <Star className="h-5 w-5 fill-gold text-gold" />
//                             <span className="font-semibold text-foreground">
//                               {lawyer.rating?.toFixed(1) || '0.0'}
//                             </span>
//                             <span>({lawyer.total_reviews || 0} reviews)</span>
//                           </div>
//                         </div>
//                       </div>
//                       <Badge variant={lawyer.is_available ? 'default' : 'secondary'} className="text-sm px-4 py-1">
//                         {lawyer.is_available ? 'Available Now' : 'Offline'}
//                       </Badge>
//                     </div>

//                     {lawyer.specializations && (
//                       <div className="flex flex-wrap gap-2 mb-4">
//                         {lawyer.specializations.map((spec: string) => (
//                           <Badge key={spec} variant="outline">{spec}</Badge>
//                         ))}
//                       </div>
//                     )}

//                     <p className="text-muted-foreground mb-6">
//                       {lawyer.bio || 'Experienced legal professional ready to help with your case.'}
//                     </p>

//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                       <div className="text-center p-3 bg-secondary rounded-lg">
//                         <Clock className="h-5 w-5 mx-auto mb-1" />
//                         <div className="text-sm font-semibold">{lawyer.experience_years || 0} Years</div>
//                         <div className="text-xs text-muted-foreground">Experience</div>
//                       </div>
//                       <div className="text-center p-3 bg-secondary rounded-lg">
//                         <Languages className="h-5 w-5 mx-auto mb-1" />
//                         <div className="text-sm font-semibold">{lawyer.languages?.length || 1}</div>
//                         <div className="text-xs text-muted-foreground">Languages</div>
//                       </div>
//                       <div className="text-center p-3 bg-secondary rounded-lg">
//                         <Award className="h-5 w-5 mx-auto mb-1" />
//                         <div className="text-sm font-semibold">Verified</div>
//                         <div className="text-xs text-muted-foreground">Bar Council</div>
//                       </div>
//                       <div className="text-center p-3 bg-secondary rounded-lg">
//                         <GraduationCap className="h-5 w-5 mx-auto mb-1" />
//                         <div className="text-sm font-semibold">Qualified</div>
//                         <div className="text-xs text-muted-foreground">Education</div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="mb-8">
//               <CardHeader>
//                 <CardTitle>Start a Consultation</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <Button variant="outline" className="h-auto py-6 flex-col gap-2" onClick={() => startConsultation('chat')} disabled={startingConsultation || !lawyer.is_available}>
//                     {startingConsultation ? <Loader2 className="h-6 w-6 animate-spin" /> : <MessageSquare className="h-6 w-6" />}
//                     <span className="font-semibold">Chat</span>
//                     <span className="text-sm text-muted-foreground">${lawyer.price_per_minute || 5}/min</span>
//                   </Button>
//                   <Button variant="outline" className="h-auto py-6 flex-col gap-2" onClick={() => startConsultation('audio')} disabled={startingConsultation || !lawyer.is_available}>
//                     {startingConsultation ? <Loader2 className="h-6 w-6 animate-spin" /> : <Phone className="h-6 w-6" />}
//                     <span className="font-semibold">Audio Call</span>
//                     <span className="text-sm text-muted-foreground">${lawyer.price_per_minute || 5}/min</span>
//                   </Button>
//                   <Button variant="outline" className="h-auto py-6 flex-col gap-2" onClick={() => startConsultation('video')} disabled={startingConsultation || !lawyer.is_available}>
//                     {startingConsultation ? <Loader2 className="h-6 w-6 animate-spin" /> : <Video className="h-6 w-6" />}
//                     <span className="font-semibold">Video Call</span>
//                     <span className="text-sm text-muted-foreground">${lawyer.price_per_minute || 5}/min</span>
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>

//             <Tabs defaultValue="about" className="mb-8">
//               <TabsList className="grid w-full grid-cols-2">
//                 <TabsTrigger value="about">About</TabsTrigger>
//                 <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
//               </TabsList>
//               <TabsContent value="about" className="mt-4">
//                 <Card>
//                   <CardContent className="p-6 space-y-6">
//                     {lawyer.education && (
//                       <div>
//                         <h3 className="font-semibold mb-2">Education</h3>
//                         <p className="text-muted-foreground">{lawyer.education}</p>
//                       </div>
//                     )}
//                     {lawyer.languages && lawyer.languages.length > 0 && (
//                       <div>
//                         <h3 className="font-semibold mb-2">Languages</h3>
//                         <div className="flex flex-wrap gap-2">
//                           {lawyer.languages.map((lang: string) => (
//                             <Badge key={lang} variant="secondary">{lang}</Badge>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </CardContent>
//                 </Card>
//               </TabsContent>
//               <TabsContent value="reviews" className="mt-4">
//                 <Card>
//                   <CardContent className="p-6">
//                     {reviews.length === 0 ? (
//                       <p className="text-center text-muted-foreground py-8">No reviews yet</p>
//                     ) : (
//                       <div className="space-y-6">
//                         {reviews.map((review) => (
//                           <div key={review.id} className="border-b border-border last:border-0 pb-6 last:pb-0">
//                             <div className="flex items-center justify-between mb-2">
//                               <span className="font-semibold">Client</span>
//                               <div className="flex items-center gap-1">
//                                 {[...Array(5)].map((_, i) => (
//                                   <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-gold text-gold' : 'text-muted'}`} />
//                                 ))}
//                               </div>
//                             </div>
//                             {review.comment && <p className="text-muted-foreground">{review.comment}</p>}
//                             <p className="text-xs text-muted-foreground mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </CardContent>
//                 </Card>
//               </TabsContent>
//             </Tabs>
//           </div>
//         </div>
//       </div>
//     </MainLayout>
//   );
// };

// export default LawyerProfile;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Star, MessageSquare, Video, Phone, Clock, Award,
  GraduationCap, Languages, ArrowLeft, Loader2, BookOpen, CheckCircle, CreditCard, User
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { calculateAge } from '@/lib/ageUtils';

const LawyerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { toast } = useToast();

  const [lawyer, setLawyer] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingConsultation, setStartingConsultation] = useState(false);


  useEffect(() => {
    if (id) {
      fetchLawyerDetails();
      fetchReviews();
    }
  }, [id]);

  const fetchLawyerDetails = async () => {
    const { data, error } = await supabase
      .from('lawyer_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching lawyer:', error);
      navigate('/lawyers');
    } else {
      setLawyer(data);
    }
    setLoading(false);
  };

  const fetchReviews = async () => {
    const { data: lawyerData } = await supabase
      .from('lawyer_profiles')
      .select('user_id')
      .eq('id', id)
      .single();

    if (lawyerData) {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('lawyer_id', lawyerData.user_id)
        .order('created_at', { ascending: false })
        .limit(10);

      setReviews(data || []);
    }
  };

  const startConsultation = async (type: 'chat' | 'audio' | 'video') => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (role !== 'client') {
      toast({
        variant: 'destructive',
        title: 'Not allowed',
        description: 'Only clients can start consultations.',
      });
      return;
    }

    setStartingConsultation(true);

    const { data, error } = await supabase
      .from('consultations')
      .insert({
        client_id: user.id,
        lawyer_id: lawyer?.user_id,
        type,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to start consultation. Please try again.',
      });
    } else {
      navigate(`/consultation/${data.id}`);
    }
    setStartingConsultation(false);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-32 mb-8" />
            <div className="flex gap-8">
              <Skeleton className="w-32 h-32 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-8 w-48 mb-4" />
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!lawyer) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p>Lawyer not found</p>
          <Button onClick={() => navigate('/lawyers')} className="mt-4">
            Back to Lawyers
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-secondary/30">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" className="mb-6" onClick={() => navigate('/lawyers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lawyers
          </Button>

          <div className="max-w-4xl mx-auto">
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-semibold shrink-0">
                    L
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <h1 className="font-serif text-3xl font-bold mb-2">Legal Professional</h1>
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="h-5 w-5 fill-gold text-gold" />
                            <span className="font-semibold text-foreground">
                              {lawyer.rating?.toFixed(1) || '0.0'}
                            </span>
                            <span>({lawyer.total_reviews || 0} reviews)</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={lawyer.is_available ? 'default' : 'secondary'} className="text-sm px-4 py-1">
                        {lawyer.is_available ? 'Available Now' : 'Offline'}
                      </Badge>
                    </div>

                    {lawyer.specializations && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {lawyer.specializations.map((spec: string) => (
                          <Badge key={spec} variant="outline">{spec}</Badge>
                        ))}
                      </div>
                    )}

                    <p className="text-muted-foreground mb-6">
                      {lawyer.bio || 'Experienced legal professional ready to help with your case.'}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-secondary rounded-lg">
                        <Clock className="h-5 w-5 mx-auto mb-1" />
                        <div className="text-sm font-semibold">{lawyer.experience_years || 0} Years</div>
                        <div className="text-xs text-muted-foreground">Experience</div>
                      </div>
                      <div className="text-center p-3 bg-secondary rounded-lg">
                        <Languages className="h-5 w-5 mx-auto mb-1" />
                        <div className="text-sm font-semibold">{lawyer.languages?.length || 1}</div>
                        <div className="text-xs text-muted-foreground">Languages</div>
                      </div>
                      <div className="text-center p-3 bg-secondary rounded-lg">
                        <Award className="h-5 w-5 mx-auto mb-1" />
                        <div className="text-sm font-semibold">Verified</div>
                        <div className="text-xs text-muted-foreground">Bar Council</div>
                      </div>
                      <div className="text-center p-3 bg-secondary rounded-lg">
                        <GraduationCap className="h-5 w-5 mx-auto mb-1" />
                        <div className="text-sm font-semibold">Qualified</div>
                        <div className="text-xs text-muted-foreground">Education</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Start a Consultation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto py-6 flex-col gap-2" onClick={() => startConsultation('chat')} disabled={startingConsultation || !lawyer.is_available}>
                    {startingConsultation ? <Loader2 className="h-6 w-6 animate-spin" /> : <MessageSquare className="h-6 w-6" />}
                    <span className="font-semibold">Chat</span>
                    <span className="text-sm text-muted-foreground">₹{lawyer.price_per_minute || 5}/min</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-6 flex-col gap-2" onClick={() => startConsultation('audio')} disabled={startingConsultation || !lawyer.is_available}>
                    {startingConsultation ? <Loader2 className="h-6 w-6 animate-spin" /> : <Phone className="h-6 w-6" />}
                    <span className="font-semibold">Audio Call</span>
                    <span className="text-sm text-muted-foreground">₹{lawyer.price_per_minute || 5}/min</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-6 flex-col gap-2" onClick={() => startConsultation('video')} disabled={startingConsultation || !lawyer.is_available}>
                    {startingConsultation ? <Loader2 className="h-6 w-6 animate-spin" /> : <Video className="h-6 w-6" />}
                    <span className="font-semibold">Video Call</span>
                    <span className="text-sm text-muted-foreground">₹{lawyer.price_per_minute || 5}/min</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="about" className="mb-8">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="about" className="mt-4">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    {lawyer.education && (
                      <div>
                        <h3 className="font-semibold mb-2">Education</h3>
                        <p className="text-muted-foreground">{lawyer.education}</p>
                      </div>
                    )}
                    {lawyer.languages && lawyer.languages.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Languages</h3>
                        <div className="flex flex-wrap gap-2">
                          {lawyer.languages.map((lang: string) => (
                            <Badge key={lang} variant="secondary">{lang}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="reviews" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    {reviews.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No reviews yet</p>
                    ) : (
                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <div key={review.id} className="border-b border-border last:border-0 pb-6 last:pb-0">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold">Client</span>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-gold text-gold' : 'text-muted'}`} />
                                ))}
                              </div>
                            </div>
                            {review.comment && <p className="text-muted-foreground">{review.comment}</p>}
                            <p className="text-xs text-muted-foreground mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LawyerProfile;
