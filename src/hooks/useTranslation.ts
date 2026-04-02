import { useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getTranslation, type SupportedLanguage } from '@/lib/i18n';

const SUPPORTED: SupportedLanguage[] = ['en', 'ru', 'ka', 'es', 'uk', 'pl', 'hi', 'am'];

function detectBrowserLang(): SupportedLanguage {
  if (typeof navigator === 'undefined') return 'en';
  const raw = navigator.language?.split('-')[0] ?? 'en';
  return SUPPORTED.includes(raw as SupportedLanguage) ? (raw as SupportedLanguage) : 'en';
}

export function useTranslation() {
  const user = useAuthStore((s) => s.user);
  const lang = (user?.language as SupportedLanguage) ?? detectBrowserLang();

  const t = useCallback(
    (key: string) => getTranslation(key, lang),
    [lang]
  );

  return { t, lang };
}
