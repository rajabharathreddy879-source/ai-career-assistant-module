import { Link, useLocation } from 'wouter';
import { Sparkles, LayoutDashboard, MessageSquare, FileText, BarChart, Settings, LogOut, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';

export function Navbar() {
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <header className="h-14 border-b bg-card/80 backdrop-blur px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="font-serif text-xl">Ascend AI</span>
      </Link>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 text-muted-foreground hover:text-foreground">
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </Button>

        {user ? (
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Button>
            </Link>
            <Button size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="h-8 text-xs">
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
