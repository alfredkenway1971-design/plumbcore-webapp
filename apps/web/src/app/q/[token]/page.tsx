'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Card, Input } from '@/pkg/ui-components';

export default function QuoteStatusPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  
  const [quoteData, setQuoteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: "Hi! How can I help you with your quote today?" }
  ]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    // Fetch quote data via magic token
    fetchQuoteData();
  }, [token]);

  const fetchQuoteData = async () => {
    try {
      const res = await fetch(`/api/quotes/${token}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!res.ok) {
        router.push('/quote/expired');
        return;
      }
      
      const data = await res.json();
      setQuoteData(data);
    } catch (error) {
      console.error('Error fetching quote:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setPaymentLoading(true);
    try {
      // Stripe checkout session creation
      const res = await fetch('/api/quotes/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId: quoteData.id })
      });
      
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url; // Redirect to Stripe
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleReschedule = () => {
    router.push(`/quote/schedule/${token}`);
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this quote?')) return;
    
    try {
      await fetch(`/api/quotes/${token}/cancel`, { method: 'POST' });
      router.push('/quote/cancelled');
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Could not cancel. Please try again.');
    }
  };

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;
    
    setChatMessages([...chatMessages, { role: 'user', text: chatInput }]);
    setChatInput('');
    
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: "I'm here to help! What would you like to know about your estimate?"
      }]);
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

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
          <Card padding="md" className="w-80 bg-white shadow-2xl mt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">AI Assistant</h3>
              <button onClick={() => setChatOpen(false)} className="text-gray-400">×</button>
            </div>
            <div className="h-32 overflow-y-auto mb-3 space-y-2 text-xs">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`text-sm ${msg.role === 'user' ? 'text-right' : ''}`}>
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
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 rounded-lg border border-gray-300 px-2 py-1 text-sm outline-none focus:border-blue-600"
                onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
              />
              <Button onClick={handleChatSubmit} size="sm">Send</Button>
            </div>
          </Card>
        )}

        {/* Back to Home */}
        <div className="fixed top-6 left-6 z-50">
          <Button onClick={() => router.push('/')} variant="ghost">
            ← Back to Home
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <Card padding="md" className="text-center mb-6">
          <h1 className="text-2xl font-semibold mb-2">Your Estimate from {quoteData?.companyName}</h1>
          <p className="text-gray-600">Valid until: {new Date(quoteData?.expiresAt).toLocaleDateString()}</p>
        </Card>

        {/* Photos */}
        {quoteData?.photos && quoteData.photos.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Your Photos</h3>
            <div className="grid grid-cols-3 gap-4">
              {quoteData.photos.map((photo: string, i: number) => (
                <img 
                  key={i} 
                  src={photo} 
                  alt={`photo ${i + 1}`} 
                  className="rounded-xl shadow-md"
                />
              ))}
            </div>
          </div>
        )}

        {/* AI Diagnosis */}
        <Card padding="md" className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg">AI Diagnosis</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              quoteData?.aiSeverity === 'emergency' ? 'bg-red-100 text-red-800' :
              quoteData?.aiSeverity === 'high' ? 'bg-orange-100 text-orange-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {quoteData?.aiSeverity}
            </span>
          </div>
          <p className="text-gray-800 mb-2">{quoteData?.aiDiagnosis}</p>
          <p className="text-sm text-gray-600">Confidence: {quoteData?.aiConfidence}%</p>
          <p className="text-sm text-gray-500">Suggested repair: {quoteData?.aiSuggestedRepair}</p>
        </Card>

        {/* Price Estimate */}
        <Card padding="md" className="mb-6 bg-blue-50">
          <h3 className="font-semibold mb-3">Estimated Cost</h3>
          <p className="text-3xl font-bold text-blue-600 mb-2">
            ${quoteData?.priceEstimateLow} — ${quoteData?.priceEstimateHigh}
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <span className="block text-gray-500">Estimated Labor</span>
              <span className="font-medium">{quoteData?.estimatedLaborHours} hours</span>
            </div>
            <div>
              <span className="block text-gray-500">Tax Rate</span>
              <span className="font-medium">{quoteData?.taxRate}%</span>
            </div>
          </div>
        </Card>

        {/* Appointment (if scheduled) */}
        {quoteData?.appointment && (
          <Card padding="md" className="mb-6">
            <h3 className="font-semibold mb-2">Appointment Details</h3>
            <p className="text-gray-800">{quoteData.appointment.date} at {quoteData.appointment.time}</p>
            <p className="text-sm text-gray-600">Technician: {quoteData.appointment.technician}</p>
          </Card>
        )}

        {/* Deposit Status */}
        <div className="mb-6">
          {quoteData?.depositPaid ? (
            <Card padding="md" className="text-center bg-green-50">
              <svg className="mx-auto h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="font-semibold text-green-800 mt-2">Deposit Paid</h3>
              <p className="text-sm text-green-700">$49 deposit received</p>
            </Card>
          ) : (
            <div className="flex gap-3">
              <Button 
                onClick={handlePayment} 
                disabled={paymentLoading}
                className="flex-2"
              >
                {paymentLoading ? 'Processing...' : 'Pay $49 Deposit to Book Now'}
              </Button>
              <Button onClick={handleReschedule} variant="secondary">
                Schedule for Later
              </Button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {quoteData?.appointment && !quoteData.depositPaid && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button onClick={handleReschedule} variant="outline">
              Reschedule
            </Button>
            <Button onClick={handleCancel} variant="outline" className="text-red-600 hover:bg-red-50">
              Cancel Request
            </Button>
          </div>
        )}

        {/* Chat CTA */}
        <Card padding="md" className="text-center">
          <p className="text-gray-600 mb-3">Have questions about your estimate?</p>
          <Button onClick={() => setChatOpen(true)} variant="outline">
            Chat with Plumber
          </Button>
        </Card>
      </div>
    </div>
  );
}