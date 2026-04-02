import { ChevronDown } from 'lucide-react';

interface NewMessagesButtonProps {
  visible: boolean;
  onClick: () => void;
}

export function NewMessagesButton({ visible, onClick }: NewMessagesButtonProps) {
  if (!visible) return null;
  return (
    <button
      onClick={onClick}
      className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full shadow-lg hover:bg-primary/90 transition-colors"
    >
      New messages <ChevronDown className="w-3.5 h-3.5" />
    </button>
  );
}
