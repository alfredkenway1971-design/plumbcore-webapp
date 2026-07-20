'use client';

import { useState } from 'react';
import { Button, Card, EmptyState, ErrorState } from '@/pkg/ui-components';

/* ── Types ── */
interface CallHistoryEntry {
  id: string;
  dateTime: string;
  caller: string;
  duration: string;
  issueSummary: string;
  outcome: 'Booked' | 'Lead' | 'Resolved' | 'Missed';
}

interface ReceptionistSettings {
  greeting: string;
  afterHoursMessage: string;
  bookingHoursStart: string;
  bookingHoursEnd: string;
  transferCondition: string;
}

/* ── Mock Call History (10+ entries) ── */
const MOCK_CALL_HISTORY: CallHistoryEntry[] = [
  { id: 'CH-001', dateTime: '2024-07-28 08:32 AM', caller: 'James Wilson', duration: '4:15', issueSummary: 'Kitchen sink leak — scheduled visit for tomorrow', outcome: 'Booked' },
  { id: 'CH-002', dateTime: '2024-07-28 09:15 AM', caller: 'Sarah Mitchell', duration: '2:40', issueSummary: 'Water heater not heating — troubleshooting provided, will call if persists', outcome: 'Resolved' },
  { id: 'CH-003', dateTime: '2024-07-28 10:00 AM', caller: 'Oak Springs Apts', duration: '6:12', issueSummary: 'Multiple toilet leaks in Building C — logged as commercial lead', outcome: 'Lead' },
  { id: 'CH-004', dateTime: '2024-07-28 11:30 AM', caller: 'Robert Davis', duration: '1:20', issueSummary: 'Dripping outdoor spigot — scheduled repair for Thursday', outcome: 'Booked' },
  { id: 'CH-005', dateTime: '2024-07-28 01:45 PM', caller: 'Emily Chen', duration: '3:05', issueSummary: 'Gas smell near furnace — transferred to emergency dispatch', outcome: 'Booked' },
  { id: 'CH-006', dateTime: '2024-07-27 07:20 PM', caller: 'Thomas Baker', duration: '5:30', issueSummary: 'Burst pipe after hours — emergency dispatched immediately', outcome: 'Booked' },
  { id: 'CH-007', dateTime: '2024-07-27 06:00 PM', caller: 'Unknown', duration: '0:45', issueSummary: 'Call dropped after greeting — no callback number available', outcome: 'Missed' },
  { id: 'CH-008', dateTime: '2024-07-27 04:15 PM', caller: 'Maria Lopez', duration: '2:55', issueSummary: 'Slow bathroom drain — booked for Friday morning', outcome: 'Booked' },
  { id: 'CH-009', dateTime: '2024-07-27 02:30 PM', caller: 'Sunset Retirement Home', duration: '8:20', issueSummary: 'Building A water pressure issue — logged as lead for facilities manager', outcome: 'Lead' },
  { id: 'CH-010', dateTime: '2024-07-26 09:00 AM', caller: 'David Kim', duration: '1:50', issueSummary: 'Toilet running constantly — DIY fix provided, no visit needed', outcome: 'Resolved' },
  { id: 'CH-011', dateTime: '2024-07-26 11:10 AM', caller: 'Patricia Martinez', duration: '3:30', issueSummary: 'Shower valve not working — scheduled for next week', outcome: 'Booked' },
  { id: 'CH-012', dateTime: '2024-07-25 08:45 PM', caller: 'Anonymous', duration: '0:30', issueSummary: 'Wrong number — hung up after greeting', outcome: 'Missed' },
];

const OUTCOME_COLORS: Record<string, string> = {
  Booked: 'bg-green-100 text-green-700',
  Lead: 'bg-blue-100 text-blue-700',
  Resolved: 'bg-amber-100 text-amber-700',
  Missed: 'bg-red-100 text-red-700',
};

/* ── Skeleton ── */
function ReceptionistSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 w-64 rounded bg-muted" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="h-24 rounded-xl bg-muted" />
        <div className="h-24 rounded-xl bg-muted" />
      </div>
      <div className="h-64 rounded-xl bg-muted" />
      <div className="h-48 rounded-xl bg-muted" />
    </div>
  );
}

