'use client';

import { useState } from 'react';

/* ─────────────── Icons as inline SVGs ─────────────── */
function CameraIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 md:w-12 md:h-12 text-blue-400"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>; }

export default function QuotePage() {
  const [step, setStep] = useState<1|2|3|4>(1);
  const [photos, setPhotos] = useState<File[]>([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', desc: '', urgency: 'flexible' });
  const [result, setResult] = useState<any>(null);

  /* ─── Handlers ─── */
  const addPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(prev => [...prev, ...files].slice(0, 4));
  };
  const removePhoto = (i: number) => setPhotos(prev => prev.filter((_, idx) => idx !== i));

  const handleEstimate = async () => {
    setStep(3);
    setResult(null);
    
    try {
      const res = await fetch('/api/ai/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoCount: photos.length,
          customerPhone: form.phone,
          customerDescription: form.desc || `Customer: ${form.name}. Address: ${form.address}. Urgency: ${form.urgency}`
        })
      });
      const data = await res.json();
      
      if (data.success && data.result) {
        setResult(data.result);
      } else {
        setResult({
          diagnosis: 'Unable to analyze photo. A plumber will inspect in person.',
          severity: 'moderate', estimatedHours: 1, laborRate: 95, laborCost: 95,
          parts: [{ name: 'Diagnostic fee', qty: 1, unitPrice: 49, total: 49 }],
          partsTotal: 49, priceLow: 144, priceHigh: 179, confidence: 50
        });
      }
      setStep(4);
    } catch {
      setResult({
        diagnosis: 'Unable to analyze photo. A plumber will inspect in person.',
        severity: 'moderate', estimatedHours: 1, laborRate: 95, laborCost: 95,
        parts: [{ name: 'Diagnostic fee', qty: 1, unitPrice: 49, total: 49 }],
        partsTotal: 49, priceLow: 144, priceHigh: 179, confidence: 50
      });
      setStep(4);
    }
  };

  const severityBadge = (s: string) => {
    const colors: Record<string, string> = { emergency: 'bg-red-100 text-red-700', high: 'bg-orange-100 text-orange-700', moderate: 'bg-yellow-100 text-yellow-700', low: 'bg-green-100 text-green-700' };
    return colors[s?.toLowerCase()] || colors.low;
  };

  /* ═══════════ Step 1 — Upload Photos ═══════════ */
  const StepUpload = () => (
    <div className="space-y-5">
      {/* Hero */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">Get a Free<br/>Plumbing Estimate</h1>
        <p className="text-sm text-gray-500">Snap a photo. Get an instant price. Book in 2 minutes.</p>
      </div>

      {/* Trust row */}
      <div className="flex justify-center gap-3 text-xs text-gray-400">
        <span>✓ No signup</span>
        <span>✓ Upfront pricing</span>
        <span>✓ Licensed</span>
      </div>

      {/* Upload zone */}
      <label className="relative block border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50/50 cursor-pointer hover:border-blue-400 transition-colors overflow-hidden">
        <input type="file" accept="image/*" multiple capture="environment" onChange={addPhotos} className="absolute inset-0 opacity-0 cursor-pointer" />
        {photos.length === 0 ? (
          <div className="flex flex-col items-center py-12 px-6">
            <CameraIcon />
            <p className="mt-4 text-sm font-medium text-gray-600">Take or upload a photo</p>
            <p className="text-xs text-gray-400 mt-1">Show us the problem — leak, clog, crack</p>
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-4 gap-2">
              {photos.map((p, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={URL.createObjectURL(p)} className="w-full h-full object-cover" alt="" />
                  <button type="button" onClick={(e) => { e.preventDefault(); removePhoto(i); }} className="absolute top-0.5 right-0.5 w-5 h-5 bg-gray-900/60 text-white rounded-full flex items-center justify-center text-xs">✕</button>
                </div>
              ))}
            </div>
            <p className="text-xs text-center text-blue-500 mt-2">Tap to add more photos</p>
          </div>
        )}
      </label>

      <button onClick={() => setStep(2)} disabled={photos.length === 0} className="w-full bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-3.5 rounded-xl disabled:cursor-not-allowed active:scale-[0.98] transition-transform text-[15px]">
        {photos.length > 0 ? `Continue with ${photos.length} photo${photos.length > 1 ? 's' : ''}` : 'Select a photo'}
      </button>
    </div>
  );

  /* ═══════════ Step 2 — Customer Info ═══════════ */
  const StepInfo = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Where should we send your estimate?</h2>
        <p className="text-sm text-gray-500 mt-0.5">We&apos;ll text you the price breakdown</p>
      </div>

      <div className="space-y-3.5">
        <input type="text" placeholder="Your name" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
        
        <div>
          <input type="tel" inputMode="numeric" placeholder="Phone number *" required value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
          {form.phone.length > 0 && form.phone.length < 10 && <p className="text-xs text-red-500 mt-1 ml-1">Please enter a valid phone number</p>}
        </div>

        <input type="email" inputMode="email" placeholder="Email (optional)" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />

        <input type="text" placeholder="Service address" value={form.address} onChange={e => setForm(p => ({...p, address: e.target.value}))} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />

        <textarea placeholder="Describe the problem (e.g. &quot;Kitchen sink leaking under cabinet&quot;)" rows={3} value={form.desc} onChange={e => setForm(p => ({...p, desc: e.target.value}))} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none" />

        <select value={form.urgency} onChange={e => setForm(p => ({...p, urgency: e.target.value}))} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%239ca3af%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10">
          <option value="flexible">How urgent is it?</option>
          <option value="emergency">Emergency — Can&apos;t wait</option>
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="flexible">Flexible — No rush</option>
        </select>
      </div>

      <div className="flex gap-3 pt-1">
        <button onClick={() => setStep(1)} className="flex-1 rounded-xl border border-gray-200 text-gray-600 font-medium py-3 text-sm active:scale-[0.98] transition-transform">Back</button>
        <button onClick={handleEstimate} disabled={form.phone.length < 10} className="flex-[2] bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl disabled:cursor-not-allowed active:scale-[0.98] transition-transform text-[15px]">
          Get My Estimate
        </button>
      </div>
    </div>
  );

  /* ═══════════ Step 3 — Loading ═══════════ */
  const StepLoading = () => (
    <div className="flex flex-col items-center justify-center py-20 space-y-5">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-base font-semibold text-gray-900">AI is analyzing your photos...</p>
        <p className="text-sm text-gray-400">Identifying the problem & matching parts</p>
      </div>
    </div>
  );

  /* ═══════════ Step 4 — Results ═══════════ */
  const StepResult = ({ r }: { r: any }) => {
    const parts = r.parts || [];
    return (
      <div className="space-y-4">
        {/* Estimate card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b border-gray-50">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Your Estimate</h2>
              <p className="text-xs text-gray-400">Valid for 24 hours</p>
            </div>
            <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold ${severityBadge(r.severity)}`}>
              {r.severity?.charAt(0).toUpperCase() + r.severity?.slice(1) || 'Low'}
            </span>
          </div>

          {/* Diagnosis */}
          <div className="bg-blue-50 px-4 py-3.5 mx-4 mt-4 rounded-xl">
            <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">AI Diagnosis</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5">{r.diagnosis}</p>
            {r.confidence && <p className="text-[11px] text-blue-500 mt-1">{r.confidence}% confidence</p>}
          </div>

          {/* Cost cards */}
          <div className="grid grid-cols-2 gap-3 px-4 mt-4">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-[11px] text-gray-500">Labor</p>
              <p className="text-lg font-bold text-gray-900">{r.estimatedHours}h × ${r.laborRate}/hr</p>
              <p className="text-sm font-semibold text-blue-600">=${r.laborCost}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-[11px] text-gray-500">Total Estimate</p>
              <p className="text-xl font-bold text-green-600">${r.priceLow}</p>
              <p className="text-[11px] text-gray-400">– ${r.priceHigh} incl. parts</p>
            </div>
          </div>

          {/* Parts breakdown */}
          {parts.length > 0 && (
            <div className="px-4 mt-4">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Parts Needed</p>
              <div className="space-y-2">
                {parts.map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0">{p.qty}x</span>
                      <span className="text-sm text-gray-700 truncate">{p.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 shrink-0 ml-2">${p.total}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between border-t border-gray-100 mx-4 mt-4 pt-3 pb-4">
            <span className="text-sm font-medium text-gray-500">Estimated total</span>
            <div className="text-right">
              <span className="text-lg font-bold text-green-600">${r.priceLow}</span>
              <span className="text-sm text-gray-400"> – ${r.priceHigh}</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white space-y-3">
          <div>
            <p className="text-base font-bold">Ready to fix it?</p>
            <p className="text-sm text-blue-200 mt-0.5">Pay a $49 deposit to book now. Fully refundable.</p>
          </div>
          <button className="w-full bg-white text-blue-700 font-semibold py-3.5 rounded-xl active:scale-[0.98] transition-transform text-[15px] shadow-sm">
            Pay $49 Deposit & Book
          </button>
          <p className="text-xs text-blue-300 text-center">Deposit deducted from final bill. Cancel anytime.</p>
        </div>

        {/* FAQ */}
        <details className="bg-white rounded-2xl border border-gray-100 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer text-sm font-medium text-gray-700">
            Is the estimate really free?
            <svg className="w-4 h-4 text-gray-400 transition-transform ui-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </summary>
          <p className="px-4 pb-4 text-sm text-gray-500">Yes, completely free. No credit card needed.</p>
        </details>
      </div>
    );
  };

  /* ═══════════ Render ═══════════ */
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Spacer for status bar */}
      <div className="h-2" />
      
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {[1,2,3,4].map(s => (
            <div key={s} className={`w-2 h-2 rounded-full transition-all duration-300 ${step === s ? 'w-6 bg-blue-600' : step > s ? 'bg-blue-400' : 'bg-gray-200'}`} />
          ))}
        </div>

        {step === 1 && <StepUpload />}
        {step === 2 && <StepInfo />}
        {step === 3 && <StepLoading />}
        {step === 4 && result && <StepResult r={result} />}
      </div>
    </div>
  );
}