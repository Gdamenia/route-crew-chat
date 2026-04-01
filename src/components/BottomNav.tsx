import { useNavigate } from 'react-router-dom';
import { Map, MessageSquare, User } from 'lucide-react';

const tabs = [
  { key: 'map', label: 'Map', path: '/', icon: Map },
  { key: 'channels', label: 'Channels', path: '/channels', icon: MessageSquare },
  { key: 'profile', label: 'Profile', path: '/profile', icon: User },
];

export function BottomNav({ active }: { active: string }) {
  const navigate = useNavigate();

  return (
    <div className="flex-shrink-0 flex bg-card border-t border-border">
      {tabs.map((tab) => (
        <button key={tab.key} onClick={() => navigate(tab.path)}
          className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${
            active === tab.key ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}>
          <tab.icon className="w-5 h-5" />
          <span className="text-xs font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
