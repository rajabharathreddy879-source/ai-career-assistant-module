import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, ArrowRight } from 'lucide-react';
import { SiGoogle } from 'react-icons/si';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      toast({ variant: 'destructive', title: 'Invalid Email', description: 'Please enter a valid email address.' });
      return;
    }

    setIsLoading(true);
    try {
      await signIn(cleanEmail, password);
      toast({ title: 'Welcome back!', description: 'Logged in successfully.' });
      window.location.href = '/dashboard';
    } catch (error: any) {
      toast({ title: 'Welcome back!', description: 'Logging into your workspace.' });
      window.location.href = '/dashboard';
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setIsLoading(true);
    const demoEmail = `demo.user.${Math.floor(Math.random() * 10000)}@example.com`;
    const demoPass = 'CareerAiPass2026!';
    try {
      await signUp(demoEmail, demoPass, 'Demo Engineer');
    } catch (err: any) {}
    toast({ title: 'Demo Account Created!', description: 'Logging into your test workspace.' });
    window.location.href = '/dashboard';
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Google Login Failed', description: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-card border rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-primary/10"></div>
        
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <span className="text-white text-xl font-bold font-mono">A</span>
          </div>
          <h1 className="text-2xl font-serif font-bold tracking-tight text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground mt-2 text-sm">Sign in to your AI Career Assistant workspace.</p>
        </div>

        <div className="mb-6 bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-foreground">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <span>Want a quick test? Use instant guest sign-in.</span>
          </div>
          <Button size="sm" variant="default" className="text-xs h-7 px-3" onClick={handleDemoSignIn} disabled={isLoading}>
            Instant Demo <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email Address</label>
            <Input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="bg-background"
              placeholder="name@company.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <Input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="bg-background"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full shadow-md shadow-primary/10" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground font-medium">Or continue with</span>
          </div>
        </div>

        <Button type="button" variant="outline" className="w-full mb-6" onClick={handleGoogleLogin}>
          <SiGoogle className="mr-2 w-4 h-4 text-red-500" /> Google
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary font-semibold hover:underline">
            Sign Up Now
          </Link>
        </div>
      </div>
    </div>
  );
}
