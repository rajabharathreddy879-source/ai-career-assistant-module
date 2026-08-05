import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-3 items-start my-3 animate-fade-in">
      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-primary animate-pulse" />
      </div>
      <div className="bg-card border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center space-x-1.5">
        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"></span>
      </div>
    </div>
  );
}
