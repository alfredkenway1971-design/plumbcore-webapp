'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { loadDataFromSupabase } from '@/lib/mock-data';
import { useAuthStore } from '@/lib/store';

/* ── Icons ── */
function SearchIcon(p: any) { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>; }
function BellIcon(p: any) { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/></svg>; }
function HamburgerIcon(p: any) { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>; }
function ChevronDownIcon(p: any) { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>; }
function PlusIcon(p: any) { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>; }
function DownloadIcon(p: any) { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>; }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const companyId = useAuthStore((s) => s.company?.id);

  useEffect(() => {
    loadDataFromSupabase(companyId || 'comp-001');
  }, [companyId]);

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ═══ Top Header ═══ */}
        <header className="h-16 shrink-0 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-6 gap-4">
          {/* Left: Hamburger + Page Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors -ml-1"
            >
              <HamburgerIcon className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400 min-w-0">
              <span className="text-slate-900 font-semibold">Dashboard</span>
              <span className="text-slate-300">/</span>
              <span className="truncate">Overview</span>
            </div>
          </div>

          {/* Center: Search */}
          <div className="hidden md:flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full h-9 pl-10 pr-12 bg-slate-100 rounded-full text-sm text-slate-600 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-medium text-slate-400">
                ⌘K
              </div>
            </div>
          </div>

          {/* Right: Actions + Avatar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Date Range */}
            <button className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              <span className="text-xs">📅</span>
              <span className="text-xs font-medium">Jan 1 - Feb 1, 2025</span>
              <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Add Widget */}
            <button className="hidden lg:flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              <PlusIcon className="w-4 h-4" />
              <span className="text-xs font-medium">Add widget</span>
            </button>

            {/* Export */}
            <button className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm">
              <DownloadIcon className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Export</span>
            </button>

            {/* Notification Bell */}
            <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
              <BellIcon className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm">
              AM
            </div>
          </div>
        </header>

        {/* ═══ Page Content ═══ */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile spacer */}
      <div className="md:hidden h-20" />
    </div>
  );
}
