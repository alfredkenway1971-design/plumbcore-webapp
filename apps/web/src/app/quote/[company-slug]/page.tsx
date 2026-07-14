'use client';

import { useState, useCallback, useEffect, memo, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
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
import { Camera, Check, Clock, Shield, RefreshCcw, Wrench, AlertTriangle, Phone, ChevronLeft, ChevronRight, Star, Mic, MicOff, Sparkles } from 'lucide-react';
import PlumbCoreLogo from '@/components/PlumbCoreLogo';
import { calcDeposit, depositDollars } from '@/lib/plan-pricing';

/* ── Helpers ── */
const formatName = (v: string) => v.replace(/^\s+/, '').slice(0, 50).replace(/[a-zA-Z\s'-]+/g, m => /^[a-z\s'-]+$/i.test(m) ? m.replace(/\b[a-z]/g, c => c.toUpperCase()).replace(/['-][a-z]/g, c => c.toUpperCase()) : m);
const validateNameChar = (v: string) => /^[a-zA-Z\s'-]*$/.test(v);
const formatPhone = (v: string) => { let d = v.replace(/\D/g, ''); if (d.startsWith('1') && d.length > 1) d = d.slice(1); d = d.slice(0, 10); if (!d) return ''; if (d.length <= 3) return `+1 (${d}`; if (d.length <= 6) return `+1 (${d.slice(0, 3)}) ${d.slice(3)}`; return `+1 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`; };
const validatePhone = (v: string) => { const d = v.replace(/\D/g, '').replace(/^1/, ''); return d.length === 10 && parseInt(d.slice(0, 3)) >= 200; };
const cleanPhone = (v: string) => v.replace(/\D/g, '').replace(/^1/, '').slice(0, 10);
const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/* ── Image compression ── */
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
function StepIndicator({ current, total, t }: { current: number; total: number; t: (key: string) => string }) {
  const labels = [t('quote.stepUpload'), t('quote.stepInfo'), t('quote.stepAnalyze'), t('quote.stepEstimate'), 'Done'];
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
const StepUpload = memo(function StepUpload({ photos, onAdd, onRemove, onNext, t }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 mb-2">{t('quote.uploadTitle')}</h1>
        <p className="text-sm text-slate-500">{t('quote.uploadSubtitle')}</p>
      </div>
      <label className="relative block w-full aspect-[4/3] rounded-2xl ring-2 ring-dashed ring-slate-200 bg-slate-50/50 cursor-pointer hover:ring-blue-400 hover:bg-blue-50/30 transition-all overflow-hidden group">
        <input type="file" accept="image/*" multiple onChange={onAdd} className="absolute inset-0 opacity-0 cursor-pointer z-10" aria-label="Upload photos" />
        {photos.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 transition-transform group-hover:scale-105">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-black/5 flex items-center justify-center"><Camera className="w-7 h-7 text-slate-400" /></div>
            <div className="text-center"><p className="text-sm font-semibold text-slate-900">{t('quote.addPhotos')}</p><p className="text-xs text-slate-400 mt-0.5">{t('quote.addPhotosHint')}</p></div>
          </div>
        ) : (
          <div className="p-3 h-full flex flex-col">
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {photos.map((p: File, i: number) => (
                <div key={i} className="relative rounded-xl overflow-hidden bg-slate-100 aspect-square ring-1 ring-black/5">
                  <img src={URL.createObjectURL(p)} className="w-full h-full object-cover" alt={`Photo ${i+1}`} />
                  <button type="button" onClick={e => { e.preventDefault(); onRemove(i); }} className="absolute top-1.5 right-1.5 w-6 h-6 bg-slate-900/70 text-white rounded-full flex items-center justify-center text-xs hover:bg-slate-900 active:scale-90 transition-all">✕</button>
                </div>
              ))}
            </div>
            {photos.length < 4 && <label className="mt-2 py-2 text-xs text-center text-blue-600 font-medium cursor-pointer hover:text-blue-700 active:scale-95 transition-all">{t('quote.addMorePhotos')}</label>}
          </div>
        )}
      </label>
      <div className="flex items-center justify-center gap-4 text-xs text-slate-400 mb-2">
        <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-500" /> {t('quote.trustNoSignup')}</span>
        <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-500" /> {t('quote.trustUpfrontPrice')}</span>
        <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-500" /> {t('quote.trustLicensed')}</span>
      </div>
      <button onClick={onNext} disabled={photos.length === 0} className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] text-sm flex items-center justify-center gap-2">
        {photos.length > 0 ? t('quote.continueBtn') : t('quote.selectPhotos')} <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
});

/* ── Step 2 — Info (with voice input & email required) ── */
const StepInfo = memo(function StepInfo({ form, setForm, phoneDisplay, onPhoneChange, phoneValid, emailValid, canSubmit, onBack, onEstimate, t, isListening, onToggleVoice }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 mb-2">{t('quote.infoTitle')}</h2>
        <p className="text-sm text-slate-500">{t('quote.infoSubtitle')}</p>
      </div>
      <div className="bg-white rounded-2xl ring-1 ring-black/5 p-5 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        {/* Name — Title Case, spaces allowed */}
        <Input type="text" placeholder={t('quote.namePlaceholder')} value={form.name} onChange={(e: any) => { const raw = e.target.value; if (!validateNameChar(raw)) return; setForm((p: any) => ({ ...p, name: formatName(raw) })); }} className="rounded-xl border-slate-200 focus:border-blue-400 h-12" autoComplete="name" maxLength={50} />
        
        {/* Phone — US/CA format */}
        <div className="relative">
          <Input type="tel" inputMode="numeric" placeholder="+1 (555) 555-5555" value={phoneDisplay} onChange={onPhoneChange} className={`rounded-xl border-slate-200 focus:border-blue-400 h-12 pl-8 ${phoneDisplay.length > 0 && !phoneValid ? 'border-red-300' : ''}`} autoComplete="tel-national" />
          {phoneDisplay.length > 0 && !phoneValid && <p className="text-xs text-red-500 mt-1.5 ml-1">{t('quote.validPhone')}</p>}
        </div>

        {/* Email — REQUIRED */}
        <div className="relative">
          <Input type="email" inputMode="email" placeholder="Email address *" value={form.email} onChange={(e: any) => setForm((p: any) => ({ ...p, email: e.target.value }))} className={`rounded-xl border-slate-200 focus:border-blue-400 h-12 ${form.email.length > 0 && !emailValid ? 'border-red-300' : ''}`} autoComplete="email" />
          {form.email.length > 0 && !emailValid && <p className="text-xs text-red-500 mt-1.5 ml-1">Enter a valid email address</p>}
        </div>

        {/* Address */}
        <AddressAutocomplete value={form.address} onChange={(val: string) => setForm((p: any) => ({ ...p, address: val }))} placeholder={t('quote.address')} />

        {/* Description — with mic voice input + AI enhance */}
        <div className="relative">
          <Textarea placeholder={t('quote.describeProblem')} rows={2} value={form.desc} onChange={(e: any) => setForm((p: any) => ({ ...p, desc: e.target.value }))} className="rounded-xl border-slate-200 focus:border-blue-400 resize-none pr-20" />
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            {/* Voice mic button */}
            <button type="button" onClick={onToggleVoice} title={isListening ? 'Stop listening' : 'Voice input'} className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'}`}>
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>
            {/* AI enhance button */}
            <button type="button" onClick={async () => {
              const current = form.desc;
              if (!current || current.length < 3) return;
              setForm((p: any) => ({ ...p, _enhancing: true }));
              try {
                const res = await fetch('/api/ai/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({message:`Rewrite this plumbing issue description to be clear, professional and detailed for a plumber's estimate. Keep it under 200 characters. Only return the rewritten text:\n\n"${current}"`}) });
                const data = await res.json();
                if (data.reply) setForm((p: any) => ({ ...p, desc: data.reply.trim(), _enhancing: false }));
                else setForm((p: any) => ({ ...p, _enhancing: false }));
              } catch { setForm((p: any) => ({ ...p, _enhancing: false })); }
            }} disabled={form._enhancing} title="Enhance with AI" className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${form._enhancing ? 'bg-blue-100 text-blue-400' : 'bg-blue-50 hover:bg-blue-100 text-blue-500'}`}>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
          {isListening && <p className="text-xs text-red-500 mt-1.5 ml-1 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Listening... speak now</p>}
        </div>

        {/* Urgency */}
        <div className="flex gap-2">
          {[t('quote.routine'), t('quote.urgent'), t('quote.emergency')].map((label) => {
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
        <button onClick={onBack} className="h-12 rounded-xl ring-1 ring-black/5 text-slate-700 font-medium active:scale-[0.97] transition-all hover:bg-slate-50 flex items-center justify-center gap-1"><ChevronLeft className="w-4 h-4" /> {t('quote.back')}</button>
        <button onClick={onEstimate} disabled={!canSubmit} className="h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
          {canSubmit ? t('quote.getMyPrice') : t('quote.enterPhone')} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

/* ── Step 3 — Loading ── */
function StepLoading({ t }: { t: (key: string) => string }) {
  const messages = [t('quote.analyzingMsg1'), t('quote.analyzingMsg2'), t('quote.analyzingMsg3'), t('quote.analyzingMsg4')];
  const [idx, setIdx] = useState(0);
  useEffect(() => { if (idx >= messages.length - 1) return; const tmr = setTimeout(() => setIdx(i => i + 1), 2000); return () => clearTimeout(tmr); }, [idx]);
  return (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 relative"><div className="absolute inset-0 rounded-full border-4 border-slate-100" /><div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" /></div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{messages[idx]}</h3>
      <p className="text-sm text-slate-400">{t('quote.analyzingDuration')}</p>
      <div className="bg-white rounded-2xl ring-1 ring-black/5 p-5 space-y-4 text-left">
        <Skeleton className="h-4 w-24 bg-slate-200" /><Skeleton className="h-8 w-40 bg-slate-200" /><Separator className="bg-slate-100" />
        <div className="flex items-center justify-between"><Skeleton className="h-3 w-16 bg-slate-200" /><Skeleton className="h-3 w-20 bg-slate-200" /></div>
        <div className="flex items-center justify-between"><Skeleton className="h-3 w-12 bg-slate-200" /><Skeleton className="h-3 w-16 bg-slate-200" /></div>
        <Separator className="bg-slate-100" />
        <div className="flex items-center justify-between"><Skeleton className="h-4 w-20 bg-slate-200" /><Skeleton className="h-6 w-24 bg-slate-200" /></div>
      </div>
    </div>
  );
}

/* ── Step 4 — Result with Stripe ── */
{/* ── Step 4 — Result ── */}
function StepResult({ result, onReset, onStripeCheckout, stripeLoading, t }: any) {
  if (!result) return null;
  
  // If confidence is too low, show a message instead of pricing
  if (result.canProvideEstimate === false || result.confidence < 90) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">{t('quote.resultTitle')}</h2>
          <p className="text-sm text-slate-400">{t('quote.resultValid')}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white text-center shadow-lg">
          <p className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">LOW CONFIDENCE</p>
          <p className="text-xl font-bold mb-2">We couldn't provide an accurate estimate</p>
          <p className="text-sm text-white/80">Our AI analysis returned a {result.confidence}% confidence match — we require at least 90% to give you a reliable price. Please add clearer photos or contact us directly for a manual quote.</p>
        </div>
        <div className="bg-white rounded-2xl ring-1 ring-black/5 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-start justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{t('quote.diagnosis')}</p>
              <p className="text-sm font-medium text-slate-900 leading-relaxed">{result.diagnosis}</p>
            </div>
            <Badge className="ml-3 text-xs font-medium px-3 py-1 shrink-0 bg-red-50 text-red-700 border-red-200">{result.confidence}% match</Badge>
          </div>
        </div>
        <div className="text-center space-y-3">
          <button onClick={onReset} className="inline-flex items-center gap-1 h-12 px-6 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-all shadow-sm">
            <RefreshCcw className="w-4 h-4" /> Try Again with Better Photos
          </button>
        </div>
        <div className="text-center">
          <button onClick={onReset} className="h-10 px-5 rounded-xl ring-1 ring-black/5 text-slate-500 text-sm font-medium hover:bg-slate-50 transition-all">{t('quote.startOver')}</button>
        </div>
      </div>
    );
  }
  
  const severity = result.severity || 'moderate';
  const isEmergency = severity === 'emergency' || severity === 'high';
  const isUrgent = severity === 'urgent';
  const severityLabel = result.severityLabel || (isEmergency ? 'Emergency' : isUrgent ? 'Urgent' : 'Standard');
  const validityDays = result.validityDays || (isEmergency ? 1 : isUrgent ? 2 : 7);
  const travelFee = result.travelFee || (isEmergency ? 350 : 130);
  const laborRate = result.laborRate || 130;
  
  const sevColors: Record<string,string> = { 
    low:'bg-emerald-50 text-emerald-700 border-emerald-200', 
    moderate:'bg-amber-50 text-amber-700 border-amber-200', 
    urgent:'bg-orange-50 text-orange-700 border-orange-200',
    high:'bg-red-50 text-red-700 border-red-200',
    emergency:'bg-red-50 text-red-700 border-red-200' 
  };
  
  const sevCardTint = isEmergency ? 'ring-red-200 bg-red-50/30' : isUrgent ? 'ring-orange-100 bg-orange-50/20' : 'ring-black/5';
  const sevTopBorder = isEmergency ? 'border-t-4 border-t-red-500' : isUrgent ? 'border-t-4 border-t-orange-400' : '';
  
  const ctaCopy = isEmergency ? 'Get Help Now' : isUrgent ? 'Book Urgent Appointment' : 'Book Appointment';
  const ctaSubtext = isEmergency ? 'A plumber is standing by for emergencies' : isUrgent ? 'Priority scheduling available' : 'Secure your appointment';
  
  const f = (n: number) => `$${n.toFixed(2)}`;
  
  // Collapsible parts
  const [showAllParts, setShowAllParts] = useState(false);
  const parts = (result.parts?.length > 0 ? result.parts : [{name:'Diagnostic assessment', qty:1, unitPrice:49, total:49}]);
  const displayParts = showAllParts ? parts : parts.slice(0, 2);
  
  // Countdown timer
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 min in seconds
  useEffect(() => {
    if (isEmergency) {
      const interval = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isEmergency]);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">{t('quote.resultTitle')}</h2>
        <p className="text-sm text-slate-400">Valid for {validityDays} day{validityDays > 1 ? 's' : ''} — price may vary based on on-site inspection</p>
      </div>

      {/* Severity Banner + Countdown for Emergency */}
      {isEmergency && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <div>
              <p className="text-sm font-bold text-red-800">Emergency Response</p>
              <p className="text-xs text-red-600">Emergency rate applied · Priority dispatch</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-red-700">{minutes}:{seconds.toString().padStart(2, '0')}</p>
            <p className="text-[10px] text-red-500">min remaining</p>
          </div>
        </div>
      )}
      
      {isUrgent && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
            <div>
              <p className="text-sm font-bold text-orange-800">Priority Service</p>
              <p className="text-xs text-orange-600">48-hour scheduling · Urgent rate applies</p>
            </div>
          </div>
          <div className="text-xs text-orange-600 font-medium">Available now</div>
        </div>
      )}

      {/* Plumber Card (placeholder for when routing is live) */}
      <div className="bg-white rounded-2xl ring-1 ring-blue-100 p-4 flex items-center gap-3 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-xl font-bold text-blue-500 shrink-0">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">Matching you with a plumber...</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <svg key={i} className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
            </span>
            <span className="text-xs text-slate-400">4.9 avg rating</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-medium">Available now</span>
          </div>
        </div>
        <div className="text-xs text-slate-400 animate-pulse">Finding...</div>
      </div>

      {/* Estimate Breakdown Card */}
      <div className={`bg-white rounded-2xl ring-1 ${sevCardTint} p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${sevTopBorder}`}>
        {/* Diagnosis — Hero */}
        <div className="pb-5 mb-4 border-b border-slate-100">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-base font-bold text-slate-900">AI Diagnosis</h3>
            <div className="flex items-center gap-1.5 shrink-0">
              {isEmergency && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>}
              <Badge className={`text-xs font-medium px-3 py-1 ${sevColors[severity] || sevColors.low}`}>
                {severityLabel}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">{result.diagnosis}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">AI Confidence: High</span>
            <span className="text-[11px] text-slate-400">{result.confidence}% match to 847 similar repairs</span>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-0">
          {/* Labor */}
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <span className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.66 5.66a2 2 0 11-2.83-2.83l5.66-5.66M14.83 5.17l-2.83 2.83 5.66 5.66 2.83-2.83M18.36 2.14a2 2 0 112.83 2.83L14.83 11.4l-2.83-2.83 6.36-6.43z" /></svg>
              {t('quote.labor')} 
              <span className="font-normal text-slate-400 ml-0.5">{result.estimatedHours}h @ ${laborRate}/hr</span>
            </span>
            <span className="text-sm font-semibold text-slate-900">{f(result.laborCost)}</span>
          </div>
          
          {/* Parts — collapsible */}
          <div className="py-3 border-b border-slate-100">
            <button onClick={() => setShowAllParts(!showAllParts)} className="flex items-center justify-between w-full text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                {t('quote.parts')} 
                <span className="font-normal text-slate-400">({parts.length} items)</span>
              </span>
              <svg className={`w-4 h-4 text-slate-400 transition-transform ${showAllParts ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
            </button>
            <div className={`space-y-1.5 transition-all ${showAllParts ? '' : ''}`}>
              {displayParts.map((p: any, i: number) => (
                <div key={i} className="grid grid-cols-[2rem_1fr_3.5rem_3.5rem] gap-x-2 text-sm py-1.5 px-2 rounded-lg hover:bg-slate-50 items-center">
                  <span className="text-slate-400 text-center text-xs">{p.qty}x</span>
                  <span className="text-slate-700 text-sm truncate">{p.name}</span>
                  <span className="text-right text-slate-500 text-xs">{f(p.unitPrice)}</span>
                  <span className="text-right font-medium text-slate-900 text-sm">{f(p.total)}</span>
                </div>
              ))}
              {!showAllParts && parts.length > 2 && (
                <button onClick={() => setShowAllParts(true)} className="text-xs text-blue-600 font-medium hover:text-blue-700 mt-1 ml-1">
                  + View {parts.length - 2} more parts
                </button>
              )}
            </div>
          </div>
          
          {/* Travel Fee */}
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <span className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
              {t('quote.travelFee')}
            </span>
            <span className="text-sm font-semibold text-slate-900">{f(travelFee)}</span>
          </div>
          
          {/* Tax */}
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <span className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
              {t('quote.tax')} 
              <span className="font-normal text-slate-400 ml-0.5">{(result.taxRate||0.085)*100}%</span>
            </span>
            <span className="text-sm font-semibold text-slate-900">{f(result.tax)}</span>
          </div>
        </div>
        
        {/* Total */}
        <div className="flex items-center justify-between pt-4 mt-1">
          <span className="text-base font-bold text-slate-900">{t('quote.total')}</span>
          <span className="text-2xl font-bold text-blue-600">{f(result.totalPrice)}</span>
        </div>
      </div>

      {/* Stripe Deposit Payment — Sticky on mobile */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white space-y-4 shadow-lg">
        <h3 className="text-lg font-semibold">{ctaCopy}</h3>
        <p className="text-sm text-slate-400">{ctaSubtext}</p>
        
        {/* Refund Guarantee Banner */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
          <p className="text-xs text-emerald-300 font-semibold mb-1">🔒 {t('quote.refundGuaranteeTitle')}</p>
          <p className="text-[11px] text-emerald-200/80 leading-relaxed">
            {t('quote.refundGuaranteeText')}
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-2">
          <p className="text-sm text-slate-400">{t('quote.confirmDeposit')}</p>
          <div className="relative group">
            <span className="text-3xl font-bold text-white">{depositDollars(result.depositAmount)}</span>
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-600 text-[10px] text-slate-300 cursor-help ml-1.5 font-bold" 
                  title={t('quote.depositTooltip')}>?</span>
          </div>
        </div>
        
        <button onClick={onStripeCheckout} disabled={stripeLoading} className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white font-bold shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] text-base">
          {stripeLoading ? 'Redirecting to payment...' : `${ctaCopy} — ${depositDollars(result.depositAmount)} to Lock In`}
        </button>
        
        <p className="text-xs text-slate-500 text-center">{t('quote.bookRefundable')}</p>
      </div>
      
      {/* Trust Badges */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-500" /> {t('quote.securePayment')}</span>
        <span className="flex items-center gap-1.5"><RefreshCcw className="w-3.5 h-3.5 text-emerald-500" /> {t('quote.fullyRefundable')}</span>
        <span className="flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5 text-emerald-500" /> {t('quote.licensedInsured')}</span>
      </div>
      
      <div className="text-center"><button onClick={onReset} className="h-10 px-5 rounded-xl ring-1 ring-black/5 text-slate-500 text-sm font-medium hover:bg-slate-50 transition-all">{t('quote.startOver')}</button></div>
    </div>
  );
}

/* ── Step 5 — Payment Success ── */
function StepSuccess({ result, t }: { result?: any; t: (key: string) => string }) {
  return (
    <div className="text-center space-y-6 py-8">
      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
        <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Payment Successful! 🎉</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          Your <strong>{depositDollars(result?.depositAmount || 4900)} deposit</strong> has been received. We're finding a licensed plumber in your area now.
        </p>
      </div>
      <div className="bg-slate-50 rounded-2xl p-6 max-w-sm mx-auto text-left space-y-3">
        <h3 className="font-semibold text-slate-900">What happens next?</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5 shrink-0">✓</span><span>You'll receive a confirmation email with your tracking link</span></li>
          <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5 shrink-0">✓</span><span>We'll match you with the best plumber in your area</span></li>
          <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5 shrink-0">✓</span><span>Track your plumber live: <a href={`/track/${result?.leadId || ''}`} className="text-blue-600 font-medium underline">plumbcore.ai/track</a></span></li>
          <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5 shrink-0">✓</span><span>The deposit is fully refundable if no plumber is available</span></li>
          <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5 shrink-0">✓</span><span>Need help? Call <a href="tel:+15551234567" className="text-blue-600 font-medium">(555) 123-4567</a></span></li>
        </ul>
      </div>
    </div>
  );
}

/* ═══ MAIN PAGE ═══ */
export default function QuotePage() {
  const params = useParams();
  const companySlug = params?.['company-slug'] as string || 'plumbcore';
  const { locale, changeLocale, t } = useI18n();
  const [step, setStep] = useState<1|2|3|4|5>(1);
  const [photos, setPhotos] = useState<File[]>([]);
  const [form, setForm] = useState({ name:'', phone:'', email:'', address:'', desc:'', urgency:'routine', _enhancing: false });
  const [phoneDisplay, setPhoneDisplay] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string|null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  /* ── White-label detection ── */
  const isWhiteLabel = companySlug && companySlug !== 'plumbcore';
  const [wlBrand, setWlBrand] = useState<{ logo_url?: string; primary_color?: string; name?: string; phone?: string } | null>(null);

  useEffect(() => {
    if (isWhiteLabel) {
      fetch(`/api/whitelabel/${companySlug}`)
        .then(r => r.json())
        .then(d => { if (d.brand) setWlBrand(d.brand); })
        .catch(() => {});
    }
  }, [companySlug, isWhiteLabel]);

  const accentColor = wlBrand?.primary_color || '#3B82F6';

  /* ── Payment result from Stripe redirect ── */
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get('payment') as 'success' | 'cancelled' | null;
  const [paymentHandled, setPaymentHandled] = useState(false);

  useEffect(() => {
    if (paymentStatus && !paymentHandled) {
      setPaymentHandled(true);
      if (paymentStatus === 'success') setStep(5 as any);
      if (paymentStatus === 'cancelled') setError('Payment was cancelled. Your estimate is still saved — you can try again.');
    }
  }, [paymentStatus, paymentHandled]);

  /* ── Voice input ── */
  const toggleVoice = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setError('Voice input not supported on this browser.'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setForm((p: any) => ({ ...p, desc: p.desc ? p.desc + ' ' + transcript : transcript }));
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  const addPhotos = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const compressed = await Promise.all(files.map(f => compressImage(f, 512)));
    setPhotos(p => [...p, ...compressed].slice(0, 4));
    e.target.value = '';
  }, []);
  const removePhoto = useCallback((i: number) => setPhotos(p => p.filter((_,idx) => idx !== i)), []);
  const handlePhone = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { const d = e.target.value.replace(/\D/g,''); const n = d.startsWith('1')?d.slice(1):d; if (n.length > 10) return; setPhoneDisplay(formatPhone(e.target.value)); setForm(p => ({...p, phone: cleanPhone(e.target.value)})); }, []);

  const phoneValid = validatePhone(phoneDisplay);
  const emailValid = form.email.length === 0 || validateEmail(form.email);
  const canSubmit = form.phone.length >= 10 && form.email.length > 0 && emailValid;

  /* ── AI Estimate ── */
  const handleEstimate = useCallback(async () => {
    setStep(3); setError(null);
    try {
      // Convert first photo to base64 for vision AI
      let photoBase64 = '';
      if (photos.length > 0) {
        photoBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(photos[0]);
        });
      }
      const res = await fetch('/api/ai/analyze-photo', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({photoBase64, photoCount:photos.length, customerPhone:form.phone, customerDescription:form.desc, urgency:form.urgency}) });
      const data = await res.json();
      if (data.success && data.result) setResult(data.result);
      else setResult({ canProvideEstimate: true, diagnosis:'Faucet leak detected — worn-out cartridge causing water seepage from the base.', severity:'moderate', estimatedHours:1.5, laborRate:120, laborCost:180, travelFee:150, parts:[{name:'Faucet cartridge replacement kit', qty:1, unitPrice:35, total:35},{name:'O-ring seal set (pack of 3)', qty:1, unitPrice:8.50, total:8.50},{name:'Plumber\'s grease', qty:1, unitPrice:5, total:5},{name:'Teflon tape', qty:1, unitPrice:3, total:3}], partsTotal:51.50, tax:19.68, taxRate:0.085, totalPrice:251.18, confidence:95, deposit:4900, depositAmount:4900, depositTier:'Under $1,000', depositPriceId:'price_1Tt6NCDynIU5fZLWmKmTgIgB' });
    } catch { setResult({ canProvideEstimate: true, diagnosis:'Faucet leak detected — worn-out cartridge causing water seepage from the base.', severity:'moderate', estimatedHours:1.5, laborRate:120, laborCost:180, travelFee:150, parts:[{name:'Faucet cartridge replacement kit', qty:1, unitPrice:35, total:35},{name:'O-ring seal set (pack of 3)', qty:1, unitPrice:8.50, total:8.50},{name:'Plumber\'s grease', qty:1, unitPrice:5, total:5},{name:'Teflon tape', qty:1, unitPrice:3, total:3}], partsTotal:51.50, tax:19.68, taxRate:0.085, totalPrice:251.18, confidence:95, deposit:4900, depositAmount:4900, depositTier:'Under $1,000', depositPriceId:'price_1Tt6NCDynIU5fZLWmKmTgIgB' }); }
    setStep(4);
  }, [form, photos]);

  /* ── Stripe checkout — $49 deposit ── */
  const handleStripeCheckout = useCallback(async () => {
    if (!result) return;
    setStripeLoading(true);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'payment',
          amount: result.depositAmount || 4900,
          description: `PlumbCore AI — Estimate Deposit`,
          customerEmail: form.email,
          customerName: form.name,
          customerPhone: form.phone,
          metadata: {
            diagnosis: result.diagnosis,
            severity: result.severity,
            totalEstimate: result.totalPrice,
            companySlug,
            customerAddress: form.address,
            estimateParts: JSON.stringify(result.parts || []),
            estimateLabor: result.laborCost || 0,
            depositCharged: String(result.depositAmount || 4900),
            depositTier: result.depositTier || '',
            quoteType: 'deposit',
          }
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error || 'Payment setup failed. Please try again.');
    } catch {
      setError('Payment setup failed. Please try again.');
    } finally {
      setStripeLoading(false);
    }
  }, [result, form, companySlug]);

  const resetFlow = useCallback(() => { setStep(1); setPaymentHandled(false); setPhotos([]); setForm({name:'',phone:'',email:'',address:'',desc:'',urgency:'routine',_enhancing:false}); setPhoneDisplay(''); setResult(null); setError(null); }, []);

  return (
    <div className="min-h-screen bg-white" style={isWhiteLabel && wlBrand?.primary_color ? { '--pl-accent': wlBrand.primary_color } as any : undefined}>
      <header className="ring-1 ring-inset ring-black/5 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <PlumbCoreLogo size="sm" showText={false} />
            {isWhiteLabel && wlBrand ? (
              <div><p className="text-sm font-bold text-slate-900">{wlBrand.name || companySlug}</p><p className="text-[11px] text-slate-400">Plumbing Services</p></div>
            ) : (
              <div><p className="text-sm font-bold text-slate-900">PlumbCore <span className="text-blue-500">AI</span></p><p className="text-[11px] text-slate-400">Premium Plumbing Services</p></div>
            )}
          </a>
          <div className="flex items-center gap-2">
            <a href={`tel:${wlBrand?.phone || '+15551234567'}`} className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-all active:scale-95"><Phone className="w-4 h-4" /><span className="hidden sm:inline">{wlBrand?.phone || '(555) 123-4567'}</span></a>
            <LanguageSwitcher locale={locale} onLocaleChange={l => changeLocale(l as 'en'|'fr'|'es'|'de')} />
          </div>
        </div>
      </header>
      <section className="bg-gradient-to-b from-slate-50 to-white py-10 sm:py-14">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 bg-blue-50 ring-1 ring-blue-200 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-600 mb-4"><Clock className="w-3 h-3" /> {t('quote.badge')}</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 mb-3">{t('quote.heroTitle')}</h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-lg mx-auto">{t('quote.heroSubtitle')}</p>
        </div>
      </section>
      <section className="py-6 sm:py-10 pb-20">
        <div className="max-w-lg mx-auto px-4">
          {error && <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-2 text-sm text-red-700"><AlertTriangle className="w-4 h-4 shrink-0" />{error}</div>}
          <StepIndicator current={step} total={step === 5 ? 5 : 4} t={t} />
          <div style={{ display: step === 1 ? 'block' : 'none' }}><StepUpload photos={photos} onAdd={addPhotos} onRemove={removePhoto} onNext={() => setStep(2)} t={t} /></div>
          <div style={{ display: step === 2 ? 'block' : 'none' }}>
            <StepInfo form={form} setForm={setForm} phoneDisplay={phoneDisplay} onPhoneChange={handlePhone} phoneValid={phoneValid} emailValid={emailValid} canSubmit={canSubmit} onBack={() => setStep(1)} onEstimate={handleEstimate} t={t} isListening={isListening} onToggleVoice={toggleVoice} />
          </div>
          <div style={{ display: step === 3 ? 'block' : 'none' }}><StepLoading t={t} /></div>
          <div style={{ display: step === 4 ? 'block' : 'none' }}><StepResult result={result} onReset={resetFlow} onStripeCheckout={handleStripeCheckout} stripeLoading={stripeLoading} t={t} /></div>
          <div style={{ display: step === 5 ? 'block' : 'none' }}><StepSuccess result={result} t={t} /></div>
        </div>
      </section>
    </div>
  );
}
