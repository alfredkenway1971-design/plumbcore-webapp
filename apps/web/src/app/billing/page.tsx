'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, CreditCard, Settings, FileText, Shield, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export default function BillingPage() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const userEmail = user?.email || profile?.email || '';

  const [email, setEmail] = useState(userEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pre-fill email from auth
  useEffect(() => {
    if (userEmail && !email) setEmail(userEmail);
  }, [userEmail]);

  const openPortal = async () => {
    if (!email) { setError('Please enter your email'); return; }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const searchRes = await fetch(`/api/find-stripe-customer?email=${encodeURIComponent(email)}`);
      const searchData = await searchRes.json();

      if (!searchData.customerId) {
        setError('No subscription found. Click "Subscribe Now" to get started.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: searchData.customerId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to open billing portal');
      }
    } catch {
      setError('Something went wrong. Try again.');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto px-4 py-20">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Billing & Subscription</h1>
          <p className="text-slate-500 mt-2">Manage your plan, payment methods, and invoices</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">What you can do here</h2>
          <div className="space-y-3">
            {[
              { icon: Settings, text: 'Upgrade, downgrade, or cancel your plan' },
              { icon: CreditCard, text: 'Update your payment method' },
              { icon: FileText, text: 'View your invoice history' },
              { icon: Shield, text: 'Update billing information' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
                <item.icon className="w-4 h-4 text-blue-500 shrink-0" />
                {item.text}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <label className="text-sm font-semibold text-slate-700 block mb-2">
            Enter your email to access the billing portal
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
          />
          {error && (
            <div className="text-sm text-red-500 mb-3">
              <p>{error}</p>
              <a
                href="/#pricing"
                className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Subscribe Now
              </a>
            </div>
          )}
          {success && <p className="text-sm text-emerald-600 mb-3">{success}</p>}
          <button
            onClick={openPortal}
            disabled={loading}
            className="w-full h-11 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-sm font-bold transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Opening portal...' : 'Open Billing Portal'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 text-center mt-6">
          You'll be redirected to Stripe's secure billing portal to manage your subscription.
        </p>

        <div className="text-center mt-8">
          <p className="text-xs text-slate-400 mb-2">Don't have a subscription yet?</p>
          <a
            href="/#pricing"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 font-semibold hover:text-blue-700"
          >
            View plans and pricing
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </main>
  );
}
