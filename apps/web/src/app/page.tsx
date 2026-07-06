'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/components/i18n-provider';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Camera, Mic, MapPin, Package, Calendar, MessageCircle, ChevronRight, Menu, Star, Check, ArrowRight, Phone, Clock, Shield, Wrench, X, Minus } from 'lucide-react';

/* ═══ NAVBAR ═══ */
function Navbar({ locale, onLocaleChange }: { locale: string; onLocaleChange: (l: string) => void }) {
  const r = useRouter();
  const [open, setOpen] = useState(false);
  const links = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Compare', href: '#compare' },
    { label: 'Billing', href: '/billing' },
    { label: 'Testimonials', href: '#testimonials' },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-bold">P</span>
          </div>
          <span className="font-bold text-base text-slate-900 tracking-tight">PlumbCore <span className="text-blue-500">AI</span></span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {links.map(l => <a key={l.href} href={l.href} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">{l.label}</a>)}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher locale={locale} onLocaleChange={onLocaleChange} />
          <a href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Sign in</a>
          <a href="/signup" className="h-10 px-5 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold shadow-sm transition-all active:scale-[0.97] inline-flex items-center">
            Request Demo
          </a>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-slate-600" aria-label="Menu">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-1">
          {links.map(l => <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors text-center">{l.label}</a>)}
          <hr className="my-3 border-slate-100" />
          <LanguageSwitcher locale={locale} onLocaleChange={(l) => { onLocaleChange(l); setOpen(false); }} />
          <a href="/login" onClick={() => setOpen(false)} className="block w-full text-center px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Sign in</a>
          <a href="/signup" onClick={() => setOpen(false)} className="block w-full mt-1 h-10 leading-10 rounded-xl bg-blue-500 text-white text-sm font-bold text-center">Get Started</a>
        </div>
      )}
    </header>
  );
}

/* ═══ HERO ═══ */
function Hero() {
  const r = useRouter();
  return (
    <section className="pt-20 sm:pt-28 pb-16 sm:pb-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-600 mb-3 sm:mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              AI-POWERED PLUMBING SOFTWARE
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.05] mb-3 sm:mb-4">
              The <span className="bg-gradient-to-r from-slate-900 to-cyan-500 bg-clip-text text-transparent">AI-Powered</span> <br />
              <span className="bg-gradient-to-r from-slate-900 to-cyan-500 bg-clip-text text-transparent">Plumber OS</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-500 max-w-xl mx-auto lg:mx-0 mb-6 sm:mb-8 leading-relaxed">
              Flat-rate pricing. No per-tech fees. No setup costs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center lg:justify-start w-full">
              <a href="/#pricing" className="h-12 w-full sm:w-auto px-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold shadow-md shadow-blue-500/25 transition-all active:scale-[0.97] flex items-center justify-center gap-2">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </a>
              <a href="/quote/plumbcore" className="h-12 w-full sm:w-auto px-8 rounded-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50 text-sm font-semibold transition-all active:scale-[0.97] flex items-center justify-center gap-2">
                Get a Free Estimate
              </a>
            </div>
            <div className="flex items-center gap-4 mt-6 sm:mt-8 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {['MT','SC','JW','AK'].map((init, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-sm">{init}</div>
                ))}
              </div>
              <p className="text-xs text-slate-400">Trusted by <span className="text-slate-900 font-semibold">500+</span> plumbing companies</p>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <picture>
                <source srcSet="/generated/hero-plumber.webp" type="image/webp" />
                <img src="/generated/hero-plumber.jpg" alt="PlumbCore AI Estimate Preview" loading="lazy" width="800" height="800" className="w-full rounded-2xl border-2 border-blue-200 shadow-lg" />
              </picture>
              <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-blue-500/10 rounded-full blur-xl" />
              <div className="absolute -top-3 -left-3 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══ STATS ═══ */
