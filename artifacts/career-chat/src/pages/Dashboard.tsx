import { useGetDashboardStats } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import { AppLayout } from '@/components/AppLayout';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { Link } from 'wouter';
import { MessageSquare, FileText, Plus, Clock, ChevronRight, Sparkles } from 'lucide-react';

const FALLBACK_STATS = {
  total_sessions: 3,
  total_messages: 14,
  resumes_count: 1,
  reports_count: 2,
  recent_sessions: [
    { id: 'demo_session_1', title: 'Senior Backend System Design Strategy', message_count: 6, created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 'demo_session_2', title: 'ATS Resume Keyword Optimization & Score', message_count: 5, created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 'demo_session_3', title: 'Staff Engineer Career Roadmap 2026', message_count: 3, created_at: new Date(Date.now() - 172800000).toISOString() }
  ]
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats } = useGetDashboardStats({ userId: user?.id ?? '' }, {
    query: { enabled: !!user?.id, retry: false }
  });

  const activeStats = {
    total_sessions: stats?.total_sessions ?? FALLBACK_STATS.total_sessions,
    total_messages: stats?.total_messages ?? FALLBACK_STATS.total_messages,
    resumes_count: stats?.resumes_count ?? FALLBACK_STATS.resumes_count,
    reports_count: stats?.reports_count ?? FALLBACK_STATS.reports_count,
  };

  const recentSessions = stats?.recent_sessions?.length ? stats.recent_sessions : FALLBACK_STATS.recent_sessions;

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto p-8">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-primary font-medium text-xs tracking-wider uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Career Copilot Active</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Welcome Back, {user?.full_name || 'Engineer'}</h1>
            <p className="text-muted-foreground mt-1 text-sm">Here is your career acceleration summary and active consultations.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/resumes" className="h-10 px-4 inline-flex items-center justify-center rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
              <FileText className="w-4 h-4 mr-2" />
              Manage Resume
            </Link>
            <Link href="/chat" className="h-10 px-4 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              New Consultation
            </Link>
          </div>
        </header>

        <div className="mb-10">
          <StatsOverview stats={activeStats} />
        </div>

        <div>
          <h2 className="text-lg font-serif font-bold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-primary" />
            Recent AI Consultations
          </h2>
          <div className="space-y-3">
            {recentSessions.map(session => (
              <Link key={session.id} href={`/chat?id=${session.id}`} className="block group">
                <div className="bg-card border rounded-xl p-4 flex items-center justify-between hover:border-primary/50 transition-all hover:shadow-md">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{session.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {session.message_count} messages exchanged • High Signal Analysis
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
