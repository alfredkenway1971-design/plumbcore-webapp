'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Card,
  Input,
  StatusBadge,
  EmptyState,
  ErrorState,
  Modal,
} from '@/pkg/ui-components';
import { inventory as mockInventory, jobs, getItemTransactions } from '@/lib/mock-data';
import type { InventoryItem } from '@/lib/mock-data';

type SortField = 'name' | 'sku' | 'category' | 'quantity' | 'minQuantity' | 'unitPrice';
type SortDir = 'asc' | 'desc';

const CATEGORIES = ['All', 'Pipe', 'Fitting', 'Valve', 'Fixture', 'Tool', 'Sealant', 'Heater', 'Pump'] as const;

interface NewPartForm {
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  supplierName: string;
  supplierContact: string;
  location: string;
  description: string;
}

interface Transaction {
  id: string;
  date: string;
  type: string;
  quantity: number;
  note: string;
}

const initialForm: NewPartForm = {
  name: '',
  sku: '',
  category: 'pipe',
  quantity: 0,
  minQuantity: 0,
  unitPrice: 0,
  supplierName: '',
  supplierContact: '',
  location: '',
  description: '',
};

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 animate-pulse">
      <div className="h-4 w-4 rounded bg-white/5" />
      <div className="h-4 w-40 rounded bg-white/5" />
      <div className="h-4 w-20 rounded bg-white/5" />
      <div className="h-4 w-16 rounded bg-white/5" />
      <div className="h-4 w-12 rounded bg-white/5" />
      <div className="h-4 w-12 rounded bg-white/5" />
      <div className="h-4 w-16 rounded bg-white/5" />
      <div className="h-5 w-20 rounded bg-white/5" />
    </div>
  );
}

