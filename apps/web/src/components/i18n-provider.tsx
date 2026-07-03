'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

type Locale = 'en' | 'fr' | 'es' | 'de';

interface Translations {
  [key: string]: any;
}

interface I18nContextType {
  locale: Locale;
  translations: Translations;
  t: (key: string) => string;
  changeLocale: (newLocale: Locale) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [locale, setLocale] = useState<Locale>('en');
  const [translations, setTranslations] = useState<Translations>({});

  // Detect locale from pathname
  useEffect(() => {
    const pathLocale = pathname.split('/')[1] as Locale;
    if (['en', 'fr', 'es', 'de'].includes(pathLocale)) {
      setLocale(pathLocale);
    }
  }, [pathname]);

  // Load translations
  useEffect(() => {
    async function loadTranslations() {
      try {
        const response = await fetch(`/api/translations?locale=${locale}`);
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error('Failed to load translations:', error);
      }
    }
    loadTranslations();
  }, [locale]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  return (
    <I18nContext.Provider value={{ locale, translations, t, changeLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}