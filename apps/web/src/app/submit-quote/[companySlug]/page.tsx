'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function SubmitQuotePage({ params }: any) {
  const { companySlug } = params;
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', desc: '', urgency: 'flexible' });

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(prev => [...prev, ...files].slice(0, 4));
    e.target.value = '';
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      router.push(`/q/estimate-${Date.now()}`);
    }, 1500);
  };

  const inputClass = "w-full rounded-lg border border-gray-200 px-4 py-3 text-base outline-none focus:border-blue-400 transition-all";

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-6 px-4">
      <div className="max-w-lg mx-auto space-y-5">
        <div className="flex items-center justify-center gap-1.5 mb-4">
          {[1,2].map(s => (
            <div key={s} className={`w-2 h-2 rounded-full transition-all ${step === s ? 'w-6 bg-blue-600' : 'bg-gray-200'}`} />
          ))}
        </div>

        {/* Step 1: Photo Upload */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Upload Photos</h2>
              <p className="text-sm text-gray-500 mt-1">Show us what&apos;s broken</p>
            </div>

            <label className="border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50/50 p-8 flex flex-col items-center cursor-pointer hover:border-blue-400 transition-colors block text-center">
              <input type="file" accept="image/*" multiple onChange={handlePhoto} className="hidden" />
              <svg className="w-12 h-12 text-blue-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
              <p className="mt-3 text-sm text-gray-600">Tap to upload photos</p>
              <p className="text-xs text-gray-400 mt-1">Max 4 photos</p>
            </label>

            {photos.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img src={URL.createObjectURL(p)} className="w-full h-full object-cover" alt="" />
                    <button onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))} className="absolute top-0.5 right-0.5 w-5 h-5 bg-gray-900/60 text-white rounded-full flex items-center justify-center text-xs">✕</button>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setStep(2)} disabled={photos.length === 0} className="w-full bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-3.5 rounded-xl disabled:cursor-not-allowed text-[15px]">
              Continue →</button>
          </div>
        )}

        {/* Step 2: Customer Info */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Your Details</h2>
              <p className="text-sm text-gray-500 mt-0.5">Where should we send your estimate?</p>
            </div>

            <div className="space-y-3.5">
              <input type="text" placeholder="Name" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className={inputClass} />
              <input type="tel" inputMode="numeric" placeholder="Phone *" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} className={inputClass} />
              <input type="email" inputMode="email" placeholder="Email (optional)" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} className={inputClass} />
              <input type="text" placeholder="Address *" value={form.address} onChange={e => setForm(p => ({...p, address: e.target.value}))} className={inputClass} />
              <textarea placeholder="Describe the problem..." rows={3} value={form.desc} onChange={e => setForm(p => ({...p, desc: e.target.value}))} className={`${inputClass} resize-none`} />
              <select value={form.urgency} onChange={e => setForm(p => ({...p, urgency: e.target.value}))} className={inputClass}>
                <option value="flexible">How urgent?</option>
                <option value="emergency">Emergency</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setStep(1)} className="flex-1 rounded-xl border border-gray-200 text-gray-600 font-medium py-3 text-sm">Back</button>
              <button onClick={handleSubmit} disabled={loading || !form.phone} className="flex-[2] bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl disabled:cursor-not-allowed text-[15px]">
                {loading ? 'Submitting...' : 'Get My Estimate'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}