export default function InventoryPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<NewPartForm>(initialForm);
  const [inventory, setInventory] = useState(mockInventory);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkQuantity, setBulkQuantity] = useState<number>(0);
  const [bulkPrice, setBulkPrice] = useState<number>(0);
  const [bulkMode, setBulkMode] = useState<'quantity' | 'price'>('quantity');

  // Transaction popover
  const [txnPopover, setTxnPopover] = useState<{ itemId: string; itemName: string; x: number; y: number } | null>(null);
  const [txnData, setTxnData] = useState<Transaction[]>([]);
  const [txnLoading, setTxnLoading] = useState(false);

  // Use in Job modal
  const [useJobModal, setUseJobModal] = useState<{ open: boolean; item: InventoryItem | null }>({ open: false, item: null });
  const [useJobQty, setUseJobQty] = useState(1);
  const [useJobId, setUseJobId] = useState('');

  // Low stock filter
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setLoading(false);
      } catch {
        setError('Failed to load inventory data.');
        setLoading(false);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      try {
        setLoading(false);
      } catch {
        setError('Failed to load inventory data.');
        setLoading(false);
      }
    }, 1000);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const lowStockCount = useMemo(() => inventory.filter((i) => i.quantity <= i.minQuantity).length, [inventory]);

  const filtered = useMemo(() => {
    let items = inventory.filter((item) => {
      if (category !== 'All' && item.category !== category.toLowerCase()) return false;
      if (lowStockOnly && item.quantity > item.minQuantity) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.supplier.toLowerCase().includes(q)
        );
      }
      return true;
    });

    items.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'sku': cmp = a.sku.localeCompare(b.sku); break;
        case 'category': cmp = a.category.localeCompare(b.category); break;
        case 'quantity': cmp = a.quantity - b.quantity; break;
        case 'minQuantity': cmp = a.minQuantity - b.minQuantity; break;
        case 'unitPrice': cmp = a.unitPrice - b.unitPrice; break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return items;
  }, [search, category, sortField, sortDir, inventory, lowStockOnly]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="ml-1 text-gray-500/40">↕</span>;
    }
    return <span className="ml-1 text-blue-600">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const categoryLabel = (cat: string) => cat.charAt(0).toUpperCase() + cat.slice(1);

  // Bulk selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((i) => i.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Transaction popover
  const handleQtyClick = (e: React.MouseEvent, item: InventoryItem) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTxnPopover({ itemId: item.id, itemName: item.name, x: rect.left, y: rect.bottom + 8 });
    setTxnLoading(true);
    setTimeout(() => {
      setTxnData(getItemTransactions(item.id));
      setTxnLoading(false);
    }, 400);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Part Name', 'SKU', 'Category', 'Quantity', 'Min Stock', 'Unit Price', 'Supplier', 'Location'];
    const rows = inventory.map((i) => [
      i.name, i.sku, i.category, i.quantity, i.minQuantity, i.unitPrice, i.supplier, i.location,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Inventory exported to CSV!');
  };

  // Bulk update
  const handleBulkUpdate = () => {
    setInventory((prev) =>
      prev.map((item) => {
        if (!selectedIds.has(item.id)) return item;
        if (bulkMode === 'quantity') return { ...item, quantity: bulkQuantity };
        return { ...item, unitPrice: bulkPrice };
      })
    );
    setBulkModalOpen(false);
    setSelectedIds(new Set());
    showToast(`Bulk updated ${selectedIds.size} items!`);
  };

  // Use in Job
  const handleUseInJob = () => {
    if (!useJobModal.item || !useJobId || useJobQty <= 0) return;
    const item = useJobModal.item;
    if (useJobQty > item.quantity) {
      showToast(`Not enough stock! Only ${item.quantity} available.`, 'error');
      return;
    }
    setInventory((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity - useJobQty } : i
      )
    );
    const job = jobs.find((j) => j.id === useJobId);
    showToast(`Used ${useJobQty}x ${item.name} on ${job?.title || 'job'}`);
    setUseJobModal({ open: false, item: null });
    setUseJobQty(1);
    setUseJobId('');
  };

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <Card variant="bordered" padding="lg">
          <ErrorState
            title="Failed to load inventory"
            message={error}
            onRetry={handleRetry}
          />
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="h-10 w-64 animate-pulse rounded-lg bg-white/5" />
          <div className="flex gap-2">
            {CATEGORIES.slice(0, 5).map((_, i) => (
              <div key={i} className="h-8 w-16 animate-pulse rounded-full bg-white/5" />
            ))}
          </div>
        </div>
        <Card variant="bordered" padding="sm">
          <div className="space-y-0">
            <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-2.5">
              <div className="h-3 w-4 rounded bg-white/5" />
              <div className="h-3 w-40 rounded bg-white/5" />
              <div className="h-3 w-20 rounded bg-white/5" />
              <div className="h-3 w-16 rounded bg-white/5" />
              <div className="h-3 w-12 rounded bg-white/5" />
              <div className="h-3 w-12 rounded bg-white/5" />
              <div className="h-3 w-16 rounded bg-white/5" />
              <div className="h-3 w-20 rounded bg-white/5" />
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[100] rounded-xl px-4 py-3 shadow-lg text-sm font-medium transition-all animate-in slide-in-from-right ${
            toast.type === 'success'
              ? 'bg-green-500/20 text-green-600 border border-status-success/30'
              : 'bg-red-500/20 text-red-600 border border-status-error/30'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Inventory
          </Button>
          <Button onClick={() => setModalOpen(true)}>+ Add Part</Button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <Card
          variant="bordered"
          padding="md"
          className={`border-l-4 ${lowStockCount >= 5 ? 'border-l-status-error' : 'border-l-amber-400'}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                lowStockCount >= 5 ? 'bg-red-50' : 'bg-amber-400/10'
              }`}>
                <svg className={`h-5 w-5 ${lowStockCount >= 5 ? 'text-red-600' : 'text-amber-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className={`text-sm font-semibold ${lowStockCount >= 5 ? 'text-red-600' : 'text-amber-400'}`}>
                  {lowStockCount} item{lowStockCount > 1 ? 's' : ''} low in stock
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {lowStockCount >= 5
                    ? 'Multiple items are below their minimum stock levels. Reorder soon.'
                    : 'Some items are running low. Review and reorder.'}
                </p>
              </div>
            </div>
            <Button size="sm" variant={lowStockCount >= 5 ? 'destructive' : 'outline'} onClick={() => setLowStockOnly(!lowStockOnly)}>
              {lowStockOnly ? 'Show All' : 'View Low Stock'}
            </Button>
          </div>
        </Card>
      )}

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search by name, SKU, or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                category === cat
                  ? 'bg-electric text-[#0a0e2a]'
                  : 'bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-electric/20 bg-electric/[0.04] px-4 py-2.5">
          <p className="text-sm text-gray-400">
            <span className="font-semibold text-gray-900">{selectedIds.size}</span> item{selectedIds.size > 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setSelectedIds(new Set())}>
              Clear
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setBulkMode('quantity');
                setBulkQuantity(0);
                setBulkPrice(0);
                setBulkModalOpen(true);
              }}
            >
              Bulk Update
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <Card variant="bordered" padding="lg">
          <EmptyState
            title={lowStockOnly ? 'No low stock items' : 'No inventory items yet'}
            description={lowStockOnly ? 'All items are above their minimum stock levels.' : 'Add your first part to get started.'}
            action={
              lowStockOnly ? (
                <Button size="sm" onClick={() => setLowStockOnly(false)}>Show All Items</Button>
              ) : (
                <Button size="sm" onClick={() => setModalOpen(true)}>+ Add Part</Button>
              )
            }
          />
        </Card>
      ) : (
        <Card variant="bordered" padding="sm" className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-3 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-white/20 bg-white/5 text-blue-600 focus:ring-electric/30"
                  />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer select-none hover:text-gray-900"
                  onClick={() => handleSort('name')}
                >
                  Part Name <SortIcon field="name" />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer select-none hover:text-gray-900"
                  onClick={() => handleSort('sku')}
                >
                  SKU <SortIcon field="sku" />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer select-none hover:text-gray-900"
                  onClick={() => handleSort('category')}
                >
                  Category <SortIcon field="category" />
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer select-none hover:text-gray-900"
                  onClick={() => handleSort('quantity')}
                >
                  In Stock <SortIcon field="quantity" />
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer select-none hover:text-gray-900"
                  onClick={() => handleSort('minQuantity')}
                >
                  Min Stock <SortIcon field="minQuantity" />
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer select-none hover:text-gray-900"
                  onClick={() => handleSort('unitPrice')}
                >
                  Unit Price <SortIcon field="unitPrice" />
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const isLowStock = item.quantity <= item.minQuantity;
                return (
                  <tr
                    key={item.id}
                    className={`border-b border-gray-200 transition-colors hover:bg-white/[0.02] ${
                      isLowStock ? 'border-l-2 border-l-status-error' : ''
                    } ${selectedIds.has(item.id) ? 'bg-electric/[0.03]' : ''}`}
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="rounded border-white/20 bg-white/5 text-blue-600 focus:ring-electric/30"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{item.sku}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-gray-400">
                        {categoryLabel(item.category)}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-semibold cursor-pointer hover:underline ${
                        isLowStock ? 'text-red-600' : 'text-gray-900'
                      }`}
                      onClick={(e) => handleQtyClick(e, item)}
                    >
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">{item.minQuantity}</td>
                    <td className="px-4 py-3 text-right text-gray-900 font-medium">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-red-600 border border-status-error/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-green-600 border border-status-success/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          setUseJobModal({ open: true, item });
                          setUseJobQty(1);
                          setUseJobId('');
                        }}
                        className="rounded-lg bg-white/5 px-2.5 py-1 text-[10px] font-medium text-gray-400 hover:bg-white/10 hover:text-gray-900 transition-colors"
                      >
                        Use in Job
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Transaction Popover */}
      {txnPopover && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setTxnPopover(null)} />
          <div
            className="fixed z-50 w-80 rounded-xl border border-gray-200 bg-white shadow-2xl shadow-black/40 p-3 animate-in fade-in zoom-in-95"
            style={{ left: Math.min(txnPopover.x, window.innerWidth - 320), top: txnPopover.y }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-900">Transaction History</p>
              <p className="text-[10px] text-gray-500">{txnPopover.itemName}</p>
            </div>
            {txnLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-8 rounded-lg bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : txnData.length === 0 ? (
              <p className="text-xs text-gray-500 py-2 text-center">No recent transactions</p>
            ) : (
              <div className="space-y-1">
                {txnData.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-2.5 py-1.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold uppercase ${
                          txn.type === 'Received' ? 'text-green-600' :
                          txn.type === 'Used' ? 'text-red-600' : 'text-amber-400'
                        }`}>
                          {txn.type}
                        </span>
                        <span className="text-[10px] text-gray-500">{txn.date}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">{txn.note}</p>
                    </div>
                    <span className={`text-xs font-semibold ml-2 ${
                      txn.quantity > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {txn.quantity > 0 ? `+${txn.quantity}` : txn.quantity}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[9px] text-gray-400/60 text-center mt-2">Last 5 transactions</p>
          </div>
        </>
      )}

      {/* Add Part Modal — Inline */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => { setModalOpen(false); setForm(initialForm); }}
          />

          {/* Modal panel */}
          <div className="relative w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Add New Part</h2>
              <button
                onClick={() => { setModalOpen(false); setForm(initialForm); }}
                className="rounded-lg p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Part Name</label>
                <input
                  placeholder="e.g. 1/2 in Brass Fitting"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-900 placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">SKU</label>
                <input
                  placeholder="e.g. BRZ-12-FIT"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-900 placeholder-gray-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-400">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-900"
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Quantity</label>
                  <input
                    type="number"
                    min={0}
                    value={form.quantity || ''}
                    onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Min Stock</label>
                  <input
                    type="number"
                    min={0}
                    value={form.minQuantity || ''}
                    onChange={(e) => setForm({ ...form, minQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Unit Price ($)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.unitPrice || ''}
                    onChange={(e) => setForm({ ...form, unitPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-900"
                  />
                </div>
              </div>
              {/* Supplier Fields */}
              <div className="border-t border-slate-200 pt-4">
                <p className="text-sm font-semibold text-gray-900 mb-3">Supplier Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Supplier Name</label>
                    <input
                      placeholder="e.g. SupplyHouse.com"
                      value={form.supplierName}
                      onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
                      className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-900 placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Supplier Contact</label>
                    <input
                      placeholder="e.g. (800) 555-0100"
                      value={form.supplierContact}
                      onChange={(e) => setForm({ ...form, supplierContact: e.target.value })}
                      className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Location / Bay</label>
                  <input
                    placeholder="e.g. Bay A-1"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-900 placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
                  <input
                    placeholder="Brief description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Sticky footer */}
            <div className="sticky bottom-0 border-t border-slate-200 bg-white px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => { setModalOpen(false); setForm(initialForm); }}
                className="h-10 px-5 text-sm font-medium text-gray-600 bg-white border border-slate-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const newItem: InventoryItem = {
                    id: `INV-ITM-${String(inventory.length + 1).padStart(3, '0')}`,
                    name: form.name,
                    sku: form.sku || `SKU-${Date.now()}`,
                    category: form.category as any,
                    quantity: form.quantity,
                    minQuantity: form.minQuantity,
                    unitPrice: form.unitPrice,
                    supplier: form.supplierName || 'Unknown',
                    location: form.location || 'Unassigned',
                    description: form.description || form.name,
                  };
                  setInventory((prev) => [...prev, newItem]);
                  setModalOpen(false);
                  setForm(initialForm);
                  showToast(`Part "${form.name}" added to inventory!`);
                }}
                className="h-10 px-5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Add Part
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Update Modal */}
      <Modal
        open={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        title={`Bulk Update ${selectedIds.size} Items`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setBulkModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpdate}>
              Update {selectedIds.size} Items
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setBulkMode('quantity')}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                bulkMode === 'quantity' ? 'bg-electric text-[#0a0e2a]' : 'bg-gray-50 text-gray-400 hover:text-gray-900'
              }`}
            >
              Update Quantity
            </button>
            <button
              onClick={() => setBulkMode('price')}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                bulkMode === 'price' ? 'bg-electric text-[#0a0e2a]' : 'bg-gray-50 text-gray-400 hover:text-gray-900'
              }`}
            >
              Update Price
            </button>
          </div>
          {bulkMode === 'quantity' ? (
            <Input
              label="New Quantity"
              type="number"
              min={0}
              value={bulkQuantity || ''}
              onChange={(e) => setBulkQuantity(parseInt(e.target.value) || 0)}
            />
          ) : (
            <Input
              label="New Unit Price ($)"
              type="number"
              min={0}
              step="0.01"
              value={bulkPrice || ''}
              onChange={(e) => setBulkPrice(parseFloat(e.target.value) || 0)}
            />
          )}
          <p className="text-xs text-gray-500">
            This will update all {selectedIds.size} selected items.
          </p>
        </div>
      </Modal>

      {/* Use in Job Modal */}
      <Modal
        open={useJobModal.open}
        onClose={() => { setUseJobModal({ open: false, item: null }); setUseJobQty(1); setUseJobId(''); }}
        title={`Use in Job: ${useJobModal.item?.name || ''}`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setUseJobModal({ open: false, item: null }); setUseJobQty(1); setUseJobId(''); }}>
              Cancel
            </Button>
            <Button onClick={handleUseInJob} disabled={!useJobId || useJobQty <= 0 || !!(useJobModal.item && useJobQty > useJobModal.item.quantity)}>
              Deduct from Stock
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-white/[0.02] p-3">
            <div>
              <p className="text-xs text-gray-400">Available Stock</p>
              <p className="text-lg font-bold text-gray-900">{useJobModal.item?.quantity || 0}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Unit Price</p>
              <p className="text-lg font-bold text-gray-900">${useJobModal.item?.unitPrice.toFixed(2) || '0.00'}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-400">Select Job</label>
            <select
              className="w-full rounded-lg border border-white/10 bg-whiteer px-4 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-electric/50 focus:ring-1 focus:ring-electric/20"
              value={useJobId}
              onChange={(e) => setUseJobId(e.target.value)}
            >
              <option value="">Select a job...</option>
              {jobs.filter((j) => j.status === 'in-progress' || j.status === 'scheduled').map((job) => (
                <option key={job.id} value={job.id}>{job.title} - {job.clientName}</option>
              ))}
            </select>
          </div>

          <Input
            label="Quantity to Use"
            type="number"
            min={1}
            max={useJobModal.item?.quantity || 0}
            value={useJobQty || ''}
            onChange={(e) => setUseJobQty(parseInt(e.target.value) || 1)}
          />

          {useJobId && useJobQty > 0 && useJobModal.item && (
            <div className="rounded-lg bg-electric/[0.04] border border-electric/10 p-3">
              <p className="text-xs text-gray-400">
                Total deduction value: <span className="font-semibold text-gray-900">${(useJobQty * useJobModal.item.unitPrice).toFixed(2)}</span>
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}