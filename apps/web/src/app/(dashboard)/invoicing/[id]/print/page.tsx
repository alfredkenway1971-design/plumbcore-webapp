'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  StatusBadge,
  EmptyState,
  ErrorState,
  Button,
} from '@/pkg/ui-components';
import { invoices, clients } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/invoice-engine';

/* ── Helpers ── */
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/* ── Skeleton ── */
function PrintSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6 animate-pulse">
      <div className="h-12 w-48 rounded bg-gray-200" />
      <div className="h-4 w-64 rounded bg-gray-200" />
      <div className="h-32 rounded-xl bg-gray-100" />
      <div className="h-48 rounded-xl bg-gray-100" />
      <div className="h-16 rounded-xl bg-gray-100" />
    </div>
  );
}

/* ── Main Print Page ── */
export default function InvoicePrintPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invoiceId = params.id;

  useEffect(() => {
    const t = setTimeout(() => {
      const found = invoices.find((inv) => inv.id === invoiceId);
      if (!found) setNotFound(true);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [invoiceId]);

  // Trigger print after render
  useEffect(() => {
    if (!loading && !notFound && !error) {
      // Wait for full render
      const t = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(t);
    }
  }, [loading, notFound, error]);

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

  const subtotal = useMemo(
    () => (invoice ? invoice.lineItems.reduce((sum, li) => sum + li.total, 0) : 0),
    [invoice]
  );
  const taxRate = 0.08;
  const tax = subtotal * taxRate;
  const grandTotal = subtotal + tax;

  if (error) {
    return (
      <div className="p-6">
        <ErrorState title="Failed to load invoice" message={error} onRetry={handleRetry} />
      </div>
    );
  }

  if (loading) {
    return <PrintSkeleton />;
  }

  if (notFound || !invoice) {
    return (
      <div className="p-6">
        <Card variant="bordered" padding="lg">
          <EmptyState
            title="Invoice not found"
            description={`No invoice exists with ID "${invoiceId}".`}
            action={<Button variant="outline" size="sm" onClick={() => router.push('/invoicing')}>Back to Invoicing</Button>}
          />
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Print button (hidden when printing) */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          @page { margin: 0.75in; }
        }
      `}</style>

      {/* Toolbar - hidden when printing */}
      <div className="no-print sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => router.push(`/invoicing/${invoiceId}`)}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Invoice
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Printable invoice view</span>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-800 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
            Print
          </button>
        </div>
      </div>

      {/* Invoice Content - visible for print */}
      <div className="max-w-4xl mx-auto p-8" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">PlumbCore AI</h1>
            <p className="text-sm text-gray-500 mt-1">Professional Plumbing Services</p>
            <p className="text-sm text-gray-500">Austin, TX</p>
            <p className="text-sm text-gray-500">contact@plumbcore.ai</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
            <p className="text-lg font-semibold text-gray-700 mt-1">{invoice.id}</p>
          </div>
        </div>

        {/* Invoice Info Grid */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          {/* Bill To */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Bill To</h3>
            <p className="text-base font-semibold text-gray-900">{invoice.clientName}</p>
            {client && (
              <>
                <p className="text-sm text-gray-600">{client.address}</p>
                <p className="text-sm text-gray-600">{client.city}, {client.state} {client.zip}</p>
                <p className="text-sm text-gray-600">{client.email}</p>
              </>
            )}
          </div>

          {/* Invoice Details */}
          <div className="text-right">
            <div className="space-y-1.5">
              <div className="flex justify-end gap-4 text-sm">
                <span className="text-gray-500">Invoice Date:</span>
                <span className="font-medium text-gray-900">{formatDate(invoice.issueDate)}</span>
              </div>
              <div className="flex justify-end gap-4 text-sm">
                <span className="text-gray-500">Due Date:</span>
                <span className="font-medium text-gray-900">{formatDate(invoice.dueDate)}</span>
              </div>
              <div className="flex justify-end gap-4 text-sm">
                <span className="text-gray-500">Status:</span>
                <span className={`font-medium ${
                  invoice.status === 'paid' ? 'text-green-600' :
                  invoice.status === 'overdue' ? 'text-red-600' :
                  invoice.status === 'sent' ? 'text-blue-600' :
                  'text-gray-600'
                }`}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-end gap-4 text-sm">
                <span className="text-gray-500">Job:</span>
                <span className="font-medium text-gray-900">{invoice.jobTitle} ({invoice.jobId})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto -mx-4 sm:mx-0 mb-8">
        <table className="w-full min-w-[500px] sm:min-w-0">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Description</th>
              <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Qty</th>
              <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Unit Price</th>
              <th className="py-3 pl-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="py-4 pr-4 text-sm text-gray-900">{item.description}</td>
                <td className="py-4 px-4 text-sm text-gray-700 text-right">{item.quantity}</td>
                <td className="py-4 px-4 text-sm text-gray-700 text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="py-4 pl-4 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-10">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tax (8%)</span>
              <span className="text-gray-900">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t-2 border-gray-300 pt-2 mt-2">
              <span className="text-gray-900">Total Due</span>
              <span className="text-gray-900">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-1">Payment Terms</h4>
          <p className="text-sm text-gray-600">
            Payment is due within 30 days of the invoice date. 
            Please make checks payable to PlumbCore AI or pay via credit card, bank transfer, or cash.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Late payments are subject to a 1.5% monthly service charge.
          </p>
        </div>

        {/* Thank you */}
        <div className="mt-10 text-center text-sm text-gray-400">
          Thank you for your business!
        </div>
      </div>
    </>
  );
}