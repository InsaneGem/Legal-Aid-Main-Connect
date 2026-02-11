import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  User, Mail, Phone, Save, Shield, ArrowLeft, 
  Briefcase, GraduationCap, Clock, DollarSign, Loader2
} from 'lucide-react';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { LawyerDocuments } from '@/components/profile/LawyerDocuments';
import { Skeleton } from '@/components/ui/skeleton';
import { z } from 'zod';

// Validation schemas
const profileSchema = z.object({
  full_name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  phone: z.string().trim().max(20, 'Phone number too long').optional().nullable(),
});

const lawyerProfileSchema = z.object({
  bio: z.string().trim().max(1000, 'Bio must be less than 1000 characters').optional().nullable(),
  education: z.string().trim().max(500, 'Education must be less than 500 characters').optional().nullable(),
  experience_years: z.number().min(0, 'Experience cannot be negative').max(70, 'Invalid experience').optional().nullable(),
  price_per_minute: z.number().min(1, 'Minimum $1/min').max(1000, 'Maximum $1000/min').optional().nullable(),
  session_price: z.number().min(10, 'Minimum $10').max(10000, 'Maximum $10000').optional().nullable(),
  bar_council_number: z.string().trim().max(100, 'Bar number too long').optional().nullable(),
});

interface Profile {
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
}

interface LawyerProfile {
  bio: string | null;
  education: string | null;
  experience_years: number | null;
  price_per_minute: number | null;
  session_price: number | null;
  bar_council_number: string | null;
  specializations: string[] | null;
  status: string | null;
}

