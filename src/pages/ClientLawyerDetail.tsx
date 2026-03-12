// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";
// import { ClientLayout } from "@/components/layout/ClientLayout";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { ArrowLeft, MessageSquare, Star, User, Phone, Video, CreditCard, Clock, ChevronRight } from "lucide-react";
// import { formatLawyerName } from "@/lib/Lawyer-utils";
// import { toast } from "@/components/ui/sonner";
// import { useAuth } from "@/contexts/AuthContext";
// import { useToast } from "@/components/ui/use-toast";

// interface LawyerData {
//   id: string;
//   user_id: string;
//   bio: string | null;
//   experience_years: number | null;
//   specializations: string[] | null;
//   languages: string[] | null;
//   price_per_minute: number | null;
//   rating: number | null;
//   total_reviews: number | null;
//   is_available: boolean | null;
//   status: string | null;
//   full_name?: string;
//   avatar_url?: string | null;
// }

// export default function ClientLawyerDataCard() 
// {
//     const { user } = useAuth();
//     const { toast } = useToast();
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [lawyer, setLawyer] = useState<LawyerData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [selectedType, setSelectedType] = useState<'chat' | 'audio' | 'video'>('chat');

//   const handleBookClick = (type: 'chat' | 'audio' | 'video', e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!user) {
//       toast({
//         title: 'Login Required',
//         description: 'Please login to book a consultation.',
//         variant: 'destructive',
//       });
//       navigate('/login');
//       return;
//     }

//     setSelectedType(type);
//     setShowPaymentModal(true);
//   };

//   useEffect(() => {
//     if (id) fetchLawyer();
//   }, [id]);



//   const fetchLawyer = async () => {
//     setLoading(true);


//     const { data: profileData } = await supabase
//       .from("lawyer_profiles")
//       .select("*")
//       .eq("user_id", id)
//       .single();

//     if (!profileData) {
//       setLoading(false);
//       return;
//     }

//     const { data: userProfile } = await supabase
//       .from("profiles")
//       .select("full_name, avatar_url")
//       .eq("id", id)
//       .single();

//     setLawyer({
//       ...profileData,
//       full_name: formatLawyerName(userProfile?.full_name),
//       avatar_url: userProfile?.avatar_url,
//     });

//     setLoading(false);
//   };

//   if (loading) {
//     return (
//       <ClientLayout>
//         <div className="p-10 text-center">Loading lawyer profile...</div>
//       </ClientLayout>
//     );
//   }

//   if (!lawyer) {
//     return (
//       <ClientLayout>
//         <div className="p-10 text-center">Lawyer not found</div>
//       </ClientLayout>
//     );
//   }

//   return (
//     <ClientLayout>
//       <div className="container mx-auto px-4 py-8 max-w-4xl">

//         <Button
//           variant="ghost"
//           className="mb-6"
//           onClick={() => navigate(-1)}
//         >
//           <ArrowLeft className="h-4 w-4 mr-2" />
//           Back to Dashboard
//         </Button>

//         <Card>
//           <CardContent className="p-8">
//             <div className="flex flex-col md:flex-row gap-8">

//               {/* Avatar */}
//               <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-semibold shrink-0">
//                 {lawyer.avatar_url ? (
//                   <img
//                     src={lawyer.avatar_url}
//                     alt="avatar"
//                     className="w-full h-full rounded-full object-cover"
//                   />
//                 ) : (
//                   <User className="w-12 h-12" />
//                 )}
//               </div>

//               {/* Info */}
//               <div className="flex-1">
//                 <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
//                   <div>
//                     <h1 className="text-3xl font-bold mb-2">
//                       {lawyer.full_name}
//                     </h1>

//                     <div className="flex items-center gap-3 text-muted-foreground">
//                       <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
//                       <span className="font-semibold text-foreground">
//                         {lawyer.rating?.toFixed(1) || "0.0"}
//                       </span>
//                       <span>({lawyer.total_reviews || 0} reviews)</span>
//                     </div>
//                   </div>

//                   <Badge variant={lawyer.is_available ? "default" : "secondary"}>
//                     {lawyer.is_available ? "Available Now" : "Offline"}
//                   </Badge>
//                 </div>

