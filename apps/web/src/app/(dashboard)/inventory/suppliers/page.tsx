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
import { suppliers as mockSuppliers } from '@/lib/mock-data';

interface SupplierForm {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  categories: string[];
}

const ALL_CATEGORIES = ['Pipe', 'Fitting', 'Valve', 'Fixture', 'Tool', 'Sealant', 'Heater', 'Pump'];

const initialForm: SupplierForm = {
  name: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  categories: [],
};

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 animate-pulse">
      <div className="h-4 w-48 rounded bg-white/5" />
      <div className="h-4 w-32 rounded bg-white/5" />
      <div className="h-4 w-28 rounded bg-white/5" />
      <div className="h-4 w-36 rounded bg-white/5" />
      <div className="h-4 w-40 rounded bg-white/5" />
      <div className="h-5 w-16 rounded bg-white/5" />
    </div>
  );
}

export default function SuppliersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<SupplierForm>(initialForm);
  const [suppliers, setSuppliers] = useState(mockSuppliers);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setLoading(false);
      } catch {
        setError('Failed to load supplier data.');
        setLoading(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => setLoading(false), 800);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => {
    return suppliers.filter((s) => {
      if (categoryFilter !== 'All' && !s.categories.includes(categoryFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.contactPerson.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.phone.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, categoryFilter, suppliers]);

  const toggleCategory = (cat: string) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const handleAddSupplier = () => {
    const newSupplier = {
      id: `SUP-${String(suppliers.length + 1).padStart(3, '0')}`,
      ...form,
    };
    setSuppliers((prev) => [...prev, newSupplier]);
    setModalOpen(false);
    setForm(initialForm);
    showToast(`Supplier "${form.name}" added successfully!`);
  };

  const handleDeleteSupplier = (id: string) => {
    const s = suppliers.find((s) => s.id === id);
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    if (s) showToast(`Supplier "${s.name}" removed.`, 'error');
  };

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Supplier Directory</h1>
        <Card variant="bordered" padding="lg">
          <ErrorState title="Failed to load suppliers" message={error} onRetry={handleRetry} />
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Supplier Directory</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="h-10 w-64 animate-pulse rounded-lg bg-white/5" />
        </div>
        <Card variant="bordered" padding="sm">
          <div className="space-y-0">
            <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-2.5">
              <div className="h-3 w-48 rounded bg-white/5" />
              <div className="h-3 w-32 rounded bg-white/5" />
              <div className="h-3 w-28 rounded bg-white/5" />
              <div className="h-3 w-36 rounded bg-white/5" />
              <div className="h-3 w-40 rounded bg-white/5" />
              <div className="h-3 w-16 rounded bg-white/5" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
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
        <h1 className="text-2xl font-bold text-gray-900">Supplier Directory</h1>
        <Button onClick={() => setModalOpen(true)}>+ Add Supplier</Button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search by name, contact, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['All', ...ALL_CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                categoryFilter === cat
                  ? 'bg-electric text-[#0a0e2a]'
                  : 'bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card variant="bordered" padding="lg">
          <EmptyState
            title="No suppliers found"
            description={search || categoryFilter !== 'All' ? 'Try adjusting your search or filters.' : 'Add your first supplier to get started.'}
            action={!search && categoryFilter === 'All' ? (
              <Button size="sm" onClick={() => setModalOpen(true)}>+ Add Supplier</Button>
            ) : undefined}
          />
        </Card>
      ) : (
        <Card variant="bordered" padding="sm" className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Supplier Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Contact Person</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Categories Supplied</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((supplier) => (
                <tr
                  key={supplier.id}
                  className="border-b border-gray-200 transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3 text-gray-900 font-medium">{supplier.name}</td>
                  <td className="px-4 py-3 text-gray-400">{supplier.contactPerson}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{supplier.phone}</td>
                  <td className="px-4 py-3 text-gray-400">{supplier.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {supplier.categories.map((cat) => (
                        <span
                          key={cat}
                          className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-gray-400"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDeleteSupplier(supplier.id)}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Add Supplier Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setForm(initialForm); }}
        title="Add New Supplier"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setModalOpen(false); setForm(initialForm); }}>
              Cancel
            </Button>
            <Button onClick={handleAddSupplier} disabled={!form.name || !form.contactPerson}>
              Add Supplier
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Company Name"
            placeholder="e.g. Plumbing Supply Co"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Contact Person"
            placeholder="e.g. John Smith"
            value={form.contactPerson}
            onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone"
              placeholder="e.g. (800) 555-0100"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              label="Email"
              placeholder="e.g. contact@supplier.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <Input
            label="Address"
            placeholder="e.g. 200 Commerce Way, Chicago, IL"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-400">Categories Supplied</label>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    form.categories.includes(cat)
                      ? 'bg-electric text-[#0a0e2a]'
                      : 'bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}