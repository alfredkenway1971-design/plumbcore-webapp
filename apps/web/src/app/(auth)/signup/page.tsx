'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/pkg/ui-components';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

/* ─── Helpers ─── */
function capitalizeName(val: string): string {
  return val.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function formatPhone(val: string): string {
  const d = val.replace(/\D/g, '').slice(0, 10);
  if (d.length === 0) return '';
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function cleanPhone(val: string): string { return val.replace(/\D/g, ''); }

interface FormData {
  companyName: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    companyName: '', fullName: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const [phoneDisplay, setPhoneDisplay] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
    companyName: false, fullName: false, email: false, phone: false, password: false, confirmPassword: false,
  });

  const update = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (field === 'companyName' || field === 'fullName') val = capitalizeName(val);
    if (field === 'phone') {
      const digits = val.replace(/\D/g, '');
      if (digits.length > 10) return;
      const formatted = formatPhone(val);
      setPhoneDisplay(formatted);
      setForm((f) => ({ ...f, phone: cleanPhone(formatted) }));
      setTouched((t) => ({ ...t, phone: true }));
      return;
    }
    setForm((f) => ({ ...f, [field]: val }));
    setTouched((t) => ({ ...t, [field]: true }));
  };

  const phoneError = touched.phone && form.phone.length > 0 && form.phone.length < 10 ? 'Enter a valid 10-digit number' : '';
  const errors: Partial<Record<keyof FormData, string>> = {};
  if (touched.companyName && !form.companyName.trim()) errors.companyName = 'Required';
  if (touched.fullName && !form.fullName.trim()) errors.fullName = 'Required';
  if (touched.email && !form.email.trim()) errors.email = 'Required';
  else if (touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email';
  if (phoneError) errors.phone = phoneError;
  else if (touched.phone && !form.phone) errors.phone = 'Required';
  if (touched.password && !form.password) errors.password = 'Required';
  else if (touched.password && form.password.length < 8) errors.password = 'Min 8 characters';
  if (touched.confirmPassword && !form.confirmPassword) errors.confirmPassword = 'Please confirm';
  else if (touched.confirmPassword && form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';

  const isValid =
    form.companyName.trim() && form.fullName.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.phone.length >= 10 && form.password.length >= 8 &&
    form.password === form.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ companyName: true, fullName: true, email: true, phone: true, password: true, confirmPassword: true });
    if (!isValid) return;
    setLoading(true);
    setError('');

    try {
      // Real Supabase signup
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
            company_name: form.companyName,
            phone: form.phone,
          }
        }
      });

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      if (data.user) {
        setSuccess(true);
        // Navigate to dashboard after success — don't block on profile fetch
        setTimeout(() => router.push('/dashboard'), 1500);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign up failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full text-center py-12">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Account created!</h2>
        <p className="text-sm text-gray-500">Check your email for a confirmation link.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="mt-1 text-sm text-gray-500">Set up your plumbing business on PlumbCore</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          <Input label="Company name" placeholder="e.g. Johnson Plumbing LLC" value={form.companyName} onChange={update('companyName')} error={errors.companyName} disabled={loading} />
          <Input label="Full name" placeholder="e.g. John Smith" value={form.fullName} onChange={update('fullName')} error={errors.fullName} disabled={loading} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Email address" type="email" placeholder="you@company.com" value={form.email} onChange={update('email')} error={errors.email} disabled={loading} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="(555) 555-5555"
                value={phoneDisplay}
                onChange={update('phone')}
                disabled={loading}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
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

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <a href="/login" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">Sign in</a>
      </p>
    </div>
  );
}