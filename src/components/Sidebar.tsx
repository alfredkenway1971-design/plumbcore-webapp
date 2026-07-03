'use client';

import { useState } from 'react';

const navItems = [
  {
    section: 'Main',
    items: [
      { label: 'Dashboard', icon: GridIcon, href: '/' },
      { label: 'Jobs', icon: WrenchIcon, href: '/jobs' },
      { label: 'Schedule', icon: CalendarIcon, href: '/schedule' },
    ],
  },
  {
    section: 'Operations',
    items: [
      { label: 'Estimates', icon: FileTextIcon, href: '/estimates' },
      { label: 'CRM', icon: UsersIcon, href: '/crm' },
      { label: 'Inventory', icon: BoxIcon, href: '/inventory' },
    ],
  },
  {
    section: 'AI Tools',
    items: [
      { label: 'AI Diagnostics', icon: BrainIcon, href: '/ai-diagnostics' },
      { label: 'Voice Notes', icon: MicIcon, href: '/voice-notes' },
    ],
  },
];

export default function Sidebar({ mobileOpen }: { mobileOpen: boolean }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/60 md:hidden" />}
      <aside
        className={`
          ${collapsed ? 'md:w-16' : 'md:w-64'}
          fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white-border bg-surface-light transition-all duration-300
          md:static md:z-auto
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white-border px-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-electric/20">
              <svg className="h-5 w-5 text-electric" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {!collapsed && <span className="text-sm font-bold tracking-tight text-white">PlumbCore</span>}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:block rounded-lg p-1.5 text-steel-light hover:bg-white-subtle hover:text-white transition-colors"
          >
            <svg className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navItems.map((group) => (
            <div key={group.section}>
              {!collapsed && <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-steel">{group.section}</p>}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <a key={item.label} href="#" className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} rounded-lg px-2 py-2 text-sm text-steel-light hover:bg-white-subtle hover:text-white transition-all`}>
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="shrink-0 border-t border-white-border p-3">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} rounded-lg px-2 py-2 hover:bg-white-subtle transition-colors cursor-pointer`}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-electric/10 text-xs font-semibold text-electric">AM</div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Amer Moreau</p>
                <p className="text-xs text-steel truncate">PlumbCore Admin</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

/* Icons */
function GridIcon({ className }: { className?: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>; }
function WrenchIcon({ className }: { className?: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.66 5.66a2 2 0 11-2.83-2.83l5.66-5.66M14.83 5.17l-2.83 2.83 5.66 5.66 2.83-2.83M18.36 2.14a2 2 0 112.83 2.83L14.83 11.4l-2.83-2.83 6.36-6.43z" /></svg>; }
function CalendarIcon({ className }: { className?: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>; }
function FileTextIcon({ className }: { className?: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>; }
function UsersIcon({ className }: { className?: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>; }
function BoxIcon({ className }: { className?: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>; }
function BrainIcon({ className }: { className?: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>; }
function MicIcon({ className }: { className?: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" strokeLinecap="round" strokeLinejoin="round" /><line x1="8" y1="23" x2="16" y2="23" strokeLinecap="round" strokeLinejoin="round" /></svg>; }