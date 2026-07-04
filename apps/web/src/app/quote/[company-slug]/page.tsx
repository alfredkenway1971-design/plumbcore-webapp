'use client';

import { useState, useCallback, useRef, useEffect, memo } from 'react';

const formatPhone = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 10); if (!d) return ''; if (d.length <= 3) return `(${d}`; if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`; return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`; };
const validatePhone = (v: string) => v.replace(/\D/g, '').length === 10;

const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all placeholder:text-gray-400";

const StepUpload = memo(({ photos, onAdd, onRemove, onNext }: any) => (
  <div className="space-y-6">
    <div className="text-center">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Get a free estimate</h1>
      <p className="text-sm text-gray-500 mt-1.5">Snap a photo. Get an instant price. Book in 2 minutes.</p>
    </div>
    <div className="flex justify-center gap-4 text-xs text-gray-400"><span>No signup</span><span>Upfront pricing</span><span>Licensed</span></div>
    <label className="relative block border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 cursor-pointer hover:border-gray-300 transition-colors overflow-hidden">
      <input type="file" accept="image/*" multiple onChange={onAdd} className="absolute inset-0 opacity-0 cursor-pointer" />
      {photos.length === 0 ? (
        <div className="flex flex-col items-center py-14 px-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>
          <p className="mt-4 text-sm font-medium text-gray-700">Take or upload a photo</p>
          <p className="text-xs text-gray-400 mt-1">Show us the problem</p>
        </div>
      ) : (
        <div className="p-4">
          <div className="grid grid-cols-4 gap-2">{photos.map((p: any, i: number) => <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"><img src={URL.createObjectURL(p)} className="w-full h-full object-cover" alt="" /><button type="button" onClick={(e) => { e.preventDefault(); onRemove(i); }} className="absolute top-0.5 right-0.5 w-5 h-5 bg-gray-900/60 text-white rounded-full flex items-center justify-center text-xs">&#10005;</button></div>)}</div>
          <p className="text-xs text-center text-gray-500 mt-2">Tap to add more photos</p>
        </div>
      )}
    </label>
    <button onClick={onNext} disabled={photos.length === 0} className="w-full bg-gray-900 disabled:bg-gray-300 text-white font-semibold py-3.5 rounded-xl disabled:cursor-not-allowed active:scale-[0.97] transition-all text-sm">{photos.length > 0 ? `Continue (${photos.length})` : 'Select a photo'}</button>
  </div>
));

const StepInfo = memo(({ form, setForm, phoneDisplay, onPhoneChange, phoneValid, canSubmit, onBack, onEstimate }: any) => {
  const addressRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!addressRef.current || typeof (window as any).google === 'undefined') return;
    try { const g = (window as any).google; const a = new g.maps.places.Autocomplete(addressRef.current, { types: ['address'], componentRestrictions: { country: ['us', 'ca'] } }); a.addListener('place_changed', () => { const p = a.getPlace(); if (p?.formatted_address) setForm((f: any) => ({ ...f, address: p.formatted_address })); }); } catch {}
  }, []);
  return (
    <div className="space-y-5">
      <div><h2 className="text-lg font-bold text-gray-900">Where should we send your estimate?</h2><p className="text-sm text-gray-500 mt-0.5">We will text you the price breakdown</p></div>
      <div className="space-y-3.5">
        <input type="text" placeholder="Your name" value={form.name} onChange={(e: any) => setForm((p: any) => ({ ...p, name: e.target.value }))} className={inputClass} autoComplete="name" />
        <div>
          <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">+1</span><input type="tel" inputMode="numeric" placeholder="(555) 555-5555" required value={phoneDisplay} onChange={onPhoneChange} className={`${inputClass} pl-10`} autoComplete="tel-national" /></div>
          {phoneDisplay.length > 0 && !phoneValid && <p className="text-xs text-red-500 mt-1.5 ml-1">Enter a valid 10-digit number</p>}
          {phoneValid && <p className="text-xs text-green-600 mt-1.5 ml-1">Valid number</p>}
        </div>
        <input type="email" inputMode="email" placeholder="Email (optional)" value={form.email} onChange={(e: any) => setForm((p: any) => ({ ...p, email: e.target.value }))} className={inputClass} autoComplete="email" />
        <input ref={addressRef} type="text" placeholder="Service address" value={form.address} onChange={(e: any) => setForm((p: any) => ({ ...p, address: e.target.value }))} className={inputClass} autoComplete="street-address" />
        <textarea placeholder="Describe the problem" rows={3} value={form.desc} onChange={(e: any) => setForm((p: any) => ({ ...p, desc: e.target.value }))} className={`${inputClass} resize-none`} />
        <select value={form.urgency} onChange={(e: any) => setForm((p: any) => ({ ...p, urgency: e.target.value }))} className={`${inputClass} appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%239ca3af'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E")] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10`}>
          <option value="flexible">How urgent is it?</option>
          <option value="emergency">Emergency</option>
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="flexible">Flexible</option>
        </select>
      </div>
      <div className="flex gap-3 pt-1">
        <button onClick={onBack} className="flex-1 rounded-xl border border-gray-200 text-gray-600 font-medium py-3 text-sm active:scale-[0.97] transition-all">Back</button>
        <button onClick={onEstimate} disabled={!canSubmit} className="flex-[2] bg-gray-900 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl disabled:cursor-not-allowed active:scale-[0.97] transition-all text-sm">{!canSubmit ? 'Enter phone number' : 'Get My Estimate'}</button>
      </div>
    </div>
  );
});

