'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PLAN_PRICING, STRIPE_PRICE_IDS, PLAN_ORDER, getPlanFeatures } from '@/lib/feature-gates';

const FEATURE_LABELS: Record<string, { label: string; solo?: boolean; pro?: boolean; business?: boolean; enterprise?: boolean }> = {
  schedulingInvoicing: { label: 'Scheduling & Invoicing', solo: true, pro: true, business: true, enterprise: true },
  aiPhotoEstimates: { label: 'Unlimited AI Photo Estimates', solo: true, pro: true, business: true, enterprise: true },
  voiceToInvoice: { label: 'Voice-to-Invoice', pro: true, business: true, enterprise: true },
  routeOptimization: { label: 'Route Optimization', pro: true, business: true, enterprise: true },
  inventoryTracking: { label: 'Inventory Tracking', pro: true, business: true, enterprise: true },
  maintenancePlans: { label: 'Maintenance Plans', pro: true, business: true, enterprise: true },
  reviewAutomation: { label: 'Review Automation', pro: true, business: true, enterprise: true },
  customerFinancing: { label: 'Customer Financing', business: true, enterprise: true },
  truckGps: { label: 'Truck GPS + Arrival Notifications', business: true, enterprise: true },
  predictiveMaintenance: { label: 'AI Predictive Maintenance', enterprise: true },
  whiteLabelPortal: { label: 'White-Label Portal', enterprise: true },
  dedicatedManager: { label: 'Dedicated Account Manager', enterprise: true },
  customIntegrations: { label: 'Custom Integrations', enterprise: true },
};

const AI_HOURS_LABELS: Record<string, string> = {
  solo: '15 hrs/mo',
  pro: '60 hrs/mo',
  business: '150 hrs/mo',
  enterprise: 'Custom',
};

const TECH_COUNTS: Record<string, string> = {
  solo: '1 tech',
  pro: '2–10 techs',
  business: '11–25 techs',
  enterprise: '25+ techs',
};

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectPlan = async (tier: string) => {
    const priceId = STRIPE_PRICE_IDS[tier];
    if (!priceId) {
      // Enterprise — scroll to contact section
      document.getElementById('enterprise-cta')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setLoading(tier);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, planName: tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to create checkout session');
      }
    } catch {
      alert('Network error');
    }
    setLoading(null);
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Simple, transparent pricing
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
          Start with a 14-day free trial. No credit card required. Cancel anytime.
        </p>
      </div>

      {/* 3-Tier Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {PLAN_ORDER.slice(0, 3).map((tier) => {
          const plan = PLAN_PRICING[tier];
          const features = getPlanFeatures(tier);
          const isPro = tier === 'pro';
          const aiHours = AI_HOURS_LABELS[tier];
          const techCount = TECH_COUNTS[tier];

          return (
            <div
              key={tier}
              className={`relative flex flex-col rounded-2xl border transition-all duration-200 ${
                isPro
                  ? 'border-blue-500/50 shadow-lg shadow-blue-500/10 scale-[1.02]'
                  : 'border-gray-200 hover:border-gray-300 shadow-sm'
              } bg-white`}
            >
              {/* Most Popular Badge */}
              {isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Most Popular
                  </span>
                </div>
              )}

              {/* Card Header */}
              <div className="p-6 pb-0">
                <h3 className="text-lg font-bold text-gray-900">{plan.label}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900">{plan.priceLabel}</span>
                  <span className="text-sm text-gray-500">/month</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{techCount}</p>
                <p className="text-sm text-gray-500">{aiHours} AI receptionist</p>
              </div>

              {/* Feature List */}
              <div className="flex-1 px-6 py-6">
                <ul className="space-y-2.5">
                  {Object.entries(FEATURE_LABELS).map(([key, feat]) => {
                    const has = feat[tier as keyof typeof feat];
                    return (
                      <li key={key} className="flex items-start gap-2.5 text-sm">
                        {has ? (
                          <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <span className={has ? 'text-gray-700' : 'text-gray-400'}>{feat.label}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* CTA */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => handleSelectPlan(tier)}
                  disabled={loading === tier}
                  className={`w-full h-11 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
                    isPro
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                      : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {loading === tier ? 'Redirecting...' : 'Start Free Trial →'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enterprise CTA */}
      <div id="enterprise-cta" className="relative rounded-2xl border border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50/40 p-8 sm:p-10 text-center shadow-sm">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-4 py-1 text-xs font-semibold text-white">
            Enterprise
          </span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Need more power?</h3>
        <p className="text-sm text-gray-500 max-w-xl mx-auto mb-6">
          25+ technicians, custom integrations, white-label portal, dedicated account manager, API access, and volume pricing.
        </p>
        <a
          href="mailto:sales@plumbcore.ai?subject=Enterprise%20Inquiry"
          className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-all active:scale-[0.98] shadow-sm"
        >
          Contact Sales
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>

      {/* Feature Comparison Table (mobile-friendly) */}
      <div className="mt-12">
        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Full Feature Comparison</h3>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[500px] text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-900">Feature</th>
                {PLAN_ORDER.slice(0, 3).map(t => (
                  <th key={t} className="px-4 py-3 text-center font-semibold text-gray-900">{PLAN_PRICING[t].label}</th>
                ))}
                <th className="px-4 py-3 text-center font-semibold text-gray-900">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.entries(FEATURE_LABELS).map(([key, feat]) => (
                <tr key={key} className="hover:bg-gray-50/50">
                  <td className="px-4 py-2.5 text-gray-700">{feat.label}</td>
                  {(['solo', 'pro', 'business'] as const).map(t => (
                    <td key={t} className="px-4 py-2.5 text-center">
                      {feat[t] ? (
                        <svg className="w-4 h-4 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-2.5 text-center">
                    {feat.enterprise ? (
                      <svg className="w-4 h-4 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
              <tr className="hover:bg-gray-50/50">
                <td className="px-4 py-2.5 text-gray-700">AI Receptionist Hours</td>
                {(['solo', 'pro', 'business'] as const).map(t => (
                  <td key={t} className="px-4 py-2.5 text-center text-gray-500 text-xs">{AI_HOURS_LABELS[t]}</td>
                ))}
                <td className="px-4 py-2.5 text-center text-gray-500 text-xs">Custom</td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="px-4 py-2.5 text-gray-700">Technicians</td>
                {(['solo', 'pro', 'business'] as const).map(t => (
                  <td key={t} className="px-4 py-2.5 text-center text-gray-500 text-xs">{TECH_COUNTS[t]}</td>
                ))}
                <td className="px-4 py-2.5 text-center text-gray-500 text-xs">25+</td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="px-4 py-2.5 text-gray-700">Price</td>
                {(['solo', 'pro', 'business'] as const).map(t => (
                  <td key={t} className="px-4 py-2.5 text-center font-semibold text-gray-900">{PLAN_PRICING[t].priceLabel}</td>
                ))}
                <td className="px-4 py-2.5 text-center font-semibold text-gray-900">Contact Us</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
