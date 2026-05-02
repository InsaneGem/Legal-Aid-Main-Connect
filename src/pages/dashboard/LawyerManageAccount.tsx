
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