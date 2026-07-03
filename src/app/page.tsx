'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Button, Card, Input, TextArea, StatusBadge, Avatar, EmptyState, ErrorState, Modal } from '@plumbcore/ui-components';

/* ── Sample data ── */
const activityData = [
  { job: 'Main line repair', customer: '123 Oak St — Johnson', status: 'completed' as const, time: '2h ago', amount: '$245' },
  { job: 'Water heater install', customer: '456 Maple Ave — Davis', status: 'in-progress' as const, time: '3h ago', amount: '$890' },
  { job: 'Leak detection & fix', customer: '789 Pine Rd — Wilson', status: 'scheduled' as const, time: 'Tomorrow', amount: '$180' },
  { job: 'Sewer line backup', customer: '321 Elm St — Garcia', status: 'urgent' as const, time: '30m ago', amount: '$560' },
  { job: 'Faucet replacement', customer: '654 Birch Ln — Thompson', status: 'completed' as const, time: '5h ago', amount: '$95' },
];

const techs = [
  { name: 'James Wilson', jobs: 4, status: 'online' as const },
  { name: 'Mike Torres', jobs: 5, status: 'busy' as const },
  { name: 'Carlos Ruiz', jobs: 3, status: 'away' as const },
];

/* ── Metrics ── */
const metrics = [
  { label: 'Active Jobs Today', value: '12', change: '+3', icon: Wrench, color: 'electric' as const },
  { label: 'Revenue (Today)', value: '$3,245', change: '+12%', icon: Dollar, color: 'green' as const },
  { label: 'Pending Estimates', value: '5', change: '+2', icon: File, color: 'amber' as const },
  { label: 'Satisfaction Rate', value: '98%', change: '+1.2%', icon: Check, color: 'electric' as const },
];

/* ── Metric Card ── */
function MetricCard({ label, value, change, icon: Icon, color }: { label: string; value: string; change: string; icon: React.FC<{ className?: string }>; color: string }) {
  const colorMap: Record<string, string> = { electric: 'bg-electric/10 text-electric', green: 'bg-status-success/10 text-status-success', amber: 'bg-status-warning/10 text-status-warning' };
  return (
    <Card variant="default" padding="md" hover>
      <div className="flex items-start justify-between">
        <div className={`rounded-lg p-2 ${colorMap[color] || colorMap.electric}`}><Icon className="h-5 w-5" /></div>
        <span className={`text-xs font-medium ${change.startsWith('+') ? 'text-status-success' : 'text-status-error'}`}>{change}</span>
      </div>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
      <p className="mt-0.5 text-sm text-steel">{label}</p>
    </Card>
  );
}

/* ── Estimate Card ── */
function EstimateCard() {
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!desc.trim()) return; setLoading(true); setTimeout(() => setLoading(false), 2000); };
  return (
    <Card variant="default" padding="lg" hover>
      <div className="mb-4 flex items-center space-x-3">
        <div className="rounded-lg bg-electric/10 p-2">
          <svg className="h-5 w-5 text-electric" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>
        </div>
        <div><h3 className="font-semibold text-white">AI Estimate Generator</h3><p className="text-xs text-steel">Describe the issue or upload a photo</p></div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <TextArea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Describe the plumbing issue…" rows={3} />
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button type="submit" loading={loading} disabled={!desc.trim()}>Generate Estimate</Button>
          <Button variant="outline" type="button" icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}>Upload Photo</Button>
        </div>
      </form>
    </Card>
  );
}

