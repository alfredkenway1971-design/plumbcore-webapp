'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input } from '@/pkg/ui-components';

export default function QuotePage({ params }: any) {
  const router = useRouter();
  const { 'company-slug': companySlug } = params;
  
  const [uploadStep, setUploadStep] = useState<'upload' | 'form' | 'analyzing' | 'estimate' | 'booking'>('upload');
  const [photos, setPhotos] = useState<File[]>([]);
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    urgency: 'flexible',
    referralSource: ''
  });
  const [analysis, setAnalysis] = useState<any>(null);
  const [estimatedPrice, setEstimatedPrice] = useState<{low?: number; high?: number}>({});
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: "Hi! I can help you get a free estimate. What seems to be the problem?" }
  ]);
  const chatInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (files: File[]) => {
    if (photos.length + files.length > 3) return alert('Max 3 photos allowed');
    setPhotos([...photos, ...files]);
    setUploadStep('form');
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerData.phone) return alert('Phone is required');
    
    setUploadStep('analyzing');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setAnalysis({
      diagnosis: 'Leaking P-trap under sink',
      severity: 'moderate',
      estimatedLaborHours: 1.0,
      confidence: 87
    });
    
    setEstimatedPrice({ low: 145, high: 185 });
    setUploadStep('estimate');
  };

  const handleBooking = async () => {
    router.push('/quote/checkout');
  };

  const handleChatSubmit = () => {
    const input = chatInputRef.current?.value;
    if (!input) return;
    
    setChatMessages([...chatMessages, { role: 'user', text: input }]);
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: 'I can help with that. Would you like to upload a photo for an instant estimate?' 
      }]);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Floating Chat */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => setChatOpen(!chatOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-105"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>

        {chatOpen && (
          <Card padding="lg" className="w-80 bg-white shadow-2xl mt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">AI Assistant</h3>
              <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="h-64 overflow-y-auto mb-3 space-y-2">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`text-sm ${msg.role === 'user' ? 'text-right' : ''}`}>
                  <span className={`inline-block px-3 py-2 rounded-lg ${
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
                placeholder="Type a message..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
              />
              <Button onClick={handleChatSubmit} size="sm">Send</Button>
            </div>
          </Card>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Get a Free Plumbing Estimate in 2 Minutes
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Upload a photo of your problem. Our AI analyzes it instantly and gives you an upfront price.
          </p>
          <div className="flex gap-4 text-sm text-gray-500 justify-center">
            <span className="flex items-center gap-1">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              No signup required
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Upfront pricing
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Licensed plumbers
            </span>
          </div>
        </div>

        {/* Step 1: Photo Upload */}
        {uploadStep === 'upload' && (
          <Card padding="md" className="text-center">
            <input
              type="file"
              id="photo-upload"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handlePhotoUpload(Array.from(e.target.files || []))}
            />
            <label htmlFor="photo-upload" className="cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-4 text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-2">max 3 photos</p>
              </div>
            </label>
          </Card>
        )}

        {/* Step 2: Upload Confirmation */}
        {photos.length > 0 && uploadStep === 'form' && (
          <Card padding="md">
            <h3 className="text-xl font-semibold mb-4">Your Photos</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {photos.map((photo, i) => (
                <div key={i} className="relative group">
                  <img src={URL.createObjectURL(photo)} alt="preview" className="w-full h-32 object-cover rounded-lg" />
                  <button 
                    onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <Input 
                label="Name" 
                value={customerData.name}
                onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
              />
              <Input 
                label="Phone" 
                type="tel"
                required
                value={customerData.phone}
                onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                placeholder="(555) 123-4567"
              />
              <Input 
                label="Email" 
                type="email"
                value={customerData.email}
                onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
              />
              <Input 
                label="Address" 
                required
                value={customerData.address}
                onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  value={customerData.urgency}
                  onChange={(e) => setCustomerData({...customerData, urgency: e.target.value})}
                >
                  <option value="emergency">Emergency</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="flexible">Flexible</option>
                </select>
                <select
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  value={customerData.referralSource}
                  onChange={(e) => setCustomerData({...customerData, referralSource: e.target.value})}
                >
                  <option value="">How did you hear about us?</option>
                  <option value="google">Google Search</option>
                  <option value="friend">Friend/Referral</option>
                  <option value="website">Website</option>
                  <option value="facebook">Facebook</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-2">Get My Estimate</Button>
                <Button type="button" variant="secondary" onClick={() => setPhotos([])}>Back</Button>
              </div>
            </form>
          </Card>
        )}

        {/* Step 3: Analyzing */}
        {uploadStep === 'analyzing' && (
          <Card padding="md" className="text-center">
            <div className="animate-pulse mb-8">
              <svg className="animate-spin mx-auto h-16 w-16 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Analyzing your photo...</h3>
            <div className="space-y-2 text-gray-600">
              <p>✓ Identifying the problem...</p>
              <p>⏳ Checking our pricebook...</p>
              <p>⏳ Calculating estimate...</p>
            </div>
          </Card>
        )}

        {/* Step 4: Estimate Display */}
        {uploadStep === 'estimate' && analysis && (
          <Card padding="md">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold mb-2">Your Free Estimate</h3>
              <p className="text-gray-600">Based on your photo and our AI analysis</p>
            </div>

            {/* Diagnosis */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2">What we see:</h4>
              <p className="text-gray-800">{analysis.diagnosis}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                analysis.severity === 'emergency' ? 'bg-red-100 text-red-800' :
                analysis.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                analysis.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                Severity: {analysis.severity.charAt(0).toUpperCase() + analysis.severity.slice(1)}
              </span>
              <p className="text-sm text-gray-500 mt-1">AI confidence: {analysis.confidence}%</p>
            </div>

            {/* Price Estimate */}
            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <h4 className="font-semibold mb-3">Estimated Cost</h4>
              <p className="text-4xl font-bold text-blue-600 mb-2">
                ${estimatedPrice.low} — ${estimatedPrice.high}
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm text-gray-700">
                <div>
                  <span className="block text-gray-500">Labor</span>
                  <span className="font-medium">$145</span>
                </div>
                <div>
                  <span className="block text-gray-500">Parts</span>
                  <span className="font-medium">$29.50</span>
                </div>
                <div>
                  <span className="block text-gray-500">Time</span>
                  <span className="font-medium">{analysis.estimatedLaborHours} hrs</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">*Expires in 24 hours. Final price confirmed after inspection.</p>
            </div>

            {/* Booking CTA */}
            <div className="flex gap-3">
              <Button onClick={handleBooking} className="flex-2" size="lg">
                Pay $49 Deposit to Book Now
              </Button>
              <Button onClick={() => setChatOpen(true)} variant="secondary" size="lg">
                Ask a Question
              </Button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Your $49 deposit is deducted from the final bill. Fully refundable if we can't fix it.
            </p>
          </Card>
        )}

        {/* How It Works Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-semibold text-center mb-8">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: '📸', title: 'Snap a Photo', desc: 'Upload a photo of your plumbing issue' },
              { icon: '🤖', title: 'Get Instant Estimate', desc: 'AI analyzes and gives upfront pricing' },
              { icon: '💳', title: 'Book Appointment', desc: 'Pay $49 deposit to secure your slot' },
              { icon: '🔧', title: 'Plumber Arrives', desc: 'Professional fix with no surprises' }
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl mb-3">{step.icon}</div>
                <h4 className="font-semibold mb-1">{step.title}</h4>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 space-y-4">
          <h3 className="text-xl font-semibold text-center mb-6">Frequently Asked Questions</h3>
          {[
            { q: 'Is the estimate really free?', a: 'Yes, completely free. No signup required.' },
            { q: 'What if the price changes?', a: 'Final price confirmed after plumber inspection. No surprise fees.' },
            { q: 'Is my deposit refundable?', a: 'Yes, fully refundable if we cannot complete the repair.' },
            { q: 'How soon can a plumber come?', a: 'Emergency: same day. Standard service within 24-48 hours.' }
          ].map((faq, i) => (
            <details key={i} className="border rounded-lg">
              <summary className="font-semibold p-4 cursor-pointer hover:bg-gray-50">{faq.q}</summary>
              <div className="p-4 border-t text-gray-600">{faq.a}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}