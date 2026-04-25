// import { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '@/contexts/AuthContext';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Scale, ArrowLeft, Loader2, Shield, User } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [loginType, setLoginType] = useState<'user' | 'admin'>('user');
//   const { signIn, role, user } = useAuth();
//   const navigate = useNavigate();
//   const { toast } = useToast();

//   // Handle redirect after role is fetched
//   useEffect(() => {
//     if (user && role && !loading) {
//       if (loginType === 'admin') {
//         if (role === 'admin') {
//           navigate('/admin');
//         } else {
//           toast({
//             variant: 'destructive',
//             title: 'Access Denied',
//             description: 'Only admin accounts can use admin login.',
//           });
//           // Sign out non-admin users who try to use admin login
//         }
//       } else {
//         // Regular user login - redirect based on role
//         if (role === 'admin') {
//           navigate('/admin');
//         } else if (role === 'lawyer') {
//           navigate('/lawyer/dashboard');
//         } else {
//           navigate('/dashboard');
//         }
//       }
//     }
//   }, [user, role, loading, loginType, navigate, toast]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     const { error } = await signIn(email, password);

//     if (error) {
//       toast({
//         variant: 'destructive',
//         title: 'Sign in failed',
//         description: error.message,
//       });
//       setLoading(false);
//       return;
//     }

//     toast({
//       title: 'Welcome back!',
//       description: 'You have successfully signed in.',
//     });

//     // Role check and redirect will happen in useEffect
//     setTimeout(() => {
//       setLoading(false);
//     }, 1000);
//   };

//   return (
//     <div className="min-h-screen flex">
//       {/* Left Panel - Form */}
//       <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24">
//         <div className="max-w-md w-full mx-auto">
//           <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
//             <ArrowLeft className="h-4 w-4" />
//             Back to home
//           </Link>

//           <div className="flex items-center gap-2 mb-8">
//             <Scale className="h-8 w-8" />
//             <span className="font-serif text-2xl font-semibold">LEGALMATE</span>
//           </div>

//           <h1 className="font-serif text-3xl font-bold mb-2">Welcome back</h1>
//           <p className="text-muted-foreground mb-8">
//             Sign in to your account to continue
//           </p>

//           <Tabs value={loginType} onValueChange={(v) => setLoginType(v as 'user' | 'admin')} className="mb-6">
//             <TabsList className="grid w-full grid-cols-2">
//               <TabsTrigger value="user" className="flex items-center gap-2">
//                 <User className="h-4 w-4" />
//                 User Login
//               </TabsTrigger>
//               <TabsTrigger value="admin" className="flex items-center gap-2">
//                 <Shield className="h-4 w-4" />
//                 Admin Login
//               </TabsTrigger>
//             </TabsList>

//             <TabsContent value="user" className="mt-6">
//               <form onSubmit={handleSubmit} className="space-y-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="user-email">Email</Label>
//                   <Input
//                     id="user-email"
//                     type="email"
//                     placeholder="you@example.com"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                     className="h-12"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <div className="flex items-center justify-between">
//                     <Label htmlFor="user-password">Password</Label>
//                     <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground">
//                       Forgot password?
//                     </Link>
//                   </div>
//                   <Input
//                     id="user-password"
//                     type="password"
//                     placeholder="••••••••"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                     className="h-12"
//                   />
//                 </div>

//                 <Button type="submit" className="w-full h-12" disabled={loading}>
//                   {loading ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Signing in...
//                     </>
//                   ) : (
//                     'Sign In'
//                   )}
//                 </Button>
//               </form>

//               <p className="text-center mt-8 text-muted-foreground">
//                 Don't have an account?{' '}
//                 <Link to="/signup" className="text-foreground font-medium hover:underline">
//                   Sign up
//                 </Link>
//               </p>
//             </TabsContent>

//             <TabsContent value="admin" className="mt-6">
//               <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
//                 <p className="text-sm text-amber-700 dark:text-amber-400">
//                   <Shield className="h-4 w-4 inline mr-2" />
//                   Admin login is restricted to authorized personnel only.
//                 </p>
//               </div>

//               <form onSubmit={handleSubmit} className="space-y-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="admin-email">Admin Email</Label>
//                   <Input
//                     id="admin-email"
//                     type="email"
//                     placeholder="admin@legalmate.com"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                     className="h-12"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="admin-password">Admin Password</Label>
//                   <Input
//                     id="admin-password"
//                     type="password"
//                     placeholder="••••••••"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                     className="h-12"
//                   />
//                 </div>

