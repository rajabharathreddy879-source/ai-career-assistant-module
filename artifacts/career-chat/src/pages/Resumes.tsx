import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { AppLayout } from '@/components/AppLayout';
import { useListResumes, useCreateResume, useDeleteResume, getListResumesQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function Resumes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: resumes, isLoading } = useListResumes({ userId: user?.id ?? '' }, {
    query: { enabled: !!user?.id }
  });

  const createResume = useCreateResume();
  const deleteResume = useDeleteResume();

  const [activeResumeId, setActiveResumeId] = useState<string | null>(
    localStorage.getItem('activeResumeId')
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      const resume = await createResume.mutateAsync({
        data: { user_id: user!.id, name: newTitle, content: newContent }
      });
      queryClient.invalidateQueries({ queryKey: getListResumesQueryKey({ userId: user!.id }) });
      setIsCreateOpen(false);
      setNewTitle('');
      setNewContent('');
      if (!activeResumeId) {
        handleSetActive(resume.id);
      }
      toast({ title: "Resume saved", description: "Your resume has been saved successfully." });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save resume." });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteResume.mutateAsync({ resumeId: id });
      queryClient.invalidateQueries({ queryKey: getListResumesQueryKey({ userId: user!.id }) });
      if (activeResumeId === id) {
        localStorage.removeItem('activeResumeId');
        setActiveResumeId(null);
      }
      toast({ title: "Resume deleted" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete resume." });
    }
  };

  const handleSetActive = (id: string) => {
    localStorage.setItem('activeResumeId', id);
    setActiveResumeId(id);
    toast({ title: "Active resume updated", description: "This resume will be used as context in your chats." });
  };

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto p-8">
        <header className="mb-10 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Resumes</h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage your career history to provide better context to the AI.</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" /> Add Resume
          </Button>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-xl bg-card border animate-pulse" />)}
          </div>
        ) : resumes?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map(resume => {
              const isActive = activeResumeId === resume.id;
              return (
                <div key={resume.id} className={`group bg-card border rounded-xl p-5 flex flex-col transition-all duration-200 ${isActive ? 'border-primary ring-1 ring-primary/20 shadow-md' : 'hover:border-primary/40 hover:shadow-sm'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    {isActive ? (
                      <span className="inline-flex items-center text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                      </span>
                    ) : (
                      <Button variant="ghost" size="sm" className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleSetActive(resume.id)}>
                        Set Active
                      </Button>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-1">{resume.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Updated {formatDistanceToNow(new Date(resume.updated_at), { addSuffix: true })}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">
                    {resume.content}
                  </p>
                  <div className="flex justify-between items-center mt-auto pt-4 border-t">
                    <span className="text-xs text-muted-foreground font-mono">{resume.content.length} chars</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(resume.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-xl bg-card/30 max-w-2xl mx-auto">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-foreground mb-2">No resumes yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Add your resume text so Ascend can analyze it and provide tailored career advice.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Your First Resume
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add New Resume</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Resume Name</label>
              <Input 
                placeholder="e.g., Senior Full Stack 2024" 
                value={newTitle} 
                onChange={e => setNewTitle(e.target.value)} 
                className="font-medium"
              />
            </div>
            <div className="space-y-2 flex-1 flex flex-col">
              <label className="text-sm font-medium text-foreground flex items-center justify-between">
                <span>Resume Content</span>
                <span className="text-xs text-muted-foreground font-normal">Paste plain text</span>
              </label>
              <Textarea 
                placeholder="Paste your entire resume text here..." 
                value={newContent} 
                onChange={e => setNewContent(e.target.value)}
                className="flex-1 min-h-[300px] font-mono text-sm resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newTitle.trim() || !newContent.trim()}>Save Resume</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