//                 {/* Specializations */}
//                 {lawyer.specializations?.length ? (
//                   <div className="flex flex-wrap gap-2 mb-4">
//                     {lawyer.specializations.map((s) => (
//                       <Badge key={s} variant="outline">
//                         {s}
//                       </Badge>
//                     ))}
//                   </div>
//                 ) : null}

//                 {/* Bio */}
//                 <p className="text-muted-foreground mb-6">
//                   {lawyer.bio || "No bio provided."}
//                 </p>

//                 {/* Stats */}
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

//                   <div className="text-center p-3 bg-secondary rounded-lg">
//                     <div className="text-sm font-semibold">
//                       {lawyer.experience_years || 0} yrs
//                     </div>
//                     <div className="text-xs text-muted-foreground">Experience</div>
//                   </div>

//                   <div className="text-center p-3 bg-secondary rounded-lg">
//                     <div className="text-sm font-semibold">
//                       {lawyer.languages?.length || 1}
//                     </div>
//                     <div className="text-xs text-muted-foreground">Languages</div>
//                   </div>

//                   <div className="text-center p-3 bg-secondary rounded-lg">
//                     <div className="text-sm font-semibold">
//                       ₹{lawyer.price_per_minute || 0}/min
//                     </div>
//                     <div className="text-xs text-muted-foreground">Rate</div>
//                   </div>

//                   <div className="text-center p-3 bg-secondary rounded-lg">
//                     <div className="text-sm font-semibold">
//                       {lawyer.status || "Unknown"}
//                     </div>
//                     <div className="text-xs text-muted-foreground">Status</div>
//                   </div>

//                 </div>



//               </div>
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//         <CardContent className="p-8">
//             <div className="flex flex-col md:flex-row gap-8">
//                 {/* Action Buttons */}
//                 <div className="px-3 py-2.5 border-t border-border bg-muted/30 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
//              <Button
//               size="sm"
//               variant="ghost"
//               className="h-8 w-8 p-0 hover:bg-emerald-500/10 hover:text-emerald-600"
//               onClick={(e) => handleBookClick('chat', e)}
//               title="Chat"
//              >
//              <MessageSquare className="h-3.5 w-3.5" />
//              </Button>
//              <Button
//               size="sm"
//               variant="ghost"
//               className="h-8 w-8 p-0 hover:bg-blue-500/10 hover:text-blue-600"
//               onClick={(e) => handleBookClick('audio', e)}
//               title="Call"
//              >
//              <Phone className="h-3.5 w-3.5" />
//              </Button>
//              <Button
//               size="sm"
//               variant="ghost"
//               className="h-8 w-8 p-0 hover:bg-purple-500/10 hover:text-purple-600"
//               onClick={(e) => handleBookClick('video', e)}
//               title="Video"
//              >
//              <Video className="h-3.5 w-3.5" />
//              </Button>
//              <Button
//               size="sm"
//               className="ml-auto h-8 text-xs gap-1.5 px-3"
//               onClick={(e) => handleBookClick('video', e)}
//              >
//              <CreditCard className="h-3 w-3" />
//               Book Now
//              <ChevronRight className="h-3 w-3" />
//               </Button>
//             </div>
//             </div>    
//         </CardContent>   
//         </Card>

//                 <Card>
//                     <CardContent className="p-8">
//                         <div className="flex items-center gap-4 text-muted-foreground mb-4">
//                             <Clock className="h-5 w-5" />
//                             <span className="text-sm">Available: 9am - 6pm, Mon - Fri</span>
//                         </div>
//                         <div className="text-sm text-muted-foreground">
//                             Note: Booking a consultation will require payment. You can choose to pay per minute or a fixed fee for the session.
//                         </div>
//                     </CardContent>
//                 </Card>


//       </div>
//     </ClientLayout>
//   );
// }


// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";
// import { ClientLayout } from "@/components/layout/ClientLayout";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   ArrowLeft,
//   MessageSquare,
//   Star,
//   User,
//   Phone,
//   Video,
//   CreditCard,
//   Clock,
//   ChevronRight
// } from "lucide-react";
// import { formatLawyerName } from "@/lib/Lawyer-utils";
// import { useAuth } from "@/contexts/AuthContext";
// import { useToast } from "@/components/ui/use-toast";

