'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button, Card, Input, TextArea, Modal, EmptyState, ErrorState } from '@/pkg/ui-components';
import { clients } from '@/lib/mock-data';
import type { Client } from '@/lib/mock-data';

/* ── Tag colors ── */
const TAG_COLORS = [
  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'bg-green-500/10 text-green-400 border-green-500/20',
  'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
];

/* ── Property type ── */
interface ClientProperty {
  address: string;
  type: 'residential' | 'commercial';
}

/* ── Skeleton rows ── */
function SkeletonTableRow() {
  return (
    <tr className="border-b border-gray-200/50">
      {Array.from({ length: 9 }).map((_, i) => (
        <td key={i} className="py-3 pr-4">
          <div className="animate-pulse h-4 rounded bg-whiteer w-3/4" />
        </td>
      ))}
    </tr>
  );
}

/* ── Client type helpers ── */
function getClientType(name: string, company?: string): 'residential' | 'commercial' {
  const commercialKeywords = ['apt', 'apartments', 'diner', 'retirement', 'church', 'office', 'brewery', 'llc', 'inc', 'properties', 'hospitality', 'living', 'senior'];
  const lower = name.toLowerCase();
  const comp = (company ?? '').toLowerCase();
  if (commercialKeywords.some((kw) => lower.includes(kw) || comp.includes(kw))) return 'commercial';
  return 'residential';
}

const typeColors: Record<string, string> = {
  residential: 'bg-blue-50 text-blue-600',
  commercial: 'bg-accent-amber/10 text-amber-600',
};

/* ── Sort config ── */
type SortField = 'name' | 'totalJobs' | 'totalRevenue' | 'createdAt' | 'city';
type SortDir = 'asc' | 'desc';

