// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { MainLayout } from '@/components/layout/MainLayout';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Label } from '@/components/ui/label';
// import { Badge } from '@/components/ui/badge';
// import { supabase } from '@/integrations/supabase/client';
// import { useAuth } from '@/contexts/AuthContext';
// import { useToast } from '@/hooks/use-toast';
// import { Skeleton } from '@/components/ui/skeleton';
// import { 
//   ArrowLeft, Save, Plus, X, GraduationCap, 
//   Languages, Briefcase, DollarSign, FileText, Award
// } from 'lucide-react';

// const SPECIALIZATION_OPTIONS = [
//   'Criminal Law', 'Family Law', 'Corporate Law', 'Civil Law',
//   'Real Estate', 'Immigration', 'Tax Law', 'Intellectual Property',
//   'Labor Law', 'Environmental Law', 'Consumer Law', 'Banking Law'
// ];

// const LANGUAGE_OPTIONS = [
//   'English', 'Hindi', 'Spanish', 'French', 'German', 
//   'Mandarin', 'Arabic', 'Portuguese', 'Japanese', 'Korean'
// ];

// const LawyerProfileSetup = () => {
//   const { user, loading: authLoading } = useAuth();
//   const navigate = useNavigate();
//   const { toast } = useToast();

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [profileData, setProfileData] = useState({
//     bio: '',
//     education: '',
//     bar_council_number: '',
//     experience_years: 0,
//     price_per_minute: 5,
//     session_price: 100,
//     specializations: [] as string[],
//     languages: ['English'] as string[],
//   });

//   useEffect(() => {
//     if (!authLoading && !user) {
//       navigate('/login');
//       return;
//     }
//     if (user) {
//       fetchProfile();
//     }
//   }, [user, authLoading]);

//   const fetchProfile = async () => {
//     if (!user) return;

//     const { data, error } = await supabase
//       .from('lawyer_profiles')
//       .select('*')
//       .eq('user_id', user.id)
//       .maybeSingle();

//     if (data) {
//       setProfileData({
//         bio: data.bio || '',
//         education: data.education || '',
//         bar_council_number: data.bar_council_number || '',
//         experience_years: data.experience_years || 0,
//         price_per_minute: data.price_per_minute || 5,
//         session_price: data.session_price || 100,
//         specializations: data.specializations || [],
//         languages: data.languages || ['English'],
//       });
//     }
//     setLoading(false);
//   };

//   const handleSave = async () => {
//     if (!user) return;

//     // Validation
//     if (!profileData.bio.trim()) {
//       toast({ variant: 'destructive', title: 'Bio is required' });
//       return;
//     }
//     if (profileData.specializations.length === 0) {
//       toast({ variant: 'destructive', title: 'Select at least one specialization' });
//       return;
//     }
//     if (profileData.price_per_minute < 1) {
//       toast({ variant: 'destructive', title: 'Price per minute must be at least $1' });
//       return;
//     }

//     setSaving(true);

//     const { error } = await supabase
//       .from('lawyer_profiles')
//       .update({
//         bio: profileData.bio.trim(),
//         education: profileData.education.trim(),
//         bar_council_number: profileData.bar_council_number.trim(),
//         experience_years: profileData.experience_years,
//         price_per_minute: profileData.price_per_minute,
//         session_price: profileData.session_price,
//         specializations: profileData.specializations,
//         languages: profileData.languages,
//         updated_at: new Date().toISOString(),
//       })
//       .eq('user_id', user.id);

//     if (error) {
//       toast({ variant: 'destructive', title: 'Failed to save profile', description: error.message });
//     } else {
//       toast({ title: 'Profile saved successfully!' });
//       navigate('/lawyer/dashboard');
//     }
//     setSaving(false);
//   };

//   const toggleSpecialization = (spec: string) => {
//     setProfileData(prev => ({
//       ...prev,
//       specializations: prev.specializations.includes(spec)
//         ? prev.specializations.filter(s => s !== spec)
//         : [...prev.specializations, spec],
//     }));
//   };

//   const toggleLanguage = (lang: string) => {
//     setProfileData(prev => ({
//       ...prev,
//       languages: prev.languages.includes(lang)
//         ? prev.languages.filter(l => l !== lang)
//         : [...prev.languages, lang],
//     }));
//   };

//   if (authLoading || loading) {
//     return (
//       <MainLayout showFooter={false}>
//         <div className="container mx-auto px-4 py-8 max-w-4xl">
//           <Skeleton className="h-8 w-48 mb-8" />
//           <div className="space-y-6">
//             <Skeleton className="h-64" />
//             <Skeleton className="h-48" />
//             <Skeleton className="h-32" />
//           </div>
//         </div>
//       </MainLayout>
//     );
//   }

//   return (
//     <MainLayout showFooter={false}>
//       <div className="min-h-screen bg-secondary/30">
//         <div className="container mx-auto px-4 py-8 max-w-4xl">
//           <Button 
//             variant="ghost" 
//             className="mb-6" 
//             onClick={() => navigate('/lawyer/dashboard')}
//           >
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Back to Dashboard
//           </Button>

//           <div className="mb-8">
//             <h1 className="font-serif text-3xl font-bold mb-2">Profile Setup</h1>
//             <p className="text-muted-foreground">
//               Complete your profile to start accepting consultations
//             </p>
//           </div>

//           <div className="space-y-6">
//             {/* Bio Section */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <FileText className="h-5 w-5" />
//                   About You
//                 </CardTitle>
//                 <CardDescription>
//                   Write a compelling bio that highlights your expertise
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="bio">Professional Bio *</Label>
//                   <Textarea
//                     id="bio"
//                     placeholder="Describe your experience, expertise, and approach to legal practice..."
//                     className="min-h-[150px]"
//                     value={profileData.bio}
//                     onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
//                     maxLength={1000}
//                   />
//                   <p className="text-xs text-muted-foreground text-right">
//                     {profileData.bio.length}/1000 characters
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Specializations */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Briefcase className="h-5 w-5" />
//                   Specializations
//                 </CardTitle>
//                 <CardDescription>
//                   Select your areas of legal expertise
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="flex flex-wrap gap-2">
//                   {SPECIALIZATION_OPTIONS.map((spec) => (
//                     <Badge
//                       key={spec}
//                       variant={profileData.specializations.includes(spec) ? 'default' : 'outline'}
//                       className="cursor-pointer hover:opacity-80 transition-opacity py-2 px-4"
//                       onClick={() => toggleSpecialization(spec)}
//                     >
//                       {profileData.specializations.includes(spec) && (
//                         <X className="h-3 w-3 mr-1" />
//                       )}
//                       {spec}
//                     </Badge>
//                   ))}
//                 </div>
//                 {profileData.specializations.length === 0 && (
//                   <p className="text-sm text-destructive mt-2">
//                     Please select at least one specialization
//                   </p>
//                 )}
//               </CardContent>
//             </Card>

//             {/* Education & Credentials */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <GraduationCap className="h-5 w-5" />
//                   Education & Credentials
//                 </CardTitle>
//                 <CardDescription>
//                   Add your educational background and bar council details
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="education">Education</Label>
//                   <Textarea
//                     id="education"
//                     placeholder="e.g., LLB from Harvard Law School, LLM in Corporate Law..."
//                     className="min-h-[100px]"
//                     value={profileData.education}
//                     onChange={(e) => setProfileData(prev => ({ ...prev, education: e.target.value }))}
//                     maxLength={500}
//                   />
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="bar_council">Bar Council Number</Label>
//                     <Input
//                       id="bar_council"
//                       placeholder="Enter your bar council number"
//                       value={profileData.bar_council_number}
//                       onChange={(e) => setProfileData(prev => ({ ...prev, bar_council_number: e.target.value }))}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="experience">Years of Experience</Label>
//                     <Input
//                       id="experience"
//                       type="number"
//                       min="0"
//                       max="50"
//                       value={profileData.experience_years}
//                       onChange={(e) => setProfileData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
//                     />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Languages */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Languages className="h-5 w-5" />
//                   Languages
//                 </CardTitle>
//                 <CardDescription>
//                   Select languages you can consult in
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="flex flex-wrap gap-2">
//                   {LANGUAGE_OPTIONS.map((lang) => (
//                     <Badge
//                       key={lang}
//                       variant={profileData.languages.includes(lang) ? 'default' : 'outline'}
//                       className="cursor-pointer hover:opacity-80 transition-opacity py-2 px-4"
//                       onClick={() => toggleLanguage(lang)}
//                     >
//                       {profileData.languages.includes(lang) && (
//                         <X className="h-3 w-3 mr-1" />
//                       )}
//                       {lang}
//                     </Badge>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Pricing */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <DollarSign className="h-5 w-5" />
//                   Pricing
//                 </CardTitle>
//                 <CardDescription>
//                   Set your consultation rates
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="space-y-2">
//                     <Label htmlFor="price_per_minute">Price per Minute ($)</Label>
//                     <Input
//                       id="price_per_minute"
//                       type="number"
//                       min="1"
//                       max="100"
//                       step="0.5"
//                       value={profileData.price_per_minute}
//                       onChange={(e) => setProfileData(prev => ({ ...prev, price_per_minute: parseFloat(e.target.value) || 1 }))}
//                     />
//                     <p className="text-xs text-muted-foreground">
//                       For chat, audio, and video calls
//                     </p>
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="session_price">Session Price ($)</Label>
//                     <Input
//                       id="session_price"
//                       type="number"
//                       min="10"
//                       max="1000"
//                       step="5"
//                       value={profileData.session_price}
//                       onChange={(e) => setProfileData(prev => ({ ...prev, session_price: parseFloat(e.target.value) || 10 }))}
//                     />
//                     <p className="text-xs text-muted-foreground">
//                       Fixed price for scheduled sessions
//                     </p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Actions */}
//             <div className="flex items-center justify-end gap-4 pt-4">
//               <Button 
//                 variant="outline" 
//                 onClick={() => navigate('/lawyer/dashboard')}
//               >
//                 Cancel
//               </Button>
//               <Button onClick={handleSave} disabled={saving}>
//                 {saving ? (
//                   <>Saving...</>
//                 ) : (
//                   <>
//                     <Save className="h-4 w-4 mr-2" />
//                     Save Profile
//                   </>
//                 )}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </MainLayout>
//   );
// };

// export default LawyerProfileSetup;