const StepLoading = memo(() => (
  <div className="flex flex-col items-center justify-center py-24 space-y-5">
    <div className="relative w-14 h-14"><div className="absolute inset-0 rounded-full border-4 border-gray-100" /><div className="absolute inset-0 rounded-full border-4 border-gray-900 border-t-transparent animate-spin" /></div>
    <div className="text-center space-y-1"><p className="text-base font-semibold text-gray-900">AI is analyzing your photos...</p><p className="text-sm text-gray-400">Identifying the problem</p></div>
  </div>
));

const StepResult = memo(function StepResult({ result }: any) {
  if (!result) return null;
  const sev = result.severity?.toLowerCase() || 'low';
  const sevClass = sev === 'emergency' ? 'bg-red-50 text-red-700' : sev === 'high' ? 'bg-orange-50 text-orange-700' : sev === 'moderate' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700';
  const name = result.severity ? result.severity.charAt(0).toUpperCase() + result.severity.slice(1) : 'Low';
  const parts = result.parts || [];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-start justify-between p-5 border-b border-gray-50">
          <div><h2 className="text-lg font-bold text-gray-900">Your Estimate</h2><p className="text-xs text-gray-400">Valid for 24 hours</p></div>
          <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${sevClass}`}>{name}</span>
        </div>
        <div className="bg-gray-50 px-5 py-4 mx-5 mt-4 rounded-xl">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Diagnosis</p>
          <p className="text-sm font-medium text-gray-900 mt-0.5">{result.diagnosis}</p>
          {result.confidence && <p className="text-xs text-gray-400 mt-1">{result.confidence}% confidence</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-5 mt-4">
          <div className="bg-gray-50 rounded-xl p-3 text-center"><p className="text-xs text-gray-500">Labor</p><p className="text-lg font-bold text-gray-900">{result.estimatedHours}h</p><p className="text-xs text-gray-400">{result.laborRate}/hr</p></div>
          <div className="bg-green-50 rounded-xl p-3 text-center"><p className="text-xs text-gray-500">Total</p><p className="text-xl font-bold text-green-600">{result.priceLow} - {result.priceHigh}</p></div>
        </div>
        {parts.length > 0 && (
          <div className="px-5 mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Parts Needed</p>
            <div className="space-y-2">{parts.map((p: any, i: number) => <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"><span className="text-sm text-gray-700">{p.qty}x {p.name}</span><span className="text-sm font-medium text-gray-900">{p.total}</span></div>)}</div>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-gray-100 mx-5 mt-4 pt-3 pb-5">
          <span className="text-sm font-medium text-gray-500">Estimated total</span>
          <span className="text-lg font-bold text-green-600">{result.priceLow} - {result.priceHigh}</span>
        </div>
      </div>
      <div className="bg-gray-900 rounded-2xl p-6 text-white text-center space-y-3">
        <p className="text-base font-bold">Ready to fix it?</p>
        <p className="text-sm text-gray-400">Pay a 49 deposit to book now. Fully refundable.</p>
        <button className="w-full bg-white text-gray-900 font-semibold py-3.5 rounded-xl active:scale-[0.97] transition-all text-sm shadow-sm">Pay 49 Deposit and Book</button>
        <p className="text-xs text-gray-500">Deposit deducted from final bill.</p>
      </div>
    </div>
  );
});

export default function QuotePage() {
  const [step, setStep] = useState<1|2|3|4>(1);
  const [photos, setPhotos] = useState<File[]>([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', desc: '', urgency: 'flexible' });
  const [phoneDisplay, setPhoneDisplay] = useState('');
  const [result, setResult] = useState<any>(null);

  const addPhotos = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setPhotos(p => [...p, ...Array.from(e.target.files || [])].slice(0, 4)); e.target.value = ''; }, []);
  const removePhoto = useCallback((i: number) => setPhotos(p => p.filter((_, idx) => idx !== i)), []);
  const handlePhone = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { const d = e.target.value.replace(/\D/g, ''); if (d.length > 10) return; setPhoneDisplay(formatPhone(e.target.value)); setForm(p => ({ ...p, phone: d })); }, []);
  const handleEstimate = useCallback(async () => {
    setStep(3);
    try {
      const res = await fetch('/api/ai/analyze-photo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ photoCount: photos.length, customerPhone: form.phone, customerDescription: form.desc }) });
      const data = await res.json();
      setResult(data.success && data.result ? data.result : { diagnosis: 'Unable to analyze photo. A plumber will inspect.', severity: 'moderate', estimatedHours: 1, laborRate: 95, priceLow: 144, priceHigh: 179, confidence: 50 });
      setStep(4);
    } catch { setResult({ diagnosis: 'Unable to analyze photo. A plumber will inspect.', severity: 'moderate', estimatedHours: 1, laborRate: 95, priceLow: 144, priceHigh: 179, confidence: 50 }); setStep(4); }
  }, [form, photos]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center justify-center gap-1.5 mb-8">
          {[1,2,3,4].map(s => <div key={s} className={`w-2 h-2 rounded-full transition-all duration-300 ${step === s ? 'w-6 bg-gray-900' : step > s ? 'bg-gray-500' : 'bg-gray-200'}`} />)}
        </div>
        <div style={{ display: step === 1 ? 'block' : 'none' }}><StepUpload photos={photos} onAdd={addPhotos} onRemove={removePhoto} onNext={() => setStep(2)} /></div>
        <div style={{ display: step === 2 ? 'block' : 'none' }}><StepInfo form={form} setForm={setForm} phoneDisplay={phoneDisplay} onPhoneChange={handlePhone} phoneValid={validatePhone(phoneDisplay)} canSubmit={form.phone.length >= 10} onBack={() => setStep(1)} onEstimate={handleEstimate} /></div>
        <div style={{ display: step === 3 ? 'block' : 'none' }}><StepLoading /></div>
        <div style={{ display: step === 4 ? 'block' : 'none' }}><StepResult result={result} /></div>
      </div>
    </div>
  );
}