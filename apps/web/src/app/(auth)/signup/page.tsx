'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import GoogleSignInButton from '@/components/GoogleSignInButton';

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

interface FormData { companyName: string; fullName: string; email: string; phone: string; password: string; confirmPassword: string; }

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="w-full text-center py-20"><p className="text-slate-500">Loading...</p></div>
    }>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id') || '';
  const [form, setForm] = useState<FormData>({ companyName:'', fullName:'', email:'', phone:'', password:'', confirmPassword:'' });
  const [phoneDisplay, setPhoneDisplay] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({ companyName:false, fullName:false, email:false, phone:false, password:false, confirmPassword:false });

  const update = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (field === 'companyName' || field === 'fullName') val = capitalizeName(val);
    if (field === 'phone') {
      const digits = val.replace(/\D/g, '');
      if (digits.length > 10) return;
      setPhoneDisplay(formatPhone(val));
      setForm(f => ({...f, phone: cleanPhone(formatPhone(val))}));
      setTouched(t => ({...t, phone: true}));
      return;
    }
    setForm(f => ({...f, [field]: val}));
    setTouched(t => ({...t, [field]: true}));
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
  const isValid = form.companyName.trim() && form.fullName.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && form.phone.length >= 10 && form.password.length >= 8 && form.password === form.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({companyName:true,fullName:true,email:true,phone:true,password:true,confirmPassword:true});
    if (!isValid) return;
    setLoading(true); setError('');
    try {
      await useAuthStore.getState().signUp(form.email, form.password, form.fullName, form.companyName, form.phone, sessionId);
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: unknown) {
      let message = 'Sign up failed. Please try again.';
      if (err instanceof Error) message = err.message;
      else if (typeof err === 'string') message = err;
      else if (err && typeof err === 'object' && 'message' in err) message = String(err.message);
      setError(message);
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="w-full text-center py-12">
      <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4"><svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Account created!</h2>
      <p className="text-sm text-slate-500">Redirecting to dashboard...</p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-12 xl:p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_30%_50%,white_0%,transparent_60%)]" />
        <div className="relative z-10">
          <a href="/" className="flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm"><span className="text-white text-sm font-bold">P</span></div>
            <span className="text-lg font-bold tracking-tight">PlumbCore <span className="text-blue-400">AI</span></span>
          </a>
          <h2 className="text-3xl font-bold mb-4 leading-tight">Run your plumbing business on autopilot</h2>
          <p className="text-slate-400 text-sm max-w-md leading-relaxed">AI-powered estimates, smart scheduling, automated invoicing. Join 500+ plumbing companies already using PlumbCore AI.</p>
          <div className="mt-8 space-y-4">
            {[
              { icon: '🤖', text: 'AI estimates in under 10 seconds' },
              { icon: '📅', text: 'Smart scheduling with route optimization' },
              { icon: '💰', text: 'Automated invoicing & payment collection' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3"><span className="text-lg">{f.icon}</span><span className="text-sm text-slate-300">{f.text}</span></div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-4"><div className="flex -space-x-2">{[...Array(4)].map((_, i) => <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-[10px] font-bold text-white">P{i+1}</div>)}</div><div><p className="text-sm font-medium">Trusted by 500+ companies</p><p className="text-xs text-slate-500">4.9★ average rating</p></div></div>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center bg-white p-6 sm:p-10 min-h-screen lg:min-h-0">
        <div className="w-full max-w-sm">
          <a href="/" className="flex lg:hidden items-center gap-2 mb-8"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"><span className="text-white text-sm font-bold">P</span></div><span className="font-bold text-slate-900">PlumbCore <span className="text-blue-500">AI</span></span></a>
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="mt-1 text-sm text-slate-500">Set up your plumbing business on PlumbCore AI</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company name</label>
                <input type="text" placeholder="e.g. Johnson Plumbing LLC" value={form.companyName} onChange={update('companyName')} disabled={loading} className={`w-full h-11 rounded-xl border bg-white px-4 text-sm outline-none transition-all ${errors.companyName ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`} />
                {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
                <input type="text" placeholder="e.g. John Smith" value={form.fullName} onChange={update('fullName')} disabled={loading} className={`w-full h-11 rounded-xl border bg-white px-4 text-sm outline-none transition-all ${errors.fullName ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`} />
                {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" placeholder="you@company.com" value={form.email} onChange={update('email')} disabled={loading} className={`w-full h-11 rounded-xl border bg-white px-4 text-sm outline-none transition-all ${errors.email ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`} />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input type="tel" inputMode="numeric" placeholder="(555) 555-5555" value={phoneDisplay} onChange={update('phone')} disabled={loading} className={`w-full h-11 rounded-xl border bg-white px-4 text-sm outline-none transition-all ${errors.phone ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`} />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input type="password" placeholder="Min. 8 characters" value={form.password} onChange={update('password')} disabled={loading} className={`w-full h-11 rounded-xl border bg-white px-4 text-sm outline-none transition-all ${errors.password ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`} />
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirm</label>
                  <input type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={update('confirmPassword')} disabled={loading} className={`w-full h-11 rounded-xl border bg-white px-4 text-sm outline-none transition-all ${errors.confirmPassword ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`} />
                  {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
              <button type="submit" disabled={loading || !isValid} className="w-full h-11 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm">{loading ? 'Creating account…' : 'Create Account'}</button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-slate-400">or sign up with</span>
                </div>
              </div>

              <GoogleSignInButton mode="signup" />

            </form>
          </div>
          <p className="mt-6 text-center text-sm text-slate-500">Already have an account?{' '}<a href="/login" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">Sign in</a></p>
        </div>
      </div>
    </div>
  );
}
