'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Button,
  Card,
  Input,
  Avatar,
  EmptyState,
  ErrorState,
  Modal,
} from '@/pkg/ui-components';
import { teamMembers, getStats } from '@/lib/mock-data';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { PLAN_LABELS, PLAN_PRICES, PLAN_FEATURES } from '@/lib/plan-pricing';
import { STRIPE_PRICE_IDS } from '@/lib/feature-gates';

/* ── Types ── */
type Tab = 'profile' | 'company' | 'team' | 'notifications' | 'billing';

interface CompanyData {
  name: string;
  email: string;
  phone: string;
  website: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  logo_url?: string;
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

interface NotificationPreference {
  label: string;
  description: string;
  channels: { id: string; label: string }[];
  enabled: Record<string, boolean>;
}

interface InvoiceRecord {
  id: string;
  date: string;
  amount: number;
  status: string;
  client: string;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'company', label: 'Company' },
  { id: 'team', label: 'Team' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'billing', label: 'Billing' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_HOURS: BusinessHours = {
  Monday: { open: true, openTime: '08:00', closeTime: '17:00' },
  Tuesday: { open: true, openTime: '08:00', closeTime: '17:00' },
  Wednesday: { open: true, openTime: '08:00', closeTime: '17:00' },
  Thursday: { open: true, openTime: '08:00', closeTime: '17:00' },
  Friday: { open: true, openTime: '08:00', closeTime: '17:00' },
  Saturday: { open: true, openTime: '09:00', closeTime: '14:00' },
  Sunday: { open: false, openTime: '09:00', closeTime: '14:00' },
};

const COMPANY_DATA: CompanyData = {
  name: 'PlumbCore AI Plumbing Services',
  street: '4200 Plumbline Blvd',
  city: 'Austin',
  state: 'TX',
  zip: '73301',
  phone: '(512) 555-0142',
  email: 'hello@plumbcore.ai',
  website: 'https://plumbcore.ai',
};

const PRICING_DEFAULTS: PricingSettings = {
  hourlyRate: '85',
  serviceFee: '15',
  taxRate: '8.25',
  partsMarkup: '30',
};

const NOTIFICATION_TYPES: NotificationPreference[] = [
  {
    label: 'New Job Assignment',
    description: 'Notify when a job is assigned to a team member',
    channels: [
      { id: 'email', label: 'Email' },
      { id: 'sms', label: 'SMS' },
    ],
    enabled: { email: true, sms: true },
  },
  {
    label: 'Job Status Changed',
    description: 'Notify when a job status changes (in-progress, completed, etc.)',
    channels: [{ id: 'email', label: 'Email' }],
    enabled: { email: true },
  },
  {
    label: 'Invoice Paid',
    description: 'Notify when an invoice is marked as paid',
    channels: [{ id: 'email', label: 'Email' }],
    enabled: { email: true },
  },
  {
    label: 'Low Stock Alert',
    description: 'Alert when inventory items fall below minimum quantity',
    channels: [
      { id: 'email', label: 'Email' },
      { id: 'in-app', label: 'In-App' },
    ],
    enabled: { email: true, 'in-app': true },
  },
  {
    label: 'Daily Summary',
    description: 'Receive a daily summary of completed jobs and revenue',
    channels: [{ id: 'email', label: 'Email' }],
    enabled: { email: true },
  },
  {
    label: 'Weekly Report',
    description: 'Receive a weekly performance report via email',
    channels: [{ id: 'email', label: 'Email' }],
    enabled: { email: true },
  },
];

const SUBSCRIPTION_PLANS = [
  { id: 'solo', name: 'Solo', price: 349, features: ['Up to 2 technicians', 'Basic scheduling', 'Invoice management', 'Email support'] },
  { id: 'pro', name: 'Pro', price: 799, features: ['Up to 10 technicians', 'Advanced scheduling', 'Inventory tracking', 'Reports & analytics', 'Priority support'] },
  { id: 'business', name: 'Business', price: 1499, features: ['Unlimited technicians', 'Everything in Pro', 'API access', 'Dedicated account manager', 'Custom integrations'] },
  { id: 'enterprise', name: 'Enterprise', price: 0, features: ['Everything in Business', 'Predictive maintenance', 'White-label portal', 'Dedicated manager', 'Custom integrations'] },
];

const BILLING_HISTORY: InvoiceRecord[] = [
  { id: 'INV-B-001', date: '2025-06-01', amount: 129, status: 'paid', client: 'PlumbCore AI' },
  { id: 'INV-B-002', date: '2025-05-01', amount: 129, status: 'paid', client: 'PlumbCore AI' },
  { id: 'INV-B-003', date: '2025-04-01', amount: 129, status: 'paid', client: 'PlumbCore AI' },
  { id: 'INV-B-004', date: '2025-03-01', amount: 129, status: 'paid', client: 'PlumbCore AI' },
  { id: 'INV-B-005', date: '2025-02-01', amount: 129, status: 'paid', client: 'PlumbCore AI' },
  { id: 'INV-B-006', date: '2025-01-01', amount: 129, status: 'paid', client: 'PlumbCore AI' },
  { id: 'INV-B-007', date: '2024-12-01', amount: 79, status: 'paid', client: 'PlumbCore AI' },
  { id: 'INV-B-008', date: '2024-11-01', amount: 79, status: 'paid', client: 'PlumbCore AI' },
  { id: 'INV-B-009', date: '2024-10-01', amount: 79, status: 'paid', client: 'PlumbCore AI' },
  { id: 'INV-B-010', date: '2024-09-01', amount: 79, status: 'paid', client: 'PlumbCore AI' },
];

/* ── Role Badge Component ── */
function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { label: string; bg: string; text: string; border: string }> = {
    admin: { label: 'Admin', bg: 'bg-blue-tint', text: 'text-primary', border: 'border-electric/20' },
    dispatcher: { label: 'Dispatcher', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-status-warning/20' },
    'lead-tech': { label: 'Lead Tech', bg: 'bg-green-50', text: 'text-green-600', border: 'border-status-success/20' },
    'senior-tech': { label: 'Senior Tech', bg: 'bg-green-50', text: 'text-green-600', border: 'border-status-success/20' },
    tech: { label: 'Tech', bg: 'bg-white/5', text: 'text-muted-foreground/80', border: 'border-white/10' },
  };
  const c = config[role] || { label: role, bg: 'bg-white/5', text: 'text-muted-foreground/80', border: 'border-white/10' };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${c.bg} ${c.text} ${c.border}`}>
      {c.label}
    </span>
  );
}

/* ── Status Badge for active/inactive ── */
function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
        active
          ? 'bg-green-50 text-green-600 border border-status-success/20'
          : 'bg-muted/10 text-muted-foreground border border-border/20'
      }`}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

/* ── Toggle Switch ── */
function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-electric/40 ${
        enabled ? 'bg-primary' : 'bg-muted'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

/* ── Skeleton ── */
function SkeletonTeamRow() {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3 animate-pulse">
      <div className="h-7 w-7 rounded-full bg-white/5" />
      <div className="h-4 w-36 rounded bg-white/5" />
      <div className="h-4 w-44 rounded bg-white/5" />
      <div className="h-4 w-16 rounded bg-white/5" />
      <div className="h-4 w-14 rounded bg-white/5" />
      <div className="h-4 w-16 rounded bg-white/5" />
    </div>
  );
}

function SkeletonSettingsForm() {
  return (
    <div className="animate-pulse space-y-4 rounded-xl ring-1 ring-black/5 bg-white p-5">
      <div className="h-4 w-1/3 rounded bg-white/5" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-10 w-full rounded-xl bg-white/5" />
      ))}
      <div className="h-10 w-32 rounded-xl bg-white/5" />
    </div>
  );
}

