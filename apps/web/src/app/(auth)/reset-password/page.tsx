'use client';

import { useState } from 'react';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [touched, setTouched] = useState(false);

  const emailError = touched && !email.trim() ? 'Required' : touched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Invalid email' : '';
  const isValid = email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    setLoading(true);
    setError('');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
        <p className="mt-1 text-sm text-gray-500">{sent ? 'Check your email for the reset link' : 'Enter your email and we will send you a reset link'}</p>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        {sent ? (
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50"><svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
            <p className="text-sm text-gray-500">We sent a reset link to <strong className="text-gray-900">{email}</strong>. It may take a few minutes.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input type="email" placeholder="you@company.com" value={email} onChange={(e) => { setEmail(e.target.value); setTouched(true); }} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all" disabled={loading} />
              {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}</div>
            <button type="submit" disabled={loading || !isValid} className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm">{loading ? 'Sending...' : 'Send Reset Link'}</button>
          </form>
        )}
      </div>
      <p className="mt-6 text-center text-sm text-gray-500"><a href="/login" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">Back to sign in</a></p>
    </div>
  );
}