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
  { id: 'starter', name: 'Starter', price: 79, features: ['Up to 2 technicians', 'Basic scheduling', 'Invoice management', 'Email support'] },
  { id: 'pro', name: 'Pro', price: 129, features: ['Up to 10 technicians', 'Advanced scheduling', 'Inventory tracking', 'Reports & analytics', 'Priority support'] },
  { id: 'unlimited', name: 'Unlimited', price: 199, features: ['Unlimited technicians', 'Everything in Pro', 'API access', 'Dedicated account manager', 'Custom integrations'] },
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
    admin: { label: 'Admin', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-electric/20' },
    dispatcher: { label: 'Dispatcher', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-status-warning/20' },
    'lead-tech': { label: 'Lead Tech', bg: 'bg-green-50', text: 'text-green-600', border: 'border-status-success/20' },
    'senior-tech': { label: 'Senior Tech', bg: 'bg-green-50', text: 'text-green-600', border: 'border-status-success/20' },
    tech: { label: 'Tech', bg: 'bg-white/5', text: 'text-gray-400', border: 'border-white/10' },
  };
  const c = config[role] || { label: role, bg: 'bg-white/5', text: 'text-gray-400', border: 'border-white/10' };
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
          : 'bg-steel/10 text-gray-500 border border-steel/20'
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
        enabled ? 'bg-electric' : 'bg-white/10'
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
    <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 animate-pulse">
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
    <div className="animate-pulse space-y-4 rounded-xl border border-gray-200 bg-white p-5">
      <div className="h-4 w-1/3 rounded bg-white/5" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-10 w-full rounded-lg bg-white/5" />
      ))}
      <div className="h-10 w-32 rounded-lg bg-white/5" />
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
        <h2 className="mb-5 text-base font-semibold text-gray-900">Profile Picture</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-electric/10 text-lg font-bold text-electric border-2 border-gray-200">
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
        <h2 className="mb-5 text-base font-semibold text-gray-900">Personal Information</h2>
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

  // Company form state
  const [company, setCompany] = useState<CompanyData>({ ...COMPANY_DATA });
  const [hours, setHours] = useState<BusinessHours>(JSON.parse(JSON.stringify(DEFAULT_HOURS)));
  const [pricing, setPricing] = useState<PricingSettings>({ ...PRICING_DEFAULTS });
  const [savingCompany, setSavingCompany] = useState(false);
  const [companySaved, setCompanySaved] = useState(false);

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
  const [currentPlan, setCurrentPlan] = useState('pro');

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
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setCompanySaved(true);
      setTimeout(() => setCompanySaved(false), 3000);
    } catch {
      // swallow
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

  /* ── Invite handler ── */
  const handleSendInvitation = () => {
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) return;
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
    away: 'bg-steel-light',
    offline: 'bg-steel',
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
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
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
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <div className="flex gap-1 animate-pulse">
          {TABS.map((t) => (
            <div key={t.id} className="h-9 w-24 rounded-lg bg-white/5" />
          ))}
        </div>
        <SkeletonSettingsForm />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-electric text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
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
            <h2 className="mb-5 text-base font-semibold text-gray-900">Company Information</h2>
            <div className="space-y-4">
              {/* Logo Upload */}
              <div className="flex items-center gap-5 pb-4 border-b border-gray-100">
                <div className="relative shrink-0">
                  {company.logo_url ? (
                    <img src={company.logo_url} alt="Company logo" className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-xl font-bold text-white border-2 border-gray-200">
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
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const dataUrl = ev.target?.result as string;
                          setCompany({ ...company, logo_url: dataUrl });
                          useAuthStore.getState().updateCompany({ logo_url: dataUrl });
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    <span className="inline-flex h-9 px-4 items-center rounded-xl bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition-colors shadow-sm cursor-pointer">
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
                  <p className="text-[10px] text-gray-400">Your logo appears on invoices and reports</p>
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
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-400 mb-3">Address</p>
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
                    label="State"
                    value={company.state}
                    onChange={(e) => setCompany({ ...company, state: e.target.value })}
                  />
                  <Input
                    label="ZIP"
                    value={company.zip}
                    onChange={(e) => setCompany({ ...company, zip: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Business Hours */}
          <Card variant="default" padding="lg">
            <h2 className="mb-5 text-base font-semibold text-gray-900">Business Hours</h2>
            <div className="space-y-2">
              {DAYS.map((day) => {
                const h = hours[day];
                return (
                  <div
                    key={day}
                    className={`grid grid-cols-[1fr_80px_80px_60px] gap-2 items-center rounded-lg border border-gray-200 px-3 py-2.5 transition-colors ${
                      !h.open ? 'opacity-50' : ''
                    }`}
                  >
                    <span className="text-sm font-medium text-gray-900">{day}</span>
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
                      className="w-full rounded-md border border-white/10 bg-whiteer px-2 py-1 text-xs text-gray-900 outline-none focus:border-electric/50 disabled:opacity-30"
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
                      className="w-full rounded-md border border-white/10 bg-whiteer px-2 py-1 text-xs text-gray-900 outline-none focus:border-electric/50 disabled:opacity-30"
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
          </Card>

          {/* Pricing */}
          <Card variant="default" padding="lg">
            <h2 className="mb-5 text-base font-semibold text-gray-900">Pricing Settings</h2>
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
              className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
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
            <p className="text-sm text-gray-500">{members.length} team members</p>
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
            <Card variant="bordered" padding="sm" className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr
                      key={member.id}
                      className="border-b border-gray-200 transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={member.name} size="sm" />
                          <span className="font-medium text-gray-900">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{member.email}</td>
                      <td className="px-4 py-3">
                        <RoleBadge role={member.role} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                          <span className={`h-2 w-2 rounded-full ${statusColor[member.status] || 'bg-steel'}`} />
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
                <Button onClick={handleSendInvitation} disabled={!inviteForm.name.trim() || !inviteForm.email.trim()}>
                  Send Invitation
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
                <label className="block text-sm font-medium text-gray-400">Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-whiteer px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20"
                >
                  <option value="admin">Admin</option>
                  <option value="dispatcher">Dispatcher</option>
                  <option value="lead-tech">Lead Tech</option>
                  <option value="senior-tech">Senior Tech</option>
                  <option value="tech">Tech</option>
                </select>
              </div>
            </div>
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
                  <label className="block text-sm font-medium text-gray-400">Role</label>
                  <select
                    value={editMember.role}
                    onChange={(e) => setEditMember({ ...editMember, role: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-whiteer px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20"
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
          <h2 className="mb-5 text-base font-semibold text-gray-900">Notification Preferences</h2>
          <div className="space-y-5">
            {notifications.map((notif, idx) => (
              <div key={notif.label} className="border-b border-gray-200 pb-5 last:border-0 last:pb-0">
                <p className="text-sm font-medium text-gray-900 mb-0.5">{notif.label}</p>
                <p className="text-xs text-gray-500 mb-3">{notif.description}</p>
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
                      <span className="text-xs text-gray-400">{channel.label}</span>
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
        <div className="pt-4 border-t border-slate-100 max-w-2xl">
          <Card variant="default" padding="lg">
            <h2 className="text-base font-semibold text-red-600 mb-2">Sign Out</h2>
            <p className="text-sm text-slate-500 mb-4">Sign out of your PlumbCore account on this device.</p>
            <button
              onClick={async () => {
                await useAuthStore.getState().logout();
                window.location.href = '/login';
              }}
              className="h-10 px-5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors shadow-sm flex items-center gap-2"
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
                <h2 className="text-base font-semibold text-gray-900">Current Plan</h2>
                <p className="text-sm text-gray-500 mt-1">
                  You are on the <span className="font-medium text-gray-900">
                    {SUBSCRIPTION_PLANS.find((p) => p.id === currentPlan)?.name || 'Pro'}
                  </span> plan
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  ${SUBSCRIPTION_PLANS.find((p) => p.id === currentPlan)?.price || 129}
                  <span className="text-sm font-normal text-gray-500">/mo</span>
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setChangePlanOpen(true)}>
                Change Plan
              </Button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5">
              {(SUBSCRIPTION_PLANS.find((p) => p.id === currentPlan)?.features || []).map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <svg className="h-3.5 w-3.5 shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </div>
              ))}
            </div>
          </Card>

          {/* Payment Method */}
          <Card variant="bordered" padding="lg">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Payment Method</h2>
            <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-whiteer p-4">
              <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-white/5 text-gray-400">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-900 font-medium">Visa ending in 4242</p>
                <p className="text-xs text-gray-500">Expires 12/2026</p>
              </div>
              <Button variant="ghost" size="sm" className="ml-auto">
                Update
              </Button>
            </div>
          </Card>

          {/* Billing History */}
          <Card variant="default" padding="lg">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Billing History</h2>
            {BILLING_HISTORY.length === 0 ? (
              <EmptyState
                title="No billing history"
                description="Your invoices will appear here once you start your subscription."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
                      <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Amount</th>
                      <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                      <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BILLING_HISTORY.map((inv) => (
                      <tr key={inv.id} className="border-b border-gray-200/50">
                        <td className="py-3 pr-4 text-gray-400 whitespace-nowrap">
                          {new Date(inv.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-3 pr-4 text-gray-900 font-medium">
                          ${inv.amount.toFixed(2)}
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge active={inv.status === 'paid'} />
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              const { jsPDF } = window as any;
                              const doc = new jsPDF({ unit: 'mm', format: 'a4' });
                              doc.setFontSize(18);
                              doc.text('PlumbCore AI', 20, 30);
                              doc.setFontSize(11);
                              doc.text(`Invoice: ${inv.id}`, 20, 45);
                              doc.text(`Date: ${new Date(inv.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, 55);
                              doc.text(`Amount: $${inv.amount.toFixed(2)}`, 20, 65);
                              doc.text(`Status: ${inv.status.toUpperCase()}`, 20, 75);
                              doc.save(`${inv.id}.pdf`);
                            }}
                            className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
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
                <Button onClick={() => setChangePlanOpen(false)}>
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
                      ? 'border-electric bg-electric/5'
                      : 'border-gray-200 bg-whiteer hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{plan.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{plan.features.length} features</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-bold text-gray-900">${plan.price}</span>
                      <span className="text-xs text-gray-500">/mo</span>
                      <div
                        className={`ml-1 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                          currentPlan === plan.id ? 'border-electric bg-electric' : 'border-white/20'
                        }`}
                      >
                        {currentPlan === plan.id && (
                          <svg className="h-2.5 w-2.5 text-[#0a0e2a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
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