/* ── Profile Tab Component ── */
function ProfileTab() {
  const { profile, updateProfile } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(profile?.avatar_url);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAvatarUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile({ full_name: fullName, avatar_url: avatarUrl || '' });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // swallow
    } finally {
      setSaving(false);
    }
  };

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : profile?.email?.slice(0, 2).toUpperCase() || '?';

  return (
    <div className="space-y-6 max-w-2xl">
      <Card variant="default" padding="lg">
        <h2 className="mb-5 text-base font-semibold text-foreground">Profile Picture</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="h-20 w-20 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary border-2 border-border">
                {initials}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button size="sm" onClick={() => fileInputRef.current?.click()}>
              {avatarUrl ? 'Change Photo' : 'Upload Photo'}
            </Button>
            {avatarUrl && avatarUrl !== profile?.avatar_url && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAvatarUrl(profile?.avatar_url)}
              >
                <span className="text-red-600">Remove</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card variant="default" padding="lg">
        <h2 className="mb-5 text-base font-semibold text-foreground">Personal Information</h2>
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            value={profile?.email || ''}
            disabled
          />
        </div>
      </Card>

      <div className="flex items-center justify-end gap-3 pt-2">
        {saved && (
          <span className="text-sm text-green-600 animate-pulse">Profile saved!</span>
        )}
        <Button onClick={handleSave} loading={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('company');

  // Company form state — initialize from Zustand store to preserve persisted data (logo, etc.)
  const [company, setCompany] = useState<CompanyData>(() => {
    const state = useAuthStore.getState();
    if (state.company?.name) {
      return {
        name: state.company.name || COMPANY_DATA.name,
        email: state.company.email || COMPANY_DATA.email,
        phone: state.company.phone || COMPANY_DATA.phone,
        website: COMPANY_DATA.website,
        street: state.company.address || COMPANY_DATA.street,
        city: state.company.city || COMPANY_DATA.city,
        state: state.company.state || COMPANY_DATA.state,
        zip: state.company.zip || COMPANY_DATA.zip,
        logo_url: state.company.logo_url || undefined,
      };
    }
    return { ...COMPANY_DATA };
  });
  const [hours, setHours] = useState<BusinessHours>(JSON.parse(JSON.stringify(DEFAULT_HOURS)));
  const [pricing, setPricing] = useState<PricingSettings>({ ...PRICING_DEFAULTS });
  const [savingCompany, setSavingCompany] = useState(false);
  const [companySaved, setCompanySaved] = useState(false);

  // Load company data from Zustand store (persisted) on mount — fallback if lazy hydration hasn't completed
  useEffect(() => {
    const state = useAuthStore.getState();
    if (state.company?.name) {
      setCompany(prev => ({
        ...prev,
        name: state.company?.name || prev.name,
        email: state.company?.email || prev.email,
        phone: state.company?.phone || prev.phone,
        street: state.company?.address || prev.street,
        city: state.company?.city || prev.city,
        state: state.company?.state || prev.state,
        zip: state.company?.zip || prev.zip,
        logo_url: state.company?.logo_url || prev.logo_url,
      }));
    }
  }, []);

  // Notification state
  const [notifications, setNotifications] = useState<NotificationPreference[]>(
    NOTIFICATION_TYPES.map((n) => ({ ...n, enabled: { ...n.enabled } }))
  );
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [notifsSaved, setNotifsSaved] = useState(false);

  // Invite modal
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'tech' });

  // Edit team member modal
  const [editMember, setEditMember] = useState<{ id: string; name: string; email: string; role: string } | null>(null);

  // Change plan modal
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(() => {
    const state = useAuthStore.getState();
    return state.company?.subscription_tier || 'pro';
  });

  // Members state (local for editing/removing)
  const [members, setMembers] = useState([...teamMembers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        getStats();
        setLoading(false);
      } catch {
        setError('Failed to load settings data.');
        setLoading(false);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      try {
        getStats();
        setLoading(false);
      } catch {
        setError('Failed to load settings data.');
        setLoading(false);
      }
    }, 1000);
  };

  /* ── Company save handler ── */
  const handleSaveCompany = async () => {
    setSavingCompany(true);
    setCompanySaved(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${useAuthStore.getState().token}` },
        body: JSON.stringify({
          name: company.name,
          email: company.email,
          phone: company.phone,
          logo_url: company.logo_url || '',
          address: company.street,
          city: company.city,
          state: company.state,
          zip: company.zip,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      // Persist company data to Zustand store
      useAuthStore.getState().updateCompany({
        name: company.name,
        email: company.email,
        phone: company.phone,
        logo_url: company.logo_url || '',
        address: company.street,
        city: company.city,
        state: company.state,
        zip: company.zip,
      });
      setCompanySaved(true);
      setTimeout(() => setCompanySaved(false), 3000);
    } catch (err: any) {
      console.error('Company save error:', err);
    } finally {
      setSavingCompany(false);
    }
  };

  const handleResetDefaults = () => {
    setCompany({ ...COMPANY_DATA });
    setHours(JSON.parse(JSON.stringify(DEFAULT_HOURS)));
    setPricing({ ...PRICING_DEFAULTS });
  };

  /* ── Notifications save handler ── */
  const handleSaveNotifications = async () => {
    setSavingNotifs(true);
    setNotifsSaved(false);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setNotifsSaved(true);
      setTimeout(() => setNotifsSaved(false), 3000);
    } catch {
      // swallow
    } finally {
      setSavingNotifs(false);
    }
  };

  const toggleNotification = (index: number, channelId: string) => {
    setNotifications((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], enabled: { ...next[index].enabled, [channelId]: !next[index].enabled[channelId] } };
      return next;
    });
  };

  /* ── Invite handler (background send) ── */
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const handleSendInvitation = async () => {
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) return;
    setInviteSending(true);
    setInviteError(null);
    setInviteSuccess(null);
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${useAuthStore.getState().token}` },
        body: JSON.stringify({ name: inviteForm.name, email: inviteForm.email, role: inviteForm.role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send invitation');
      // Add member to local state optimistically
      const newMember = {
        id: `TEMP-${Date.now()}`,
        name: inviteForm.name,
        email: inviteForm.email,
        phone: '',
        role: inviteForm.role as 'tech' | 'senior-tech' | 'lead-tech' | 'dispatcher' | 'admin',
        status: 'offline' as const,
        activeJobs: 0,
        completedToday: 0,
        rating: 0,
        specialties: [],
        joinedAt: new Date().toISOString().split('T')[0],
      };
      setMembers((prev) => [...prev, newMember]);
      setInviteOpen(false);
      setInviteForm({ name: '', email: '', role: 'tech' });
      setInviteSuccess(`Invitation sent to ${inviteForm.email}`);
      setTimeout(() => setInviteSuccess(null), 5000);
    } catch (err: any) {
      console.error('Invite failed:', err);
      setInviteError(err.message || 'Failed to send invitation');
    } finally {
      setInviteSending(false);
    }
  };

  /* ── Edit team member ── */
  const handleEditMember = (id: string) => {
    const member = members.find((m) => m.id === id);
    if (member) {
      setEditMember({ id: member.id, name: member.name, email: member.email, role: member.role });
    }
  };

  const handleSaveEditMember = () => {
    if (!editMember) return;
    setMembers((prev) =>
      prev.map((m) =>
        m.id === editMember.id
          ? { ...m, name: editMember.name, email: editMember.email, role: editMember.role as typeof m.role }
          : m
      )
    );
    setEditMember(null);
  };

  const handleRemoveMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  /* ── Status dot color ── */
  const statusColor: Record<string, string> = {
    online: 'bg-green-500',
    busy: 'bg-amber-500',
    away: 'bg-muted-light',
    offline: 'bg-muted',
  };

  const statusLabel: Record<string, string> = {
    online: 'Online',
    busy: 'Busy',
    away: 'Away',
    offline: 'Offline',
  };

  /* ── Render ── */

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <Card variant="bordered" padding="lg">
          <ErrorState
            title="Failed to load settings"
            message={error}
            onRetry={handleRetry}
          />
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <div className="flex gap-1 animate-pulse">
          {TABS.map((t) => (
            <div key={t.id} className="h-9 w-24 rounded-xl bg-white/5" />
          ))}
        </div>
        <SkeletonSettingsForm />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-electric text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Profile Tab ── */}
      {activeTab === 'profile' && <ProfileTab />}

      {/* ── Company Tab ── */}
      {activeTab === 'company' && (
        <div className="space-y-6 max-w-2xl">
          {/* Company Information */}
          <Card variant="default" padding="lg">
            <h2 className="mb-5 text-base font-semibold text-foreground">Company Information</h2>
            <div className="space-y-4">
              {/* Logo Upload */}
              <div className="flex items-center gap-5 pb-4 border-b border-border/50">
                <div className="relative shrink-0">
                  {company.logo_url ? (
                    <img src={company.logo_url} alt="Company logo" className="w-20 h-20 rounded-xl object-cover border-2 border-border" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-bright to-primary/80 flex items-center justify-center text-xl font-bold text-white border-2 border-border">
                      {company.name.charAt(0) || 'P'}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        // Try Supabase Storage upload first
                        try {
                          const fileExt = file.name.split('.').pop();
                          const fileName = `logo-${Date.now()}.${fileExt}`;
                          const { data: uploadData, error: uploadError } = await supabase.storage
                            .from('company-logos')
                            .upload(fileName, file, { upsert: true });
                          if (!uploadError && uploadData) {
                            const { data: urlData } = supabase.storage
                              .from('company-logos')
                              .getPublicUrl(fileName);
                            if (urlData?.publicUrl) {
                              setCompany({ ...company, logo_url: urlData.publicUrl });
                              useAuthStore.getState().updateCompany({ logo_url: urlData.publicUrl });
                              return;
                            }
                          }
                        } catch {
                          // Supabase storage not configured — fall through to base64
                        }
                        // Fallback: store as base64 data URL in Zustand
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const dataUrl = ev.target?.result as string;
                          setCompany({ ...company, logo_url: dataUrl });
                          useAuthStore.getState().updateCompany({ logo_url: dataUrl });
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    <span className="inline-flex h-9 px-4 items-center rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer">
                      {company.logo_url ? 'Change Logo' : 'Upload Logo'}
                    </span>
                  </label>
                  {company.logo_url && (
                    <button
                      onClick={() => {
                        setCompany({ ...company, logo_url: '' });
                        useAuthStore.getState().updateCompany({ logo_url: '' });
                      }}
                      className="text-xs text-red-500 hover:text-red-600 transition-colors text-left"
                    >
                      Remove Logo
                    </button>
                  )}
                  <p className="text-[10px] text-muted-foreground/80">Your logo appears on invoices and reports</p>
                </div>
              </div>
              <Input
                label="Company Name"
                value={company.name}
                onChange={(e) => setCompany({ ...company, name: e.target.value })}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  value={company.email}
                  onChange={(e) => setCompany({ ...company, email: e.target.value })}
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={company.phone}
                  onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                />
              </div>
              <Input
                label="Website"
                value={company.website}
                onChange={(e) => setCompany({ ...company, website: e.target.value })}
              />
              <div className="border-t border-border pt-4">
                <p className="text-sm font-medium text-muted-foreground/80 mb-3">Address</p>
                <Input
                  label="Street Address"
                  value={company.street}
                  onChange={(e) => setCompany({ ...company, street: e.target.value })}
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  <Input
                    label="City"
                    value={company.city}
                    onChange={(e) => setCompany({ ...company, city: e.target.value })}
                  />
                  <Input
                    label="State/Province"
                    value={company.state}
                    onChange={(e) => setCompany({ ...company, state: e.target.value })}
                  />
                  <Input
                    label="ZIP/Postal Code"
                    value={company.zip}
                    onChange={(e) => setCompany({ ...company, zip: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Business Hours */}
          <Card variant="default" padding="lg">
            <h2 className="mb-5 text-base font-semibold text-foreground">Business Hours</h2>
            <div className="space-y-2">
              {DAYS.map((day) => {
                const h = hours[day];
                return (
                  <div
                    key={day}
                    className={`grid grid-cols-[70px_1fr_1fr_44px] sm:grid-cols-[100px_100px_100px_60px] gap-2 sm:gap-3 items-center rounded-xl ring-1 ring-black/5 bg-white px-3 py-2.5 transition-colors ${
                      !h.open ? 'opacity-50' : ''
                    }`}
                  >
                    <span className="text-sm font-medium text-foreground whitespace-nowrap">{day}</span>
                    <input
                      type="time"
                      value={h.openTime}
                      onChange={(e) =>
                        setHours((prev) => ({
                          ...prev,
                          [day]: { ...prev[day], openTime: e.target.value },
                        }))
                      }
                      disabled={!h.open}
                      className="w-full rounded-md border border-white/10 bg-white px-2 py-1 text-xs text-foreground outline-none focus:border-electric/50 disabled:opacity-30"
                    />
                    <input
                      type="time"
                      value={h.closeTime}
                      onChange={(e) =>
                        setHours((prev) => ({
                          ...prev,
                          [day]: { ...prev[day], closeTime: e.target.value },
                        }))
                      }
                      disabled={!h.open}
                      className="w-full rounded-md border border-white/10 bg-white px-2 py-1 text-xs text-foreground outline-none focus:border-electric/50 disabled:opacity-30"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          setHours((prev) => ({
                            ...prev,
                            [day]: { ...prev[day], open: !prev[day].open },
                          }))
                        }
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400/40 ${
                          h.open ? 'bg-green-500' : 'bg-gray-300'
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
          </Card>

          {/* Pricing */}
          <Card variant="default" padding="lg">
            <h2 className="mb-5 text-base font-semibold text-foreground">Pricing Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Hourly Rate ($/hr)"
                type="number"
                value={pricing.hourlyRate}
                onChange={(e) => setPricing({ ...pricing, hourlyRate: e.target.value })}
              />
              <Input
                label="Service Fee (%)"
                type="number"
                value={pricing.serviceFee}
                onChange={(e) => setPricing({ ...pricing, serviceFee: e.target.value })}
              />
              <Input
                label="Tax Rate (%)"
                type="number"
                value={pricing.taxRate}
                onChange={(e) => setPricing({ ...pricing, taxRate: e.target.value })}
              />
              <Input
                label="Markup on Parts (%)"
                type="number"
                value={pricing.partsMarkup}
                onChange={(e) => setPricing({ ...pricing, partsMarkup: e.target.value })}
              />
            </div>
          </Card>

          {/* Save / Reset */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-sm text-muted-foreground hover:text-muted-foreground/80 transition-colors"
            >
              Reset to Defaults
            </button>
            <div className="flex items-center gap-3">
              {companySaved && (
                <span className="text-sm text-green-600 animate-pulse">Saved!</span>
              )}
              <Button onClick={handleSaveCompany} loading={savingCompany}>
                {savingCompany ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Team Tab ── */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">{members.length} team members</p>
              {inviteSuccess && (
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{inviteSuccess}</span>
              )}
            </div>
            <Button size="sm" onClick={() => setInviteOpen(true)}>+ Invite Member</Button>
          </div>

          {members.length === 0 ? (
            <Card variant="bordered" padding="lg">
              <EmptyState
                title="No team members yet"
                description="Invite your first team member to get started."
                action={<Button size="sm" onClick={() => setInviteOpen(true)}>+ Invite Member</Button>}
              />
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Mobile card layout */}
              <div className="sm:hidden space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="bg-white border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      </div>
                      <RoleBadge role={member.role} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/80">
                        <span className={`h-2 w-2 rounded-full ${statusColor[member.status] || 'bg-muted'}`} />
                        {statusLabel[member.status] || member.status}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditMember(member.id)}
                          className="h-8 px-3 text-xs font-medium text-muted-foreground bg-muted border border-border rounded-xl hover:bg-muted transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="h-8 px-3 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <Card variant="bordered" padding="sm" className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr
                      key={member.id}
                      className="border-b border-border transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={member.name} size="sm" />
                          <span className="font-medium text-foreground">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{member.email}</td>
                      <td className="px-4 py-3">
                        <RoleBadge role={member.role} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/80">
                          <span className={`h-2 w-2 rounded-full ${statusColor[member.status] || 'bg-muted'}`} />
                          {statusLabel[member.status] || member.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditMember(member.id)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <span className="text-red-600">Remove</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
            </div>
          )}

          {/* Invite Modal */}
          <Modal
            open={inviteOpen}
            onClose={() => setInviteOpen(false)}
            title="Invite Team Member"
            description="Send an invitation to join your organization."
            size="sm"
            footer={
              <div className="flex items-center gap-2 w-full justify-end">
                <Button variant="ghost" onClick={() => setInviteOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendInvitation} disabled={!inviteForm.name.trim() || !inviteForm.email.trim()} loading={inviteSending}>
                  {inviteSending ? 'Sending…' : 'Send Invitation'}
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              <Input
                label="Name"
                placeholder="Full name"
                value={inviteForm.name}
                onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                placeholder="colleague@company.com"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-muted-foreground/80">Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
                >
                  <option value="admin">Admin</option>
                  <option value="dispatcher">Dispatcher</option>
                  <option value="lead-tech">Lead Tech</option>
                  <option value="senior-tech">Senior Tech</option>
                  <option value="tech">Tech</option>
                </select>
              </div>
            </div>

            {inviteError && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {inviteError}
              </div>
            )}
          </Modal>

          {/* Edit Member Modal */}
          <Modal
            open={!!editMember}
            onClose={() => setEditMember(null)}
            title="Edit Team Member"
            description="Update team member details."
            size="sm"
            footer={
              <div className="flex items-center gap-2 w-full justify-end">
                <Button variant="ghost" onClick={() => setEditMember(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEditMember} disabled={!editMember?.name.trim() || !editMember?.email.trim()}>
                  Save Changes
                </Button>
              </div>
            }
          >
            {editMember && (
              <div className="space-y-4">
                <Input
                  label="Name"
                  placeholder="Full name"
                  value={editMember.name}
                  onChange={(e) => setEditMember({ ...editMember, name: e.target.value })}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={editMember.email}
                  onChange={(e) => setEditMember({ ...editMember, email: e.target.value })}
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-muted-foreground/80">Role</label>
                  <select
                    value={editMember.role}
                    onChange={(e) => setEditMember({ ...editMember, role: e.target.value })}
                    className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
                  >
                    <option value="admin">Admin</option>
                    <option value="dispatcher">Dispatcher</option>
                    <option value="lead-tech">Lead Tech</option>
                    <option value="senior-tech">Senior Tech</option>
                    <option value="tech">Tech</option>
                  </select>
                </div>
              </div>
            )}
          </Modal>
        </div>
      )}

      {/* ── Notifications Tab ── */}
      {activeTab === 'notifications' && (
        <Card variant="default" padding="lg" className="max-w-xl">
          <h2 className="mb-5 text-base font-semibold text-foreground">Notification Preferences</h2>
          <div className="space-y-5">
            {notifications.map((notif, idx) => (
              <div key={notif.label} className="border-b border-border pb-5 last:border-0 last:pb-0">
                <p className="text-sm font-medium text-foreground mb-0.5">{notif.label}</p>
                <p className="text-xs text-muted-foreground mb-3">{notif.description}</p>
                <div className="flex flex-wrap gap-4">
                  {notif.channels.map((channel) => (
                    <label
                      key={channel.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <ToggleSwitch
                        enabled={notif.enabled[channel.id] ?? false}
                        onChange={() => toggleNotification(idx, channel.id)}
                      />
                      <span className="text-xs text-muted-foreground/80">{channel.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div className="pt-2 flex items-center gap-3">
              {notifsSaved && (
                <span className="text-sm text-green-600 animate-pulse">Preferences saved!</span>
              )}
              <Button onClick={handleSaveNotifications} loading={savingNotifs}>
                {savingNotifs ? 'Saving…' : 'Save Preferences'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ── Logout Tab ── */}
      {activeTab === 'profile' && (
        <div className="pt-4 border-t border-border/50 max-w-2xl">
          <Card variant="default" padding="lg">
            <h2 className="text-base font-semibold text-red-600 mb-2">Sign Out</h2>
            <p className="text-sm text-muted-foreground mb-4">Sign out of your PlumbCore account on this device.</p>
            <button
              onClick={async () => {
                await useAuthStore.getState().logout();
                window.location.href = '/login';
              }}
              className="h-10 px-5 rounded-xl bg-red-500 text-foreground text-sm font-semibold hover:bg-red-600 transition-colors shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Sign Out
            </button>
          </Card>
        </div>
      )}

      {/* ── Billing Tab ── */}
      {activeTab === 'billing' && (
        <div className="space-y-6 max-w-2xl">
          {/* Current Plan */}
          <Card variant="default" padding="lg">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">Current Plan</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  You are on the <span className="font-medium text-foreground">
                    {PLAN_LABELS[currentPlan] || 'Pro'}
                  </span> plan
                </p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {currentPlan === 'enterprise' ? (
                    <span>Custom</span>
                  ) : (
                    <>${(PLAN_PRICES[currentPlan] || 34900) / 100}<span className="text-sm font-normal text-muted-foreground">/mo</span></>
                  )}
                </p>
                <p className="text-xs text-muted-foreground/80 mt-1">Next billing date: Aug 1, 2026</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  // Upgrade: redirect to pricing via Stripe checkout
                  const priceId = STRIPE_PRICE_IDS[currentPlan];
                  if (priceId) {
                    fetch('/api/create-checkout-session', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ priceId, planName: currentPlan }),
                    }).then(r => r.json()).then(d => {
                      if (d.url) window.location.href = d.url;
                    });
                  } else {
                    setChangePlanOpen(true);
                  }
                }}>
                  Upgrade Plan
                </Button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5">
              {(PLAN_FEATURES[currentPlan] || []).slice(0, 8).map((f: string, i: number) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <svg className="h-3.5 w-3.5 shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </div>
              ))}
            </div>
          </Card>

          {/* Manage Billing */}
          <Card variant="default" padding="lg">
            <h2 className="text-base font-semibold text-foreground mb-3">Manage Billing</h2>
            <p className="text-sm text-muted-foreground mb-4">View and update your payment methods, invoices, and subscription details through Stripe's billing portal.</p>
            <Button
              onClick={async () => {
                const state = useAuthStore.getState();
                const customerId = state.company?.stripe_customer_id;
                if (!customerId) {
                  alert('No billing customer ID found. Please contact support.');
                  return;
                }
                try {
                  const res = await fetch('/api/create-billing-portal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      customerId,
                      returnUrl: window.location.href,
                    }),
                  });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                } catch {
                  alert('Failed to open billing portal. Please try again.');
                }
              }}
            >
              Open Billing Portal
            </Button>
          </Card>

          {/* Payment Method */}
          <Card variant="bordered" padding="lg">
            <h2 className="text-base font-semibold text-foreground mb-3">Payment Method</h2>
            <div className="flex items-center gap-4 rounded-xl ring-1 ring-black/5 bg-white p-4">
              <div className="flex h-10 w-14 items-center justify-center rounded-xl bg-white/5 text-muted-foreground/80">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-foreground font-medium">Visa ending in 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/2026</p>
              </div>
              <Button variant="ghost" size="sm" className="ml-auto">
                Update
              </Button>
            </div>
          </Card>

          {/* Cancel Subscription */}
          <Card variant="bordered" padding="lg" className="border-red-200">
            <h2 className="text-base font-semibold text-red-600 mb-2">Cancel Subscription</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Once cancelled, you'll lose access to premium features at the end of your billing period. Your data will be retained for 30 days.
            </p>
            <Button
              variant="outline"
              onClick={async () => {
                const confirmed = window.confirm(
                  'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.'
                );
                if (!confirmed) return;
                // Redirect to Stripe billing portal to manage cancellation
                const state = useAuthStore.getState();
                const customerId = state.company?.stripe_customer_id;
                if (customerId) {
                  try {
                    const res = await fetch('/api/create-billing-portal', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        customerId,
                        returnUrl: window.location.href,
                      }),
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  } catch {}
                }
              }}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Cancel Subscription
            </Button>
          </Card>

          {/* Billing History */}
          <Card variant="default" padding="lg">
            <h2 className="text-base font-semibold text-foreground mb-4">Billing History</h2>
            {BILLING_HISTORY.length === 0 ? (
              <EmptyState
                title="No billing history"
                description="Your invoices will appear here once you start your subscription."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                      <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                      <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BILLING_HISTORY.map((inv) => (
                      <tr key={inv.id} className="border-b border-border/50">
                        <td className="py-3 pr-4 text-muted-foreground/80 whitespace-nowrap">
                          {new Date(inv.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-3 pr-4 text-foreground font-medium">
                          ${inv.amount.toFixed(2)}
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge active={inv.status === 'paid'} />
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={async () => {
                              function downloadPdfFallback() {
                                const pdfContent = `PlumbCore AI\n\nInvoice: ${inv.id}\nDate: ${new Date(inv.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\nAmount: $${inv.amount.toFixed(2)}\nStatus: ${inv.status.toUpperCase()}`;
                                const blob = new Blob([pdfContent], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${inv.id}.txt`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              }

                              try {
                                const { jsPDF } = await import('jspdf');
                                const doc = new jsPDF({ unit: 'mm', format: 'a4' });
                                doc.setFontSize(18);
                                doc.text('PlumbCore AI', 20, 30);
                                doc.setFontSize(11);
                                doc.text(`Invoice: ${inv.id}`, 20, 45);
                                doc.text(`Date: ${new Date(inv.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, 55);
                                doc.text(`Amount: $${inv.amount.toFixed(2)}`, 20, 65);
                                doc.text(`Status: ${inv.status.toUpperCase()}`, 20, 75);
                                doc.save(`${inv.id}.pdf`);
                              } catch {
                                downloadPdfFallback();
                              }
                            }}
                            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Change Plan Modal */}
          <Modal
            open={changePlanOpen}
            onClose={() => setChangePlanOpen(false)}
            title="Change Plan"
            description="Select a new subscription plan."
            size="md"
            footer={
              <div className="flex items-center gap-2 w-full justify-end">
                <Button variant="ghost" onClick={() => setChangePlanOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  const priceId = STRIPE_PRICE_IDS[currentPlan];
                  if (priceId) {
                    fetch('/api/create-checkout-session', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ priceId, planName: currentPlan }),
                    }).then(r => r.json()).then(d => {
                      if (d.url) window.location.href = d.url;
                    });
                  }
                  setChangePlanOpen(false);
                }}>
                  Confirm Change
                </Button>
              </div>
            }
          >
            <div className="space-y-3">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setCurrentPlan(plan.id)}
                  className={`w-full text-left rounded-xl border p-4 transition-all ${
                    currentPlan === plan.id
                      ? 'border-electric bg-primary/5'
                      : 'border-border bg-white hover:border-border'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{plan.features.length} features</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-bold text-foreground">${plan.price}</span>
                      <span className="text-xs text-muted-foreground">/mo</span>
                      <div
                        className={`ml-1 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                          currentPlan === plan.id ? 'border-electric bg-primary' : 'border-white/20'
                        }`}
                      >
                        {currentPlan === plan.id && (
                          <svg className="h-2.5 w-2.5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}