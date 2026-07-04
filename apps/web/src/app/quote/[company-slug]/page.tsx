'use client';

import { useState, useCallback, useRef, useEffect, memo } from 'react';

/* ─── Phone formatting for US/CA ─── */
function formatPhone(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function validatePhone(display: string): boolean {
  return display.replace(/\D/g, '').length === 10;
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 md:w-12 md:h-12 text-blue-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
    </svg>
  );
}

/* ═══════════ Step 1 — Upload Photos ═══════════ */
const StepUpload = memo(function StepUpload({ photos, onAdd, onRemove, onNext }: any) {
  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">Get a Free<br />Plumbing Estimate</h1>
        <p className="text-sm text-gray-500">Snap a photo. Get an instant price. Book in 2 minutes.</p>
      </div>
      <div className="flex justify-center gap-3 text-xs text-gray-400">
        <span>✓ No signup</span>
        <span>✓ Upfront pricing</span>
        <span>✓ Licensed</span>
      </div>

      <label className="relative block border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50/50 cursor-pointer hover:border-blue-400 transition-colors overflow-hidden">
        <input type="file" accept="image/*" multiple onChange={onAdd} className="absolute inset-0 opacity-0 cursor-pointer" />
        {photos.length === 0 ? (
          <div className="flex flex-col items-center py-12 px-6">
            <CameraIcon />
            <p className="mt-4 text-sm font-medium text-gray-600">Take or upload a photo</p>
            <p className="text-xs text-gray-400 mt-1">Show us the problem — leak, clog, crack</p>
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-4 gap-2">
              {photos.map((p: any, i: number) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={URL.createObjectURL(p)} className="w-full h-full object-cover" alt="" />
                  <button type="button" onClick={(e) => { e.preventDefault(); onRemove(i); }} className="absolute top-0.5 right-0.5 w-5 h-5 bg-gray-900/60 text-white rounded-full flex items-center justify-center text-xs">✕</button>
                </div>
              ))}
            </div>
            <p className="text-xs text-center text-blue-500 mt-2">Tap to add more photos</p>
          </div>
        )}
      </label>

      <button onClick={onNext} disabled={photos.length === 0} className="w-full bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-3.5 rounded-xl disabled:cursor-not-allowed active:scale-[0.98] transition-transform text-[15px]">
        {photos.length > 0 ? `Continue with ${photos.length} photo${photos.length > 1 ? 's' : ''}` : 'Select a photo'}
      </button>
    </div>
  );
});

/* ═══════════ Step 2 — Customer Info ═══════════ */
const StepInfo = memo(function StepInfo({
  form, setForm, phoneDisplay, onPhoneChange, phoneValid, canSubmit, onBack, onEstimate
}: any) {
  const addressRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    if (!addressRef.current || typeof (window as any).google === 'undefined') return;
    try {
      const g = (window as any).google;
      autocompleteRef.current = new g.maps.places.Autocomplete(addressRef.current, {
        types: ['address'], componentRestrictions: { country: ['us', 'ca'] },
      });
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.formatted_address) setForm((p: any) => ({ ...p, address: place.formatted_address }));
      });
    } catch {}
  }, []);

  const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Where should we send your estimate?</h2>
        <p className="text-sm text-gray-500 mt-0.5">We&apos;ll text you the price breakdown</p>
      </div>

      <div className="space-y-3.5">
        <input type="text" placeholder="Your name" value={form.name} onChange={(e) => setForm((p: any) => ({ ...p, name: e.target.value }))} className={inputClass} autoComplete="name" />

        <div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">+1</span>
            <input type="tel" inputMode="numeric" placeholder="(555) 555-5555" required value={phoneDisplay} onChange={onPhoneChange} className={`${inputClass} pl-10`} autoComplete="tel-national" />
          </div>
          {phoneDisplay.length > 0 && !phoneValid && (
            <p className="text-xs text-red-500 mt-1.5 ml-1">Enter a valid 10-digit US/Canada number</p>
          )}
          {phoneValid && (
            <p className="text-xs text-green-600 mt-1.5 ml-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>Valid number</p>
          )}
        </div>

        <input type="email" inputMode="email" placeholder="Email (optional)" value={form.email} onChange={(e) => setForm((p: any) => ({ ...p, email: e.target.value }))} className={inputClass} autoComplete="email" />

        <input ref={addressRef} type="text" placeholder="Service address" value={form.address} onChange={(e) => setForm((p: any) => ({ ...p, address: e.target.value }))} className={inputClass} autoComplete="street-address" />

        <textarea placeholder='Describe the problem (e.g. "Kitchen sink leaking under cabinet")' rows={3} value={form.desc} onChange={(e) => setForm((p: any) => ({ ...p, desc: e.target.value }))} className={`${inputClass} resize-none`} />

        <select value={form.urgency} onChange={(e) => setForm((p: any) => ({ ...p, urgency: e.target.value }))} className={`${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%239ca3af%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10`}>
          <option value="flexible">How urgent is it?</option>
          <option value="emergency">Emergency — Can&apos;t wait</option>
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="flexible">Flexible — No rush</option>
        </select>
      </div>

      <div className="flex gap-3 pt-1">
        <button onClick={onBack} className="flex-1 rounded-xl border border-gray-200 text-gray-600 font-medium py-3 text-sm active:scale-[0.98] transition-transform">Back</button>
        <button onClick={onEstimate} disabled={!canSubmit} className="flex-[2] bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl disabled:cursor-not-allowed active:scale-[0.98] transition-transform text-[15px]">
          {!canSubmit ? 'Enter phone number' : 'Get My Estimate'}
        </button>
      </div>
    </div>
  );
});

