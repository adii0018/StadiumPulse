/**
 * @fileoverview LanguageContext — single source of truth for app language.
 * Fixes: language state desync between App and FanCompanion.
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { SupportedLanguage } from '../types';

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => undefined,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  // Initialise from localStorage so preference persists across refreshes
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const stored = localStorage.getItem('sp_language');
    return (stored === 'en' || stored === 'es' || stored === 'hi' ? stored : 'en') as SupportedLanguage;
  });

  const setLanguage = useCallback(
    (lang: SupportedLanguage) => {
      setLanguageState(lang);
      localStorage.setItem('sp_language', lang);
      void i18n.changeLanguage(lang);
    },
    [i18n],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
