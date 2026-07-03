'use client';

import { useState } from 'react';
import { Button, Input } from '@/pkg/ui-components';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [touched, setTouched] = useState(false);

  const emailError = touched && !email.trim()
    ? 'Email is required'
    : touched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? 'Invalid email format'
      : '';

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
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 mb-4">
          <svg className="h-7 w-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
        <p className="mt-1 text-sm text-gray-500">
          {sent ? 'Check your email for the reset link' : "Enter your email and we'll send you a reset link"}
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        {sent ? (
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-gray-400">
              We&apos;ve sent a password reset link to <strong className="text-gray-900">{email}</strong>. It may take a few minutes to arrive.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-status-error/30 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Input
              label="Email address"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setTouched(true); }}
              error={emailError}
              disabled={loading}
            />

            <Button type="submit" variant="primary" fullWidth disabled={loading}>
              {loading ? 'Sending…' : 'Send Reset Link'}
            </Button>
          </form>
        )}
      </div>

      {/* Back to login */}
      <p className="mt-6 text-center text-sm text-gray-500">
        <a href="/login" className="font-medium text-blue-600 hover:text-blue-600-light transition-colors">
          ← Back to sign in
        </a>
      </p>
    </div>
  );
}
