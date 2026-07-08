'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  Card,
  Input,
  StatusBadge,
  Modal,
  EmptyState,
  ErrorState,
} from '@/pkg/ui-components';
import { invoices, clients } from '@/lib/mock-data';
import type { Invoice } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/invoice-engine';
import { jsPDF } from 'jspdf';
import { useAuthStore } from '@/lib/store';

/* ── Helpers ── */
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateShort(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const statusFlow = ['draft', 'sent', 'paid'] as const;

/* ── Toast Notification ── */
function Toast({ message, visible, onClose }: { message: string; visible: boolean; onClose: () => void }) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => onClose(), 3000);
      return () => clearTimeout(t);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in">
      <div className="flex items-center gap-3 rounded-xl bg-green-500 px-5 py-3 shadow-xl shadow-black/30 border border-status-success/30">
        <svg className="h-5 w-5 shrink-0 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-medium text-gray-900">{message}</p>
      </div>
    </div>
  );
}

/* ── Skeleton ── */
function InvoiceSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 w-48 rounded bg-gray-50" />
      <div className="h-5 w-72 rounded bg-gray-50" />
      <div className="h-40 rounded-xl bg-white border border-gray-200" />
      <div className="h-48 rounded-xl bg-white border border-gray-200" />
      <div className="h-16 rounded-xl bg-white border border-gray-200" />
    </div>
  );
}

