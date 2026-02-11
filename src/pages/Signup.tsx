import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scale, ArrowLeft, Loader2, User, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Signup = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'lawyer' ? 'lawyer' : 'client';
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'client' | 'lawyer'>(initialRole);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Invalid password',
        description: 'Password must be at least 6 characters long.',
      });
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName, selectedRole);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Sign up failed',
        description: error.message,
      });
      setLoading(false);
      return;
    }

    toast({
      title: 'Account created!',
      description: selectedRole === 'lawyer' 
        ? 'Your account is pending approval. You can complete your profile now.'
        : 'Welcome to LEGALMATE!',
    });

    navigate(selectedRole === 'lawyer' ? '/lawyer/dashboard' : '/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12">
        <div className="max-w-md w-full mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="flex items-center gap-2 mb-8">
            <Scale className="h-8 w-8" />
            <span className="font-serif text-2xl font-semibold">LEGALMATE</span>
          </div>

          <h1 className="font-serif text-3xl font-bold mb-2">Create an account</h1>
          <p className="text-muted-foreground mb-8">
            Get started with LEGALMATE today
          </p>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => setSelectedRole('client')}
              className={cn(
                'p-4 rounded-lg border-2 text-left transition-all',
                selectedRole === 'client' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              )}
            >
              <User className="h-6 w-6 mb-2" />
              <div className="font-semibold">Client</div>
              <div className="text-sm text-muted-foreground">Get legal advice</div>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('lawyer')}
              className={cn(
                'p-4 rounded-lg border-2 text-left transition-all',
                selectedRole === 'lawyer' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              )}
            >
              <Briefcase className="h-6 w-6 mb-2" />
              <div className="font-semibold">Lawyer</div>
              <div className="text-sm text-muted-foreground">Offer consultations</div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
            </div>

            <Button type="submit" className="w-full h-12" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                `Sign Up as ${selectedRole === 'lawyer' ? 'Lawyer' : 'Client'}`
              )}
            </Button>
          </form>

          <p className="text-center mt-8 text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-foreground font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-16">
        <div className="max-w-md text-white">
          <h2 className="font-serif text-4xl font-bold mb-6">
            {selectedRole === 'lawyer' 
              ? 'Join Our Network of Legal Experts'
              : 'Get Expert Legal Help Today'
            }
          </h2>
          <p className="text-white/70 text-lg">
            {selectedRole === 'lawyer'
              ? 'Set your own rates, work on your schedule, and help clients with their legal needs.'
              : 'Connect with verified lawyers for consultations via chat, audio, or video calls.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
