'use client';

import { Button } from '@/pkg/ui-components';

function Card({ icon, title, desc }: any) {
  return (
    <div className="p-6 rounded-xl bg-white shadow-sm border border-gray-100">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-700">{desc}</p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4 md:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Run Your Plumbing Business<br />
            <span className="text-blue-600">On Autopilot</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI-powered estimates, smart scheduling, automated invoicing. PlumbCore AI handles the business so you can fix pipes.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="px-8">Start Free Trial</Button>
            <Button size="lg" variant="outline" className="px-8">View Demo</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="p-6 rounded-xl bg-blue-50">
              <div className="text-4xl mb-4">⏱️</div>
              <h3 className="font-semibold mb-2">Save 10+ Hours/Week</h3>
              <p className="text-gray-600">Automate estimates, scheduling, and follow-ups</p>
            </div>
            <div className="p-6 rounded-xl bg-green-50">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="font-semibold mb-2">Increase Revenue 25%</h3>
              <p className="text-gray-600">AI pricing recommendations & upsells</p>
            </div>
            <div className="p-6 rounded-xl bg-purple-50">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="font-semibold mb-2">Mobile-First Team</h3>
              <p className="text-gray-600">Dispatch, track, and complete jobs on the go</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Still doing paperwork at 10pm?</h2>
          <div className="space-y-4 text-left max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p>Spending hours creating quotes in Word documents</p>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p>Chasing customers for payments via phone calls</p>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p>Losing time coordinating crews on the phone</p>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p>Missing opportunities with missed calls and no-shows</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">PlumbCore AI handles the business, you fix the pipes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card icon="🤖" title="AI Estimates" desc="Customers upload photos → instant upfront pricing → no more back-and-forth">
              AI analyzes photos instantly, gives accurate estimates, and books appointments 24/7
            </Card>
            <Card icon="📅" title="Smart Scheduling" desc="Auto-assign jobs to nearest available technician with route optimization">
              AI dispatching assigns jobs based on location, expertise, and availability
            </Card>
            <Card icon="📄" title="Automated Invoicing" desc="Email invoices automatically with payment links → faster payment">
              Send estimates, invoices, and follow-ups automatically
            </Card>
            <Card icon="📊" title="Real-Time Dashboard" desc="See cash flow, jobs in progress, and team status at a glance">
              Monitor everything from your phone or desktop
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', icon: '📸', title: 'Sign Up', desc: 'Create your account in 2 minutes' },
              { step: '2', icon: '⚙️', title: 'Set Your Business', desc: 'Configure pricing, hours, team' },
              { step: '3', icon: '🚀', title: 'Start Getting Leads', desc: 'Customers book appointments online' },
              { step: '4', icon: '💰', title: 'Get Paid更快', desc: 'Automated invoicing & reminders' }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-600 mb-12">No hidden fees. Cancel anytime.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {([
              { tier: 'Starter', price: 79, features: ['2 technicians', 'Basic scheduling', 'Estimate & invoicing', 'Email support'] },
              { tier: 'Pro', price: 129, features: ['10 technicians', 'Route optimization', 'AI photo estimates', 'SMS notifications', 'Priority support'] },
              { tier: 'Unlimited', price: 199, features: ['Unlimited technicians', 'Everything in Pro', 'API access', 'Dedicated manager', 'Custom integrations'] }
            ]).map((plan, i) => (
              <Card 
                key={i}
                padding="lg"
                className={`relative ${i === 1 ? 'ring-2 ring-blue-500 scale-105' : ''}`}
              >
                {i === 1 && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm">Most Popular</div>}
                <h3 className="text-xl font-semibold mb-2">{plan.tier}</h3>
                <p className="text-4xl font-bold mb-6">${plan.price}<span className="text-lg text-gray-500">/month</span></p>
                <ul className="space-y-2 text-left mb-6">
                  {plan.features.map((feature: string, j: number) => (
                    <li key={j} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={i === 1 ? 'primary' : 'outline'}>
                  Start Free Trial
                </Button>
              </Card>
            ))}
          </div>
          <p className="mt-8 text-sm text-gray-500">7-day free trial • No credit card required</p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Trusted by 500+ Plumbing Companies</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Mike Rodriguez', company: 'Rodriguez Plumbing TX', text: 'PlumbCore saved me 15 hours a week. The AI estimates are incredibly accurate.' },
              { name: 'Sarah Chen', company: 'Chen Family Services', text: 'My team loves the mobile app. Dispatching used to take forever, now it takes 30 seconds.' },
              { name: 'James Wilson', company: 'Wilson Plumbing & Heating', text: 'Payment collection went from 45 days to 7 days. Cash flow has never been better.' }
            ].map((testimonial, i) => (
              <Card key={i} padding="lg">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.company}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Automate Your Plumbing Business?</h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">Join thousands of plumbers saving 10+ hours per week and increasing revenue by 25%</p>
        <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8">
          Start Your Free Trial
        </Button>
        <p className="mt-4 text-sm opacity-90">7-day free trial • No credit card required • Cancel anytime</p>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">PlumbCore AI</h3>
            <p className="text-sm text-gray-400">Modern plumbing business software for growing companies</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Features</a></li>
              <li><a href="#" className="hover:text-white">Pricing</a></li>
              <li><a href="#" className="hover:text-white">Demo</a></li>
              <li><a href="#" className="hover:text-white">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Help Center</a></li>
              <li><a href="#" className="hover:text-white">API Docs</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
              <li><a href="#" className="hover:text-white">Case Studies</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>support@plumbcore.ai</li>
              <li>(555) 123-4567</li>
              <li>Austin, TX</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          © 2024 PlumbCore AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}