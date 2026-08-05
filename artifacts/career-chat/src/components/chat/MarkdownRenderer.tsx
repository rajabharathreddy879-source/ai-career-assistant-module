import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlockRenderer } from './CodeBlockRenderer';
import { Badge } from '@/components/ui/badge';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Priority Tag parser / highlighter wrapper
  const renderPriorityBadges = (text: string) => {
    return text.replace(/\[(Low|Medium|High|Critical)\]/gi, (match, priority) => {
      const p = priority.toLowerCase();
      let colorClass = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      if (p === 'medium') colorClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      if (p === 'high') colorClass = 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      if (p === 'critical') colorClass = 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 font-semibold';
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${colorClass}">${priority}</span>`;
    });
  };

  return (
    <div className="prose dark:prose-invert max-w-none prose-sm sm:prose-base leading-relaxed break-words space-y-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <CodeBlockRenderer
                language={match[1]}
                value={String(children).replace(/\n$/, '')}
              />
            ) : (
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground font-semibold" {...props}>
                {children}
              </code>
            );
          },
          p({ children }) {
            return <p className="mb-2 last:mb-0 leading-normal">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-snug">{children}</li>;
          },
          h1({ children }) {
            return <h1 className="text-xl font-bold tracking-tight mt-4 mb-2 pb-1 border-b">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-lg font-bold tracking-tight mt-3 mb-1.5">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-base font-semibold mt-2.5 mb-1">{children}</h3>;
          },
          blockquote({ children }) {
            return <blockquote className="border-l-4 border-primary/50 pl-3 italic my-2 text-muted-foreground">{children}</blockquote>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