// interface LawyerData {
//   id: string;
//   user_id: string;
//   bio: string | null;
//   experience_years: number | null;
//   specializations: string[] | null;
//   languages: string[] | null;
//   price_per_minute: number | null;
//   rating: number | null;
//   total_reviews: number | null;
//   is_available: boolean | null;
//   status: string | null;
//   full_name?: string;
//   avatar_url?: string | null;
// }

// export default function ClientLawyerDataCard() {
//   const { user } = useAuth();
//   const { toast } = useToast();
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [lawyer, setLawyer] = useState<LawyerData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [startingConsultation, setStartingConsultation] = useState(false);

//   const handleBookClick = async (
//     type: "chat" | "audio" | "video",
//     e: React.MouseEvent
//   ) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!user) {
//       toast({
//         title: "Login Required",
//         description: "Please login to book a consultation.",
//         variant: "destructive"
//       });
//       navigate("/login");
//       return;
//     }

//     if (!lawyer) return;

//     setStartingConsultation(true);

//     const { data, error } = await supabase
//       .from("consultations")
//       .insert({
//         client_id: user.id,
//         lawyer_id: lawyer.user_id,
//         type,
//         status: "pending"
//       })
//       .select()
//       .single();

//     if (error) {
//       toast({
//         title: "Error",
//         description: "Failed to start consultation.",
//         variant: "destructive"
//       });
//     } else {
//       navigate(`/consultation/${data.id}`);
//     }

//     setStartingConsultation(false);
//   };

//   useEffect(() => {
//     if (id) fetchLawyer();
//   }, [id]);

//   const fetchLawyer = async () => {
//     setLoading(true);

//     const { data: profileData } = await supabase
//       .from("lawyer_profiles")
//       .select("*")
//       .eq("user_id", id)
//       .single();

//     if (!profileData) {
//       setLoading(false);
//       return;
//     }

//     const { data: userProfile } = await supabase
//       .from("profiles")
//       .select("full_name, avatar_url")
//       .eq("id", id)
//       .single();

//     setLawyer({
//       ...profileData,
//       full_name: formatLawyerName(userProfile?.full_name),
//       avatar_url: userProfile?.avatar_url
//     });

//     setLoading(false);
//   };

//   if (loading) {
//     return (
//       <ClientLayout>
//         <div className="p-10 text-center">Loading lawyer profile...</div>
//       </ClientLayout>
//     );
//   }

//   if (!lawyer) {
//     return (
//       <ClientLayout>
//         <div className="p-10 text-center">Lawyer not found</div>
//       </ClientLayout>
//     );
//   }

//   return (
//     <ClientLayout>
//       <div className="container mx-auto px-4 py-8 max-w-4xl">

//         <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
//           <ArrowLeft className="h-4 w-4 mr-2" />
//           Back to Dashboard
//         </Button>

//         <Card>
//           <CardContent className="p-8">
//             <div className="flex flex-col md:flex-row gap-8">

//               {/* Avatar */}
//               <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-semibold shrink-0">
//                 {lawyer.avatar_url ? (
//                   <img
//                     src={lawyer.avatar_url}
//                     alt="avatar"
//                     className="w-full h-full rounded-full object-cover"
//                   />
//                 ) : (
//                   <User className="w-12 h-12" />
//                 )}
//               </div>

//               {/* Info */}
//               <div className="flex-1">
//                 <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
//                   <div>
//                     <h1 className="text-3xl font-bold mb-2">
//                       {lawyer.full_name}
//                     </h1>

//                     <div className="flex items-center gap-3 text-muted-foreground">
//                       <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
//                       <span className="font-semibold text-foreground">
//                         {lawyer.rating?.toFixed(1) || "0.0"}
//                       </span>
//                       <span>({lawyer.total_reviews || 0} reviews)</span>
//                     </div>
//                   </div>

//                   <Badge variant={lawyer.is_available ? "default" : "secondary"}>
//                     {lawyer.is_available ? "Available Now" : "Offline"}
//                   </Badge>
//                 </div>

//                 {/* Specializations */}
//                 {lawyer.specializations?.length ? (
//                   <div className="flex flex-wrap gap-2 mb-4">
//                     {lawyer.specializations.map((s) => (
//                       <Badge key={s} variant="outline">
//                         {s}
//                       </Badge>
//                     ))}
//                   </div>
//                 ) : null}

