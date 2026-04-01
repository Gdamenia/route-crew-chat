import { useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getTranslation, type SupportedLanguage } from '@/lib/i18n';

export function useTranslation() {
  const { user } = useAuthStore();
  const lang = (user?.language ?? 'en') as SupportedLanguage;

  const t = useCallback(
    (key: string) => getTranslation(key, lang),
    [lang]
  );

  return { t, lang };
}
