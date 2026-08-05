import { useState } from 'react';
import { MessageSquare, Trash2, Plus, Clock, Search, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { NewChatButton } from './NewChatButton';

export interface SessionItem {
  id: string;
  title: string;
  created_at: string;
  message_count?: number;
}

interface ChatHistorySidebarProps {
  sessions: SessionItem[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onClearHistory: () => void;
  loading?: boolean;
  className?: string;
}

export function ChatHistorySidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearHistory,
  loading,
  className,
}: ChatHistorySidebarProps) {
  const [search, setSearch] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={cn("w-72 border-r bg-card/50 backdrop-blur flex flex-col h-full", className)}>
      <div className="p-4 border-b space-y-3">
        <NewChatButton onClick={onNewChat} />
        
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs h-8 bg-background/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading ? (
          <div className="p-4 text-center text-xs text-muted-foreground">Loading history...</div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground space-y-1">
            <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground/40" />
            <p>No chat history yet.</p>
            <p className="text-[11px] text-muted-foreground/70">Start a new session to begin.</p>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isActive = session.id === currentSessionId;
            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={cn(
                  "group flex items-center justify-between p-2.5 rounded-lg text-xs font-medium cursor-pointer transition-all",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20 font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <MessageSquare className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                  <span className="truncate">{session.title || "Untitled Chat"}</span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-opacity shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  title="Delete conversation"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            );
          })
        )}
      </div>

      {sessions.length > 0 && (
        <div className="p-3 border-t">
          {confirmClear ? (
            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg space-y-2 text-center">
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">Clear all history?</p>
              <div className="flex gap-1.5 justify-center">
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onClick={() => {
                    onClearHistory();
                    setConfirmClear(false);
                  }}
                >
                  Yes, Clear
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onClick={() => setConfirmClear(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
              onClick={() => setConfirmClear(true)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              Clear All History
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
