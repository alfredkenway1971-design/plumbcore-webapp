'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { Card, Button, ErrorState } from '@/pkg/ui-components';
import { PROFILE_TABS } from '@/lib/plumber-profiles';
import type { PlumberProfile, ProfileTab, PlanTier, PayoutSchedule, BackgroundCheckStatus, PlumberStatus } from '@/lib/plumber-profiles';
import { PLAN_LABELS_PRETTY, PLAN_LEAD_FEES, PLAN_AI_RECEPTIONIST_HOURS } from '@/lib/plan-pricing';

/* ── Icons (inline SVG to avoid deps) ── */
const I = {
  MapPin: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>,
  Star: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>,
  Dollar: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  Shield: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>,
  Wrench: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.66 5.66a2 2 0 11-2.83-2.83l5.66-5.66M14.83 5.17l-2.83 2.83 5.66 5.66 2.83-2.83M18.36 2.14a2 2 0 112.83 2.83L14.83 11.4l-2.83-2.83 6.36-6.43z"/></svg>,
  Clock: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  Check: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>,
  Upload: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>,
  Bank: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"/></svg>,
};

export default function PlumberProfilePage() {
  const profile = useAuthStore((s) => s.profile);
  const company = useAuthStore((s) => s.company);
  const [plumber, setPlumber] = useState<PlumberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!company?.id) return;
    setLoading(true);
    fetch(`/api/plumber/profile?companyId=${company.id}`)
      .then(r => r.json())
      .then(data => { setPlumber(data); setLoading(false); })
      .catch(() => { setLoading(false); setError('Failed to load profile'); });
  }, [company?.id]);

  const saveProfile = async (updates: Partial<PlumberProfile>) => {
    if (!company?.id || !plumber) return;
    setSaving(true);
    try {
      const res = await fetch('/api/plumber/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: company.id, ...updates }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPlumber(updated);
      }
    } catch {}
    setSaving(false);
  };

  const handleConnectStripe = async () => {
    if (!company?.id || !company?.email) return;
    setSaving(true);
    try {
      const res = await fetch('/api/stripe/create-connect-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: company.id, email: company.email, companyName: company.name, phone: company.phone }),
      });
      const data = await res.json();
      if (data.onboardingUrl) {
        window.open(data.onboardingUrl, '_blank');
      }
    } catch {}
    setSaving(false);
  };

  if (loading) return (
    <div className="p-6 flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return <div className="p-6"><ErrorState title="Failed to load" message={error} onRetry={() => setError(null)} /></div>;
  if (!plumber) return <div className="p-6"><ErrorState title="No profile found" message="Create a profile first" /></div>;

  const bcColor = plumber.primary_color;
  const tierLabel = PLAN_LABELS_PRETTY[plumber.plan_tier] || plumber.plan_tier;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shrink-0"
          style={{ background: `linear-gradient(135deg, ${bcColor}, ${bcColor}aa)` }}>
          {plumber.company_name.split(' ').map(w => w[0]).slice(0, 2).join('')}
        </div>
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{plumber.company_name}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600">{tierLabel}</span>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${plumber.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{plumber.status}</span>
          </div>
        </div>
        <Button size="sm" onClick={() => saveProfile({})} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 pb-0 overflow-x-auto">
        {PROFILE_TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key ? 'text-cyan-600 border-cyan-500' : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-5">
        {activeTab === 'overview' && <OverviewTab plumber={plumber} />}
        {activeTab === 'financial' && (
          <FinancialTab
            plumber={plumber}
            onConnectStripe={handleConnectStripe}
            saving={saving}
          />
        )}
        {activeTab === 'performance' && <PerformanceTab plumber={plumber} />}
        {activeTab === 'compliance' && (
          <ComplianceTab plumber={plumber} onUpdate={saveProfile} />
        )}
        {activeTab === 'receptionist' && <ReceptionistTab plumber={plumber} />}
      </div>
    </div>
  );
}

