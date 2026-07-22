'use client';

import { useState } from 'react';

const locales = [
  { code: 'en', label: 'English', flag: '🇬🇧', short: 'EN' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', short: 'FR' },
  { code: 'es', label: 'Español', flag: '🇪🇸', short: 'ES' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', short: 'DE' },
] as const;

export default function LanguageSwitcher({ locale, onLocaleChange }: { locale: string; onLocaleChange: (l: string) => void }) {
  const [open, setOpen] = useState(false);

  const current = locales.find(l => l.code === locale) || locales[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all active:scale-95 border border-gray-200"
        aria-label="Change language"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden sm:inline text-[11px] font-semibold uppercase tracking-wider">{current.short}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1.5 bg-white border border-border rounded-xl shadow-lg z-50 py-1 min-w-[140px] overflow-hidden">
            {locales.map((l) => (
              <button
                key={l.code}
                onClick={() => { onLocaleChange(l.code); setOpen(false); }}
                className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-left transition-colors ${
                  l.code === locale
                    ? 'bg-blue-tint text-primary/90 font-semibold'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <span className="text-base">{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
