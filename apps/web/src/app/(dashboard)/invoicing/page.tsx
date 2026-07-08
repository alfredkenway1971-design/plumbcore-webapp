'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  Input,
  StatusBadge,
  Modal,
  EmptyState,
  ErrorState,
} from '@/pkg/ui-components';
import { invoices, jobs, clients } from '@/lib/mock-data';
import type { Invoice, Job } from '@/lib/mock-data';
import { generateInvoice, formatCurrency, generateInvoiceNumber, calculateDueDate } from '@/lib/invoice-engine';
import { pricebook, partsList, repairTypesList } from '@/lib/pricebook-data';
import AddressAutocomplete from '@/components/AddressAutocomplete';

/* ── Helpers ── */
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const invoiceStatusStyles: Record<string, { badge: string; color: string }> = {
  draft: { badge: 'draft', color: '#6b7280' },
  sent: { badge: 'sent', color: '#3b82f6' },
  paid: { badge: 'paid', color: '#10b981' },
  overdue: { badge: 'overdue', color: '#ef4444' },
  cancelled: { badge: 'cancelled', color: '#4b5563' },
};

const filterTabs = ['All', 'Draft', 'Sent', 'Paid', 'Overdue'] as const;

/* ── Skeleton ── */
function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 animate-pulse">
      <div className="h-4 w-24 rounded bg-gray-50" />
      <div className="h-4 w-32 rounded bg-gray-50" />
      <div className="h-4 w-16 rounded bg-gray-50" />
      <div className="h-5 w-20 rounded-full bg-gray-50" />
      <div className="h-4 w-24 rounded bg-gray-50" />
      <div className="h-4 w-24 rounded bg-gray-50" />
      <div className="h-4 w-20 rounded bg-gray-50" />
    </div>
  );
}

/* ── Create Invoice Modal State ── */
interface CreateInvoiceForm {
  selectedJobId: string;
  lineItems: { description: string; quantity: number; unitPrice: number; total: number }[];
  taxRate: number;
  serviceFeePercent: number;
}

