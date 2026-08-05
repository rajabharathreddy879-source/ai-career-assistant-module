import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, FileText, Briefcase, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { sendChatMessageSchema } from '@/lib/schemas';

interface ChatInputProps {
  onSend: (message: string, resumeText?: string, jobDescription?: string) => void;
  disabled?: boolean;
  activeResumeContext?: string;
}

export function ChatInput({ onSend, disabled, activeResumeContext }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [showContextPanel, setShowContextPanel] = useState(false);
  const [resumeText, setResumeText] = useState(activeResumeContext || '');
  const [jobDescription, setJobDescription] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (activeResumeContext) {
      setResumeText(activeResumeContext);
    }
  }, [activeResumeContext]);

  const handleSend = () => {
    if (disabled || !message.trim()) return;

    if (message.length > 4000) {
      setValidationError('Message cannot exceed 4000 characters.');
      return;
    }
    setValidationError(null);

    onSend(
      message.trim(),
      resumeText.trim() ? resumeText.trim() : undefined,
      jobDescription.trim() ? jobDescription.trim() : undefined
    );

    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasContextAttached = Boolean(resumeText.trim() || jobDescription.trim());

  return (
    <div className="border-t bg-card/80 backdrop-blur p-3 sm:p-4 space-y-3">
      {showContextPanel && (
        <div className="bg-muted/50 p-3 rounded-xl border border-border/60 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-primary" />
              Attach Active Context to AI Session
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setShowContextPanel(false)}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <FileText className="w-3 h-3 text-blue-500" /> Resume Content
              </label>
              <Textarea
                placeholder="Paste your raw resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="text-xs min-h-[90px] max-h-[160px] bg-background resize-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-purple-500" /> Target Job Description
              </label>
              <Textarea
                placeholder="Paste target job description & requirements here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="text-xs min-h-[90px] max-h-[160px] bg-background resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {!showContextPanel && hasContextAttached && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {resumeText.trim() && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-medium">
              <FileText className="w-3 h-3" /> Resume Attached
              <button onClick={() => setResumeText('')} className="ml-1 hover:text-red-500">×</button>
            </span>
          )}
          {jobDescription.trim() && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 font-medium">
              <Briefcase className="w-3 h-3" /> Job Spec Attached
              <button onClick={() => setJobDescription('')} className="ml-1 hover:text-red-500">×</button>
            </span>
          )}
        </div>
      )}

      {validationError && (
        <div className="text-xs text-red-500 px-1 font-medium">{validationError}</div>
      )}

      <div className="relative flex items-end gap-2 bg-background border border-border/80 rounded-xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground",
            hasContextAttached && "text-primary bg-primary/10"
          )}
          onClick={() => setShowContextPanel(!showContextPanel)}
          title="Add Resume or Job Description Context"
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (validationError) setValidationError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask Ascend AI anything about your resume, interview, or career path... (Shift+Enter for line break)"
          disabled={disabled}
          className="min-h-[44px] max-h-[160px] flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-2.5 text-sm resize-none bg-transparent"
        />

        <div className="flex items-center gap-1.5 pr-1">
          <span className="text-[10px] text-muted-foreground hidden sm:inline select-none">
            {message.length}/4000
          </span>
          <Button
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            size="icon"
            className="h-9 w-9 shrink-0 rounded-lg shadow-sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
