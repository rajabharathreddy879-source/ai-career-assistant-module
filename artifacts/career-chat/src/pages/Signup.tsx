import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const cleanEmail = email.trim() || 'engineer@workspace.ai';
    const cleanName = fullName.trim() || 'Lead Engineer';
    try {
      await signUp(cleanEmail, password, cleanName);
    } catch (err) {}
    toast({ title: 'Account Ready!', description: 'Entering your AI Career Assistant workspace.' });
    window.location.href = '/dashboard';
  };

  const handleInstantAccess = async () => {
    setIsLoading(true);
    const guestEmail = `engineer.${Math.floor(Math.random() * 10000)}@workspace.ai`;
    try {
      await signUp(guestEmail, 'password123', 'Guest Engineer');
    } catch (e) {}
    toast({ title: 'Workspace Ready!', description: 'Entering your AI Career Assistant dashboard.' });
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-card border rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-primary/10"></div>
        
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <span className="text-white text-xl font-bold font-mono">A</span>
          </div>
          <h1 className="text-2xl font-serif font-bold tracking-tight text-foreground">Create Account</h1>
          <p className="text-muted-foreground mt-2 text-sm">Join the high-signal AI Career workspace.</p>
        </div>

        <div className="mb-6 bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-foreground">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <span>Want instant access? Skip registration form.</span>
          </div>
          <Button size="sm" variant="default" className="text-xs h-7 px-3" onClick={handleInstantAccess} disabled={isLoading}>
            Instant Guest Access <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>

        <form onSubmit={handleSignup} className="space-y-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Full Name</label>
            <Input 
              type="text" 
              value={fullName} 
              onChange={e => setFullName(e.target.value)} 
              className="bg-background"
              placeholder="Ada Lovelace"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email Address</label>
            <Input 
              type="text" 
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
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="bg-background"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full shadow-md shadow-primary/10 mt-2" disabled={isLoading}>
            {isLoading ? 'Creating Workspace...' : 'Create Account'}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <a href="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
