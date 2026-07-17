'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Card,
  Input,
  TextArea,
  StatusBadge,
  Modal,
  EmptyState,
  ErrorState,
} from '@/pkg/ui-components';
import { pricebook, pricebookCategories, repairTypesList, partsList } from '@/lib/pricebook-data';
import type { PricebookItem } from '@/lib/pricebook-data';

/* ── Helpers ── */
function formatCurrency(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function generateId(isRepair: boolean): string {
  const existing = pricebook;
  if (isRepair) {
    const nums = existing.filter((i: any) => i.isRepairType).map((i: any) => parseInt(i.id.replace('RT-', ''), 10)).sort((a, b) => a - b);
    const next = nums.length > 0 ? nums[nums.length - 1] + 1 : 1;
    return `RT-${String(next).padStart(3, '0')}`;
  }
  const nums = existing.filter((i: any) => !i.isRepairType).map((i: any) => parseInt(i.id.replace('PB-', ''), 10)).sort((a, b) => a - b);
  const next = nums.length > 0 ? nums[nums.length - 1] + 1 : 1;
  return `PB-${String(next).padStart(3, '0')}`;
}

/* ── Default item form state ── */
function emptyForm(): Partial<PricebookItem> {
  return {
    name: '',
    category: '',
    unitPrice: 0,
    unitType: 'each',
    isRepairType: false,
    estimatedHours: undefined,
    description: '',
    commonBrands: [],
  };
}

/* ── Tab config ── */
const tabs = ['All', 'Parts', 'Repair Types'] as const;

/* ── Skeleton ── */
function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 animate-pulse">
      <div className="h-4 w-36 rounded bg-slate-50" />
      <div className="h-4 w-20 rounded bg-slate-50" />
      <div className="h-4 w-16 rounded bg-slate-50" />
      <div className="h-4 w-16 rounded bg-slate-50" />
      <div className="h-4 w-20 rounded bg-slate-50" />
      <div className="h-4 w-24 rounded bg-slate-50" />
    </div>
  );
}

