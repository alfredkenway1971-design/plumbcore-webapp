'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
} from '@/pkg/ui-components';

/* ── Types ── */
type NotificationType = 'job' | 'invoice' | 'inventory' | 'system';
type TabKey = 'all' | 'unread' | 'job' | 'invoice' | 'inventory';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  href: string;
}

/* ── Helpers ── */

function timeAgo(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return d.toLocaleDateString();
}

/* ── Mock Data ── */

function generateNotifications(): Notification[] {
  const now = new Date();
  const d = (offsetDays: number, offsetHours = 0): string => {
    const date = new Date(now);
    date.setDate(date.getDate() - offsetDays);
    date.setHours(date.getHours() - offsetHours);
    return date.toISOString();
  };

  return [
    { id: 'NOTIF-001', type: 'job', title: 'Job Assigned: Sewer Line Backup', description: 'Emergency sewer line backup at Carlos Garcia. Priority: Urgent.', timestamp: d(0, 0.5), read: false, href: '/jobs/JOB-004' },
    { id: 'NOTIF-002', type: 'job', title: 'Job Completed: Main Line Repair', description: 'James and Sarah Johnson main sewer line repair completed. Total: $520.', timestamp: d(0, 3), read: false, href: '/jobs/JOB-001' },
    { id: 'NOTIF-003', type: 'invoice', title: 'Invoice Paid: INV-001', description: '$520 payment received from James and Sarah Johnson via credit card.', timestamp: d(0, 6), read: false, href: '/invoicing/INV-001' },
    { id: 'NOTIF-004', type: 'inventory', title: 'Low Stock Alert: Water Heaters', description: 'Bradford White 50-gal gas water heater only 2 remaining (min: 3). Reorder soon.', timestamp: d(0, 8), read: false, href: '/inventory' },
    { id: 'NOTIF-005', type: 'system', title: 'New Lead Received', description: 'New service request from 4520 Elmwood Dr leaking pipe under kitchen sink.', timestamp: d(0, 12), read: false, href: '/leads' },
    { id: 'NOTIF-006', type: 'job', title: 'Job In Progress: Whole House Repipe', description: 'Michael Brown 987 Cedar Dr. 3 techs assigned, 2 days in progress.', timestamp: d(1, 2), read: false, href: '/jobs/JOB-006' },
    { id: 'NOTIF-007', type: 'invoice', title: 'Invoice Overdue: INV-013', description: 'Invoice INV-013 for Diana Foster $145 due date passed 3 days ago.', timestamp: d(1, 5), read: false, href: '/invoicing/INV-013' },
    { id: 'NOTIF-008', type: 'inventory', title: 'Inventory Count Updated', description: 'End-of-month inventory count completed. 3 items need reordering.', timestamp: d(1, 10), read: true, href: '/inventory' },
    { id: 'NOTIF-009', type: 'job', title: 'Schedule Change: Gas Line Inspection', description: 'Linda Thomas rescheduled from Jul 18 to Jul 20 due to tech availability.', timestamp: d(2, 0), read: true, href: '/jobs/JOB-009' },
    { id: 'NOTIF-010', type: 'system', title: 'Team Member Joined', description: 'Omar Hassan has been added to the team as a Plumbing Technician.', timestamp: d(2, 6), read: true, href: '/team' },
    { id: 'NOTIF-011', type: 'invoice', title: 'Invoice Sent: INV-017', description: '$8,500 invoice for Riverside Church restroom renovation has been sent.', timestamp: d(2, 12), read: true, href: '/invoicing/INV-017' },
    { id: 'NOTIF-012', type: 'job', title: 'Job Created: Brewery Floor Drain Maintenance', description: 'Lone Star Brewery production floor drains. Scheduled for Jul 30.', timestamp: d(3, 0), read: true, href: '/jobs/JOB-025' },
    { id: 'NOTIF-013', type: 'inventory', title: 'Shipment Received', description: 'Order SUP-4421 arrived 10 boxes of PEX crimp rings, 5 boxes Teflon tape.', timestamp: d(3, 8), read: true, href: '/inventory' },
    { id: 'NOTIF-014', type: 'system', title: 'Monthly Report Ready', description: 'June 2026 monthly performance report is now available for review.', timestamp: d(4, 0), read: true, href: '/reports' },
    { id: 'NOTIF-015', type: 'job', title: 'Job Completed: Outdoor Spigot Install', description: 'Steven and Karen Adams frost-free spigot installed. Total: $250.', timestamp: d(4, 6), read: true, href: '/jobs/JOB-024' },
    { id: 'NOTIF-016', type: 'invoice', title: 'Invoice Paid: INV-012', description: '$250 payment from Steven and Karen Adams via credit card.', timestamp: d(5, 0), read: true, href: '/invoicing/INV-012' },
    { id: 'NOTIF-017', type: 'job', title: 'Job Assigned: Restroom Renovation', description: 'Riverside Church 3 techs assigned to restroom renovation plumbing. $8,500 estimate.', timestamp: d(5, 6), read: true, href: '/jobs/JOB-020' },
    { id: 'NOTIF-018', type: 'system', title: 'Backup Completed', description: 'Weekly system backup completed successfully. 2.4 GB backed up.', timestamp: d(6, 0), read: true, href: '/settings' },
    { id: 'NOTIF-019', type: 'inventory', title: 'Low Stock Alert: Sump Pumps', description: 'Zoeller 1/2 HP sump pump only 2 remaining (min: 2). Reorder recommended.', timestamp: d(6, 4), read: true, href: '/inventory' },
    { id: 'NOTIF-020', type: 'job', title: 'Emergency: Pipe Burst at Sunset Home', description: 'Building A common room pipe burst. 3 techs dispatched. $2,800 estimate.', timestamp: d(6, 12), read: true, href: '/jobs/JOB-017' },
  ];
}