//                 {/* Bio */}
//                 <p className="text-muted-foreground mb-6">
//                   {lawyer.bio || "No bio provided."}
//                 </p>

//                 {/* Stats */}
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

//                   <div className="text-center p-3 bg-secondary rounded-lg">
//                     <div className="text-sm font-semibold">
//                       {lawyer.experience_years || 0} yrs
//                     </div>
//                     <div className="text-xs text-muted-foreground">Experience</div>
//                   </div>

//                   <div className="text-center p-3 bg-secondary rounded-lg">
//                     <div className="text-sm font-semibold">
//                       {lawyer.languages?.length || 1}
//                     </div>
//                     <div className="text-xs text-muted-foreground">Languages</div>
//                   </div>

//                   <div className="text-center p-3 bg-secondary rounded-lg">
//                     <div className="text-sm font-semibold">
//                       ₹{lawyer.price_per_minute || 0}/min
//                     </div>
//                     <div className="text-xs text-muted-foreground">Rate</div>
//                   </div>

//                   <div className="text-center p-3 bg-secondary rounded-lg">
//                     <div className="text-sm font-semibold">
//                       {lawyer.status || "Unknown"}
//                     </div>
//                     <div className="text-xs text-muted-foreground">Status</div>
//                   </div>

//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* ACTION BUTTONS */}
//         <Card>
//           <CardContent className="p-8">
//             <div className="flex flex-col md:flex-row gap-8">
//               <div
//                 className="px-3 py-2.5 border-t border-border bg-muted/30 flex items-center gap-1.5"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <Button
//                   size="sm"
//                   variant="ghost"
//                   className="h-8 w-8 p-0 hover:bg-emerald-500/10 hover:text-emerald-600"
//                   onClick={(e) => handleBookClick("chat", e)}
//                   disabled={startingConsultation}
//                 >
//                   <MessageSquare className="h-3.5 w-3.5" />
//                 </Button>

//                 <Button
//                   size="sm"
//                   variant="ghost"
//                   className="h-8 w-8 p-0 hover:bg-blue-500/10 hover:text-blue-600"
//                   onClick={(e) => handleBookClick("audio", e)}
//                   disabled={startingConsultation}
//                 >
//                   <Phone className="h-3.5 w-3.5" />
//                 </Button>

//                 <Button
//                   size="sm"
//                   variant="ghost"
//                   className="h-8 w-8 p-0 hover:bg-purple-500/10 hover:text-purple-600"
//                   onClick={(e) => handleBookClick("video", e)}
//                   disabled={startingConsultation}
//                 >
//                   <Video className="h-3.5 w-3.5" />
//                 </Button>

//                 <Button
//                   size="sm"
//                   className="ml-auto h-8 text-xs gap-1.5 px-3"
//                   onClick={(e) => handleBookClick("video", e)}
//                   disabled={startingConsultation}
//                 >
//                   <CreditCard className="h-3 w-3" />
//                   Book Now
//                   <ChevronRight className="h-3 w-3" />
//                 </Button>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* FOOTER INFO */}
//         <Card>
//           <CardContent className="p-8">
//             <div className="flex items-center gap-4 text-muted-foreground mb-4">
//               <Clock className="h-5 w-5" />
//               <span className="text-sm">
//                 Available: 9am - 6pm, Mon - Fri
//               </span>
//             </div>
//             <div className="text-sm text-muted-foreground">
//               Note: Booking a consultation will require payment. You can choose to pay per minute or a fixed fee for the session.
//             </div>
//           </CardContent>
//         </Card>

//       </div>
//     </ClientLayout>
//   );
// }


