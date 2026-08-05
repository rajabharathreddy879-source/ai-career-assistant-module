import { MessageSquare, FileText, BookmarkCheck, Sparkles, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsOverviewProps {
  stats: {
    total_sessions: number;
    total_messages: number;
    resumes_count: number;
    reports_count: number;
  };
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const statCards = [
    {
      title: 'AI Consultations',
      value: stats.total_sessions,
      subtitle: 'Active & archived sessions',
      icon: MessageSquare,
      color: 'text-blue-500 bg-blue-500/10 border-blue-200 dark:border-blue-800',
    },
    {
      title: 'Messages Exchanged',
      value: stats.total_messages,
      subtitle: 'Real-time streaming queries',
      icon: Sparkles,
      color: 'text-purple-500 bg-purple-500/10 border-purple-200 dark:border-purple-800',
    },
    {
      title: 'Resumes Managed',
      value: stats.resumes_count,
      subtitle: 'ATS-optimized versions',
      icon: FileText,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-200 dark:border-emerald-800',
    },
    {
      title: 'Saved Roadmaps & Advice',
      value: stats.reports_count,
      subtitle: 'Career action plans',
      icon: BookmarkCheck,
      color: 'text-amber-500 bg-amber-500/10 border-amber-200 dark:border-amber-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, idx) => (
        <Card key={idx} className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg border ${card.color}`}>
              <card.icon className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold text-foreground font-mono">{card.value}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              {card.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
