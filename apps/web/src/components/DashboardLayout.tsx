'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <Sidebar mobileOpen={mobileOpen} />
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        {/* Top Bar */}
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
              <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">PlumbCore</h1>
              <p className="text-[11px] sm:text-xs text-gray-500 hidden xs:block">Plumbing operations platform</p>
            </div>
          </div>
        </header>
        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}