export default function ClientsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(0);
  const pageSize = 5;

  /* ── Modal states ── */
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /* ── Form fields ── */
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formZip, setFormZip] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formTagsInput, setFormTagsInput] = useState('');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formProperties, setFormProperties] = useState<ClientProperty[]>([]);
  const [newPropAddr, setNewPropAddr] = useState('');
  const [newPropType, setNewPropType] = useState<'residential' | 'commercial'>('residential');
  const [showPropInput, setShowPropInput] = useState(false);

  /* ── Client list state (local CRUD) ── */
  const [clientList, setClientList] = useState<Client[]>([]);
  /* ── Client metadata (tags + properties) stored locally ── */
  const [clientTags, setClientTags] = useState<Record<string, string[]>>({});
  const [clientProperties, setClientProperties] = useState<Record<string, ClientProperty[]>>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setClientList([...clients]);
        setLoading(false);
      } catch {
        setError('Failed to load clients');
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  /* ── Reset form ── */
  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormAddress('');
    setFormCity('');
    setFormState('');
    setFormZip('');
    setFormCompany('');
    setFormNotes('');
    setFormTagsInput('');
    setFormTags([]);
    setFormProperties([]);
    setNewPropAddr('');
    setNewPropType('residential');
    setShowPropInput(false);
    setEditingClient(null);
  };

  /* ── Open edit modal ── */
  const openEdit = (client: Client) => {
    setEditingClient(client);
    setFormName(client.name);
    setFormEmail(client.email);
    setFormPhone(client.phone);
    setFormAddress(client.address);
    setFormCity(client.city);
    setFormState(client.state);
    setFormZip(client.zip);
    setFormCompany(client.company ?? '');
    setFormNotes(client.notes ?? '');
    setFormTags(clientTags[client.id] ?? []);
    setFormTagsInput((clientTags[client.id] ?? []).join(', '));
    setFormProperties(clientProperties[client.id] ?? []);
    setShowAddModal(true);
  };

  /* ── Save client (create or update) ── */
  const handleSaveClient = () => {
    if (!formName.trim() || !formEmail.trim() || !formPhone.trim() || !formAddress.trim() || !formCity.trim() || !formState.trim() || !formZip.trim()) return;
    setSaving(true);

    setTimeout(() => {
      if (editingClient) {
        // Update existing
        setClientList((prev) =>
          prev.map((c) =>
            c.id === editingClient.id
              ? {
                  ...c,
                  name: formName.trim(),
                  email: formEmail.trim(),
                  phone: formPhone.trim(),
                  address: formAddress.trim(),
                  city: formCity.trim(),
                  state: formState.trim(),
                  zip: formZip.trim(),
                  company: formCompany.trim() || undefined,
                  notes: formNotes.trim() || undefined,
                }
              : c
          )
        );
      } else {
        // Create new
        const newId = `CLT-${String(clientList.length + 1).padStart(3, '0')}`;
        const newClient: Client = {
          id: newId,
          name: formName.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          address: formAddress.trim(),
          city: formCity.trim(),
          state: formState.trim(),
          zip: formZip.trim(),
          company: formCompany.trim() || undefined,
          notes: formNotes.trim() || undefined,
          createdAt: new Date().toISOString().split('T')[0],
          totalJobs: 0,
          totalRevenue: 0,
        };
        setClientList((prev) => [newClient, ...prev]);
      }
      // Save tags
      const targetId = editingClient?.id ?? `CLT-${String(clientList.length + 1).padStart(3, '0')}`;
      if (!editingClient) {
        // For new client, the ID is already computed
        const newId = `CLT-${String(clientList.length + 1).padStart(3, '0')}`;
        setClientTags((prev) => ({ ...prev, [newId]: formTags }));
        setClientProperties((prev) => ({ ...prev, [newId]: formProperties }));
      } else {
        setClientTags((prev) => ({ ...prev, [editingClient.id]: formTags }));
        setClientProperties((prev) => ({ ...prev, [editingClient.id]: formProperties }));
      }

      setSaving(false);
      setShowAddModal(false);
      resetForm();
    }, 600);
  };

  /* ── Delete client ── */
  const handleDeleteClient = (id: string) => {
    setClientList((prev) => prev.filter((c) => c.id !== id));
    const newTags = { ...clientTags };
    delete newTags[id];
    setClientTags(newTags);
    const newProps = { ...clientProperties };
    delete newProps[id];
    setClientProperties(newProps);
    setShowDeleteConfirm(null);
  };

  /* ── Add tag from comma input ── */
  const handleTagsBlur = () => {
    const parsed = formTagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    setFormTags(parsed);
  };

  /* ── Add property ── */
  const handleAddProperty = () => {
    if (!newPropAddr.trim()) return;
    setFormProperties((prev) => [...prev, { address: newPropAddr.trim(), type: newPropType }]);
    setNewPropAddr('');
    setShowPropInput(false);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(0);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return [...clientList];
    return clientList.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.city.toLowerCase().includes(q) ||
        (c.company ?? '').toLowerCase().includes(q)
    );
  }, [search, clientList]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'totalJobs':
          cmp = a.totalJobs - b.totalJobs;
          break;
        case 'totalRevenue':
          cmp = a.totalRevenue - b.totalRevenue;
          break;
        case 'createdAt':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'city':
          cmp = a.city.localeCompare(b.city);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const paged = sorted.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return '↕';
    return sortDir === 'asc' ? '↑' : '↓';
  };

  const formatCurrency = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

  const formValid = formName.trim() && formEmail.trim() && formPhone.trim() && formAddress.trim() && formCity.trim() && formState.trim() && formZip.trim();

  if (error) {
    return (
      <Card variant="bordered" padding="lg">
        <ErrorState title="Failed to load clients" message={error} onRetry={() => window.location.reload()} />
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Clients</h1>
        <p className="text-sm text-gray-500 mt-0.5">{clientList.length} total clients</p>
      </div>

      {/* Search bar + Add Client button */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="w-full sm:max-w-xs">
          <Input
            placeholder="Search by name, email, phone, city…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            disabled={loading}
          />
        </div>
        <Button variant="primary" size="sm" onClick={() => { resetForm(); setShowAddModal(true); }}>
          + Add Client
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                {['Name', 'Phone', 'Email', 'City', 'Tags', 'Jobs', 'Revenue', 'Since', 'Actions'].map((h) => (
                  <th key={h} className="py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonTableRow key={i} />
              ))}
            </tbody>
          </table>
        ) : paged.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title={search ? 'No clients match your search' : 'No clients yet'}
              description={
                search
                  ? 'Try a different search term.'
                  : 'Add your first client to get started with PlumbCore.'
              }
            />
          </div>
        ) : (
          <>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th
                    className="py-3 px-4 cursor-pointer select-none hover:text-gray-900 transition-colors"
                    onClick={() => toggleSort('name')}
                  >
                    <span className="inline-flex items-center gap-1">
                      Name <span className="text-[10px] opacity-60">{sortIcon('name')}</span>
                    </span>
                  </th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Email</th>
                  <th
                    className="py-3 px-4 cursor-pointer select-none hover:text-gray-900 transition-colors"
                    onClick={() => toggleSort('city')}
                  >
                    <span className="inline-flex items-center gap-1">
                      City <span className="text-[10px] opacity-60">{sortIcon('city')}</span>
                    </span>
                  </th>
                  <th className="py-3 px-4">Tags</th>
                  <th
                    className="py-3 px-4 text-right cursor-pointer select-none hover:text-gray-900 transition-colors"
                    onClick={() => toggleSort('totalJobs')}
                  >
                    <span className="inline-flex items-center gap-1">
                      Jobs <span className="text-[10px] opacity-60">{sortIcon('totalJobs')}</span>
                    </span>
                  </th>
                  <th
                    className="py-3 px-4 text-right cursor-pointer select-none hover:text-gray-900 transition-colors"
                    onClick={() => toggleSort('totalRevenue')}
                  >
                    <span className="inline-flex items-center gap-1">
                      Revenue <span className="text-[10px] opacity-60">{sortIcon('totalRevenue')}</span>
                    </span>
                  </th>
                  <th
                    className="py-3 px-4 text-right cursor-pointer select-none hover:text-gray-900 transition-colors"
                    onClick={() => toggleSort('createdAt')}
                  >
                    <span className="inline-flex items-center gap-1">
                      Since <span className="text-[10px] opacity-60">{sortIcon('createdAt')}</span>
                    </span>
                  </th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((client) => {
                  const type = getClientType(client.name, client.company);
                  const tags = clientTags[client.id] ?? [];
                  return (
                    <tr
                      key={client.id}
                      className="border-b border-gray-200/50 transition-colors hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <a
                          href={`/clients/${client.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {client.name}
                        </a>
                        <div className="mt-0.5">
                          <span
                            className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium capitalize ${
                              typeColors[type]
                            }`}
                          >
                            {type}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-400 whitespace-nowrap">{client.phone}</td>
                      <td className="py-3 px-4 text-gray-400 truncate max-w-[160px]">{client.email}</td>
                      <td className="py-3 px-4 text-gray-400">{client.city}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {tags.length === 0 ? (
                            <span className="text-[11px] text-gray-500-dark">—</span>
                          ) : (
                            tags.slice(0, 3).map((tag, i) => (
                              <span
                                key={i}
                                className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${TAG_COLORS[i % TAG_COLORS.length]}`}
                              >
                                {tag}
                              </span>
                            ))
                          )}
                          {tags.length > 3 && (
                            <span className="text-[10px] text-gray-400">+{tags.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900 font-medium">{client.totalJobs}</td>
                      <td className="py-3 px-4 text-right text-gray-900 font-medium">
                        {formatCurrency(client.totalRevenue)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-500 whitespace-nowrap">
                        {new Date(client.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEdit(client)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                            title="Edit client"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(client.id)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Delete client"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
              <p className="text-xs text-gray-500">
                Showing {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, sorted.length)} of{' '}
                {sorted.length}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      i === safePage
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={safePage >= totalPages - 1}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Add / Edit Client Modal ── */}
      <Modal
        open={showAddModal}
        onClose={() => { setShowAddModal(false); resetForm(); }}
        title={editingClient ? 'Edit Client' : 'Add New Client'}
        description={editingClient ? `Editing ${editingClient.name}` : 'Fill in the details to add a new client.'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => { setShowAddModal(false); resetForm(); }}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" loading={saving} disabled={!formValid} onClick={handleSaveClient}>
              {editingClient ? 'Update Client' : 'Save Client'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Name *"
              placeholder="John Doe"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
            <Input
              label="Email *"
              type="email"
              placeholder="john@example.com"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
            />
          </div>

          {/* Phone & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone *"
              placeholder="(555) 000-0000"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
            />
            <Input
              label="Company Name"
              placeholder="Optional"
              value={formCompany}
              onChange={(e) => setFormCompany(e.target.value)}
            />
          </div>

          {/* Address */}
          <Input
            label="Address *"
            placeholder="123 Main St"
            value={formAddress}
            onChange={(e) => setFormAddress(e.target.value)}
          />

          {/* City, State, ZIP */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="City *"
              placeholder="Austin"
              value={formCity}
              onChange={(e) => setFormCity(e.target.value)}
            />
            <Input
              label="State *"
              placeholder="TX"
              value={formState}
              onChange={(e) => setFormState(e.target.value)}
            />
            <Input
              label="ZIP *"
              placeholder="73301"
              value={formZip}
              onChange={(e) => setFormZip(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div>
            <Input
              label="Tags"
              placeholder="Comma-separated tags (e.g. vip, referral, commercial)"
              value={formTagsInput}
              onChange={(e) => setFormTagsInput(e.target.value)}
              onBlur={handleTagsBlur}
            />
            {formTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formTags.map((tag, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${TAG_COLORS[i % TAG_COLORS.length]}`}
                  >
                    {tag}
                    <button
                      onClick={() => {
                        const next = formTags.filter((_, idx) => idx !== i);
                        setFormTags(next);
                        setFormTagsInput(next.join(', '));
                      }}
                      className="hover:text-gray-900 transition-colors"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Properties */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-400">Properties</span>
              {!showPropInput && (
                <Button variant="ghost" size="sm" onClick={() => setShowPropInput(true)}>
                  + Add Property
                </Button>
              )}
            </div>
            {showPropInput && (
              <div className="flex items-end gap-2 mb-3 p-3 rounded-lg border border-gray-200 bg-whiteer">
                <div className="flex-1">
                  <Input
                    placeholder="Property address"
                    value={newPropAddr}
                    onChange={(e) => setNewPropAddr(e.target.value)}
                  />
                </div>
                <select
                  value={newPropType}
                  onChange={(e) => setNewPropType(e.target.value as 'residential' | 'commercial')}
                  className="rounded-lg border border-gray-200 bg-whiteer px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20"
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </select>
                <Button variant="primary" size="sm" onClick={handleAddProperty} disabled={!newPropAddr.trim()}>
                  Add
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowPropInput(false)}>
                  Cancel
                </Button>
              </div>
            )}
            {formProperties.length > 0 && (
              <div className="space-y-2">
                {formProperties.map((prop, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-gray-200/50 px-3 py-2 bg-whiteer/50">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span className="text-sm text-gray-900">{prop.address}</span>
                      <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium capitalize ${prop.type === 'commercial' ? 'bg-accent-amber/10 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                        {prop.type}
                      </span>
                    </div>
                    <button
                      onClick={() => setFormProperties((prev) => prev.filter((_, idx) => idx !== i))}
                      className="rounded p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <TextArea
            label="Notes"
            placeholder="Additional notes about this client..."
            rows={3}
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
          />
        </div>
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
      <Modal
        open={showDeleteConfirm !== null}
        onClose={() => setShowDeleteConfirm(null)}
        title="Delete Client"
        description="Are you sure you want to delete this client? This action cannot be undone."
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (showDeleteConfirm) handleDeleteClient(showDeleteConfirm);
              }}
            >
              Delete Client
            </Button>
          </>
        }
      />
    </div>
  );
}