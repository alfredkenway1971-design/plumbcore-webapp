'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const r = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Sign In', href: '/login' },
    { label: 'Start Free Trial', href: '/signup', primary: true },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ━━━━━━━━━━ NAVBAR ━━━━━━━━━━ */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="flex items-center justify-between max-w-7xl mx-auto px-4 h-14 sm:h-16">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-base sm:text-lg font-bold text-gray-900">PlumbCore</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            <button onClick={() => r.push('/login')} className="text-gray-600 hover:text-gray-900 transition-colors">Sign In</button>
            <button onClick={() => r.push('/signup')} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm">
              Start Free Trial
            </button>
          </div>
          <button className="md:hidden p-2 -mr-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 px-4 py-3 space-y-2 bg-white">
            {navLinks.map((link, i) => (
              <button
                key={i}
                onClick={() => { setMenuOpen(false); if (link.href.startsWith('/')) r.push(link.href); else document.getElementById(link.href.slice(1))?.scrollIntoView({ behavior: 'smooth' }); }}
                className={`block w-full text-left py-2.5 px-4 rounded-lg text-sm ${link.primary ? 'bg-blue-600 text-white font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* ━━━━━━━━━━ HERO ━━━━━━━━━━ */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-20 lg:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 text-xs sm:text-sm text-blue-200 mb-4 sm:mb-6">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              AI-Powered Plumbing Platform
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-3 sm:mb-4">
              Run Your Plumbing Business<br className="hidden sm:block" />
              <span className="text-blue-200"> On Autopilot</span>
            </h1>
            <p className="text-sm sm:text-lg text-blue-200 max-w-xl mx-auto mb-6 sm:mb-8 leading-relaxed">
              AI-powered estimates, smart scheduling, automated invoicing. PlumbCore handles the business, you fix the pipes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => r.push('/signup')} className="bg-white text-blue-700 font-semibold px-6 sm:px-8 py-3 rounded-xl hover:bg-blue-50 transition-all shadow-lg active:scale-[0.97] text-sm sm:text-base">
                Start Free Trial
              </button>
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="border-2 border-white/30 text-white font-semibold px-6 sm:px-8 py-3 rounded-xl hover:bg-white/10 transition-all active:scale-[0.97] text-sm sm:text-base">
                View Demo
              </button>
            </div>
            <p className="text-xs sm:text-sm text-blue-300 mt-3">7-day free trial · No credit card required</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mt-10 sm:mt-16 max-w-3xl mx-auto">
            {[
              { val: '500+', label: 'Plumbing Companies' },
              { val: '50K+', label: 'Jobs Completed' },
              { val: '99.9%', label: 'Uptime' },
              { val: '4.9★', label: 'Customer Rating' },
            ].map((s, i) => (
              <div key={i} className="text-center py-3 sm:py-0">
                <div className="text-xl sm:text-2xl font-bold">{s.val}</div>
                <div className="text-[11px] sm:text-sm text-blue-200 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━ FEATURES ━━━━━━━━━━ */}
      <section id="features" className="py-12 sm:py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-block bg-blue-50 rounded-full px-3 py-1 text-xs sm:text-sm text-blue-600 font-medium mb-3">Features</div>
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Everything you need to grow</h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto">From first customer call to final invoice — PlumbCore handles it all.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { icon: '🤖', title: 'AI Estimates', desc: 'Customers upload photos → instant pricing — no more back and forth.' },
            { icon: '📅', title: 'Smart Scheduling', desc: 'Auto-assign jobs to the nearest tech with route optimization.' },
            { icon: '📄', title: 'Auto Invoicing', desc: 'Send invoices with payment links. Get paid 3x faster.' },
            { icon: '📊', title: 'Live Dashboard', desc: 'Cash flow, jobs, and team status at a glance, from any device.' },
          ].map((f, i) => (
            <div key={i} className="p-5 sm:p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="text-2xl sm:text-3xl mb-3">{f.icon}</div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━ OLD vs NEW ━━━━━━━━━━ */}
      <section className="py-12 sm:py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-10">
            <div>
              <div className="inline-block bg-red-50 rounded-full px-3 py-1 text-xs sm:text-sm text-red-600 font-medium mb-3">The Old Way</div>
              <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Still doing paperwork at 10pm?</h2>
              <div className="space-y-3">
                {[
                  'Hours creating quotes in Word documents',
                  'Chasing customers for payments by phone',
                  'Coordinating crews manually',
                  'Missing calls and losing jobs',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span className="text-sm sm:text-base text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="inline-block bg-green-50 rounded-full px-3 py-1 text-xs sm:text-sm text-green-600 font-medium mb-3">The PlumbCore Way</div>
              <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">AI handles the business, you fix pipes</h2>
              <div className="space-y-3">
                {[
                  'AI photo estimates — 2 minutes, not 2 hours',
                  'Auto invoicing with Stripe payment links',
                  'Smart dispatch to the right technician',
                  '24/7 customer booking online',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm sm:text-base text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━ BENEFITS ━━━━━━━━━━ */}
      <section className="py-12 sm:py-20 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            { icon: '⏱️', title: 'Save 10+ Hours/Week', desc: 'Automate estimates, scheduling, follow-ups', bg: 'bg-blue-50', border: 'border-blue-200' },
            { icon: '💰', title: 'Increase Revenue 25%', desc: 'AI pricing recommendations and upselling', bg: 'bg-green-50', border: 'border-green-200' },
            { icon: '📱', title: 'Mobile-First Team', desc: 'Dispatch, track, and complete jobs on the go', bg: 'bg-purple-50', border: 'border-purple-200' },
          ].map((item, i) => (
            <div key={i} className={`p-6 rounded-2xl ${item.bg} ${item.border} border`}>
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━ HOW IT WORKS ━━━━━━━━━━ */}
      <section className="py-12 sm:py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block bg-blue-50 rounded-full px-3 py-1 text-xs sm:text-sm text-blue-600 font-medium mb-3">How It Works</div>
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-8 sm:mb-12">Get started in 4 minutes</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {[
              { step: '1', icon: '📸', title: 'Sign Up', desc: 'Create your account' },
              { step: '2', icon: '⚙️', title: 'Configure', desc: 'Pricing, hours, team' },
              { step: '3', icon: '🚀', title: 'Get Leads', desc: 'Customers book 24/7' },
              { step: '4', icon: '💰', title: 'Get Paid', desc: 'Auto invoicing' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="relative inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-50 text-2xl mb-3">
                  {item.icon}
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 text-white text-[10px] sm:text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-0.5">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━ PRICING ━━━━━━━━━━ */}
      <section id="pricing" className="py-12 sm:py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-block bg-blue-50 rounded-full px-3 py-1 text-xs sm:text-sm text-blue-600 font-medium mb-3">Pricing</div>
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Simple, transparent pricing</h2>
          <p className="text-sm sm:text-base text-gray-500">No hidden fees. Cancel anytime. 7-day free trial.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {[
            { tier: 'Starter', price: 79, popular: false, features: ['2 technicians', 'Basic scheduling', 'Estimate & invoicing', 'Email support'] },
            { tier: 'Pro', price: 129, popular: true, features: ['10 technicians', 'Route optimization', 'AI photo estimates', 'SMS notifications', 'Priority support'] },
            { tier: 'Unlimited', price: 199, popular: false, features: ['Unlimited techs', 'Everything in Pro', 'API access', 'Dedicated manager', 'Custom integrations'] },
          ].map((plan, i) => (
            <div key={i} className={`relative rounded-2xl border p-6 ${plan.popular ? 'border-blue-500 ring-2 ring-blue-500 bg-white shadow-lg' : 'border-gray-200 bg-white shadow-sm'}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Most Popular</div>}
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{plan.tier}</h3>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-sm text-gray-400">/month</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-600">{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => r.push('/signup')} className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : 'border-2 border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600'}`}>
                Start Free Trial
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━ TESTIMONIALS ━━━━━━━━━━ */}
      <section className="py-12 sm:py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-block bg-blue-50 rounded-full px-3 py-1 text-xs sm:text-sm text-blue-600 font-medium mb-3">Testimonials</div>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Trusted by 500+ plumbing companies</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { name: 'Mike Rodriguez', company: 'Rodriguez Plumbing TX', text: 'Saved 15 hours a week. The AI estimates are incredibly accurate — within 10% of actual costs every time.' },
              { name: 'Sarah Chen', company: 'Chen Family Services', text: 'Dispatching takes 30 seconds now. Best investment we\'ve made for our growing team.' },
              { name: 'James Wilson', company: 'Wilson Plumbing & Heating', text: 'Payment collection went from 45 days to 7 days. Cash flow has never been better.' },
            ].map((t, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━ FINAL CTA ━━━━━━━━━━ */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-12 sm:py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-bold mb-3">Ready to automate?</h2>
          <p className="text-sm sm:text-lg text-blue-200 mb-6 max-w-lg mx-auto">Join thousands of plumbers saving 10+ hours per week and increasing revenue by 25%.</p>
          <button onClick={() => r.push('/signup')} className="bg-white text-blue-700 font-semibold px-6 sm:px-8 py-3 rounded-xl hover:bg-blue-50 transition-all shadow-lg active:scale-[0.97] text-sm sm:text-base">
            Start Your Free Trial
          </button>
          <p className="text-xs sm:text-sm text-blue-300 mt-3">7-day free trial · No credit card · Cancel anytime</p>
        </div>
      </section>

      {/* ━━━━━━━━━━ FOOTER ━━━━━━━━━━ */}
      <footer className="bg-gray-900 text-gray-400 py-10 sm:py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 sm:gap-10">
            <div className="sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-white font-bold">PlumbCore</span>
              </div>
              <p className="text-sm leading-relaxed">AI-powered plumbing software for growing companies. Mobile-first, built for the trades.</p>
            </div>
            {[
              { title: 'Product', links: [
                { label: 'Features', onClick: () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) },
                { label: 'Pricing', onClick: () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }) },
                { label: 'Get a Quote', onClick: () => r.push('/quote/plumbcore') },
                { label: 'Sign In', onClick: () => r.push('/login') },
              ]},
              { title: 'Resources', links: [
                { label: 'Help Center' },
                { label: 'API Docs' },
                { label: 'Blog' },
                { label: 'Case Studies' },
              ]},
              { title: 'Contact', links: [
                { label: 'support@plumbcore.ai' },
                { label: '(555) 123-4567' },
                { label: 'Austin, TX' },
              ]},
            ].map((section, i) => (
              <div key={i}>
                <h4 className="text-white font-semibold text-sm mb-3 sm:mb-4">{section.title}</h4>
                <ul className="space-y-2 text-sm">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      {'onClick' in link ? (
                        <button onClick={(link as any).onClick} className="hover:text-white transition-colors">{link.label}</button>
                      ) : (
                        <span className="cursor-default">{link.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
            <p>© 2026 PlumbCore. All rights reserved.</p>
            <div className="flex gap-5">
              <span className="cursor-default hover:text-white transition-colors">Privacy Policy</span>
              <span className="cursor-default hover:text-white transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}