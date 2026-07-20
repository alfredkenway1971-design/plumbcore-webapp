'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n } from '@/components/i18n-provider';
import PlumbCoreLogo from '@/components/PlumbCoreLogo';
import { useAuthStore } from '@/lib/store';
import { canAccess } from '@/lib/feature-gates';
import type { PlanTier } from '@/lib/feature-gates';

/* ── Icons ── */
const Icons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  Grid: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
  Wrench: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.66 5.66a2 2 0 11-2.83-2.83l5.66-5.66M14.83 5.17l-2.83 2.83 5.66 5.66 2.83-2.83M18.36 2.14a2 2 0 112.83 2.83L14.83 11.4l-2.83-2.83 6.36-6.43z"/></svg>,
  Users: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.125-.952A4.125 4.125 0 0019.875 15h-1.5m-6 4.128A9.38 9.38 0 0112 19.5a9.38 9.38 0 01-2.625-.372A4.125 4.125 0 0113.125 15h2.25a4.125 4.125 0 014.125 4.125 9.337 9.337 0 01-4.125.952zM15 9a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  Calendar: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>,
  MapPin: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>,
  Star: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>,
  Chat: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/></svg>,
  Mic: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0014 0"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  Phone: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/></svg>,
  Headphones: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.25 14.25v4.5a2.25 2.25 0 01-2.25 2.25h-1.5a1.125 1.125 0 01-1.125-1.125v-5.25c0-.621.504-1.125 1.125-1.125h1.5a2.25 2.25 0 012.25 2.25zm-16.5 0v4.5a2.25 2.25 0 002.25 2.25h1.5a1.125 1.125 0 001.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-1.5A2.25 2.25 0 003.75 14.25zM3.75 12a8.25 8.25 0 1116.5 0"/></svg>,
  PhoneCall: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 3.75v4.5m0-4.5h-4.5m4.5 0l-6 6m3 12c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 014.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.055.902-.417 1.173l-1.293.97a1.062 1.062 0 00-.38 1.21 12.035 12.035 0 007.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 011.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 01-2.25 2.25h-2.25z"/></svg>,
  ChatBubble: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"/></svg>,
  PriceTag: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z"/></svg>,
  TrendingUp: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/></svg>,
  FileText: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>,
  Box: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-8.25-4.5-8.25 4.5m16.5 0l-8.25 4.5m8.25-4.5v9l-8.25 4.5m0-13.5v13.5m0-13.5L3.75 7.5m0 0v9l8.25 4.5"/></svg>,
  Truck: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/></svg>,
  Clipboard: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>,
  Chart: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>,
  Team: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/></svg>,
  Bell: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/></svg>,
  Shield: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>,
  Cog: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  ChevronLeft: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>,
  Logout: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/></svg>,
  Dollar: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  Mail: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>,
  Tag: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z"/></svg>,
  Flag: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5"/></svg>,
  Key: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"/></svg>,
  User: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>,
};

/* ── Admin nav config ── */
const adminNav = [
  { sectionKey: 'overview', items: [
    { labelKey: 'platformOverview', label: 'Platform Overview', icon: 'Grid', href: '/admin' },
  ]},
  { sectionKey: 'companies', items: [
    { labelKey: 'allCompanies', label: 'All Companies', icon: 'Users', href: '/admin/customers' },
    { labelKey: 'plumbers', label: 'Plumber Profiles', icon: 'Team', href: '/admin/plumbers' },
  ]},
  { sectionKey: 'leads', items: [
    { labelKey: 'leadsMarketplace', label: 'Leads Marketplace', icon: 'Star', href: '/admin/leads' },
  ]},
  { sectionKey: 'revenue', items: [
    { labelKey: 'mrrReport', label: 'MRR Report', icon: 'TrendingUp', href: '/admin/revenue' },
    { labelKey: 'invoices', label: 'Invoices', icon: 'FileText', href: '/admin/invoices' },
    { labelKey: 'payouts', label: 'Payouts', icon: 'Dollar', href: '/admin/payouts' },
    { labelKey: 'pricingPlans', label: 'Pricing Plans', icon: 'PriceTag', href: '/admin/pricing' },
  ]},
  { sectionKey: 'usage', items: [
    { labelKey: 'analytics', label: 'Analytics', icon: 'Chart', href: '/admin/usage' },
  ]},
  { sectionKey: 'support', items: [
    { labelKey: 'supportCenter', label: 'Support Center', icon: 'Headphones', href: '/admin/support' },
  ]},
  { sectionKey: 'marketing', items: [
    { labelKey: 'marketing', label: 'Marketing', icon: 'Mail', href: '/admin/campaigns' },
  ]},
  { sectionKey: 'system', items: [
    { labelKey: 'featureFlags', label: 'Feature Flags', icon: 'Flag', href: '/admin/feature-flags' },
    { labelKey: 'adminUsers', label: 'Admin Users', icon: 'Key', href: '/admin/users' },
    { labelKey: 'auditLog', label: 'Audit Log', icon: 'Shield', href: '/admin/audit' },
    { labelKey: 'systemSettings', label: 'System Settings', icon: 'Cog', href: '/admin/settings' },
  ]},
  { sectionKey: 'profile', items: [
    { labelKey: 'myProfile', label: 'My Profile', icon: 'User', href: '/settings' },
  ]},
];

