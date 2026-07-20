'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { useI18n } from '@/components/i18n-provider';
import PlumbCoreLogo from '@/components/PlumbCoreLogo';
import { PLAN_LABELS, PLAN_PRICES, PLAN_FEATURES, PLAN_AI_RECEPTIONIST_HOURS, PLAN_MAX_TECHS } from '@/lib/plan-pricing';

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

const PLANS = [
  {
    id: 'solo',
    name: 'Solo',
    price: 349,
    priceLabel: '$349/mo',
    description: 'Best for owner-operators and solo plumbers',
    features: ['Up to 1 technician', '15h AI receptionist', 'AI photo estimates', 'Job scheduling & dispatch', 'Invoicing & payments'],
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 799,
    priceLabel: '$799/mo',
    description: 'For growing shops with 2-10 techs',
    features: ['Up to 10 technicians', '60h AI receptionist', 'Route optimization', 'Team management', 'Voice-to-invoice'],
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 1499,
    priceLabel: '$1,499/mo',
    description: 'For scaling companies with 11-25 techs',
    features: ['Up to 25 technicians', '150h AI receptionist', 'Inventory tracking', 'Customer portal', 'White-label branding'],
    popular: false,
  },
];

const STRIPE_PRICE_IDS: Record<string, string> = {
  solo: 'price_1Tt6N8DynIU5fZLWmBY3zi05',
  pro: 'price_1Tt6N9DynIU5fZLWWYqfTfUc',
  business: 'price_1Tt6NADynIU5fZLWRymLht9U',
};

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="w-full text-center py-20"><p className="text-muted-foreground">Loading...</p></div>
    }>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const sessionId = searchParams.get('session_id') || '';
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [step, setStep] = useState<'plan' | 'form'>('plan');
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

  const phoneError = touched.phone && form.phone.length > 0 && form.phone.length < 10 ? t('auth.signup.validPhone') : '';
  const errors: Partial<Record<keyof FormData, string>> = {};
  if (touched.companyName && !form.companyName.trim()) errors.companyName = t('auth.signup.fieldRequired');
  if (touched.fullName && !form.fullName.trim()) errors.fullName = t('auth.signup.fieldRequired');
  if (touched.email && !form.email.trim()) errors.email = t('auth.signup.fieldRequired');
  else if (touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = t('auth.signup.invalidEmail');
  if (phoneError) errors.phone = phoneError;
  else if (touched.phone && !form.phone) errors.phone = t('auth.signup.fieldRequired');
  if (touched.password && !form.password) errors.password = t('auth.signup.fieldRequired');
  else if (touched.password && form.password.length < 8) errors.password = t('auth.signup.minChars');
  if (touched.confirmPassword && !form.confirmPassword) errors.confirmPassword = t('auth.signup.pleaseConfirm');
  else if (touched.confirmPassword && form.password !== form.confirmPassword) errors.confirmPassword = t('auth.signup.passwordsNoMatch');
  const isValid = form.companyName.trim() && form.fullName.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && form.phone.length >= 10 && form.password.length >= 8 && form.password === form.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({companyName:true,fullName:true,email:true,phone:true,password:true,confirmPassword:true});
    if (!isValid || !selectedPlan) return;
    setLoading(true); setError('');
    try {
      // Create Stripe checkout session first
      const priceId = STRIPE_PRICE_IDS[selectedPlan];
      if (!priceId) {
        throw new Error('Invalid plan selected');
      }
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, planName: selectedPlan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      // Fallback: direct signup if checkout fails to redirect
      await useAuthStore.getState().signUp(form.email, form.password, form.fullName, form.companyName, form.phone, sessionId);
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: unknown) {
      let message = t('auth.signup.signUpFailed');
      if (err instanceof Error) message = err.message;
      else if (typeof err === 'string') message = err;
      else if (err && typeof err === 'object' && 'message' in err) message = String(err.message);
      setError(message);
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="w-full text-center py-12">
      <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4"><svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></div>
      <h2 className="text-xl font-bold text-foreground mb-2">{t('auth.signup.successTitle')}</h2>
      <p className="text-sm text-muted-foreground">{t('auth.signup.successSubtitle')}</p>
    </div>
  );

  if (step === 'plan') {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Brand Panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-tint via-blue-tint2 to-blue-tint2 text-foreground p-12 xl:p-16 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_30%,rgba(59,130,246,0.08),transparent),radial-gradient(ellipse_60%_40%_at_80%_70%,rgba(6,182,212,0.06),transparent),radial-gradient(ellipse_50%_30%_at_50%_0%,rgba(99,102,241,0.04),transparent)]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] bg-repeat" />
          <div className="relative z-10">
            <PlumbCoreLogo size="xl" showText={true} />
            <h2 className="text-3xl font-bold mb-4 leading-tight text-slate-800">{t('auth.signup.brandTitle')}</h2>
            <p className="text-muted-foreground text-sm max-w-md leading-relaxed">{t('auth.signup.brandSubtitle')}</p>
            <div className="mt-8 space-y-4">
              {[
                { icon: '🤖', text: t('auth.signup.brandFeature1') },
                { icon: '📅', text: t('auth.signup.brandFeature2') },
                { icon: '💰', text: t('auth.signup.brandFeature3') },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3"><span className="text-lg">{f.icon}</span><span className="text-sm text-muted-foreground">{f.text}</span></div>
              ))}
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-4"><div className="flex -space-x-2">{[...Array(4)].map((_, i) => <div key={i} className="w-8 h-8 rounded-full bg-muted border-2 border-white flex items-center justify-center text-[10px] font-bold text-muted-foreground">P{i+1}</div>)}</div><div><p className="text-sm font-medium text-foreground">{t('auth.signup.trusted')}</p><p className="text-xs text-muted-foreground/80">{t('auth.signup.rating')}</p></div></div>
        </div>

        {/* Plan Selection Panel */}
        <div className="flex-1 flex items-center justify-center bg-white p-6 sm:p-10 min-h-screen lg:min-h-0">
          <div className="w-full max-w-lg">
            <div className="flex lg:hidden mb-8"><PlumbCoreLogo size="sm" showText={true} /></div>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-foreground">Choose Your Plan</h1>
              <p className="mt-1 text-sm text-muted-foreground">Select a plan to get started with PlumbCore AI</p>
            </div>
            <div className="space-y-4">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => { setSelectedPlan(plan.id); setStep('form'); }}
                  className={`w-full text-left rounded-2xl border-2 p-5 transition-all hover:shadow-md ${
                    selectedPlan === plan.id
                      ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                      : 'border-border bg-white hover:border-border'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                        {plan.popular && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">POPULAR</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">${plan.price}</p>
                      <p className="text-xs text-muted-foreground/80">/month</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <a href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">Sign in</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-tint via-blue-tint2 to-blue-tint2 text-foreground p-12 xl:p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_30%,rgba(59,130,246,0.08),transparent),radial-gradient(ellipse_60%_40%_at_80%_70%,rgba(6,182,212,0.06),transparent),radial-gradient(ellipse_50%_30%_at_50%_0%,rgba(99,102,241,0.04),transparent)]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] bg-repeat" />
        <div className="relative z-10">
          <PlumbCoreLogo size="xl" showText={true} />
          <h2 className="text-3xl font-bold mb-4 leading-tight text-slate-800">{t('auth.signup.brandTitle')}</h2>
          <p className="text-muted-foreground text-sm max-w-md leading-relaxed">{t('auth.signup.brandSubtitle')}</p>
          <div className="mt-8 space-y-4">
            {[
              { icon: '🤖', text: t('auth.signup.brandFeature1') },
              { icon: '📅', text: t('auth.signup.brandFeature2') },
              { icon: '💰', text: t('auth.signup.brandFeature3') },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3"><span className="text-lg">{f.icon}</span><span className="text-sm text-muted-foreground">{f.text}</span></div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-4"><div className="flex -space-x-2">{[...Array(4)].map((_, i) => <div key={i} className="w-8 h-8 rounded-full bg-muted border-2 border-white flex items-center justify-center text-[10px] font-bold text-muted-foreground">P{i+1}</div>)}</div><div><p className="text-sm font-medium text-foreground">{t('auth.signup.trusted')}</p><p className="text-xs text-muted-foreground/80">{t('auth.signup.rating')}</p></div></div>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center bg-white p-6 sm:p-10 min-h-screen lg:min-h-0">
        <div className="w-full max-w-sm">
          <div className="flex lg:hidden mb-8"><PlumbCoreLogo size="sm" showText={true} /></div>
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-foreground">{t('auth.signup.title')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('auth.signup.subtitle')}</p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t('auth.signup.companyLabel')}</label>
                <input type="text" placeholder={t('auth.signup.companyPlaceholder')} value={form.companyName} onChange={update('companyName')} disabled={loading} className={`w-full h-11 rounded-xl border bg-white px-4 text-sm outline-none transition-all ${errors.companyName ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-border focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`} />
                {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t('auth.signup.fullNameLabel')}</label>
                <input type="text" placeholder={t('auth.signup.fullNamePlaceholder')} value={form.fullName} onChange={update('fullName')} disabled={loading} className={`w-full h-11 rounded-xl border bg-white px-4 text-sm outline-none transition-all ${errors.fullName ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-border focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`} />
                {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">{t('auth.signup.emailLabel')}</label>
                  <input type="email" placeholder={t('auth.signup.emailPlaceholder')} value={form.email} onChange={update('email')} disabled={loading} className={`w-full h-11 rounded-xl border bg-white px-4 text-sm outline-none transition-all ${errors.email ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-border focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`} />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">{t('auth.signup.phoneLabel')}</label>
                  <input type="tel" inputMode="numeric" placeholder={t('auth.signup.phonePlaceholder')} value={phoneDisplay} onChange={update('phone')} disabled={loading} className={`w-full h-11 rounded-xl border bg-white px-4 text-sm outline-none transition-all ${errors.phone ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-border focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`} />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">{t('auth.signup.passwordLabel')}</label>
                  <input type="password" placeholder={t('auth.signup.passwordPlaceholder')} value={form.password} onChange={update('password')} disabled={loading} className={`w-full h-11 rounded-xl border bg-white px-4 text-sm outline-none transition-all ${errors.password ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-border focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`} />
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">{t('auth.signup.confirmLabel')}</label>
                  <input type="password" placeholder={t('auth.signup.confirmPlaceholder')} value={form.confirmPassword} onChange={update('confirmPassword')} disabled={loading} className={`w-full h-11 rounded-xl border bg-white px-4 text-sm outline-none transition-all ${errors.confirmPassword ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-border focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`} />
                  {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
              <button type="submit" disabled={loading || !isValid} className="w-full h-11 rounded-xl bg-amber-400 hover:bg-amber-500 text-foreground font-bold transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm">{loading ? t('auth.signup.submitting') : t('auth.signup.submit')}</button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-muted-foreground/80">{t('auth.signup.orSignUp')}</span>
                </div>
              </div>

              <GoogleSignInButton mode="signup" />

            </form>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">{t('auth.signup.hasAccount')}{' '}<a href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">{t('auth.signup.signIn')}</a></p>
        </div>
      </div>
    </div>
  );
}