//                 <Button type="submit" className="w-full h-12" disabled={loading}>
//                   {loading ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Signing in...
//                     </>
//                   ) : (
//                     <>
//                       <Shield className="mr-2 h-4 w-4" />
//                       Admin Sign In
//                     </>
//                   )}
//                 </Button>
//               </form>
//             </TabsContent>
//           </Tabs>
//         </div>
//       </div>

//       {/* Right Panel - Decorative */}
//       <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-16">
//         <div className="max-w-md text-white">
//           <h2 className="font-serif text-4xl font-bold mb-6">
//             {loginType === 'admin' 
//               ? 'Platform Administration' 
//               : 'Expert Legal Advice When You Need It'
//             }
//           </h2>
//           <p className="text-white/70 text-lg">
//             {loginType === 'admin'
//               ? 'Manage lawyers, clients, consultations, and platform settings with full administrative control.'
//               : 'Connect with verified lawyers instantly. Get professional guidance for all your legal matters.'
//             }
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scale, ArrowLeft, Loader2, Shield, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { MainLayout } from '@/components/layout/MainLayout';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user');

  const { signIn, role, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
        }
      } else {
        if (role === 'admin') navigate('/admin');
        else if (role === 'lawyer') navigate('/lawyer/dashboard');
        else navigate('/dashboard');
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

    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-64px)] flex items-start justify-center px-3 sm:px-4 pt-4 sm:pt-6
      bg-gradient-to-br from-background via-background to-muted/40">

        {/* MAIN CARD */}
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-4 sm:gap-6 
        bg-background/80 backdrop-blur-xl border border-border/50 
        rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">

          {/* LEFT SIDE */}
          <div className="p-5 sm:p-6 md:p-8 lg:p-10">

            {/* HEADER */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-4 sm:mb-6 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>

            {/* <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Scale className="h-6 w-6 sm:h-7 sm:w-7" />
              <span className="font-serif text-lg sm:text-xl font-semibold">
                LEGALMATE
              </span>
            </div> */}

            <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
              Welcome Back
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
              Sign in to continue
            </p>

            {/* TABS */}
            <Tabs
              value={loginType}
              onValueChange={(v) => setLoginType(v as 'user' | 'admin')}
              className="mb-4"
            >
              <TabsList className="grid w-full grid-cols-2 rounded-xl">
                <TabsTrigger value="user" className="gap-2 text-xs sm:text-sm">
                  <User className="h-4 w-4" />
                  User
                </TabsTrigger>
                <TabsTrigger value="admin" className="gap-2 text-xs sm:text-sm">
                  <Shield className="h-4 w-4" />
                  Admin
                </TabsTrigger>
              </TabsList>

              {/* USER LOGIN */}
              <TabsContent value="user" className="mt-4">
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">

                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm"
                  />

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Password</span>
                      <Link to="/forgot-password" className="text-muted-foreground hover:text-foreground">
                        Forgot?
                      </Link>
                    </div>

                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold"
                    disabled={loading}
                  >
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

                <p className="text-center mt-4 sm:mt-6 text-xs sm:text-sm text-muted-foreground">
                  Don’t have an account?{' '}
                  <Link to="/signup" className="font-medium hover:underline">
                    Sign up
                  </Link>
                </p>
              </TabsContent>

              {/* ADMIN LOGIN */}
              <TabsContent value="admin" className="mt-4">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4 text-xs">
                  <Shield className="h-4 w-4 inline mr-1" />
                  Admin access only
                </div>

                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">

                  <Input
                    type="email"
                    placeholder="Admin Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm"
                  />

                  <Input
                    type="password"
                    placeholder="Admin Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm"
                  />

                  <Button
                    type="submit"
                    className="w-full h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm font-semibold"
                    disabled={loading}
                  >
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

          {/* RIGHT PANEL */}
          <div className="hidden lg:flex items-center justify-center 
          bg-gradient-to-br from-primary to-primary/70 text-white p-10">

            <div className="max-w-sm space-y-4">
              <h2 className="text-4xl font-bold">
                {loginType === 'admin'
                  ? 'Admin Control Panel'
                  : 'Legal Help Made Easy'}
              </h2>

              <p className="text-white/80">
                {loginType === 'admin'
                  ? 'Manage platform, users, and operations.'
                  : 'Connect with verified lawyers instantly.'}
              </p>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
};

export default Login;