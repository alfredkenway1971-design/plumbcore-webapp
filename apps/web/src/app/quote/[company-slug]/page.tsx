'use client';

import { useState, useCallback, useEffect, memo } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useI18n } from '@/components/i18n-provider';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import { Camera, Check, Clock, Shield, RefreshCcw, Wrench, AlertTriangle, Phone, ChevronLeft, ChevronRight, Star } from 'lucide-react';

/* ── Helpers ── */
const formatName = (v: string) => v.replace(/^\\s+|\\s+$/g, '').slice(0, 50).replace(/[a-zA-Z\\s'-]+/g, m => /^[a-z\\s'-]+$/i.test(m) ? m.replace(/\\b[a-z]/g, c => c.toUpperCase()).replace(/['-][a-z]/g, c => c.toUpperCase()) : m);
const validateNameChar = (v: string) => /^[a-zA-Z\\s'-]*$/.test(v);
const formatPhone = (v: string) => { let d = v.replace(/\\D/g, ''); if (d.startsWith('1') && d.length > 1) d = d.slice(1); d = d.slice(0, 10); if (!d) return ''; if (d.length <= 3) return `+1 (${d}`; if (d.length <= 6) return `+1 (${d.slice(0, 3)}) ${d.slice(3)}`; return `+1 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`; };
const validatePhone = (v: string) => { const d = v.replace(/\\D/g, '').replace(/^1/, ''); return d.length === 10 && parseInt(d.slice(0, 3)) >= 200; };
const cleanPhone = (v: string) => v.replace(/\\D/g, '').replace(/^1/, '').slice(0, 10);

/* ── Image compression: resize to max 512px before upload ── */
function compressImage(file: File, maxW: number = 512): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > maxW) { height *= maxW / width; width = maxW; }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        resolve(new File([blob!], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
      }, 'image/jpeg', 0.8);
    };
    img.src = URL.createObjectURL(file);
  });
}

