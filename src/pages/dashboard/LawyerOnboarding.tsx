import { useState, useEffect, useCallback } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingStepCard } from '@/components/onboarding/OnboardingStepCard';
import { SpecializationSelector } from '@/components/onboarding/SpecializationSelector';
import { LanguageSelector } from '@/components/onboarding/LanguageSelector';

import { 
  ArrowLeft, Save, GraduationCap, Languages, Briefcase, 
  DollarSign, FileText, Award, User, Clock, Shield,
  CheckCircle, AlertTriangle, Loader2
} from 'lucide-react';
import { LawyerDocuments } from '@/components/profile/LawyerDocuments';
interface LawyerProfileData {
  bio: string;
  education: string;
  bar_council_number: string;
  experience_years: number;
  price_per_minute: number;
  session_price: number;
  specializations: string[];
  languages: string[];
  status: string;
}

const LawyerOnboarding = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<LawyerProfileData>({
    bio: '',
    education: '',
    bar_council_number: '',
    experience_years: 0,
    price_per_minute: 5,
    session_price: 100,
    specializations: [],
    languages: ['English'],
    status: 'pending',
  });

  // Calculate completion status for each step
  const getStepCompletion = useCallback(() => ({
    bio: profileData.bio.trim().length >= 50,
    specializations: profileData.specializations.length > 0,
    credentials: profileData.bar_council_number.trim().length > 0,
    pricing: profileData.price_per_minute >= 1 && profileData.session_price >= 10,
    languages: profileData.languages.length > 0,
  }), [profileData]);

  const completion = getStepCompletion();
  const completedSteps = Object.values(completion).filter(Boolean).length;
  const totalSteps = Object.keys(completion).length;
  const isProfileComplete = completedSteps === totalSteps;

  const steps = [
    { id: 'bio', title: 'Bio', description: 'About you', isComplete: completion.bio, isCurrent: !completion.bio },
    { id: 'specializations', title: 'Expertise', description: 'Your areas', isComplete: completion.specializations, isCurrent: completion.bio && !completion.specializations },
    { id: 'credentials', title: 'Credentials', description: 'Verification', isComplete: completion.credentials, isCurrent: completion.specializations && !completion.credentials },
    { id: 'pricing', title: 'Pricing', description: 'Your rates', isComplete: completion.pricing, isCurrent: completion.credentials && !completion.pricing },
    { id: 'languages', title: 'Languages', description: 'Communication', isComplete: completion.languages, isCurrent: completion.pricing && !completion.languages },
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchProfile();
    }
  }, [user, authLoading]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('lawyer_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setProfileData({
        bio: data.bio || '',
        education: data.education || '',
        bar_council_number: data.bar_council_number || '',
        experience_years: data.experience_years || 0,
        price_per_minute: data.price_per_minute || 5,
        session_price: data.session_price || 100,
        specializations: data.specializations || [],
        languages: data.languages || ['English'],
        status: data.status || 'pending',
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    if (!profileData.bio.trim()) {
      toast({ variant: 'destructive', title: 'Bio is required', description: 'Please write a professional bio (at least 50 characters).' });
      return;
    }
    if (profileData.bio.trim().length < 50) {
      toast({ variant: 'destructive', title: 'Bio too short', description: 'Please write at least 50 characters.' });
      return;
    }
    if (profileData.specializations.length === 0) {
      toast({ variant: 'destructive', title: 'Select at least one specialization' });
      return;
    }
    if (!profileData.bar_council_number.trim()) {
      toast({ variant: 'destructive', title: 'Bar Council Number required', description: 'Please enter your registration number for verification.' });
      return;
    }
    if (profileData.price_per_minute < 1) {
      toast({ variant: 'destructive', title: 'Price per minute must be at least $1' });
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from('lawyer_profiles')
      .update({
        bio: profileData.bio.trim(),
        education: profileData.education.trim(),
        bar_council_number: profileData.bar_council_number.trim(),
        experience_years: profileData.experience_years,
        price_per_minute: profileData.price_per_minute,
        session_price: profileData.session_price,
        specializations: profileData.specializations,
        languages: profileData.languages,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Failed to save profile', description: error.message });
    } else {
      toast({ 
        title: '✅ Profile saved successfully!', 
        description: isProfileComplete 
          ? 'Your profile is now under review.' 
          : 'Complete all required fields to submit for review.' 
      });
      navigate('/lawyer/dashboard');
    }
    setSaving(false);
  };

  const getStatusBadge = () => {
    switch (profileData.status) {
      case 'approved':
        return (
          <Badge className="gap-1.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/30 px-3 py-1">
            <Shield className="h-3.5 w-3.5" />
            Verified Lawyer
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="gap-1.5 bg-destructive/10 text-destructive border-destructive/30 px-3 py-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            Application Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="gap-1.5 bg-amber-500/10 text-amber-600 border-amber-500/30 px-3 py-1">
            <Clock className="h-3.5 w-3.5" />
            Pending Review
          </Badge>
        );
    }
  };

  if (authLoading || loading) {
    return (
      // <MainLayout showFooter={false}>
        <LawyerLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-24 mb-6" />
          <div className="space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
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
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <Button 
              variant="ghost" 
              className="gap-2 w-fit" 
              onClick={() => navigate('/lawyer/dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            {getStatusBadge()}
          </div>

          {/* Title & Description */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
              Complete Your Profile
            </h1>
            <p className="text-muted-foreground text-lg">
              Fill in all required information to get verified and start accepting consultations
            </p>
          </div>

          {/* Progress Tracker */}
          <Card className="mb-8 border-2">
            <CardContent className="p-6">
              <OnboardingProgress steps={steps} currentStep={completedSteps} />
              
              {isProfileComplete ? (
                <div className="mt-6 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20 flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-emerald-700">Profile Complete!</p>
                    <p className="text-sm text-muted-foreground">
                      {profileData.status === 'pending' 
                        ? 'Your profile is under review. We\'ll notify you once approved.'
                        : profileData.status === 'approved'
                          ? 'You\'re verified and can accept consultations.'
                          : 'Please update your profile and resubmit.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-6 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-700">Profile Incomplete</p>
                    <p className="text-sm text-muted-foreground">
                      Complete all required fields to submit your profile for verification.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* Bio Section */}
            <OnboardingStepCard
              title="Professional Bio"
              description="Write a compelling bio that highlights your expertise and experience"
              icon={<FileText className="h-6 w-6" />}
              isComplete={completion.bio}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">About You *</Label>
                  <Textarea
                    id="bio"
                    placeholder="I am a seasoned legal professional with expertise in... Describe your experience, notable cases, and approach to helping clients."
                    className="min-h-[150px] resize-none"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    maxLength={1000}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Minimum 50 characters required</span>
                    <span className={profileData.bio.length < 50 ? 'text-amber-600' : 'text-emerald-600'}>
                      {profileData.bio.length}/1000
                    </span>
                  </div>
                </div>
              </div>
            </OnboardingStepCard>

            {/* Specializations */}
            <OnboardingStepCard
              title="Areas of Expertise"
              description="Select your practice areas to help clients find you"
              icon={<Briefcase className="h-6 w-6" />}
              isComplete={completion.specializations}
            >
              <SpecializationSelector
                selected={profileData.specializations}
                onChange={(specs) => setProfileData(prev => ({ ...prev, specializations: specs }))}
              />
            </OnboardingStepCard>

            {/* Credentials */}
            <OnboardingStepCard
              title="Education & Credentials"
              description="Verify your qualifications for client trust"
              icon={<GraduationCap className="h-6 w-6" />}
              isComplete={completion.credentials}
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="education">Education Background</Label>
                  <Textarea
                    id="education"
                    placeholder="e.g., LLB from Harvard Law School (2015), LLM in Corporate Law from Yale (2017)"
                    className="min-h-[100px] resize-none"
                    value={profileData.education}
                    onChange={(e) => setProfileData(prev => ({ ...prev, education: e.target.value }))}
                    maxLength={500}
                  />
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bar_council">Bar Council Number *</Label>
                    <Input
                      id="bar_council"
                      placeholder="Enter your bar registration number"
                      value={profileData.bar_council_number}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bar_council_number: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Required for verification by admin
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      max="50"
                      value={profileData.experience_years}
                      onChange={(e) => setProfileData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Total years in legal practice
                    </p>
                  </div>
                </div>
              </div>
            </OnboardingStepCard>

            {/* Languages */}
            <OnboardingStepCard
              title="Languages"
              description="Select languages you can consult in"
              icon={<Languages className="h-6 w-6" />}
              isComplete={completion.languages}
            >
              <LanguageSelector
                selected={profileData.languages}
                onChange={(langs) => setProfileData(prev => ({ ...prev, languages: langs }))}
              />
            </OnboardingStepCard>

            {/* Pricing */}
            <OnboardingStepCard
              title="Consultation Rates"
              description="Set your pricing for different consultation types"
              icon={<DollarSign className="h-6 w-6" />}
              isComplete={completion.pricing}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price_per_minute">Price per Minute ($) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price_per_minute"
                      type="number"
                      min="1"
                      max="100"
                      step="0.5"
                      className="pl-9"
                      value={profileData.price_per_minute}
                      onChange={(e) => setProfileData(prev => ({ ...prev, price_per_minute: parseFloat(e.target.value) || 1 }))}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    For chat, audio, and video calls
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session_price">Session Price ($) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="session_price"
                      type="number"
                      min="10"
                      max="1000"
                      step="5"
                      className="pl-9"
                      value={profileData.session_price}
                      onChange={(e) => setProfileData(prev => ({ ...prev, session_price: parseFloat(e.target.value) || 10 }))}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Fixed price for scheduled sessions
                  </p>
                </div>
              </div>
              
              {/* Pricing Preview */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-3">Pricing Preview</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-xs text-muted-foreground">10 min call</p>
                    <p className="font-semibold">${(profileData.price_per_minute * 10).toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-xs text-muted-foreground">30 min call</p>
                    <p className="font-semibold">${(profileData.price_per_minute * 30).toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-xs text-muted-foreground">60 min call</p>
                    <p className="font-semibold">${(profileData.price_per_minute * 60).toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-background rounded-lg border-2 border-primary/20">
                    <p className="text-xs text-muted-foreground">Session</p>
                    <p className="font-semibold text-primary">${profileData.session_price.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </OnboardingStepCard>

            {/* Actions */}
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {isProfileComplete ? 'Ready to submit!' : `${totalSteps - completedSteps} step${totalSteps - completedSteps > 1 ? 's' : ''} remaining`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isProfileComplete 
                        ? 'Save your profile to submit for admin review' 
                        : 'Complete all required fields to submit'}
                    </p>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/lawyer/dashboard')}
                      className="flex-1 sm:flex-initial"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      disabled={saving || !isProfileComplete}
                      className="flex-1 sm:flex-initial gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save & Submit
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
             {/* Documents
            {user && <LawyerDocuments userId={user.id} />} */}
          </div>
        </div>
      </div>
    {/* </MainLayout> */}
      </LawyerLayout>
  );
};

export default LawyerOnboarding;
