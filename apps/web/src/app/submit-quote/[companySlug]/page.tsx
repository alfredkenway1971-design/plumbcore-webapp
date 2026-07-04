'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function SubmitQuotePage({ params }: any) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', desc: '', urgency: 'flexible' });
  const [phoneDisplay, setPhoneDisplay] = useState('');

  const formatPhone = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 10); if (!d) return ''; if (d.length <= 3) return `(${d}`; if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`; return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`; };
  const cleanPhone = (v: string) => v.replace(/\D/g, '');
  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => { const d = e.target.value.replace(/\D/g, ''); if (d.length > 10) return; setPhoneDisplay(formatPhone(e.target.value)); setForm(p => ({ ...p, phone: d })); };

  const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all placeholder:text-gray-400";

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f5f5f0]">
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
          <h2 className="text-2xl font-bold mb-2">Quote submitted!</h2>
          <p className="text-sm text-gray-500 mb-6">We&apos;ll text your estimate shortly.</p>
          <button onClick={() => router.push('/')} className="bg-gray-900 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-800 transition-all text-sm">Back to home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><span className="text-sm font-bold">plumbcore</span></div>
        </div>
      </div>
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-center gap-1.5">
          {[1,2].map(s => <div key={s} className={`h-1 rounded-full transition-all duration-500 ${step === s ? 'w-8 bg-gray-900' : 'w-3 bg-gray-200'}`} />)}
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <div className="text-center"><p className="text-xs font-semibold text-gray-900 uppercase tracking-[0.2em]">Step 1 of 2</p><h2 className="text-2xl font-bold mt-2">Upload photos</h2><p className="text-sm text-gray-500 mt-1">Show us what needs fixing</p></div>
            <label className="relative block border-2 border-dashed border-gray-200 rounded-2xl bg-white cursor-pointer hover:border-gray-400 transition-colors overflow-hidden">
              <input type="file" accept="image/*" multiple onChange={(e) => { setPhotos(p => [...p, ...Array.from(e.target.files || [])].slice(0, 4)); e.target.value = ''; }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              {photos.length === 0 ? (
                <div className="flex flex-col items-center py-14"><svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg><p className="mt-4 text-sm font-medium text-gray-700">Tap to add photos</p><p className="text-xs text-gray-400 mt-1">Max 4 photos</p></div>
              ) : (
                <div className="p-4"><div className="grid grid-cols-4 gap-2">{photos.map((p, i) => <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"><img src={URL.createObjectURL(p)} className="w-full h-full object-cover" alt="" /><button onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))} className="absolute top-0.5 right-0.5 w-5 h-5 bg-gray-900/60 text-white rounded-full flex items-center justify-center text-xs">&#10005;</button></div>)}</div></div>
              )}
            </label>
            <button onClick={() => setStep(2)} disabled={photos.length === 0} className="w-full bg-gray-900 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3.5 rounded-xl disabled:cursor-not-allowed active:scale-[0.97] transition-all text-sm shadow-sm">Continue</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center"><p className="text-xs font-semibold text-gray-900 uppercase tracking-[0.2em]">Step 2 of 2</p><h2 className="text-2xl font-bold mt-2">Your details</h2><p className="text-sm text-gray-500 mt-1">Where to send your estimate</p></div>
            <div className="bg-gray-50/70 rounded-2xl p-5 space-y-3.5 border border-gray-100">
              <input type="text" placeholder="Your name" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className={inputClass} autoComplete="name" />
              <div><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium z-10">+1</span><input type="tel" inputMode="numeric" placeholder="(555) 555-5555" value={phoneDisplay} onChange={handlePhone} className={`${inputClass} pl-10`} autoComplete="tel-national" /></div></div>
              <input type="email" inputMode="email" placeholder="Email (optional)" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} className={inputClass} autoComplete="email" />
              <input type="text" placeholder="Service address" value={form.address} onChange={e => setForm(p => ({...p, address: e.target.value}))} className={inputClass} autoComplete="street-address" />
              <textarea placeholder="Describe the problem..." rows={3} value={form.desc} onChange={e => setForm(p => ({...p, desc: e.target.value}))} className={`${inputClass} resize-none`} />
              <select value={form.urgency} onChange={e => setForm(p => ({...p, urgency: e.target.value}))} className={inputClass}>
                <option value="flexible">How urgent?</option>
                <option value="emergency">Emergency</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 rounded-xl border border-gray-200 text-gray-700 font-medium py-3.5 text-sm hover:bg-gray-50 active:scale-[0.97] transition-all">Back</button>
              <button onClick={handleSubmit} disabled={loading || !cleanPhone(phoneDisplay).length} className="flex-[2] bg-gray-900 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3.5 rounded-xl disabled:cursor-not-allowed active:scale-[0.97] transition-all text-sm shadow-sm">{loading ? 'Submitting...' : 'Submit quote'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}