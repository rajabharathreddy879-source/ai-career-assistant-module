import { Link, useLocation } from 'wouter';
import { LayoutDashboard, MessageSquare, FileText, BarChart, Settings, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const [location] = useLocation();
  const { signOut, user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'AI Chat Assistant', path: '/chat', icon: MessageSquare },
    { label: 'Resumes & Context', path: '/resumes', icon: FileText },
    { label: 'Reports & Roadmaps', path: '/reports', icon: BarChart },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r bg-card/60 backdrop-blur flex flex-col h-screen shrink-0 hidden md:flex">
      <div className="h-14 flex items-center px-6 border-b gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="font-serif font-bold text-lg tracking-tight">Ascend AI</span>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = location === item.path || (item.path !== '/dashboard' && location.startsWith(item.path));
          return (
            <Link key={item.path} href={item.path} className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group",
              active 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}>
              <item.icon className={cn("w-4 h-4", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-3">
        <div className="px-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Signed in as</p>
          <p className="text-xs font-medium text-foreground truncate">{user?.email}</p>
        </div>
        <Button variant="outline" size="sm" className="w-full justify-start text-xs text-muted-foreground hover:text-foreground" onClick={() => signOut()}>
          <LogOut className="w-3.5 h-3.5 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
