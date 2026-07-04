'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function QuotePage({ params }: any) {
  const router = useRouter();
  const { 'company-slug': companySlug } = params;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    description: '',
    urgency: 'flexible'
  });
  const chatOpen, setChatOpen] = useState(false);
  const chatMessages, setChatMessages] = useState([
    { role: 'ai', text: "Hi! I can help get a free estimate. What's the problem?" }
  ]);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos((prev) => [...prev, ...Array.from(e.target.files)].slice(0, 3));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    // In production: submit to backend API
    router.push('/loading');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Floating Chat */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>

        {chatOpen && (
          <div className="bg-white rounded-xl shadow-2xl p-4 mt-4 w-80">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">AI Assistant</h3>
              <button onClick={() => setChatOpen(false)} className="text-gray-400">×</button>
            </div>
            <div className="h-40 overflow-y-auto mb-3 text-sm space-y-2">
              {chatMessages.map((msg, i) => (
                <div key={i} className={msg.role === 'user' ? 'text-right' : ''}>
                  <span className={`inline-block px-2 py-1 rounded-lg ${
                    msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                  }`}>
                    {msg.text}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                ref={chatInputRef}
                type="text"
                placeholder="Type..."
                className="flex-1 rounded-lg border border-gray-300 px-2 py-1 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                onClick={handleSubmit}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Step 1: Photo Upload */}
        {step === 1 && (
          <div>
            <h1 className="text-3xl font-bold text-center mb-4">Get a Free Plumbing Estimate</h1>
            <p className="text-center text-gray-600 mb-8">Upload a photo of your problem</p>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoSelect}
              className="hidden"
            />

            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-gray-500">Click to upload</p>
                <p className="text-xs text-blue-500">or drag and drop</p>
              </div>
            </label>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {photos.map((photo, i) => (
                  <div key={i} className="relative">
                    <img src={URL.createObjectURL(photo)} className="rounded-lg" alt="preview" />
                    <button
                      onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              disabled={photos.length === 0}
              onClick={() => setStep(2)}
              className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Customer Info */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">Your Details</h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                className="w-full rounded-lg border px-4 py-2"
                value={customerData.name}
                onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
              />

              <input
                type="tel"
                placeholder="Phone"
                className="w-full rounded-lg border px-4 py-2"
                value={customerData.phone}
                onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
              />

              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-lg border px-4 py-2"
                value={customerData.email}
                onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
              />

              <input
                type="text"
                placeholder="Address"
                className="w-full rounded-lg border px-4 py-2"
                value={customerData.address}
                onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
              />

              <select
                className="w-full rounded-lg border px-4 py-2"
                value={customerData.urgency}
                onChange={(e) => setCustomerData({ ...customerData, urgency: e.target.value })}
              >
                <option value="flexible">Flexible</option>
                <option value="week">This Week</option>
                <option value="today">Today</option>
                <option value="emergency">Emergency</option>
              </select>

              <textarea
                placeholder="Describe your plumbing issue..."
                className="w-full rounded-lg border px-4 py-2"
                rows={4}
                value={customerData.description}
                onChange={(e) => setCustomerData({ ...customerData, description: e.target.value })}
              />

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !customerData.phone}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : 'Get Estimate'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