/* ══════════════════════ OVERVIEW TAB ══════════════════════ */
function OverviewTab({ plumber }: { plumber: PlumberProfile }) {
  return (
    <>
      {/* Service Area */}
      <Card variant="bordered" padding="md">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
          <I.MapPin className="w-4 h-4 text-slate-500" /> Service Area
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {plumber.service_area_zipcodes.map(z => (
            <span key={z} className="inline-flex px-2 py-1 rounded-lg bg-slate-100 text-xs text-slate-700">{z}</span>
          ))}
        </div>
      </Card>

      {/* Specialties */}
      <Card variant="bordered" padding="md">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
          <I.Wrench className="w-4 h-4 text-slate-500" /> Specialties
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {plumber.specialties.map(s => (
            <span key={s} className="inline-flex px-2.5 py-1.5 rounded-xl bg-slate-100 text-xs font-medium text-slate-700">{s}</span>
          ))}
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Jobs Completed" value={String(plumber.total_jobs_completed)} icon={I.Check} />
        <StatCard label="Rating" value={`${plumber.avg_rating}`} icon={I.Star} sub={<span className="text-[10px] text-slate-500">({plumber.total_reviews})</span>} />
        <StatCard label="Response Time" value={`${plumber.response_time_avg}min`} icon={I.Clock} />
        <StatCard label="Acceptance" value={`${plumber.acceptance_rate}%`} icon={I.Upload} />
      </div>
    </>
  );
}

