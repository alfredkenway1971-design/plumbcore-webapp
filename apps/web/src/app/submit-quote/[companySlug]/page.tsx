'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SubmitQuotePage({ params }: any) {
  const router = useRouter();
  const { companySlug } = params;
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    photos: [] as File[],
    customerInfo: {
      name: '',
      phone: '',
      email: '',
      address: '',
      description: '',
      urgency: 'flexible'
    }
  });

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Step 1: Upload photos to Supabase Storage
      const uploadedPhotos: string[] = [];
      for (const photo of formData.photos) {
        const photoUrl = await uploadToSupabase(photo);
        uploadedPhotos.push(photoUrl);
      }
      
      // Step 2: Call AI analysis endpoint
      const base64 = await fileToBase64(formData.photos[0]);
      const aiAnalysis = await fetch('/api/ai/analyze-photo', {
        method: 'POST',
        body: JSON.stringify({
          photoBase64: base64,
          companyId: 'comp-001',
          customerDescription: formData.customerInfo.description
        })
      }).then(res => res.json());
      
      // Step 3: Create customer quote
      const quoteResponse = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companySlug,
          ...formData.customerInfo,
          photos: uploadedPhotos,
          aiAnalysis
        })
      });
      
      const result = await quoteResponse.json();
      
      // Step 4: Redirect to quote status page
      router.push(`/q/${result.token}`);
      
    } catch (error) {
      console.error('Error:', error);
      alert('Could not submit quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const uploadToSupabase = async (file: File): Promise<string> => {
    // In production: upload to Supabase Storage bucket 'customer-quotes'
    // Return public URL
    return URL.createObjectURL(file);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({
        ...formData,
        photos: Array.from(e.target.files).slice(0, 3 - formData.photos.length)
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className={`flex items-center ${i === 3 ? '' : 'flex-1 border-b-2'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                {i}
              </div>
            </div>
          ))}
        </div>

        {/* Step 1: Photo Upload */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Upload Photos</h2>
              <p className="text-gray-600">Take a photo of your plumbing problem</p>
            </div>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoSelect}
              className="hidden"
              id="photo-upload"
            />
            
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

            {formData.photos.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {formData.photos.map((photo, i) => (
                  <div key={i} className="relative">
                    <img src={URL.createObjectURL(photo)} alt="preview" className="rounded-lg shadow-sm w-full h-32 object-cover" />
                    <button
                      onClick={() => setFormData({ ...formData, photos: formData.photos.filter((_, idx) => idx !== i) })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button 
                disabled={formData.photos.length === 0}
                onClick={() => setStep(2)}
                className="flex-2"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Customer Info */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Your Details</h2>
              <p className="text-gray-600">Where can we send your estimate?</p>
            </div>

            <div className="space-y-4">
              <Input 
                label="Name" 
                value={formData.customerInfo.name}
                onChange={(e) => setFormData({ ...formData, customerInfo: { ...formData.customerInfo, name: e.target.value } })}
              />
              
              <Input 
                label="Phone" 
                type="tel"
                required
                value={formData.customerInfo.phone}
                onChange={(e) => setFormData({ ...formData, customerInfo: { ...formData.customerInfo, phone: e.target.value } })}
                placeholder="(555) 123-4567"
              />
              
              <Input 
                label="Email" 
                type="email"
                value={formData.customerInfo.email}
                onChange={(e) => setFormData({ ...formData, customerInfo: { ...formData.customerInfo, email: e.target.value } })}
              />
              
              <Input 
                label="Address" 
                required
                value={formData.customerInfo.address}
                onChange={(e) => setFormData({ ...formData, customerInfo: { ...formData.customerInfo, address: e.target.value } })}
                placeholder="123 Main St, Austin, TX 73301"
              />
              
              <select
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
                value={formData.customerInfo.urgency}
                onChange={(e) => setFormData({ ...formData, customerInfo: { ...formData.customerInfo, urgency: e.target.value } })}
              >
                <option value="flexible">Flexible</option>
                <option value="week">This Week</option>
                <option value="today">Today</option>
                <option value="emergency">Emergency</option>
              </select>
              
              <Input 
                label="What's the problem?" 
                value={formData.customerInfo.description}
                onChange={(e) => setFormData({ ...formData, customerInfo: { ...formData.customerInfo, description: e.target.value } })}
                placeholder="Describe the plumbing issue..."
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button onClick={() => setStep(1)} variant="secondary">
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="flex-2">
                {loading ? 'Submitting...' : 'Get My Estimate'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Submitting */}
        {step === 3 && (
          <div className="text-center py-12">
            <svg className="animate-spin h-16 w-16 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <h2 className="text-xl font-semibold mt-4 mb-2">Analyzing your photo...</h2>
            <p className="text-gray-600">This takes a few moments</p>
          </div>
        )}
      </div>
    </div>
  );
}