/* ── Icons ── */

function WrenchIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.66 5.66a2 2 0 11-2.83-2.83l5.66-5.66M14.83 5.17l-2.83 2.83 5.66 5.66 2.83-2.83M18.36 2.14a2 2 0 112.83 2.83L14.83 11.4l-2.83-2.83 6.36-6.43z" /></svg>;
}

function FileTextIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
}

function BoxIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
}

function BellIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>;
}

function TrashIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
}

/* ── Type colors / icons map ── */
const typeConfig: Record<NotificationType, { icon: React.FC<{ className?: string }>; color: string }> = {
  job: { icon: WrenchIcon, color: 'text-primary' },
  invoice: { icon: FileTextIcon, color: 'text-green-600' },
  inventory: { icon: BoxIcon, color: 'text-amber-600' },
  system: { icon: BellIcon, color: 'text-muted-foreground/80' },
};

/* ── Skeleton ── */
function SkeletonNotification() {
  return (
    <div className="animate-pulse flex gap-3 border-b border-border/50 px-4 py-3.5">
      <div className="h-9 w-9 rounded-xl bg-white/5 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-2/3 rounded bg-white/5" />
        <div className="h-3 w-full rounded bg-white/5" />
        <div className="h-3 w-16 rounded bg-white/5" />
      </div>
    </div>
  );
}

/* ── Main Page ── */

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setNotifications(generateNotifications());
        setLoading(false);
      } catch {
        setError('Failed to load notifications.');
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
        setNotifications(generateNotifications());
        setLoading(false);
      } catch {
        setError('Failed to load notifications.');
        setLoading(false);
      }
    }, 1000);
  };

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case 'unread': return notifications.filter(n => !n.read);
      case 'job': return notifications.filter(n => n.type === 'job');
      case 'invoice': return notifications.filter(n => n.type === 'invoice');
      case 'inventory': return notifications.filter(n => n.type === 'inventory');
      default: return notifications;
    }
  }, [notifications, activeTab]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
    setShowClearConfirm(false);
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'job', label: 'Job Alerts' },
    { key: 'invoice', label: 'Invoice Alerts' },
    { key: 'inventory', label: 'Inventory Alerts' },
  ];

  /* ── Error State ── */
  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <Card variant="bordered" padding="lg">
          <ErrorState title="Failed to load notifications" message={error} onRetry={handleRetry} />
        </Card>
      </div>
    );
  }

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <div className="rounded-xl ring-1 ring-black/5 bg-white overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonNotification key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
              Mark All Read ({unreadCount})
            </Button>
          )}
          {notifications.length > 0 && (
            <>
              {!showClearConfirm ? (
                <Button variant="outline" size="sm" onClick={() => setShowClearConfirm(true)}>
                  <TrashIcon className="h-3.5 w-3.5" />
                  Clear All
                </Button>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* Clear All Confirmation */}
      {showClearConfirm && (
        <div className="rounded-xl bg-amber-50 border border-status-warning/30 px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-amber-600 font-medium">Clear all notifications? This cannot be undone.</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowClearConfirm(false)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={handleClearAll}>Clear All</Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
              activeTab === tab.key
                ? 'border-electric text-foreground'
                : 'border-transparent text-muted-foreground/80 hover:text-foreground hover:border-white/20'
            }`}
          >
            {tab.label}
            {tab.key === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredNotifications.length === 0 && (
        <Card variant="bordered" padding="lg">
          <EmptyState
            title={activeTab === 'all' ? 'No notifications yet' : 'No notifications in this category'}
            description={activeTab === 'all' ? 'System notifications will appear here when you receive job alerts, invoice updates, and more.' : 'Try switching to a different tab or check back later.'}
          />
        </Card>
      )}

      {/* Notification List */}
      {filteredNotifications.length > 0 && (
        <div className="rounded-xl ring-1 ring-black/5 bg-white overflow-hidden divide-y divide-border/50/50">
          {filteredNotifications.map((notif) => {
            const config = typeConfig[notif.type];
            const Icon = config.icon;
            return (
              <a
                key={notif.id}
                href={notif.href}
                onClick={() => handleMarkAsRead(notif.id)}
                className={`flex gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.02] cursor-pointer ${
                  !notif.read ? 'bg-primary/[0.02]' : ''
                }`}
              >
                {/* Icon */}
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  !notif.read ? 'bg-blue-tint' : 'bg-white/5'
                }`}>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm truncate ${
                      !notif.read ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground/80'
                    }`}>
                      {notif.title}
                    </p>
                    <span className="shrink-0 text-[11px] text-muted-foreground whitespace-nowrap">
                      {timeAgo(notif.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.description}</p>
                </div>

                {/* Unread dot */}
                {!notif.read && (
                  <div className="flex items-start pt-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                  </div>
                )}
              </a>
            );
          })}
        </div>
      )}

      {/* Footer Count */}
      {notifications.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Showing {filteredNotifications.length} of {notifications.length} notifications
        </p>
      )}
    </div>
  );
}