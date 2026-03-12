// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { MainLayout } from '@/components/layout/MainLayout';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Separator } from '@/components/ui/separator';
// import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { supabase } from '@/integrations/supabase/client';
// import { useAuth } from '@/contexts/AuthContext';
// import { useToast } from '@/hooks/use-toast';
// import { 
//   User, Mail, Phone, Camera, Save, Shield, ArrowLeft, 
//   Briefcase, GraduationCap, Clock, DollarSign, Loader2,
//   Languages, FileText, CheckCircle, Settings, Plus
// } from 'lucide-react';
// import { Skeleton } from '@/components/ui/skeleton';
// import { z } from 'zod';
// import { SpecializationSelector } from '@/components/onboarding/SpecializationSelector';
// import { LanguageSelector } from '@/components/onboarding/LanguageSelector';
// // Validation schemas
// const profileSchema = z.object({
//   full_name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
//   phone: z.string().trim().max(20, 'Phone number too long').optional().nullable(),
// });
// const lawyerProfileSchema = z.object({
//   bio: z.string().trim().max(1000, 'Bio must be less than 1000 characters').optional().nullable(),
//   education: z.string().trim().max(500, 'Education must be less than 500 characters').optional().nullable(),
//   experience_years: z.number().min(0, 'Experience cannot be negative').max(70, 'Invalid experience').optional().nullable(),
//   price_per_minute: z.number().min(1, 'Minimum $1/min').max(1000, 'Maximum $1000/min').optional().nullable(),
//   session_price: z.number().min(10, 'Minimum $10').max(10000, 'Maximum $10000').optional().nullable(),
//   bar_council_number: z.string().trim().max(100, 'Bar number too long').optional().nullable(),
// });
// interface Profile {
//   full_name: string;
//   email: string;
//   phone: string | null;
//   avatar_url: string | null;
// }
// interface LawyerProfile {
//   bio: string | null;
//   education: string | null;
//   experience_years: number | null;
//   price_per_minute: number | null;
//   session_price: number | null;
//   bar_council_number: string | null;
//   specializations: string[] | null;
//   languages: string[] | null;
//   status: string | null;
// }
// const LawyerManageAccount = () => {
//   const { user, loading: authLoading } = useAuth();
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [activeTab, setActiveTab] = useState('profile');
//   const [profile, setProfile] = useState<Profile>({
//     full_name: '',
//     email: '',
//     phone: null,
//     avatar_url: null,
//   });
//   const [lawyerProfile, setLawyerProfile] = useState<LawyerProfile>({
//     bio: null,
//     education: null,
//     experience_years: null,
//     price_per_minute: null,
//     session_price: null,
//     bar_council_number: null,
//     specializations: null,
//     languages: null,
//     status: null,
//   });
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   // Calculate completion percentage
//   const calculateCompletion = () => {
//     const fields = [
//       { check: (profile.full_name?.trim().length || 0) >= 2 },
//       { check: (lawyerProfile.bio?.trim().length || 0) >= 50 },
//       { check: (lawyerProfile.specializations?.length || 0) > 0 },
//       { check: (lawyerProfile.bar_council_number?.trim().length || 0) > 0 },
//       { check: (lawyerProfile.price_per_minute || 0) >= 1 },
//       { check: (lawyerProfile.languages?.length || 0) > 0 },
//     ];
//     const completed = fields.filter(f => f.check).length;
//     return Math.round((completed / fields.length) * 100);
//   };
//   useEffect(() => {
//     if (!authLoading && !user) {
//       navigate('/login');
//       return;
//     }
//     if (user) {
//       fetchProfileData();
//     }
//   }, [user, authLoading]);
//   const fetchProfileData = async () => {
//     if (!user) return;
//     const [{ data: profileData }, { data: lawyerData }] = await Promise.all([
//       supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
//       supabase.from('lawyer_profiles').select('*').eq('user_id', user.id).maybeSingle(),
//     ]);
//     if (profileData) {
//       setProfile({
//         full_name: profileData.full_name || '',
//         email: profileData.email || user.email || '',
//         phone: profileData.phone,
//         avatar_url: profileData.avatar_url,
//       });
//     }
//     if (lawyerData) {
//       setLawyerProfile({
//         bio: lawyerData.bio,
//         education: lawyerData.education,
//         experience_years: lawyerData.experience_years,
//         price_per_minute: Number(lawyerData.price_per_minute),
//         session_price: Number(lawyerData.session_price),
//         bar_council_number: lawyerData.bar_council_number,
//         specializations: lawyerData.specializations,
//         languages: lawyerData.languages,
//         status: lawyerData.status,
//       });
//     }
//     setLoading(false);
//   };
//   const handleSave = async () => {
//     if (!user) return;
//     setErrors({});
//     // Validate profile
//     const profileResult = profileSchema.safeParse(profile);
//     if (!profileResult.success) {
//       const fieldErrors: Record<string, string> = {};
//       profileResult.error.errors.forEach(err => {
//         fieldErrors[err.path[0] as string] = err.message;
//       });
//       setErrors(fieldErrors);
//       toast({ title: 'Validation Error', description: 'Please fix the errors below', variant: 'destructive' });
//       return;
//     }
//     // Validate lawyer profile
//     const lawyerResult = lawyerProfileSchema.safeParse(lawyerProfile);
//     if (!lawyerResult.success) {
//       const fieldErrors: Record<string, string> = {};
//       lawyerResult.error.errors.forEach(err => {
//         fieldErrors[err.path[0] as string] = err.message;
//       });
//       setErrors(prev => ({ ...prev, ...fieldErrors }));
//       toast({ title: 'Validation Error', description: 'Please fix the errors below', variant: 'destructive' });
//       return;
//     }
//     setSaving(true);
//     // Update profile
//     const { error: profileError } = await supabase
//       .from('profiles')
//       .update({
//         full_name: profile.full_name.trim(),
//         phone: profile.phone?.trim() || null,
//         updated_at: new Date().toISOString(),
//       })
//       .eq('id', user.id);
//     if (profileError) {
//       toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
//       setSaving(false);
//       return;
//     }
//     // Update lawyer profile
//     const { error: lawyerError } = await supabase
//       .from('lawyer_profiles')
//       .update({
//         bio: lawyerProfile.bio?.trim() || null,
//         education: lawyerProfile.education?.trim() || null,
//         experience_years: lawyerProfile.experience_years,
//         price_per_minute: lawyerProfile.price_per_minute,
//         session_price: lawyerProfile.session_price,
//         bar_council_number: lawyerProfile.bar_council_number?.trim() || null,
//         specializations: lawyerProfile.specializations,
//         languages: lawyerProfile.languages,
//         updated_at: new Date().toISOString(),
//       })
//       .eq('user_id', user.id);
//     if (lawyerError) {
//       toast({ title: 'Error', description: 'Failed to update professional details', variant: 'destructive' });
//       setSaving(false);
//       return;
//     }
//     toast({ title: '✅ Profile Updated', description: 'Your changes have been saved successfully' });
//     setSaving(false);
//   };
//   const completionPercentage = calculateCompletion();
//   if (authLoading || loading) {
//     return (
//       <MainLayout showFooter={false}>
//         <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
//           <div className="container max-w-5xl mx-auto px-4 py-8">
//             <Skeleton className="h-10 w-48 mb-8" />
//             <Skeleton className="h-64 rounded-2xl mb-6" />
//             <Skeleton className="h-48 rounded-2xl" />
//           </div>
//         </div>
//       </MainLayout>
//     );
//   }
//   return (
//     <MainLayout showFooter={false}>
//       <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
//         <div className="container max-w-5xl mx-auto px-4 py-8">
//           {/* Header */}
//           <div className="flex items-center justify-between mb-8">
//             <div className="flex items-center gap-4">
//               <Button 
//                 variant="ghost" 
//                 size="icon" 
//                 onClick={() => navigate('/lawyer/dashboard')}
//               >
//                 <ArrowLeft className="h-5 w-5" />
//               </Button>
//               <div>
//                 <h1 className="font-serif text-3xl font-bold">Manage Account</h1>
//                 <p className="text-muted-foreground">Update your profile and professional details</p>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <div className="text-right hidden sm:block">
//                 <p className="text-sm text-muted-foreground">Profile Completion</p>
//                 <p className="text-lg font-semibold">{completionPercentage}%</p>
//               </div>
//               <div className="w-12 h-12 rounded-full border-4 border-primary flex items-center justify-center">
//                 <span className="text-sm font-bold">{completionPercentage}%</span>
//               </div>
//             </div>
//           </div>
//           {/* Profile Header Card */}
//           <Card className="border-0 shadow-lg mb-6 overflow-hidden">
//             <div className="h-24 bg-gradient-to-r from-primary via-primary/80 to-accent" />
//             <CardContent className="relative pt-0 pb-6 px-6">
//               <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
//                 <div className="relative">
//                   <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
//                     <AvatarImage src={profile.avatar_url || ''} />
//                     <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
//                       {profile.full_name?.charAt(0).toUpperCase() || 'U'}
//                     </AvatarFallback>
//                   </Avatar>
//                   <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
//                     <Camera className="h-4 w-4" />
//                   </button>
//                 </div>
//                 <div className="flex-1 pb-2">
//                   <h3 className="font-semibold text-xl">{profile.full_name || 'Your Name'}</h3>
//                   <p className="text-sm text-muted-foreground">{profile.email}</p>
//                 </div>
//                 <div className="flex items-center gap-2 flex-wrap">
//                   <Badge variant="secondary" className="gap-1">
//                     <Briefcase className="h-3 w-3" />
//                     Legal Professional
//                   </Badge>
//                   {lawyerProfile.status === 'approved' && (
//                     <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
//                       <CheckCircle className="h-3 w-3" />
//                       Verified
//                     </Badge>
//                   )}
//                   {lawyerProfile.status === 'pending' && (
//                     <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1">
//                       <Clock className="h-3 w-3" />
//                       Pending Review
//                     </Badge>
//                   )}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//           {/* Tabs Navigation */}
//           <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
//             <TabsList className="grid w-full grid-cols-4 h-12">
//               <TabsTrigger value="profile" className="gap-2">
//                 <User className="h-4 w-4" />
//                 <span className="hidden sm:inline">Personal Info</span>
//               </TabsTrigger>
//               <TabsTrigger value="professional" className="gap-2">
//                 <Briefcase className="h-4 w-4" />
//                 <span className="hidden sm:inline">Professional</span>
//               </TabsTrigger>
//               <TabsTrigger value="pricing" className="gap-2">
//                 <DollarSign className="h-4 w-4" />
//                 <span className="hidden sm:inline">Pricing</span>
//               </TabsTrigger>
//               <TabsTrigger value="custom" className="gap-2">
//                 <Settings className="h-4 w-4" />
//                 <span className="hidden sm:inline">Custom</span>
//               </TabsTrigger>
//             </TabsList>
//             {/* Personal Info Tab */}
//             <TabsContent value="profile">
//               <Card className="border-0 shadow-lg">
//                 <CardHeader className="pb-4">
//                   <CardTitle className="flex items-center gap-2">
//                     <User className="h-5 w-5" />
//                     Personal Information
//                   </CardTitle>
//                   <CardDescription>Update your basic profile details</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="space-y-2">
//                       <Label htmlFor="full_name" className="flex items-center gap-2">
//                         <User className="h-4 w-4 text-muted-foreground" />
//                         Full Name *
//                       </Label>
//                       <Input
//                         id="full_name"
//                         value={profile.full_name}
//                         onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
//                         placeholder="Enter your full name"
//                         className={errors.full_name ? 'border-destructive' : ''}
//                       />
//                       {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="email" className="flex items-center gap-2">
//                         <Mail className="h-4 w-4 text-muted-foreground" />
//                         Email Address
//                       </Label>
//                       <Input
//                         id="email"
//                         value={profile.email}
//                         disabled
//                         className="bg-muted"
//                       />
//                       <p className="text-xs text-muted-foreground">Email cannot be changed</p>
//                     </div>
//                     <div className="space-y-2 md:col-span-2">
//                       <Label htmlFor="phone" className="flex items-center gap-2">
//                         <Phone className="h-4 w-4 text-muted-foreground" />
//                         Phone Number
//                       </Label>
//                       <Input
//                         id="phone"
//                         value={profile.phone || ''}
//                         onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
//                         placeholder="Enter your phone number"
//                         className={errors.phone ? 'border-destructive' : ''}
//                       />
//                       {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>
//             {/* Professional Tab */}
//             <TabsContent value="professional">
//               <div className="space-y-6">
//                 <Card className="border-0 shadow-lg">
//                   <CardHeader className="pb-4">
//                     <CardTitle className="flex items-center gap-2">
//                       <FileText className="h-5 w-5" />
//                       Professional Bio
//                     </CardTitle>
//                     <CardDescription>Tell clients about yourself and your expertise (min 50 characters)</CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <Textarea
//                       value={lawyerProfile.bio || ''}
//                       onChange={(e) => setLawyerProfile(prev => ({ ...prev, bio: e.target.value }))}
//                       placeholder="I am an experienced attorney specializing in..."
//                       rows={5}
//                       className={errors.bio ? 'border-destructive' : ''}
//                     />
//                     <div className="flex justify-between mt-2">
//                       {errors.bio && <p className="text-xs text-destructive">{errors.bio}</p>}
//                       <p className="text-xs text-muted-foreground ml-auto">
//                         {lawyerProfile.bio?.length || 0}/1000 characters
//                       </p>
//                     </div>
//                   </CardContent>
//                 </Card>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <Card className="border-0 shadow-lg">
//                     <CardHeader className="pb-4">
//                       <CardTitle className="flex items-center gap-2">
//                         <GraduationCap className="h-5 w-5" />
//                         Education
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <Input
//                         value={lawyerProfile.education || ''}
//                         onChange={(e) => setLawyerProfile(prev => ({ ...prev, education: e.target.value }))}
//                         placeholder="e.g., J.D. from Harvard Law School"
//                         className={errors.education ? 'border-destructive' : ''}
//                       />
//                       {errors.education && <p className="text-xs text-destructive mt-1">{errors.education}</p>}
//                     </CardContent>
//                   </Card>
//                   <Card className="border-0 shadow-lg">
//                     <CardHeader className="pb-4">
//                       <CardTitle className="flex items-center gap-2">
//                         <Clock className="h-5 w-5" />
//                         Experience
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="flex items-center gap-3">
//                         <Input
//                           type="number"
//                           min={0}
//                           max={70}
//                           value={lawyerProfile.experience_years || ''}
//                           onChange={(e) => setLawyerProfile(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
//                           placeholder="Years"
//                           className={`w-24 ${errors.experience_years ? 'border-destructive' : ''}`}
//                         />
//                         <span className="text-muted-foreground">years of practice</span>
//                       </div>
//                       {errors.experience_years && <p className="text-xs text-destructive mt-1">{errors.experience_years}</p>}
//                     </CardContent>
//                   </Card>
//                 </div>
//                 <Card className="border-0 shadow-lg">
//                   <CardHeader className="pb-4">
//                     <CardTitle className="flex items-center gap-2">
//                       <Shield className="h-5 w-5" />
//                       Bar Council Number *
//                     </CardTitle>
//                     <CardDescription>Your official bar registration number for verification</CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <Input
//                       value={lawyerProfile.bar_council_number || ''}
//                       onChange={(e) => setLawyerProfile(prev => ({ ...prev, bar_council_number: e.target.value }))}
//                       placeholder="Enter your bar council number"
//                       className={errors.bar_council_number ? 'border-destructive' : ''}
//                     />
//                     {errors.bar_council_number && <p className="text-xs text-destructive mt-1">{errors.bar_council_number}</p>}
//                   </CardContent>
//                 </Card>
//                 <SpecializationSelector
//                   selected={lawyerProfile.specializations || []}
//                   onChange={(specs) => setLawyerProfile(prev => ({ ...prev, specializations: specs }))}
//                 />
//                 <LanguageSelector
//                   selected={lawyerProfile.languages || []}
//                   onChange={(langs) => setLawyerProfile(prev => ({ ...prev, languages: langs }))}
//                 />
//               </div>
//             </TabsContent>
//             {/* Pricing Tab */}
//             <TabsContent value="pricing">
//               <Card className="border-0 shadow-lg">
//                 <CardHeader className="pb-4">
//                   <CardTitle className="flex items-center gap-2">
//                     <DollarSign className="h-5 w-5" />
//                     Consultation Pricing
//                   </CardTitle>
//                   <CardDescription>Set your rates for client consultations</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="space-y-2">
//                       <Label htmlFor="price_per_minute" className="flex items-center gap-2">
//                         <Clock className="h-4 w-4 text-muted-foreground" />
//                         Price per Minute ($) *
//                       </Label>
//                       <Input
//                         id="price_per_minute"
//                         type="number"
//                         min={1}
//                         max={1000}
//                         value={lawyerProfile.price_per_minute || ''}
//                         onChange={(e) => setLawyerProfile(prev => ({ ...prev, price_per_minute: parseFloat(e.target.value) || 0 }))}
//                         placeholder="e.g., 5"
//                         className={errors.price_per_minute ? 'border-destructive' : ''}
//                       />
//                       {errors.price_per_minute && <p className="text-xs text-destructive">{errors.price_per_minute}</p>}
//                       <p className="text-xs text-muted-foreground">Charged for audio/video consultations</p>
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="session_price" className="flex items-center gap-2">
//                         <DollarSign className="h-4 w-4 text-muted-foreground" />
//                         Session Price ($)
//                       </Label>
//                       <Input
//                         id="session_price"
//                         type="number"
//                         min={10}
//                         max={10000}
//                         value={lawyerProfile.session_price || ''}
//                         onChange={(e) => setLawyerProfile(prev => ({ ...prev, session_price: parseFloat(e.target.value) || 0 }))}
//                         placeholder="e.g., 100"
//                         className={errors.session_price ? 'border-destructive' : ''}
//                       />
//                       {errors.session_price && <p className="text-xs text-destructive">{errors.session_price}</p>}
//                       <p className="text-xs text-muted-foreground">Fixed price for booking a session</p>
//                     </div>
//                   </div>
//                   <div className="p-4 bg-secondary/50 rounded-lg">
//                     <h4 className="font-medium mb-2">💡 Pricing Tips</h4>
//                     <ul className="text-sm text-muted-foreground space-y-1">
//                       <li>• Research competitive rates in your practice area</li>
//                       <li>• Consider offering introductory rates for new clients</li>
//                       <li>• Higher rates may work well once you have strong reviews</li>
//                     </ul>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>
//             {/* Custom Section Tab */}
//             <TabsContent value="custom">
//               <Card className="border-0 shadow-lg">
//                 <CardHeader className="pb-4">
//                   <CardTitle className="flex items-center gap-2">
//                     <Settings className="h-5 w-5" />
//                     Custom Section
//                   </CardTitle>
//                   <CardDescription>This section is reserved for additional features</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="min-h-[300px] border-2 border-dashed border-muted-foreground/25 rounded-xl flex flex-col items-center justify-center text-center p-8">
//                     <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
//                       <Plus className="h-8 w-8 text-muted-foreground" />
//                     </div>
//                     <h3 className="text-lg font-semibold mb-2">Custom Content Area</h3>
//                     <p className="text-muted-foreground max-w-md">
//                       This blank section is available for you to add custom features, 
//                       integrations, or additional content as needed.
//                     </p>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           </Tabs>
//           {/* Save Button */}
//           <div className="flex justify-end gap-4 mt-8 sticky bottom-4 bg-background/80 backdrop-blur-sm p-4 rounded-xl border shadow-lg">
//             <Button 
//               variant="outline" 
//               onClick={() => navigate('/lawyer/dashboard')}
//             >
//               Cancel
//             </Button>
//             <Button onClick={handleSave} disabled={saving} className="gap-2 min-w-32">
//               {saving ? (
//                 <>
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                   Saving...
//                 </>
//               ) : (
//                 <>
//                   <Save className="h-4 w-4" />
//                   Save Changes
//                 </>
//               )}
//             </Button>
//           </div>
//         </div>
//       </div>
//     </MainLayout>
//   );
// };
// export default LawyerManageAccount;




