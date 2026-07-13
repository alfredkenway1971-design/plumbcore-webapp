'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [touched, setTouched] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetComplete, setResetComplete] = useState(false);

  // Extract token from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (t) setToken(t);
  }, []);

  const emailError = touched && !email.trim()
    ? 'Required'
    : touched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? 'Invalid email'
    : '';

  const passwordError = password.length > 0 && password.length < 8
    ? 'At least 8 characters'
    : password !== confirmPassword && confirmPassword.length > 0
    ? 'Passwords do not match'
    : '';

  const isValidEmail = email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = password.length >= 8 && password === confirmPassword;

  // ── Send reset email ──
  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValidEmail) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reset email');
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // ── Submit new password ──
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPassword) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      setResetComplete(true);
      // Auto-redirect to dashboard after 2 seconds
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // ── New password form (when token is present) ──
  if (token) {
    return (
      <div className="w-full">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            {resetComplete ? 'Password Reset Complete' : 'Set New Password'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {resetComplete
              ? 'Your password has been updated. Redirecting to your dashboard...'
              : 'Enter your new password below.'}
          </p>
        </div>
        <div className="rounded-2xl ring-1 ring-black/5 bg-white p-6 sm:p-8">
          {resetComplete ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-slate-500">
                Password reset successfully. <a href="/dashboard" className="font-medium text-blue-600 hover:text-blue-700">Go to dashboard →</a>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSetPassword} className="space-y-5">
              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl ring-1 ring-black/5 bg-white px-4 py-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all"
                  disabled={loading}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl ring-1 ring-black/5 bg-white px-4 py-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all"
                  disabled={loading}
                />
                {passwordError && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}
              </div>
              <button
                type="submit"
                disabled={loading || !isValidPassword}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          <a href="/login" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">Back to sign in</a>
        </p>
      </div>
    );
  }

  // ── Email submission form (default view) ──
  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Reset password</h1>
        <p className="mt-1 text-sm text-slate-500">
          {sent ? 'Check your email for the reset link' : 'Enter your email and we will send you a reset link'}
        </p>
      </div>
      <div className="rounded-2xl ring-1 ring-black/5 bg-white p-6 sm:p-8">
        {sent ? (
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-slate-500">
              We sent a reset link to <strong className="text-slate-900">{email}</strong>. It may take a few minutes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendReset} className="space-y-5">
            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setTouched(true); }}
                className="w-full rounded-xl ring-1 ring-black/5 bg-white px-4 py-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all"
                disabled={loading}
              />
              {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
            </div>
            <button
              type="submit"
              disabled={loading || !isValidEmail}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
      <p className="mt-6 text-center text-sm text-slate-500">
        <a href="/login" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">Back to sign in</a>
      </p>
    </div>
  );
}
