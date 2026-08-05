import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NewChatButtonProps {
  onClick: () => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export function NewChatButton({ onClick, className, variant = 'default' }: NewChatButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      className={cn("gap-2 w-full justify-start font-medium shadow-sm", className)}
    >
      <Plus className="w-4 h-4" />
      <span>New Career Session</span>
    </Button>
  );
}
