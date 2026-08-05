import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { AppLayout } from '@/components/AppLayout';
import { useListReports, useCreateReport, useDeleteReport, getListReportsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { BarChart, Plus, Trash2, Download, Filter, BookmarkCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/chat/MarkdownRenderer';

export default function Reports() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: reports, isLoading } = useListReports({ userId: user?.id ?? '' }, {
    query: { enabled: !!user?.id }
  });

  const createReport = useCreateReport();
  const deleteReport = useDeleteReport();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [reportType, setReportType] = useState<'roadmap' | 'ats_analysis' | 'interview_prep' | 'skill_gap' | 'project_recommendation'>('roadmap');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');

  const handleCreate = async () => {
    if (!title.trim() || !content.trim() || !user) return;
    try {
      await createReport.mutateAsync({
        data: {
          user_id: user.id,
          title,
          content,
          report_type: reportType,
          priority,
        }
      });
      queryClient.invalidateQueries({ queryKey: getListReportsQueryKey({ userId: user.id }) });
      setIsCreateOpen(false);
      setTitle('');
      setContent('');
      toast({ title: 'Report saved' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error saving report' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteReport.mutateAsync({ reportId: id });
      queryClient.invalidateQueries({ queryKey: getListReportsQueryKey({ userId: user.id }) });
      if (selectedReport?.id === id) setSelectedReport(null);
      toast({ title: 'Report deleted' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error deleting report' });
    }
  };

  const handleExport = (report: any) => {
    const blob = new Blob([report.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredReports = (reports || []).filter((r) => {
    if (filterType === 'all') return true;
    return r.report_type === filterType;
  });

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto p-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Saved Roadmaps & Reports</h1>
            <p className="text-muted-foreground mt-1 text-sm">Exportable career plans, ATS analyses, and interview notes.</p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px] h-9 text-xs">
                <Filter className="w-3.5 h-3.5 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="roadmap">Roadmaps</SelectItem>
                <SelectItem value="ats_analysis">ATS Analysis</SelectItem>
                <SelectItem value="interview_prep">Interview Prep</SelectItem>
                <SelectItem value="skill_gap">Skill Gap</SelectItem>
                <SelectItem value="project_recommendation">Project Recommendations</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => setIsCreateOpen(true)} className="h-9 text-xs shadow-md">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Create Report
            </Button>
          </div>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-xl bg-card border animate-pulse" />
            ))}
          </div>
        ) : filteredReports.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => {
              const priorityClass =
                report.priority === 'Critical'
                  ? 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-800'
                  : report.priority === 'High'
                  ? 'bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-800'
                  : report.priority === 'Medium'
                  ? 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800'
                  : 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800';

              return (
                <div
                  key={report.id}
                  className="bg-card border rounded-xl p-5 flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${priorityClass}`}>
                        {report.priority} Priority
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium capitalize">
                        {report.report_type.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {report.title}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {report.content.replace(/[#*`]/g, '')}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-6 pt-4 border-t text-xs text-muted-foreground">
                    <span>{formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => handleExport(report)}
                        title="Download Markdown"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(report.id)}
                        title="Delete Report"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-xl bg-card/30 max-w-2xl mx-auto">
            <BookmarkCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-foreground mb-2">No reports or roadmaps saved yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Save key advice during AI chat or manually create action roadmaps here.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Create First Report
            </Button>
          </div>
        )}
      </div>

      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col">
            <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <div>
                <DialogTitle className="text-xl font-bold">{selectedReport.title}</DialogTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Saved {new Date(selectedReport.created_at).toLocaleDateString()}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleExport(selectedReport)}>
                <Download className="w-3.5 h-3.5 mr-1.5" /> Export Markdown
              </Button>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <MarkdownRenderer content={selectedReport.content} />
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Save New Report / Roadmap</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Title</label>
              <Input placeholder="e.g. Node.js Fullstack Roadmap 2026" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={reportType} onValueChange={(val: any) => setReportType(val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="roadmap">Roadmap</SelectItem>
                    <SelectItem value="ats_analysis">ATS Analysis</SelectItem>
                    <SelectItem value="interview_prep">Interview Prep</SelectItem>
                    <SelectItem value="skill_gap">Skill Gap</SelectItem>
                    <SelectItem value="project_recommendation">Project Recommendation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Content (Markdown supported)</label>
              <Textarea
                placeholder="Write or paste your report, roadmap, or advice..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[220px] font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!title.trim() || !content.trim()}>Save Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
