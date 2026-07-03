'use client';

import { useState } from 'react';
import { Button, Input } from '@/pkg/ui-components';

interface FormData {
  companyName: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function SignupPage() {
  const [form, setForm] = useState<FormData>({
    companyName: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
    companyName: false, fullName: false, email: false, phone: false, password: false, confirmPassword: false,
  });

  const update = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setTouched((t) => ({ ...t, [field]: true }));
  };

  const errors: Partial<Record<keyof FormData, string>> = {};
  if (touched.companyName && !form.companyName.trim()) errors.companyName = 'Company name is required';
  if (touched.fullName && !form.fullName.trim()) errors.fullName = 'Full name is required';
  if (touched.email && !form.email.trim()) errors.email = 'Email is required';
  else if (touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email format';
  if (touched.phone && !form.phone.trim()) errors.phone = 'Phone is required';
  if (touched.password && !form.password) errors.password = 'Password is required';
  else if (touched.password && form.password.length < 8) errors.password = 'Must be at least 8 characters';
  if (touched.confirmPassword && !form.confirmPassword) errors.confirmPassword = 'Please confirm your password';
  else if (touched.confirmPassword && form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';

  const isValid =
    form.companyName.trim() &&
    form.fullName.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.phone.trim() &&
    form.password.length >= 8 &&
    form.password === form.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ companyName: true, fullName: true, email: true, phone: true, password: true, confirmPassword: true });
    if (!isValid) return;
    setLoading(true);
    setError('');
    try {
      await new Promise((_, reject) => setTimeout(() => reject(new Error('Email already registered')), 1500));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign up failed. Please try again.';
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
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="mt-1 text-sm text-gray-500">Set up your plumbing business on PlumbCore</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-status-error/30 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Input label="Company name" placeholder="Johnson Plumbing LLC" value={form.companyName} onChange={update('companyName')} error={errors.companyName} disabled={loading} />
          <Input label="Full name" placeholder="John Smith" value={form.fullName} onChange={update('fullName')} error={errors.fullName} disabled={loading} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Email address" type="email" placeholder="you@company.com" value={form.email} onChange={update('email')} error={errors.email} disabled={loading} />
            <Input label="Phone number" type="tel" placeholder="(555) 000-0000" value={form.phone} onChange={update('phone')} error={errors.phone} disabled={loading} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={update('password')} error={errors.password} disabled={loading} />
            <Input label="Confirm password" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={update('confirmPassword')} error={errors.confirmPassword} disabled={loading} />
          </div>

          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>
      </div>

      {/* Sign in link */}
      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <a href="/login" className="font-medium text-blue-600 hover:text-blue-600-light transition-colors">
          Sign in
        </a>
      </p>
    </div>
  );
}