function StatsRow() {
  const stats = [
    { num: process.env.NEXT_PUBLIC_STAT_PROJECTS || '12,450+', label: 'Projects Done' },
    { num: process.env.NEXT_PUBLIC_STAT_CUSTOMERS || '500+', label: 'Happy Customers' },
    { num: 'Starting at', label: process.env.NEXT_PUBLIC_STAT_PRICE || '$149/mo', sub: true },
    { num: process.env.NEXT_PUBLIC_STAT_ESTIMATES || '50K+', label: 'AI Estimates' },
  ];
  return (
    <section className="py-12 bg-slate-50 border-y border-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s, i) => (
            <div key={i}>
              <p className={`${s.sub ? 'text-sm text-blue-500 font-semibold' : 'text-3xl sm:text-4xl font-extrabold text-slate-900'}`}>{s.num}</p>
              <p className="text-sm text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ ABOUT ═══ */
function AboutSection() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border-2 border-blue-200">
              <picture>
                <source srcSet="/generated/dashboard-screenshot.webp" type="image/webp" />
                <img src="/generated/dashboard-screenshot.jpg" alt="PlumbCore AI Dashboard" loading="lazy" width="800" height="600" className="w-full h-full object-cover" />
              </picture>
          </div>
          <div className="text-center lg:text-left">
            <span className="text-xs font-bold tracking-[0.2em] text-blue-500 uppercase">Trusted Plumbing Software</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 mb-4 leading-tight">Built by Plumbers, <br/>for Plumbers</h2>
            <p className="text-slate-500 leading-relaxed mb-6 text-center lg:text-left">
              PlumbCore AI was built by a team of master plumbers and software engineers who understand the daily challenges of running a plumbing business.
            </p>
            <ul className="space-y-3 mb-6 inline-block text-left">
              {[
                'AI photo estimates with 94%+ accuracy — convert leads in seconds',
                'Smart scheduling cuts drive time in half with route optimization',
                'Automated invoicing saves 10+ hours per week on admin'
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  {text}
                </li>
              ))}
            </ul>
            <div className="flex justify-center lg:justify-start">
              <a href="#features" className="h-11 px-6 rounded-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50 text-sm font-bold transition-all active:scale-[0.97] flex items-center gap-2 justify-center">
                Learn More <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══ FEATURES ═══ */
const features = [
  { icon: Camera, title: 'AI Photo Estimates', desc: 'Upload a photo. AI returns instant pricing in under 10 seconds.', gradient: 'from-blue-500 to-cyan-500', hover: 'shadow-blue-100' },
  { icon: Mic, title: 'Voice-to-Invoice', desc: 'Dictate notes on site. AI transcribes and generates an invoice instantly.', gradient: 'from-emerald-500 to-teal-500', hover: 'shadow-emerald-100' },
  { icon: MapPin, title: 'Route Optimization', desc: 'Auto-assign jobs to the nearest tech. Save fuel, time, and money.', gradient: 'from-amber-500 to-orange-500', hover: 'shadow-amber-100' },
  { icon: Package, title: 'Inventory Tracking', desc: 'Know what parts are on the truck. Never over-order or run out.', gradient: 'from-pink-500 to-rose-500', hover: 'shadow-pink-100' },
  { icon: Calendar, title: 'Smart Scheduling', desc: 'Drag-and-drop calendar with AI time estimates. Book in seconds.', gradient: 'from-purple-500 to-violet-500', hover: 'shadow-purple-100' },
  { icon: MessageCircle, title: 'AI Receptionist', desc: 'Never miss a call. AI books appointments and qualifies leads 24/7.', gradient: 'from-cyan-500 to-blue-500', hover: 'shadow-cyan-100' },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-16 sm:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-[0.2em] text-blue-500 uppercase">Powerful Features</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 mb-3">Everything You Need</h2>
          <p className="text-base text-slate-500 max-w-xl mx-auto">One platform. Zero headaches.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] group text-center sm:text-left">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 shadow-sm mx-auto sm:mx-0`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ HOW IT WORKS ═══ */
function HowItWorks() {
  const steps = [
    { num: '1', title: 'Snap a Photo', desc: 'Customer uploads a photo of the issue — leak, clog, crack. Takes 10 seconds.', illustration: '📸' },
    { num: '2', title: 'Get AI Estimate', desc: 'AI analyzes the photo, matches your pricebook, and returns a price with 94%+ confidence.', illustration: '🧠' },
    { num: '3', title: 'Book Instantly', desc: 'Customer pays a $49 deposit. You get a qualified, pre-paid lead ready for scheduling.', illustration: '📅' },
  ];
  return (
    <section id="how-it-works" className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-[0.2em] text-blue-500 uppercase">Simple Process</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 mb-3">How It Works</h2>
          <p className="text-base text-slate-500 max-w-xl mx-auto">From leak to paid — in three simple steps</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((s, i) => (
            <div key={i} className="relative text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 flex items-center justify-center mx-auto mb-5 text-3xl shadow-sm">
                {s.illustration}
              </div>
              <div className="absolute top-10 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] border-t-2 border-dashed border-blue-200 hidden md:block" />
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white font-bold text-sm flex items-center justify-center mx-auto mb-3 shadow-md -mt-14 relative z-10">{s.num}</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ PRICING ═══ */
const plans = [
  { id: 'solo', name: 'Solo', price: 149, priceId: 'price_1TqFwHD0AAcByeQ9qNUaikbx', techs: '1 technician', popular: false, features: ['AI photo estimates', 'Voice-to-invoice', 'Basic scheduling', 'Email support'], cta: 'Start Free Trial' },
  { id: 'team', name: 'Team', price: 249, priceId: 'price_1TqFwOD0AAcByeQ94DnPlHr1', techs: '2–5 technicians', popular: false, features: ['Everything in Solo', 'Route optimization', 'Inventory tracking', 'AI receptionist', 'Priority support'], cta: 'Start Free Trial' },
  { id: 'pro', name: 'Pro', price: 349, priceId: 'price_1TqFwPD0AAcByeQ9SjTdf8VF', techs: '6–12 technicians', popular: true, features: ['Everything in Team', 'Voice receptionist', 'Advanced analytics', 'Multi-location', 'Dedicated onboarding'], cta: 'Start Free Trial' },
  { id: 'business', name: 'Business', price: 499, priceId: 'price_1TqFwVD0AAcByeQ90c6KWdEJ', techs: '13–25 technicians', popular: false, features: ['Everything in Pro', 'API access', 'Custom integrations', 'Account manager', 'SLA guarantee'], cta: 'Start Free Trial' },
  { id: 'enterprise', name: 'Enterprise', price: 799, priceId: null, techs: 'Unlimited technicians', popular: false, features: ['Everything in Business', 'White-label', 'Custom AI training', 'Enterprise security', '24/7 phone support'], cta: 'Contact Sales' },
];

function PricingSection() {
  const r = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (plan: typeof plans[0]) => {
    if (plan.cta === 'Contact Sales') {
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
  return (
    <section id="pricing" className="py-16 sm:py-20" style={{ backgroundColor: '#0F172A' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-[0.2em] text-blue-400 uppercase">Pricing</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 mb-3">Simple, Flat-Rate Pricing</h2>
          <p className="text-base text-slate-400 max-w-2xl mx-auto">No per-tech fees. No hidden costs. Everything included.</p>
        </div>
        <div className="grid md:grid-cols-5 gap-4 max-w-7xl mx-auto items-start">
          {plans.map((p, i) => (
            <div key={i} className={`relative bg-white rounded-2xl shadow-sm transition-all duration-200 ${p.popular ? 'border-2 border-blue-500 shadow-xl md:-translate-y-4 z-10' : 'border border-slate-200 hover:border-slate-300'}`}>
              {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-sm z-20">Most Popular</div>}
              <div className="p-5 text-center">
                <h3 className="text-base font-bold text-slate-900">{p.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{p.techs}</p>
                <div className="flex items-baseline justify-center gap-1 mt-4 mb-4"><span className="text-3xl font-extrabold text-slate-900">${p.price}</span><span className="text-sm text-slate-400">/mo</span></div>
                <ul className="space-y-2.5 mb-5 text-left max-w-[200px] mx-auto">
                  {p.features.map((f, j) => <li key={j} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed"><Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${p.popular ? 'text-blue-500' : 'text-emerald-500'}`} />{f}</li>)}
                </ul>
              </div>
              <div className="px-5 pb-5">
                {p.name === 'Enterprise' ? (
                  <button onClick={() => window.location.href = 'mailto:sales@plumbcore.ai'} className="w-full h-10 rounded-xl border-2 border-blue-500 text-blue-600 hover:bg-blue-50 text-xs font-bold transition-all active:scale-[0.97]">{loading === p.id ? 'Redirecting...' : p.cta}</button>
                ) : p.popular ? (
                  <button onClick={() => handleCheckout(p)} disabled={loading !== null} className="w-full h-10 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold shadow-sm transition-all active:scale-[0.97]">{loading === p.id ? 'Redirecting...' : p.cta}</button>
                ) : (
                  <button onClick={() => handleCheckout(p)} disabled={loading !== null} className="w-full h-10 rounded-xl border-2 border-blue-500 text-blue-600 hover:bg-blue-50 text-xs font-bold transition-all active:scale-[0.97]">{loading === p.id ? 'Redirecting...' : p.cta}</button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <p className="text-sm text-slate-400">14-day free trial • No credit card • Cancel anytime</p>
        </div>
      </div>
    </section>
  );
}

/* ═══ COMPARE TABLE ═══ */
const planNames = ['Solo', 'Team', 'Pro', 'Business', 'Enterprise'];
const compareRows = [
  { feature: 'AI Photo Estimates', solo: true, team: true, pro: true, business: true, enterprise: true },
  { feature: 'Voice-to-Invoice', solo: true, team: true, pro: true, business: true, enterprise: true },
  { feature: 'Route Optimization', solo: false, team: true, pro: true, business: true, enterprise: true },
  { feature: 'AI Receptionist', solo: false, team: true, pro: true, business: true, enterprise: true },
  { feature: 'Voice Receptionist', solo: false, team: false, pro: true, business: true, enterprise: true },
  { feature: 'Inventory Tracking', solo: false, team: true, pro: true, business: true, enterprise: true },
  { feature: 'Advanced Analytics', solo: false, team: false, pro: true, business: true, enterprise: true },
  { feature: 'API Access', solo: false, team: false, pro: false, business: true, enterprise: true },
  { feature: 'White-Label', solo: false, team: false, pro: false, business: false, enterprise: true },
];

function CheckMark() { return <Check className="w-4 h-4 text-emerald-500 mx-auto" />; }
function DashMark() { return <Minus className="w-4 h-4 text-slate-300 mx-auto" />; }

function CompareSection() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <section id="compare" className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold tracking-[0.2em] text-blue-500 uppercase">Compare Plans</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 mb-3">Find the Right Plan</h2>
          <p className="text-base text-slate-500 max-w-xl mx-auto">Everything you need to grow your plumbing business</p>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-500 bg-slate-50 rounded-l-xl">Feature</th>
                {planNames.map((name, i) => (
                  <th key={i} className={`py-3 px-4 text-center text-sm font-bold ${i === 2 ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-700'}`}>
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compareRows.map((row, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-3.5 px-4 text-sm text-slate-700 font-medium">{row.feature}</td>
                  <td className={`py-3.5 px-4 text-center ${row.feature === 'API Access' || row.feature === 'White-Label' ? '' : ''}`}>{row.solo ? <CheckMark /> : <DashMark />}</td>
                  <td className={`py-3.5 px-4 text-center`}>{row.team ? <CheckMark /> : <DashMark />}</td>
                  <td className={`py-3.5 px-4 text-center ${i % 2 === 0 ? 'bg-blue-50/30' : 'bg-blue-50/10'}`}>{row.pro ? <CheckMark /> : <DashMark />}</td>
                  <td className={`py-3.5 px-4 text-center`}>{row.business ? <CheckMark /> : <DashMark />}</td>
                  <td className={`py-3.5 px-4 text-center`}>{row.enterprise ? <CheckMark /> : <DashMark />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile accordion */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 rounded-xl text-sm font-semibold text-blue-600"
          >
            Compare all plans
            <span className={`transition-transform ${mobileOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {mobileOpen && (
            <div className="mt-3 space-y-2">
              {compareRows.map((row, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl">
                  <span className="text-sm font-medium text-slate-700">{row.feature}</span>
                  <div className="flex gap-3">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 mb-0.5">Solo</p>
                      {row.solo ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Minus className="w-3.5 h-3.5 text-slate-300" />}
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 mb-0.5">Team</p>
                      {row.team ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Minus className="w-3.5 h-3.5 text-slate-300" />}
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 mb-0.5">Pro</p>
                      {row.pro ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Minus className="w-3.5 h-3.5 text-slate-300" />}
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 mb-0.5">Biz</p>
                      {row.business ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Minus className="w-3.5 h-3.5 text-slate-300" />}
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 mb-0.5">Ent</p>
                      {row.enterprise ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Minus className="w-3.5 h-3.5 text-slate-300" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ═══ TESTIMONIALS ═══ */
const testimonials = [
  { name: 'Mike Torres', role: 'Owner, Torres Plumbing', avatar: 'MT', rating: 5, text: 'PlumbCore AI cut our estimate time from 30 minutes to 10 seconds. Our close rate went up 40% in the first month.' },
  { name: 'Sarah Chen', role: 'Operations Manager, Fast Flow Inc.', avatar: 'SC', rating: 5, text: 'The voice-to-invoice feature alone saves my techs 2 hours a day. Best investment we\'ve made.' },
  { name: 'Robert Davis', role: 'CEO, Davis Plumbing Co.', avatar: 'RD', rating: 5, text: 'We doubled our service area with route optimization. AI scheduling is a game-changer for multi-tech shops.' },
];

function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-[0.2em] text-blue-500 uppercase">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 mb-3">Trusted by Plumbers</h2>
          <p className="text-base text-slate-500 max-w-xl mx-auto">Here&apos;s what our customers say</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] text-center md:text-left">
              <div className="flex gap-1 mb-3 justify-center md:justify-start">{Array.from({length:t.rating}).map((_,j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white">{t.avatar}</div>
                <div className="text-center md:text-left"><p className="text-sm font-semibold text-slate-900">{t.name}</p><p className="text-xs text-slate-400">{t.role}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ FAQ ═══ */
function FaqSection() {
  const faqs = [
    { q: 'Is there a free trial?', a: 'Yes! Every plan comes with a 14-day free trial. No credit card required.' },
    { q: 'What\'s included in each plan?', a: 'Our plans scale from solo operators to enterprise teams. Check the <a href="#compare" class="text-blue-500 underline">compare table</a> for a full feature breakdown across all five plans.' },
    { q: 'Can I change plans?', a: 'Yes, upgrade or downgrade anytime. Changes take effect immediately and we\'ll prorate your billing.' },
    { q: 'Is there a setup fee?', a: 'No. Start your 14-day free trial instantly. No credit card required. No hidden fees.' },
    { q: 'Can I import my existing clients?', a: 'Absolutely. We support CSV import and have direct integrations with major CRM platforms.' },
    { q: 'Do you offer phone support?', a: 'All plans include email and chat support. Team plans and above include priority phone support.' },
    { q: 'Is my data secure?', a: 'Yes. We use 256-bit encryption, SOC 2 compliant infrastructure, and daily automated backups.' },
  ];
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <section id="faq" className="py-16 sm:py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <span dangerouslySetInnerHTML={{ __html: f.q }} />
                <span className={`shrink-0 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center transition-transform duration-200 ${openIdx === i ? 'rotate-45 bg-blue-100' : ''}`}>
                  <span className={`text-sm font-bold ${openIdx === i ? 'text-blue-600' : 'text-slate-400'}`}>+</span>
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIdx === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-5 pb-4 text-sm text-slate-500 leading-relaxed" dangerouslySetInnerHTML={{ __html: f.a }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ CTA ═══ */
function CtaSection() {
  const r = useRouter();
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-600 to-cyan-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Ready to Transform Your Plumbing Business?</h2>
        <p className="text-base sm:text-lg text-blue-100 max-w-xl mx-auto mb-8">Join 500+ plumbing companies already using <strong>PlumbCore AI</strong></p>
        <a href="/signup" className="h-14 px-10 rounded-full bg-white hover:bg-blue-50 text-blue-600 text-base font-bold shadow-lg shadow-blue-900/25 transition-all active:scale-[0.97] flex items-center justify-center gap-2 mx-auto">
          Start Free Trial <ArrowRight className="w-5 h-5" />
        </a>
        <p className="text-sm text-blue-200 mt-4">14-day free trial • No credit card • Cancel anytime</p>
      </div>
    </section>
  );
}

/* ═══ FOOTER ═══ */
function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left">
          <div>
            <div className="flex items-center gap-2.5 mb-4 justify-center sm:justify-start">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"><span className="text-white text-sm font-bold">P</span></div>
              <span className="font-bold text-base text-white">PlumbCore <span className="text-blue-400">AI</span></span>
            </div>
            <p className="text-sm leading-relaxed">The AI-powered platform for modern plumbing businesses.</p>
            <div className="flex gap-3 mt-6 justify-center sm:justify-start">
              {[
                { label: '𝕏' },
                { label: 'in' },
                { label: 'f' },
                { label: '📘' },
              ].map((s,i) => <span key={i} className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-sm hover:bg-slate-700 cursor-pointer transition-colors font-bold text-white">{s.label}</span>)}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <div className="space-y-2.5 text-sm"><a href="#features" className="block hover:text-white transition-colors">Features</a><a href="#pricing" className="block hover:text-white transition-colors">Pricing</a><a href="#compare" className="block hover:text-white transition-colors">Compare Plans</a><a href="/signup" className="block hover:text-white transition-colors">Get Started</a></div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Plans</h4>
            <div className="space-y-2.5 text-sm"><span className="block">Solo — $149/mo</span><span className="block">Team — $249/mo</span><span className="block">Pro — $349/mo</span><span className="block">Business — $499/mo</span><span className="block">Enterprise — $799/mo</span></div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contact</h4>
            <div className="space-y-2.5 text-sm">
              <span className="flex items-center gap-2 justify-center sm:justify-start"><Phone className="w-4 h-4 text-blue-400" /> (555) 123-4567</span>
              <span className="flex items-center gap-2 justify-center sm:justify-start"><span className="text-blue-400">✉</span> hello@plumbcore.ai</span>
              <span className="flex items-start gap-2 justify-center sm:justify-start"><MapPin className="w-4 h-4 text-blue-400 mt-0.5" /> 123 Main St, Austin, TX</span>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>&copy; 2025 PlumbCore AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

/* ═══ MAIN PAGE ═══ */
export default function LandingPage() {
  const { locale, changeLocale } = useI18n();
  return (
    <main className="min-h-screen bg-white">
      <Navbar locale={locale} onLocaleChange={(l) => changeLocale(l as 'en' | 'fr' | 'es' | 'de')} />
      <Hero />
      <StatsRow />
      <AboutSection />
      <FeaturesSection />
      <HowItWorks />
      <PricingSection />
      <CompareSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
