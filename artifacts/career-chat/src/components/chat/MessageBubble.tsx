import { User, Bot, Sparkles } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { CopyButton } from './CopyButton';
import { cn } from '@/lib/utils';

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  message: string;
  created_at?: string;
}

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn("flex gap-3 my-4 group transition-all", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm border",
        isUser 
          ? "bg-primary text-primary-foreground border-primary/20" 
          : "bg-card text-foreground border-border"
      )}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
      </div>

      <div className={cn("max-w-[85%] sm:max-w-[75%] space-y-1", isUser ? "items-end text-right" : "items-start")}>
        <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
          <span className="font-medium">{isUser ? "You" : "Ascend AI Assistant"}</span>
          {message.created_at && (
            <span>
              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        <div className={cn(
          "rounded-2xl px-4 py-3 border shadow-sm relative group/bubble",
          isUser 
            ? "bg-primary text-primary-foreground rounded-tr-sm border-primary/30" 
            : "bg-card text-card-foreground rounded-tl-sm border-border/60"
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{message.message}</p>
          ) : (
            <>
              <MarkdownRenderer content={message.message} />
              <div className="absolute top-2 right-2 opacity-0 group-hover/bubble:opacity-100 transition-opacity">
                <CopyButton content={message.message} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
