import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LANGUAGES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Globe, Shield, Info } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [language, setLanguage] = useState('en');

  const handleLanguageChange = async (code: string) => {
    setLanguage(code);
    if (user) {
      await supabase.from('users').update({ language: code }).eq('id', user.id);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">App preferences</p>
      </div>

      {/* Language */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" />
          Language
        </h3>
        <div className="space-y-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm border w-full text-left transition-colors ${
                language === lang.code
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.native}</span>
              <span className="text-muted-foreground">({lang.name})</span>
            </button>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          About
        </h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>RouteLink v1.0</p>
          <p>A route-based communication network for truck drivers.</p>
          <p>Live presence • Route chat • Voice rooms</p>
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          Privacy & Safety
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          Your location is only shared when your visibility is set to "Visible".
          You can report abusive users or messages from within channels.
        </p>
      </div>
    </div>
  );
}