/* ── Plumber nav config ── */
const plumberNav = [
  { sectionKey: 'main', items: [
    { labelKey: 'dashboard', label: 'Dashboard', icon: 'Grid', href: '/dashboard', feature: undefined },
    { labelKey: 'jobs', label: 'Jobs', icon: 'Wrench', href: '/jobs' },
    { labelKey: 'clients', label: 'Clients', icon: 'Users', href: '/clients' },
    { labelKey: 'schedule', label: 'Schedule', icon: 'Calendar', href: '/schedule' },
    { labelKey: 'routeMap', label: 'Route Map', icon: 'MapPin', href: '/route-map', feature: 'routeOptimization' },
    { labelKey: 'liveTracking', label: 'Live Tracking', icon: 'Truck', href: '/live-tracking', feature: 'truckGps' },
    { labelKey: 'leads', label: 'Leads', icon: 'Star', href: '/leads', badge: { count: 12, color: 'bg-blue-tint0' } },
  ]},
  { sectionKey: 'aiTools', items: [
    { labelKey: 'aiChat', label: 'AI Chat', icon: 'Chat', href: '/ai-chat' },
    { labelKey: 'voiceNotes', label: 'Voice Notes', icon: 'Mic', href: '/ai-voice-notes' },
    { labelKey: 'emergency', label: 'Emergency Triage', icon: 'Phone', href: '/emergency-triage', badge: { count: '!', color: 'bg-red-500' } },
    { labelKey: 'receptionist', label: 'AI Receptionist', icon: 'Headphones', href: '/voice-receptionist' },
    { labelKey: 'phoneCalls', label: 'Phone Calls', icon: 'PhoneCall', href: '/phone-calls' },
    { labelKey: 'sms', label: 'SMS', icon: 'ChatBubble', href: '/sms' },
  ]},
  { sectionKey: 'finance', items: [
    { labelKey: 'pricebook', label: 'Pricebook', icon: 'PriceTag', href: '/pricebook' },
    { labelKey: 'priceIncreases', label: 'Price Increases', icon: 'TrendingUp', href: '/price-increases' },
    { labelKey: 'invoicing', label: 'Invoicing', icon: 'FileText', href: '/invoicing' },
    { labelKey: 'inventory', label: 'Inventory', icon: 'Box', href: '/inventory', feature: 'inventoryTracking' },
    { labelKey: 'suppliers', label: 'Suppliers', icon: 'Truck', href: '/inventory/suppliers', feature: 'inventoryTracking' },
    { labelKey: 'purchaseOrders', label: 'Purchase Orders', icon: 'Clipboard', href: '/purchase-orders', feature: 'inventoryTracking' },
    { labelKey: 'insights', label: 'Insights', icon: 'Chart', href: '/inventory/insights' },
  ]},
  { sectionKey: 'growth', items: [
    { labelKey: 'maintenance', label: 'Maintenance Plans', icon: 'Clipboard', href: '/maintenance-plans', feature: 'maintenancePlans' },
    { labelKey: 'reviews', label: 'Reviews', icon: 'Star', href: '/reviews', feature: 'reviewAutomation' },
    { labelKey: 'financing', label: 'Financing', icon: 'PriceTag', href: '/financing', feature: 'customerFinancing' },
    { labelKey: 'predictiveMaint', label: 'Predictive Maint.', icon: 'Chart', href: '/predictive-maintenance', feature: 'predictiveMaintenance' },
  ]},
  { sectionKey: 'account', items: [
    { labelKey: 'profile', label: 'Profile', icon: 'User', href: '/plumber/profile' },
    { labelKey: 'earnings', label: 'Earnings', icon: 'Dollar', href: '/plumber/earnings' },
  ]},
  { sectionKey: 'admin', items: [
    { labelKey: 'team', label: 'Team', icon: 'Team', href: '/team' },
    { labelKey: 'notifications', label: 'Notifications', icon: 'Bell', href: '/notifications' },
    { labelKey: 'featureRequests', label: 'Feature Requests', icon: 'ChatBubble', href: '/feature-requests' },
    { labelKey: 'auditLog', label: 'Audit Log', icon: 'Shield', href: '/audit-log' },
    { labelKey: 'settings', label: 'Settings', icon: 'Cog', href: '/settings' },
  ]},
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  const profile = useAuthStore((s) => s.profile);
  const userRole = profile?.role;
  const avatarUrl = profile?.avatar_url;
  const isAdmin = userRole === 'super_admin' || userRole === 'admin';

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    await useAuthStore.getState().logout();
    router.push('/login');
  };

  const company = useAuthStore((s) => s.company);
  const tier = (company?.subscription_tier || '') as PlanTier;
  const navSource = isAdmin ? adminNav : plumberNav;

  const visibleNav = navSource
    .map((section) => ({
      ...section,
      items: section.items.filter((item: any) => {
        if (!item.feature) return true;
        return canAccess(tier, item.feature);
      }),
    }))
    .filter((section) => section.items.length > 0);

  const sectionLabels: Record<string, string> = {
    overview: 'Overview', companies: 'Companies', leads: 'Leads', revenue: 'Revenue',
    usage: 'Usage Analytics', support: 'Support', marketing: 'Marketing',
    system: 'System', profile: 'Profile',
    main: 'Main', aiTools: 'AI Tools', finance: 'Finance', growth: 'Growth', account: 'Account', admin: 'Admin',
  };
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const initials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'AM';

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" onClick={onClose} />}

      <aside
        className={`
          ${collapsed ? 'md:w-[72px]' : 'md:w-[260px]'}
          fixed inset-y-0 left-0 z-50 flex flex-col
          bg-white ring-1 ring-black/5
          transition-all duration-200
          md:static md:z-auto
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          w-[280px] max-w-[85vw]
        `}
      >
        {/* Logo + Collapse toggle */}
        <div className="flex h-14 md:h-16 shrink-0 items-center justify-between px-4 ring-1 ring-border">
          <PlumbCoreLogo size="sm" showText={!collapsed} />
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground/80 hover:bg-muted hover:text-foreground transition-all shrink-0"
          >
            <Icons.ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
          {/* Mobile close */}
          <button onClick={onClose} className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground/80 hover:bg-white/10 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
          {visibleNav.map((section) => (
            <div key={section.sectionKey}>
              {!collapsed && (
                <p className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">
                  {sectionLabels[section.sectionKey] || section.sectionKey}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item: any) => {
                  const active = isActive(item.href);
                  const IconComponent = Icons[item.icon as keyof typeof Icons];
                  return (
                    <a
                      key={item.labelKey}
                      href={item.href}
                      className={`
                        flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all duration-150
                        ${active
                          ? 'bg-blue-tint text-primary ring-1 ring-blue-200'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }
                        ${collapsed ? 'justify-center px-0' : ''}
                      `}
                      title={collapsed ? item.label : undefined}
                    >
                      {IconComponent && (
                        <IconComponent className={`w-5 h-5 shrink-0 transition-colors duration-150 ${active ? 'text-primary' : 'text-muted-foreground/80'}`} />
                      )}
                      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                      {!collapsed && item.badge && (
                        <span className={`shrink-0 min-w-[20px] h-5 rounded-full ${item.badge.color} text-white text-[10px] font-bold flex items-center justify-center px-1.5`}>
                          {item.badge.count}
                        </span>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Profile */}
        <div className="shrink-0 ring-1 ring-border p-3" ref={profileRef}>
          <div
            className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 hover:bg-muted transition-colors cursor-pointer group relative"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-white/10" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-lg shadow-blue-500/25">
                {initials}
              </div>
            )}
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{profile?.full_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground/80 truncate">{isAdmin ? 'Admin' : userRole || 'PlumbCore'}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/80 hover:text-red-500"
                  title="Logout"
                >
                  <Icons.Logout className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          {profileOpen && (
            <div className="mt-1 mx-1 rounded-xl ring-1 ring-border bg-white shadow-xl overflow-hidden">
              <button onClick={() => { setProfileOpen(false); router.push('/settings'); }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-muted-foreground hover:bg-muted transition-colors">
                <Icons.Cog className="w-4 h-4 text-muted-foreground" /> Settings
              </button>
              <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors ring-1 ring-inset ring-border">
                <Icons.Logout className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
