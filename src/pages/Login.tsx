import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scale, ArrowLeft, Loader2, Shield, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user');
  const { signIn, role, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle redirect after role is fetched
  useEffect(() => {
    if (user && role && !loading) {
      if (loginType === 'admin') {
        if (role === 'admin') {
          navigate('/admin');
        } else {
          toast({
            variant: 'destructive',
            title: 'Access Denied',
            description: 'Only admin accounts can use admin login.',
          });
          // Sign out non-admin users who try to use admin login
        }
      } else {
        // Regular user login - redirect based on role
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'lawyer') {
          navigate('/lawyer/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    }
  }, [user, role, loading, loginType, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Sign in failed',
        description: error.message,
      });
      setLoading(false);
      return;
    }

    toast({
      title: 'Welcome back!',
      description: 'You have successfully signed in.',
    });

    // Role check and redirect will happen in useEffect
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24">
        <div className="max-w-md w-full mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="flex items-center gap-2 mb-8">
            <Scale className="h-8 w-8" />
            <span className="font-serif text-2xl font-semibold">LEGALMATE</span>
          </div>

          <h1 className="font-serif text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to your account to continue
          </p>

          <Tabs value={loginType} onValueChange={(v) => setLoginType(v as 'user' | 'admin')} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                User Login
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin Login
              </TabsTrigger>
            </TabsList>

            <TabsContent value="user" className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="user-email">Email</Label>
                  <Input
                    id="user-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="user-password">Password</Label>
                    <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="user-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                <Button type="submit" className="w-full h-12" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              <p className="text-center mt-8 text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" className="text-foreground font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </TabsContent>

            <TabsContent value="admin" className="mt-6">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <Shield className="h-4 w-4 inline mr-2" />
                  Admin login is restricted to authorized personnel only.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@legalmate.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password">Admin Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                <Button type="submit" className="w-full h-12" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Sign In
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-16">
        <div className="max-w-md text-white">
          <h2 className="font-serif text-4xl font-bold mb-6">
            {loginType === 'admin' 
              ? 'Platform Administration' 
              : 'Expert Legal Advice When You Need It'
            }
          </h2>
          <p className="text-white/70 text-lg">
            {loginType === 'admin'
              ? 'Manage lawyers, clients, consultations, and platform settings with full administrative control.'
              : 'Connect with verified lawyers instantly. Get professional guidance for all your legal matters.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
