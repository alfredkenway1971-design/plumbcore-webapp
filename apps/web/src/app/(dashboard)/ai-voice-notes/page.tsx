'use client';

import { useState, useRef, useCallback } from 'react';
import { Button, Card, Modal, EmptyState, ErrorState } from '@/pkg/ui-components';

/* ── Types ── */
interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceResult {
  lineItems: LineItem[];
  subtotal: number;
  total: number;
}

/* ── Skeleton ── */
function VoiceNotesSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 w-48 rounded bg-muted" />
      <div className="h-64 rounded-2xl bg-muted" />
      <div className="h-10 w-40 rounded-xl bg-muted" />
    </div>
  );
}

/* ── Inline Edit Modal ── */
function EditLineItemsModal({
  open,
  items,
  onClose,
  onSave,
}: {
  open: boolean;
  items: LineItem[];
  onClose: () => void;
  onSave: (items: LineItem[]) => void;
}) {
  const [editable, setEditable] = useState<LineItem[]>(items.map((i: any) => ({ ...i })));

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    setEditable(prev => {
      const next = prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          const qty = field === 'quantity' ? Number(value) : item.quantity;
          const price = field === 'unitPrice' ? Number(value) : item.unitPrice;
          updated.total = Math.round(qty * price * 100) / 100;
        }
        return updated;
      });
      return next;
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Line Items"
      description="Adjust quantities, prices, or descriptions."
      size="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={() => { onSave(editable); onClose(); }}>Save Changes</Button>
        </>
      }
    >
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {editable.map((item, i) => (
          <div key={i} className="rounded-xl ring-1 ring-black/5 p-3 space-y-2">
            <input
              value={item.description}
              onChange={(e) => updateItem(i, 'description', e.target.value)}
              className="w-full rounded ring-1 ring-black/5 px-2 py-1 text-sm text-foreground outline-none focus:border-blue-500"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Qty</label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                  className="w-full rounded ring-1 ring-black/5 px-2 py-1 text-sm text-foreground outline-none focus:border-blue-500"
                  min={0}
                  step={0.5}
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Unit Price</label>
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(i, 'unitPrice', e.target.value)}
                  className="w-full rounded ring-1 ring-black/5 px-2 py-1 text-sm text-foreground outline-none focus:border-blue-500"
                  min={0}
                  step={0.01}
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</label>
                <div className="px-2 py-1 text-sm font-semibold text-foreground">${item.total.toFixed(2)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ── Main Page ── */
export default function AIVoiceNotesPage() {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InvoiceResult | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  /* ── Speech-to-Text ── */
  const handleToggleRecording = useCallback(() => {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert('Speech recognition is not supported in this browser. Please type your notes manually.');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setNote((prev) => prev + transcript);
    };

    recognition.onerror = () => {
      setRecording(false);
    };

    recognition.onend = () => {
      setRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }, [recording]);

  /* ── Generate Invoice ── */
  const handleGenerate = useCallback(async () => {
    if (!note.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/ai/note-to-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${res.status})`);
      }

      const data: InvoiceResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [note]);

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Voice Notes → Invoice</h1>
        <VoiceNotesSkeleton />
      </div>
    );
  }

  /* ── Error State ── */
  if (error && !note.trim()) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Voice Notes → Invoice</h1>
        <Card variant="bordered" padding="lg">
          <ErrorState title="Failed to load" message={error} onRetry={() => setError(null)} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Voice Notes → Invoice</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dictate or paste job notes to generate an invoice instantly.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Panel */}
        <div className="space-y-4">
          <Card variant="bordered" padding="lg">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">Job Notes</h2>
              <button
                onClick={handleToggleRecording}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  recording
                    ? 'bg-red-50 text-red-600 animate-pulse'
                    : 'bg-muted text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <rect x="9" y="2" width="6" height="12" rx="3" />
                  <path d="M5 10a7 7 0 0014 0" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
                {recording ? 'Recording...' : 'Record Audio'}
              </button>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Describe what was done on the job. Include parts used, labor time, and any issues encountered..."
              rows={14}
              className="w-full rounded-xl ring-1 ring-black/5 bg-white px-4 py-3 text-sm text-foreground placeholder-gray-400 outline-none transition-all focus:border-blue-500/50 focus:ring-1 focus:ring-primary/20 resize-none"
            />
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{note.length} characters</p>
              <Button
                variant="primary"
                size="md"
                disabled={!note.trim() || loading}
                loading={loading}
                onClick={handleGenerate}
              >
                {loading ? 'Generating...' : 'Generate Invoice'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right: Invoice Preview */}
        <div>
          {error && (
            <Card variant="bordered" padding="md" className="mb-4">
              <ErrorState
                title="Generation Failed"
                message={error}
                onRetry={handleGenerate}
              />
            </Card>
          )}

          {!result && !error && (
            <Card variant="bordered" padding="lg">
              <EmptyState
                icon={
                  <svg className="h-7 w-7 text-muted-foreground/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                }
                title="No invoice generated yet"
                description="Write or dictate your job notes above, then click 'Generate Invoice' to see a preview here."
              />
            </Card>
          )}

          {result && (
            <Card variant="bordered" padding="lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-lg font-semibold text-foreground">Invoice Preview</h2>
                </div>
                <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-600">
                  AI Generated
                </span>
              </div>

              {/* Line Items Table */}
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Qty</th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unit Price</th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.lineItems.map((item, i) => (
                      <tr key={i} className="border-b border-border transition-colors hover:bg-white/[0.02]">
                        <td className="px-3 py-3 text-foreground">{item.description}</td>
                        <td className="px-3 py-3 text-right text-foreground">{item.quantity}</td>
                        <td className="px-3 py-3 text-right text-muted-foreground">${item.unitPrice.toFixed(2)}</td>
                        <td className="px-3 py-3 text-right font-medium text-foreground">${item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="border-t border-border pt-3 space-y-1 text-right">
                <div className="flex justify-end items-center gap-4">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-sm font-medium text-foreground w-24 text-right">${result.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-end items-center gap-4">
                  <span className="text-base font-bold text-foreground">Total</span>
                  <span className="text-base font-bold text-primary w-24 text-right">${result.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 flex items-center gap-3">
                <Button variant="primary" size="md" onClick={() => window.location.href = '/invoicing'}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Create Invoice
                </Button>
                <Button variant="secondary" size="md" onClick={() => setEditOpen(true)}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  Edit
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {result && (
        <EditLineItemsModal
          open={editOpen}
          items={result.lineItems}
          onClose={() => setEditOpen(false)}
          onSave={(items) => {
            const subtotal = items.reduce((sum, i) => sum + i.total, 0);
            setResult({ lineItems: items, subtotal, total: subtotal });
          }}
        />
      )}
    </div>
  );
}
