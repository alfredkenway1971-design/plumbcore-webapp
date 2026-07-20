'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Button, Card, Input, TextArea, Modal, EmptyState, ErrorState } from '@/pkg/ui-components';
import { clients } from '@/lib/mock-data';
import type { Client } from '@/lib/mock-data';

/* ── Tag colors ── */
const TAG_COLORS = [
  'bg-blue-tint text-primary/90 border-primary/20',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-teal-100 text-teal-700 border-teal-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-pink-100 text-pink-700 border-pink-200',
];

/* ── Format helpers ── */
function capitalizeName(val: string): string {
  return val.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function formatPhone(val: string, country: string = 'US'): string {
  const d = val.replace(/\D/g, '');
  if (country === 'US' || country === 'CA') {
    if (d.length === 0) return '';
    if (d.length <= 3) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }
  return d;
}

function cleanPhone(val: string): string { return val.replace(/\D/g, ''); }

/* ── Country codes ── */
const COUNTRIES = [
  { code: 'US', flag: '🇺🇸', name: 'United States' },
  { code: 'CA', flag: '🇨🇦', name: 'Canada' },
  { code: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'AU', flag: '🇦🇺', name: 'Australia' },
  { code: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: 'FR', flag: '🇫🇷', name: 'France' },
];

/* ── Types ── */
interface ClientProperty { address: string; type: 'residential' | 'commercial'; }
type SortField = 'name' | 'totalJobs' | 'totalRevenue' | 'createdAt' | 'city';
type SortDir = 'asc' | 'desc';
type FormErrors = Partial<Record<string, string>>;

/* ═══════════════════════════════════════════
   ADDRESS AUTOCOMPLETE
   ═══════════════════════════════════════════ */
function AddressAutocomplete({ value, onChange, onSelect, error }: {
  value: string; onChange: (v: string) => void;
  onSelect: (addr: string, city: string, state: string, zip: string) => void;
  error?: string;
}) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined as any);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = useCallback((q: string) => {
    clearTimeout(debounceRef.current);
    if (q.length < 5) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=us,ca&limit=5&addressdetails=1`,
          { headers: { 'User-Agent': 'PlumbCoreAI/1.0' } }
        );
        const data = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
      } catch { setSuggestions([]); }
    }, 350);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
        </svg>
        <input
          type="text"
          placeholder="Service address*"
          autoComplete="off"
          value={value}
          onChange={e => { onChange(e.target.value); search(e.target.value); }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          className={`w-full h-11 pl-10 pr-4 bg-white border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/80 outline-none transition-all ${
            error ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20'
          }`}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-border rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-blue-tint hover:text-primary/80 transition-colors border-b border-border/50 last:border-0"
              onClick={() => {
                const addr = s.address?.road || s.display_name.split(',')[0];
                const city = s.address?.city || s.address?.town || s.address?.village || '';
                const state = s.address?.state || '';
                const zip = s.address?.postcode || '';
                onChange(s.display_name);
                onSelect(addr, city, state, zip);
                setOpen(false);
              }}
            >
              <p className="font-medium">{s.display_name}</p>
              {s.address?.city && <p className="text-xs text-muted-foreground/80 mt-0.5">{s.address.city}, {s.address.state} {s.address.postcode}</p>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SKELETON
   ═══════════════════════════════════════════ */
function SkeletonRow() {
  return <tr className="border-b border-border/50">{Array.from({ length: 9 }).map((_, i) => <td key={i} className="py-3.5 px-4"><div className="animate-pulse h-4 rounded bg-muted w-3/4" /></td>)}</tr>;
}

/* ═══════════════════════════════════════════
   CLIENT TYPE HELPERS
   ═══════════════════════════════════════════ */
function getClientType(name: string, company?: string): 'residential' | 'commercial' {
  const kw = ['apt','apartments','diner','retirement','church','office','brewery','llc','inc','properties','hospitality','living','senior'];
  const lower = name.toLowerCase(), comp = (company ?? '').toLowerCase();
  return kw.some(k => lower.includes(k) || comp.includes(k)) ? 'commercial' : 'residential';
}
const typeColors: Record<string, string> = { residential: 'bg-blue-tint text-primary', commercial: 'bg-amber-50 text-amber-600' };

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
const sortIcon = (field: SortField, sf: SortField, sd: SortDir) => {
  if (sf !== field) return <span className="text-slate-300">↕</span>;
  return <span className="text-primary">{sd === 'asc' ? '↑' : '↓'}</span>;
};

function EditIcon(p: any) { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>; }
function TrashIcon(p: any) { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>; }
function SearchIcon(p: any) { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>; }
function PlusIcon(p: any) { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>; }

export default function ClientsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(0);
  const pageSize = 8;

  /* ── Modal state ── */
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* ── Form ── */
  const [fName, setFName] = useState('');
  const [fLName, setFLName] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fPhoneDisp, setFPhoneDisp] = useState('');
  const [fCountry, setFCountry] = useState('US');
  const [fCompany, setFCompany] = useState('');
  const [fAddr, setFAddr] = useState('');
  const [fCity, setFCity] = useState('');
  const [fState, setFState] = useState('');
  const [fZip, setFZip] = useState('');
  const [fTagsInput, setFTagsInput] = useState('');
  const [fTags, setFTags] = useState<string[]>([]);
  const [fNotes, setFNotes] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /* ── Clients list ── */
  const [list, setList] = useState<Client[]>([]);
  const [clientTags, setClientTags] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const t = setTimeout(() => { try { setList([...clients]); setLoading(false); } catch { setError('Failed to load clients'); setLoading(false); } }, 400);
    return () => clearTimeout(t);
  }, []);

  const resetForm = () => {
    setFName(''); setFLName(''); setFEmail(''); setFPhone(''); setFPhoneDisp(''); setFCountry('US');
    setFCompany(''); setFAddr(''); setFCity(''); setFState(''); setFZip(''); setFTagsInput(''); setFTags([]); setFNotes('');
    setTouched({}); setEditingId(null); setShakeKey(0);
  };

  const openEdit = (c: Client) => {
    const parts = c.name.split(' ');
    setFName(parts[0] || ''); setFLName(parts.slice(1).join(' ') || '');
    setFEmail(c.email); setFPhone(c.phone); setFPhoneDisp(formatPhone(c.phone));
    setFCompany(c.company ?? ''); setFAddr(c.address); setFCity(c.city); setFState(c.state); setFZip(c.zip);
    setFNotes(c.notes ?? ''); setFTags(clientTags[c.id] ?? []); setFTagsInput((clientTags[c.id] ?? []).join(', '));
    setEditingId(c.id); setTouched({}); setShowModal(true);
  };

  /* ── Validation ── */
  const errors: FormErrors = {};
  if (touched.fName && !fName.trim()) errors.fName = 'Required';
  if (touched.fEmail && !fEmail.trim()) errors.fEmail = 'Required';
  else if (touched.fEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fEmail)) errors.fEmail = 'Invalid email';
  if (touched.fAddr && !fAddr.trim()) errors.fAddr = 'Required';
  if (touched.fCity && !fCity.trim()) errors.fCity = 'Required';
  if (touched.fState && !fState.trim()) errors.fState = 'Required';
  if (touched.fZip && !fZip.trim()) errors.fZip = 'Required';
  const formValid = fName.trim() && fEmail.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fEmail) && fAddr.trim() && fCity.trim() && fState.trim() && fZip.trim();

  const handleSave = () => {
    setTouched({ fName: true, fLName: true, fEmail: true, fAddr: true, fCity: true, fState: true, fZip: true });
    if (!formValid) { setShakeKey(k => k + 1); return; }
    setSaving(true);
    setTimeout(() => {
      const fullName = capitalizeName(`${fName.trim()} ${fLName.trim()}`.trim());
      const phone = fPhone || cleanPhone(fPhoneDisp);
      if (editingId) {
        setList(prev => prev.map(c => c.id === editingId ? { ...c, name: fullName, email: fEmail.trim(), phone, address: fAddr.trim(), city: fCity.trim(), state: fState.trim(), zip: fZip.trim(), company: fCompany.trim() || undefined, notes: fNotes.trim() || undefined } : c));
        setClientTags(p => ({ ...p, [editingId]: fTags }));
      } else {
        const nid = `CLT-${String(list.length + 1).padStart(3, '0')}`;
        const nc: Client = { id: nid, name: fullName, email: fEmail.trim(), phone, address: fAddr.trim(), city: fCity.trim(), state: fState.trim(), zip: fZip.trim(), company: fCompany.trim() || undefined, notes: fNotes.trim() || undefined, createdAt: new Date().toISOString().split('T')[0], totalJobs: 0, totalRevenue: 0 };
        setList(prev => [nc, ...prev]);
        setClientTags(p => ({ ...p, [nid]: fTags }));
      }
      setSaving(false); setShowModal(false); resetForm();
    }, 500);
  };

  const handleDelete = (id: string) => {
    setList(prev => prev.filter((c: any) => c.id !== id)); setShowDelete(null);
  };

  const toggleSort = (f: SortField) => {
    if (sortField === f) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); } else { setSortField(f); setSortDir('asc'); }
    setPage(0);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return [...list];
    return list.filter((c: any) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q) || c.city.toLowerCase().includes(q) || (c.company ?? '').toLowerCase().includes(q));
  }, [search, list]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => { let c = 0; if (sortField === 'name') c = a.name.localeCompare(b.name); else if (sortField === 'totalJobs') c = a.totalJobs - b.totalJobs; else if (sortField === 'totalRevenue') c = a.totalRevenue - b.totalRevenue; else if (sortField === 'createdAt') c = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); else if (sortField === 'city') c = a.city.localeCompare(b.city); return sortDir === 'asc' ? c : -c; });
    return arr;
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const paged = sorted.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const fc = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

  if (error) return <Card variant="bordered" padding="lg"><ErrorState title="Failed to load clients" message={error} onRetry={() => window.location.reload()} /></Card>;

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">Clients</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{list.length} total clients</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
          <PlusIcon className="w-4 h-4" /> Add Client
        </button>
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-sm mb-5">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
        <input type="text" placeholder="Search clients..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="w-full h-10 pl-10 pr-4 bg-white border border-border rounded-xl text-sm text-muted-foreground placeholder:text-muted-foreground/80 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        {loading ? (
          <table className="w-full text-sm"><thead><tr className="border-b border-border/50 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">{['Name','Phone','Email','City','Tags','Jobs','Revenue','Since','Actions'].map(h => <th key={h} className="py-3.5 px-4 text-left">{h}</th>)}</tr></thead><tbody>{Array.from({length:5}).map((_,i) => <SkeletonRow key={i}/>)}</tbody></table>
        ) : paged.length === 0 ? (
          <div className="py-16"><EmptyState title={search ? 'No clients match your search' : 'No clients yet'} description={search ? 'Try a different search.' : 'Add your first client to get started.'} /></div>
        ) : (
          <>
            {/* Mobile card layout */}
            <div className="sm:hidden divide-y divide-slate-100">
              {paged.map(c => {
                const type = getClientType(c.name, c.company);
                const tags = clientTags[c.id] ?? [];
                const isExpanded = expandedId === c.id;
                return (
                  <div key={c.id} className="px-4 py-3">
                    <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : c.id)}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <a href={`/clients/${c.id}`} onClick={e => e.stopPropagation()} className="text-sm font-semibold text-foreground hover:text-primary truncate">{c.name}</a>
                          <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium capitalize ${typeColors[type]}`}>{type}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{c.email}</p>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className="text-sm font-semibold text-foreground">{fc(c.totalRevenue)}</p>
                        <p className="text-[10px] text-muted-foreground/80">{c.totalJobs} jobs</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground/80">
                      <span>{c.phone}</span>
                      {c.city && <span>{c.city}, {c.state}</span>}
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {tags.slice(0, 3).map((t, i) => <span key={i} className={`rounded-full border px-2 py-0.5 text-[9px] font-medium ${TAG_COLORS[i % TAG_COLORS.length]}`}>{t}</span>)}
                        {tags.length > 3 && <span className="text-[9px] text-muted-foreground/80">+{tags.length - 3}</span>}
                      </div>
                    )}
                    {/* Expanded detail on mobile */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="font-medium text-foreground">Address</p>
                            <p className="text-muted-foreground">{c.address}, {c.city}, {c.state} {c.zip}</p>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Company</p>
                            <p className="text-muted-foreground">{c.company || '—'}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a href={`tel:${c.phone}`} className="flex-1 h-9 rounded-xl bg-primary text-white text-xs font-semibold flex items-center justify-center hover:bg-primary transition-colors">Call</a>
                          <a href={`mailto:${c.email}`} className="flex-1 h-9 rounded-xl border border-border text-muted-foreground text-xs font-semibold flex items-center justify-center hover:bg-muted transition-colors">Email</a>
                          <button onClick={e => { e.stopPropagation(); openEdit(c); }} className="flex-1 h-9 rounded-xl border border-border text-muted-foreground text-xs font-semibold hover:bg-muted transition-colors">Edit</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
                    <th className="py-3.5 px-4 text-left cursor-pointer select-none hover:text-foreground" onClick={() => toggleSort('name')}>Name {sortIcon('name', sortField, sortDir)}</th>
                    <th className="py-3.5 px-4 text-left">Phone</th>
                    <th className="py-3.5 px-4 text-left">Email</th>
                    <th className="py-3.5 px-4 text-left cursor-pointer select-none hover:text-foreground hidden md:table-cell" onClick={() => toggleSort('city')}>City {sortIcon('city', sortField, sortDir)}</th>
                    <th className="py-3.5 px-4 text-left hidden lg:table-cell">Tags</th>
                    <th className="py-3.5 px-4 text-right cursor-pointer select-none hover:text-foreground" onClick={() => toggleSort('totalJobs')}>Jobs {sortIcon('totalJobs', sortField, sortDir)}</th>
                    <th className="py-3.5 px-4 text-right cursor-pointer select-none hover:text-foreground hidden sm:table-cell" onClick={() => toggleSort('totalRevenue')}>Revenue {sortIcon('totalRevenue', sortField, sortDir)}</th>
                    <th className="py-3.5 px-4 text-right cursor-pointer select-none hover:text-foreground hidden lg:table-cell" onClick={() => toggleSort('createdAt')}>Since {sortIcon('createdAt', sortField, sortDir)}</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map(c => {
                    const type = getClientType(c.name, c.company);
                    const tags = clientTags[c.id] ?? [];
                    return (
                      <>
                      <tr className="border-b border-border/50 transition-colors hover:bg-muted cursor-pointer" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                        <td className="py-3.5 px-4">
                          <a
                            href={`/clients/${c.id}`}
                            onClick={e => e.stopPropagation()}
                            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                          >
                            {c.name}
                          </a>
                          <div className="mt-0.5"><span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium capitalize ${typeColors[type]}`}>{type}</span></div>
                        </td>
                        <td className="py-3.5 px-4 text-sm text-muted-foreground">{c.phone}</td>
                        <td className="py-3.5 px-4 text-sm text-muted-foreground truncate max-w-[160px]">{c.email}</td>
                        <td className="py-3.5 px-4 text-sm text-muted-foreground hidden md:table-cell">{c.city}</td>
                        <td className="py-3.5 px-4 hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {tags.length === 0 ? <span className="text-xs text-muted-foreground/80">—</span> : tags.slice(0, 3).map((t, i) => <span key={i} className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${TAG_COLORS[i % TAG_COLORS.length]}`}>{t}</span>)}
                            {tags.length > 3 && <span className="text-[10px] text-muted-foreground/80">+{tags.length - 3}</span>}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right text-sm font-semibold text-foreground">{c.totalJobs}</td>
                        <td className="py-3.5 px-4 text-right text-sm font-semibold text-foreground hidden sm:table-cell">{fc(c.totalRevenue)}</td>
                        <td className="py-3.5 px-4 text-right text-sm text-muted-foreground hidden lg:table-cell whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={e => { e.stopPropagation(); openEdit(c); }} className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground/80 hover:bg-muted hover:text-foreground transition-colors"><EditIcon className="w-4 h-4" /></button>
                            <button onClick={e => { e.stopPropagation(); setShowDelete(c.id); }} className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground/80 hover:bg-red-50 hover:text-red-600 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                      {/* Expanded detail panel */}
                      {expandedId === c.id && (
                        <tr key={`${c.id}-detail`}>
                          <td colSpan={9} className="px-4 py-4 bg-muted/70 border-b border-border/50">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 mb-1.5">Contact</p>
                                <p className="text-sm text-foreground">
                                  <a href={`tel:${c.phone}`} className="hover:text-primary transition-colors">{c.phone}</a>
                                </p>
                                <p className="text-sm text-foreground">
                                  <a href={`mailto:${c.email}`} className="hover:text-primary transition-colors">{c.email}</a>
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 mb-1.5">Address</p>
                                <p className="text-sm text-foreground">{c.address}</p>
                                <p className="text-sm text-foreground">{c.city}, {c.state} {c.zip}</p>
                                {c.company && <p className="text-sm text-muted-foreground mt-1.5">{c.company}</p>}
                              </div>
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 mb-1.5">Activity</p>
                                <p className="text-sm text-foreground">{c.totalJobs} jobs · {fc(c.totalRevenue)} revenue</p>
                                <p className="text-sm text-muted-foreground">Since {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                              </div>
                            </div>
                            {tags.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-border">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 mb-1.5">Tags</p>
                                <div className="flex flex-wrap gap-1">
                                  {tags.map((t, i) => <span key={i} className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${TAG_COLORS[i % TAG_COLORS.length]}`}>{t}</span>)}
                                </div>
                              </div>
                            )}
                            {c.notes && (
                              <div className="mt-3 pt-3 border-t border-border">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 mb-1">Notes</p>
                                <p className="text-sm text-muted-foreground">{c.notes}</p>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
              <p className="text-xs text-muted-foreground">Showing {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, sorted.length)} of {sorted.length}</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePage === 0} className="h-8 px-3 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed">← Prev</button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i)} className={`h-8 min-w-[32px] rounded-xl text-xs font-medium transition-colors ${i === safePage ? 'bg-blue-tint text-primary' : 'text-muted-foreground hover:bg-muted'}`}>{i + 1}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={safePage >= totalPages - 1} className="h-8 px-3 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed">Next →</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ══════════════════════════════════
         ADD/EDIT CLIENT MODAL
         ══════════════════════════════════ */}
      {showModal && (
        <>
          <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-start justify-center pt-[5vh] pb-8 px-4 overflow-y-auto" onClick={() => { setShowModal(false); resetForm(); }}>
            <div
              className={`w-full max-w-xl bg-white rounded-2xl shadow-xl border border-border overflow-hidden ${shakeKey ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-border/50">
                <h2 className="text-lg font-bold text-foreground">{editingId ? 'Edit Client' : 'Add New Client'}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{editingId ? 'Update client information.' : 'Fill in the details to add a new client.'}</p>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4 max-h-[55vh] sm:max-h-[65vh] overflow-y-auto overscroll-contain">
                {/* Name row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">First Name *</label>
                    <input
                      type="text" placeholder="John"
                      value={fName}
                      onChange={e => { setFName(capitalizeName(e.target.value)); setTouched(t => ({...t, fName: true})); }}
                      className={`w-full h-11 px-4 bg-white border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/80 outline-none transition-all ${errors.fName ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20'}`}
                    />
                    {errors.fName && <p className="text-xs text-red-500 mt-1">{errors.fName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Last Name</label>
                    <input type="text" placeholder="Smith" value={fLName} onChange={e => setFLName(capitalizeName(e.target.value))} className="w-full h-11 px-4 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/80 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
                  <input type="email" placeholder="john@example.com" value={fEmail} onChange={e => { setFEmail(e.target.value); setTouched(t => ({...t, fEmail: true})); }} className={`w-full h-11 px-4 bg-white border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/80 outline-none transition-all ${errors.fEmail ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20'}`} />
                  {errors.fEmail && <p className="text-xs text-red-500 mt-1">{errors.fEmail}</p>}
                </div>

                {/* Phone + Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                    <div className="flex gap-2">
                      <div className="relative shrink-0">
                        <select value={fCountry} onChange={e => { setFCountry(e.target.value); setFPhoneDisp(''); }} className="h-11 pl-3 pr-7 bg-white border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer">
                          {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                        </select>
                      </div>
                      <input
                        type="tel" inputMode="numeric" placeholder="(555) 000-0000"
                        value={fPhoneDisp}
                        onChange={e => { const raw = e.target.value.replace(/\D/g, '').slice(0, 10); setFPhoneDisp(formatPhone(raw, fCountry)); setFPhone(raw); }}
                        className="flex-1 h-11 px-4 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/80 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Company</label>
                    <input type="text" placeholder="Company name (optional)" value={fCompany} onChange={e => setFCompany(e.target.value)} className="w-full h-11 px-4 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/80 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                </div>

                {/* Address autocomplete */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Address *</label>
                  <AddressAutocomplete
                    value={fAddr}
                    onChange={v => { setFAddr(v); setTouched(t => ({...t, fAddr: true})); }}
                    onSelect={(addr, city, state, zip) => { setFAddr(addr); setFCity(city); setFState(state); setFZip(zip); }}
                    error={errors.fAddr}
                  />
                </div>

                {/* City, State, ZIP */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">City *</label>
                    <input type="text" placeholder="Austin" value={fCity} onChange={e => { setFCity(e.target.value); setTouched(t => ({...t, fCity: true})); }} className={`w-full h-11 px-4 bg-white border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/80 outline-none transition-all ${errors.fCity ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20'}`} />
                    {errors.fCity && <p className="text-xs text-red-500 mt-1">{errors.fCity}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">State/Province *</label>
                    <input type="text" placeholder="TX" value={fState} onChange={e => { setFState(e.target.value.toUpperCase().slice(0, 2)); setTouched(t => ({...t, fState: true})); }} className={`w-full h-11 px-4 bg-white border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/80 outline-none transition-all ${errors.fState ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20'}`} />
                    {errors.fState && <p className="text-xs text-red-500 mt-1">{errors.fState}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">ZIP/Postal Code *</label>
                    <input type="text" inputMode="numeric" placeholder="73301" value={fZip} onChange={e => { setFZip(e.target.value.replace(/\D/g, '').slice(0, 5)); setTouched(t => ({...t, fZip: true})); }} className={`w-full h-11 px-4 bg-white border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/80 outline-none transition-all ${errors.fZip ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20'}`} />
                    {errors.fZip && <p className="text-xs text-red-500 mt-1">{errors.fZip}</p>}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Tags</label>
                  <input type="text" placeholder="Comma-separated tags (e.g. vip, referral, commercial)" value={fTagsInput} onChange={e => setFTagsInput(e.target.value)} onBlur={() => { const parsed = fTagsInput.split(',').map(t => t.trim()).filter(Boolean); setFTags(parsed); }} className="w-full h-11 px-4 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/80 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                  {fTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {fTags.map((tag, i) => (
                        <span key={i} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${TAG_COLORS[i % TAG_COLORS.length]}`}>
                          {tag}
                          <button onClick={() => { const next = fTags.filter((_, idx) => idx !== i); setFTags(next); setFTagsInput(next.join(', ')); }} className="hover:text-foreground transition-colors">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
                  <textarea rows={3} placeholder="Additional notes about this client..." value={fNotes} onChange={e => setFNotes(e.target.value)} className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/80 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 px-6 py-4 bg-white border-t border-border/50 flex items-center justify-end gap-3">
                <button onClick={() => { setShowModal(false); resetForm(); }} className="h-10 px-5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="h-10 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                  {saving ? 'Saving...' : editingId ? 'Update Client' : 'Save Client'}
                </button>
              </div>
            </div>
          </div>

          {/* Shake animation */}
          <style jsx global>{`
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              10%, 50%, 90% { transform: translateX(-4px); }
              30%, 70% { transform: translateX(4px); }
            }
          `}</style>
        </>
      )}

      {/* ═══ DELETE CONFIRMATION ═══ */}
      {showDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4" onClick={() => setShowDelete(null)}>
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-border p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-foreground mb-1">Delete Client</h3>
            <p className="text-sm text-muted-foreground mb-5">Are you sure you want to delete this client? This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setShowDelete(null)} className="h-10 px-5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
              <button onClick={() => handleDelete(showDelete)} className="h-10 px-5 rounded-xl bg-red-500 text-foreground text-sm font-semibold hover:bg-red-600 transition-colors shadow-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
