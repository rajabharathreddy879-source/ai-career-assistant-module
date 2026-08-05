import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signUp(email, password, fullName);
      toast({ title: 'Account created', description: 'Please sign in with your new account.' });
      setLocation('/login');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Signup Failed', description: error.message });
    } finally {
      setIsLoading(false);
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
          <h1 className="text-2xl font-serif font-bold tracking-tight text-foreground">Create account</h1>
          <p className="text-muted-foreground mt-2 text-sm">Join the high-signal workspace for engineers.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Full Name</label>
            <Input 
              type="text" 
              required 
              value={fullName} 
              onChange={e => setFullName(e.target.value)} 
              className="bg-background"
              placeholder="Ada Lovelace"
            />
          </div>
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
          <Button type="submit" className="w-full shadow-md shadow-primary/10 mt-2" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
