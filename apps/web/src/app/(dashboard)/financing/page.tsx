'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Card,
  Input,
  Modal,
  EmptyState,
} from '@/pkg/ui-components';
import {
  DollarSign,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Settings,
  FileText,
  ChevronDown,
  ChevronUp,
  Building2,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { canAccess } from '@/lib/feature-gates';
import type { PlanTier } from '@/lib/feature-gates';
import type { FinancingApplicationDb, FinancingStatus, FinancingProvider } from '@/lib/supabase';
import {
  DEFAULT_FINANCING_SETTINGS,
} from '@/lib/financingDb';
import type { FinancingSettings } from '@/lib/financingDb';

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

interface RevenueSummary {
  totalFinanced: number;
  totalApproved: number;
  activeFinancing: number;
  paidOff: number;
  pendingCount: number;
  avgMonthlyPayment: number;
}

/* ═══════════════════════════════════════════
   STATUS CONFIG
   ═══════════════════════════════════════════ */

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  draft: { label: 'Draft', color: 'text-muted-foreground', bg: 'bg-muted', icon: FileText },
  pending: { label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
  approved: { label: 'Approved', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle },
  declined: { label: 'Declined', color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
  active: { label: 'Active', color: 'text-primary', bg: 'bg-blue-tint', icon: CreditCard },
  paid_off: { label: 'Paid Off', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-muted-foreground', bg: 'bg-muted', icon: XCircle },
};

const providerLabels: Record<FinancingProvider, string> = {
  affirm: 'Affirm',
  sunbit: 'Sunbit',
  klarna: 'Klarna',
  other: 'Other',
};

/* ═══════════════════════════════════════════
   STAT CARD
   ═══════════════════════════════════════════ */

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: any;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <Card padding="md" className="flex items-start gap-4">
      <div className={`shrink-0 w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="mt-0.5 text-xl font-bold text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground/80 mt-0.5">{sub}</p>}
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════
   FINANCING APPLICATION ROW
   ═══════════════════════════════════════════ */

function ApplicationRow({ app, onStatusChange }: {
  app: FinancingApplicationDb;
  onStatusChange: (id: string, status: FinancingStatus) => void;
}) {
  const StatIcon = statusConfig[app.status]?.icon || FileText;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="ring-1 ring-black/5 rounded-xl bg-white overflow-hidden transition-all hover:border-gray-300">
      {/* Summary row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-4 py-3.5 text-left"
      >
        <div className={`shrink-0 w-8 h-8 rounded-xl ${statusConfig[app.status]?.bg || 'bg-muted'} flex items-center justify-center`}>
          <StatIcon className={`w-4 h-4 ${statusConfig[app.status]?.color || 'text-muted-foreground'}`} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{app.customer_name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {providerLabels[app.provider] || app.provider} &middot; {app.terms_months} mo
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-foreground">${(app.approved_amount || app.amount).toLocaleString()}</p>
          {app.monthly_payment && (
            <p className="text-xs text-muted-foreground">${app.monthly_payment.toFixed(2)}/mo</p>
          )}
        </div>

        <span className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[app.status]?.bg || 'bg-muted'} ${statusConfig[app.status]?.color || 'text-muted-foreground'}`}>
          {statusConfig[app.status]?.label || app.status}
        </span>

        <div className="shrink-0 text-muted-foreground/80">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-border/50 px-4 py-3 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm text-foreground truncate">{app.customer_email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-sm text-foreground">{app.customer_phone || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Amount Financed</p>
              <p className="text-sm font-medium text-foreground">${(app.approved_amount || app.amount).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">APR</p>
              <p className="text-sm font-medium text-foreground">{app.apr ? `${app.apr}%` : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Monthly Payment</p>
              <p className="text-sm font-medium text-foreground">${app.monthly_payment?.toFixed(2) || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Terms</p>
              <p className="text-sm text-foreground">{app.terms_months} months</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Invoice</p>
              <p className="text-sm text-foreground">{app.invoice_id || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Applied</p>
              <p className="text-sm text-foreground">{new Date(app.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {app.notes && (
            <div>
              <p className="text-xs text-muted-foreground">Notes</p>
              <p className="text-sm text-foreground">{app.notes}</p>
            </div>
          )}

          {/* Action buttons for pending applications */}
          {app.status === 'pending' && (
            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <Button
                size="sm"
                variant="primary"
                onClick={() => onStatusChange(app.id, 'approved')}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onStatusChange(app.id, 'declined')}
              >
                <XCircle className="w-3.5 h-3.5" />
                Decline
              </Button>
            </div>
          )}

          {app.status === 'approved' && (
            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <Button
                size="sm"
                variant="primary"
                onClick={() => onStatusChange(app.id, 'active')}
              >
                <CreditCard className="w-3.5 h-3.5" />
                Mark Active
              </Button>
            </div>
          )}

          {app.status === 'active' && (
            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <Button
                size="sm"
                variant="primary"
                onClick={() => onStatusChange(app.id, 'paid_off')}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Mark Paid Off
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SIMULATION / APPLICATION FORM
   ═══════════════════════════════════════════ */

function FinancingFormModal({ open, onClose, onCreated }: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [step, setStep] = useState<'form' | 'simulating' | 'result' | 'submitting'>('form');
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    invoiceId: '',
    jobId: '',
    amount: '1000',
    termsMonths: '12',
  });
  const [decision, setDecision] = useState<any>(null);
  const [error, setError] = useState('');
  const [createdApp, setCreatedApp] = useState<any>(null);

  const reset = useCallback(() => {
    setStep('form');
    setForm({ customerName: '', customerEmail: '', customerPhone: '', invoiceId: '', jobId: '', amount: '1000', termsMonths: '12' });
    setDecision(null);
    setError('');
    setCreatedApp(null);
  }, []);

  const handleSimulate = async () => {
    const amount = parseFloat(form.amount);
    if (!amount || amount < 500) {
      setError('Minimum financing amount is $500');
      return;
    }
    if (!form.customerName.trim() || !form.customerEmail.trim()) {
      setError('Customer name and email are required');
      return;
    }

    setError('');
    setStep('simulating');

    try {
      const res = await fetch('/api/financing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'simulate',
          amount,
          termsMonths: parseInt(form.termsMonths),
          customerName: form.customerName,
        }),
      });
      const data = await res.json();
      setDecision(data);
      setStep('result');
    } catch {
      setError('Failed to simulate. Please try again.');
      setStep('form');
    }
  };

  const handleSubmitApplication = async () => {
    setStep('submitting');
    try {
      const res = await fetch('/api/financing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply',
          invoice_id: form.invoiceId,
          job_id: form.jobId,
          customer_id: `CUST-${Date.now()}`,
          customer_name: form.customerName,
          customer_email: form.customerEmail,
          customer_phone: form.customerPhone,
          amount: parseFloat(form.amount),
          provider: 'affirm',
          terms_months: parseInt(form.termsMonths),
          approved_amount: decision?.approved ? decision.approvedAmount : undefined,
          monthly_payment: decision?.monthlyPayment,
          apr: decision?.apr,
          status: decision?.approved ? 'approved' : 'declined',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreatedApp(data);
        onCreated();
      } else {
        setError(data.error || 'Failed to submit');
        setStep('result');
      }
    } catch {
      setError('Failed to submit application');
      setStep('result');
    }
  };

  const monthlyDisplay = form.amount && parseInt(form.termsMonths)
    ? `~$${(parseFloat(form.amount) / parseInt(form.termsMonths)).toFixed(0)}/mo (est.)`
    : '';

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose(); }}
      title="Customer Financing Application"
      description={step === 'result' && decision ? 'Application result' : 'Enter customer details to simulate financing'}
      size="md"
    >
      {step === 'form' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Customer Name"
              placeholder="e.g. John Smith"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            />
            <Input
              label="Customer Email"
              type="email"
              placeholder="john@email.com"
              value={form.customerEmail}
              onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
            />
          </div>
          <Input
            label="Customer Phone (optional)"
            placeholder="(555) 000-0000"
            value={form.customerPhone}
            onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Invoice ID"
              placeholder="e.g. INV-001"
              value={form.invoiceId}
              onChange={(e) => setForm({ ...form, invoiceId: e.target.value })}
            />
            <Input
              label="Job ID (optional)"
              placeholder="e.g. JOB-001"
              value={form.jobId}
              onChange={(e) => setForm({ ...form, jobId: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Amount to Finance"
              type="number"
              min="500"
              placeholder="1000"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              hint="Minimum $500"
            />
            <Input
              label="Terms (months)"
              type="number"
              min="3"
              max="60"
              placeholder="12"
              value={form.termsMonths}
              onChange={(e) => setForm({ ...form, termsMonths: e.target.value })}
              hint={monthlyDisplay}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => { reset(); onClose(); }}>Cancel</Button>
            <Button variant="primary" onClick={handleSimulate}>
              Check Eligibility
            </Button>
          </div>
        </div>
      )}

      {step === 'simulating' && (
        <div className="flex flex-col items-center justify-center py-8">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-sm text-muted-foreground">Evaluating application...</p>
        </div>
      )}

      {step === 'result' && decision && createdApp && (
        <div className="space-y-4">
          {decision.approved ? (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-800">Approved!</p>
                <p className="text-sm text-emerald-700 mt-1">
                  ${decision.approvedAmount?.toLocaleString()} at {decision.apr}% APR
                </p>
                <p className="text-sm font-medium text-emerald-700 mt-0.5">
                  ${decision.monthlyPayment?.toFixed(2)}/mo for {decision.termsMonths} months
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
              <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Declined</p>
                <p className="text-sm text-red-700 mt-1">{decision.reason || 'Unable to approve at this time.'}</p>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-muted rounded-xl">
            <div>
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="text-sm font-medium">${parseFloat(form.amount).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">APR</p>
              <p className="text-sm font-medium">{decision.apr ? `${decision.apr}%` : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Monthly</p>
              <p className="text-sm font-medium">{decision.monthlyPayment ? `$${decision.monthlyPayment.toFixed(2)}` : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Terms</p>
              <p className="text-sm font-medium">{decision.termsMonths} mo</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-tint text-primary/90 text-sm">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Application {createdApp.id} created — status: {statusConfig[createdApp.status]?.label}</span>
          </div>

          <div className="flex justify-end pt-2 border-t border-border/50">
            <Button variant="primary" onClick={() => { reset(); onClose(); }}>Done</Button>
          </div>
        </div>
      )}

      {step === 'result' && decision && !createdApp && (
        <div className="space-y-4">
          {decision.approved ? (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-800">Approved!</p>
                <p className="text-sm text-emerald-700 mt-1">
                  ${decision.approvedAmount?.toLocaleString()} at {decision.apr}% APR
                </p>
                <p className="text-sm font-medium text-emerald-700 mt-0.5">
                  ${decision.monthlyPayment?.toFixed(2)}/mo for {decision.termsMonths} months
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
              <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Declined</p>
                <p className="text-sm text-red-700 mt-1">{decision.reason || 'Unable to approve at this time.'}</p>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-muted rounded-xl">
            <div>
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="text-sm font-medium">${parseFloat(form.amount).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">APR</p>
              <p className="text-sm font-medium">{decision.apr ? `${decision.apr}%` : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Monthly</p>
              <p className="text-sm font-medium">{decision.monthlyPayment ? `$${decision.monthlyPayment.toFixed(2)}` : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Terms</p>
              <p className="text-sm font-medium">{decision.termsMonths} mo</p>
            </div>
          </div>

          {decision.approved && !createdApp && (
            <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
              <Button variant="ghost" onClick={() => { reset(); onClose(); }}>Cancel</Button>
              <Button variant="primary" onClick={handleSubmitApplication}>
                Submit Application
              </Button>
            </div>
          )}

          {!decision.approved && (
            <div className="flex justify-end pt-2 border-t border-border/50">
              <Button variant="ghost" onClick={() => { reset(); onClose(); }}>Close</Button>
            </div>
          )}
        </div>
      )}

      {step === 'submitting' && (
        <div className="flex flex-col items-center justify-center py-8">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-sm text-muted-foreground">Submitting application...</p>
        </div>
      )}
    </Modal>
  );
}

/* ═══════════════════════════════════════════
   SETTINGS MODAL
   ═══════════════════════════════════════════ */

function FinancingSettingsModal({ open, onClose, settings, onSave }: {
  open: boolean;
  onClose: () => void;
  settings: FinancingSettings;
  onSave: (s: FinancingSettings) => void;
}) {
  const [local, setLocal] = useState<FinancingSettings>(settings);

  useEffect(() => {
    setLocal(settings);
  }, [settings]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Financing Settings"
      description="Configure customer financing options"
      size="sm"
    >
      <div className="space-y-4">
        {/* Toggle */}
        <label className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Enable Financing</p>
            <p className="text-xs text-muted-foreground">Allow customers to finance jobs over ${local.minJobAmount}</p>
          </div>
          <button
            onClick={() => setLocal({ ...local, enabled: !local.enabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              local.enabled ? 'bg-blue-tint0' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              local.enabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </label>

        <Input
          label="Minimum Job Amount"
          type="number"
          min="100"
          value={String(local.minJobAmount)}
          onChange={(e) => setLocal({ ...local, minJobAmount: parseInt(e.target.value) || 500 })}
          hint="Jobs below this amount won't show financing options"
        />

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Provider</label>
          <select
            className="w-full rounded-xl ring-1 ring-border bg-white px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            value={local.provider}
            onChange={(e) => setLocal({ ...local, provider: e.target.value as FinancingProvider })}
          >
            <option value="affirm">Affirm</option>
            <option value="sunbit">Sunbit</option>
            <option value="klarna">Klarna</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Default Terms (months)"
            type="number"
            min="3"
            max="60"
            value={String(local.defaultTermsMonths)}
            onChange={(e) => setLocal({ ...local, defaultTermsMonths: parseInt(e.target.value) || 12 })}
          />
          <Input
            label="Default APR (%)"
            type="number"
            step="0.01"
            min="0"
            max="36"
            value={String(local.defaultApr)}
            onChange={(e) => setLocal({ ...local, defaultApr: parseFloat(e.target.value) || 9.99 })}
            hint="Annual Percentage Rate"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => { onSave(local); onClose(); }}>Save Settings</Button>
        </div>
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function FinancingPage() {
  const company = useAuthStore((s) => s.company);
  const tier = (company?.subscription_tier || '') as PlanTier;
  const hasAccess = canAccess(tier, 'customerFinancing');

  const [apps, setApps] = useState<FinancingApplicationDb[]>([]);
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<FinancingSettings>(DEFAULT_FINANCING_SETTINGS);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [appsRes, summaryRes] = await Promise.all([
        fetch('/api/financing'),
        fetch('/api/financing?summary=true'),
      ]);
      if (appsRes.ok) setApps(await appsRes.json());
      if (summaryRes.ok) setSummary(await summaryRes.json());
    } catch {
      setError('Failed to load financing data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Seed demo data on first load
  useEffect(() => {
    async function init() {
      await fetch('/api/financing?seed=true');
      await loadData();
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = async (id: string, status: FinancingStatus) => {
    const res = await fetch('/api/financing', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      loadData();
    }
  };

  const handleSaveSettings = (newSettings: FinancingSettings) => {
    setSettings(newSettings);
    // In production, persist to company settings in DB
    localStorage.setItem('plumbcore-financing-settings', JSON.stringify(newSettings));
  };

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('plumbcore-financing-settings');
      if (saved) {
        setSettings({ ...DEFAULT_FINANCING_SETTINGS, ...JSON.parse(saved) });
      }
    } catch {}
  }, []);

  if (!hasAccess) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <EmptyState
          icon={<TrendingUp className="w-7 h-7 text-muted-foreground/80" />}
          title="Customer Financing"
          description="Customer financing is available on Business and Enterprise plans. Upgrade to offer your customers flexible payment options."
          action={
            <Button variant="primary" onClick={() => window.location.href = '/settings'}>
              Upgrade Plan
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Customer Financing</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Offer your customers flexible payment options through financing partners
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            icon={<Settings className="w-4 h-4" />}
            onClick={() => setShowSettings(true)}
          >
            Settings
          </Button>
          <Button
            variant="primary"
            icon={<DollarSign className="w-4 h-4" />}
            onClick={() => setShowForm(true)}
          >
            New Application
          </Button>
        </div>
      </div>

      {/* Financing status banner */}
      {!settings.enabled && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Financing is currently disabled</p>
            <p className="text-xs text-amber-700 mt-1">
              Customers won&apos;t see financing options on invoices. Enable it in Settings to start offering financing.
            </p>
            <Button
              size="sm"
              variant="secondary"
              className="mt-2"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-3.5 h-3.5" />
              Open Settings
            </Button>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            icon={DollarSign}
            label="Total Approved"
            value={`$${summary.totalApproved.toLocaleString()}`}
            sub={`Out of $${summary.totalFinanced.toLocaleString()} total`}
            color="bg-blue-tint0"
          />
          <StatCard
            icon={CreditCard}
            label="Active Plans"
            value={String(summary.activeFinancing)}
            sub={`Avg $${summary.avgMonthlyPayment.toFixed(0)}/mo`}
            color="bg-emerald-500"
          />
          <StatCard
            icon={CheckCircle}
            label="Paid Off"
            value={String(summary.paidOff)}
            color="bg-green-500"
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={String(summary.pendingCount)}
            color="bg-amber-500"
          />
          <StatCard
            icon={Building2}
            label="Total Jobs Financed"
            value={String(summary.activeFinancing + summary.paidOff)}
            sub={`${summary.activeFinancing} active`}
            color="bg-purple-500"
          />
        </div>
      )}

      {/* Applications list */}
      <Card padding="none">
        <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Financing Applications</h2>
          <span className="text-xs text-muted-foreground">{apps.length} total</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 text-muted-foreground/80 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6">
            <EmptyState
              icon={<AlertTriangle className="w-7 h-7 text-red-400" />}
              title="Error loading data"
              description={error}
              action={
                <Button variant="secondary" onClick={loadData}>
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </Button>
              }
            />
          </div>
        ) : apps.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<DollarSign className="w-7 h-7 text-muted-foreground/80" />}
              title="No financing applications yet"
              description="When customers choose to finance their invoices, their applications will appear here."
              action={
                <Button variant="primary" onClick={() => setShowForm(true)}>
                  Create Application
                </Button>
              }
            />
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {apps.map((app) => (
              <ApplicationRow
                key={app.id}
                app={app}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Info section */}
      <Card padding="md" className="bg-muted border-border/50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-tint flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">How Financing Works</p>
            <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm">
              <li>Customer receives an invoice over ${settings.minJobAmount}</li>
              <li>They choose &quot;Finance from $49/mo&quot; on the invoice</li>
              <li>A financing application is submitted for approval</li>
              <li>If approved: customer pays monthly, you get paid upfront</li>
              <li>If declined: customer can pay in full or split into 2 payments</li>
            </ol>
          </div>
        </div>
      </Card>

      {/* Modals */}
      <FinancingFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onCreated={loadData}
      />
      <FinancingSettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
