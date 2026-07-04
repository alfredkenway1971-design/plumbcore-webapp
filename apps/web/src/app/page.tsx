'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const r = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white antialiased text-gray-900">
      {/* ═══ NAV ═══ */}
      <header className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3 text-gray-900 font-bold">plumbcore</a>
          <nav className="hidden lg:flex items-center gap-8 text-sm text-gray-500">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
            <button onClick={() => r.push('/login')} className="hover:text-gray-900 transition-colors">Sign in</button>
            <button onClick={() => r.push('/signup')} className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-all">Get started</button>
          </nav>
          <button className="lg:hidden p-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />}</svg>
          </button>
        </div>
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 px-4 py-5 space-y-2 bg-white">
            {[{ l: 'Features', a: () => { setMenuOpen(false); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); } }, { l: 'Pricing', a: () => { setMenuOpen(false); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); } }, { l: 'Sign in', a: () => { setMenuOpen(false); r.push('/login'); } }, { l: 'Get started', a: () => { setMenuOpen(false); r.push('/signup'); }, p: true }].map((n, i) => <button key={i} onClick={n.a} className={`block w-full text-left py-3 px-4 rounded-xl text-sm ${n.p ? 'bg-gray-900 text-white font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>{n.l}</button>)}
          </div>
        )}
      </header>

      {/* ═══ HERO ═══ */}
      <section className="pt-28 pb-16 sm:pt-36 sm:pb-24 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-gray-100 rounded-full px-4 py-1.5 text-xs font-medium text-gray-600 mb-6">Trusted by 500+ plumbing companies</div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-4">
            Run your plumbing business<br /><span className="text-blue-600">on autopilot</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed">AI-powered estimates, smart scheduling, automated invoicing. PlumbCore handles the business — you fix the pipes.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => r.push('/signup')} className="bg-gray-900 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-800 transition-all shadow-lg active:scale-[0.97] text-sm sm:text-base">Start free trial</button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white text-gray-700 font-semibold px-8 py-3.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all active:scale-[0.97] text-sm sm:text-base shadow-sm">How it works</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-14 max-w-lg mx-auto">
            {[['500+', 'Companies'], ['50K+', 'Jobs done'], ['99.9%', 'Uptime'], ['4.9★', 'Rating']].map(([v, l], i) => <div key={i} className="text-center"><div className="text-2xl sm:text-3xl font-bold">{v}</div><div className="text-xs sm:text-sm text-gray-400 mt-0.5">{l}</div></div>)}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12"><div className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-600 mb-4">Features</div><h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-3">Everything in one place</h2><p className="text-gray-500 max-w-lg mx-auto">From the first call to the final invoice — your entire back office, automated.</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[{ i: '🤖', t: 'AI Estimates', d: 'Customers upload photos. AI returns instant pricing in under 10 seconds.' }, { i: '📅', t: 'Smart Scheduling', d: 'Auto-assign jobs to the nearest available technician with route optimization.' }, { i: '📄', t: 'Auto Invoicing', d: 'Send invoices with Stripe links. Get paid in days, not weeks.' }, { i: '📊', t: 'Live Dashboard', d: 'Revenue, jobs, and team status at a glance from any device.' }].map((f, i) => <div key={i} className="p-6 sm:p-7 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all"><div className="text-3xl mb-4">{f.i}</div><h3 className="text-base font-semibold mb-2">{f.t}</h3><p className="text-sm text-gray-500 leading-relaxed">{f.d}</p></div>)}
        </div>
      </section>

      {/* ═══ COMPARISON ═══ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12"><div className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-600 mb-4">Old vs New</div><h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Still doing paperwork at 10pm?</h2></div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-red-100 bg-white p-6 sm:p-8"><div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-4"><svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></div><h3 className="text-base font-semibold mb-4">The old way</h3><ul className="space-y-3 text-sm text-gray-600">{['Hours creating quotes in Word', 'Chasing payments by phone', 'Coordinating crews manually', 'Missing calls and losing jobs'].map((t, i) => <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-200" />{t}</li>)}</ul></div>
            <div className="rounded-2xl border border-green-100 bg-white p-6 sm:p-8 sm:mt-8"><div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-4"><svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div><h3 className="text-base font-semibold mb-4">The PlumbCore way</h3><ul className="space-y-3 text-sm text-gray-600">{['AI photo estimates in 2 min', 'Auto invoices with payment links', 'Smart dispatch to right tech', '24/7 online customer booking'].map((t, i) => <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-200" />{t}</li>)}</ul></div>
          </div>
        </div>
      </section>

      {/* ═══ BENEFITS ═══ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[{ i: '⏱️', t: 'Save 10+ hours weekly', d: 'Automate estimates, scheduling, and follow-ups', c: 'bg-blue-50/50 border-blue-100' }, { i: '💰', t: 'Increase revenue 25%', d: 'AI pricing recommendations and upselling', c: 'bg-green-50/50 border-green-100' }, { i: '📱', t: 'Mobile-first team', d: 'Dispatch, track, and complete jobs on the go', c: 'bg-purple-50/50 border-purple-100' }].map((o, i) => <div key={i} className={`p-6 sm:p-8 rounded-2xl border ${o.c}`}><div className="text-3xl mb-4">{o.i}</div><h3 className="text-base sm:text-lg font-semibold mb-2">{o.t}</h3><p className="text-sm text-gray-500">{o.d}</p></div>)}
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12"><div className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-600 mb-4">Pricing</div><h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-3">Simple, transparent pricing</h2><p className="text-gray-500">7-day free trial. No credit card. Cancel anytime.</p></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[{ t: 'Starter', p: 79, f: ['2 technicians', 'Basic scheduling', 'Estimates & invoicing', 'Email support'], pop: false }, { t: 'Pro', p: 129, f: ['10 technicians', 'Route optimization', 'AI photo estimates', 'SMS notifications', 'Priority support'], pop: true }, { t: 'Unlimited', p: 199, f: ['Unlimited techs', 'Everything in Pro', 'API access', 'Dedicated manager', 'Custom integrations'], pop: false }].map((p, i) => <div key={i} className={`relative rounded-2xl border p-6 sm:p-8 transition-all ${p.pop ? 'border-gray-900 ring-1 ring-gray-900 shadow-xl bg-white scale-[1.02] lg:scale-105' : 'border-gray-200 bg-white shadow-sm hover:border-gray-300'}`}>{p.pop && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-full">Most popular</div>}<h3 className="text-lg font-semibold mb-1">{p.t}</h3><div className="flex items-baseline gap-1 mb-6"><span className="text-4xl font-bold">${p.p}</span><span className="text-sm text-gray-400">/mo</span></div><ul className="space-y-3 mb-8">{p.f.map((f, j) => <li key={j} className="flex items-start gap-2.5 text-sm text-gray-600"><svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>{f}</li>)}</ul><button onClick={() => r.push('/signup')} className={`w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] ${p.pop ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Start free trial</button></div>)}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12"><div className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-600 mb-4">Testimonials</div><h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Trusted by plumbers</h2></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[{ n: 'Mike R.', c: 'Rodriguez Plumbing TX', q: 'Saved 15 hours a week. AI estimates are within 10% of actual costs.' }, { n: 'Sarah C.', c: 'Chen Family Services', q: 'Dispatching takes 30 seconds now. Best investment for our team.' }, { n: 'James W.', c: 'Wilson Plumbing', q: 'Payment collection went from 45 days to 7 days. Game changer.' }].map((t, i) => <div key={i} className="p-6 sm:p-7 rounded-2xl bg-white border border-gray-100 shadow-sm"><div className="flex gap-0.5 mb-4">{[...Array(5)].map((_, j) => <svg key={j} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}</div><p className="text-sm text-gray-600 mb-4 leading-relaxed">"{t.q}"</p><div><p className="font-semibold text-sm">{t.n}</p><p className="text-xs text-gray-400">{t.c}</p></div></div>)}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white text-center">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">Ready to automate?</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">Join 500+ plumbers saving 10+ hours weekly.</p>
        <button onClick={() => r.push('/signup')} className="bg-white text-gray-900 font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-100 transition-all shadow-lg active:scale-[0.97] text-sm sm:text-base">Start free trial</button>
        <p className="text-xs text-gray-500 mt-4">7-day trial · No credit card</p>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 sm:col-span-1"><a href="/" className="font-bold text-gray-900">plumbcore</a><p className="text-sm text-gray-400 mt-2">Modern software for plumbing companies.</p></div>
            {[[{ l: 'Features', a: () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) }, { l: 'Pricing', a: () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }) }, { l: 'Quote', a: () => r.push('/quote/plumbcore') }, { l: 'Sign in', a: () => r.push('/login') }], [{ l: 'Help' }, { l: 'API' }, { l: 'Blog' }, { l: 'Cases' }], [{ l: 'support@plumbcore.ai' }, { l: '(555) 123-4567' }, { l: 'Austin, TX' }]].map((s, i) => <div key={i}><h4 className="text-sm font-semibold text-gray-900 mb-4">{[ 'Product', 'Resources', 'Contact' ][i]}</h4><ul className="space-y-2 text-sm text-gray-500">{s.map((l: any, j: number) => <li key={j}>{l.a ? <button onClick={l.a} className="hover:text-gray-900 transition-colors">{l.l}</button> : <span className="cursor-default">{l.l}</span>}</li>)}</ul></div>)}
          </div>
          <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400"><p>© 2026 PlumbCore</p><div className="flex gap-6"><span>Privacy</span><span>Terms</span></div></div>
        </div>
      </footer>
    </div>
  );
}