'use client';

import { useRouter } from 'next/navigation';

/* ─── Design Tokens ───
   Colors: primary=#2563eb (blue-600), accent=#1d4ed8, bg=#f8fafc
   Font: Geist (system), radius: 12px/16px, spacing: 8px grid
   ─────────────────── */

const Link = ({ href, children, className = '' }: { href: string; children: React.ReactNode; className?: string }) => {
  const r = useRouter();
  return <button onClick={() => r.push(href)} className={`text-left cursor-pointer ${className}`}>{children}</button>;
};

function StarRating() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="group relative p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function PricingCard({ tier, price, features, popular = false }: { tier: string; price: number; features: string[]; popular?: boolean }) {
  const r = useRouter();
  return (
    <div className={`relative p-6 sm:p-8 rounded-2xl bg-white border transition-all duration-300 hover:shadow-lg ${popular ? 'border-blue-500 ring-2 ring-blue-500 shadow-xl scale-[1.02] sm:scale-105' : 'border-gray-100 shadow-sm hover:-translate-y-1'}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
          Most Popular
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{tier}</h3>
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-4xl font-bold text-gray-900">${price}</span>
        <span className="text-sm text-gray-400">/month</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-gray-600">{f}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={() => r.push('/signup')}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${popular ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg' : 'border-2 border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600'}`}
      >
        Start Free Trial
      </button>
    </div>
  );
}

