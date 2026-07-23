'use client';

import { useState, useRef, useCallback } from 'react';

interface ExtractedItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
}

interface ReceiptResult {
  items: ExtractedItem[];
  supplier: string;
  totalPaid: number;
  date: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onImport: (items: ExtractedItem[], supplier: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  pipe: 'Pipe', fitting: 'Fitting', valve: 'Valve',
  fixture: 'Fixture', tool: 'Tool', sealant: 'Sealant',
  heater: 'Heater', pump: 'Pump',
};

export default function ReceiptUploadModal({ open, onClose, onImport }: Props) {
  const [step, setStep] = useState<'upload' | 'processing' | 'review' | 'done'>('upload');
  const [photoBase64, setPhotoBase64] = useState('');
  const [result, setResult] = useState<ReceiptResult | null>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [editingItems, setEditingItems] = useState<ExtractedItem[]>([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStep('upload');
    setPhotoBase64('');
    setResult(null);
    setError('');
    setDragOver(false);
    setEditingItems([]);
    setImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const processReceipt = useCallback(async (base64: string) => {
    setStep('processing');
    setError('');
    try {
      const res = await fetch('/api/ai/process-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoBase64: base64 }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Failed to process receipt');
        setStep('upload');
        return;
      }
      if (!data.items || data.items.length === 0) {
        setError('No items found in the receipt. Try a clearer photo.');
        setStep('upload');
        return;
      }
      setResult(data);
      setEditingItems(data.items.map((item: any) => ({
        name: item.name || '',
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        totalPrice: item.totalPrice || (item.quantity || 1) * (item.unitPrice || 0),
        category: item.category || 'fitting',
      })));
      setStep('review');
    } catch {
      setError('Network error. Please try again.');
      setStep('upload');
    }
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG or PNG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      if (base64) {
        setPhotoBase64(base64);
        processReceipt(base64);
      }
    };
    reader.onerror = () => setError('Failed to read file.');
    reader.readAsDataURL(file);
  }, [processReceipt]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleTakePhoto = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) handleFile(file);
    };
    input.click();
  }, [handleFile]);

  const updateItem = (idx: number, field: keyof ExtractedItem, value: any) => {
    setEditingItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        next[idx].totalPrice = next[idx].quantity * next[idx].unitPrice;
      }
      return next;
    });
  };

  const removeItem = (idx: number) => {
    setEditingItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleImport = () => {
    setImporting(true);
    onImport(editingItems, result?.supplier || 'Unknown');
    setStep('done');
    setImporting(false);
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-start justify-center pt-[5vh] pb-8 px-4 overflow-y-auto" onClick={onClose}>
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-border overflow-hidden" onClick={e => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="px-6 pt-6 pb-4 border-b border-border/50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Upload Receipt</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {step === 'upload' && 'Snap a photo of your purchase receipt — AI extracts all parts automatically.'}
                {step === 'processing' && 'AI is reading your receipt...'}
                {step === 'review' && `Review the ${editingItems.length} items extracted by AI`}
                {step === 'done' && `${editingItems.length} items added to inventory`}
              </p>
            </div>
            <button onClick={() => { reset(); onClose(); }} className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          {/* ── Body ── */}
          <div className="px-6 py-5 max-h-[55vh] overflow-y-auto">

            {/* Step 1: Upload */}
            {step === 'upload' && (
              <div>
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                    dragOver ? 'border-primary bg-blue-tint/40' : 'border-border hover:border-primary/40 hover:bg-blue-tint/20'
                  }`}
                >
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  <div className="w-14 h-14 rounded-2xl bg-blue-tint flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                    </svg>
                  </div>
                  <p className="text-base font-semibold text-foreground mb-1">Drop a receipt photo here</p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                </div>

                <div className="mt-4">
                  <button onClick={handleTakePhoto} className="w-full h-10 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /></svg>
                    Take Photo with Camera
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Processing */}
            {step === 'processing' && (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                <p className="text-base font-semibold text-foreground mb-1">AI is reading your receipt...</p>
                <p className="text-sm text-muted-foreground">Extracting parts, quantities, and prices</p>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 'review' && result && (
              <div className="space-y-4">
                {/* Supplier */}
                {result.supplier && result.supplier !== 'Unknown' && (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <span className="font-medium">Supplier:</span>
                    <span>{result.supplier}</span>
                    {result.date && <span className="text-muted-foreground">· {result.date}</span>}
                  </div>
                )}

                {/* Items table */}
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted border-b border-border">
                        <th className="px-3 py-2 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-1/2">Part Name</th>
                        <th className="px-3 py-2 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Qty</th>
                        <th className="px-3 py-2 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Unit Price</th>
                        <th className="px-3 py-2 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                        <th className="px-3 py-2 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                        <th className="px-3 py-2 text-center w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {editingItems.map((item, i) => (
                        <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                          <td className="px-3 py-2">
                            <input
                              type="text" value={item.name}
                              onChange={e => updateItem(i, 'name', e.target.value)}
                              className="w-full bg-transparent text-sm text-foreground outline-none"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number" min={1} value={item.quantity}
                              onChange={e => updateItem(i, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-14 mx-auto block text-center bg-muted rounded-lg text-sm text-foreground outline-none px-2 py-1"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number" min={0} step={0.01} value={item.unitPrice}
                              onChange={e => updateItem(i, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-20 ml-auto block text-right bg-muted rounded-lg text-sm text-foreground outline-none px-2 py-1"
                            />${item.unitPrice.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right text-sm font-semibold text-foreground">
                            ${item.totalPrice.toFixed(2)}
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={item.category}
                              onChange={e => updateItem(i, 'category', e.target.value)}
                              className="block mx-auto text-xs bg-muted rounded-lg text-foreground outline-none px-2 py-1 appearance-none cursor-pointer border-0"
                            >
                              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button onClick={() => removeItem(i)} className="text-muted-foreground/60 hover:text-red-500 transition-colors">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/50 border-t border-border">
                        <td colSpan={3} className="px-3 py-2 text-right text-sm font-semibold text-foreground">Total:</td>
                        <td className="px-3 py-2 text-right text-sm font-bold text-foreground">
                          ${editingItems.reduce((s, i) => s + i.totalPrice, 0).toFixed(2)}
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Step 4: Done */}
            {step === 'done' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-lg font-bold text-foreground mb-1">{editingItems.length} items added</p>
                <p className="text-sm text-muted-foreground">from {result?.supplier || 'receipt'} — now in your inventory.</p>
              </div>
            )}

            {/* Error */}
            {error && step === 'upload' && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700 mt-4">
                {error}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="px-6 py-4 bg-white border-t border-border/50 flex items-center justify-between">
            <div className="text-xs text-muted-foreground/80">
              {step === 'upload' && 'JPG or PNG · Receipt or invoice photo'}
              {step === 'review' && 'Edit any fields before importing'}
              {step === 'done' && 'Ready'}
            </div>
            <div className="flex items-center gap-3">
              {(step === 'upload' || step === 'done') && (
                <button onClick={() => { reset(); onClose(); }} className="h-10 px-5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                  {step === 'done' ? 'Close' : 'Cancel'}
                </button>
              )}
              {step === 'review' && (
                <>
                  <button onClick={reset} className="h-10 px-5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                    Try Another
                  </button>
                  <button onClick={handleImport} disabled={importing || editingItems.length === 0} className="h-10 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                    {importing ? 'Adding...' : `Add ${editingItems.length} Items to Inventory`}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