// *******************888
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BookingPaymentModal } from '@/components/lawyers/BookingPaymentModal';
import { ClientLayout } from '@/components/layout/ClientLayout';
import {
  Star, MessageSquare, Video, Phone, Clock, Award,
  GraduationCap, Languages, ArrowLeft, Shield, Verified,
  Calendar, Users, DollarSign, BookOpen, CheckCircle,
  CreditCard, Zap, MapPin, Briefcase, Globe, Heart,
  ThumbsUp, BadgeCheck, User
} from 'lucide-react';
import { formatLawyerName } from '@/lib/lawyer-utils';
import { calculateAge } from '@/lib/ageUtils';
interface LawyerData {
  id: string;
  user_id: string;
  bio: string | null;
  experience_years: number | null;
  specializations: string[] | null;
  languages: string[] | null;
  price_per_minute: number | null;
  session_price: number | null;
  rating: number | null;
  total_reviews: number | null;
  total_consultations: number | null;
  is_available: boolean | null;
  status: string | null;
  education: string | null;
  bar_council_number: string | null;
  created_at: string | null;
  date_of_birth: string | null;
}
interface ProfileData {
  full_name: string;
  avatar_url: string | null;
  email: string;
  date_of_birth: string | null;
}
interface ReviewData {
  id: string;
  rating: number | null;
  comment: string | null;
  created_at: string;
  client_id: string;
  client_name?: string;
  client_avatar?: string | null;
}
const ClientLawyerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [lawyer, setLawyer] = useState<LawyerData | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'chat' | 'audio' | 'video'>('chat');
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (id) fetchLawyerDetails();
  }, [id, user]);
  const fetchLawyerDetails = async () => {
    const { data, error } = await supabase
      .from('lawyer_profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) {
      toast({ variant: 'destructive', title: 'Error', description: 'Lawyer profile not found.' });
      navigate('/dashboard');
      return;
    }
    setLawyer(data);
    const [profileRes, reviewsRes] = await Promise.all([
      // supabase.from('profiles').select('full_name, avatar_url, email').eq('id', data.user_id).single(),
      supabase.from('profiles').select('full_name, avatar_url, email, date_of_birth').eq('id', data.user_id).single(),
      supabase.from('reviews').select('*').eq('lawyer_id', data.user_id).order('created_at', { ascending: false }).limit(20),
    ]);
    if (profileRes.data) setProfile(profileRes.data);
    if (reviewsRes.data && reviewsRes.data.length > 0) {
      const clientIds = [...new Set(reviewsRes.data.map(r => r.client_id))];
      const { data: clientProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', clientIds);
      setReviews(reviewsRes.data.map(review => ({
        ...review,
        client_name: clientProfiles?.find(p => p.id === review.client_id)?.full_name || 'Client',
        client_avatar: clientProfiles?.find(p => p.id === review.client_id)?.avatar_url,
      })));
    }
    setLoading(false);
  };
  const handleBookClick = (type: 'chat' | 'audio' | 'video') => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (role !== 'client') {
      toast({ variant: 'destructive', title: 'Not allowed', description: 'Only clients can book consultations.' });
      return;
    }
    setSelectedType(type);
    setShowPaymentModal(true);
  };
  const renderStars = (rating: number) =>
    [...Array(5)].map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < Math.round(rating) ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/30'}`} />
    ));
  if (loading) {
    return (
      //   <MainLayout showFooter={false}>
      <ClientLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Skeleton className="h-8 w-32 mb-6" />
            <Skeleton className="h-72 rounded-2xl mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-48 rounded-2xl" />
                <Skeleton className="h-64 rounded-2xl" />
              </div>
              <Skeleton className="h-96 rounded-2xl" />
            </div>
          </div>
        </div>
        {/* //   </MainLayout> */}
      </ClientLayout>
    );
  }
  if (!lawyer || !profile) {
    return (
      //   <MainLayout showFooter={false}>
      <ClientLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Lawyer Not Found</h2>
          <p className="text-muted-foreground mb-6">This profile doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
        {/* </MainLayout> */}
      </ClientLayout>
    );
  }
  const memberSince = lawyer.created_at ? new Date(lawyer.created_at).getFullYear() : new Date().getFullYear();
  const avgRating = lawyer.rating?.toFixed(1) || '0.0';
  return (
    // <MainLayout showFooter={false}>
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Back Button */}
          <Button variant="ghost" className="mb-4 gap-2" onClick={() => navigate('/dashboard')}>

            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          {/* Hero Profile Header */}
          <Card className="border border-border rounded-2xl shadow-md mb-3 bg-card">

            <CardContent className="p-5 sm:p-6">

              {/* GRID LAYOUT */}
              <div className="grid grid-cols-1 sm:grid-cols-[auto,1fr,auto] gap-3 sm:gap-5 items-center py-4 sm:py-6 text-center sm:text-left justify-items-center sm:justify-items-stretch">
                {/* Avatar */}
                <Avatar className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 border-4  border-gray-900/50">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary/20 to-accent/20">
                    {profile.full_name.charAt(0)}

                  </AvatarFallback>
                </Avatar>

                {/* Middle Info */}
                <div className="space-y-2 text-center sm:text-left">

                  {/* Name + Verified */}
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                      {/* {profile.full_name} */}
                      {formatLawyerName(profile.full_name)}
                    </h1>

                    {lawyer.status === "approved" && (
                      <Verified className="h-5 w-5 text-blue-500" />
                    )}
                  </div>

                  {/* Meta Row */}
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 text-sm text-muted-foreground">

                    {/* Rating */}
                    <div className="flex items-center gap-1 bg-amber-500/10 px-3 py-1 rounded-full">
                      <Star className="h-4 w-9 fill-amber-500 text-amber-500" />
                      <span className="font-semibold text-amber-600">({avgRating} Ratings)</span>
                      <span className="text-sm  text-foreground whitespace-nowrap"> || {reviews.length} Reviews</span>
                    </div>

                    {/* Member Since */}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <p>Member since {memberSince}</p>
                    </span>
                    <span>
                      {calculateAge(profile.date_of_birth) !== null && (
                        <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          {calculateAge(profile.date_of_birth)} years old
                        </span>
                      )}
                    </span>

                    {/* Consultations */}
                    {lawyer.total_consultations > 0 && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" />
                        {lawyer.total_consultations}
                      </span>
                    )}
                  </div>

                  {/* Specializations */}
                  {lawyer.specializations?.length > 0 && (
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                      {lawyer.specializations.map(spec => (
                        <Badge key={spec} variant="secondary" className="text-xs px-2.5 py-1">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="flex justify-center sm:justify-end">
                  {lawyer.is_available ? (
                    <Badge className="bg-emerald-500 text-white border-0 gap-1.5 px-3 py-1 text-xs sm:text-sm">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                      </span>
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="px-3 py-1 text-xs sm:text-sm">
                      Offline
                    </Badge>
                  )}
                </div>

              </div>

            </CardContent>
          </Card>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-[15px]">
                    {lawyer.bio || 'Experienced legal professional committed to providing excellent legal counsel and representation.'}
                  </p>
                </CardContent>
              </Card>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-5 text-center">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-2xl font-bold">{lawyer.experience_years || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">Years Experience</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-5 text-center">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                      <Globe className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold">{lawyer.languages?.length || 1}</p>
                    <p className="text-xs text-muted-foreground mt-1">Languages</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-5 text-center">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-bold">₹{lawyer.price_per_minute || 5}</p>
                    <p className="text-xs text-muted-foreground mt-1">Per Minute</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-5 text-center">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold">{lawyer.total_consultations || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">Consultations</p>
                  </CardContent>
                </Card>
              </div>
              {/* Qualifications Card */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Qualifications & Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {lawyer.education && (
                    <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-xl">
                      <GraduationCap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Education</h4>
                        <p className="mt-1">{lawyer.education}</p>
                      </div>
                    </div>
                  )}
                  {lawyer.bar_council_number && (
                    <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-xl">
                      <BadgeCheck className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Bar Council Registration</h4>
                        <p className="mt-1">Reg. No: {lawyer.bar_council_number}</p>
                      </div>
                    </div>
                  )}
                  {lawyer.languages && lawyer.languages.length > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-xl">
                      <Languages className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Languages</h4>
                        <div className="flex flex-wrap gap-2">
                          {lawyer.languages.map(lang => (
                            <Badge key={lang} variant="outline" className="gap-1.5">
                              <Globe className="h-3 w-3" />
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-xl">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Verification Status</h4>
                      <Badge
                        className={
                          lawyer.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : lawyer.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                              : 'bg-red-500/10 text-red-600 border-red-500/20'
                        }
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {lawyer.status === 'approved' ? 'Verified & Approved' : lawyer.status === 'pending' ? 'Pending Verification' : 'Not Verified'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Reviews Section */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    Client Reviews ({reviews.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reviews.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <ThumbsUp className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-muted-foreground">No reviews yet</p>
                      <p className="text-sm text-muted-foreground mt-1">Be the first to leave a review!</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {reviews.map(review => (
                        <div key={review.id} className="pb-5 border-b border-border last:border-0 last:pb-0">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={review.client_avatar || undefined} />
                              <AvatarFallback className="text-sm bg-secondary">
                                {review.client_name?.charAt(0) || 'C'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-sm">{review.client_name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-0.5 mt-1">
                                {renderStars(review.rating || 0)}
                              </div>
                              {review.comment && (
                                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                  {review.comment}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            {/* Right Sidebar - Sticky Booking */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Pricing Card */}
                <Card className="border-0 shadow-xl bg-gradient-to-b from-card to-secondary/20">
                  <CardContent className="p-6 space-y-5">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground font-medium">Consultation Rate</p>
                      <div className="flex items-baseline justify-center gap-1 mt-2">
                        <span className="text-4xl font-bold text-primary">₹{lawyer.price_per_minute || 5}</span>
                        <span className="text-muted-foreground text-sm">/min</span>
                      </div>
                      {lawyer.session_price && (
                        <p className="text-sm text-muted-foreground mt-1">
                          or ${lawyer.session_price} per session
                        </p>
                      )}
                    </div>
                    <Separator />
                    {/* Quick Stats */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> Rating
                        </span>
                        <span className="font-semibold">{avgRating} / 5.0</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Briefcase className="h-3.5 w-3.5" /> Experience
                        </span>
                        <span className="font-semibold">{lawyer.experience_years || 0} years</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Users className="h-3.5 w-3.5" /> Consultations
                        </span>
                        <span className="font-semibold">{lawyer.total_consultations || 0}</span>
                      </div>
                    </div>
                    <Separator />
                    {/* Booking Buttons */}
                    <div className="space-y-3">
                      <Button className="w-full gap-2 h-11" variant="outline" onClick={() => handleBookClick('chat')}>
                        <MessageSquare className="h-4 w-4" />
                        Start Chat
                      </Button>
                      <Button className="w-full gap-2 h-11" variant="outline" onClick={() => handleBookClick('audio')}>
                        <Phone className="h-4 w-4" />
                        Audio Call
                      </Button>
                      <Button className="w-full gap-2 h-11" variant="outline" onClick={() => handleBookClick('video')}>
                        <Video className="h-4 w-4" />
                        Video Call
                      </Button>
                      <Button className="w-full gap-2 h-12 text-base font-semibold shadow-lg" onClick={() => handleBookClick('video')}>
                        <CreditCard className="h-5 w-5" />
                        Book Now
                      </Button>
                    </div>
                    {/* Trust Badges */}
                    <div className="pt-2 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Shield className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Secure & confidential</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Money-back guarantee</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Zap className="h-3.5 w-3.5 text-amber-500" />
                        <span>Instant connection</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          {/* Mobile Sticky Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-card/95 backdrop-blur-lg border-t border-border p-4 z-50">
            <div className="flex items-center gap-3 max-w-6xl mx-auto">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Rate</p>
                <p className="text-lg font-bold text-primary">₹{lawyer.price_per_minute || 5}/min</p>
              </div>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => handleBookClick('chat')}>
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => handleBookClick('audio')}>
                <Phone className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => handleBookClick('video')}>
                <Video className="h-4 w-4" />
              </Button>
              <Button className="gap-2" onClick={() => handleBookClick('video')}>
                <CreditCard className="h-4 w-4" />
                Book
              </Button>
            </div>
          </div>
          {/* Spacer for mobile bottom bar */}
          <div className="h-24 lg:hidden" />
        </div>
      </div>
      {/* Payment Modal */}
      {lawyer && profile && (
        <BookingPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          lawyer={{
            id: lawyer.id,
            user_id: lawyer.user_id,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            price_per_minute: lawyer.price_per_minute,
            rating: lawyer.rating,
            specializations: lawyer.specializations,
          }}
          consultationType={selectedType}
        />
      )}
      {/* </MainLayout> */}
    </ClientLayout>
  );
};
export default ClientLawyerDetail;