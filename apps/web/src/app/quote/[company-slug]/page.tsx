'use client';

import { useState } from 'react';

export default function QuotePage({ params }: any) {
  const slug = params?.['company-slug'] || 'plumbcore';
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<any[]>([]);

  const handlePhoto = (e: any) => {
    const files = Array.from(e.target.files || []);
    setPhotos(prev => [...prev, ...files].slice(0, 3));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="max-w-xl mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Get a Free Plumbing Estimate</h1>
            <p className="text-gray-600">Upload a photo and we'll analyze it instantly</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <label className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center cursor-pointer hover:border-blue-400 transition-colors">
              <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-4 text-base text-gray-500">Drop a photo of your leak here</p>
              <p className="text-xs text-gray-400 mt-1">or click to browse (max 3 photos)</p>
              <input type="file" accept="image/*" multiple onChange={handlePhoto} className="hidden" />
            </label>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {photos.map((p: any, i: number) => (
                  <div key={i} className="relative">
                    <img src={URL.createObjectURL(p)} className="rounded-lg w-full h-24 object-cover" alt="" />
                    <button onClick={() => setPhotos(photos.filter((_: any, idx: number) => idx !== i))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                  </div>
                ))}
              </div>
            )}

            {photos.length > 0 && (
              <button onClick={() => setStep(2)} className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">
                Continue →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Customer Info */}
      {step === 2 && (
        <div className="max-w-xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <h2 className="text-2xl font-semibold mb-6">Where should we send your estimate?</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Name" className="w-full border rounded-lg px-4 py-3 text-sm" />
              <input type="tel" placeholder="Phone *" className="w-full border rounded-lg px-4 py-3 text-sm" />
              <input type="email" placeholder="Email" className="w-full border rounded-lg px-4 py-3 text-sm" />
              <input type="text" placeholder="Address *" className="w-full border rounded-lg px-4 py-3 text-sm" />
              <select className="w-full border rounded-lg px-4 py-3 text-sm">
                <option>How urgent?</option>
                <option>Emergency</option>
                <option>Today</option>
                <option>This Week</option>
                <option>Flexible</option>
              </select>
              <button onClick={() => setStep(3)} className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">
                Get My Estimate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: AI Analysis */}
      {step === 3 && (
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold mb-2">Analyzing your photos...</h2>
          <p className="text-gray-500">This takes a few seconds</p>
        </div>
      )}
    </div>
  );
}