/* ── Main Page ── */
export default function InvoicingPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('All');

  // Create invoice modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState<CreateInvoiceForm>({
    selectedJobId: '',
    lineItems: [],
    taxRate: 8,
    serviceFeePercent: 0,
  });
  const [generating, setGenerating] = useState(false);

  // Export dropdown
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => setLoading(false), 350);
  };

  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    // Tab filter
    if (activeTab !== 'All') {
      const status = activeTab.toLowerCase() as Invoice['status'];
      result = result.filter((inv) => inv.status === status);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.id.toLowerCase().includes(q) ||
          inv.clientName.toLowerCase().includes(q) ||
          inv.jobTitle.toLowerCase().includes(q)
      );
    }

    // Sort by issueDate descending
    result.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());

    return result;
  }, [search, activeTab]);

  /* ── Status counts ── */
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: invoices.length };
    for (const tab of filterTabs) {
      if (tab !== 'All') {
        counts[tab] = invoices.filter((inv) => inv.status === tab.toLowerCase()).length;
      }
    }
    return counts;
  }, []);

  /* ── Create invoice logic ── */
  const selectedJob = useMemo(() => {
    if (!invoiceForm.selectedJobId) return null;
    return jobs.find((j) => j.id === invoiceForm.selectedJobId) || null;
  }, [invoiceForm.selectedJobId]);

  const handleJobSelect = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) {
      setInvoiceForm({ selectedJobId: '', lineItems: [], taxRate: 8, serviceFeePercent: 0 });
      return;
    }

    // Auto-generate line items from the job
    const lineItems = [
      {
        description: `${job.title} — ${job.description.substring(0, 60)}`,
        quantity: 1,
        unitPrice: job.estimatedCost,
        total: job.estimatedCost,
      },
    ];

    setInvoiceForm({
      selectedJobId: jobId,
      lineItems,
      taxRate: 8,
      serviceFeePercent: 0,
    });
  };

  const updateLineItem = (index: number, field: string, value: number | string) => {
    setInvoiceForm((prev) => {
      const items = [...prev.lineItems];
      const item = { ...items[index] };
      if (field === 'description') {
        item.description = value as string;
      } else if (field === 'quantity') {
        item.quantity = value as number;
        item.total = item.quantity * item.unitPrice;
      } else if (field === 'unitPrice') {
        item.unitPrice = value as number;
        item.total = item.quantity * item.unitPrice;
      } else if (field === 'total') {
        item.total = value as number;
      }
      items[index] = item;
      return { ...prev, lineItems: items };
    });
  };

  const addLineItem = () => {
    setInvoiceForm((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: '', quantity: 1, unitPrice: 0, total: 0 }],
    }));
  };

  const removeLineItem = (index: number) => {
    setInvoiceForm((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index),
    }));
  };

  const computedTotals = useMemo(() => {
    const subtotal = invoiceForm.lineItems.reduce((sum, li) => sum + li.total, 0);
    const serviceFee = subtotal * (invoiceForm.serviceFeePercent / 100);
    const tax = subtotal * (invoiceForm.taxRate / 100);
    const total = subtotal + serviceFee + tax;
    return { subtotal, serviceFee, tax, total };
  }, [invoiceForm]);

  const handleGenerateInvoice = () => {
    if (!invoiceForm.selectedJobId || invoiceForm.lineItems.length === 0) return;
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setCreateModalOpen(false);
      setInvoiceForm({ selectedJobId: '', lineItems: [], taxRate: 8, serviceFeePercent: 0 });
      alert(`Invoice generated successfully! (${generateInvoiceNumber('PC', invoices.length + 1)})`);
    }, 500);
  };

  /* ── Export dropdown ── */
  const handleExport = (type: 'pdf' | 'csv') => {
    setExportOpen(false);
    if (type === 'csv') {
      const headers = 'Invoice #,Client,Amount,Status,Issue Date,Due Date\n';
      const rows = invoices.map(inv =>
        `${inv.id},${inv.clientName},${inv.amount},${inv.status},${inv.issueDate},${inv.dueDate}`
      ).join('\n');
      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plumbcore-invoices-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const { jsPDF } = window as any;
      if (!jsPDF) { alert('Install jspdf for PDF export'); return; }
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      doc.setFontSize(18);
      doc.text('PlumbCore AI — Invoices Report', 20, 30);
      doc.setFontSize(10);
      let y = 45;
      doc.text('Invoice #', 20, y); doc.text('Client', 60, y); doc.text('Amount', 120, y); doc.text('Status', 160, y);
      y += 8;
      invoices.forEach(inv => {
        if (y > 270) { doc.addPage(); y = 30; }
        doc.text(inv.id, 20, y);
        doc.text(inv.clientName.substring(0, 20), 60, y);
        doc.text(`$${(inv.amount / 100).toFixed(0)}`, 120, y);
        doc.text(inv.status, 160, y);
        y += 6;
      });
      doc.save(`plumbcore-invoices-${new Date().toISOString().split('T')[0]}.pdf`);
    }
  };

  /* ── Send reminder ── */
  const handleSendReminder = (inv: Invoice) => {
    alert(`Reminder sent to ${inv.clientName} for ${inv.id} — coming soon`);
  };

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <ErrorState title="Failed to load invoices" message={error} onRetry={handleRetry} />
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-5">
        <div className="h-8 w-48 rounded bg-gray-50 animate-pulse" />
        <div className="h-10 w-full max-w-md rounded bg-gray-50 animate-pulse" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-20 rounded-lg bg-gray-50 animate-pulse" />
          ))}
        </div>
        <Card variant="default" padding="sm">
          <div className="divide-y divide-white-border">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Invoicing</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage invoices, track payments, and billing</p>
        </div>
        <div className="flex gap-2">
          {/* Export dropdown */}
          <div className="relative">
            <Button variant="outline" size="sm" onClick={() => setExportOpen(!exportOpen)}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export
            </Button>
            {exportOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 w-36 rounded-lg border border-gray-200 bg-white shadow-xl shadow-black/40 overflow-hidden">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full px-4 py-2.5 text-sm text-left text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    Export as PDF
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full px-4 py-2.5 text-sm text-left text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    Export as CSV
                  </button>
                </div>
              </>
            )}
          </div>
          <Button size="sm" onClick={() => setCreateModalOpen(true)}>
            + Create Invoice
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search invoices by number, client, or job..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filter Tabs with status counts */}
      <div className="flex items-center gap-1 rounded-lg bg-whiteer p-1 w-fit">
        {filterTabs.map((tab) => {
          const count = statusCounts[tab] || 0;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === tab
                  ? 'bg-electric text-[#0a0e2a] shadow-sm'
                  : 'text-gray-400 hover:text-gray-900'
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

      {/* Status visual indicator */}
      <div className="flex items-center gap-4 flex-wrap">
        {invoices.map((inv) => inv.status).filter((s, i, a) => a.indexOf(s) === i).map((status) => {
          const styles = invoiceStatusStyles[status];
          const count = invoices.filter((inv) => inv.status === status).length;
          const colorMap: Record<string, string> = {
            draft: '#6b7280',
            sent: '#3b82f6',
            paid: '#10b981',
            overdue: '#ef4444',
            cancelled: '#4b5563',
          };
          return (
            <div key={status} className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colorMap[status] || '#6b7280' }} />
              <span className="capitalize">{status}</span>
              <span className="text-steel-dark">({count})</span>
            </div>
          );
        })}
      </div>

      {/* Table */}
      {filteredInvoices.length === 0 ? (
        <Card variant="bordered" padding="lg">
          <EmptyState
            title="No invoices found"
            description={
              search || activeTab !== 'All'
                ? 'Try adjusting your search or filter.'
                : 'No invoices yet. Create your first invoice to get started.'
            }
            action={<Button size="sm" onClick={() => setCreateModalOpen(true)}>Create Invoice</Button>}
          />
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Invoice #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Client</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hidden md:table-cell">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hidden md:table-cell">Due Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white-border">
              {filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-blue-600 whitespace-nowrap">{inv.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{inv.clientName}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right whitespace-nowrap">
                    {formatCurrency(inv.amount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge status={inv.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap hidden md:table-cell">{formatDate(inv.issueDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap hidden md:table-cell">{formatDate(inv.dueDate)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/invoicing/${inv.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const { jsPDF } = window as any;
                          if (!jsPDF) { alert('Downloading invoice — install jspdf for full PDF support'); return; }
                          const doc = new jsPDF({ unit: 'mm', format: 'a4' });
                          doc.setFontSize(18);
                          doc.text('PlumbCore AI', 20, 30);
                          doc.setFontSize(14);
                          doc.text(`Invoice: ${inv.id}`, 20, 45);
                          doc.setFontSize(11);
                          doc.text(`Client: ${inv.clientName}`, 20, 58);
                          doc.text(`Amount: $${(inv.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 20, 68);
                          doc.text(`Status: ${inv.status.toUpperCase()}`, 20, 78);
                          doc.text(`Issue Date: ${formatDate(inv.issueDate)}`, 20, 88);
                          doc.text(`Due Date: ${formatDate(inv.dueDate)}`, 20, 98);
                          doc.save(`${inv.id}.pdf`);
                        }}
                      >
                        PDF
                      </Button>
                      {inv.status === 'overdue' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendReminder(inv)}
                        >
                          Remind
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-200">
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </div>
        </div>
      )}

      {/* ── Create Invoice Modal ── */}
      {createModalOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-start justify-center pt-[5vh] pb-8 px-4 overflow-y-auto" onClick={() => { setCreateModalOpen(false); setInvoiceForm({ selectedJobId: '', lineItems: [], taxRate: 8, serviceFeePercent: 0 }); }}>
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Create Invoice</h2>
                <p className="text-sm text-slate-500 mt-0.5">Select a job and configure line items to generate a new invoice.</p>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Job Select */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Job *</label>
                  <select
                    value={invoiceForm.selectedJobId}
                    onChange={(e) => handleJobSelect(e.target.value)}
                    className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 appearance-none transition-all"
                  >
                    <option value="">Choose a job...</option>
                    {jobs
                      .filter((j) => j.status !== 'cancelled')
                      .map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.id} — {job.title} ({job.clientName})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Selected Job Info */}
                {selectedJob && (
                  <div className="rounded-xl bg-slate-50 p-4 space-y-1 border border-slate-100">
                    <p className="text-sm font-semibold text-slate-900">{selectedJob.title}</p>
                    <p className="text-xs text-slate-500">{selectedJob.clientName} — {selectedJob.description.substring(0, 100)}</p>
                    <p className="text-xs text-slate-400">Est. Cost: {formatCurrency(selectedJob.estimatedCost)}</p>
                  </div>
                )}

                {/* Line Items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">Line Items</label>
                    <button onClick={addLineItem} className="h-8 px-3 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
                      + Add Item
                    </button>
                  </div>
                  {invoiceForm.lineItems.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">No line items yet. Add items or select a job to auto-populate.</p>
                  ) : (
                    <div className="space-y-2">
                      {invoiceForm.lineItems.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 rounded-xl border border-slate-200 p-3">
                          <div className="flex-1 min-w-0">
                            <input
                              placeholder="Description"
                              value={item.description}
                              onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                              className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                          </div>
                          <div className="w-16 shrink-0">
                            <input
                              type="number" min="0" step="0.5" placeholder="Qty"
                              value={item.quantity}
                              onChange={(e) => updateLineItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 text-right placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                          </div>
                          <div className="w-20 shrink-0">
                            <input
                              type="number" min="0" step="0.01" placeholder="Price"
                              value={item.unitPrice}
                              onChange={(e) => updateLineItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 text-right placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                          </div>
                          <div className="w-20 shrink-0 text-right pt-2">
                            <span className="text-xs font-semibold text-slate-900">{formatCurrency(item.total)}</span>
                          </div>
                          <button
                            onClick={() => removeLineItem(idx)}
                            className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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

                {/* Tax & Fee */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tax Rate (%)</label>
                    <input
                      type="number" min="0" max="100" step="0.5"
                      value={invoiceForm.taxRate}
                      onChange={(e) => setInvoiceForm((prev) => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                      className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Service Fee (%)</label>
                    <input
                      type="number" min="0" max="100" step="0.5"
                      value={invoiceForm.serviceFeePercent}
                      onChange={(e) => setInvoiceForm((prev) => ({ ...prev, serviceFeePercent: parseFloat(e.target.value) || 0 }))}
                      className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>

                {/* Computed Totals */}
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Subtotal</span>
                    <span>{formatCurrency(computedTotals.subtotal)}</span>
                  </div>
                  {computedTotals.serviceFee > 0 && (
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Service Fee ({invoiceForm.serviceFeePercent}%)</span>
                      <span>{formatCurrency(computedTotals.serviceFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Tax ({invoiceForm.taxRate}%)</span>
                    <span>{formatCurrency(computedTotals.tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2 mt-2">
                    <span>Total</span>
                    <span className="text-blue-600">{formatCurrency(computedTotals.total)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-end gap-3">
                <button onClick={() => { setCreateModalOpen(false); setInvoiceForm({ selectedJobId: '', lineItems: [], taxRate: 8, serviceFeePercent: 0 }); }} className="h-10 px-5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={handleGenerateInvoice} disabled={generating || !invoiceForm.selectedJobId || invoiceForm.lineItems.length === 0} className="h-10 px-5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                  {generating ? 'Generating...' : 'Generate Invoice'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}