import { useState, useRef, useEffect } from 'react';
import { MessageBubble, ChatMessage } from './MessageBubble';
import { SuggestedQuestions } from './SuggestedQuestions';
import { TypingIndicator } from './TypingIndicator';
import { ChatInput } from './ChatInput';
import { Sparkles, Download, Menu, Plus, Trash2, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';

interface ChatWindowProps {
  sessionId: string | null;
  messages: ChatMessage[];
  sessionTitle?: string;
  isStreaming: boolean;
  onSendMessage: (message: string, resumeText?: string, jobDescription?: string) => void;
  onNewChat: () => void;
  onToggleSidebar?: () => void;
  onSaveReport?: (content: string, title: string) => void;
  activeResumeText?: string;
}

export function ChatWindow({
  sessionId,
  messages,
  sessionTitle,
  isStreaming,
  onSendMessage,
  onNewChat,
  onToggleSidebar,
  onSaveReport,
  activeResumeText,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleQuestionSelect = (promptText: string) => {
    onSendMessage(promptText, activeResumeText);
  };

  const handleExportChat = () => {
    if (messages.length === 0) return;

    const formattedText = messages
      .map((m) => `### ${m.role === 'user' ? 'User' : 'Ascend AI Assistant'} (${m.created_at || 'Just now'})\n\n${m.message}`)
      .join('\n\n---\n\n');

    const blob = new Blob([formattedText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(sessionTitle || 'career-consultation').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported successfully",
      description: "Chat history downloaded as Markdown.",
    });
  };

  const handleSaveLastAdvice = () => {
    const lastAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant');
    if (!lastAssistantMsg) {
      toast({ title: "No AI response found to save", variant: "destructive" });
      return;
    }

    if (onSaveReport) {
      onSaveReport(lastAssistantMsg.message, sessionTitle || "Saved AI Career Advice");
      toast({
        title: "Report Saved",
        description: "Saved advice to your Reports dashboard.",
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      {/* Top Bar Header */}
      <div className="h-14 border-b bg-card/60 backdrop-blur px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {onToggleSidebar && (
            <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden text-muted-foreground" onClick={onToggleSidebar}>
              <Menu className="w-4 h-4" />
            </Button>
          )}
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-foreground truncate flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              {sessionTitle || "New Career Consultation"}
            </h1>
            <p className="text-[11px] text-muted-foreground hidden sm:block">Powered by Gemini 2.5 Flash</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {messages.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 hidden sm:flex"
                onClick={handleSaveLastAdvice}
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-primary" />
                Save Advice
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={handleExportChat}
                title="Export as Markdown"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </>
          )}
          <Button size="sm" className="h-8 text-xs gap-1.5" onClick={onNewChat}>
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <SuggestedQuestions onSelect={handleQuestionSelect} />
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((msg, index) => (
              <MessageBubble key={msg.id || index} message={msg} />
            ))}
            {isStreaming && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Fixed Chat Input Area */}
      <div className="max-w-4xl w-full mx-auto">
        <ChatInput
          onSend={onSendMessage}
          disabled={isStreaming}
          activeResumeContext={activeResumeText}
        />
      </div>
    </div>
  );
}
