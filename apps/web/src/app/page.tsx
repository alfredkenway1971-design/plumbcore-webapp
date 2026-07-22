'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/components/i18n-provider';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ArrowRight, Phone } from 'lucide-react';

/* ═══════════════════════════════════════════════
   FONTS
   heading → font-jakarta (Plus Jakarta Sans)
   body   → font-sans (Inter)
   mono   → font-mono (IBM Plex Mono)
   ═══════════════════════════════════════════════ */

/* ─── Navbar ─── */
function Navbar({ locale, onLocaleChange, t }: { locale: string; onLocaleChange: (l: string) => void; t: (key: string) => string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-line)] bg-white relative">
      <a href="/dashboard" className="flex items-center gap-2 no-underline">
        <img src="/plumbcore-logo.png" alt="PlumbCore AI" className="h-16 w-auto" />
      </a>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-5 mr-3">
          <a href="#pricing" className="text-sm font-medium text-[var(--color-muted-text)] hover:text-[var(--color-blue)] transition-colors">{t('home.navPricing')}</a>
          <a href="#features" className="text-sm font-medium text-[var(--color-muted-text)] hover:text-[var(--color-blue)] transition-colors">{t('home.navFeatures')}</a>
          <a href="#testimonials" className="text-sm font-medium text-[var(--color-muted-text)] hover:text-[var(--color-blue)] transition-colors">{t('home.navTestimonials')}</a>
          <a href="/login" className="text-sm font-medium text-[var(--color-muted-text)] hover:text-[var(--color-blue)] transition-colors">{t('home.navSignIn')}</a>
        </div>
        <LanguageSwitcher locale={locale} onLocaleChange={onLocaleChange} />
        <button onClick={() => setOpen(!open)} className="md:hidden w-5 h-[14px] relative" aria-label={t('home.navMenu')}>
          <span className={`absolute h-[2px] w-full bg-[var(--color-ink)] left-0 rounded-sm top-0 transition-transform ${open ? 'rotate-45 top-[6px]' : ''}`} />
          <span className={`absolute h-[2px] w-full bg-[var(--color-ink)] left-0 rounded-sm top-[6px] transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span className={`absolute h-[2px] w-full bg-[var(--color-ink)] left-0 rounded-sm top-[12px] transition-transform ${open ? '-rotate-45 top-[6px]' : ''}`} />
        </button>
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-[var(--color-line)] shadow-lg z-50 md:hidden">
          <div className="flex flex-col px-5 py-4 gap-4">
            <a href="#pricing" onClick={() => setOpen(false)} className="text-sm font-medium text-[var(--color-muted-text)] hover:text-[var(--color-blue)] transition-colors">{t('home.navPricing')}</a>
            <a href="#features" onClick={() => setOpen(false)} className="text-sm font-medium text-[var(--color-muted-text)] hover:text-[var(--color-blue)] transition-colors">{t('home.navFeatures')}</a>
            <a href="#testimonials" onClick={() => setOpen(false)} className="text-sm font-medium text-[var(--color-muted-text)] hover:text-[var(--color-blue)] transition-colors">{t('home.navTestimonials')}</a>
            <a href="/login" onClick={() => setOpen(false)} className="text-sm font-medium text-[var(--color-blue)] font-semibold hover:text-[var(--color-blue-bright)] transition-colors">{t('home.navSignIn')}</a>
          </div>
        </div>
      )}
    </header>
  );
}

/* ─── Hero ─── */
function HeroSection({ t }: { t: (key: string) => string }) {
  return (
    <section className="px-5 lg:px-10 pt-12 lg:pt-20 pb-10 lg:pb-14 bg-gradient-to-b from-[var(--color-blue-tint)] to-white">
      <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-blue)] font-semibold flex items-center gap-2">
        <span className="w-[6px] h-[6px] rounded-[1px] bg-[var(--color-blue-bright)] inline-block" />
        {t('home.heroBadge')}
      </span>
      <h1 className="font-jakarta font-extrabold text-[38px] lg:text-[52px] xl:text-[60px] leading-[1.08] tracking-tight text-[var(--color-blue-deep)] mt-3 mb-3">
        {t('home.heroLine1')}{' '}
        <span className="text-[var(--color-blue-bright)]">{t('home.heroLineHighlight')}</span>{' '}
        {t('home.heroLine2')}
      </h1>
      <p className="text-[15px] lg:text-[17px] text-[var(--color-muted-text)] leading-relaxed max-w-[40ch] mb-6">
        {t('home.heroSub')}
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-5">
        <a href="/signup" className="bg-[var(--color-blue)] text-white font-jakarta font-bold text-[16px] py-[16px] px-8 rounded-[10px] flex items-center justify-center gap-2 shadow-[0_10px_24px_-8px_rgba(30,86,214,0.45)] hover:brightness-110 transition-all active:scale-[0.98]">
          {t('home.heroCta')} <ArrowRight className="w-4 h-4" />
        </a>
        <a href="#how-it-works" className="text-[var(--color-blue-deep)] font-medium text-[14px] py-[16px] px-4 hover:underline underline-offset-2 transition-all">
          {t('home.heroDemo')} →
        </a>
      </div>
      <div className="flex items-center gap-2 justify-center text-[13px] text-[var(--color-muted-text)]">
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--color-blue-tint)] text-[var(--color-blue)] font-semibold text-[12px]">{t('home.heroShops')}</span>
        <span>{t('home.heroShopsLabel')}</span>
      </div>
    </section>
  );
}

/* ─── How It Works Steps ─── */
function HowItWorksSection({ t }: { t: (key: string) => string }) {
  const steps = [
    { num: '01', title: t('home.step1Title'), desc: t('home.step1Desc') },
    { num: '02', title: t('home.step2Title'), desc: t('home.step2Desc') },
    { num: '03', title: t('home.step3Title'), desc: t('home.step3Desc') },
  ];
  return (
    <section className="scroll-reveal px-5 lg:px-10 py-11 lg:py-16">
      <div className="text-center mb-8 lg:mb-10">
        <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-blue)] font-semibold">{t('home.howBadge')}</span>
        <h2 className="font-jakarta font-extrabold text-[27px] lg:text-[36px] leading-[1.08] tracking-tight text-[var(--color-ink)] mt-2">{t('home.howTitle')}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-8">
      {steps.map((s, i) => (
        <div key={i} className="bg-white rounded-xl border border-[var(--color-line)] p-6 text-center hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)] transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-blue)] text-white flex items-center justify-center mx-auto mb-4 font-jakarta font-bold text-[18px]">{s.num}</div>
          <h3 className="font-jakarta font-bold text-[18px] text-[var(--color-ink)] mb-2">{s.title}</h3>
          <p className="text-[13.5px] text-[var(--color-muted-text)] leading-relaxed">{s.desc}</p>
        </div>
      ))}
      </div>
    </section>
  );
}

/* ─── Stat Strip ─── */
function StatStrip({ t }: { t: (key: string) => string }) {
  return (
    <div className="scroll-reveal mx-5 lg:mx-auto lg:max-w-2xl rounded-2xl bg-gradient-to-br from-[var(--color-blue)] to-[var(--color-blue-deep)] text-white text-center py-8 px-6 shadow-lg">
      <div className="font-jakarta font-extrabold text-[42px] lg:text-[52px] leading-none">{t('home.statAmount')}</div>
      <div className="text-[12px] lg:text-[14px] font-semibold mt-2 opacity-90 uppercase tracking-[0.08em]">{t('home.statLabel')}</div>
    </div>
  );
}

/* ─── Comparison Section ─── */
function ComparisonSection({ t }: { t: (key: string) => string }) {
  const rows = [
    { metric: t('home.compMonthlyCost'), old: t('home.compOldCost'), new_: t('home.compNewCost') },
    { metric: t('home.compLeadsIncluded'), old: t('home.compOldLeads'), new_: t('home.compNewLeads') },
    { metric: t('home.compDeposit'), old: t('home.compOldDeposit'), new_: t('home.compNewDeposit') },
    { metric: t('home.compSetup'), old: t('home.compOldSetup'), new_: t('home.compNewSetup') },
  ];
  return (
    <section className="scroll-reveal px-5 lg:px-10 py-11 lg:py-16 bg-[var(--color-bg-alt)]">
      <div className="text-center mb-8 lg:mb-10">
        <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-blue)] font-semibold">{t('home.compBadge')}</span>
        <h2 className="font-jakarta font-extrabold text-[27px] lg:text-[36px] leading-[1.08] tracking-tight text-[var(--color-ink)] mt-2">{t('home.compTitle')}</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
        {rows.map((r, i) => (
          <div key={i} className="rounded-xl p-5 bg-white border border-[var(--color-line)] text-center">
            <div className="text-[12px] font-mono uppercase tracking-[0.05em] text-[var(--color-muted-text)] mb-2">{r.metric}</div>
            <div className="flex items-center justify-center gap-2">
              <div className="flex-1 bg-red-50 rounded-lg py-2 text-[13px] font-medium" style={{ color: '#C1544B' }}><s>{r.old}</s></div>
              <div className="flex-1 bg-green-50 rounded-lg py-2 text-[13px] font-semibold text-[var(--color-green)]">{r.new_}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Pricing Card ─── */
function PricingCard({ plan, featured, scarcity, t }: {
  plan: { name: string; price: string; per?: string; features: string[]; cta: string; onClick?: () => void };
  featured?: boolean; scarcity?: string; t: (key: string) => string;
}) {
  return (
    <div className={`rounded-xl px-5 py-5 ${featured ? 'border-2 border-[var(--color-blue)] bg-gradient-to-b from-[var(--color-blue-tint2)] to-white shadow-[0_14px_30px_-12px_rgba(30,86,214,0.35)]' : 'border border-[var(--color-line)] shadow-[0_2px_8px_-4px_rgba(0,0,0,0.06)] bg-white'} relative`}>
      {featured && (
        <div className="absolute -top-3 left-5 bg-[var(--color-blue)] text-white font-mono text-[10px] font-bold tracking-[0.05em] px-2.5 py-1 rounded-full uppercase">{t('home.pricingBadgeFeatured')}</div>
      )}
      <h3 className="font-jakarta text-[21px] text-[var(--color-ink)] mb-0.5">{plan.name}</h3>
      <div className="font-jakarta font-extrabold text-[32px] text-[var(--color-blue-deep)] mt-2 mb-1">
        {plan.price}<span className="font-inter text-[13px] text-[var(--color-muted-text)] font-normal">{plan.per || '/mo'}</span>
      </div>
      <ul className="list-none my-3.5 space-y-1.5">
        {plan.features.map((f, i) => (
          <li key={i} className="text-[13px] text-[var(--color-muted-text)] flex gap-2 items-start">
            <span className="text-[var(--color-blue)] font-bold flex-none">✓</span> {f}
          </li>
        ))}
      </ul>
      <button onClick={plan.onClick} className={`w-full py-3 px-5 rounded-[10px] font-semibold text-[14px] transition-all active:scale-[0.98] ${featured ? 'bg-[var(--color-blue)] text-white font-jakarta font-bold shadow-[0_10px_24px_-8px_rgba(30,86,214,0.45)] hover:brightness-110' : 'bg-white text-[var(--color-blue)] border-2 border-[var(--color-blue)]/30 hover:bg-[var(--color-blue-tint)] hover:border-[var(--color-blue)]'}`}>
        {plan.cta}
      </button>
    </div>
  );
}

/* ─── Estimate Banner (Consumer CTA) ─── */
function EstimateBanner({ t }: { t: (key: string) => string }) {
  return (
    <section className="scroll-reveal px-5 lg:px-10 py-11 bg-white">
      <div className="bg-gradient-to-br from-[var(--color-blue-tint)] to-white rounded-2xl p-6 border border-[var(--color-line)] text-center">
        <div className="w-14 h-14 rounded-full bg-[var(--color-blue)] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[var(--color-blue)]/20">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.16a15.53 15.53 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
        </div>
        <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-blue)] font-semibold">{t('home.estimateBadge')}</span>
        <h2 className="font-jakarta font-extrabold text-[23px] leading-[1.08] tracking-tight text-[var(--color-ink)] mt-2 mb-2">
          {t('home.estimateTitle')}
        </h2>
        <p className="text-[13.5px] text-[var(--color-muted-text)] leading-relaxed mb-5 max-w-[30ch] mx-auto">
          {t('home.estimateSub')}
        </p>
        <a
          href="/quote/plumbcore"
          className="inline-flex items-center gap-2 bg-[var(--color-blue)] text-white font-jakarta font-bold text-[15px] py-3.5 px-6 rounded-[10px] shadow-[0_10px_24px_-8px_rgba(30,86,214,0.45)] hover:brightness-110 transition-all active:scale-[0.98]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.16a15.53 15.53 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
          {t('home.estimateCta')}
        </a>
      </div>
    </section>
  );
}

/* ─── Pricing Section ─── */
function PricingSection({ t }: { t: (key: string) => string }) {
  const r = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      id: 'solo', name: t('home.planSolo'), price: '$349',
      features: [
        t('home.planSoloFeature1'), t('home.planSoloFeature2'),
        t('home.planSoloFeature3'), t('home.planSoloFeature4'), t('home.planSoloFeature5'),
      ],
      cta: t('home.startFreeTrial'),
    },
    {
      id: 'pro', name: t('home.planPro'), price: '$799', featured: true,
      scarcity: t('home.planScarcity'),
      features: [
        t('home.planProFeature1'), t('home.planProFeature2'),
        t('home.planProFeature3'), t('home.planProFeature4'), t('home.planProFeature5'),
      ],
      cta: t('home.startFreeTrial'),
    },
    {
      id: 'business', name: t('home.planBusiness'), price: '$1,499',
      features: [
        t('home.planBusFeature1'), t('home.planBusFeature2'),
        t('home.planBusFeature3'), t('home.planBusFeature4'), t('home.planBusFeature5'),
      ],
      cta: t('home.startFreeTrial'),
    },
    {
      id: 'enterprise', name: t('home.planEnterprise'), price: t('home.contactUs'),
      features: [
        t('home.planEntFeature1'), t('home.planEntFeature2'),
        t('home.planEntFeature3'), t('home.planEntFeature4'), t('home.planEntFeature5'),
      ],
      cta: t('home.contactUs'),
    },
  ];

  const handleCheckout = async (plan: typeof plans[0]) => {
    if (plan.cta === t('home.contactUs')) {
      window.location.href = 'mailto:sales@plumbcore.ai';
      return;
    }
    setLoading(plan.id);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: plan.id === 'solo' ? 'price_1Tt6N8DynIU5fZLWmBY3zi05' : plan.id === 'pro' ? 'price_1Tt6N9DynIU5fZLWWYqfTfUc' : plan.id === 'business' ? 'price_1Tt6NADynIU5fZLWRymLht9U' : null, planName: plan.name }),
      });
      const data = await res.json();
      window.location.href = data.url || '/signup';
    } catch {
      r.push('/signup');
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="scroll-reveal px-5 lg:px-10 py-11 bg-[var(--color-bg-alt)]">
      <div className="mb-5">
        <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-blue)] font-semibold">{t('home.pricingBadge')}</span>
        <h2 className="font-jakarta font-extrabold text-[27px] leading-[1.08] tracking-tight text-[var(--color-ink)] mt-2">{t('home.pricingTitle')}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
      {plans.map((p, i) => (
        <PricingCard
          key={i}
          plan={{ ...p, onClick: () => handleCheckout(p) }}
          featured={p.featured}
          scarcity={'scarcity' in p ? p.scarcity : undefined}
          t={t}
        />
      ))}
      </div>
    </section>
  );
}

/* ─── Deposit Tiers ─── */
function DepositSection({ t }: { t: (key: string) => string }) {
  const rows = [
    { label: t('home.depositUnder1000'), deposit: '$49', keep: '$49' },
    { label: t('home.deposit1000to1499'), deposit: '$99', keep: '$99' },
    { label: t('home.deposit1500to1999'), deposit: '$149', keep: '$149' },
    { label: t('home.deposit2000plus'), deposit: '$199', keep: '$199' },
  ];
  return (
    <section className="scroll-reveal px-5 lg:px-10 py-11">
      <div className="mb-6">
        <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-blue)] font-semibold">{t('home.depositBadge')}</span>
        <h2 className="font-jakarta font-extrabold text-[27px] leading-[1.08] tracking-tight text-[var(--color-ink)] mt-2">{t('home.depositTitle')}</h2>
        <p className="text-[13.5px] text-[var(--color-muted-text)] mt-2 leading-relaxed">{t('home.depositSub')}</p>
      </div>
      <div className="border border-[var(--color-line)] rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1.4fr_1fr_1fr] items-center px-3.5 py-3 border-b border-[var(--color-line)] font-mono text-[10px] uppercase tracking-[0.05em] text-[var(--color-muted-text)] bg-[var(--color-bg-alt)]">
          <div>{t('home.depositColJobValue')}</div><div className="text-center">{t('home.depositColDeposit')}</div><div className="text-center">{t('home.depositColYouKeep')}</div>
        </div>
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[1.4fr_1fr_1fr] items-center px-3.5 py-3 text-[13px] border-b border-[var(--color-line)] last:border-b-0">
            <div className="text-[var(--color-ink)] font-medium">{r.label}</div>
            <div className="text-center font-semibold text-[var(--color-green)]">{r.deposit}</div>
            <div className="text-center font-semibold text-[var(--color-green)]">{r.keep}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Lead Priority ─── */
function PrioritySection({ t }: { t: (key: string) => string }) {
  return (
    <section className="scroll-reveal px-5 lg:px-10 py-11 bg-[var(--color-bg-alt)]">
      <div className="mb-6">
        <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-blue)] font-semibold">{t('home.priorityBadge')}</span>
        <h2 className="font-jakarta font-extrabold text-[27px] leading-[1.08] tracking-tight text-[var(--color-ink)] mt-2">{t('home.priorityTitle')}</h2>
        <p className="text-[13.5px] text-[var(--color-muted-text)] mt-2 leading-relaxed">{t('home.prioritySub')}</p>
      </div>
      <div className="border border-[var(--color-line)] rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_2fr] items-center px-3.5 py-3 border-b border-[var(--color-line)] font-mono text-[10px] uppercase tracking-[0.05em] text-[var(--color-muted-text)] bg-[var(--color-bg-alt)]">
          <div>{t('home.priorityColJobValue')}</div><div className="text-center">{t('home.priorityColWhoGets')}</div>
        </div>
        {[
          { val: t('home.priorityUnder500'), desc: t('home.priorityUnder500Desc') },
          { val: t('home.priority500to1999'), desc: t('home.priority500to1999Desc') },
          { val: t('home.priority2000plus'), desc: t('home.priority2000plusDesc') },
        ].map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_2fr] items-center px-3.5 py-3 text-[13px] border-b border-[var(--color-line)] last:border-b-0">
            <div className="text-[var(--color-ink)] font-medium">{r.val}</div>
            <div className="text-center font-semibold text-[var(--color-green)]">{r.desc}</div>
          </div>
        ))}
      </div>
      {/* Score Formula */}
      <div className="mt-4 border border-[var(--color-line)] rounded-xl p-4 bg-[var(--color-bg-alt)]">
        <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-blue)] font-semibold flex items-center gap-2 mb-2">
          <span className="w-[6px] h-[6px] rounded-[1px] bg-[var(--color-blue-bright)] inline-block" />
          {t('home.scoreTitle')}
        </span>
        {[
          { label: t('home.scoreDistance'), val: '30%' },
          { label: t('home.scoreAvailability'), val: '25%' },
          { label: t('home.scoreTier'), val: t('home.scoreTierVal') },
          { label: t('home.scoreRating'), val: '15%' },
          { label: t('home.scoreResponse'), val: '10%' },
        ].map((s, i) => (
          <div key={i} className="flex justify-between text-[13px] text-[var(--color-muted-text)] py-1.5">
            <span>{s.label}</span>
            <span className="font-mono text-[12px] text-[var(--color-ink)] font-semibold">{s.val}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */
function TestimonialsSection({ t }: { t: (key: string) => string }) {
  const items = [
    { initials: 'JM', name: t('home.testi1Name'), role: t('home.testi1Role'), quote: t('home.testi1Quote') },
    { initials: 'SR', name: t('home.testi2Name'), role: t('home.testi2Role'), quote: t('home.testi2Quote') },
  ];
  return (
    <section className="scroll-reveal px-5 lg:px-10 py-11">
      <div className="mb-5">
        <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-blue)] font-semibold">{t('home.testiBadge')}</span>
        <h2 className="font-jakarta font-extrabold text-[27px] leading-[1.08] tracking-tight text-[var(--color-ink)] mt-2">{t('home.testiTitle')}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3 p-4 border border-[var(--color-line)] rounded-xl bg-white">
          <div className="w-[42px] h-[42px] rounded-full bg-[var(--color-blue-tint)] flex items-center justify-center font-jakarta font-bold text-[15px] text-[var(--color-blue)] flex-none">{item.initials}</div>
          <div className="min-w-0">
            <div className="text-[13px] font-bold text-[var(--color-ink)]">{item.name}</div>
            <div className="text-[11px] text-[var(--color-muted-text)] mb-1.5">{item.role}</div>
            <div className="text-[var(--color-amber)] text-[12px] mb-1">★★★★★</div>
            <div className="text-[13px] text-[var(--color-muted-text)] leading-relaxed">"{item.quote}"</div>
          </div>
        </div>
      ))}
      </div>
    </section>
  );
}

/* ─── FAQ ─── */
function FaqSection({ t }: { t: (key: string) => string }) {
  const faqs = [
    { q: t('home.faqDepositQ'), a: t('home.faqDepositA') },
    { q: t('home.faqCancelQ'), a: t('home.faqCancelA') },
    { q: t('home.faqHardwareQ'), a: t('home.faqHardwareA') },
  ];
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <section className="scroll-reveal px-5 lg:px-10 py-11 bg-[var(--color-bg-alt)]">
      <div className="mb-5">
        <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-blue)] font-semibold">{t('home.faqBadge')}</span>
        <h2 className="font-jakarta font-extrabold text-[27px] leading-[1.08] tracking-tight text-[var(--color-ink)] mt-2">{t('home.faqTitle')}</h2>
      </div>
      {faqs.map((f, i) => (
        <div key={i} className="border-b border-[var(--color-line)] py-3.5">
          <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className="w-full flex justify-between items-center text-left">
            <span className="text-[14.5px] font-semibold text-[var(--color-ink)]">{f.q}</span>
            <span className={`text-[var(--color-blue)] transition-transform duration-200 ${openIdx === i ? 'rotate-45' : ''}`}>+</span>
          </button>
          {openIdx === i && (
            <div className="text-[13px] text-[var(--color-muted-text)] mt-2 leading-relaxed">{f.a}</div>
          )}
        </div>
      ))}
    </section>
  );
}

/* ─── Final CTA ─── */
function FinalCtaSection({ t }: { t: (key: string) => string }) {
  return (
    <div className="scroll-reveal bg-[var(--color-blue-deep)] text-center px-5 lg:px-10 py-10 text-white">
      <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-[#B9CCF4] font-semibold flex items-center gap-2 justify-center">
        <span className="w-[6px] h-[6px] rounded-[1px] bg-[#B9CCF4] inline-block" />
        {t('home.ctaBadge')}
      </span>
      <h2 className="font-jakarta font-extrabold text-[26px] leading-[1.08] tracking-tight text-white mt-2 mb-4">{t('home.ctaTitle')}</h2>
      <a href="/signup" className="w-full sm:w-auto inline-block bg-white text-[var(--color-blue-deep)] font-jakarta font-bold text-[16px] py-[15px] px-8 rounded-[10px] shadow-[0_10px_24px_-8px_rgba(30,86,214,0.45)] hover:brightness-95 transition-all active:scale-[0.98] mb-2.5">
        {t('home.ctaButton')} <ArrowRight className="w-4 h-4 inline" />
      </a>
      <p className="text-[12px] text-[#B9CCF4]">{t('home.ctaSub')}</p>
    </div>
  );
}

/* ─── Footer ─── */
function Footer({ t }: { t: (key: string) => string }) {
  return (
    <footer className="px-5 py-6 border-t border-[var(--color-line)] text-center text-[11px] text-[var(--color-muted-text)]">
      <a href="/dashboard" className="flex items-center justify-center mb-2.5 no-underline">
        <img src="/plumbcore-logo.png" alt="PlumbCore AI" className="h-14 w-auto" />
      </a>
      <div>{t('home.footerText')}</div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════════ */
export default function LandingPage() {
  const { locale, changeLocale, t } = useI18n();
  return (
    <main className="max-w-[430px] lg:max-w-5xl xl:max-w-6xl mx-auto bg-white min-h-screen">
      <Navbar locale={locale} onLocaleChange={(l) => changeLocale(l as 'en' | 'fr' | 'es' | 'de')} t={t} />
      <HeroSection t={t} />
      <HowItWorksSection t={t} />
      <StatStrip t={t} />
      <ComparisonSection t={t} />
      <EstimateBanner t={t} />
      <PricingSection t={t} />
      <DepositSection t={t} />
      <PrioritySection t={t} />
      <TestimonialsSection t={t} />
      <FaqSection t={t} />
      <FinalCtaSection t={t} />
      <Footer t={t} />
    </main>
  );
}
