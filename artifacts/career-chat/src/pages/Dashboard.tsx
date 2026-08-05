import { useGetDashboardStats } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import { AppLayout } from '@/components/AppLayout';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { Link } from 'wouter';
import { MessageSquare, FileText, Plus, Clock, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useGetDashboardStats({ userId: user?.id ?? '' }, {
    query: { enabled: !!user?.id }
  });

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto p-8">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Overview</h1>
            <p className="text-muted-foreground mt-1 text-sm">Welcome back, let's accelerate your career.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/resumes" className="h-10 px-4 inline-flex items-center justify-center rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
              <FileText className="w-4 h-4 mr-2" />
              Upload Resume
            </Link>
            <Link href="/chat" className="h-10 px-4 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Link>
          </div>
        </header>

        <div className="mb-10">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 rounded-xl bg-card border animate-pulse" />
              ))}
            </div>
          ) : (
            <StatsOverview
              stats={{
                total_sessions: stats?.total_sessions ?? 0,
                total_messages: stats?.total_messages ?? 0,
                resumes_count: stats?.resumes_count ?? 0,
                reports_count: stats?.reports_count ?? 0,
              }}
            />
          )}
        </div>

        <div>
          <h2 className="text-lg font-serif font-bold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-primary" />
            Recent Consultations
          </h2>
          {isLoading ? (
             <div className="space-y-3">
               {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-lg bg-card border animate-pulse" />)}
             </div>
          ) : stats?.recent_sessions?.length ? (
            <div className="space-y-3">
              {stats.recent_sessions.map(session => (
                <Link key={session.id} href={`/chat?id=${session.id}`} className="block group">
                  <div className="bg-card border rounded-lg p-4 flex items-center justify-between hover:border-primary/50 transition-colors hover:shadow-sm">
                    <div>
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{session.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {session.message_count} messages • {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed rounded-xl bg-card/30">
              <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-20" />
              <h3 className="text-sm font-medium text-foreground mb-1">No sessions yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Start a new chat to get personalized career advice.</p>
              <Link href="/chat" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                Start chatting <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
