import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyButton } from './CopyButton';

interface CodeBlockRendererProps {
  language: string;
  value: string;
}

export function CodeBlockRenderer({ language, value }: CodeBlockRendererProps) {
  return (
    <div className="relative group rounded-lg overflow-hidden my-3 border border-border/40 shadow-sm bg-[#282c34]">
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#21252b] border-b border-border/20 text-xs font-mono text-muted-foreground">
        <span className="capitalize">{language || 'code'}</span>
        <CopyButton content={value} className="h-6 w-6 text-gray-400 hover:text-white" />
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem',
          lineHeight: '1.5',
          background: 'transparent',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          },
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}
