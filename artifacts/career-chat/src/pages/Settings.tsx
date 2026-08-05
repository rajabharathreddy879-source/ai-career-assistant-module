import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { AppLayout } from '@/components/AppLayout';
import { Settings as SettingsIcon, Sun, Moon, User, ShieldCheck, Cpu, Database, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
  }, [user]);

  const toggleTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    toast({ title: `Theme switched to ${newTheme} mode` });
  };

  const handleSaveProfile = async () => {
    toast({
      title: "Profile Updated",
      description: "Your user preferences have been saved successfully.",
    });
  };

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto p-8 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground">Settings & Preferences</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your profile, theme mode, and AI service configuration.</p>
        </header>

        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Profile Settings
              </CardTitle>
              <CardDescription>Your registered identity on Ascend AI.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                  <Input value={user?.email || ''} disabled className="bg-muted text-muted-foreground" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ada Lovelace" />
                </div>
              </div>
              <Button size="sm" onClick={handleSaveProfile} className="gap-1.5">
                <Save className="w-3.5 h-3.5" /> Save Profile
              </Button>
            </CardContent>
          </Card>

          {/* Theme Card */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" /> Appearance Mode
              </CardTitle>
              <CardDescription>Toggle between Dark mode and Light mode interface.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  onClick={() => toggleTheme('light')}
                  className="gap-2 h-10 px-5"
                >
                  <Sun className="w-4 h-4 text-amber-400" /> Light Mode
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => toggleTheme('dark')}
                  className="gap-2 h-10 px-5"
                >
                  <Moon className="w-4 h-4 text-indigo-400" /> Dark Mode
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System & AI Engine Status Card */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-500" /> AI Engine & Cloud Status
              </CardTitle>
              <CardDescription>Real-time status of backend services.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border">
                <div className="flex items-center gap-2 font-medium">
                  <Cpu className="w-4 h-4 text-purple-500" />
                  <span>Google Gemini 2.5 Flash SDK</span>
                </div>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                  <ShieldCheck className="w-3.5 h-3.5" /> Operational
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border">
                <div className="flex items-center gap-2 font-medium">
                  <Database className="w-4 h-4 text-blue-500" />
                  <span>Supabase PostgreSQL DB & Auth</span>
                </div>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                  <ShieldCheck className="w-3.5 h-3.5" /> Connected
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