/* ── Dashboard Page ── */
export default function DashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-surface">
      <Sidebar mobileOpen={mobileOpen} />

      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="flex h-14 sm:h-16 shrink-0 items-center justify-between border-b border-white-border bg-surface-light/50 px-4 sm:px-8 backdrop-blur-sm">
          <div className="flex items-center space-x-3 min-w-0">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden rounded-lg p-2 text-steel-light hover:bg-white-subtle hover:text-white transition-colors">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                {mobileOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></>}
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold text-white truncate">Dashboard</h1>
              <p className="text-[11px] sm:text-xs text-steel hidden xs:block">Welcome back, Amer — here&apos;s your business at a glance.</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 rounded-lg border border-white-border bg-surface-lighter px-3 py-2">
              <svg className="h-4 w-4 text-steel" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Search jobs, customers…" className="w-36 xl:w-48 bg-transparent text-xs text-white placeholder-steel/50 outline-none" />
            </div>
            <button className="relative rounded-lg p-2 text-steel-light hover:bg-white-subtle hover:text-white transition-colors">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span className="absolute right-2 top-2 flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-electric opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-electric" /></span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 lg:space-y-8">
          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {metrics.map((m) => <MetricCard key={m.label} {...m} />)}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            <div className="lg:col-span-2"><EstimateCard /></div>

            {/* Side widgets */}
            <div className="space-y-4">
              <Card variant="default" padding="md">
                <h3 className="mb-3 text-sm font-semibold text-white">Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    { label: 'New Job', icon: Plus, desc: 'Create a work order' },
                    { label: 'Add Customer', icon: UserPlus, desc: 'Register in CRM' },
                    { label: 'Schedule', icon: Clock, desc: 'Plan tomorrow' },
                  ].map((a) => (
                    <button key={a.label} className="flex w-full items-center space-x-3 rounded-lg border border-white-border px-3 py-2.5 text-left transition-all hover:border-electric/20 hover:bg-electric/5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-electric/10"><a.icon className="h-4 w-4 text-electric" /></div>
                      <div><p className="text-sm font-medium text-white">{a.label}</p><p className="text-xs text-steel">{a.desc}</p></div>
                    </button>
                  ))}
                </div>
              </Card>

              <Card variant="default" padding="md">
                <h3 className="mb-3 text-sm font-semibold text-white">Techs on Duty</h3>
                <div className="space-y-3">
                  {techs.map((t) => (
                    <div key={t.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <Avatar name={t.name} size="sm" status={t.status} />
                        <p className="text-sm text-white">{t.name}</p>
                      </div>
                      <p className="text-xs text-steel">{t.jobs} jobs</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Demo: Open Modal */}
              <button onClick={() => setModalOpen(true)} className="w-full text-left">
                <Card variant="bordered" padding="sm" hover>
                  <div className="flex items-center space-x-2 text-sm text-steel-light"><span>🧪</span><span>Open Modal Demo</span></div>
                </Card>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-white">Recent Activity</h2>
                <p className="text-xs text-steel">Latest jobs and updates from the field</p>
              </div>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="space-y-2">
              {activityData.map((item) => (
                <div key={item.job + item.customer} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-white-border bg-surface-card/50 px-4 py-3 transition-all hover:border-white/10 gap-2">
                  <div className="flex items-center space-x-3 min-w-0">
                    <Avatar name={item.customer.split(' — ')[1] || 'C'} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.job}</p>
                      <p className="text-xs text-steel truncate">{item.customer}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-3 ml-11 sm:ml-0">
                    <StatusBadge status={item.status} size="sm" />
                    <span className="text-sm font-semibold text-white">{item.amount}</span>
                    <span className="text-xs text-steel/60">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Demo: EmptyState + ErrorState */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card variant="bordered" padding="md">
              <EmptyState title="No estimates yet" description="Create your first AI estimate to get started." />
            </Card>
            <Card variant="bordered" padding="md">
              <ErrorState title="Sync failed" message="Could not connect to the server. Please try again." onRetry={() => {}} />
            </Card>
          </div>
        </div>
      </main>

      {/* Modal Demo */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Job" description="Create a new plumbing work order" size="md"
        footer={<><Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button><Button>Create Job</Button></>}>
        <div className="space-y-4">
          <Input label="Customer Name" placeholder="e.g. Jane Doe" />
          <Input label="Address" placeholder="e.g. 123 Main St" />
          <TextArea label="Job Description" placeholder="Describe the issue…" rows={3} />
        </div>
      </Modal>
    </div>
  );
}

/* ── Small icons ── */
function Wrench({ className }: { className?: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.66 5.66a2 2 0 11-2.83-2.83l5.66-5.66M14.83 5.17l-2.83 2.83 5.66 5.66 2.83-2.83M18.36 2.14a2 2 0 112.83 2.83L14.83 11.4l-2.83-2.83 6.36-6.43z" /></svg>; }
function Dollar({ className }: { className?: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; }
function File({ className }: { className?: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>; }
function Check({ className }: { className?: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; }
function Plus({ className }: { className?: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>; }
function UserPlus({ className }: { className?: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>; }
function Clock({ className }: { className?: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; }