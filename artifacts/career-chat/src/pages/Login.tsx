import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { SiGoogle } from 'react-icons/si';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      setLocation('/dashboard');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Login Failed', description: error.message });
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-2xl font-serif font-bold tracking-tight text-foreground">Welcome back</h1>
          <p className="text-muted-foreground mt-2 text-sm">Sign in to your high-signal workspace.</p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="bg-background"
              placeholder="engineer@example.com"
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
          <SiGoogle className="mr-2 w-4 h-4" /> Google
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