const ProfileSettings = () => {
  const { user, loading: authLoading, role: userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    email: '',
    phone: null,
    avatar_url: null,
  });
  const [lawyerProfile, setLawyerProfile] = useState<LawyerProfile | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchProfileData();
    }
  }, [user, authLoading]);

  const fetchProfileData = async () => {
    if (!user) return;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileData) {
      setProfile({
        full_name: profileData.full_name || '',
        email: profileData.email || user.email || '',
        phone: profileData.phone,
        avatar_url: profileData.avatar_url,
      });
    }

    // Fetch lawyer profile if user is a lawyer
    if (userRole === 'lawyer') {
      const { data: lawyerData } = await supabase
        .from('lawyer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (lawyerData) {
        setLawyerProfile({
          bio: lawyerData.bio,
          education: lawyerData.education,
          experience_years: lawyerData.experience_years,
          price_per_minute: Number(lawyerData.price_per_minute),
          session_price: Number(lawyerData.session_price),
          bar_council_number: lawyerData.bar_council_number,
          specializations: lawyerData.specializations,
          status: lawyerData.status,
        });
      }
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setErrors({});

    // Validate profile
    const profileResult = profileSchema.safeParse(profile);
    if (!profileResult.success) {
      const fieldErrors: Record<string, string> = {};
      profileResult.error.errors.forEach(err => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      toast({ title: 'Validation Error', description: 'Please fix the errors below', variant: 'destructive' });
      return;
    }

    // Validate lawyer profile if applicable
    if (lawyerProfile) {
      const lawyerResult = lawyerProfileSchema.safeParse(lawyerProfile);
      if (!lawyerResult.success) {
        const fieldErrors: Record<string, string> = {};
        lawyerResult.error.errors.forEach(err => {
          fieldErrors[err.path[0] as string] = err.message;
        });
        setErrors(prev => ({ ...prev, ...fieldErrors }));
        toast({ title: 'Validation Error', description: 'Please fix the errors below', variant: 'destructive' });
        return;
      }
    }

    setSaving(true);

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name.trim(),
        phone: profile.phone?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (profileError) {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
      setSaving(false);
      return;
    }

    // Update lawyer profile if applicable
    if (lawyerProfile && userRole === 'lawyer') {
      const { error: lawyerError } = await supabase
        .from('lawyer_profiles')
        .update({
          bio: lawyerProfile.bio?.trim() || null,
          education: lawyerProfile.education?.trim() || null,
          experience_years: lawyerProfile.experience_years,
          price_per_minute: lawyerProfile.price_per_minute,
          session_price: lawyerProfile.session_price,
          bar_council_number: lawyerProfile.bar_council_number?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (lawyerError) {
        toast({ title: 'Error', description: 'Failed to update professional details', variant: 'destructive' });
        setSaving(false);
        return;
      }
    }

    toast({ title: '✅ Profile Updated', description: 'Your changes have been saved successfully' });
    setSaving(false);
  };

  if (authLoading || loading) {
    return (
      <MainLayout showFooter={false}>
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
          <div className="container max-w-4xl mx-auto px-4 py-8">
            <Skeleton className="h-10 w-48 mb-8" />
            <Skeleton className="h-64 rounded-2xl mb-6" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showFooter={false}>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(userRole === 'lawyer' ? '/lawyer/dashboard' : '/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-serif text-3xl font-bold">Profileeeee Settings</h1>
              <p className="text-muted-foreground">Manage your personal information</p>
            </div>
          </div>

          {/* Avatar & Basic Info Card */}
          <Card className="border-0 shadow-lg mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your basic profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                {user && (
                  <AvatarUpload
                    userId={user.id}
                    currentAvatarUrl={profile.avatar_url}
                    fallbackName={profile.full_name}
                    onAvatarChange={(url) => setProfile(prev => ({ ...prev, avatar_url: url }))}
                  />
                )}
                <div>
                  <h3 className="font-semibold text-lg">{profile.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                    {userRole === 'lawyer' ? 'Legal Professional' : userRole === 'admin' ? 'Administrator' : 'Client'}
                    </Badge>
                    {lawyerProfile?.status === 'approved' && (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter your full name"
                    className={errors.full_name ? 'border-destructive' : ''}
                  />
                  {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lawyer-specific Settings */}
          {userRole === 'lawyer' && lawyerProfile && (
            <Card className="border-0 shadow-lg mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Professional Details
                </CardTitle>
                <CardDescription>Update your professional profile visible to clients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="bio" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={lawyerProfile.bio || ''}
                    onChange={(e) => setLawyerProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
                    placeholder="Tell clients about yourself and your expertise..."
                    rows={4}
                    className={errors.bio ? 'border-destructive' : ''}
                  />
                  {errors.bio && <p className="text-xs text-destructive">{errors.bio}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="education" className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      Education
                    </Label>
                    <Input
                      id="education"
                      value={lawyerProfile.education || ''}
                      onChange={(e) => setLawyerProfile(prev => prev ? { ...prev, education: e.target.value } : null)}
                      placeholder="Your educational background"
                      className={errors.education ? 'border-destructive' : ''}
                    />
                    {errors.education && <p className="text-xs text-destructive">{errors.education}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience" className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Years of Experience
                    </Label>
                    <Input
                      id="experience"
                      type="number"
                      min={0}
                      max={70}
                      value={lawyerProfile.experience_years || ''}
                      onChange={(e) => setLawyerProfile(prev => prev ? { ...prev, experience_years: parseInt(e.target.value) || 0 } : null)}
                      placeholder="Years"
                      className={errors.experience_years ? 'border-destructive' : ''}
                    />
                    {errors.experience_years && <p className="text-xs text-destructive">{errors.experience_years}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price_per_minute" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      Price per Minute ($)
                    </Label>
                    <Input
                      id="price_per_minute"
                      type="number"
                      min={1}
                      max={1000}
                      value={lawyerProfile.price_per_minute || ''}
                      onChange={(e) => setLawyerProfile(prev => prev ? { ...prev, price_per_minute: parseFloat(e.target.value) || 0 } : null)}
                      placeholder="e.g., 5"
                      className={errors.price_per_minute ? 'border-destructive' : ''}
                    />
                    {errors.price_per_minute && <p className="text-xs text-destructive">{errors.price_per_minute}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="session_price" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      Session Price ($)
                    </Label>
                    <Input
                      id="session_price"
                      type="number"
                      min={10}
                      max={10000}
                      value={lawyerProfile.session_price || ''}
                      onChange={(e) => setLawyerProfile(prev => prev ? { ...prev, session_price: parseFloat(e.target.value) || 0 } : null)}
                      placeholder="e.g., 100"
                      className={errors.session_price ? 'border-destructive' : ''}
                    />
                    {errors.session_price && <p className="text-xs text-destructive">{errors.session_price}</p>}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bar_number" className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      Bar Council Number
                    </Label>
                    <Input
                      id="bar_number"
                      value={lawyerProfile.bar_council_number || ''}
                      onChange={(e) => setLawyerProfile(prev => prev ? { ...prev, bar_council_number: e.target.value } : null)}
                      placeholder="Your bar registration number"
                      className={errors.bar_council_number ? 'border-destructive' : ''}
                    />
                    {errors.bar_council_number && <p className="text-xs text-destructive">{errors.bar_council_number}</p>}
                  </div>
                </div>

                {lawyerProfile.specializations && lawyerProfile.specializations.length > 0 && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      Specializations
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {lawyerProfile.specializations.map(spec => (
                        <Badge key={spec} variant="secondary">{spec}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      To update specializations, visit the full profile setup page
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

           {/* Lawyer Documents */}
          {userRole === 'lawyer' && user && (
            <LawyerDocuments userId={user.id} />
          )}

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate(userRole === 'lawyer' ? '/lawyer/dashboard' : '/dashboard')}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2 min-w-32">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfileSettings;
