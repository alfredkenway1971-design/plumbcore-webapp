'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, ErrorState } from '@/pkg/ui-components';
import { PLAN_LABELS_PRETTY, PLAN_LEAD_FEES, PLAN_PRICES } from '@/lib/plan-pricing';
import type { PlumberProfile } from '@/lib/plumber-profiles';

/* ── Icons ── */
const I = {
  Star: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>,
  Dollar: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  Check: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>,
  MapPin: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>,
  Clock: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  Wrench: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.66 5.66a2 2 0 11-2.83-2.83l5.66-5.66M14.83 5.17l-2.83 2.83 5.66 5.66 2.83-2.83M18.36 2.14a2 2 0 112.83 2.83L14.83 11.4l-2.83-2.83 6.36-6.43z"/></svg>,
  ArrowLeft: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/></svg>,
};

export default function AdminPlumberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [plumber, setPlumber] = useState<PlumberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = params?.id as string;
    if (!id) { setLoading(false); setError('No plumber ID'); return; }

    // Fetch company data from admin API
    fetch('/api/admin/data?endpoint=companies')
      .then(r => r.json())
      .then(data => {
        const companies = data.companies || [];
        const match = companies.find((c: any) => c.id === id || c.email === id);
        if (match) {
          setPlumber({
            id: match.id,
            company_id: match.id,
            slug: match.name?.toLowerCase().replace(/\s+/g, '-') || '',
            company_name: match.name,
            logo_url: '',
            primary_color: '#3B82F6',
            plan_tier: match.subscription_tier || 'solo' as any,
            service_area_zipcodes: [],
            specialties: ['Residential Plumbing', 'Water Heaters'],
            stripe_connect_account_id: '',
            stripe_onboarding_complete: false,
            stripe_onboarding_url: '',
            payout_schedule: 'weekly' as any,
            payout_threshold_cents: 0,
            avg_rating: 0,
            total_reviews: 0,
            total_jobs_completed: 0,
            response_time_avg: 0,
            acceptance_rate: 0,
            monthly_lead_limit: 10,
            current_month_leads: 0,
            lead_fee_cents: 4900,
            license_number: '',
            insurance_info: '',
            background_check_status: 'cleared' as any,
            status: match.subscription_tier ? 'active' as any : 'paused' as any,
            created_at: match.created_at,
            updated_at: match.created_at,
          });
        }
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [params?.id]);

  if (loading) return (
    <div className="p-6 flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return <div className="p-6"><ErrorState title="Failed to load" message={error} onRetry={() => setError(null)} /></div>;
  if (!plumber) return <div className="p-6"><ErrorState title="Not found" message="Plumber profile not found" onRetry={() => router.push('/admin/plumbers')} /></div>;

  const monthlyLeadRevenue = plumber.current_month_leads * plumber.lead_fee_cents;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-4xl">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/admin/plumbers')} className="w-8 h-8 rounded-xl bg-white border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-all shadow-sm">
          <I.ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-white shrink-0"
            style={{ background: `linear-gradient(135deg, ${plumber.primary_color}, ${plumber.primary_color}aa)` }}>
            {plumber.company_name.split(' ').map(w => w[0]).slice(0, 2).join('')}
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{plumber.company_name}</h1>
            <p className="text-sm text-muted-foreground">@{plumber.slug}</p>
          </div>
          <span className={`ml-auto inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
            plumber.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
            plumber.status === 'paused' ? 'bg-amber-50 text-amber-600' :
            'bg-red-50 text-red-600'
          }`}>{plumber.status}</span>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card variant="bordered" padding="md">
          <p className="text-xs text-muted-foreground">Plan Tier</p>
          <p className="text-sm font-semibold text-foreground mt-0.5">{PLAN_LABELS_PRETTY[plumber.plan_tier]}</p>
        </Card>
        <Card variant="bordered" padding="md">
          <p className="text-xs text-muted-foreground">Lead Fee</p>
          <p className="text-sm font-semibold text-foreground mt-0.5">${(plumber.lead_fee_cents / 100).toFixed(2)}/job</p>
        </Card>
        <Card variant="bordered" padding="md">
          <p className="text-xs text-muted-foreground">Monthly Leads</p>
          <p className="text-sm font-semibold text-foreground mt-0.5">{plumber.current_month_leads} / {plumber.monthly_lead_limit}</p>
        </Card>
        <Card variant="bordered" padding="md">
          <p className="text-xs text-muted-foreground">Rating</p>
          <div className="flex items-center gap-1 mt-0.5">
            <I.Star className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-foreground">{plumber.avg_rating}</span>
            <span className="text-xs text-muted-foreground ml-1">({plumber.total_reviews} reviews)</span>
          </div>
        </Card>
        <Card variant="bordered" padding="md">
          <p className="text-xs text-muted-foreground">Acceptance Rate</p>
          <p className="text-sm font-semibold text-foreground mt-0.5">{plumber.acceptance_rate}%</p>
        </Card>
        <Card variant="bordered" padding="md">
          <p className="text-xs text-muted-foreground">Response Time</p>
          <p className="text-sm font-semibold text-foreground mt-0.5">{plumber.response_time_avg} min avg</p>
        </Card>
      </div>

      {/* Revenue Card */}
      <Card variant="bordered" padding="md">
        <h3 className="text-sm font-semibold text-foreground mb-3">Revenue Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">SaaS (Monthly)</p>
            <p className="text-lg font-bold text-foreground">{plumber.plan_tier === 'enterprise' ? 'Custom' : `$${(PLAN_PRICES[plumber.plan_tier] / 100).toFixed(0)}`}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Lead Revenue (Mo)</p>
            <p className="text-lg font-bold text-emerald-600">${(monthlyLeadRevenue / 100).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">PlumbCore Fee (Mo)</p>
            <p className="text-lg font-bold text-amber-600">${(plumber.current_month_leads * (49 - plumber.lead_fee_cents / 100)).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Jobs Completed</p>
            <p className="text-lg font-bold text-foreground">{plumber.total_jobs_completed.toLocaleString()}</p>
          </div>
        </div>
      </Card>

      {/* Specialties & Area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card variant="bordered" padding="md">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
            <I.Wrench className="w-4 h-4 text-muted-foreground" /> Specialties
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {plumber.specialties.map((s: any) => (
              <span key={s} className="inline-flex px-2.5 py-1 rounded-lg bg-muted text-xs font-medium text-foreground">{s}</span>
            ))}
          </div>
        </Card>
        <Card variant="bordered" padding="md">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
            <I.MapPin className="w-4 h-4 text-muted-foreground" /> Service Area
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {plumber.service_area_zipcodes.map(z => (
              <span key={z} className="inline-flex px-2.5 py-1 rounded-lg bg-muted text-xs font-medium text-foreground">{z}</span>
            ))}
          </div>
        </Card>
      </div>

      {/* Connect & Compliance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card variant="bordered" padding="md">
          <h3 className="text-sm font-semibold text-foreground mb-2">Stripe Connect</h3>
          {plumber.stripe_onboarding_complete ? (
            <div className="flex items-center gap-2">
              <I.Check className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-emerald-600">Onboarded</span>
              <span className="text-xs text-muted-foreground ml-2">{plumber.stripe_connect_account_id}</span>
            </div>
          ) : (
            <p className="text-sm text-amber-600">Not connected</p>
          )}
        </Card>
        <Card variant="bordered" padding="md">
          <h3 className="text-sm font-semibold text-foreground mb-2">Background Check</h3>
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
            plumber.background_check_status === 'cleared' ? 'bg-emerald-50 text-emerald-600' :
            plumber.background_check_status === 'failed' ? 'bg-red-50 text-red-600' :
            'bg-amber-50 text-amber-600'
          }`}>{plumber.background_check_status}</span>
          {plumber.license_number && (
            <p className="text-xs text-muted-foreground mt-2">License: {plumber.license_number}</p>
          )}
        </Card>
      </div>

      {/* Admin Actions */}
      <Card variant="bordered" padding="md">
        <h3 className="text-sm font-semibold text-foreground mb-3">Admin Actions</h3>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={() => router.push('/admin/payouts')}>View Payouts →</Button>
          <Button size="sm" variant="secondary" onClick={() => router.push(`/admin/leads?plumber=${plumber.id}`)}>View Leads →</Button>
        </div>
      </Card>
    </div>
  );
}
