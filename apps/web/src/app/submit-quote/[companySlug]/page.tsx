'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SubmitQuotePage({ params }: any) {
  const { companySlug } = params;

  const [currentStep, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);

  function Card({ title, children }: any) {
    return <div className="bg-white shadow-sm rounded-xl p-6 mb-4">{children}</div>;
  }

  function Button({ children, onClick, disabled, variant = 'primary', size = 'md' }: any) {
    const base = "font-medium rounded-lg transition-colors disabled:opacity-50";
    const variants = { primary: "bg-blue-600 text-white hover:bg-blue-700", secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300" };
    const sizes = { sm: "px-3 py-2 text-sm", md: "px-4 py-2", lg: "px-6 py-3 text-lg flex-2" };
    return <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${sizes[size]}`}>{children}</button>;
  }

  const handlePhotoSelect = (e: any) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setPhotos(prev => [...prev, ...Array.from(files)].slice(0, 3));
  };

  const handleSubmit = () => {
    setLoading(true);
    router.push('/loading');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Step 1: Photo Upload */}
        {currentStep === 1 && (
          <Card title="Upload Photos">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-2">Upload Photos</h2>
              <p className="text-gray-600">Take a photo of your plumbing problem</p>
            </div>

            <input type="file" accept="image/*" multiple onChange={handlePhotoSelect} className="hidden" id="photo-upload" />
            
            <label htmlFor="photo-upload" className="cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 transition-colors">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="mt-4 text-sm text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">Max 3 photos</p>
              </div>
            </label>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {photos.map((photo, i) => (
                  <div key={i} className="relative">
                    <img src={URL.createObjectURL(photo)} alt="preview" className="rounded-lg shadow-sm w-full h-32 object-cover" />
                    <button onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">×</button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button disabled={photos.length === 0} onClick={() => setStep(2)}>Continue</Button>
            </div>
          </Card>
        )}

        {/* Step 2: Customer Info */}
        {currentStep === 2 && (
          <Card title="Your Details">
            <h2 className="text-2xl font-semibold mb-6">Where can we send your estimate?</h2>

            <div className="space-y-4">
              <input type="text" placeholder="Name" className="w-full rounded-lg border px-4 py-2" onChange={(e: any) => {}} />
              <input type="tel" placeholder="Phone" className="w-full rounded-lg border px-4 py-2" />
              <input type="email" placeholder="Email" className="w-full rounded-lg border px-4 py-2" />
              <input type="text" placeholder="Address" className="w-full rounded-lg border px-4 py-2" />
              <select className="w-full rounded-lg border px-4 py-2"><option value="flexible">Flexible</option></select>
              
              <div className="flex gap-4 pt-4">
                <Button onClick={() => setStep(1)} variant="secondary">Back</Button>
                <Button disabled={loading} onClick={handleSubmit}>{loading ? 'Submitting...' : 'Get My Estimate'}</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}