/* ═══════════ Step 3 — Loading ═══════════ */
const StepLoading = memo(function StepLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-5">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-base font-semibold text-gray-900">AI is analyzing your photos...</p>
        <p className="text-sm text-gray-400">Identifying the problem & matching parts</p>
      </div>
    </div>
  );
});

/* ═══════════ Step 4 — Results ═══════════ */
const StepResult = memo(function StepResult({ result }: any) {
  const parts = result?.parts || [];

  const severityBadge = (s: string) => {
    const colors: Record<string, string> = { emergency: 'bg-red-100 text-red-700', high: 'bg-orange-100 text-orange-700', moderate: 'bg-yellow-100 text-yellow-700', low: 'bg-green-100 text-green-700' };
    return colors[s?.toLowerCase()] || colors.low;
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-start justify-between p-4 border-b border-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Your Estimate</h2>
            <p className="text-xs text-gray-400">Valid for 24 hours</p>
          </div>
          <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold ${severityBadge(result?.severity)}`}>
            {result?.severity?.charAt(0).toUpperCase() + result?.severity?.slice(1) || 'Low'}
          </span>
        </div>

        <div className="bg-blue-50 px-4 py-3.5 mx-4 mt-4 rounded-xl">
          <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">AI Diagnosis</p>
          <p className="text-sm font-medium text-gray-900 mt-0.5">{result?.diagnosis}</p>
          {result?.confidence && <p className="text-[11px] text-blue-500 mt-1">{result.confidence}% confidence</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4 mt-4">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-[11px] text-gray-500">Labor</p>
            <p className="text-lg font-bold text-gray-900">{result?.estimatedHours}h × ${result?.laborRate}/hr</p>
            <p className="text-sm font-semibold text-blue-600">=${result?.laborCost}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-[11px] text-gray-500">Total Estimate</p>
            <p className="text-xl font-bold text-green-600">${result?.priceLow}</p>
            <p className="text-[11px] text-gray-400">– ${result?.priceHigh} incl. parts</p>
          </div>
        </div>

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

        <div className="flex items-center justify-between border-t border-gray-100 mx-4 mt-4 pt-3 pb-4">
          <span className="text-sm font-medium text-gray-500">Estimated total</span>
          <div className="text-right">
            <span className="text-lg font-bold text-green-600">${result?.priceLow}</span>
            <span className="text-sm text-gray-400"> – ${result?.priceHigh}</span>
          </div>
        </div>
      </div>

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
    </div>
  );
});

/* ═══════════ Main Component ═══════════ */
export default function QuotePage() {
  const [step, setStep] = useState<1|2|3|4>(1);
  const [photos, setPhotos] = useState<File[]>([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', desc: '', urgency: 'flexible' });
  const [phoneDisplay, setPhoneDisplay] = useState('');
  const [result, setResult] = useState<any>(null);

  const addPhotos = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotos(prev => [...prev, ...Array.from(e.target.files || [])].slice(0, 4));
    e.target.value = '';
  }, []);

  const removePhoto = useCallback((i: number) => {
    setPhotos(prev => prev.filter((_, idx) => idx !== i));
  }, []);

  const handlePhone = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^\d()\-\s]/g, '');
    const digits = cleaned.replace(/\D/g, '');
    if (digits.length > 10) return;
    setPhoneDisplay(formatPhone(cleaned));
    setForm(p => ({ ...p, phone: cleaned.replace(/\D/g, '') }));
  }, []);

  const handleEstimate = useCallback(async () => {
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
      setResult(data.success && data.result ? data.result : {
        diagnosis: 'Unable to analyze photo. A plumber will inspect in person.',
        severity: 'moderate', estimatedHours: 1, laborRate: 95, laborCost: 95,
        parts: [{ name: 'Diagnostic fee', qty: 1, unitPrice: 49, total: 49 }],
        partsTotal: 49, priceLow: 144, priceHigh: 179, confidence: 50
      });
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
  }, [form, photos]);

  const phoneValid = validatePhone(phoneDisplay);
  const canSubmit = form.phone.length >= 10;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      <div className="h-2" />
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {[1,2,3,4].map(s => (
            <div key={s} className={`w-2 h-2 rounded-full transition-all duration-300 ${step === s ? 'w-6 bg-blue-600' : step > s ? 'bg-blue-400' : 'bg-gray-200'}`} />
          ))}
        </div>

        {/* Render all steps — CSS toggles visibility so inputs never remount */}
        <div style={{ display: step === 1 ? 'block' : 'none' }}>
          <StepUpload photos={photos} onAdd={addPhotos} onRemove={removePhoto} onNext={() => setStep(2)} />
        </div>
        <div style={{ display: step === 2 ? 'block' : 'none' }}>
          <StepInfo form={form} setForm={setForm} phoneDisplay={phoneDisplay} onPhoneChange={handlePhone} phoneValid={phoneValid} canSubmit={canSubmit} onBack={() => setStep(1)} onEstimate={handleEstimate} />
        </div>
        <div style={{ display: step === 3 ? 'block' : 'none' }}>
          <StepLoading />
        </div>
        <div style={{ display: step === 4 ? 'block' : 'none' }}>
          <StepResult result={result} />
        </div>
      </div>
    </div>
  );
}