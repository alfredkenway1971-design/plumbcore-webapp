'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { loadDataFromSupabase } from '@/lib/mock-data';
import { useAuthStore } from '@/lib/store';
import { useI18n } from '@/components/i18n-provider';

const locales = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'es', label: 'ES', flag: '🇪🇸' },
  { code: 'de', label: 'DE', flag: '🇩🇪' },
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const companyId = useAuthStore((s) => s.company?.id);
  const { locale, changeLocale, t } = useI18n();

  useEffect(() => {
    loadDataFromSupabase(companyId || 'comp-001');
  }, [companyId]);

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <Sidebar mobileOpen={mobileOpen} />
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        <header className="flex h-14 sm:h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-8">
          <div className="flex items-center space-x-3 min-w-0">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden rounded-lg p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></>
                )}
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{t('app.name')}</h1>
              <p className="text-[11px] sm:text-xs text-gray-500 hidden xs:block">{t('app.tagline')}</p>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {locales.find(l => l.code === locale)?.flag} {locale.toUpperCase()}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {langOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-[120px]">
                  {locales.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { changeLocale(l.code); setLangOpen(false); }}
                      className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-50 ${l.code === locale ? 'font-semibold text-blue-600' : 'text-gray-700'}`}
                    >
                      {l.flag} {l.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </header>
        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}