'use client';

import { useState, useCallback, useRef, useEffect, memo } from 'react';

const formatPhone = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 10); if (!d) return ''; if (d.length <= 3) return `(${d}`; if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`; return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`; };
const validatePhone = (v: string) => v.replace(/\D/g, '').length === 10;

/* ═══ Step 1 — Photo Upload ═══ */
const StepUpload = memo(({ photos, onAdd, onRemove, onNext }: any) => (
  <div className="space-y-8">
    <div className="text-center space-y-2">
      <p className="text-xs font-semibold text-gray-900 uppercase tracking-[0.2em]">Step 1 of 3</p>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">What needs fixing?</h1>
      <p className="text-sm text-gray-500 max-w-xs mx-auto">Snap a photo, we'll price it instantly.</p>
    </div>
    <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
      <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>No signup</span>
      <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Upfront price</span>
      <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Licensed</span>
    </div>
    <label className="relative block w-full aspect-[4/3] rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-200 cursor-pointer hover:border-gray-400 transition-colors overflow-hidden group">
      <input type="file" accept="image/*" multiple onChange={onAdd} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
      {photos.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 transition-transform group-hover:scale-105">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>
          </div>
          <div className="text-center"><p className="text-sm font-semibold text-gray-900">Tap to add photos</p><p className="text-xs text-gray-400 mt-0.5">Leak, clog, crack — show us the issue</p></div>
        </div>
      ) : (
        <div className="p-3 h-full flex flex-col">
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2">{photos.map((p: any, i: number) => <div key={i} className="relative rounded-xl overflow-hidden bg-gray-100 aspect-square"><img src={URL.createObjectURL(p)} className="w-full h-full object-cover" alt="" /><button type="button" onClick={(e) => { e.preventDefault(); onRemove(i); }} className="absolute top-1.5 right-1.5 w-6 h-6 bg-gray-900/70 text-white rounded-full flex items-center justify-center text-xs hover:bg-gray-900">&#10005;</button></div>)}</div>
          {photos.length < 4 && <label className="mt-2 py-2 text-xs text-center text-blue-600 font-medium cursor-pointer hover:text-blue-700">+ Add more photos</label>}
        </div>
      )}
    </label>
    <button onClick={onNext} disabled={photos.length === 0} className="w-full bg-gray-900 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3.5 rounded-xl disabled:cursor-not-allowed active:scale-[0.97] transition-all text-sm shadow-sm">{photos.length > 0 ? 'Continue →' : 'Select photos'}</button>
  </div>
));

/* ═══ Step 2 — Your Info ═══ */
const StepInfo = memo(({ form, setForm, phoneDisplay, onPhoneChange, phoneValid, canSubmit, onBack, onEstimate }: any) => {
  const addressRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (!addressRef.current || typeof (window as any).google === 'undefined') return; try { const g = (window as any).google; const a = new g.maps.places.Autocomplete(addressRef.current, { types: ['address'], componentRestrictions: { country: ['us', 'ca'] } }); a.addListener('place_changed', () => { const p = a.getPlace(); if (p?.formatted_address) setForm((f: any) => ({ ...f, address: p.formatted_address })); }); } catch {} }, []);
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-xs font-semibold text-gray-900 uppercase tracking-[0.2em]">Step 2 of 3</p>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Where to send your price?</h2>
        <p className="text-sm text-gray-500">We'll text you the breakdown</p>
      </div>
      <div className="bg-gray-50/70 rounded-2xl p-5 space-y-4 border border-gray-100">
        <input type="text" placeholder="Your full name" value={form.name} onChange={(e: any) => setForm((p: any) => ({ ...p, name: e.target.value }))} className="w-full bg-white rounded-xl border border-gray-200 px-4 py-3.5 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all placeholder:text-gray-400" autoComplete="name" />
        <div><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium z-10">+1</span><input type="tel" inputMode="numeric" placeholder="(555) 555-5555" value={phoneDisplay} onChange={onPhoneChange} className="w-full bg-white rounded-xl border border-gray-200 px-4 py-3.5 pl-10 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all placeholder:text-gray-400" autoComplete="tel-national" /></div>{phoneDisplay.length > 0 && !phoneValid && <p className="text-xs text-red-500 mt-1.5 ml-1">Enter a valid 10-digit number</p>}</div>
        <input type="email" inputMode="email" placeholder="Email address (optional)" value={form.email} onChange={(e: any) => setForm((p: any) => ({ ...p, email: e.target.value }))} className="w-full bg-white rounded-xl border border-gray-200 px-4 py-3.5 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all placeholder:text-gray-400" autoComplete="email" />
        <input ref={addressRef} type="text" placeholder="Service address" value={form.address} onChange={(e: any) => setForm((p: any) => ({ ...p, address: e.target.value }))} className="w-full bg-white rounded-xl border border-gray-200 px-4 py-3.5 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all placeholder:text-gray-400" autoComplete="street-address" />
        <textarea placeholder="Briefly describe the problem..." rows={2} value={form.desc} onChange={(e: any) => setForm((p: any) => ({ ...p, desc: e.target.value }))} className="w-full bg-white rounded-xl border border-gray-200 px-4 py-3.5 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all placeholder:text-gray-400 resize-none" />
        <select value={form.urgency} onChange={(e: any) => setForm((p: any) => ({ ...p, urgency: e.target.value }))} className="w-full bg-white rounded-xl border border-gray-200 px-4 py-3.5 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all">
          <option value="flexible">How urgent?</option>
          <option value="emergency">Emergency — Can't wait</option>
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="flexible">Flexible</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={onBack} className="rounded-xl border border-gray-200 text-gray-700 font-medium py-3.5 text-sm active:scale-[0.97] transition-all hover:bg-gray-50">← Back</button>
        <button onClick={onEstimate} disabled={!canSubmit} className="rounded-xl bg-gray-900 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3.5 disabled:cursor-not-allowed active:scale-[0.97] transition-all text-sm shadow-sm">{canSubmit ? 'Get my price →' : 'Enter phone number'}</button>
      </div>
    </div>
  );
});