/* ── Main Page ── */
export default function PricebookPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PricebookItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<PricebookItem | null>(null);
  const [form, setForm] = useState<Partial<PricebookItem>>(emptyForm());
  const [saving, setSaving] = useState(false);

  // Local state for items (simulates CRUD)
  const [items, setItems] = useState<PricebookItem[]>([]);

  useEffect(() => {
    const t = setTimeout(() => {
      setItems([...pricebook]);
      setLoading(false);
    }, 350);
    return () => clearTimeout(t);
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setItems([...pricebook]);
      setLoading(false);
    }, 350);
  };

  /* ── Filtered items ── */
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Tab filter
    if (activeTab === 'Parts') {
      result = result.filter((i: any) => !i.isRepairType);
    } else if (activeTab === 'Repair Types') {
      result = result.filter((i: any) => i.isRepairType);
    }

    // Category filter
    if (categoryFilter) {
      result = result.filter((i: any) => i.category === categoryFilter);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        i =>
          i.name.toLowerCase().includes(q) ||
          (i.description && i.description.toLowerCase().includes(q)) ||
          (i.commonBrands && i.commonBrands.some(b => b.toLowerCase().includes(q)))
      );
    }

    return result;
  }, [items, search, activeTab, categoryFilter]);

  /* ── Add item ── */
  const handleAdd = () => {
    setForm(emptyForm());
    setAddModalOpen(true);
  };

  const handleSaveAdd = () => {
    if (!form.name || !form.category || form.unitPrice === undefined) return;
    setSaving(true);
    const newItem: PricebookItem = {
      id: generateId(form.isRepairType || false),
      name: form.name,
      category: form.category,
      unitPrice: form.unitPrice,
      unitType: form.unitType || 'each',
      isRepairType: form.isRepairType || false,
      estimatedHours: form.isRepairType ? form.estimatedHours : undefined,
      description: form.description || undefined,
      commonBrands: form.isRepairType ? undefined : (form.commonBrands?.length ? form.commonBrands : undefined),
    };
    setTimeout(() => {
      setItems(prev => [...prev, newItem]);
      setSaving(false);
      setAddModalOpen(false);
    }, 300);
  };

  /* ── Edit item ── */
  const handleEdit = (item: PricebookItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category,
      unitPrice: item.unitPrice,
      unitType: item.unitType,
      isRepairType: item.isRepairType,
      estimatedHours: item.estimatedHours,
      description: item.description,
      commonBrands: item.commonBrands,
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingItem || !form.name || !form.category || form.unitPrice === undefined) return;
    setSaving(true);
    setTimeout(() => {
      setItems(prev =>
        prev.map((i: any) =>
          i.id === editingItem.id
            ? {
                ...i,
                name: form.name!,
                category: form.category!,
                unitPrice: form.unitPrice!,
                unitType: form.unitType || 'each',
                estimatedHours: form.isRepairType ? form.estimatedHours : undefined,
                description: form.description || undefined,
                commonBrands: form.isRepairType ? undefined : (form.commonBrands?.length ? form.commonBrands : undefined),
              }
            : i
        )
      );
      setSaving(false);
      setEditModalOpen(false);
      setEditingItem(null);
    }, 300);
  };

  /* ── Delete item ── */
  const handleDeleteConfirm = () => {
    if (!deletingItem) return;
    setItems(prev => prev.filter((i: any) => i.id !== deletingItem.id));
    setDeleteModalOpen(false);
    setDeletingItem(null);
  };

  /* ── Form field helpers ── */
  const updateForm = (key: string, value: unknown) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  /* ── Render ── */

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <ErrorState title="Failed to load pricebook" message={error} onRetry={handleRetry} />
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-5">
        <div className="h-8 w-48 rounded bg-slate-50 animate-pulse" />
        <div className="h-5 w-64 rounded bg-slate-50 animate-pulse" />
        <div className="h-10 w-full max-w-md rounded bg-slate-50 animate-pulse" />
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 w-24 rounded-xl bg-slate-50 animate-pulse" />
          ))}
        </div>
        <Card variant="default" padding="sm">
          <div className="divide-y divide-white-border">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Pricebook</h1>
          <p className="text-sm text-slate-500 mt-0.5">{items.length} items in pricebook</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCsvModalOpen(true)}>
            Import CSV
          </Button>
          <Button size="sm" onClick={handleAdd}>
            + Add Item
          </Button>
        </div>
      </div>

      {/* Search + Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by name, description, or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-whiteer px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20"
        >
          <option value="">All Categories</option>
          {pricebookCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl bg-whiteer p-1 w-fit">
        {tabs.map((tab) => {
          const count =
            tab === 'All'
              ? items.length
              : tab === 'Parts'
              ? items.filter((i: any) => !i.isRepairType).length
              : items.filter((i: any) => i.isRepairType).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === tab
                  ? 'bg-electric text-[#0a0e2a] shadow-sm'
                  : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              {tab}
              <span className={`ml-1.5 text-xs ${
                activeTab === tab ? 'text-[#0a0e2a]/60' : 'text-steel-dark'
              }`}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      {filteredItems.length === 0 ? (
        <Card variant="bordered" padding="lg">
          <EmptyState
            title="No items found"
            description={
              search || categoryFilter || activeTab !== 'All'
                ? 'Try adjusting your search or filters.'
                : 'The pricebook is empty. Add your first item to get started.'
            }
            action={<Button size="sm" onClick={handleAdd}>Add Item</Button>}
          />
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl ring-1 ring-black/5 bg-white">
          <table className="w-full min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Category</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Unit Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Unit Type</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Est. Hours</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 hidden lg:table-cell">Brands / Desc</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white-border">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-slate-50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {item.name}
                      {item.isRepairType && (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">Repair</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400 whitespace-nowrap">{item.category}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-right whitespace-nowrap">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-4 py-3 text-sm text-slate-400 whitespace-nowrap">{item.unitType}</td>
                  <td className="px-4 py-3 text-sm text-slate-400 text-center whitespace-nowrap">
                    {item.isRepairType && item.estimatedHours ? `${item.estimatedHours}h` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400 whitespace-nowrap hidden lg:table-cell">
                    {item.isRepairType
                      ? (item.description ? item.description.substring(0, 50) + (item.description.length > 50 ? '...' : '') : '—')
                      : (item.commonBrands ? item.commonBrands.join(', ') : '—')
                    }
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeletingItem(item);
                          setDeleteModalOpen(true);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 text-xs text-slate-500 border-t border-slate-200">
            Showing {filteredItems.length} of {items.length} items
          </div>
        </div>
      )}

      {/* ── Add Item Modal ── */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Pricebook Item"
        description="Create a new part or repair type for your pricebook."
        size="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" loading={saving} onClick={handleSaveAdd} disabled={!form.name || !form.category || form.unitPrice === undefined}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Name *" placeholder="Item name" value={form.name || ''} onChange={(e) => updateForm('name', e.target.value)} />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-400">Category *</label>
            <select
              value={form.category || ''}
              onChange={(e) => updateForm('category', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-whiteer px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20"
            >
              <option value="">Select a category</option>
              {pricebookCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Unit Price *"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.unitPrice || ''}
              onChange={(e) => updateForm('unitPrice', parseFloat(e.target.value) || 0)}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-400">Unit Type *</label>
              <select
                value={form.unitType || 'each'}
                onChange={(e) => updateForm('unitType', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-whiteer px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20"
              >
                {['each', 'roll', 'length', 'pack', 'kit', 'tube', 'can', 'tub', 'labor', 'tube'].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Repair type toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isRepairType || false}
              onChange={(e) => {
                updateForm('isRepairType', e.target.checked);
                if (e.target.checked) {
                  updateForm('commonBrands', []);
                } else {
                  updateForm('estimatedHours', undefined);
                }
              }}
              className="rounded border-white/10 bg-whiteer text-blue-600 focus:ring-electric/30"
            />
            <span className="text-sm text-slate-900">This is a repair type</span>
          </label>

          {form.isRepairType && (
            <>
              <Input
                label="Estimated Hours"
                type="number"
                step="0.5"
                min="0"
                placeholder="0"
                value={form.estimatedHours || ''}
                onChange={(e) => updateForm('estimatedHours', parseFloat(e.target.value) || 0)}
              />
              <TextArea
                label="Description"
                placeholder="Describe the repair service..."
                rows={3}
                value={form.description || ''}
                onChange={(e) => updateForm('description', e.target.value)}
              />
            </>
          )}
        </div>
      </Modal>

      {/* ── Edit Item Modal ── */}
      <Modal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditingItem(null); }}
        title="Edit Pricebook Item"
        description={`Editing "${editingItem?.name}"`}
        size="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => { setEditModalOpen(false); setEditingItem(null); }}>
              Cancel
            </Button>
            <Button size="sm" loading={saving} onClick={handleSaveEdit} disabled={!form.name || !form.category || form.unitPrice === undefined}>
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Name *" placeholder="Item name" value={form.name || ''} onChange={(e) => updateForm('name', e.target.value)} />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-400">Category *</label>
            <select
              value={form.category || ''}
              onChange={(e) => updateForm('category', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-whiteer px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20"
            >
              <option value="">Select a category</option>
              {pricebookCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Unit Price *"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.unitPrice || ''}
              onChange={(e) => updateForm('unitPrice', parseFloat(e.target.value) || 0)}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-400">Unit Type *</label>
              <select
                value={form.unitType || 'each'}
                onChange={(e) => updateForm('unitType', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-whiteer px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20"
              >
                {['each', 'roll', 'length', 'pack', 'kit', 'tube', 'can', 'tub', 'labor'].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Repair type toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isRepairType || false}
              onChange={(e) => {
                updateForm('isRepairType', e.target.checked);
                if (e.target.checked) {
                  updateForm('commonBrands', []);
                } else {
                  updateForm('estimatedHours', undefined);
                }
              }}
              className="rounded border-white/10 bg-whiteer text-blue-600 focus:ring-electric/30"
            />
            <span className="text-sm text-slate-900">This is a repair type</span>
          </label>

          {form.isRepairType && (
            <>
              <Input
                label="Estimated Hours"
                type="number"
                step="0.5"
                min="0"
                placeholder="0"
                value={form.estimatedHours || ''}
                onChange={(e) => updateForm('estimatedHours', parseFloat(e.target.value) || 0)}
              />
              <TextArea
                label="Description"
                placeholder="Describe the repair service..."
                rows={3}
                value={form.description || ''}
                onChange={(e) => updateForm('description', e.target.value)}
              />
            </>
          )}
        </div>
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
      <Modal
        open={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeletingItem(null); }}
        title="Delete Item"
        description={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => { setDeleteModalOpen(false); setDeletingItem(null); }}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </>
        }
      />

      {/* ── CSV Import Modal ── */}
      <CsvImportModal
        open={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
        onImport={(newItems) => {
          setItems(prev => [...prev, ...newItems]);
          setCsvModalOpen(false);
        }}
      />
    </div>
  );
}

/* ── CSV Import Modal Component ── */
function CsvImportModal({
  open,
  onClose,
  onImport,
}: {
  open: boolean;
  onClose: () => void;
  onImport: (items: PricebookItem[]) => void;
}) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing' | 'done'>('upload');
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importCount, setImportCount] = useState(0);
  const [duplicates, setDuplicates] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Column mapping state
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    name: '',
    category: '',
    unitPrice: '',
    unitType: '',
    sku: '',
    supplier: '',
  });

  const requiredFields = ['name', 'category', 'unitPrice'] as const;
  const mappingOptions = [
    { value: 'name', label: 'Name *' },
    { value: 'category', label: 'Category *' },
    { value: 'unitPrice', label: 'Unit Price *' },
    { value: 'unitType', label: 'Unit Type' },
    { value: 'sku', label: 'SKU' },
    { value: 'supplier', label: 'Supplier' },
    { value: '__ignore__', label: '— Ignore —' },
  ];

  const handleFile = (file: File) => {
    setError(null);
    if (!file.name.endsWith('.csv')) {
      setError('Please select a .csv file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) {
        setError('CSV file must have a header row and at least one data row');
        return;
      }

      const parsed = lines.map(l => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < l.length; i++) {
          const ch = l[i];
          if (ch === '"') {
            inQuotes = !inQuotes;
          } else if (ch === ',' && !inQuotes) {
            result.push(current.trim().replace(/^"|"$/g, ''));
            current = '';
          } else {
            current += ch;
          }
        }
        result.push(current.trim().replace(/^"|"$/g, ''));
        return result;
      });

      const hdrs = parsed[0];
      setHeaders(hdrs);
      setRawRows(parsed.slice(1));

      // Auto-detect column mapping
      const autoMap: Record<string, string> = {};
      const lowerHeaders = hdrs.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
      const knownMap: Record<string, string> = {
        name: 'name', part: 'name', item: 'name', product: 'name', description: 'name',
        category: 'category', type: 'category', group: 'category',
        price: 'unitPrice', cost: 'unitPrice', 'unit price': 'unitPrice', amount: 'unitPrice',
        'unit type': 'unitType', unit: 'unitType', uom: 'unitType',
        sku: 'sku', 'part #': 'sku', 'part number': 'sku', 'item #': 'sku',
        supplier: 'supplier', vendor: 'supplier', brand: 'supplier',
      };
      for (let i = 0; i < hdrs.length; i++) {
        const key = lowerHeaders[i];
        if (knownMap[key]) {
          autoMap[knownMap[key]] = hdrs[i];
        }
      }
      setColumnMapping(prev => ({ ...prev, ...autoMap }));

      // Detect duplicates
      const existingNames = new Set(pricebook.map(p => p.name.toLowerCase()));
      const dups = parsed.slice(1)
        .map(row => row[0] || '')
        .filter(name => existingNames.has(name.toLowerCase()));
      setDuplicates(dups);

      setStep('mapping');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const downloadTemplate = () => {
    const template = 'Name,Category,Unit Price,Unit Type,SKU,Supplier\n"PVC Pipe 1/2" x 10ft",Pipe,4.99,each,PVC-12-10,"Ferguson Plumbing"\n"Copper Elbow 3/4"",Fitting,2.49,each,COP-34-EL,"SupplyHouse.com"\n"Teflon Tape",Sealant,2.99,each,TFL-TAPE,"Grainger"';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pricebook-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPreviewRows = () => {
    return rawRows.slice(0, 5);
  };

  const getMappedValue = (row: string[], field: string): string => {
    const headerName = columnMapping[field];
    if (!headerName) return '';
    const idx = headers.indexOf(headerName);
    return idx >= 0 ? row[idx] || '' : '';
  };

  const allRequiredMapped = () => {
    return requiredFields.every(f => columnMapping[f] && headers.includes(columnMapping[f]));
  };

  const handleImport = () => {
    if (!allRequiredMapped()) return;
    setImporting(true);
    setError(null);

    setTimeout(() => {
      try {
        const newItems: PricebookItem[] = [];
        const categories = [...new Set(rawRows.map(r => getMappedValue(r, 'category')).filter(Boolean))];

        rawRows.forEach((row, idx) => {
          const name = getMappedValue(row, 'name');
          const category = getMappedValue(row, 'category');
          const priceStr = getMappedValue(row, 'unitPrice');
          const unitType = getMappedValue(row, 'unitType') || 'each';

          if (!name || !category || !priceStr) return;

          const price = parseFloat(priceStr.replace('$', ''));
          if (isNaN(price)) return;

          const existingNames = new Set(pricebook.map(p => p.name.toLowerCase()));
          if (existingNames.has(name.toLowerCase())) return; // skip duplicates silently

          const nums = pricebook.filter((i: any) => !i.isRepairType).map((i: any) => parseInt(i.id.replace('PB-', ''), 10)).sort((a, b) => a - b);
          const nextNum = nums.length > 0 ? nums[nums.length - 1] + 1 + idx : 1 + idx;

          newItems.push({
            id: `PB-${String(nextNum).padStart(3, '0')}`,
            name,
            category,
            unitPrice: price,
            unitType,
            isRepairType: false,
          });
        });

        setImportCount(newItems.length);
        setStep('done');
        setImporting(false);

        setTimeout(() => {
          onImport(newItems);
        }, 800);
      } catch {
        setError('Failed to parse CSV data. Please check your file format.');
        setImporting(false);
      }
    }, 300);
  };

  return (
    <Modal
      open={open}
      onClose={step === 'importing' ? (() => {}) : onClose}
      title="Import CSV"
      description="Upload a CSV file to bulk-import items into your pricebook."
      size="lg"
    >
      <div className="space-y-4 min-h-[300px]">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              dragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 bg-slate-50/50'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
              <svg className="h-6 w-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-700">
              Drag & drop your CSV file here, or click to browse
            </p>
            <p className="text-xs text-slate-400 mt-1">.csv files only</p>
            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
              Browse Files
              <input
                type="file"
                accept=".csv"
                onChange={handleFilePick}
                className="hidden"
              />
            </label>
            <button
              onClick={downloadTemplate}
              className="mt-3 text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Download sample template
            </button>
          </div>
        )}

        {/* Step 2: Column Mapping */}
        {step === 'mapping' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Map Columns</h3>
              <p className="text-xs text-slate-500 mb-3">
                Map your CSV columns to pricebook fields. Fields marked with * are required.
              </p>

              <div className="space-y-2">
                {headers.map((header) => (
                  <div key={header} className="flex items-center gap-3 py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-sm font-medium text-slate-700 w-36 truncate">{header}</span>
                    <svg className="h-4 w-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <select
                      value={
                        Object.entries(columnMapping).find(([, v]) => v === header)?.[0] || ''
                      }
                      onChange={(e) => {
                        const field = e.target.value;
                        setColumnMapping(prev => {
                          const next = { ...prev };
                          // Unset any other mapping pointing to this header
                          for (const key of Object.keys(next)) {
                            if (next[key] === header) next[key] = '';
                          }
                          if (field && field !== '__ignore__') {
                            next[field] = header;
                          }
                          return next;
                        });
                      }}
                      className="flex-1 rounded-xl ring-1 ring-black/5 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                    >
                      <option value="">— Select mapping —</option>
                      {mappingOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview Table */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Preview (first 5 rows)</h3>
              <div className="overflow-x-auto rounded-xl ring-1 ring-black/5">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-3 py-2 text-left font-semibold text-slate-500">Name</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-500">Category</th>
                      <th className="px-3 py-2 text-right font-semibold text-slate-500">Price</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-500">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {getPreviewRows().map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-slate-700 truncate max-w-[180px]">
                          {getMappedValue(row, 'name') || '—'}
                        </td>
                        <td className="px-3 py-2 text-slate-500 truncate max-w-[120px]">
                          {getMappedValue(row, 'category') || '—'}
                        </td>
                        <td className="px-3 py-2 text-slate-700 text-right">
                          {getMappedValue(row, 'unitPrice') || '—'}
                        </td>
                        <td className="px-3 py-2 text-slate-500">
                          {getMappedValue(row, 'unitType') || getMappedValue(row, 'unitPrice') ? 'each' : '—'}
                        </td>
                      </tr>
                    ))}
                    {getPreviewRows().length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-4 text-center text-slate-400">
                          No data rows to preview
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Duplicates Warning */}
            {duplicates.length > 0 && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                <p className="text-xs font-medium text-amber-800">
                  {duplicates.length} item(s) already exist in pricebook (will be skipped):
                </p>
                <p className="text-xs text-amber-600 mt-1 truncate">
                  {duplicates.slice(0, 5).join(', ')}{duplicates.length > 5 ? ` and ${duplicates.length - 5} more` : ''}
                </p>
              </div>
            )}

            <p className="text-xs text-slate-400">
              {rawRows.length} rows found in CSV file
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button
                size="sm"
                onClick={handleImport}
                loading={importing}
                disabled={!allRequiredMapped()}
              >
                Import {rawRows.length} Items
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 'done' && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-900">Import Complete</h3>
            <p className="text-sm text-slate-500 mt-1">
              Successfully imported {importCount} item{importCount !== 1 ? 's' : ''} into your pricebook.
            </p>
            {duplicates.length > 0 && (
              <p className="text-xs text-amber-600 mt-1">
                {duplicates.length} duplicate{duplicates.length !== 1 ? 's' : ''} skipped
              </p>
            )}
            <Button size="sm" className="mt-4" onClick={onClose}>
              Done
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}