/* ── Step Indicator ── */
function StepIndicator({ current, total }: { current: number; total: number }) {
  const labels = ['Upload', 'Info', 'Analyze', 'Estimate'];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i + 1 <= current ? 'bg-blue-500 text-white shadow-sm' : 'bg-slate-100 text-slate-400'}`}>
            {i + 1 < current ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          {i < total - 1 && <div className={`w-10 sm:w-16 h-0.5 mx-1 transition-colors ${i + 1 < current ? 'bg-blue-500' : 'bg-slate-200'}`} />}
        </div>
      ))}
    </div>
  );
}

/* ── Step 1 — Upload ── */
const StepUpload = memo(function StepUpload({ photos, onAdd, onRemove, onNext }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">What needs fixing?</h1>
        <p className="text-sm text-slate-500">Snap a photo — we&apos;ll price it instantly</p>
      </div>
      <label className="relative block w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all overflow-hidden group">
        <input type="file" accept="image/*" multiple onChange={onAdd} className="absolute inset-0 opacity-0 cursor-pointer z-10" aria-label="Upload photos" />
        {photos.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 transition-transform group-hover:scale-105">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center"><Camera className="w-7 h-7 text-slate-400" /></div>
            <div className="text-center"><p className="text-sm font-semibold text-slate-900">Tap to add photos</p><p className="text-xs text-slate-400 mt-0.5">Leak, clog, crack — show us the issue</p></div>
          </div>
        ) : (
          <div className="p-3 h-full flex flex-col">
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {photos.map((p: File, i: number) => (
                <div key={i} className="relative rounded-lg overflow-hidden bg-slate-100 aspect-square border border-slate-200">
                  <img src={URL.createObjectURL(p)} className="w-full h-full object-cover" alt={`Photo ${i+1}`} />
                  <button type="button" onClick={e => { e.preventDefault(); onRemove(i); }} className="absolute top-1.5 right-1.5 w-6 h-6 bg-slate-900/70 text-white rounded-full flex items-center justify-center text-xs hover:bg-slate-900 active:scale-90 transition-all">✕</button>
                </div>
              ))}
            </div>
            {photos.length < 4 && <label className="mt-2 py-2 text-xs text-center text-blue-600 font-medium cursor-pointer hover:text-blue-700 active:scale-95 transition-all">+ Add more photos</label>}
          </div>
        )}
      </label>
      <div className="flex items-center justify-center gap-4 text-xs text-slate-400 mb-2">
        <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-500" /> No signup</span>
        <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-500" /> Upfront price</span>
        <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-500" /> Licensed plumbers</span>
      </div>
      <button onClick={onNext} disabled={photos.length === 0} className="w-full h-12 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:bg-slate-200 disabled:text-slate-400 text-slate-900 font-bold transition-all active:scale-[0.97] text-sm shadow-sm flex items-center justify-center gap-2">
        {photos.length > 0 ? 'Continue' : 'Select photos'} <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
});

/* ── Step 2 — Info ── */
const StepInfo = memo(function StepInfo({ form, setForm, phoneDisplay, onPhoneChange, phoneValid, canSubmit, onBack, onEstimate }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Where to send your price?</h2>
        <p className="text-sm text-slate-500">We&apos;ll text you the breakdown</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <Input type="text" placeholder="Your full name" value={form.name} onChange={(e: any) => { const raw = e.target.value; if (!validateNameChar(raw)) return; setForm((p: any) => ({ ...p, name: formatName(raw) })); }} className="rounded-xl border-slate-200 focus:border-blue-400 h-12" autoComplete="name" maxLength={50} />
        <div className="relative">
          <Input type="tel" inputMode="numeric" placeholder="+1 (555) 555-5555" value={phoneDisplay} onChange={onPhoneChange} className={`rounded-xl border-slate-200 focus:border-blue-400 h-12 pl-8 ${phoneDisplay.length > 0 && !phoneValid ? 'border-red-300' : ''}`} autoComplete="tel-national" />
          {phoneDisplay.length > 0 && !phoneValid && <p className="text-xs text-red-500 mt-1.5 ml-1">Enter a valid US or Canada phone</p>}
        </div>
        <Input type="email" inputMode="email" placeholder="Email address (optional)" value={form.email} onChange={(e: any) => setForm((p: any) => ({ ...p, email: e.target.value }))} className="rounded-xl border-slate-200 focus:border-blue-400 h-12" autoComplete="email" />
        <AddressAutocomplete value={form.address} onChange={(val: string) => setForm((p: any) => ({ ...p, address: val }))} placeholder="Service address" />
        <Textarea placeholder="Briefly describe the problem..." rows={2} value={form.desc} onChange={(e: any) => setForm((p: any) => ({ ...p, desc: e.target.value }))} className="rounded-xl border-slate-200 focus:border-blue-400 resize-none" />
        <div className="flex gap-2">
          {['Routine','Urgent','Emergency'].map((label) => {
            const val = label.toLowerCase();
            const sel = form.urgency === val;
            return (
              <button key={label} type="button" onClick={() => setForm((p: any) => ({ ...p, urgency: val }))} className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all border active:scale-[0.97] ${sel ? val === 'emergency' ? 'bg-red-50 text-red-700 border-red-200' : val === 'urgent' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                {label} {val === 'emergency' && <Badge className="ml-1 bg-red-500 text-white text-[9px] px-1 py-0">RED</Badge>}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={onBack} className="h-12 rounded-xl border border-slate-200 text-slate-700 font-medium active:scale-[0.97] transition-all flex items-center justify-center gap-1"><ChevronLeft className="w-4 h-4" /> Back</button>
        <button onClick={onEstimate} disabled={!canSubmit} className="h-12 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:bg-slate-200 disabled:text-slate-400 text-slate-900 font-bold transition-all active:scale-[0.97] shadow-sm flex items-center justify-center gap-2">
          {canSubmit ? 'Get my price' : 'Enter phone number'} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

/* ── Step 3 — Loading ── */
function StepLoading() {
  const messages = ['Analyzing your photo with AI...','Identifying the plumbing issue...','Checking parts and pricing...','Calculating your estimate...'];
  const [idx, setIdx] = useState(0);
  useEffect(() => { if (idx >= messages.length - 1) return; const t = setTimeout(() => setIdx(i => i + 1), 2000); return () => clearTimeout(t); }, [idx]);
  return (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 relative"><div className="absolute inset-0 rounded-full border-4 border-slate-100" /><div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" /></div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{messages[idx]}</h3>
      <p className="text-sm text-slate-400">This takes about 30 seconds</p>
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 text-left">
        <Skeleton className="h-4 w-24 bg-slate-200" /><Skeleton className="h-8 w-40 bg-slate-200" /><Separator className="bg-slate-100" />
        <div className="flex items-center justify-between"><Skeleton className="h-3 w-16 bg-slate-200" /><Skeleton className="h-3 w-20 bg-slate-200" /></div>
        <div className="flex items-center justify-between"><Skeleton className="h-3 w-12 bg-slate-200" /><Skeleton className="h-3 w-16 bg-slate-200" /></div>
        <Separator className="bg-slate-100" />
        <div className="flex items-center justify-between"><Skeleton className="h-4 w-20 bg-slate-200" /><Skeleton className="h-6 w-24 bg-slate-200" /></div>
      </div>
    </div>
  );
}

/* ── Step 4 — Result ── */
function StepResult({ result, onReset }: any) {
  if (!result) return null;
  const sevColors: Record<string,string> = { low:'bg-emerald-50 text-emerald-700 border-emerald-200', moderate:'bg-amber-50 text-amber-700 border-amber-200', high:'bg-orange-50 text-orange-700 border-orange-200', emergency:'bg-red-50 text-red-700 border-red-200' };
  const f = (n: number) => `$${n.toFixed(2)}`;
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Your Estimate</h2>
        <p className="text-sm text-slate-400">Valid for 24 hours</p>
      </div>
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white text-center shadow-lg">
        <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider mb-1">Total Estimated Price</p>
        <p className="text-4xl sm:text-5xl font-extrabold">{f(result.totalPrice)}</p>
        <p className="text-xs text-blue-200 mt-2">Includes labor, parts, and tax</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">DIAGNOSIS</p><p className="text-sm font-medium text-slate-900">{result.diagnosis}</p></div>
          <Badge className={`ml-3 text-xs font-medium px-3 py-1 ${result.confidence >= 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : result.confidence >= 70 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{result.confidence}%</Badge>
        </div>
        <div className="flex items-center justify-between py-4 border-b border-slate-100"><span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SEVERITY</span><Badge className={`text-xs font-medium px-3 py-1 ${sevColors[result.severity] || sevColors.low}`}>{result.severity.charAt(0).toUpperCase() + result.severity.slice(1)}</Badge></div>
        <div className="flex items-center justify-between py-4 border-b border-slate-100"><span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">LABOR <span className="font-normal text-slate-400 ml-1">{result.estimatedHours}h @ ${result.laborRate}/hr</span></span><span className="text-sm font-semibold text-slate-900">{f(result.laborCost)}</span></div>
        {result.parts?.length > 0 && <div className="py-4 border-b border-slate-100"><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">PARTS</p>{result.parts.map((p: any, i: number) => <div key={i} className="grid grid-cols-[2.5rem_1fr_5rem_5rem] gap-x-2 text-sm text-slate-700 px-1 py-1"><span className="text-slate-400">{p.qty}x</span><span>{p.name}</span><span className="text-right text-slate-500">{f(p.unitPrice)}</span><span className="text-right font-medium text-slate-900">{f(p.total)}</span></div>)}</div>}
        <div className="flex items-center justify-between py-4 border-b border-slate-100"><span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">TAX <span className="font-normal text-slate-400 ml-1">{(result.taxRate||0.085)*100}%</span></span><span className="text-sm font-semibold text-slate-900">{f(result.tax)}</span></div>
        <div className="flex items-center justify-between pt-4"><span className="text-base font-bold text-slate-900">TOTAL</span><span className="text-2xl font-extrabold text-blue-600">{f(result.totalPrice)}</span></div>
      </div>
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white text-center space-y-4 shadow-lg">
        <h3 className="text-lg font-bold">Book This Appointment</h3>
        <p className="text-sm text-slate-400">Pay a $49 deposit to secure your booking</p>
        <button className="w-full h-12 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold shadow-sm transition-all active:scale-[0.97]">Pay $49 Deposit — {f(result.totalPrice)}</button>
        <p className="text-xs text-slate-500">Deposit deducted from final bill. Fully refundable.</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400"><span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-500" /> Secure payment</span><span className="flex items-center gap-1.5"><RefreshCcw className="w-3.5 h-3.5 text-emerald-500" /> Fully refundable</span><span className="flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5 text-emerald-500" /> Licensed & insured</span></div>
      <div className="text-center"><button onClick={onReset} className="h-10 px-5 rounded-xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition-all">Start over</button></div>
    </div>
  );
}