/* ══════════════════════ FINANCIAL TAB ══════════════════════ */
function FinancialTab({ plumber, onConnectStripe, saving }: { plumber: PlumberProfile; onConnectStripe: () => void; saving: boolean }) {
  return (
    <>
      {/* Plan Info */}
      <Card variant="bordered" padding="md">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Plan & Pricing</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-slate-500">Plan Tier</p>
            <p className="text-sm font-semibold text-slate-900 mt-0.5">{PLAN_LABELS_PRETTY[plumber.plan_tier]}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Lead Fee (per job)</p>
            <p className="text-sm font-semibold text-slate-900 mt-0.5">${(plumber.lead_fee_cents / 100).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Monthly Lead Limit</p>
            <p className="text-sm font-semibold text-slate-900 mt-0.5">{plumber.monthly_lead_limit}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Current Month Leads</p>
            <p className="text-sm font-semibold text-slate-900 mt-0.5">{plumber.current_month_leads}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Payout Schedule</p>
            <p className="text-sm font-semibold text-slate-900 mt-0.5 capitalize">{plumber.payout_schedule}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Payout Threshold</p>
            <p className="text-sm font-semibold text-slate-900 mt-0.5">${(plumber.payout_threshold_cents / 100).toFixed(2)}</p>
          </div>
        </div>
      </Card>

      {/* Stripe Connect */}
      <Card variant="bordered" padding="md">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
          <I.Bank className="w-4 h-4 text-slate-500" /> Bank Account (Stripe Connect)
        </h3>
        {plumber.stripe_onboarding_complete ? (
          <div className="flex items-center gap-2 text-sm">
            <I.Check className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-600 font-medium">Connected</span>
            <span className="text-slate-500 text-xs ml-2">Account: {plumber.stripe_connect_account_id}</span>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">Link your bank account to receive weekly payouts via Stripe Connect.</p>
            <Button onClick={onConnectStripe} disabled={saving}>
              {saving ? 'Loading...' : 'Link Bank Account'}
            </Button>
            {plumber.stripe_onboarding_url && (
              <p className="text-xs text-slate-500 mt-1">Already started? <a href={plumber.stripe_onboarding_url} target="_blank" className="text-blue-600 hover:underline">Continue onboarding</a></p>
            )}
          </div>
        )}
      </Card>

      {/* Quick revenue stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card variant="bordered" padding="md">
          <p className="text-xs text-slate-500">This Month Lead Revenue</p>
          <p className="text-xl font-bold text-slate-900 mt-1">${(plumber.current_month_leads * plumber.lead_fee_cents / 100).toLocaleString()}</p>
          <p className="text-[10px] text-slate-600 mt-0.5">{plumber.current_month_leads} leads at ${(plumber.lead_fee_cents / 100).toFixed(2)} each</p>
        </Card>
        <Card variant="bordered" padding="md">
          <p className="text-xs text-slate-500">PlumbCore Processing Fee</p>
          <p className="text-xl font-bold text-amber-600 mt-1">${(plumber.current_month_leads * (4900 - plumber.lead_fee_cents) / 100).toLocaleString()}</p>
          <p className="text-[10px] text-slate-600 mt-0.5">$49 deposit - ${(plumber.lead_fee_cents / 100).toFixed(2)} lead fee</p>
        </Card>
      </div>
    </>
  );
}

/* ══════════════════════ PERFORMANCE TAB ══════════════════════ */
function PerformanceTab({ plumber }: { plumber: PlumberProfile }) {
  const metrics = [
    { label: 'Rating', value: `${plumber.avg_rating}`, max: 5, color: '#F59E0B', pct: (plumber.avg_rating / 5) * 100 },
    { label: 'Acceptance Rate', value: `${plumber.acceptance_rate}%`, max: 100, color: '#10B981', pct: plumber.acceptance_rate },
    { label: 'Response Time', value: `${plumber.response_time_avg} min`, max: 120, color: '#3B82F6', pct: Math.max(0, 100 - (plumber.response_time_avg / 120) * 100) },
    { label: 'Jobs Completed', value: String(plumber.total_jobs_completed), max: 1000, color: '#8B5CF6', pct: Math.min(100, (plumber.total_jobs_completed / 1000) * 100) },
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {metrics.map(m => (
          <Card key={m.label} variant="bordered" padding="md">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-400">{m.label}</p>
              <p className="text-lg font-bold text-slate-900">{m.value}</p>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${m.pct}%`, backgroundColor: m.color }} />
            </div>
          </Card>
        ))}
      </div>

      <Card variant="bordered" padding="md">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Reviews</h3>
        {plumber.total_reviews > 0 ? (
          <div className="space-y-3">
            {/* Star rating display */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(s => (
                  <I.Star key={s} className={`w-5 h-5 ${s <= Math.round(plumber.avg_rating) ? 'text-amber-600 fill-amber-400' : 'text-slate-300'}`} />
                ))}
              </div>
              <span className="text-sm font-semibold text-slate-900">{plumber.avg_rating}</span>
              <span className="text-xs text-slate-500">({plumber.total_reviews} reviews)</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No reviews yet.</p>
        )}
      </Card>
    </>
  );
}

/* ══════════════════════ COMPLIANCE TAB ══════════════════════ */
function ComplianceTab({ plumber, onUpdate }: { plumber: PlumberProfile; onUpdate: (updates: Partial<PlumberProfile>) => void }) {
  const [license, setLicense] = useState(plumber.license_number);
  const [insurance, setInsurance] = useState(plumber.insurance_info);

  const bgCheckColors: Record<BackgroundCheckStatus, { bg: string; text: string }> = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-600' },
    cleared: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    failed: { bg: 'bg-red-50', text: 'text-red-600' },
  };
  const bcCfg = bgCheckColors[plumber.background_check_status];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card variant="bordered" padding="md">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-2">
            <I.Shield className="w-4 h-4 text-slate-500" /> Background Check
          </h3>
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${bcCfg.bg} ${bcCfg.text}`}>
            {plumber.background_check_status.charAt(0).toUpperCase() + plumber.background_check_status.slice(1)}
          </span>
        </Card>
        <Card variant="bordered" padding="md">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">License</h3>
          <p className="text-sm text-slate-700">{plumber.license_number || 'Not provided'}</p>
        </Card>
      </div>

      <Card variant="bordered" padding="md">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Insurance</h3>
        <p className="text-sm text-slate-400">{plumber.insurance_info || 'Not provided'}</p>
      </Card>

      <Card variant="bordered" padding="md">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Update Compliance Info</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">License Number</label>
            <input value={license} onChange={e => setLicense(e.target.value)}
              className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Insurance Info</label>
            <textarea value={insurance} onChange={e => setInsurance(e.target.value)} rows={2}
              className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 resize-none" />
          </div>
          <Button size="sm" onClick={() => onUpdate({ license_number: license, insurance_info: insurance })}>Save Changes</Button>
        </div>
      </Card>
    </>
  );
}

/* ══════════════════════ RECEPTIONIST TAB ══════════════════════ */
function ReceptionistTab({ plumber }: { plumber: PlumberProfile }) {
  const maxHours = PLAN_AI_RECEPTIONIST_HOURS[plumber.plan_tier] || 0;
  const usedHours = 0; // will be populated from real API data
  const remaining = maxHours - usedHours;
  const pct = maxHours > 0 ? (usedHours / maxHours) * 100 : 0;

  return (
    <>
      {/* Usage Card */}
      <Card variant="bordered" padding="md">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 3.75v4.5m0-4.5h-4.5m4.5 0l-6 6m3 12c-8.284 0-15-6.716-15-15V18m9-6.75V15m0 0v.75m0-6.75h.008v.008H12V8.25z" />
          </svg>
          AI Receptionist — {plumber.company_name}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-xs text-slate-500">Plan Allocation</p>
            <p className="text-lg font-bold text-slate-900">{maxHours} hrs/mo</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Used This Month</p>
            <p className="text-lg font-bold text-blue-600">{usedHours}h {pct > 0 ? `(${Math.round(pct)}%)` : ''}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Remaining</p>
            <p className={`text-lg font-bold ${remaining > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {remaining}h
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Status</p>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </span>
          </div>
        </div>
        {/* Usage bar */}
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
      </Card>

      {/* Greeting Preview */}
      <Card variant="bordered" padding="md">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Greeting & Settings</h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-slate-500 mb-1">Greeting Message</p>
            <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600 italic">
              &ldquo;Thank you for calling {plumber.company_name}! I&apos;m your AI receptionist. How can I help you today?&rdquo;
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">Booking Hours</p>
              <p className="text-sm font-medium text-slate-900">8:00 AM — 5:00 PM</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">After Hours</p>
              <p className="text-sm font-medium text-slate-900">Emergency transfers only</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Calls */}
      <Card variant="bordered" padding="md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">Recent Calls</h3>
          <a href="/voice-receptionist" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            View All →
          </a>
        </div>
        <div className="space-y-2">
          {[
            { caller: 'James Wilson', time: '8:32 AM', issue: 'Kitchen sink leak — scheduled', outcome: 'Booked' },
            { caller: 'Sarah Mitchell', time: '9:15 AM', issue: 'Water heater troubleshooting', outcome: 'Resolved' },
            { caller: 'Oak Springs Apts', time: '10:00 AM', issue: 'Multiple toilet leaks — logged', outcome: 'Lead' },
          ].map((call, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
                {call.caller.split(' ').map(w => w[0]).slice(0, 2).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{call.caller}</p>
                <p className="text-xs text-slate-500 truncate">{call.issue}</p>
              </div>
              <span className="text-[10px] text-slate-400">{call.time}</span>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                call.outcome === 'Booked' ? 'bg-emerald-50 text-emerald-700' :
                call.outcome === 'Resolved' ? 'bg-amber-50 text-amber-700' :
                'bg-blue-50 text-blue-700'
              }`}>{call.outcome}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Full Settings Link */}
      <div className="flex justify-center">
        <a href="/voice-receptionist"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Manage AI Receptionist Settings
        </a>
      </div>
    </>
  );
}

/* ══════════════════════ SHARED COMPONENTS ══════════════════════ */
function StatCard({ label, value, icon: Icon, sub }: { label: string; value: string; icon: any; sub?: React.ReactNode }) {
  return (
    <Card variant="bordered" padding="md">
      <div className="flex items-start justify-between mb-1">
        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
          <Icon className="w-4 h-4 text-slate-400" />
        </div>
        {sub && <div>{sub}</div>}
      </div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-bold text-slate-900 mt-0.5">{value}</p>
    </Card>
  );
}
