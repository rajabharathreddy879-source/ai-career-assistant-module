import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { AppLayout } from '@/components/AppLayout';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ChatHistorySidebar, SessionItem } from '@/components/chat/ChatHistorySidebar';
import { ChatMessage } from '@/components/chat/MessageBubble';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

export default function Chat() {
  const { user, session: authSession } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  // Parse session id from URL if present
  const queryParams = new URLSearchParams(window.location.search);
  const initialSessionId = queryParams.get('id');

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(initialSessionId);
  const [currentTitle, setCurrentTitle] = useState<string>('New Career Consultation');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState<boolean>(false);

  // Fetch session history list
  const fetchSessions = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/chat/history?userId=${user.id}`, {
        headers: {
          Authorization: `Bearer ${authSession?.access_token || ''}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  // Load specific session messages
  const loadSession = async (sessionId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/chat/session/${sessionId}?userId=${user.id}`, {
        headers: {
          Authorization: `Bearer ${authSession?.access_token || ''}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentSessionId(data.id);
        setCurrentTitle(data.title);
        setMessages(data.messages || []);
        setLocation(`/chat?id=${data.id}`);
      }
    } catch (err) {
      console.error('Failed to load session:', err);
      toast({ title: 'Failed to load session', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (initialSessionId) {
      loadSession(initialSessionId);
    }
  }, [initialSessionId]);

  // Create new session helper
  const createNewSession = async (title: string = 'New Career Consultation'): Promise<string | null> => {
    if (!user) return null;
    try {
      const res = await fetch('/api/chat/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authSession?.access_token || ''}`,
        },
        body: JSON.stringify({ user_id: user.id, title }),
      });
      if (res.ok) {
        const newSession = await res.json();
        setCurrentSessionId(newSession.id);
        setCurrentTitle(newSession.title);
        setMessages([]);
        setLocation(`/chat?id=${newSession.id}`);
        fetchSessions();
        return newSession.id;
      }
    } catch (err) {
      console.error('Failed to create session:', err);
    }
    return null;
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setCurrentTitle('New Career Consultation');
    setMessages([]);
    setLocation('/chat');
  };

  const handleDeleteSession = async (id: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/chat/session/${id}?userId=${user.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authSession?.access_token || ''}`,
        },
      });
      if (res.ok) {
        toast({ title: 'Session deleted' });
        if (currentSessionId === id) {
          handleNewChat();
        }
        fetchSessions();
      }
    } catch (err) {
      toast({ title: 'Failed to delete session', variant: 'destructive' });
    }
  };

  const handleClearHistory = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/chat/history?userId=${user.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authSession?.access_token || ''}`,
        },
      });
      if (res.ok) {
        toast({ title: 'All history cleared' });
        handleNewChat();
        setSessions([]);
      }
    } catch (err) {
      toast({ title: 'Failed to clear history', variant: 'destructive' });
    }
  };

  // Real-time SSE streaming handler
  const handleSendMessage = async (
    messageText: string,
    resumeText?: string,
    jobDescription?: string
  ) => {
    if (!user) return;

    let targetSessionId = currentSessionId;
    if (!targetSessionId) {
      targetSessionId = await createNewSession(
        messageText.length > 30 ? messageText.substring(0, 30) + '...' : messageText
      );
      if (!targetSessionId) {
        toast({ title: 'Failed to initialize session', variant: 'destructive' });
        return;
      }
    }

    const userMsg: ChatMessage = {
      role: 'user',
      message: messageText,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    const historyForGemini = messages.map((m) => ({
      role: m.role,
      message: m.message,
    }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authSession?.access_token || ''}`,
        },
        body: JSON.stringify({
          session_id: targetSessionId,
          user_id: user.id,
          message: messageText,
          resume_text: resumeText,
          job_description: jobDescription,
          history: historyForGemini,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Failed to stream response');
      }

      // Read SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMsg: ChatMessage = {
        role: 'assistant',
        message: '',
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  assistantMsg.message += data.content;
                  setMessages((prev) => {
                    const next = [...prev];
                    next[next.length - 1] = { ...assistantMsg };
                    return next;
                  });
                }
              } catch (e) {
                // Ignore parse errors for raw lines
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Streaming error:', err);
      toast({
        title: 'AI Generation Failed',
        description: err?.message || 'Connection lost during streaming.',
        variant: 'destructive',
      });
    } finally {
      setIsStreaming(false);
      fetchSessions();
    }
  };

  const handleSaveReport = async (content: string, title: string) => {
    if (!user) return;
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authSession?.access_token || ''}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          title: `Advice: ${title}`,
          content,
          report_type: 'roadmap',
          priority: 'High',
        }),
      });
    } catch (err) {
      console.error('Failed to save report:', err);
    }
  };

  return (
    <AppLayout>
      <div className="flex h-full w-full overflow-hidden">
        {/* Desktop History Sidebar */}
        <ChatHistorySidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={loadSession}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
          onClearHistory={handleClearHistory}
          loading={loadingHistory}
          className="hidden md:flex"
        />

        {/* Mobile History Sidebar Overlay */}
        {sidebarOpenMobile && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur md:hidden flex">
            <ChatHistorySidebar
              sessions={sessions}
              currentSessionId={currentSessionId}
              onSelectSession={(id) => {
                loadSession(id);
                setSidebarOpenMobile(false);
              }}
              onNewChat={() => {
                handleNewChat();
                setSidebarOpenMobile(false);
              }}
              onDeleteSession={handleDeleteSession}
              onClearHistory={handleClearHistory}
              loading={loadingHistory}
              className="w-80 shadow-2xl"
            />
            <div className="flex-1" onClick={() => setSidebarOpenMobile(false)} />
          </div>
        )}

        {/* Main Chat Window */}
        <ChatWindow
          sessionId={currentSessionId}
          messages={messages}
          sessionTitle={currentTitle}
          isStreaming={isStreaming}
          onSendMessage={handleSendMessage}
          onNewChat={handleNewChat}
          onToggleSidebar={() => setSidebarOpenMobile(true)}
          onSaveReport={handleSaveReport}
        />
      </div>
    </AppLayout>
  );
}