export default function LandingPage() {
  const r = useRouter();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900">
      {/* ═══ HERO SECTION ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-300 rounded-full blur-3xl animate-pulse" style={{animationDuration: '4s'}} />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-indigo-300 rounded-full blur-3xl animate-pulse" style={{animationDuration: '6s'}} />
        </div>

        {/* Nav */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-lg font-bold">PlumbCore AI</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-blue-100">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <button onClick={() => r.push('/login')} className="hover:text-white transition-colors">Sign In</button>
              <button onClick={() => r.push('/signup')} className="bg-white text-blue-700 px-5 py-2 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors shadow-sm">
                Start Free Trial
              </button>
            </div>
            {/* Mobile hamburger */}
            <button className="md:hidden p-2 text-white" onClick={() => {}}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-blue-200 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              AI-Powered Plumbing Platform
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              Run Your Plumbing Business<br />
              <span className="text-blue-200">On Autopilot</span>
            </h1>
            <p className="text-base sm:text-lg text-blue-200 max-w-2xl mx-auto mb-8 leading-relaxed">
              AI-powered estimates, smart scheduling, automated invoicing. 
              PlumbCore AI handles the business so you can fix pipes.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => r.push('/signup')}
                className="bg-white text-blue-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] text-[15px] min-h-[48px]"
              >
                Start Free Trial
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all active:scale-[0.98] text-[15px] min-h-[48px]"
              >
                View Demo
              </button>
            </div>

            <p className="text-sm text-blue-300 mt-4">7-day free trial • No credit card required</p>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 mt-12 sm:mt-20 max-w-4xl mx-auto">
            {[
              { value: '500+', label: 'Plumbing Companies' },
              { value: '50K+', label: 'Jobs Completed' },
              { value: '99.9%', label: 'Uptime' },
              { value: '4.9★', label: 'Customer Rating' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-xl sm:text-2xl font-bold">{s.value}</div>
                <div className="text-xs sm:text-sm text-blue-200 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES SECTION ═══ */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-1.5 text-sm text-blue-700 font-medium mb-4">
            Why PlumbCore?
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3">Everything you need to grow</h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto">From the first customer call to the final invoice — we&apos;ve got your back office covered.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <FeatureCard icon="🤖" title="AI Estimates" desc="Customers upload photos → instant upfront pricing → no more back-and-forth on the phone" />
          <FeatureCard icon="📅" title="Smart Scheduling" desc="Auto-assign jobs to the nearest available technician with route optimization" />
          <FeatureCard icon="📄" title="Automated Invoicing" desc="Send estimates, invoices, and follow-ups automatically with payment links" />
          <FeatureCard icon="📊" title="Real-Time Dashboard" desc="See cash flow, jobs in progress, and team status at a glance from any device" />
        </div>
      </section>

      {/* ═══ PROBLEM/SOLUTION SECTION ═══ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Problem */}
          <div>
            <div className="inline-flex items-center gap-2 bg-red-50 rounded-full px-4 py-1.5 text-sm text-red-600 font-medium mb-4">
              The Old Way
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-6">Still doing paperwork at 10pm?</h2>
            <div className="space-y-4">
              {[
                'Hours creating quotes in Word documents',
                'Chasing customers for payments via phone calls',
                'Losing time coordinating crews manually',
                'Missing opportunities with missed calls and no-shows'
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Solution */}
          <div>
            <div className="inline-flex items-center gap-2 bg-green-50 rounded-full px-4 py-1.5 text-sm text-green-600 font-medium mb-4">
              The PlumbCore Way
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-6">AI handles the business, you fix pipes</h2>
            <div className="space-y-4">
              {[
                'AI photo estimates — 2 minutes, not 2 hours',
                'Automated invoicing with Stripe payment links',
                'Smart dispatch routes jobs to the right technician',
                '24/7 customer booking via web portal'
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BENEFITS ROW ═══ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '⏱️', title: 'Save 10+ Hours/Week', desc: 'Automate estimates, scheduling, and follow-ups', bg: 'bg-blue-50', border: 'border-blue-100' },
            { icon: '💰', title: 'Increase Revenue 25%', desc: 'AI pricing recommendations and automated upsells', bg: 'bg-green-50', border: 'border-green-100' },
            { icon: '📱', title: 'Mobile-First Team', desc: 'Dispatch, track, and complete jobs on the go', bg: 'bg-purple-50', border: 'border-purple-100' },
          ].map((item, i) => (
            <div key={i} className={`p-6 sm:p-8 rounded-2xl ${item.bg} ${item.border} border hover:shadow-md transition-all duration-300`}>
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-1.5 text-sm text-blue-700 font-medium mb-4">
            Getting Started
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-12">How It Works</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '1', icon: '📸', title: 'Sign Up', desc: 'Create your account in 2 minutes' },
              { step: '2', icon: '⚙️', title: 'Set Your Business', desc: 'Configure pricing, hours, and team' },
              { step: '3', icon: '🚀', title: 'Start Getting Leads', desc: 'Customers book appointments online 24/7' },
              { step: '4', icon: '💰', title: 'Get Paid Faster', desc: 'Automated invoicing & payment reminders' },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-2xl mb-4 group-hover:bg-blue-100 transition-colors">
                  {item.icon}
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-1.5 text-sm text-blue-700 font-medium mb-4">
            Pricing
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3">Simple, Transparent Pricing</h2>
          <p className="text-sm sm:text-base text-gray-500">No hidden fees. Cancel anytime. Start with a 7-day free trial.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          <PricingCard tier="Starter" price={79} features={['2 technicians', 'Basic scheduling', 'Estimate & invoicing', 'Email support']} />
          <PricingCard tier="Pro" price={129} features={['10 technicians', 'Route optimization', 'AI photo estimates', 'SMS notifications', 'Priority support']} popular />
          <PricingCard tier="Unlimited" price={199} features={['Unlimited technicians', 'Everything in Pro', 'API access', 'Dedicated manager', 'Custom integrations']} />
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-1.5 text-sm text-blue-700 font-medium mb-4">
              Testimonials
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3">Trusted by 500+ Plumbing Companies</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { name: 'Mike Rodriguez', company: 'Rodriguez Plumbing TX', text: 'PlumbCore saved me 15 hours a week. The AI estimates are incredibly accurate — within 10% of actual costs every time.' },
              { name: 'Sarah Chen', company: 'Chen Family Services', text: 'My team loves the mobile app. Dispatching used to take forever, now it takes 30 seconds. Best investment we\'ve made.' },
              { name: 'James Wilson', company: 'Wilson Plumbing & Heating', text: 'Payment collection went from 45 days to 7 days. Cash flow has never been better. The automated reminders are a game-changer.' },
            ].map((t, i) => (
              <div key={i} className="p-6 sm:p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-all duration-300">
                <StarRating />
                <p className="text-sm sm:text-base text-gray-600 my-4 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-300 rounded-full blur-3xl animate-pulse" style={{animationDuration: '5s'}} />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-indigo-300 rounded-full blur-3xl animate-pulse" style={{animationDuration: '7s'}} />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-4xl font-bold mb-4">Ready to Automate Your Plumbing Business?</h2>
          <p className="text-blue-200 text-base sm:text-lg mb-8 max-w-xl mx-auto">
            Join thousands of plumbers saving 10+ hours per week and increasing revenue by 25%.
          </p>
          <button
            onClick={() => r.push('/signup')}
            className="bg-white text-blue-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] text-[15px] min-h-[48px]"
          >
            Start Your Free Trial
          </button>
          <p className="text-sm text-blue-300 mt-4">7-day free trial • No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-gray-900 text-gray-400 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-white text-lg font-bold">PlumbCore AI</span>
              </div>
              <p className="text-sm leading-relaxed">Modern plumbing business software for growing companies. AI-powered, mobile-first, built for the trades.</p>
            </div>

            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
              <ul className="space-y-2.5 text-sm">
                <li><button onClick={() => r.push('/signup')} className="hover:text-white transition-colors">Features</button></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><button onClick={() => r.push('/quote/plumbcore')} className="hover:text-white transition-colors">Get a Quote</button></li>
                <li><button onClick={() => r.push('/login')} className="hover:text-white transition-colors">Sign In</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Resources</h4>
              <ul className="space-y-2.5 text-sm">
                <li><span className="cursor-default">Help Center</span></li>
                <li><span className="cursor-default">API Docs</span></li>
                <li><span className="cursor-default">Blog</span></li>
                <li><span className="cursor-default">Case Studies</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Contact</h4>
              <ul className="space-y-2.5 text-sm">
                <li>support@plumbcore.ai</li>
                <li>(555) 123-4567</li>
                <li>Austin, TX</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
            <p>© 2026 PlumbCore AI. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="cursor-default hover:text-white transition-colors">Privacy Policy</span>
              <span className="cursor-default hover:text-white transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}