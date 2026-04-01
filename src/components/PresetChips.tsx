import { useTranslation } from '@/hooks/useTranslation';

const PRESET_KEYS = [
  'preset.traffic',
  'preset.cop',
  'preset.roadClosed',
  'preset.fuel',
  'preset.parking',
  'preset.ice',
  'preset.accident',
  'preset.restStop',
] as const;

interface PresetChipsProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function PresetChips({ onSend, disabled }: PresetChipsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-1 py-1">
      {PRESET_KEYS.map((key) => (
        <button
          key={key}
          onClick={() => onSend(t(key))}
          disabled={disabled}
          className="flex-shrink-0 min-h-[44px] px-3 py-2 bg-secondary border border-border rounded-xl text-foreground text-xs font-medium hover:bg-accent hover:border-primary/50 transition-colors disabled:opacity-40 whitespace-nowrap"
        >
          {t(key)}
        </button>
      ))}
    </div>
  );
}