/* ── Main Page ── */
export default function VoiceReceptionistPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [callHistory] = useState<CallHistoryEntry[]>(MOCK_CALL_HISTORY);

  /* ── Settings State ── */
  const [settings, setSettings] = useState<ReceptionistSettings>({
    greeting: "Thank you for calling PlumbCore Plumbing! I'm your AI receptionist. How can I help you today?",
    afterHoursMessage: "You've reached PlumbCore Plumbing after hours. If this is an emergency, please press 1 or say 'Emergency'. Otherwise, leave a message and we'll return your call during business hours.",
    bookingHoursStart: '08:00',
    bookingHoursEnd: '17:00',
    transferCondition: 'emergency',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  /* ── Handlers ── */
  const handleSaveSettings = async () => {
    setSaving(true);
    setSaved(false);
    // Simulate save
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleToggle = () => {
    setIsActive(!isActive);
  };

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">AI Voice Receptionist</h1>
        <ReceptionistSkeleton />
      </div>
    );
  }

  /* ── Error State ── */
  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">AI Voice Receptionist</h1>
        <Card variant="bordered" padding="lg">
          <ErrorState title="Failed to load receptionist data" message={error} onRetry={() => setError(null)} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Voice Receptionist</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your AI receptionist settings and view call history.</p>
        </div>
      </div>

      {/* Status Card */}
      <Card variant="bordered" padding="md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isActive ? 'bg-green-100' : 'bg-muted'}`}>
              <svg className={`h-5 w-5 ${isActive ? 'text-green-600' : 'text-muted-foreground/80'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Receptionist is {isActive ? 'Active' : 'Paused'}</p>
              <p className="text-xs text-muted-foreground">{isActive ? 'Taking calls and booking appointments' : 'Calls are not being answered by AI'}</p>
            </div>
          </div>
          <button
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
              isActive ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
              isActive ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </Card>

      {/* Call History Table */}
      <Card variant="bordered" padding="md">
        <h2 className="text-sm font-semibold text-foreground mb-4">Call History</h2>
        {callHistory.length === 0 ? (
          <EmptyState title="No call history" description="Calls will appear here once the receptionist starts taking them." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date/Time</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Caller</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Duration</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Issue Summary</th>
                  <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Outcome</th>
                  <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {callHistory.map((entry) => (
                  <tr key={entry.id} className="border-b border-border transition-colors hover:bg-white/[0.02]">
                    <td className="px-3 py-3 text-foreground text-xs whitespace-nowrap">{entry.dateTime}</td>
                    <td className="px-3 py-3 text-foreground font-medium whitespace-nowrap">{entry.caller}</td>
                    <td className="px-3 py-3 text-right text-muted-foreground whitespace-nowrap">{entry.duration}</td>
                    <td className="px-3 py-3 text-muted-foreground max-w-[250px] truncate">{entry.issueSummary}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${OUTCOME_COLORS[entry.outcome]}`}>
                        {entry.outcome}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button className="rounded-xl bg-white/5 ring-1 ring-black/5 px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Settings Section */}
      <Card variant="bordered" padding="md">
        <h2 className="text-sm font-semibold text-foreground mb-4">Settings</h2>
        <div className="space-y-5">
          {/* Greeting Message */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Greeting Message</label>
            <textarea
              value={settings.greeting}
              onChange={(e) => setSettings(prev => ({ ...prev, greeting: e.target.value }))}
              rows={3}
              className="w-full rounded-xl ring-1 ring-black/5 bg-white px-4 py-2.5 text-sm text-foreground placeholder-gray-400 outline-none transition-all focus:border-blue-500/50 focus:ring-1 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* After-Hours Message */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">After-Hours Message</label>
            <textarea
              value={settings.afterHoursMessage}
              onChange={(e) => setSettings(prev => ({ ...prev, afterHoursMessage: e.target.value }))}
              rows={3}
              className="w-full rounded-xl ring-1 ring-black/5 bg-white px-4 py-2.5 text-sm text-foreground placeholder-gray-400 outline-none transition-all focus:border-blue-500/50 focus:ring-1 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* Booking Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Booking Start Time</label>
              <input
                type="time"
                value={settings.bookingHoursStart}
                onChange={(e) => setSettings(prev => ({ ...prev, bookingHoursStart: e.target.value }))}
                className="w-full rounded-xl ring-1 ring-black/5 bg-white px-4 py-2.5 text-sm text-foreground outline-none transition-all focus:border-blue-500/50 focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Booking End Time</label>
              <input
                type="time"
                value={settings.bookingHoursEnd}
                onChange={(e) => setSettings(prev => ({ ...prev, bookingHoursEnd: e.target.value }))}
                className="w-full rounded-xl ring-1 ring-black/5 bg-white px-4 py-2.5 text-sm text-foreground outline-none transition-all focus:border-blue-500/50 focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Transfer Condition */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Transfer to Human If</label>
            <select
              value={settings.transferCondition}
              onChange={(e) => setSettings(prev => ({ ...prev, transferCondition: e.target.value }))}
              className="w-full rounded-xl ring-1 ring-black/5 bg-white px-4 py-2.5 text-sm text-foreground outline-none transition-all focus:border-blue-500/50 focus:ring-1 focus:ring-primary/20"
            >
              <option value="emergency">Emergency detected</option>
              <option value="customer-requests">Customer requests to speak to a human</option>
              <option value="complex">Complex issue (cannot resolve with AI)</option>
              <option value="any">Any of the above</option>
            </select>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3 pt-2">
            <Button variant="primary" size="md" loading={saving} onClick={handleSaveSettings}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
            {saved && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Settings saved successfully!
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