/* ── Main Page ── */
export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // Record Payment modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [recordingPayment, setRecordingPayment] = useState(false);

  // Edit Invoice state
  const [editing, setEditing] = useState(false);
  const [editLineItems, setEditLineItems] = useState<{ description: string; quantity: number; unitPrice: number; total: number }[]>([]);
  const [editTaxRate, setEditTaxRate] = useState(8);
  const [editSaving, setEditSaving] = useState(false);

  // Company logo for PDF
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  // Notes
  const [invoiceNotes, setInvoiceNotes] = useState('');

  const invoiceId = params.id;

  useEffect(() => {
    const t = setTimeout(() => {
      const found = invoices.find((inv) => inv.id === invoiceId);
      if (!found) setNotFound(true);
      else {
        setInvoiceNotes(found.notes || '');
        setPaymentAmount(found.amount);
        setEditLineItems(found.lineItems.map(li => ({ ...li })));
      }
      // Load company logo from Zustand
      const state = useAuthStore.getState();
      if (state.company?.logo_url) setCompanyLogo(state.company.logo_url);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [invoiceId]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const found = invoices.find((inv) => inv.id === invoiceId);
      if (!found) setNotFound(true);
      setLoading(false);
    }, 300);
  };

  const invoice = useMemo(() => invoices.find((inv) => inv.id === invoiceId), [invoiceId]);

  const client = useMemo(
    () => (invoice ? clients.find((c) => c.id === invoice.clientId) : null),
    [invoice]
  );

  // Computed totals
  const subtotal = useMemo(
    () => (invoice ? invoice.lineItems.reduce((sum, li) => sum + li.total, 0) : 0),
    [invoice]
  );
  const taxRate = 0.08;
  const tax = subtotal * taxRate;
  const grandTotal = subtotal + tax;

  // Current position in the status flow
  const currentStepIndex = useMemo(() => {
    if (!invoice) return -1;
    const idx = statusFlow.indexOf(invoice.status as typeof statusFlow[number]);
    if (idx !== -1) return idx;
    return -1;
  }, [invoice]);

  /* ── Send Invoice ── */
  const handleSendInvoice = () => {
    const email = client?.email || 'client@example.com';
    showToast(`Invoice ${invoiceId} sent to ${email}`);
  };

  /* ── Record Payment ── */
  const handleRecordPayment = () => {
    setRecordingPayment(true);
    setTimeout(() => {
      setRecordingPayment(false);
      setPaymentModalOpen(false);
      showToast(`Payment of ${formatCurrency(paymentAmount)} via ${paymentMethod.replace('_', ' ')} recorded successfully`);
    }, 500);
  };

  /* ── Download PDF ── */
  const handleDownloadPdf = () => {
    if (!invoice) return;
    
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = margin;

      // Company Logo (if uploaded)
      if (companyLogo) {
        try {
          doc.addImage(companyLogo, 'JPEG', margin, y, 35, 15);
        } catch {
          // Fallback if image can't be added (e.g. unsupported format)
          doc.addImage(companyLogo, 'PNG', margin, y, 35, 15);
        }
      }

      // Header
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('INVOICE', pageWidth - margin, y, { align: 'right' });
      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(invoice.id, pageWidth - margin, y, { align: 'right' });

      // Company info
      y += 10;
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.setFont('helvetica', 'bold');
      // If logo was used, shift company name to the right
      const nameX = companyLogo ? margin + 42 : margin;
      doc.text('PlumbCore AI', nameX, y - 5);
      y += 6;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80);
      doc.text('Professional Plumbing Services', nameX, y);
      y += 4;
      doc.text('Austin, TX', nameX, y);
      y += 4;
      doc.text('contact@plumbcore.ai', nameX, y);

      // Invoice details (right side)
      const detailsX = pageWidth - margin - 60;
      let detailsY = margin + 12;
      doc.setFontSize(9);
      doc.setTextColor(80);
      const details = [
        ['Invoice Date:', formatDateShort(invoice.issueDate)],
        ['Due Date:', formatDateShort(invoice.dueDate)],
        ['Status:', invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)],
      ];
      details.forEach(([label, value]) => {
        doc.setFont('helvetica', 'normal');
        doc.text(label, detailsX, detailsY);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text(value, detailsX + 35, detailsY);
        detailsY += 5;
        doc.setTextColor(80);
      });

      // Bill To
      y += 15;
      doc.setDrawColor(200);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.text('Bill To', margin, y);
      y += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50);
      doc.text(invoice.clientName, margin, y);
      y += 5;
      if (client) {
        doc.text(client.address, margin, y);
        y += 4;
        doc.text(`${client.city}, ${client.state} ${client.zip}`, margin, y);
        y += 4;
        doc.text(client.email, margin, y);
      }

      // Items header
      y += 12;
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100);
      doc.text('DESCRIPTION', margin, y);
      doc.text('QTY', pageWidth - margin - 50, y, { align: 'right' });
      doc.text('UNIT PRICE', pageWidth - margin - 30, y, { align: 'right' });
      doc.text('TOTAL', pageWidth - margin, y, { align: 'right' });

      // Items
      y += 3;
      doc.setDrawColor(220);
      doc.setLineWidth(0.2);
      doc.line(margin, y, pageWidth - margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0);

      invoice.lineItems.forEach((item) => {
        y += 8;
        if (y > 270) {
          doc.addPage();
          y = margin;
        }
        doc.text(item.description, margin, y);
        doc.text(String(item.quantity), pageWidth - margin - 50, y, { align: 'right' });
        doc.text(formatCurrency(item.unitPrice), pageWidth - margin - 30, y, { align: 'right' });
        doc.setFont('helvetica', 'bold');
        doc.text(formatCurrency(item.total), pageWidth - margin, y, { align: 'right' });
        doc.setFont('helvetica', 'normal');
      });

      // Total
      y += 10;
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.line(pageWidth - margin - 60, y, pageWidth - margin, y);
      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Total Due:', pageWidth - margin - 50, y, { align: 'right' });
      doc.text(formatCurrency(invoice.amount), pageWidth - margin, y, { align: 'right' });

      // Payment terms
      y += 20;
      doc.setDrawColor(200);
      doc.setLineWidth(0.2);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.text('Payment Terms', margin, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text('Payment is due within 30 days. Late payments subject to 1.5% monthly charge.', margin, y);

      // Thank you
      y += 15;
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text('Thank you for your business!', pageWidth / 2, y, { align: 'center' });

      // Save
      doc.save(`invoice-${invoice.id}.pdf`);
    } catch (e) {
      console.error('PDF generation error:', e);
      // Fallback to browser print
      router.push(`/invoicing/${invoiceId}/print`);
    }
  };

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <ErrorState title="Failed to load invoice" message={error} onRetry={handleRetry} />
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <InvoiceSkeleton />
        <Toast message={toastMessage} visible={toastVisible} onClose={() => setToastVisible(false)} />
      </div>
    );
  }

  // Not found
  if (notFound || !invoice) {
    return (
      <div className="p-6">
        <Card variant="bordered" padding="lg">
          <EmptyState
            title="Invoice not found"
            description={`No invoice exists with ID "${invoiceId}". It may have been deleted or the link is incorrect.`}
            action={<Button variant="outline" size="sm" onClick={() => router.push('/invoicing')}>Back to Invoicing</Button>}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl">
      {/* Back link */}
      <button
        onClick={() => router.push('/invoicing')}
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-900 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Invoices
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{invoice.id}</h1>
            <StatusBadge status={invoice.status} size="md" />
            {invoice.status === 'overdue' && (
              <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Overdue
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">{invoice.jobTitle}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(invoice.amount)}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Issued: {formatDate(invoice.issueDate)} · Due: {formatDate(invoice.dueDate)}
          </p>
        </div>
      </div>

      {/* Status Flow */}
      <Card variant="default" padding="md">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Status Flow</h3>
        <div className="flex items-center gap-0">
          {statusFlow.map((step, idx) => {
            const isComplete = idx <= (currentStepIndex ?? -1);
            const isCurrent = idx === currentStepIndex;
            const isLast = idx === statusFlow.length - 1;

            return (
              <div key={step} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-all ${
                      isComplete
                        ? 'bg-electric text-[#0a0e2a]'
                        : 'bg-gray-50 text-gray-500-dark'
                    } ${isCurrent ? 'ring-2 ring-electric/50' : ''}`}
                  >
                    {isComplete ? (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span className={`text-xs font-medium capitalize ${isComplete ? 'text-gray-900' : 'text-steel-dark'}`}>
                    {step}
                  </span>
                </div>
                {!isLast && (
                  <div className={`flex-1 h-0.5 mx-3 ${
                    idx < (currentStepIndex ?? -1) ? 'bg-electric' : 'bg-gray-50'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        {invoice.status === 'overdue' && (
          <div className="mt-3 rounded-lg bg-red-50 border border-status-error/20 px-3 py-2">
            <p className="text-xs text-red-600 font-medium">
              This invoice is overdue. The due date was {formatDate(invoice.dueDate)}.
            </p>
          </div>
        )}
        {invoice.status === 'cancelled' && (
          <div className="mt-3 rounded-lg bg-steel/10 border border-gray-200 px-3 py-2">
            <p className="text-xs text-gray-400 font-medium">This invoice has been cancelled.</p>
          </div>
        )}
        {invoice.paidAmount !== undefined && invoice.paidAmount !== null && invoice.paymentMethod && (
          <div className="mt-3 rounded-lg bg-green-50 border border-status-success/20 px-3 py-2">
            <p className="text-xs text-green-600 font-medium">
              Paid {formatCurrency(invoice.paidAmount)} via {invoice.paymentMethod.replace('_', ' ')} on {formatDate(invoice.paidDate!)}
            </p>
          </div>
        )}
      </Card>

      {/* Bill To */}
      <Card variant="default" padding="md">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Bill To</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900">{invoice.clientName}</p>
            {client && (
              <>
                <p className="text-sm text-gray-500 mt-1">{client.address}</p>
                <p className="text-sm text-gray-500">{client.city}, {client.state} {client.zip}</p>
                <p className="text-sm text-gray-500 mt-2">{client.email}</p>
                <p className="text-sm text-gray-500">{client.phone}</p>
              </>
            )}
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Invoice Details</p>
            <p className="text-sm text-gray-900">Invoice #: {invoice.id}</p>
            <p className="text-sm text-gray-400">Job: {invoice.jobTitle} ({invoice.jobId})</p>
            {client && <p className="text-sm text-gray-400">Client ID: {client.id}</p>}
          </div>
        </div>
      </Card>

      {/* Line Items Table */}
      <Card variant="default" padding="md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Line Items</h3>
          {editing && (
            <button
              onClick={() => setEditLineItems([...editLineItems, { description: '', quantity: 1, unitPrice: 0, total: 0 }])}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              + Add Line Item
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Description</th>
                <th className="pb-2 px-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Qty</th>
                <th className="pb-2 px-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Unit Price</th>
                <th className="pb-2 pl-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Total</th>
              </tr>
            </thead>
            <tbody>
              {(editing ? editLineItems : invoice.lineItems).map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200/50 last:border-b-0">
                  {editing ? (
                    <>
                      <td className="py-2 pr-4">
                        <input
                          value={item.description}
                          onChange={(e) => {
                            const next = [...editLineItems];
                            next[idx] = { ...next[idx], description: e.target.value };
                            setEditLineItems(next);
                          }}
                          placeholder="Description"
                          className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <input
                          type="number" min="0" step="0.5"
                          value={item.quantity}
                          onChange={(e) => {
                            const q = parseFloat(e.target.value) || 0;
                            const next = [...editLineItems];
                            next[idx] = { ...next[idx], quantity: q, total: q * next[idx].unitPrice };
                            setEditLineItems(next);
                          }}
                          className="w-16 h-9 px-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 text-right outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <input
                          type="number" min="0" step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => {
                            const p = parseFloat(e.target.value) || 0;
                            const next = [...editLineItems];
                            next[idx] = { ...next[idx], unitPrice: p, total: next[idx].quantity * p };
                            setEditLineItems(next);
                          }}
                          className="w-20 h-9 px-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 text-right outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                        />
                      </td>
                      <td className="py-2 pl-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-sm font-medium text-gray-900">{formatCurrency(item.total)}</span>
                          <button
                            onClick={() => {
                              if (editLineItems.length <= 1) return;
                              setEditLineItems(editLineItems.filter((_, i) => i !== idx));
                            }}
                            className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Remove"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 pr-4 text-sm text-gray-900">{item.description}</td>
                      <td className="py-3 px-4 text-sm text-gray-400 text-right">{item.quantity}</td>
                      <td className="py-3 px-4 text-sm text-gray-400 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3 pl-4 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.total)}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit mode: Tax Rate + Save */}
        {editing && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-500">Tax Rate (%)</label>
              <input
                type="number" min="0" max="100" step="0.5"
                value={editTaxRate}
                onChange={(e) => setEditTaxRate(parseFloat(e.target.value) || 0)}
                className="w-20 h-9 px-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 text-center outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" loading={editSaving} onClick={() => {
                setEditSaving(true);
                setTimeout(() => {
                  setEditSaving(false);
                  setEditing(false);
                  showToast('Invoice updated successfully');
                }, 500);
              }}>
                Save Changes
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                setEditing(false);
                if (invoice) setEditLineItems(invoice.lineItems.map(li => ({ ...li })));
              }}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="mt-4 border-t border-gray-200 pt-3 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Subtotal</span>
            <span className="text-gray-900">{formatCurrency((editing ? editLineItems : invoice.lineItems).reduce((s, li) => s + li.total, 0))}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Tax ({editing ? editTaxRate : 8}%)</span>
            <span className="text-gray-900">{formatCurrency((editing ? editLineItems : invoice.lineItems).reduce((s, li) => s + li.total, 0) * (editing ? editTaxRate : 8) / 100)}</span>
          </div>
          <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2">
            <span className="text-gray-900">Total</span>
            <span className="text-blue-600">{formatCurrency(
              (editing ? editLineItems : invoice.lineItems).reduce((s, li) => s + li.total, 0) * (1 + (editing ? editTaxRate : 8) / 100)
            )}</span>
          </div>
        </div>
      </Card>

      {/* Email Preview Section */}
      <Card variant="default" padding="md">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Email Preview</h3>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>Send to: <span className="text-gray-900 font-medium">{client?.email || 'No email on file'}</span></span>
        </div>
        <div className="rounded-lg border border-gray-200 bg-whiteer p-3">
          <p className="text-sm text-gray-900 font-medium">Subject: Invoice {invoice.id} from PlumbCore AI</p>
          <p className="text-sm text-gray-500 mt-2">
            Dear {invoice.clientName},{'\n\n'}
            Please find attached invoice {invoice.id} for {invoice.jobTitle}.{'\n\n'}
            Amount Due: {formatCurrency(invoice.amount)}{'\n'}
            Due Date: {formatDateShort(invoice.dueDate)}{'\n\n'}
            Thank you for your business.{'\n'}
            — PlumbCore AI Team
          </p>
        </div>
        <div className="mt-3">
          <Button size="sm" onClick={handleSendInvoice}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Send Invoice
          </Button>
        </div>
      </Card>

      {/* Notes Section */}
      <Card variant="default" padding="md">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Notes</h3>
        <textarea
          placeholder="Add notes to this invoice..."
          rows={4}
          value={invoiceNotes}
          onChange={(e) => setInvoiceNotes(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-whiteer px-4 py-2.5 text-sm text-gray-900 placeholder-steel/50 outline-none transition-all focus:border-electric/50 focus:ring-1 focus:ring-electric/20 resize-none"
        />
        <p className="mt-1 text-xs text-gray-500">Notes are saved locally and visible on this page.</p>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {invoice.status === 'draft' && (
          <Button variant="primary" size="sm" onClick={handleSendInvoice}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Mark as Sent
          </Button>
        )}
        {(invoice.status === 'sent' || invoice.status === 'overdue') && (
          <Button variant="primary" size="sm" onClick={() => setPaymentModalOpen(true)}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Record Payment
          </Button>
        )}
        <Button variant="secondary" size="sm" onClick={handleDownloadPdf}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download PDF
        </Button>
        <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
          {editing ? 'Cancel Editing' : 'Edit Invoice'}
        </Button>
      </div>

      {/* ── Record Payment Modal ── */}
      <Modal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Record Payment"
        description={`Record a payment for ${invoice.id}`}
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" loading={recordingPayment} onClick={handleRecordPayment} disabled={!paymentAmount || paymentAmount <= 0}>
              Record Payment
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Payment Amount *"
            type="number"
            step="0.01"
            min="0"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-400">Payment Method *</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-whiteer px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20"
            >
              <option value="credit_card">Credit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="check">Check</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          <Input
            label="Payment Date *"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
          />

          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500 mb-1">Invoice Total</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(invoice.amount)}</p>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      <Toast message={toastMessage} visible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}