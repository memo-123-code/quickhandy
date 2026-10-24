import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'ar';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

export function syncHtmlLanguage(lang: Language) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dir = lang === 'ar' ? 'rtl' : 'ltr';
  root.lang = lang;
  try {
    document.cookie = `app_lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  } catch (e) {}

  if (document.body) {
    if (lang === 'ar') {
      document.body.classList.add('font-cairo');
    } else {
      document.body.classList.remove('font-cairo');
    }
  }
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'ar',
      setLanguage: (lang) => {
        syncHtmlLanguage(lang);
        set({ language: lang });
      },
      toggleLanguage: () => {
        const next = get().language === 'en' ? 'ar' : 'en';
        syncHtmlLanguage(next);
        set({ language: next });
      },
    }),
    {
      name: 'language-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          syncHtmlLanguage(state.language);
        }
      },
    }
  )
);
