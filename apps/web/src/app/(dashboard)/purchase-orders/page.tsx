'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Card,
  Input,
  EmptyState,
  ErrorState,
  Modal,
} from '@/pkg/ui-components';
import { purchaseOrders as mockPOs, inventory, suppliers } from '@/lib/mock-data';
import type { POStatus } from '@/lib/mock-data';

interface POItemForm {
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
}

interface CreatePOForm {
  supplierId: string;
  items: POItemForm[];
  expectedDelivery: string;
  notes: string;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3 animate-pulse">
      <div className="h-4 w-24 rounded bg-muted" />
      <div className="h-4 w-36 rounded bg-muted" />
      <div className="h-4 w-12 rounded bg-muted" />
      <div className="h-4 w-16 rounded bg-muted" />
      <div className="h-4 w-20 rounded bg-muted" />
      <div className="h-4 w-24 rounded bg-muted" />
      <div className="h-5 w-16 rounded bg-muted" />
    </div>
  );
}

const STATUS_COLORS: Record<POStatus, string> = {
  Draft: 'bg-muted text-muted-foreground border border-border',
  Sent: 'bg-blue-tint text-primary border border-primary/20',
  Received: 'bg-green-50 text-green-600 border border-green-200',
  Cancelled: 'bg-red-50 text-red-600 border border-red-200',
};

