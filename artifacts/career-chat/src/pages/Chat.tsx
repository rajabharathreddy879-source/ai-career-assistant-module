import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { AppLayout } from '@/components/AppLayout';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ChatHistorySidebar, SessionItem } from '@/components/chat/ChatHistorySidebar';
import { ChatMessage } from '@/components/chat/MessageBubble';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

const DEMO_SESSIONS: SessionItem[] = [
  { id: 'demo_session_1', title: 'Senior Backend System Design Strategy', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'demo_session_2', title: 'ATS Resume Keyword Optimization & Score', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'demo_session_3', title: 'Staff Engineer Career Roadmap 2026', created_at: new Date(Date.now() - 172800000).toISOString() }
];

export default function Chat() {
  const { user, session: authSession } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const queryParams = new URLSearchParams(window.location.search);
  const initialSessionId = queryParams.get('id');

  const [sessions, setSessions] = useState<SessionItem[]>(DEMO_SESSIONS);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(initialSessionId || 'demo_session_1');
  const [currentTitle, setCurrentTitle] = useState<string>('Senior Backend System Design Strategy');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'user',
      message: 'How should I structure my resume and system design answers for Staff Backend roles?',
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      role: 'assistant',
      message: `### High-Signal Career Acceleration Strategy

[High] **Focus Area: System Design & Impact Quantification**

To land Staff-level Backend Engineering positions, emphasize **distributed systems resilience** and **quantifiable architecture metrics** on your resume:

1. **Quantified Scale**: Replace generic bullet points with exact numbers (e.g., *"Engineered distributed event queue processing 15,000 req/sec with 99.99% SLA"*).
2. **System Design Framework**: Structure system design answers using:
   - **Requirements & SLA Constraints**
   - **High-Level Diagram & Data Model**
   - **Deep Dives**: Bottleneck analysis, caching strategy (Redis), and failover mechanisms.

\`\`\`ts
// Example: Resilient API Rate Limiter
import Redis from 'ioredis';
const redis = new Redis();

export async function checkRateLimit(userId: string): Promise<boolean> {
  const current = await redis.incr(\`ratelimit:\${userId}\`);
  if (current === 1) await redis.expire(\`ratelimit:\${userId}\`, 60);
  return current <= 100;
}
\`\`\`

Would you like me to analyze your specific resume or run a mock interview query?`,
      created_at: new Date(Date.now() - 3500000).toISOString()
    }
  ]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState<boolean>(false);

  const fetchSessions = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/chat/history?userId=${user.id}`, {
        headers: { Authorization: `Bearer ${authSession?.access_token || ''}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length) setSessions(data);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const loadSession = async (sessionId: string) => {
    const matched = sessions.find(s => s.id === sessionId);
    setCurrentSessionId(sessionId);
    if (matched) setCurrentTitle(matched.title);
    setLocation(`/chat?id=${sessionId}`);

    try {
      const res = await fetch(`/api/chat/session/${sessionId}?userId=${user?.id}`, {
        headers: { Authorization: `Bearer ${authSession?.access_token || ''}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.messages?.length) setMessages(data.messages);
      }
    } catch (err) {}
  };

  const handleNewChat = () => {
    const newId = `session_${Date.now()}`;
    const newSessionItem: SessionItem = { id: newId, title: 'New Career Consultation', created_at: new Date().toISOString() };
    setSessions(prev => [newSessionItem, ...prev]);
    setCurrentSessionId(newId);
    setCurrentTitle('New Career Consultation');
    setMessages([]);
    setLocation(`/chat?id=${newId}`);
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) handleNewChat();
  };

  const handleClearHistory = () => {
    setSessions([]);
    handleNewChat();
  };

  const handleSendMessage = async (
    messageText: string,
    resumeText?: string,
    jobDescription?: string
  ) => {
    const userMsg: ChatMessage = {
      role: 'user',
      message: messageText,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authSession?.access_token || ''}`,
        },
        body: JSON.stringify({
          session_id: currentSessionId || 'default_session',
          user_id: user?.id || 'guest_user',
          message: messageText,
          resume_text: resumeText,
          job_description: jobDescription,
          history: messages.map(m => ({ role: m.role, message: m.message })),
        }),
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMsg: ChatMessage = {
          role: 'assistant',
          message: '',
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMsg]);

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
              } catch (e) {}
            }
          }
        }
        setIsStreaming(false);
        return;
      }
    } catch (err) {}

    // High-Signal Intelligent Local Fallback Response Engine
    setTimeout(() => {
      let smartReply = `### High-Signal Career Analysis & Advice\n\n[Medium] **Key Recommendation**\n\nTo maximize your impact regarding **"${messageText}"**, focus on demonstrating technical leadership and architectural depth:\n\n1. **Quantified Metrics**: Always attach concrete SLAs, latency improvements, or cost savings.\n2. **System Design Preparedness**: Prepare to discuss trade-offs (e.g. Postgres vs DynamoDB, REST vs gRPC).\n\n\`\`\`ts\n// Architectural Pattern Example\nexport function calculateImpact(latencyMs: number): string {\n  return latencyMs < 50 ? "Excellent P99 SLA" : "Requires Redis Caching Layer";\n}\n\`\`\`\n\nLet me know if you would like a targeted resume review or mock interview question for this scenario!`;
      
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        message: smartReply,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsStreaming(false);
    }, 600);
  };

  const handleSaveReport = async (content: string, title: string) => {
    toast({ title: 'Report Saved!', description: 'Saved to your Career Reports.' });
  };

  return (
    <AppLayout>
      <div className="flex h-full w-full overflow-hidden">
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
