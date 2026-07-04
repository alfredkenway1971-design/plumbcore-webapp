'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const r = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-200">
      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-base font-bold tracking-tight">plumbcore</span>
          </div>
          <div className="hidden lg:flex items-center gap-10 text-[13px] uppercase tracking-widest text-gray-500 font-medium">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
            <button onClick={() => r.push('/login')} className="hover:text-gray-900 transition-colors">Sign in</button>
            <button onClick={() => r.push('/signup')} className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-[12px] uppercase tracking-widest hover:bg-gray-800 transition-all font-semibold">Get started</button>
          </div>
          <button className="lg:hidden p-2 -mr-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />}</svg>
          </button>
        </div>
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 px-6 py-6 space-y-3 bg-white/95 backdrop-blur-xl">
            {[
              { label: 'Features', action: () => { setMenuOpen(false); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); } },
              { label: 'Pricing', action: () => { setMenuOpen(false); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); } },
              { label: 'Sign in', action: () => { setMenuOpen(false); r.push('/login'); } },
              { label: 'Get started', action: () => { setMenuOpen(false); r.push('/signup'); }, primary: true },
            ].map((item, i) => (
              <button key={i} onClick={item.action} className={`block w-full text-left py-3.5 px-5 rounded-xl text-sm ${item.primary ? 'bg-gray-900 text-white font-semibold' : 'text-gray-700 hover:bg-gray-50 font-medium'}`}>{item.label}</button>
            ))}
          </div>
        )}
      </nav>

      {/* ═══════ HERO ═══════ */}
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-28 px-6 lg:px-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.06)_0%,transparent_60%)]" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-full px-4 py-2 text-xs text-gray-500 font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-900" />
            Now serving 500+ plumbing companies
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[0.95] mb-6">
            Run your business<br />
            <span className="text-blue-600 italic">on autopilot</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-500 max-w-lg mx-auto mb-10 leading-relaxed">
            AI estimates, smart scheduling, automated invoicing. PlumbCore handles the business — you fix the pipes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <button onClick={() => r.push('/signup')} className="bg-gray-900 text-white font-semibold px-10 py-4 rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-[0.97] text-sm w-full sm:w-auto">
              Start free trial →
            </button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-500 font-medium px-10 py-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-sm w-full sm:w-auto">
              Watch demo
            </button>
          </div>
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-lg mx-auto">
            {[['500+', 'Companies'], ['50K+', 'Jobs done'], ['99.9%', 'Uptime'], ['4.9★', 'Rating']].map(([v, l], i) => (
              <div key={i} className="text-center"><div className="text-2xl sm:text-3xl font-bold text-gray-900">{v}</div><div className="text-xs sm:text-sm text-gray-400 mt-1">{l}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section id="features" className="py-20 sm:py-28 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-block bg-gray-100 rounded-full px-4 py-1.5 text-xs text-gray-500 font-medium mb-5 border border-gray-200">Platform</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3">Everything in one place</h2>
            <p className="text-gray-500 max-w-lg mx-auto">From the first call to the final invoice — we&apos;ve got your back office.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[
              { i: '🤖', t: 'AI Estimates', d: 'Customers upload photos → instant pricing. No more back and forth.' },
              { i: '📅', t: 'Smart Scheduling', d: 'Auto-assign jobs to the nearest tech with route optimization.' },
              { i: '📄', t: 'Auto Invoicing', d: 'Send with Stripe links. Get paid in days, not weeks.' },
              { i: '📊', t: 'Live Dashboard', d: 'Revenue, jobs, and team status at a glance.' },
            ].map((f, i) => (
              <div key={i} className="p-7 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all duration-200">
                <div className="text-3xl mb-5">{f.i}</div>
                <h3 className="text-base font-semibold mb-2">{f.t}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ COMPARISON ═══════ */}
      <section className="py-20 sm:py-28 px-6 lg:px-10 bg-gray-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-block bg-gray-100 rounded-full px-4 py-1.5 text-xs text-gray-500 font-medium mb-5 border border-gray-200">Compare</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">Still doing paperwork at 10pm?</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-10">
            <div className="rounded-2xl border border-red-100 bg-white p-8 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-4"><svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></div>
              <h3 className="text-base font-semibold mb-4">The old way</h3>
              <ul className="space-y-3 text-sm text-gray-600">{['Hours creating quotes in Word', 'Chasing payments by phone', 'Coordinating crews manually', 'Missing calls and losing jobs'].map((t, i) => <li key={i} className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-red-200" />{t}</li>)}</ul>
            </div>
            <div className="rounded-2xl border border-green-100 bg-white p-8 shadow-sm sm:mt-8">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-4"><svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
              <h3 className="text-base font-semibold mb-4">PlumbCore way</h3>
              <ul className="space-y-3 text-sm text-gray-600">{['AI photo estimates in 2 min', 'Auto invoices with payment links', 'Smart dispatch to right tech', '24/7 online customer booking'].map((t, i) => <li key={i} className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-green-200" />{t}</li>)}</ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ NUMBERS ═══════ */}
      <section className="py-20 sm:py-28 px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            { i: '⏱️', t: '10+ hours saved weekly', d: 'Automate estimates, scheduling, follow-ups', bg: 'bg-blue-50/40 border-blue-100' },
            { i: '💰', t: '25% more revenue', d: 'AI pricing recommendations and upselling', bg: 'bg-green-50/40 border-green-100' },
            { i: '📱', t: 'Mobile-first team', d: 'Dispatch, track, complete jobs on the go', bg: 'bg-purple-50/40 border-purple-100' },
          ].map((item, i) => (
            <div key={i} className={`p-8 rounded-2xl border ${item.bg}`}>
              <div className="text-3xl mb-4">{item.i}</div>
              <h3 className="text-base font-semibold mb-2">{item.t}</h3>
              <p className="text-sm text-gray-500">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ STEPS ═══════ */}
      <section className="py-20 sm:py-28 px-6 lg:px-10 bg-gray-50/50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block bg-gray-100 rounded-full px-4 py-1.5 text-xs text-gray-500 font-medium mb-5 border border-gray-200">Process</div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-14">4 minutes to start</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
            {[
              { s: '01', i: '📸', t: 'Sign up', d: 'Create your account' },
              { s: '02', i: '⚙️', t: 'Configure', d: 'Pricing, hours, team' },
              { s: '03', i: '🚀', t: 'Get leads', d: 'Customers book 24/7' },
              { s: '04', i: '💰', t: 'Get paid', d: 'Auto invoicing' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl mb-5">{step.i}</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{step.s}</div>
                <h3 className="font-semibold mb-1">{step.t}</h3>
                <p className="text-sm text-gray-500">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PRICING ═══════ */}
      <section id="pricing" className="py-20 sm:py-28 px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-block bg-gray-100 rounded-full px-4 py-1.5 text-xs text-gray-500 font-medium mb-5 border border-gray-200">Pricing</div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3">Simple pricing</h2>
          <p className="text-gray-500">7-day free trial. No credit card. Cancel anytime.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {[
            { t: 'Starter', p: 79, f: ['2 technicians', 'Basic scheduling', 'Estimates & invoicing', 'Email support'], pop: false },
            { t: 'Pro', p: 129, f: ['10 technicians', 'Route optimization', 'AI photo estimates', 'SMS notifications', 'Priority support'], pop: true },
            { t: 'Unlimited', p: 199, f: ['Unlimited techs', 'Everything in Pro', 'API access', 'Dedicated manager', 'Custom integrations'], pop: false },
          ].map((plan, i) => (
            <div key={i} className={`relative rounded-2xl border p-8 transition-all duration-200 ${plan.pop ? 'border-gray-900 ring-1 ring-gray-900 shadow-xl bg-white scale-[1.02] lg:scale-105' : 'border-gray-100 bg-white shadow-sm hover:border-gray-200'}`}>
              {plan.pop && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-semibold px-4 py-1.5 rounded-full">Popular</div>}
              <h3 className="text-base font-semibold mb-1">{plan.t}</h3>
              <div className="flex items-baseline gap-1 mb-6"><span className="text-4xl font-bold">${plan.p}</span><span className="text-sm text-gray-400">/mo</span></div>
              <ul className="space-y-3 mb-8">{plan.f.map((f, j) => <li key={j} className="flex items-start gap-3 text-sm text-gray-600"><svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>{f}</li>)}</ul>
              <button onClick={() => r.push('/signup')} className={`w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] ${plan.pop ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Start free trial</button>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="py-20 sm:py-28 px-6 lg:px-10 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-block bg-gray-100 rounded-full px-4 py-1.5 text-xs text-gray-500 font-medium mb-5 border border-gray-200">Trusted by plumbers</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">What they say</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { n: 'Mike R.', c: 'Rodriguez Plumbing TX', q: 'Saved 15 hours a week. AI estimates are within 10% of actual costs.' },
              { n: 'Sarah C.', c: 'Chen Family Services', q: 'Dispatching takes 30 seconds. Best investment for our team.' },
              { n: 'James W.', c: 'Wilson Plumbing', q: 'Payment collection went from 45 days to 7 days. Game changer.' },
            ].map((t, i) => (
              <div key={i} className="p-7 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="flex gap-1 mb-4">{[...Array(5)].map((_, j) => <svg key={j} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}</div>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">"{t.q}"</p>
                <div><p className="font-semibold text-sm">{t.n}</p><p className="text-xs text-gray-400">{t.c}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="py-20 sm:py-28 px-6 lg:px-10 text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">Ready to automate?</h2>
          <p className="text-gray-500 mb-8">Join 500+ plumbers saving 10+ hours weekly.</p>
          <button onClick={() => r.push('/signup')} className="bg-gray-900 text-white font-semibold px-10 py-4 rounded-xl hover:bg-gray-800 transition-all shadow-lg active:scale-[0.97] text-sm">Start free trial →</button>
          <p className="text-xs text-gray-400 mt-4">7-day free trial · No credit card</p>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="border-t border-gray-100 py-14 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                <span className="font-bold">plumbcore</span>
              </div>
              <p className="text-sm text-gray-400">Modern software for plumbing companies.</p>
            </div>
            {[
              { t: 'Product', l: [['Features', () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })], ['Pricing', () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })], ['Get a quote', () => r.push('/quote/plumbcore')], ['Sign in', () => r.push('/login')]] },
              { t: 'Resources', l: [['Help Center'], ['API Docs'], ['Blog'], ['Case Studies']] },
              { t: 'Contact', l: [['support@plumbcore.ai'], ['(555) 123-4567'], ['Austin, TX']] },
            ].map((s, i) => (
              <div key={i}><h4 className="text-sm font-semibold mb-4">{s.t}</h4><ul className="space-y-2 text-sm text-gray-500">{s.l.map((l: any, j: number) => <li key={j}>{l[1] ? <button onClick={l[1]} className="hover:text-gray-900 transition-colors">{l[0]}</button> : <span className="cursor-default">{l[0]}</span>}</li>)}</ul></div>
            ))}
          </div>
          <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <p>© 2026 PlumbCore. All rights reserved.</p>
            <div className="flex gap-6"><span className="cursor-default">Privacy</span><span className="cursor-default">Terms</span></div>
          </div>
        </div>
      </footer>
    </div>
  );
}