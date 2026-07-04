'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/* ─── Premium 2026 Design System ───
   Typography: Inter/Geist, strong hierarchy
   Colors: Slate/Blue-600 anchor, warm grays
   Spacing: 8px grid, generous whitespace
   Animations: Subtle, purposeful
   ───────────────────────────────── */

export default function LandingPage() {
  const r = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState('');

  const nav = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Sign In', href: '/login' },
    { label: 'Get Started', href: '/signup', primary: true },
  ];

  return (
    <div className="min-h-screen bg-white antialiased text-gray-900 selection:bg-blue-100">
      {/* ═══════ NAV ═══════ */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-base font-bold tracking-tight text-gray-900">PlumbCore</span>
          </div>
          <nav className="hidden lg:flex items-center gap-8 text-sm text-gray-500">
            <a href="#features" className="hover:text-gray-900 transition-colors relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px after:bg-gray-900 after:transition-all hover:after:w-full">Features</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px after:bg-gray-900 after:transition-all hover:after:w-full">Pricing</a>
            <button onClick={() => r.push('/login')} className="hover:text-gray-900 transition-colors">Sign In</button>
            <button onClick={() => r.push('/signup')} className="bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all active:scale-[0.97] shadow-sm">Get Started</button>
          </nav>
          <button className="lg:hidden p-2 -mr-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />}</svg>
          </button>
        </div>
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 px-4 py-5 space-y-2 bg-white">
            {nav.map((item, i) => (
              <button key={i} onClick={() => { setMenuOpen(false); if (item.href.startsWith('/')) r.push(item.href); else document.getElementById(item.href.slice(1))?.scrollIntoView({ behavior: 'smooth' }); }}
                className={`block w-full text-left py-3 px-4 rounded-lg text-sm ${item.primary ? 'bg-gray-900 text-white font-semibold' : 'text-gray-700 hover:bg-gray-50 rounded-lg'}`}>{item.label}</button>
            ))}
          </div>
        )}
      </header>

      {/* ═══════ HERO ═══════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-white to-white" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50/20 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 pt-20 sm:pt-28 pb-16 sm:pb-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 bg-blue-50/80 border border-blue-100 rounded-full px-3.5 py-1.5 text-xs sm:text-sm text-blue-700 font-medium mb-6">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              Trusted by 500+ plumbing companies
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05] mb-4 sm:mb-5 text-gray-900">
              Run Your Plumbing Business<br />
              <span className="text-blue-600">On Autopilot</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-500 max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed">
              AI-powered estimates, smart scheduling, automated invoicing. PlumbCore handles the business, you fix the pipes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button onClick={() => r.push('/signup')} className="bg-gray-900 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-[0.97] text-sm sm:text-base">
                Start Free Trial
              </button>
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white text-gray-700 font-semibold px-8 py-3.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all active:scale-[0.97] text-sm sm:text-base shadow-sm">
                See how it works →
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-4">7-day free trial · No credit card · Cancel anytime</p>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mt-14 sm:mt-20 max-w-2xl mx-auto">
            {[
              { v: '500+', l: 'Companies' },
              { v: '50K+', l: 'Jobs Done' },
              { v: '99.9%', l: 'Uptime' },
              { v: '4.9★', l: 'Rating' },
            ].map((s, i) => (
              <div key={i} className="text-center py-3"><div className="text-2xl sm:text-3xl font-bold text-gray-900">{s.v}</div><div className="text-sm text-gray-400">{s.l}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section id="features" className="py-16 sm:py-24 lg:py-28 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-block bg-gray-100 text-gray-700 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full mb-4 border border-gray-200">Everything you need</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-3">Run your business from one place</h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto">From the first customer call to the final invoice, PlumbCore has your back office covered.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: '🤖', title: 'AI Estimates', desc: 'Customers upload photos and get instant pricing. No more phone tag.' },
              { icon: '📅', title: 'Smart Scheduling', desc: 'Auto-assign jobs to the nearest tech with route optimization.' },
              { icon: '📄', title: 'Auto Invoicing', desc: 'Send invoices with Stripe links. Get paid 3x faster.' },
              { icon: '📊', title: 'Live Dashboard', desc: 'Cash flow, jobs, team status at a glance from any device.' },
            ].map((f, i) => (
              <div key={i} className="group p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="text-3xl sm:text-4xl mb-4">{f.icon}</div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ OLD vs NEW ═══════ */}
      <section className="py-16 sm:py-24 lg:py-28 px-4 sm:px-8 bg-gray-50/70">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-block bg-gray-100 text-gray-700 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full mb-4 border border-gray-200">Old vs New</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">Still doing paperwork at 10pm?</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-8 sm:gap-12 lg:gap-20">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-4"><svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">The Old Way</h3>
              <ul className="space-y-3">
                {['Hours creating quotes in Word', 'Chasing payments by phone', 'Coordinating crews manually', 'Missing calls and losing jobs'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3"><span className="text-sm text-gray-600">{item}</span></li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm sm:mt-8">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-4"><svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">The PlumbCore Way</h3>
              <ul className="space-y-3">
                {['AI photo estimates in 2 minutes', 'Auto invoicing with payment links', 'Smart dispatch to right tech', '24/7 online customer booking'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3"><span className="text-sm text-gray-600">{item}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ BENEFITS ═══════ */}
      <section className="py-16 sm:py-24 lg:py-28 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {[
            { icon: '⏱️', title: 'Save 10+ Hours/Week', desc: 'Automate estimates, scheduling, follow-ups', bg: 'bg-blue-50/50 border-blue-100' },
            { icon: '💰', title: 'Increase Revenue 25%', desc: 'AI pricing recommendations and upselling', bg: 'bg-green-50/50 border-green-100' },
            { icon: '📱', title: 'Mobile-First Team', desc: 'Dispatch, track, complete jobs on the go', bg: 'bg-purple-50/50 border-purple-100' },
          ].map((item, i) => (
            <div key={i} className={`p-6 sm:p-8 rounded-2xl border ${item.bg}`}>
              <div className="text-3xl sm:text-4xl mb-4">{item.icon}</div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="py-16 sm:py-24 lg:py-28 px-4 sm:px-8 bg-gray-50/70">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block bg-gray-100 text-gray-700 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full mb-4 border border-gray-200">How It Works</div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-12 sm:mb-16">Get started in 4 minutes</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
            {[
              { step: '1', icon: '📸', title: 'Sign Up', desc: 'Create your account in 2 minutes' },
              { step: '2', icon: '⚙️', title: 'Configure', desc: 'Set pricing, hours, and team' },
              { step: '3', icon: '🚀', title: 'Get Leads', desc: 'Customers book online 24/7' },
              { step: '4', icon: '💰', title: 'Get Paid', desc: 'Auto invoicing & reminders' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-gray-100 shadow-sm text-3xl mb-4">{item.icon}<div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center shadow-sm">{item.step}</div></div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PRICING ═══════ */}
      <section id="pricing" className="py-16 sm:py-24 lg:py-28 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block bg-gray-100 text-gray-700 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full mb-4 border border-gray-200">Pricing</div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-3">Simple, transparent pricing</h2>
          <p className="text-base sm:text-lg text-gray-500">No hidden fees. Cancel anytime. 7-day free trial.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
          {[
            { tier: 'Starter', price: 79, features: ['2 technicians', 'Basic scheduling', 'Estimates & invoicing', 'Email support'], popular: false },
            { tier: 'Pro', price: 129, features: ['10 technicians', 'Route optimization', 'AI photo estimates', 'SMS notifications', 'Priority support'], popular: true },
            { tier: 'Unlimited', price: 199, features: ['Unlimited techs', 'Everything in Pro', 'API access', 'Dedicated manager', 'Custom integrations'], popular: false },
          ].map((plan, i) => (
            <div key={i} className={`relative rounded-2xl border p-6 sm:p-8 transition-all duration-200 ${plan.popular ? 'border-gray-900 ring-2 ring-gray-900 shadow-xl bg-white' : 'border-gray-200 bg-white shadow-sm hover:border-gray-300'}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">Most Popular</div>}
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{plan.tier}</h3>
              <div className="flex items-baseline gap-1 mb-6"><span className="text-4xl font-bold text-gray-900">${plan.price}</span><span className="text-sm text-gray-400">/month</span></div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5"><svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span className="text-sm text-gray-600">{f}</span></li>
                ))}
              </ul>
              <button onClick={() => r.push('/signup')} className={`w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] ${plan.popular ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm' : 'border-2 border-gray-200 text-gray-700 hover:border-gray-400'}`}>Start Free Trial</button>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="py-16 sm:py-24 lg:py-28 px-4 sm:px-8 bg-gray-50/70">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-block bg-gray-100 text-gray-700 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full mb-4 border border-gray-200">Testimonials</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">Trusted by 500+ plumbing companies</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {[
              { name: 'Mike Rodriguez', company: 'Rodriguez Plumbing TX', text: 'Saved 15 hours a week. The AI estimates are incredibly accurate — within 10% of actual costs every time.' },
              { name: 'Sarah Chen', company: 'Chen Family Services', text: 'Dispatching takes 30 seconds now. Best investment we\'ve made for our growing team.' },
              { name: 'James Wilson', company: 'Wilson Plumbing & Heating', text: 'Payment collection went from 45 days to 7 days. Cash flow has never been better.' },
            ].map((t, i) => (
              <div key={i} className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="flex gap-0.5 mb-4">{[...Array(5)].map((_, j) => (<svg key={j} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>))}</div>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div><p className="font-semibold text-gray-900 text-sm">{t.name}</p><p className="text-xs text-gray-400">{t.company}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="py-16 sm:py-24 lg:py-28 px-4 sm:px-8 text-center bg-gray-900 text-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">Ready to automate?</h2>
          <p className="text-base sm:text-lg text-gray-400 mb-8 max-w-lg mx-auto">Join thousands of plumbers saving 10+ hours per week and increasing revenue by 25%.</p>
          <button onClick={() => r.push('/signup')} className="bg-white text-gray-900 font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-100 transition-all shadow-xl active:scale-[0.97] text-sm sm:text-base">Start Your Free Trial</button>
          <p className="text-sm text-gray-500 mt-4">7-day free trial · No credit card · Cancel anytime</p>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="bg-gray-50 text-gray-500 py-12 sm:py-16 px-4 sm:px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center"><svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                <span className="text-gray-900 font-bold">PlumbCore</span>
              </div>
              <p className="text-sm leading-relaxed">Modern plumbing software for growing companies. Mobile-first, built for the trades.</p>
            </div>
            {[
              { title: 'Product', links: [{ l: 'Features', a: () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) }, { l: 'Pricing', a: () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }) }, { l: 'Get a Quote', a: () => r.push('/quote/plumbcore') }, { l: 'Sign In', a: () => r.push('/login') }] },
              { title: 'Resources', links: [{ l: 'Help Center' }, { l: 'API Docs' }, { l: 'Blog' }, { l: 'Case Studies' }] },
              { title: 'Contact', links: [{ l: 'support@plumbcore.ai' }, { l: '(555) 123-4567' }, { l: 'Austin, TX' }] },
            ].map((s, i) => (
              <div key={i}><h4 className="text-gray-900 font-semibold text-sm mb-4">{s.title}</h4><ul className="space-y-2 text-sm">{[...s.links].map((l, j) => <li key={j}>{'a' in l ? <button onClick={(l as any).a} className="hover:text-gray-900 transition-colors">{l.l}</button> : <span className="cursor-default">{l.l}</span>}</li>)}</ul></div>
            ))}
          </div>
          <div className="mt-10 sm:mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <p>© 2026 PlumbCore. All rights reserved.</p>
            <div className="flex gap-6"><span className="cursor-default hover:text-gray-900 transition-colors">Privacy Policy</span><span className="cursor-default hover:text-gray-900 transition-colors">Terms of Service</span></div>
          </div>
        </div>
      </footer>
    </div>
  );
}