/* ═══ Step 3 — Loading ═══ */
const StepLoading = memo(() => (
  <div className="flex flex-col items-center justify-center py-28 space-y-6">
    <div className="relative w-16 h-16"><div className="absolute inset-0 rounded-full border-4 border-gray-100" /><div className="absolute inset-0 rounded-full border-4 border-gray-900 border-t-transparent animate-spin" /></div>
    <div className="text-center"><p className="text-base font-semibold">AI is analyzing...</p><p className="text-sm text-gray-400 mt-1">Identifying the issue and matching parts</p></div>
  </div>
));

/* ═══ Step 4 — Result ═══ */
const StepResult = memo(function StepResult({ result }: any) {
  if (!result) return null;
  const name = result.severity ? result.severity.charAt(0).toUpperCase() + result.severity.slice(1) : 'Low';
  const parts = result.parts || [];
  return (
    <div className="space-y-5">
      <div className="text-center"><p className="text-xs font-semibold text-gray-900 uppercase tracking-[0.2em]">Your Estimate</p><p className="text-sm text-gray-400 mt-0.5">Valid for 24 hours</p></div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 bg-black text-white text-center"><p className="text-lg font-bold">{result.priceLow} - {result.priceHigh}</p><p className="text-xs text-gray-400 mt-0.5">Estimated total</p></div>
        <div className="px-5 py-4 border-b border-gray-50"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Diagnosis</p><p className="text-sm text-gray-900 mt-1">{result.diagnosis}</p>{result.confidence && <p className="text-xs text-gray-400 mt-1">{result.confidence}% confidence</p>}</div>
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between"><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Severity</span><span className={`px-3 py-1 rounded-full text-xs font-medium ${name === 'Emergency' ? 'bg-red-50 text-red-700' : name === 'High' ? 'bg-orange-50 text-orange-700' : name === 'Moderate' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>{name}</span></div>
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between"><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Labor</span><span className="text-sm font-medium">{result.estimatedHours}h at {result.laborRate}/hr</span></div>
        {parts.length > 0 && <div className="px-5 py-4 border-b border-gray-50"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Parts</p>{parts.map((p: any, i: number) => <div key={i} className="flex items-center justify-between py-1.5"><span className="text-sm text-gray-700">{p.qty}x {p.name}</span><span className="text-sm font-medium">{p.total}</span></div>)}</div>}
        <div className="p-5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50"><span className="text-sm text-gray-600">Total estimate</span><span className="text-2xl font-bold text-gray-900">{result.priceLow} - {result.priceHigh}</span></div>
      </div>
      <div className="bg-gray-900 rounded-2xl p-6 text-white text-center space-y-3">
        <p className="text-base font-bold">Book this appointment</p>
        <p className="text-sm text-gray-400">Pay a 49 deposit to secure your booking</p>
        <button className="w-full bg-white text-gray-900 font-semibold py-3.5 rounded-xl active:scale-[0.97] transition-all text-sm shadow-sm hover:bg-gray-100">Pay deposit and book</button>
        <p className="text-xs text-gray-500">Deposit deducted from final bill. Cancel anytime.</p>
      </div>
    </div>
  );
});

/* ═══ Main ═══ */
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
      setResult(data.success && data.result ? data.result : { diagnosis: 'Unable to analyze. A plumber will inspect.', severity: 'moderate', estimatedHours: 1, laborRate: 95, priceLow: 144, priceHigh: 179, confidence: 50 });
    } catch { setResult({ diagnosis: 'Unable to analyze. A plumber will inspect.', severity: 'moderate', estimatedHours: 1, laborRate: 95, priceLow: 144, priceHigh: 179, confidence: 50 }); }
    setStep(4);
  }, [form, photos]);

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <div className="bg-white border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2"><img src="/plumbcore-logo.png" alt="PlumbCore AI" className="w-7 h-7 object-contain rounded" /><span className="text-sm font-bold">plumbcore</span></div>
          <p className="text-xs text-gray-400">Estimate in 2 min</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <div className="flex items-center justify-center gap-1.5 mb-10">
          {[1,2,3,4].map(s => <div key={s} className={`h-1 rounded-full transition-all duration-500 ${step === s ? 'w-8 bg-gray-900' : step > s ? 'w-3 bg-gray-500' : 'w-3 bg-gray-200'}`} />)}
        </div>
        <div style={{ display: step === 1 ? 'block' : 'none' }}><StepUpload photos={photos} onAdd={addPhotos} onRemove={removePhoto} onNext={() => setStep(2)} /></div>
        <div style={{ display: step === 2 ? 'block' : 'none' }}><StepInfo form={form} setForm={setForm} phoneDisplay={phoneDisplay} onPhoneChange={handlePhone} phoneValid={validatePhone(phoneDisplay)} canSubmit={form.phone.length >= 10} onBack={() => setStep(1)} onEstimate={handleEstimate} /></div>
        <div style={{ display: step === 3 ? 'block' : 'none' }}><StepLoading /></div>
        <div style={{ display: step === 4 ? 'block' : 'none' }}><StepResult result={result} /></div>
      </div>
    </div>
  );
}