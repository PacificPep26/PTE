import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations, Language } from '../i18n/translations';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      language: 'vi',
      setLanguage: (language: Language) => set({ language }),
      toggleLanguage: () =>
        set((state) => ({ language: state.language === 'vi' ? 'en' : 'vi' })),
    }),
    {
      name: 'fly-edu-language',
    }
  )
);

/**
 * Hook providing access to current language and translation helper.
 * Usage:
 *   const { t, language, setLanguage, toggleLanguage } = useTranslation();
 *   <span>{t('nav.dashboard')}</span>
 */
export function useTranslation() {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const toggleLanguage = useLanguageStore((s) => s.toggleLanguage);

  const t = (path: string, fallback?: string): string => {
    const keys = path.split('.');
    let current: any = translations[language];

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return fallback ?? path;
      }
    }

    return typeof current === 'string' ? current : fallback ?? path;
  };

  return { t, language, setLanguage, toggleLanguage };
}
