'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import PlumbCoreLogo from '@/components/PlumbCoreLogo';
import { useI18n } from '@/components/i18n-provider';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const emailError = touched.email && !email.trim() ? t('auth.login.fieldRequired') : touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? t('auth.login.invalidEmail') : '';
  const passwordError = touched.password && !password ? t('auth.login.fieldRequired') : touched.password && password.length < 6 ? t('auth.login.minChars') : '';
  const isValid = email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!isValid) return;
    setLoading(true); setError('');
    try {
      await useAuthStore.getState().login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      let msg = t('auth.login.signInFailed');
      if (err instanceof Error) msg = err.message;
      else if (typeof err === 'string') msg = err;
      else if (err && typeof err === 'object' && 'message' in err) msg = String(err.message);
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-12 xl:p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_30%_50%,white_0%,transparent_60%)]" />
        <div className="relative z-10">
          <PlumbCoreLogo size="xl" showText={true} />
          <h2 className="text-3xl font-bold mb-4 leading-tight">{t('auth.login.brandTitle')}</h2>
          <p className="text-slate-400 text-sm max-w-md leading-relaxed">{t('auth.login.brandSubtitle')}</p>
          <div className="mt-10 space-y-4">
            {[
              { icon: '🤖', text: t('auth.login.brandFeature1') },
              { icon: '📅', text: t('auth.login.brandFeature2') },
              { icon: '💰', text: t('auth.login.brandFeature3') },
              { icon: '📊', text: t('auth.login.brandFeature4') },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3"><span className="text-lg">{f.icon}</span><span className="text-sm text-slate-300">{f.text}</span></div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-4"><div className="flex -space-x-2">{[...Array(4)].map((_, i) => <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-[10px] font-bold text-white">P{i+1}</div>)}</div><div><p className="text-sm font-medium">{t('auth.login.trusted')}</p><p className="text-xs text-slate-500">{t('auth.login.rating')}</p></div></div>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center bg-white p-6 sm:p-10 min-h-screen lg:min-h-0">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden mb-8">
            <PlumbCoreLogo size="sm" showText={true} />
          </div>
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900">{t('auth.login.title')}</h1>
            <p className="mt-1 text-sm text-slate-500">{t('auth.login.subtitle')}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('auth.login.emailLabel')}</label>
                <input type="email" placeholder={t('auth.login.emailPlaceholder')} value={email} onChange={e => { setEmail(e.target.value); setTouched(t => ({...t, email: true})); }} className={`w-full h-11 rounded-xl border bg-white px-4 text-sm outline-none transition-all ${emailError ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`} disabled={loading} />
                {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('auth.login.passwordLabel')}</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} placeholder={t('auth.login.passwordPlaceholder')} value={password} onChange={e => { setPassword(e.target.value); setTouched(t => ({...t, password: true})); }} className={`w-full h-11 rounded-xl border bg-white px-4 pr-12 text-sm outline-none transition-all ${passwordError ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`} disabled={loading} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-medium">{showPw ? t('auth.login.hide') : t('auth.login.show')}</button>
                </div>
                {passwordError && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-100" /><span className="text-sm text-slate-500">{t('auth.login.rememberMe')}</span></label>
                <a href="/reset-password" className="text-sm text-blue-600 hover:text-blue-700 transition-colors">{t('auth.login.forgotPassword')}</a>
              </div>
              <button type="submit" disabled={loading || !isValid} className="w-full h-11 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm">{loading ? t('auth.login.submitting') : t('auth.login.submit')}</button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-slate-400">{t('auth.login.orContinue')}</span>
                </div>
              </div>

              <GoogleSignInButton mode="login" />

            </form>
          </div>
          <p className="mt-6 text-center text-sm text-slate-500">{t('auth.login.noAccount')}{' '}<a href="/signup" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">{t('auth.login.signUp')}</a></p>
        </div>
      </div>
    </div>
  );
}
