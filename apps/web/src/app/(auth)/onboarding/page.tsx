'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input, Modal } from '@/pkg/ui-components';

/* ── Types ── */
type Step = 1 | 2 | 3 | 4 | 5 | 'success' | 'error';

interface CompanyProfile {
  companyName: string;
  email: string;
  phone: string;
  website: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface DayHours {
  open: boolean;
  openTime: string;
  closeTime: string;
}

type BusinessHours = Record<string, DayHours>;

interface PricingSettings {
  hourlyRate: string;
  serviceFee: string;
  taxRate: string;
  partsMarkup: string;
}

interface TeamInvite {
  name: string;
  email: string;
  role: string;
}

interface OnboardingData {
  company: CompanyProfile;
  hours: BusinessHours;
  pricing: PricingSettings;
  team: TeamInvite[];
  plan: string;
}

const STORAGE_KEY = 'plumbcore_onboarding';

const DEFAULT_HOURS: BusinessHours = {
  Monday: { open: true, openTime: '08:00', closeTime: '17:00' },
  Tuesday: { open: true, openTime: '08:00', closeTime: '17:00' },
  Wednesday: { open: true, openTime: '08:00', closeTime: '17:00' },
  Thursday: { open: true, openTime: '08:00', closeTime: '17:00' },
  Friday: { open: true, openTime: '08:00', closeTime: '17:00' },
  Saturday: { open: true, openTime: '09:00', closeTime: '14:00' },
  Sunday: { open: false, openTime: '09:00', closeTime: '14:00' },
};

const INITIAL_DATA: OnboardingData = {
  company: { companyName: '', email: '', phone: '', website: '', street: '', city: '', state: '', zip: '' },
  hours: { ...DEFAULT_HOURS },
  pricing: { hourlyRate: '85', serviceFee: '15', taxRate: '8.25', partsMarkup: '30' },
  team: [],
  plan: 'solo',
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SUBSCRIPTION_TIERS = [
  { id: 'solo', name: 'Solo', price: 349, desc: 'Best for solo operators', features: ['Up to 2 technicians', 'Basic scheduling', 'Invoice management', 'Email support'] },
  { id: 'pro', name: 'Pro', price: 799, desc: 'Most popular for growing teams', features: ['Up to 10 technicians', 'Advanced scheduling', 'Inventory tracking', 'Reports & analytics', 'Priority support'] },
  { id: 'business', name: 'Business', price: 1499, desc: 'For large operations', features: ['Unlimited technicians', 'Everything in Pro', 'API access', 'Dedicated account manager', 'Custom integrations'] },
];

/* ── Loading spinner ── */
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <svg className="h-8 w-8 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}

/* ── Step Indicator ── */
function StepIndicator({ current, total }: { current: Step extends number ? Step : number; total: number }) {
  const stepNum = typeof current === 'number' ? current : 0;
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i + 1 <= stepNum
              ? 'w-8 bg-electric'
              : i + 1 === stepNum + 1
                ? 'w-8 bg-electric/40'
                : 'w-2 bg-white/10'
          }`}
        />
      ))}
    </div>
  );
}

/* ── Main Page ── */
export default function OnboardingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { step: Step; data: OnboardingData };
        if (parsed.data && parsed.step) {
          setStep(parsed.step);
          setData(parsed.data);
        }
      }
    } catch {
      // Ignore parse errors, use defaults
    }
    setMounted(true);
  }, []);

  // Save to localStorage whenever step or data changes
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, data }));
      } catch {
        // localStorage might be full
      }
    }
  }, [step, data, mounted]);

  const persistData = useCallback((updater: (prev: OnboardingData) => OnboardingData) => {
    setData((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ step: 1, data: next }));
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  const updateCompany = (field: keyof CompanyProfile, value: string) => {
    setData((prev) => ({ ...prev, company: { ...prev.company, [field]: value } }));
  };

  const updateHours = (day: string, field: keyof DayHours, value: boolean | string) => {
    setData((prev) => ({
      ...prev,
      hours: { ...prev.hours, [day]: { ...prev.hours[day], [field]: value } },
    }));
  };

  const updatePricing = (field: keyof PricingSettings, value: string) => {
    setData((prev) => ({ ...prev, pricing: { ...prev.pricing, [field]: value } }));
  };

  const addTeamMember = () => {
    if (data.team.length >= 3) return;
    setData((prev) => ({ ...prev, team: [...prev.team, { name: '', email: '', role: 'tech' }] }));
  };

  const updateTeamMember = (index: number, field: keyof TeamInvite, value: string) => {
    setData((prev) => {
      const team = [...prev.team];
      team[index] = { ...team[index], [field]: value };
      return { ...prev, team };
    });
  };

  const removeTeamMember = (index: number) => {
    setData((prev) => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== index),
    }));
  };

  const handleNext = () => {
    if (typeof step === 'number' && step < 5) {
      setStep((step + 1) as Step);
    }
  };

  const handleBack = () => {
    if (typeof step === 'number' && step > 1) {
      setStep((step - 1) as Step);
    }
  };

  const handleSkip = () => {
    setStep(5);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Save onboarding data via API
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: data.company,
          hours: data.hours,
          pricing: data.pricing,
          plan: data.plan,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save');
      }

      // Clear onboarding data
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem('plumbcore_onboarded', 'true');
      setStep('success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create company. Please try again.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleRetry = () => {
    setLoadError(null);
    setStep(1);
  };

  /* ── Loading state before mount ── */
  if (!mounted) {
    return (
      <div className="w-full">
        <LoadingSpinner />
      </div>
    );
  }

  /* ── Error state ── */
  if (loadError) {
    return (
      <div className="w-full">
        <Card variant="bordered" padding="lg" className="text-center">
          <div className="flex flex-col items-center py-6">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <svg className="h-7 w-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
            <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
            <Button className="mt-6" onClick={handleRetry}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  /* ── Success screen ── */
  if (step === 'success') {
    const companyName = data.company.companyName || 'your company';
    return (
      <div className="w-full">
        <div className="rounded-2xl ring-1 ring-black/5 bg-white p-8 text-center">
          {/* Celebratory animation */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-200">
            <svg className="h-10 w-10 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">🎉 {companyName} is live!</h1>
          <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
            You&apos;re all set. Your AI chat widget is ready — the first lead could arrive today.
          </p>

          {/* Sparkline stats — variable reward preview */}
          <div className="mt-6 grid grid-cols-3 gap-3 max-w-xs mx-auto">
            {[
              { label: 'Leads', value: '0', icon: '📋' },
              { label: 'Jobs', value: '0', icon: '🔧' },
              { label: 'Revenue', value: '$0', icon: '💰' },
            ].map((s, i) => (
              <div key={i} className="rounded-xl bg-muted ring-1 ring-black/5 p-3">
                <p className="text-lg">{s.icon}</p>
                <p className="text-base font-bold text-foreground mt-0.5">{s.value}</p>
                <p className="text-[10px] text-muted-foreground/80">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Next-trigger actions — investment loads future trigger */}
          <div className="mt-6 space-y-2">
            <Button size="lg" className="w-full max-w-xs" onClick={handleGoToDashboard}>
              Go to Dashboard
            </Button>
            <div className="text-xs text-muted-foreground/80 mt-3 space-y-1">
              <p>💡 <span className="font-medium text-muted-foreground">Next:</span> Set up your AI chat widget to start capturing leads</p>
              <p>👥 Invite your team so they can see the schedule</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Submit error modal ── */
  const submitErrorModal = submitError ? (
    <Modal
      open={true}
      onClose={() => setSubmitError(null)}
      title="Setup Error"
      description={submitError}
      size="sm"
      footer={
        <Button variant="secondary" onClick={() => setSubmitError(null)}>
          Close
        </Button>
      }
    />
  ) : null;

  /* ── Wizard content ── */
  return (
    <div className="w-full">
      {/* Logo + Title */}
      <div className="mb-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-tint mb-4">
          <svg className="h-7 w-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Set up your company</h1>
        <p className="mt-1 text-sm text-muted-foreground">Get started with PlumbCore AI in a few steps</p>
      </div>

      {/* Step indicator */}
      <StepIndicator current={typeof step === 'number' ? step : 0} total={5} />

      {/* Card container */}
      <Card variant="default" padding="lg" className="w-full">
        {/* ── Step 1: Company Profile ── */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Company Profile</h2>
            <p className="text-sm text-muted-foreground">Tell us about your plumbing business.</p>

            <Input
              label="Company Name"
              placeholder="Johnson Plumbing LLC"
              value={data.company.companyName}
              onChange={(e) => updateCompany('companyName', e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                placeholder="hello@johnsonplumbing.com"
                value={data.company.email}
                onChange={(e) => updateCompany('email', e.target.value)}
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={data.company.phone}
                onChange={(e) => updateCompany('phone', e.target.value)}
              />
            </div>
            <Input
              label="Website"
              placeholder="https://johnsonplumbing.com"
              value={data.company.website}
              onChange={(e) => updateCompany('website', e.target.value)}
            />
            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium text-muted-foreground/80 mb-3">Business Address</p>
              <Input
                label="Street Address"
                placeholder="123 Main Street"
                value={data.company.street}
                onChange={(e) => updateCompany('street', e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <Input
                  label="City"
                  placeholder="Austin"
                  value={data.company.city}
                  onChange={(e) => updateCompany('city', e.target.value)}
                />
                <Input
                  label="State"
                  placeholder="TX"
                  value={data.company.state}
                  onChange={(e) => updateCompany('state', e.target.value)}
                />
                <Input
                  label="ZIP"
                  placeholder="73301"
                  value={data.company.zip}
                  onChange={(e) => updateCompany('zip', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleNext}>Next Step</Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Business Hours ── */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Business Hours</h2>
            <p className="text-sm text-muted-foreground">Set your standard operating hours.</p>

            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-[1fr_80px_80px_60px] gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Day</span>
                <span className="text-center">Open</span>
                <span className="text-center">Close</span>
                <span className="text-right">Open?</span>
              </div>
              {DAYS.map((day) => {
                const h = data.hours[day];
                return (
                  <div
                    key={day}
                    className={`grid grid-cols-[1fr_80px_80px_60px] gap-2 items-center rounded-xl ring-1 ring-black/5 px-3 py-2.5 transition-colors ${
                      !h.open ? 'opacity-50' : ''
                    }`}
                  >
                    <span className="text-sm font-medium text-foreground">{day}</span>
                    <input
                      type="time"
                      value={h.openTime}
                      onChange={(e) => updateHours(day, 'openTime', e.target.value)}
                      disabled={!h.open}
                      className="w-full rounded-md border border-white/10 bg-whiteer px-2 py-1 text-xs text-foreground outline-none focus:border-electric/50 disabled:opacity-30"
                    />
                    <input
                      type="time"
                      value={h.closeTime}
                      onChange={(e) => updateHours(day, 'closeTime', e.target.value)}
                      disabled={!h.open}
                      className="w-full rounded-md border border-white/10 bg-whiteer px-2 py-1 text-xs text-foreground outline-none focus:border-electric/50 disabled:opacity-30"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => updateHours(day, 'open', !h.open)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-electric/40 ${
                          h.open ? 'bg-electric' : 'bg-white/10'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            h.open ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={handleBack}>Back</Button>
              <Button onClick={handleNext}>Next Step</Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Pricing Settings ── */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Pricing Settings</h2>
            <p className="text-sm text-muted-foreground">Set your default pricing rates.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Hourly Rate ($/hr)"
                type="number"
                placeholder="85"
                value={data.pricing.hourlyRate}
                onChange={(e) => updatePricing('hourlyRate', e.target.value)}
              />
              <Input
                label="Service Fee (%)"
                type="number"
                placeholder="15"
                value={data.pricing.serviceFee}
                onChange={(e) => updatePricing('serviceFee', e.target.value)}
              />
              <Input
                label="Tax Rate (%)"
                type="number"
                placeholder="8.25"
                value={data.pricing.taxRate}
                onChange={(e) => updatePricing('taxRate', e.target.value)}
              />
              <Input
                label="Markup on Parts (%)"
                type="number"
                placeholder="30"
                value={data.pricing.partsMarkup}
                onChange={(e) => updatePricing('partsMarkup', e.target.value)}
              />
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={handleBack}>Back</Button>
              <Button onClick={handleNext}>Next Step</Button>
            </div>
          </div>
        )}

        {/* ── Step 4: Team Setup ── */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Team Setup</h2>
            <p className="text-sm text-muted-foreground">Invite your team members to get started.</p>

            {data.team.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/10 p-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">No team members added yet.</p>
                <Button variant="secondary" size="sm" onClick={addTeamMember}>
                  + Add Team Member
                </Button>
              </div>
            )}

            {data.team.map((member, index) => (
              <div key={index} className="rounded-xl ring-1 ring-black/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Team Member {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeTeamMember(index)}
                    className="text-xs text-red-600 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>
                <Input
                  label="Name"
                  placeholder="Full name"
                  value={member.name}
                  onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={member.email}
                  onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-muted-foreground/80">Role</label>
                  <select
                    value={member.role}
                    onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-whiteer px-4 py-2.5 text-sm text-foreground outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20"
                  >
                    <option value="admin">Admin</option>
                    <option value="dispatcher">Dispatcher</option>
                    <option value="lead-tech">Lead Tech</option>
                    <option value="senior-tech">Senior Tech</option>
                    <option value="tech">Tech</option>
                  </select>
                </div>
              </div>
            ))}

            {data.team.length > 0 && data.team.length < 3 && (
              <Button variant="ghost" size="sm" onClick={addTeamMember}>
                + Add Another Member
              </Button>
            )}

            <div className="flex justify-between items-center pt-2">
              <Button variant="ghost" onClick={handleBack}>Back</Button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-sm text-muted-foreground hover:text-muted-foreground/80 transition-colors"
                >
                  Skip &mdash; I&apos;ll add them later
                </button>
                <Button onClick={handleNext}>Next Step</Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 5: Subscription ── */}
        {step === 5 && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Choose Your Plan</h2>
            <p className="text-sm text-muted-foreground">Start your 14-day free trial. No credit card required.</p>

            <div className="space-y-3">
              {SUBSCRIPTION_TIERS.map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setData((prev) => ({ ...prev, plan: tier.id }))}
                  className={`w-full text-left rounded-xl border p-4 transition-all ${
                    data.plan === tier.id
                      ? 'border-electric bg-electric/5'
                      : 'border-border bg-whiteer hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{tier.name}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{tier.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-foreground">${tier.price}</span>
                      <span className="text-sm text-muted-foreground">/mo</span>
                      <div
                        className={`ml-2 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          data.plan === tier.id
                            ? 'border-electric bg-electric'
                            : 'border-white/20'
                        }`}
                      >
                        {data.plan === tier.id && (
                          <svg className="h-3 w-3 text-[#0a0e2a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
                    {tier.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <svg className="h-3.5 w-3.5 shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {submitError && (
              <div className="rounded-xl border border-status-error/30 bg-red-50 px-4 py-3 text-sm text-red-600">
                {submitError}
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <Button variant="ghost" onClick={handleBack}>Back</Button>
              <Button onClick={handleSubmit} loading={submitting} disabled={submitting}>
                {submitting ? 'Setting up your company…' : 'Start Free Trial'}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Confetti particles on success (shown above) */}

      {submitErrorModal}
    </div>
  );
}