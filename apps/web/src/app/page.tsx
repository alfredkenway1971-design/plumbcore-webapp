'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/components/i18n-provider';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import PlumbCoreLogo from '@/components/PlumbCoreLogo';
import HTMLText from '@/components/HTMLText';
import {
  Camera, Mic, MapPin, Package, Calendar, MessageCircle,
  ChevronRight, Menu, Star, Check, ArrowRight, Phone, Clock,
  Shield, Wrench, X, Minus, Play
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   NAVBAR — fixed, glass, logo + nav + LangSwitcher + Sign In + CTA
   ═══════════════════════════════════════════════════════════════ */
function Navbar({ locale, onLocaleChange, t, menuOpen, onMenuToggle }: { locale: string; onLocaleChange: (l: string) => void; t: (key: string) => string; menuOpen: boolean; onMenuToggle: (v: boolean) => void }) {
  const r = useRouter();
  const [open, setOpen] = useState(false);

  // Sync local state with parent
  useEffect(() => { onMenuToggle(open); }, [open, onMenuToggle]);

  const links = [
    { label: t('home.navFeatures'), href: '#features' },
    { label: t('home.navPricing'), href: '#pricing' },
    { label: t('home.navCompare'), href: '#compare' },
    { label: t('home.navTestimonials'), href: '#testimonials' },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-xl ring-1 ring-black/5 shadow-[0_1px_12px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 lg:px-8">
        <PlumbCoreLogo size="sm" showText={true} />

        <nav className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher locale={locale} onLocaleChange={onLocaleChange} />
          <a href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">{t('home.navSignIn')}</a>
          <a
            href="/signup"
            className="h-10 px-5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center"
          >
            {t('home.startFreeTrial')}
          </a>
        </div>

        {/* Mobile menu button */}
      <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-slate-600" aria-label={t('home.navMenu')}>
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
      </div>

      {/* Mobile simple dropdown — NO z-index, NO overlay, just pushes content down */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-1">
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors text-center"
            >
              {l.label}
            </a>
          ))}
          <hr className="my-2 border-slate-100" />
          <div className="flex flex-col items-center gap-2 pt-1">
            <LanguageSwitcher locale={locale} onLocaleChange={(l) => { onLocaleChange(l); setOpen(false); }} />
            <a href="/login" onClick={() => setOpen(false)} className="block w-full text-center px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
              {t('home.navSignIn')}
            </a>
            <a
              href="/signup"
              onClick={() => setOpen(false)}
              className="block w-full text-center h-10 leading-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/25"
            >
              {t('home.startFreeTrial')}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HERO — "The Plumbing OS That Early Adopters Already Trust"
   ═══════════════════════════════════════════════════════════════ */
function Hero({ t }: { t: (key: string) => string }) {
  return (
    <section className="pt-28 pb-20 bg-white overflow-hidden relative">
      {/* Subtle gradient background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.08),transparent)] pointer-events-none" />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ─── Left column: text content ─── */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-700 mb-6 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              {t('home.heroTrustedBadge')}
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05] mb-5 text-slate-900">
              {t('home.heroHeadline1')}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">{t('home.heroHeadlineHighlight')}</span>{t('home.heroHeadline2')}
            </h1>

            <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mb-6 leading-relaxed">
              {t('home.heroSubheadline')}
            </p>

            {/* Proof bar */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 mb-8">
              <HTMLText html={t('home.heroJoinPlumbers')} className="text-sm text-slate-500" />
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <HTMLText html={t('home.heroJobsCompleted')} className="text-sm text-slate-500" />
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <HTMLText html={t('home.heroAvgRating')} className="text-sm text-slate-500" />
            </div>

            {/* Customer CTA — Get online quote */}
            <div className="flex flex-col sm:flex-row gap-3 items-center lg:justify-start mb-8 pb-8 border-b border-slate-100">
              <a
                href="/quote/plumbcore"
                className="h-14 px-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-base shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2"
              >
                <Camera className="w-4 h-4" /> {t('home.heroGetEstimate')} <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#how-it-works"
                className="h-14 px-8 rounded-full bg-white ring-1 ring-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-base transition-all active:scale-[0.98] inline-flex items-center gap-2"
              >
                {t('home.heroSeeHow')} <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            {/* Plumber CTAs */}
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 text-center lg:text-left">{t('home.heroForBusinesses')}</p>
            <div className="flex flex-col sm:flex-row gap-3 items-center lg:justify-start">
              <a
                href="/signup"
                className="h-12 sm:h-14 px-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2 text-sm sm:text-base"
              >
                {t('home.heroGetLead')} <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#how-it-works"
                className="h-12 sm:h-14 px-8 rounded-full bg-white ring-1 ring-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all active:scale-[0.98] inline-flex items-center gap-2 text-sm sm:text-base"
              >
                {t('home.heroSeeHow')} <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* ─── Right column: hero image ─── */}
          <div className="relative">
            {/* Main hero image */}
            <div className="relative">
              <img
                src="/images/hero-plumber.jpg"
                alt={t('home.heroImgAlt')}
                className="w-full h-auto rounded-2xl ring-1 ring-black/5 shadow-lg object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              {/* Floating "AI Analyzing..." badge */}
              <div className="absolute -top-3 -right-3 sm:top-4 sm:right-4 bg-white/95 backdrop-blur-sm rounded-full px-3.5 py-2 shadow-lg ring-1 ring-black/5 flex items-center gap-2 animate-[fadeIn_0.6s_ease-out]">
                <Camera className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                  {t('home.heroAIAnalyzing')}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              </div>
            </div>

            {/* "How It Works" device frame mockup */}
            <div className="mt-6 sm:mt-8 relative">
              <div className="relative mx-auto max-w-xs rounded-[2rem] ring-2 ring-black/10 shadow-2xl bg-gradient-to-b from-blue-600/10 to-cyan-500/10 p-2">
                <div className="rounded-[1.75rem] overflow-hidden ring-1 ring-black/5 bg-white">
                  <img
                    src="/images/hero-plumber.jpg"
                    alt={t('home.heroAppImgAlt')}
                    className="w-full h-auto object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                {/* Phone notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-black/10 rounded-full" />
              </div>
              <p className="text-center text-xs text-slate-400 mt-3 font-medium">
                {t('home.heroHowItWorksCaption')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HOW PLUMBCORE MAKES YOU MONEY — 3-step + cost comparison
   ═══════════════════════════════════════════════════════════════ */
function HowPlumbCoreMakesYouMoney({ t }: { t: (key: string) => string }) {
  const steps = [
    {
      num: '1',
      title: t('home.howStep1Title'),
      desc: t('home.howStep1Desc'),
      img: '/images/hero-work.jpg',
      icon: '📸',
    },
    {
      num: '2',
      title: t('home.howStep2Title'),
      desc: t('home.howStep2Desc'),
      img: '/images/feature-estimate.jpg',
      icon: '💵',
    },
    {
      num: '3',
      title: t('home.howStep3Title'),
      desc: t('home.howStep3Desc'),
      img: '/images/feature-route.jpg',
      icon: '✅',
    },
  ];

  const comparisonRows = [
    { feature: t('home.compMonthlyCost'), plumbcore: t('home.compPlumbcore349'), homeadvisor: t('home.compHomeadvisor75'), servicetitan: t('home.compServicetitan398') },
    { feature: t('home.compLeadsIncluded'), plumbcore: t('home.compUnlimited'), homeadvisor: t('home.compPayPerLead'), servicetitan: t('home.compNone') },
    { feature: t('home.compCustomerPrePays'), plumbcore: t('home.compYes'), homeadvisor: t('home.compNo'), servicetitan: t('home.compNo') },
    { feature: t('home.compDepositIsYours'), plumbcore: t('home.compCredited'), homeadvisor: t('home.compKeptByThem'), servicetitan: t('home.compNo') },
    { feature: t('home.compAIEstimates'), plumbcore: t('home.compIncluded'), homeadvisor: t('home.compNo'), servicetitan: t('home.comp200Addon') },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <span className="text-xs font-bold tracking-[0.2em] text-blue-500 uppercase">{t('home.howBadge')}</span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mt-3 mb-3">
            {t('home.howTitle')}
          </h2>
          <HTMLText html={t('home.howSubtitle')} className="text-base text-slate-500 max-w-2xl mx-auto" />
        </div>

        {/* 3-step visual */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          {steps.map((s, i) => (
            <div key={i} className="relative text-center">
              <div className="w-20 h-20 rounded-2xl bg-white ring-1 ring-black/5 shadow-sm flex items-center justify-center mx-auto mb-5 overflow-hidden">
                <img
                  src={s.img}
                  alt={s.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              {/* Connector line (desktop only) */}
              {i < 2 && (
                <div className="absolute top-10 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] border-t border-dashed border-blue-200 hidden md:block" />
              )}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white font-semibold text-sm flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/25 -mt-14 relative z-10">
                {s.num}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{s.title}</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* ROI callout */}
        <div className="max-w-3xl mx-auto mb-14 bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-6 sm:p-8 text-center">
          <HTMLText html={t('home.roiText')} className="text-base sm:text-lg text-slate-700 leading-relaxed" />
          <div className="mt-4 inline-flex items-center gap-3 bg-emerald-50 rounded-full px-5 py-2 ring-1 ring-emerald-200">
            <span className="text-2xl font-bold text-emerald-600">9:1</span>
            <span className="text-sm font-semibold text-emerald-700">{t('home.roiLabel')}</span>
          </div>
        </div>

        {/* Comparison table */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-xl font-semibold text-slate-900 text-center mb-6">
            {t('home.comparisonVS')}
          </h3>
          <div className="overflow-hidden rounded-2xl ring-1 ring-black/5 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-5 py-3.5 font-semibold text-slate-700">{t('home.compFeatureHeader')}</th>
                  <th className="text-center px-4 py-3.5 font-bold text-blue-600">{t('home.compPlumbcoreHeader')}</th>
                  <th className="text-center px-4 py-3.5 font-semibold text-slate-600">{t('home.compHomeadvisorHeader')}</th>
                  <th className="text-center px-4 py-3.5 font-semibold text-slate-600">{t('home.compServicetitanHeader')}</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-5 py-3.5 font-medium text-slate-700">{row.feature}</td>
                    <td className="px-4 py-3.5 text-center text-emerald-600 font-semibold">{row.plumbcore}</td>
                    <td className="px-4 py-3.5 text-center text-slate-500">{row.homeadvisor}</td>
                    <td className="px-4 py-3.5 text-center text-slate-500">{row.servicetitan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FEATURES — 6 features with revenue outcome headlines
   ═══════════════════════════════════════════════════════════════ */
function FeaturesSection({ t }: { t: (key: string) => string }) {
  const features = [
    {
      icon: Camera,
      title: t('home.featureCloseRateTitle'),
      desc: t('home.featureCloseRateDesc'),
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: MessageCircle,
      title: t('home.featureNeverMissTitle'),
      desc: t('home.featureNeverMissDesc'),
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: MapPin,
      title: t('home.featureFitExtraTitle'),
      desc: t('home.featureFitExtraDesc'),
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      icon: Mic,
      title: t('home.featureSaveHoursTitle'),
      desc: t('home.featureSaveHoursDesc'),
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      icon: Package,
      title: t('home.featureZeroPartsTitle'),
      desc: t('home.featureZeroPartsDesc'),
      gradient: 'from-purple-500 to-violet-500',
    },
    {
      icon: Calendar,
      title: t('home.featureStopOverbookTitle'),
      desc: t('home.featureStopOverbookDesc'),
      gradient: 'from-cyan-500 to-blue-500',
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-[0.2em] text-blue-500 uppercase">{t('home.featuresBadge')}</span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mt-3 mb-3">
            {t('home.featuresTitle')}
          </h2>
          <p className="text-base text-slate-500 max-w-xl mx-auto">
            {t('home.featuresSubtitle')}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-6 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 ease-out group text-center sm:text-left relative overflow-hidden"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 shadow-lg shadow-black/10 mx-auto sm:mx-0 transition-transform duration-300 group-hover:scale-110`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              {/* Image thumbnail for featured cards */}
              {i === 0 && (
                <div className="mb-4 rounded-xl overflow-hidden ring-1 ring-black/5 shadow-sm">
                  <img
                    src="/images/feature-estimate.jpg"
                    alt={t('home.featureImgEstimateAlt')}
                    className="w-full h-24 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
              {i === 2 && (
                <div className="mb-4 rounded-xl overflow-hidden ring-1 ring-black/5 shadow-sm">
                  <img
                    src="/images/feature-route.jpg"
                    alt={t('home.featureImgRouteAlt')}
                    className="w-full h-24 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
              <h3 className="text-lg font-semibold text-slate-900 mb-2 transition-colors duration-300 group-hover:text-blue-600">
                {f.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRICING — 4 plans with deposit mention and risk reversal
   ═══════════════════════════════════════════════════════════════ */
function PricingSection({ t }: { t: (key: string) => string }) {
  const r = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      id: 'solo',
      name: t('home.planSolo'),
      price: 349,
      priceId: 'price_1Tt6N8DynIU5fZLWmBY3zi05',
      techs: t('home.planSoloTechs'),
      popular: false,
      leads: t('home.planSoloLeads'),
      priority: 'Standard',
      aiHours: t('home.planSoloAI'),
      features: [
        t('home.planSoloFeature1'),
        t('home.planSoloFeature2'),
        t('home.planSoloFeature3'),
        t('home.planSoloFeature4'),
      ],
      cta: t('home.startFreeTrial'),
    },
    {
      id: 'pro',
      name: t('home.planPro'),
      price: 799,
      priceId: 'price_1Tt6N9DynIU5fZLWWYqfTfUc',
      techs: t('home.planProTechs'),
      popular: true,
      leads: t('home.planProLeads'),
      priority: 'High',
      aiHours: t('home.planProAI'),
      features: [
        t('home.planProFeature1'),
        t('home.planProFeature2'),
        t('home.planProFeature3'),
        t('home.planProFeature4'),
        t('home.planProFeature5'),
        t('home.planProFeature6'),
      ],
      cta: t('home.startFreeTrial'),
    },
    {
      id: 'business',
      name: t('home.planBusiness'),
      price: 1499,
      priceId: 'price_1Tt6NADynIU5fZLWRymLht9U',
      techs: t('home.planBusinessTechs'),
      popular: false,
      leads: t('home.planBusinessLeads'),
      priority: 'Highest',
      aiHours: t('home.planBusinessAI'),
      features: [
        t('home.planBusinessFeature1'),
        t('home.planBusinessFeature2'),
        t('home.planBusinessFeature3'),
        t('home.planBusinessFeature4'),
      ],
      cta: t('home.startFreeTrial'),
    },
    {
      id: 'enterprise',
      name: t('home.planEnterprise'),
      price: 0,
      priceId: null,
      techs: t('home.planEnterpriseTechs'),
      popular: false,
      leads: t('home.planEnterpriseLeads'),
      priority: 'Custom',
      aiHours: t('home.planEnterpriseAI'),
      features: [
        t('home.planEnterpriseFeature1'),
        t('home.planEnterpriseFeature2'),
        t('home.planEnterpriseFeature3'),
        t('home.planEnterpriseFeature4'),
        t('home.planEnterpriseFeature5'),
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
        body: JSON.stringify({ priceId: plan.priceId, planName: plan.name }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout error:', data.error);
        r.push('/signup');
      }
    } catch {
      r.push('/signup');
    } finally {
      setLoading(null);
    }
  };

  const disabled = loading !== null;

  return (
    <section id="pricing" className="py-16 sm:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-[0.2em] text-blue-500 uppercase">{t('home.pricingBadge')}</span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mt-3 mb-3">
            {t('home.pricingTitle')}
          </h2>
          <p className="text-base text-slate-500 max-w-2xl mx-auto">
            {t('home.pricingSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 max-w-7xl mx-auto">
          {plans.map((p, i) => (
            <div
              key={i}
              className={`relative rounded-2xl transition-all duration-300 ${
                p.popular
                  ? 'bg-white ring-2 ring-blue-500 shadow-[0_8px_32px_rgba(59,130,246,0.15)] lg:-translate-y-2 z-10'
                  : 'bg-white ring-1 ring-black/5 shadow-sm hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/25 z-20">
                  {t('home.pricingMostPopular')}
                </div>
              )}
              <div className="p-6 text-center flex flex-col h-full">
                <h3 className="text-lg font-semibold text-slate-900">{p.name}</h3>
                <p className="text-xs mt-1 text-slate-500">{p.techs}</p>
                <div className="flex items-baseline justify-center gap-1 mt-4 mb-2">
                  {p.price > 0 ? (
                    <>
                      <span className="text-3xl font-bold tracking-tight text-slate-900">${p.price}</span>
                      <span className="text-sm text-slate-400">{t('home.pricingPerMonth')}</span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold tracking-tight text-slate-900">{t('home.contactUs')}</span>
                  )}
                </div>

                {/* Quick specs */}
                <div className="flex justify-center gap-4 mb-4 text-xs text-slate-500">
                  <span><strong className="text-slate-700">{p.leads}</strong> {t('home.pricingLeadsLabel')}</span>
                  <span><strong className="text-slate-700">{p.aiHours}</strong> {t('home.pricingAILabel')}</span>
                </div>

                <ul className="space-y-2.5 text-left max-w-[200px] mx-auto min-h-[160px]">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm leading-relaxed">
                      <svg className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-slate-600">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Deposit mention */}
                <p className="text-[11px] text-slate-400 mt-3 leading-tight">
                  {t('home.depositNote')}
                </p>

                <div className="mt-auto pt-5">
                  {p.cta === t('home.contactUs') ? (
                    <button
                      onClick={() => window.location.href = 'mailto:sales@plumbcore.ai'}
                      className="w-full h-11 rounded-full bg-white ring-1 ring-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-all active:scale-[0.98]"
                    >
                      {loading === p.id ? t('home.redirecting') : p.cta}
                    </button>
                  ) : p.popular ? (
                    <button
                      onClick={() => handleCheckout(p)}
                      disabled={disabled}
                      className="w-full h-11 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm disabled:opacity-50"
                    >
                      {loading === p.id ? t('home.redirecting') : t('home.startFreeTrialArrow')}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCheckout(p)}
                      disabled={disabled}
                      className="w-full h-11 rounded-full bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {loading === p.id ? t('home.redirecting') : t('home.startFreeTrialArrow')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Risk reversal */}
        <div className="max-w-3xl mx-auto mt-10 bg-blue-50 rounded-2xl ring-1 ring-blue-200 p-5 sm:p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-slate-900">{t('home.guaranteeTitle')}</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {t('home.guaranteeText')}
          </p>
        </div>

        <div className="text-center mt-6">
          <a
            href="/signup"
            className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
          >
            {t('home.startFreeTrialNoCard')} <ArrowRight className="w-4 h-4" />
          </a>
          <p className="text-sm text-slate-400 mt-3">
            {t('home.freeTrialSub')}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   YOUR COMPETITION ALREADY HAS THIS — stats bar
   ═══════════════════════════════════════════════════════════════ */
function CompetitionSection({ t }: { t: (key: string) => string }) {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-3">
            {t('home.compHeadline')}
          </h2>
          <p className="text-base text-slate-500 max-w-2xl mx-auto">
            {t('home.compSubheadline')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-6 text-center hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200">
            <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">+340%</p>
            <p className="text-sm text-slate-500 mt-1">{t('home.compLeadVolume')}</p>
          </div>
          <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-6 text-center hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200">
            <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">18 Hrs</p>
            <p className="text-sm text-slate-500 mt-1">{t('home.compHoursSaved')}</p>
          </div>
          <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-6 text-center hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200">
            <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">43%</p>
            <p className="text-sm text-slate-500 mt-1">{t('home.compCloseRate')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TESTIMONIALS — Real Plumbers. Real Results.
   ═══════════════════════════════════════════════════════════════ */
function TestimonialsSection({ t }: { t: (key: string) => string }) {
  const testimonials = [
    {
      name: t('home.testimonial1Name'),
      role: t('home.testimonial1Company'),
      image: '/images/testimonial-1.jpg',
      avatar: 'MT',
      rating: 5,
      text: t('home.testimonial1Text'),
    },
    {
      name: t('home.testimonial2Name'),
      role: t('home.testimonial2Company'),
      image: '/images/testimonial-2.jpg',
      avatar: 'SC',
      rating: 5,
      text: t('home.testimonial2Text'),
    },
    {
      name: t('home.testimonial3Name'),
      role: t('home.testimonial3Company'),
      image: '/images/testimonial-3.jpg',
      avatar: 'RD',
      rating: 5,
      text: t('home.testimonial3Text'),
    },
  ];

  return (
    <section id="testimonials" className="py-16 sm:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-xs font-bold tracking-[0.2em] text-blue-500 uppercase">{t('home.testimonialsBadge')}</span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mt-3 mb-3">
            {t('home.testimonialTitle')}
          </h2>
        </div>

        {/* Aggregate stats */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mb-10 text-sm text-slate-500">
          <HTMLText html={t('home.testimonialAggregate1')} className="text-sm text-slate-500" />
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <HTMLText html={t('home.testimonialAggregate2')} className="text-sm text-slate-500" />
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <HTMLText html={t('home.testimonialAggregate3')} className="text-sm text-slate-500" />
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {testimonials.map((tItem, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-6 text-center md:text-left hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden"
            >
              {/* Video play button overlay */}
              <div className="w-12 h-12 rounded-full bg-white/90 shadow-lg ring-1 ring-black/5 flex items-center justify-center mx-auto md:mx-0 mb-4 cursor-pointer hover:bg-white transition-colors group/play">
                <Play className="w-5 h-5 text-blue-600 fill-blue-600 ml-0.5 group-hover/play:scale-110 transition-transform" />
              </div>

              <div className="flex gap-1 mb-3 justify-center md:justify-start">
                {Array.from({ length: tItem.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                &ldquo;{tItem.text}&rdquo;
              </p>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white shadow-md shrink-0">
                  <img
                    src={tItem.image}
                    alt={tItem.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      (target.parentElement as HTMLElement).classList.add('bg-gradient-to-br', 'from-blue-500', 'to-cyan-500');
                    }}
                  />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-sm font-semibold text-slate-900">{tItem.name}</p>
                  <p className="text-xs text-slate-400">{tItem.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FAQ — Accordion with comprehensive answers
   ═══════════════════════════════════════════════════════════════ */
function FaqSection({ t }: { t: (key: string) => string }) {
  const faqs = [
    {
      q: t('home.faqDepositQ'),
      a: t('home.faqDepositA'),
    },
    {
      q: t('home.faqLeadCostQ'),
      a: t('home.faqLeadCostA'),
    },
    {
      q: t('home.faqProPriorityQ'),
      a: t('home.faqProPriorityA'),
    },
    {
      q: t('home.faqNoLeadsQ'),
      a: t('home.faqNoLeadsA'),
    },
    {
      q: t('home.faqUpgradeQ'),
      a: t('home.faqUpgradeA'),
    },
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="py-16 sm:py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-bold tracking-[0.2em] text-blue-500 uppercase">{t('home.faqBadge')}</span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mt-3 mb-3">
            {t('home.faqTitle')}
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="ring-1 ring-black/5 rounded-2xl overflow-hidden transition-all duration-200 bg-white shadow-sm">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <span>{f.q}</span>
                <span className={`shrink-0 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center transition-all duration-200 ${openIdx === i ? 'rotate-45 bg-blue-100' : ''}`}>
                  <span className={`text-sm font-bold ${openIdx === i ? 'text-blue-600' : 'text-slate-400'}`}>+</span>
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIdx === i ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-5 pb-4 text-sm text-slate-500 leading-relaxed">{f.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CTA SECTION — Scarcity + final push
   ═══════════════════════════════════════════════════════════════ */
function CtaSection({ t }: { t: (key: string) => string }) {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(255,255,255,0.3),transparent)]" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
          {t('home.ctaTitle')}
        </h2>

        {/* Scarcity badge */}
        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 mb-7 ring-1 ring-white/20">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <HTMLText html={t('home.ctaScarcity')} className="text-sm font-semibold text-white" />
        </div>

        <a
          href="/signup"
          className="inline-flex items-center gap-2 h-14 px-10 rounded-full bg-white hover:bg-blue-50 text-blue-600 text-base font-semibold shadow-lg shadow-blue-900/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          {t('home.ctaButton')} <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
        <p className="text-sm text-blue-200 mt-4">
          {t('home.ctaSubtext')}
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════ */
function Footer({ t }: { t: (key: string) => string }) {
  return (
    <footer className="bg-slate-50 text-slate-500 py-10 sm:py-14 ring-1 ring-inset ring-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left">
          {/* Brand */}
          <div>
            <PlumbCoreLogo size="md" showText={true} />
            <p className="text-sm text-slate-500 leading-relaxed mt-4">
              {t('home.footerTagline')}
            </p>
            <div className="flex gap-3 mt-6 justify-center sm:justify-start">
              <a href="https://x.com/plumbcoreai" target="_blank" rel="noopener noreferrer"
                 className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center hover:bg-slate-300 transition-colors text-slate-500 hover:text-slate-700 text-sm font-bold">
                X
              </a>
              <a href="https://linkedin.com/company/plumbcoreai" target="_blank" rel="noopener noreferrer"
                 className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center hover:bg-slate-300 transition-colors text-slate-500 hover:text-slate-700 text-sm font-bold">
                in
              </a>
              <a href="https://facebook.com/plumbcoreai" target="_blank" rel="noopener noreferrer"
                 className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center hover:bg-slate-300 transition-colors text-slate-500 hover:text-slate-700 text-sm font-bold">
                f
              </a>
              <a href="https://instagram.com/plumbcoreai" target="_blank" rel="noopener noreferrer"
                 className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center hover:bg-slate-300 transition-colors text-slate-500 hover:text-slate-700 text-sm font-bold">
                ig
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">{t('home.footerQuickLinks')}</h4>
            <div className="space-y-2.5 text-sm">
              <a href="#features" className="block hover:text-slate-700 transition-colors">{t('home.navFeatures')}</a>
              <a href="#pricing" className="block hover:text-slate-700 transition-colors">{t('home.navPricing')}</a>
              <a href="#compare" className="block hover:text-slate-700 transition-colors">{t('home.navCompare')}</a>
              <a href="#testimonials" className="block hover:text-slate-700 transition-colors">{t('home.navTestimonials')}</a>
              <a href="/signup" className="block hover:text-slate-700 transition-colors">{t('home.footerGetStarted')}</a>
            </div>
          </div>

          {/* Plans */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">{t('home.footerPlans')}</h4>
            <div className="space-y-2.5 text-sm">
              <span className="block">{t('home.footerPlanSolo')}</span>
              <span className="block">{t('home.footerPlanPro')}</span>
              <span className="block">{t('home.footerPlanBusiness')}</span>
              <span className="block">{t('home.footerPlanEnterprise')}</span>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">{t('home.footerContact')}</h4>
            <div className="space-y-2.5 text-sm">
              <span className="flex items-center gap-2 justify-center sm:justify-start">
                <Phone className="w-4 h-4 text-blue-500" /> (555) 123-4567
              </span>
              <span className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-blue-500 text-base">✉</span> hello@plumbcore.ai
              </span>
              <span className="flex items-start gap-2 justify-center sm:justify-start">
                <MapPin className="w-4 h-4 text-blue-500 mt-0.5" /> {t('home.footerAddress')}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 ring-1 ring-inset ring-slate-200 text-center text-xs text-slate-400">
          <p>{t('home.footerRights')}</p>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FLOATING CTA — fixed bottom mobile CTA
   ═══════════════════════════════════════════════════════════════ */
function FloatingCta({ t, hidden }: { t: (key: string) => string; hidden?: boolean }) {
  if (hidden) return null;
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-lg ring-1 ring-black/5 px-4 py-3">
      <a
        href="/signup"
        className="w-full h-11 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 text-sm"
      >
        {t('home.startFreeTrial')} <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const { locale, changeLocale, t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <main className={`min-h-screen bg-white ${menuOpen ? 'overflow-hidden' : ''} pb-16 md:pb-0`}>
      <Navbar locale={locale} onLocaleChange={(l) => changeLocale(l as 'en' | 'fr' | 'es' | 'de')} t={t} menuOpen={menuOpen} onMenuToggle={setMenuOpen} />
      <Hero t={t} />
      <HowPlumbCoreMakesYouMoney t={t} />
      <FeaturesSection t={t} />
      <PricingSection t={t} />
      <CompetitionSection t={t} />
      <TestimonialsSection t={t} />
      <FaqSection t={t} />
      <CtaSection t={t} />
      <Footer t={t} />
      <FloatingCta t={t} hidden={menuOpen} />
    </main>
  );
}