/* ═══ MAIN PAGE ═══ */
export default function QuotePage() {
  const params = useParams();
  const companySlug = params?.['company-slug'] as string || 'plumbcore';
  const { locale, changeLocale } = useI18n();
  const [step, setStep] = useState<1|2|3|4>(1);
  const [photos, setPhotos] = useState<File[]>([]);
  const [form, setForm] = useState({ name:'', phone:'', email:'', address:'', desc:'', urgency:'routine' });
  const [phoneDisplay, setPhoneDisplay] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string|null>(null);

  const addPhotos = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const compressed = await Promise.all(files.map(f => compressImage(f, 512)));
    setPhotos(p => [...p, ...compressed].slice(0, 4));
    e.target.value = '';
  }, []);
  const removePhoto = useCallback((i: number) => setPhotos(p => p.filter((_,idx) => idx !== i)), []);
  const handlePhone = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { const d = e.target.value.replace(/\D/g,''); const n = d.startsWith('1')?d.slice(1):d; if (n.length > 10) return; setPhoneDisplay(formatPhone(e.target.value)); setForm(p => ({...p, phone: cleanPhone(e.target.value)})); }, []);

  const handleEstimate = useCallback(async () => {
    setStep(3); setError(null);
    try {
      const res = await fetch('/api/ai/analyze-photo', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({photoCount:photos.length, customerPhone:form.phone, customerDescription:form.desc}) });
      const data = await res.json();
      if (data.success && data.result) setResult(data.result);
      else setResult({ diagnosis:'Unable to analyze fully. A licensed plumber will inspect on arrival.', severity:'moderate', estimatedHours:1, laborRate:120, laborCost:120, parts:[{name:'Diagnostic fee', qty:1, unitPrice:49, total:49}], partsTotal:49, tax:14.37, taxRate:0.085, totalPrice:183.37, confidence:65 });
    } catch { setResult({ diagnosis:'Unable to analyze fully. A licensed plumber will inspect on arrival.', severity:'moderate', estimatedHours:1, laborRate:120, laborCost:120, parts:[{name:'Diagnostic fee', qty:1, unitPrice:49, total:49}], partsTotal:49, tax:14.37, taxRate:0.085, totalPrice:183.37, confidence:65 }); }
    setStep(4);
  }, [form, photos]);

  const resetFlow = useCallback(() => { setStep(1); setPhotos([]); setForm({name:'',phone:'',email:'',address:'',desc:'',urgency:'routine'}); setPhoneDisplay(''); setResult(null); setError(null); }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm"><span className="text-white text-sm font-bold">P</span></div>
            <div><p className="text-sm font-bold text-slate-900">PlumbCore <span className="text-blue-500">AI</span></p><p className="text-[11px] text-slate-400">Premium Plumbing Services</p></div>
          </a>
          <div className="flex items-center gap-2">
            <a href="tel:+155****4567" className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-all active:scale-95"><Phone className="w-4 h-4" /><span className="hidden sm:inline">(555) 123-4567</span></a>
            <LanguageSwitcher locale={locale} onLocaleChange={l => changeLocale(l as 'en'|'fr'|'es'|'de')} />
          </div>
        </div>
      </header>
      <section className="bg-gradient-to-b from-slate-50 to-white py-10 sm:py-14">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-600 mb-4"><Clock className="w-3 h-3" /> Takes 2 minutes</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">Get a Free Estimate in 2 Minutes</h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-lg mx-auto">Upload a photo, describe the issue, and get an AI-powered price instantly — no signup required.</p>
        </div>
      </section>
      <section className="py-6 sm:py-10 pb-20">
        <div className="max-w-lg mx-auto px-4">
          {error && <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-2 text-sm text-red-700"><AlertTriangle className="w-4 h-4 shrink-0" />{error}</div>}
          <StepIndicator current={step} total={4} />
          <div style={{ display: step === 1 ? 'block' : 'none' }}><StepUpload photos={photos} onAdd={addPhotos} onRemove={removePhoto} onNext={() => setStep(2)} /></div>
          <div style={{ display: step === 2 ? 'block' : 'none' }}><StepInfo form={form} setForm={setForm} phoneDisplay={phoneDisplay} onPhoneChange={handlePhone} phoneValid={validatePhone(phoneDisplay)} canSubmit={form.phone.length >= 10} onBack={() => setStep(1)} onEstimate={handleEstimate} /></div>
          <div style={{ display: step === 3 ? 'block' : 'none' }}><StepLoading /></div>
          <div style={{ display: step === 4 ? 'block' : 'none' }}><StepResult result={result} onReset={resetFlow} /></div>
        </div>
      </section>
    </div>
  );
}