export default function PurchaseOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<POStatus | 'All'>('All');
  const [pos, setPos] = useState(mockPOs);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailPO, setDetailPO] = useState<string | null>(null);
  const [form, setForm] = useState<CreatePOForm>({
    supplierId: '',
    items: [],
    expectedDelivery: '',
    notes: '',
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setLoading(false);
      } catch {
        setError('Failed to load purchase orders.');
        setLoading(false);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => setLoading(false), 1000);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => {
    return pos.filter((po) => {
      if (statusFilter !== 'All' && po.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          po.poNumber.toLowerCase().includes(q) ||
          po.supplierName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, statusFilter, pos]);

  const selectedSupplier = suppliers.find((s) => s.id === form.supplierId);
  const supplierInventory = useMemo(() => {
    if (!selectedSupplier) return [];
    const catLower = selectedSupplier.categories.map((c: string) => c.toLowerCase());
    return inventory.filter((item) => catLower.includes(item.category));
  }, [form.supplierId]);

  const addItemToForm = (itemId: string) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;
    if (form.items.some((i) => i.itemId === itemId)) return;
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { itemId: item.id, itemName: item.name, quantity: 1, unitPrice: item.unitPrice }],
    }));
  };

  const updateFormItem = (itemId: string, field: 'quantity' | 'unitPrice', value: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.itemId === itemId ? { ...i, [field]: value } : i)),
    }));
  };

  const removeFormItem = (itemId: string) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.itemId !== itemId),
    }));
  };

  const formTotal = form.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  const handleCreatePO = () => {
    const supplier = suppliers.find((s) => s.id === form.supplierId);
    if (!supplier) return;
    const poItems = form.items.map((i) => ({
      itemId: i.itemId,
      itemName: i.itemName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      total: i.quantity * i.unitPrice,
    }));
    const newPO = {
      id: `PO-${String(pos.length + 1).padStart(3, '0')}`,
      poNumber: `PO-2024-${String(pos.length + 1).padStart(3, '0')}`,
      supplierId: form.supplierId,
      supplierName: supplier.name,
      items: poItems,
      itemsCount: poItems.length,
      total: formTotal,
      status: 'Draft' as POStatus,
      expectedDelivery: form.expectedDelivery,
      notes: form.notes,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPos((prev) => [newPO, ...prev]);
    setModalOpen(false);
    setForm({ supplierId: '', items: [], expectedDelivery: '', notes: '' });
    showToast(`Purchase Order ${newPO.poNumber} created!`);
  };

  const updatePOStatus = (id: string, newStatus: POStatus) => {
    setPos((prev) =>
      prev.map((po) => {
        if (po.id !== id) return po;
        const updates: Partial<typeof po> = { status: newStatus };
        if (newStatus === 'Sent') updates.sentDate = new Date().toISOString().split('T')[0];
        if (newStatus === 'Received') updates.receivedDate = new Date().toISOString().split('T')[0];
        if (newStatus === 'Cancelled') updates.cancelledDate = new Date().toISOString().split('T')[0];
        return { ...po, ...updates };
      })
    );
    showToast(`PO status updated to "${newStatus}"`);
  };

  const handleDeletePO = (id: string) => {
    const po = pos.find((p) => p.id === id);
    setPos((prev) => prev.filter((p) => p.id !== id));
    if (po) showToast(`PO ${po.poNumber} deleted.`, 'error');
  };

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Purchase Orders</h1>
        <Card variant="bordered" padding="lg">
          <ErrorState title="Failed to load purchase orders" message={error} onRetry={handleRetry} />
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Purchase Orders</h1>
        <div className="flex gap-2">
          {['All', 'Draft', 'Sent', 'Received', 'Cancelled'].map((s) => (
            <div key={s} className="h-8 w-20 animate-pulse rounded-full bg-muted" />
          ))}
        </div>
        <Card variant="bordered" padding="sm">
          <div className="space-y-0">
            <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="h-3 w-36 rounded bg-muted" />
              <div className="h-3 w-12 rounded bg-muted" />
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="h-3 w-20 rounded bg-muted" />
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="h-3 w-16 rounded bg-muted" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // Detail view
  if (detailPO) {
    const po = pos.find((p) => p.id === detailPO);
    if (!po) {
      return (
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => setDetailPO(null)}>← Back to Purchase Orders</Button>
          <Card variant="bordered" padding="lg">
            <ErrorState title="Purchase order not found" message="This PO may have been deleted." onRetry={() => setDetailPO(null)} />
          </Card>
        </div>
      );
    }

    const supplier = suppliers.find((s) => s.id === po.supplierId);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setDetailPO(null)}>← Back</Button>
            <h1 className="text-2xl font-bold text-foreground">{po.poNumber}</h1>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_COLORS[po.status as POStatus]}`}>{po.status}</span>
          </div>
          <div className="flex gap-2">
            {po.status === 'Draft' && (
              <>
                <Button size="sm" variant="outline" onClick={() => updatePOStatus(po.id, 'Sent')}>Mark as Sent</Button>
                <Button size="sm" variant="destructive" onClick={() => updatePOStatus(po.id, 'Cancelled')}>Cancel PO</Button>
              </>
            )}
            {po.status === 'Sent' && (
              <Button size="sm" onClick={() => updatePOStatus(po.id, 'Received')}>Mark as Received</Button>
            )}
          </div>
        </div>

        {/* Supplier Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="bordered" padding="md">
            <h3 className="text-sm font-semibold text-foreground mb-2">Supplier Information</h3>
            <div className="space-y-1.5 text-sm">
              <p className="text-muted-foreground/80">{po.supplierName}</p>
              {supplier && (
                <>
                  <p className="text-muted-foreground">{supplier.contactPerson}</p>
                  <p className="text-muted-foreground">{supplier.phone}</p>
                  <p className="text-muted-foreground">{supplier.email}</p>
                  <p className="text-muted-foreground text-xs">{supplier.address}</p>
                </>
              )}
            </div>
          </Card>
          <Card variant="bordered" padding="md">
            <h3 className="text-sm font-semibold text-foreground mb-2">Order Details</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Created:</span><span className="text-foreground">{po.createdAt}</span></div>
              {po.sentDate && <div className="flex justify-between"><span className="text-muted-foreground">Sent:</span><span className="text-foreground">{po.sentDate}</span></div>}
              {po.receivedDate && <div className="flex justify-between"><span className="text-muted-foreground">Received:</span><span className="text-foreground">{po.receivedDate}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Expected Delivery:</span><span className="text-foreground">{po.expectedDelivery}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Items:</span><span className="text-foreground">{po.itemsCount}</span></div>
              <div className="flex justify-between border-t border-border pt-2 mt-2"><span className="text-muted-foreground font-semibold">Total:</span><span className="text-foreground font-bold">${po.total.toFixed(2)}</span></div>
            </div>
          </Card>
        </div>

        {/* Status Timeline */}
        <Card variant="bordered" padding="md">
          <h3 className="text-sm font-semibold text-foreground mb-3">Status Timeline</h3>
          <div className="flex items-center gap-0">
            {[['Draft', po.createdAt], ['Sent', po.sentDate], ['Received', po.receivedDate], ['Cancelled', po.cancelledDate]].map(([status, date], idx, arr) => {
              const isActive = !!date;
              const isCurrent = po.status === status;
              return (
                <div key={String(status)} className={`flex items-center ${idx < arr.length - 1 ? 'flex-1' : ''}`}>
                  <div className="flex flex-col items-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      isCurrent ? 'bg-primary text-white' : isActive ? 'bg-green-50 text-green-600' : 'bg-muted text-muted-foreground'
                    }`}>
                      {isActive ? '✓' : idx + 1}
                    </div>
                    <span className="mt-1 text-[10px] font-medium text-muted-foreground">{String(status)}</span>
                    {date && <span className="text-[9px] text-muted-foreground/80/60">{date}</span>}
                  </div>
                  {idx < arr.length - 1 && (
                    <div className={`h-px flex-1 mx-2 mt-[-1.5rem] ${isActive ? 'bg-green-500/30' : 'bg-muted'}`} />
                  )}
                </div>
              );
            })}
          </div>
          {po.notes && (
            <div className="mt-4 rounded-xl bg-muted p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Notes:</p>
              <p className="text-sm text-muted-foreground">{po.notes}</p>
            </div>
          )}
        </Card>

        {/* Items Table */}
        <Card variant="bordered" padding="sm" className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Item</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quantity</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unit Price</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {po.items.map((item: any) => (
                <tr key={item.itemId} className="border-b border-border">
                  <td className="px-4 py-3 text-foreground font-medium">{item.itemName}</td>
                  <td className="px-4 py-3 text-right text-foreground">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-foreground">${item.unitPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-foreground font-medium">${item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground/80">Total</td>
                <td className="px-4 py-3 text-right text-sm font-bold text-foreground">${po.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
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
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">Purchase Orders</h1>
        <Button onClick={() => setModalOpen(true)}>+ Create PO</Button>
      </div>

      {/* Search + Status Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search by PO# or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['All', 'Draft', 'Sent', 'Received', 'Cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s as POStatus | 'All')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                statusFilter === s
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground/80 hover:text-foreground hover:bg-muted'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* PO List */}
      {filtered.length === 0 ? (
        <Card variant="bordered" padding="lg">
          <EmptyState
            title="No purchase orders found"
            description={search || statusFilter !== 'All' ? 'Try adjusting your search or filters.' : 'Create your first purchase order to get started.'}
            action={!search && statusFilter === 'All' ? (
              <Button size="sm" onClick={() => setModalOpen(true)}>+ Create PO</Button>
            ) : undefined}
          />
        </Card>
      ) : (
        <Card variant="bordered" padding="sm" className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">PO#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Supplier</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Items</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((po) => (
                <tr
                  key={po.id}
                  className="border-b border-border transition-colors hover:bg-muted cursor-pointer"
                  onClick={() => setDetailPO(po.id)}
                >
                  <td className="px-4 py-3 text-foreground font-mono text-xs font-medium">{po.poNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground/80">{po.supplierName}</td>
                  <td className="px-4 py-3 text-right text-foreground">{po.itemsCount}</td>
                  <td className="px-4 py-3 text-right text-foreground font-medium">${po.total.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_COLORS[po.status as POStatus]}`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{po.createdAt}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {po.status === 'Draft' && (
                        <>
                          <button
                            onClick={() => updatePOStatus(po.id, 'Sent')}
                            className="rounded-xl px-2 py-1 text-[10px] font-medium text-primary hover:bg-blue-tint transition-colors"
                          >
                            Send
                          </button>
                          <button
                            onClick={() => handleDeletePO(po.id)}
                            className="rounded-xl px-2 py-1 text-[10px] font-medium text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {po.status === 'Sent' && (
                        <button
                          onClick={() => updatePOStatus(po.id, 'Received')}
                          className="rounded-xl px-2 py-1 text-[10px] font-medium text-green-600 hover:bg-green-50 transition-colors"
                        >
                          Receive
                        </button>
                      )}
                      {po.status === 'Received' && (
                        <span className="text-[10px] text-muted-foreground">Complete</span>
                      )}
                      {po.status === 'Cancelled' && (
                        <span className="text-[10px] text-red-600">Cancelled</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Create PO Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setForm({ supplierId: '', items: [], expectedDelivery: '', notes: '' }); }}
        title="Create Purchase Order"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setModalOpen(false); setForm({ supplierId: '', items: [], expectedDelivery: '', notes: '' }); }}>
              Cancel
            </Button>
            <Button onClick={handleCreatePO} disabled={!form.supplierId || form.items.length === 0}>
              Create Purchase Order
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Supplier Selection */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground mb-1">Supplier</label>
            <select
              className="w-full h-11 px-4 bg-white border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 appearance-none transition-all"
              value={form.supplierId}
              onChange={(e) => {
                setForm({ ...form, supplierId: e.target.value, items: [] });
              }}
            >
              <option value="">Select a supplier...</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Items Selection */}
          {form.supplierId && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground mb-1">Items</label>
              <select
                className="w-full h-11 px-4 bg-white border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 appearance-none transition-all"
                value=""
                onChange={(e) => { addItemToForm(e.target.value); e.target.value = ''; }}
              >
                <option value="">Add an item...</option>
                {supplierInventory.map((item: any) => (
                  <option key={item.id} value={item.id} disabled={form.items.some((i) => i.itemId === item.id)}>
                    {item.name} (${item.unitPrice.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Items Table */}
          {form.items.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Item</th>
                    <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Qty</th>
                    <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Unit Price</th>
                    <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
                    <th className="px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((item: any) => (
                    <tr key={item.itemId} className="border-b border-border">
                      <td className="px-3 py-2 text-foreground text-xs">{item.itemName}</td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateFormItem(item.itemId, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-16 h-9 px-3 bg-white border border-border rounded-xl text-xs text-foreground text-right outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateFormItem(item.itemId, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-20 h-9 px-3 bg-white border border-border rounded-xl text-xs text-foreground text-right outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </td>
                      <td className="px-3 py-2 text-right text-foreground text-xs font-medium">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => removeFormItem(item.itemId)}
                          className="text-red-600 hover:bg-red-50 rounded p-0.5 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground/80">Total</td>
                    <td className="px-3 py-2 text-right text-xs font-bold text-foreground">${formTotal.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Expected Delivery */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground mb-1">Expected Delivery Date</label>
            <input
              type="date"
              value={form.expectedDelivery}
              onChange={(e) => setForm({ ...form, expectedDelivery: e.target.value })}
              className="w-full h-11 px-4 bg-white border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
            <textarea
              placeholder="Optional notes for this purchase order..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/80 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              rows={2}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}