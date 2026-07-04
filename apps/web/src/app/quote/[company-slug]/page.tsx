'use client';

export default function QuotePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Customer Portal Coming Soon</h1>
        <p className="text-lg text-gray-600 mb-8">We're building our customer photo upload and AI estimate feature. Check back soon!</p>
        <button onClick={() => window.location.href = '/'} className="bg-blue-600 text-white px-6 py-3 rounded-lg">
          Back to Home
        </button>
      </div>
    </div>
  );
}