import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { MainLayout } from '@/components/layout/MainLayout';
import { LawyerLayout } from '@/components/layout/LawyerLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { LawyerDocuments } from '@/components/profile/LawyerDocuments';
import { z } from 'zod';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import {
  ArrowLeft, Save, X, User, Mail, Phone as PhoneIcon, Shield,
  Briefcase, GraduationCap, Languages, DollarSign, FileText, Award, Loader2, CalendarIcon
} from 'lucide-react';
import { formatLawyerName } from '@/lib/lawyer-utils';
const SPECIALIZATION_OPTIONS = [
  'Criminal Law', 'Family Law', 'Corporate Law', 'Civil Law',
  'Real Estate', 'Immigration', 'Tax Law', 'Intellectual Property',
  'Labor Law', 'Environmental Law', 'Consumer Law', 'Banking Law'
];
const LANGUAGE_OPTIONS = [
  'English', 'Hindi', 'Spanish', 'French', 'German',
  'Mandarin', 'Arabic', 'Portuguese', 'Japanese', 'Korean'
];
const profileSchema = z.object({
  full_name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  phone: z.string().trim().max(20, 'Phone number too long').optional().nullable(),
});
interface PersonalInfo {
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
}
interface ProfessionalInfo {
  bio: string;
  education: string;
  bar_council_number: string;
  experience_years: number;
  price_per_minute: number;
  session_price: number;
  specializations: string[];
  languages: string[];
  status: string | null;
}
const LawyerManageAccount = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [personal, setPersonal] = useState<PersonalInfo>({
    full_name: '',
    email: '',
    phone: null,
    avatar_url: null,
    date_of_birth: null,
  });
  const [professional, setProfessional] = useState<ProfessionalInfo>({
    bio: '', education: '', bar_council_number: '', experience_years: 0,
    price_per_minute: 5, session_price: 100, specializations: [], languages: ['English'],
    status: null,
  });
  useEffect(() => {
    if (!authLoading && !user) { navigate('/login'); return; }
    if (user) fetchAllData();
  }, [user, authLoading]);
  const fetchAllData = async () => {
    if (!user) return;
    const [profileRes, lawyerRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('lawyer_profiles').select('*').eq('user_id', user.id).maybeSingle(),
    ]);
    if (profileRes.data) {
      setPersonal({
        full_name: profileRes.data.full_name || '',
        email: profileRes.data.email || user.email || '',
        phone: profileRes.data.phone,
        avatar_url: profileRes.data.avatar_url,
        date_of_birth: profileRes.data.date_of_birth,
      });
    }
    if (lawyerRes.data) {
      setProfessional({
        bio: lawyerRes.data.bio || '',
        education: lawyerRes.data.education || '',
        bar_council_number: lawyerRes.data.bar_council_number || '',
        experience_years: lawyerRes.data.experience_years || 0,
        price_per_minute: Number(lawyerRes.data.price_per_minute) || 5,
        session_price: Number(lawyerRes.data.session_price) || 100,
        specializations: lawyerRes.data.specializations || [],
        languages: lawyerRes.data.languages || ['English'],
        status: lawyerRes.data.status,
      });
    }
    setLoading(false);
  };
  const handleSaveAll = async () => {
    if (!user) return;
    setErrors({});
    const profileResult = profileSchema.safeParse(personal);
    if (!profileResult.success) {
      const fieldErrors: Record<string, string> = {};
      profileResult.error.errors.forEach(err => { fieldErrors[err.path[0] as string] = err.message; });
      setErrors(fieldErrors);
      toast({ title: 'Validation Error', description: 'Please fix the errors below', variant: 'destructive' });
      return;
    }
    if (!professional.bio.trim()) {
      setErrors({ bio: 'Bio is required' });
      toast({ variant: 'destructive', title: 'Bio is required' });
      return;
    }
    if (professional.specializations.length === 0) {
      toast({ variant: 'destructive', title: 'Select at least one specialization' });
      return;
    }
    setSaving(true);
    const [profileRes, lawyerRes] = await Promise.all([
      supabase.from('profiles').update({
        full_name: personal.full_name.trim(),
        phone: personal.phone?.trim() || null,
        date_of_birth: personal.date_of_birth || null,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id),
      supabase.from('lawyer_profiles').update({
        bio: professional.bio.trim(),
        education: professional.education.trim(),
        bar_council_number: professional.bar_council_number.trim(),
        experience_years: professional.experience_years,
        price_per_minute: professional.price_per_minute,
        session_price: professional.session_price,
        specializations: professional.specializations,
        languages: professional.languages,
        updated_at: new Date().toISOString(),
      }).eq('user_id', user.id),
    ]);
    if (profileRes.error || lawyerRes.error) {
      toast({ variant: 'destructive', title: 'Save failed', description: profileRes.error?.message || lawyerRes.error?.message });
    } else {
      toast({ title: '✅ All changes saved successfully!' });
    }
    setSaving(false);
  };
  const toggleSpecialization = (spec: string) => {
    setProfessional(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec],
    }));
  };
  const toggleLanguage = (lang: string) => {
    setProfessional(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang],
    }));
  };
  if (authLoading || loading) {
    return (
      // <MainLayout showFooter={false}>
      <LawyerLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
          <div className="container max-w-5xl mx-auto px-4 py-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-48 mb-8" />
            <Skeleton className="h-16 w-full mb-6 rounded-xl" />
            <Skeleton className="h-96 rounded-2xl" />
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
        <div className="container max-w-5xl mx-auto px-4 py-6 sm:py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/lawyer/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold">Manage Account</h1>
                <p className="text-sm text-muted-foreground">Your personal & professional details in one place</p>
              </div>
            </div>
            <Button onClick={handleSaveAll} disabled={saving} className="gap-2 min-w-36 self-end sm:self-auto">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save All Changes</>}
            </Button>
          </div>
          {/* Tabs */}
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="w-full grid grid-cols-3 h-12 sm:h-14 rounded-xl bg-muted/60 p-1">
              <TabsTrigger value="personal" className="rounded-lg text-xs sm:text-sm gap-1.5 data-[state=active]:shadow-md">
                <User className="h-4 w-4 hidden sm:inline" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="professional" className="rounded-lg text-xs sm:text-sm gap-1.5 data-[state=active]:shadow-md">
                <Briefcase className="h-4 w-4 hidden sm:inline" />
                Professional
              </TabsTrigger>
              <TabsTrigger value="documents" className="rounded-lg text-xs sm:text-sm gap-1.5 data-[state=active]:shadow-md">
                <FileText className="h-4 w-4 hidden sm:inline" />
                Documents
              </TabsTrigger>
            </TabsList>
            {/* ─── PERSONAL TAB ─── */}
            <TabsContent value="personal" className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5" /> Profile Photo & Identity
                  </CardTitle>
                  <CardDescription>Upload your photo and manage basic details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    {user && (
                      <AvatarUpload
                        userId={user.id}
                        currentAvatarUrl={personal.avatar_url}
                        fallbackName={personal.full_name}
                        onAvatarChange={(url) => setPersonal(prev => ({ ...prev, avatar_url: url }))}
                        size="lg"
                      />
                    )}
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">{formatLawyerName(personal.full_name)}</h3>
                      <p className="text-sm text-muted-foreground">{personal.email}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="secondary" className="gap-1">
                          <Shield className="h-3 w-3" /> Professional
                        </Badge>
                        {professional.status === 'approved' && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Verified</Badge>
                        )}
                        {professional.status === 'pending' && (
                          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending Approval</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Separator />
                  {/* Name / Email / Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" /> Full Name
                      </Label>
                      <Input
                        id="full_name"
                        value={personal.full_name}
                        onChange={(e) => setPersonal(prev => ({ ...prev, full_name: e.target.value }))}
                        className={errors.full_name ? 'border-destructive' : ''}
                      />
                      {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" /> Email Address
                      </Label>
                      <Input id="email" value={personal.email} disabled className="bg-muted" />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4 text-muted-foreground" /> Phone Number
                      </Label>
                      <Input
                        id="phone"
                        value={personal.phone || ''}
                        onChange={(e) => setPersonal(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" /> Date of Birth
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !personal.date_of_birth && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {personal.date_of_birth ? format(parseISO(personal.date_of_birth), 'PPP') : <span>Select date of birth</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={personal.date_of_birth ? parseISO(personal.date_of_birth) : undefined}
                            onSelect={(date) => setPersonal(prev => ({ ...prev, date_of_birth: date ? format(date, 'yyyy-MM-dd') : null }))}
                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                            initialFocus
                            className={cn('p-3 pointer-events-auto')}
                            captionLayout="dropdown-buttons"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>


                  </div>
                </CardContent>
              </Card>
            </TabsContent>





            {/* ─── PROFESSIONAL TAB ─── */}
            <TabsContent value="professional" className="space-y-6">
              {/* Bio */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" /> About You
                  </CardTitle>
                  <CardDescription>Write a compelling bio that highlights your expertise</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Professional Bio *</Label>
                    <Textarea
                      id="bio"
                      placeholder="Describe your experience, expertise, and approach to legal practice..."
                      className={`min-h-[140px] ${errors.bio ? 'border-destructive' : ''}`}
                      value={professional.bio}
                      onChange={(e) => setProfessional(prev => ({ ...prev, bio: e.target.value }))}
                      maxLength={1000}
                    />
                    <div className="flex justify-between">
                      {errors.bio && <p className="text-xs text-destructive">{errors.bio}</p>}
                      <p className="text-xs text-muted-foreground ml-auto">{professional.bio.length}/1000</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Specializations */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Briefcase className="h-5 w-5" /> Specializations
                  </CardTitle>
                  <CardDescription>Select your areas of legal expertise</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALIZATION_OPTIONS.map(spec => (
                      <Badge
                        key={spec}
                        variant={professional.specializations.includes(spec) ? 'default' : 'outline'}
                        className="cursor-pointer hover:opacity-80 transition-opacity py-2 px-4"
                        onClick={() => toggleSpecialization(spec)}
                      >
                        {professional.specializations.includes(spec) && <X className="h-3 w-3 mr-1" />}
                        {spec}
                      </Badge>
                    ))}
                  </div>
                  {professional.specializations.length === 0 && (
                    <p className="text-sm text-destructive mt-2">Please select at least one specialization</p>
                  )}
                </CardContent>
              </Card>
              {/* Education & Credentials */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <GraduationCap className="h-5 w-5" /> Education & Credentials
                  </CardTitle>
                  <CardDescription>Your educational background and bar council details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="education">Education</Label>
                    <Textarea
                      id="education"
                      placeholder="e.g., LLB from Harvard Law School, LLM in Corporate Law..."
                      className="min-h-[100px]"
                      value={professional.education}
                      onChange={(e) => setProfessional(prev => ({ ...prev, education: e.target.value }))}
                      maxLength={500}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bar_council">Bar Council Number</Label>
                      <Input
                        id="bar_council"
                        placeholder="Enter your bar council number"
                        value={professional.bar_council_number}
                        onChange={(e) => setProfessional(prev => ({ ...prev, bar_council_number: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input
                        id="experience"
                        type="number"
                        min={0}
                        max={50}
                        value={professional.experience_years}
                        onChange={(e) => setProfessional(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Languages */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Languages className="h-5 w-5" /> Languages
                  </CardTitle>
                  <CardDescription>Select languages you can consult in</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGE_OPTIONS.map(lang => (
                      <Badge
                        key={lang}
                        variant={professional.languages.includes(lang) ? 'default' : 'outline'}
                        className="cursor-pointer hover:opacity-80 transition-opacity py-2 px-4"
                        onClick={() => toggleLanguage(lang)}
                      >
                        {professional.languages.includes(lang) && <X className="h-3 w-3 mr-1" />}
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {/* Pricing */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="h-5 w-5" /> Pricing
                  </CardTitle>
                  <CardDescription>Set your consultation rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="price_per_minute">Price per Minute ($)</Label>
                      <Input
                        id="price_per_minute"
                        type="number"
                        min={1}
                        max={100}
                        step={0.5}
                        value={professional.price_per_minute}
                        onChange={(e) => setProfessional(prev => ({ ...prev, price_per_minute: parseFloat(e.target.value) || 1 }))}
                      />
                      <p className="text-xs text-muted-foreground">For chat, audio, and video calls</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="session_price">Session Price ($)</Label>
                      <Input
                        id="session_price"
                        type="number"
                        min={10}
                        max={1000}
                        step={5}
                        value={professional.session_price}
                        onChange={(e) => setProfessional(prev => ({ ...prev, session_price: parseFloat(e.target.value) || 10 }))}
                      />
                      <p className="text-xs text-muted-foreground">Fixed price for scheduled sessions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {/* ─── DOCUMENTS TAB ─── */}
            <TabsContent value="documents" className="space-y-6">
              {user && <LawyerDocuments userId={user.id} />}
            </TabsContent>
          </Tabs>
          {/* Bottom Save Bar (mobile-friendly sticky) */}
          <div className="sticky bottom-0 bg-background/80 backdrop-blur-lg border-t py-4 -mx-4 px-4 mt-8 flex justify-end gap-3 sm:hidden">
            <Button variant="outline" onClick={() => navigate('/lawyer/dashboard')}>Cancel</Button>
            <Button onClick={handleSaveAll} disabled={saving} className="gap-2 flex-1">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save All</>}
            </Button>
          </div>
        </div>
      </div>
      {/* </MainLayout> */}
    </LawyerLayout>
  );
};
export default LawyerManageAccount;