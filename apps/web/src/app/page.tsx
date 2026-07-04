'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const r = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Sign In', href: '/login' },
    { label: 'Start Free Trial', href: '/signup', highlighted: true },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ═══ NAV ═══ */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">PlumbCore</span>
          </div>
          <nav className="hidden lg:flex items-center gap-8 text-[15px] text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
            <button onClick={() => r.push('/login')} className="hover:text-gray-900 transition-colors">Sign In</button>
            <button onClick={() => r.push('/signup')} className="bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Start Free Trial</button>
          </nav>
          <button className="lg:hidden p-2 -mr-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 px-4 py-4 space-y-2 bg-white">
            {nav.map((item, i) => (
              <button key={i} onClick={() => { setMenuOpen(false); if (item.href.startsWith('/')) r.push(item.href); else document.getElementById(item.href.slice(1))?.scrollIntoView({ behavior: 'smooth' }); }}
                className={`block w-full text-left py-3 px-4 rounded-lg text-sm ${item.highlighted ? 'bg-blue-600 text-white font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>{item.label}</button>
            ))}
          </div>
        )}
      </header>

      {/* ═══ HERO ═══ */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3.5 py-1.5 text-sm text-blue-200 mb-6">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> AI-Powered Plumbing Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight mb-4 sm:mb-5">
              Run Your Plumbing Business<br className="hidden sm:block" />
              <span className="text-blue-200"> On Autopilot</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-blue-200 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
              AI-powered estimates, smart scheduling, automated invoicing. PlumbCore handles the business, you fix the pipes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button onClick={() => r.push('/signup')} className="bg-white text-blue-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl active:scale-[0.97] text-[15px] sm:text-base">
                Start Free Trial
              </button>
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="border-2 border-white/25 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all active:scale-[0.97] text-[15px] sm:text-base">
                View Demo
              </button>
            </div>
            <p className="text-sm text-blue-300 mt-4">7-day free trial · No credit card required</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 mt-12 sm:mt-20 max-w-3xl mx-auto">
            {[
              { v: '500+', l: 'Companies' },
              { v: '50K+', l: 'Jobs Done' },
              { v: '99.9%', l: 'Uptime' },
              { v: '4.9★', l: 'Rating' },
            ].map((s, i) => (
              <div key={i} className="text-center py-2">
                <div className="text-2xl sm:text-3xl font-bold">{s.v}</div>
                <div className="text-sm text-blue-200">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block bg-blue-50 text-blue-600 text-sm font-medium px-3 py-1.5 rounded-full mb-4">Features</div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">Everything you need to grow</h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto">From the first customer call to the final invoice — we&apos;ve got you covered.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
          {[
            { icon: '🤖', title: 'AI Estimates', desc: 'Customers upload photos and get instant pricing. No more phone tag.' },
            { icon: '📅', title: 'Smart Scheduling', desc: 'Auto-assign jobs to the nearest tech with route optimization built in.' },
            { icon: '📄', title: 'Auto Invoicing', desc: 'Send invoices with Stripe payment links. Get paid 3x faster.' },
            { icon: '📊', title: 'Live Dashboard', desc: 'Cash flow, jobs, and team status at a glance from any device.' },
          ].map((f, i) => (
            <div key={i} className="group p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="text-3xl sm:text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ COMPARISON ═══ */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
            <div>
              <div className="inline-block bg-red-50 text-red-600 text-sm font-medium px-3 py-1.5 rounded-full mb-4">The Old Way</div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Still doing paperwork at 10pm?</h2>
              <div className="space-y-4">
                {[
                  'Hours creating quotes in Word documents',
                  'Chasing customers for payments',
                  'Coordinating crews manually',
                  'Missing calls and losing jobs',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3"><div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0"><svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></div><span className="text-gray-600">{item}</span></div>
                ))}
              </div>
            </div>
            <div>
              <div className="inline-block bg-green-50 text-green-600 text-sm font-medium px-3 py-1.5 rounded-full mb-4">The PlumbCore Way</div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">AI handles the business, you fix pipes</h2>
              <div className="space-y-4">
                {[
                  'AI photo estimates in 2 minutes',
                  'Auto invoicing with payment links',
                  'Smart dispatch to right technician',
                  '24/7 customer booking online',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3"><div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0"><svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div><span className="text-gray-600">{item}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BENEFITS ═══ */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {[
            { icon: '⏱️', title: 'Save 10+ Hours/Week', desc: 'Automate estimates, scheduling, and follow-ups', bg: 'bg-blue-50 border-blue-200' },
            { icon: '💰', title: 'Increase Revenue 25%', desc: 'AI pricing recommendations and automated upsells', bg: 'bg-green-50 border-green-200' },
            { icon: '📱', title: 'Mobile-First Team', desc: 'Dispatch, track, complete jobs on the go', bg: 'bg-purple-50 border-purple-200' },
          ].map((item, i) => (
            <div key={i} className={`p-6 sm:p-8 rounded-2xl border ${item.bg}`}>
              <div className="text-3xl sm:text-4xl mb-4">{item.icon}</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm sm:text-base text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block bg-blue-50 text-blue-600 text-sm font-medium px-3 py-1.5 rounded-full mb-4">How It Works</div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-12 sm:mb-16">Get started in 4 minutes</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
            {[
              { step: '1', icon: '📸', title: 'Sign Up', desc: 'Create your account' },
              { step: '2', icon: '⚙️', title: 'Configure', desc: 'Pricing, hours, team' },
              { step: '3', icon: '🚀', title: 'Get Leads', desc: 'Customers book 24/7' },
              { step: '4', icon: '💰', title: 'Get Paid', desc: 'Auto invoicing & reminders' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-50 text-3xl mb-4">
                  {item.icon}
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">{item.step}</div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block bg-blue-50 text-blue-600 text-sm font-medium px-3 py-1.5 rounded-full mb-4">Pricing</div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">Simple, transparent pricing</h2>
          <p className="text-base sm:text-lg text-gray-500">No hidden fees. Cancel anytime. 7-day free trial.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
          {[
            { tier: 'Starter', price: 79, features: ['2 technicians', 'Basic scheduling', 'Estimates & invoicing', 'Email support'], popular: false },
            { tier: 'Pro', price: 129, features: ['10 technicians', 'Route optimization', 'AI photo estimates', 'SMS notifications', 'Priority support'], popular: true },
            { tier: 'Unlimited', price: 199, features: ['Unlimited technicians', 'Everything in Pro', 'API access', 'Dedicated manager', 'Custom integrations'], popular: false },
          ].map((plan, i) => (
            <div key={i} className={`relative rounded-2xl border p-6 sm:p-8 transition-all duration-300 hover:shadow-lg ${plan.popular ? 'border-blue-500 ring-2 ring-blue-500 shadow-xl scale-[1.02] lg:scale-105 bg-white' : 'border-gray-200 bg-white shadow-sm hover:-translate-y-1'}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">Most Popular</div>}
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{plan.tier}</h3>
              <div className="flex items-baseline gap-1 mb-6"><span className="text-4xl font-bold text-gray-900">${plan.price}</span><span className="text-sm text-gray-400">/month</span></div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5"><svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span className="text-sm text-gray-600">{f}</span></li>
                ))}
              </ul>
              <button onClick={() => r.push('/signup')} className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' : 'border-2 border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600'}`}>Start Free Trial</button>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-block bg-blue-50 text-blue-600 text-sm font-medium px-3 py-1.5 rounded-full mb-4">Testimonials</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">Trusted by 500+ plumbing companies</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {[
              { name: 'Mike Rodriguez', company: 'Rodriguez Plumbing TX', text: 'Saved 15 hours a week. The AI estimates are incredibly accurate — within 10% of actual costs every time.' },
              { name: 'Sarah Chen', company: 'Chen Family Services', text: 'Dispatching takes 30 seconds now. Best investment we\'ve made for our growing team.' },
              { name: 'James Wilson', company: 'Wilson Plumbing & Heating', text: 'Payment collection went from 45 days to 7 days. Cash flow has never been better.' },
            ].map((t, i) => (
              <div key={i} className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (<svg key={j} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>))}
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div><p className="font-semibold text-gray-900">{t.name}</p><p className="text-sm text-gray-400">{t.company}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Ready to automate?</h2>
          <p className="text-base sm:text-lg text-blue-200 mb-8 max-w-lg mx-auto">Join thousands of plumbers saving 10+ hours per week and increasing revenue by 25%.</p>
          <button onClick={() => r.push('/signup')} className="bg-white text-blue-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl active:scale-[0.97] text-[15px] sm:text-base">Start Your Free Trial</button>
          <p className="text-sm text-blue-300 mt-4">7-day free trial · No credit card · Cancel anytime</p>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-gray-900 text-gray-400 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center"><svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                <span className="text-white font-bold">PlumbCore</span>
              </div>
              <p className="text-sm leading-relaxed">AI-powered plumbing software for growing companies. Mobile-first, built for the trades.</p>
            </div>
            {[
              { title: 'Product', links: [{ label: 'Features', action: () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) }, { label: 'Pricing', action: () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }) }, { label: 'Get a Quote', action: () => r.push('/quote/plumbcore') }, { label: 'Sign In', action: () => r.push('/login') }] },
              { title: 'Resources', links: [{ label: 'Help Center' }, { label: 'API Docs' }, { label: 'Blog' }, { label: 'Case Studies' }] },
              { title: 'Contact', links: [{ label: 'support@plumbcore.ai' }, { label: '(555) 123-4567' }, { label: 'Austin, TX' }] },
            ].map((s, i) => (
              <div key={i}>
                <h4 className="text-white font-semibold text-sm mb-4">{s.title}</h4>
                <ul className="space-y-2.5 text-sm">
                  {s.links.map((l, j) => (
                    <li key={j}>{'action' in l ? <button onClick={(l as any).action} className="hover:text-white transition-colors">{l.label}</button> : <span className="cursor-default">{l.label}</span>}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 sm:mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <p>© 2026 PlumbCore. All rights reserved.</p>
            <div className="flex gap-6"><span className="cursor-default hover:text-white transition-colors">Privacy Policy</span><span className="cursor-default hover:text-white transition-colors">Terms of Service</span></div>
          </div>
        </div>
      </footer>
    </div>
  );
}