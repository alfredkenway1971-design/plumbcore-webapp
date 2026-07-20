'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  Input,
  StatusBadge,
  EmptyState,
  ErrorState,
  Modal,
} from '@/pkg/ui-components';
import { jobs, clients, teamMembers } from '@/lib/mock-data';
import type { Job } from '@/lib/mock-data';

/* ── Constants ── */
const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOUR_SLOTS = Array.from({ length: 14 }, (_, i) => i + 6); // 6 AM to 7 PM

const STATUS_COLORS: Record<string, string> = {
  'in-progress': 'border-l-2 border-electric bg-electric/8',
  scheduled: 'border-l-2 border-accent-amber bg-accent-amber/8',
  completed: 'border-l-2 border-status-success bg-green-500/8',
  urgent: 'border-l-2 border-status-error bg-red-500/8',
  cancelled: 'border-l-2 border-steel-dark bg-muted opacity-60',
};

const TEXT_COLORS: Record<string, string> = {
  'in-progress': 'text-primary',
  scheduled: 'text-amber-600',
  completed: 'text-green-600',
  urgent: 'text-red-600',
  cancelled: 'text-steel-dark',
};

/* ── Helpers ── */
function formatCurrency(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatTime(t?: string) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${m?.toString().padStart(2, '0') || '00'} ${ampm}`;
}

function getJobsForDate(allJobs: Job[], dateStr: string) {
  return allJobs.filter((j) => j.scheduledDate === dateStr);
}

/* ── Calendar Utilities ── */
function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay(); // 0=Sun
  const totalDays = lastDay.getDate();
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = [];
  for (let p = 0; p < startPad; p++) week.push(null);
  for (let d = 1; d <= totalDays; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) weeks.push(week);
  return weeks;
}

function formatDateStr(year: number, month: number, day: number) {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function isToday(year: number, month: number, day: number) {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;
}

function getWeekDates(ref: Date): string[] {
  const day = ref.getDay();
  const monOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(ref);
  monday.setDate(ref.getDate() + monOffset);
  monday.setHours(0, 0, 0, 0);
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

function addDays(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

/* ── Skeleton ── */
function SkeletonCalendar() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-9 w-24 rounded-xl bg-muted" />
        <div className="h-9 w-24 rounded-xl bg-muted" />
        <div className="h-9 w-24 rounded-xl bg-muted" />
      </div>
      <div className="h-10 w-full rounded-xl bg-muted" />
      <Card variant="default" padding="none">
        <div className="grid grid-cols-7 gap-px bg-white-border">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="bg-white p-2 min-h-[80px]">
              <div className="h-4 w-6 rounded bg-muted mb-2" />
              <div className="h-8 rounded bg-muted" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ── New Job Modal Content ── */
function NewJobForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [description, setDescription] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!title.trim() || !clientId) return;
    // In a real app this would dispatch to a store/API
    setSaved(true);
    setTimeout(() => onClose(), 800);
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-medium text-foreground">Job created successfully!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Client</label>
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="w-full rounded-xl ring-1 ring-black/5 bg-whiteer px-3 py-2.5 text-sm text-foreground outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20"
        >
          <option value="">Select a client...</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Job Title</label>
        <Input
          placeholder="e.g. Leak repair"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Description</label>
        <textarea
          placeholder="Brief description of the job..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-xl ring-1 ring-black/5 bg-whiteer px-3 py-2.5 text-sm text-foreground placeholder-steel-dark outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20 resize-none"
        />
      </div>
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" onClick={handleSave} disabled={!title.trim() || !clientId}>Create Job</Button>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function SchedulePage() {
  const router = useRouter();

  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'day' | 'week' | 'month'>('month');
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  });
  const [newJobModalOpen, setNewJobModalOpen] = useState(false);
  const [selectedSlotDate, setSelectedSlotDate] = useState('');

  // Simulate loading
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  // Navigation
  const goToday = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    setCurrentDate(now);
  };

  const goPrev = () => {
    if (view === 'day') setCurrentDate((d) => addDays(d, -1));
    else if (view === 'week') setCurrentDate((d) => addDays(d, -7));
    else setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const goNext = () => {
    if (view === 'day') setCurrentDate((d) => addDays(d, 1));
    else if (view === 'week') setCurrentDate((d) => addDays(d, 7));
    else setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  // Header label
  const headerLabel = useMemo(() => {
    if (view === 'day') {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
    if (view === 'week') {
      const weekDates = getWeekDates(currentDate);
      const start = new Date(weekDates[0]);
      const end = new Date(weekDates[6]);
      const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${fmt(start)} — ${fmt(end)}, ${end.getFullYear()}`;
    }
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [view, currentDate]);

  // Week dates
  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);

  // Month grid
  const monthGrid = useMemo(() => getMonthGrid(currentDate.getFullYear(), currentDate.getMonth()), [currentDate]);

  // Today's date string
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const handleSlotClick = useCallback((dateStr: string) => {
    setSelectedSlotDate(dateStr);
    setNewJobModalOpen(true);
  }, []);

  // Empty check
  const hasJobsThisPeriod = useMemo(() => {
    if (view === 'month') {
      const grid = getMonthGrid(currentDate.getFullYear(), currentDate.getMonth());
      const allDates = grid.flat().filter(Boolean) as number[];
      return allDates.some((d) => {
        const ds = formatDateStr(currentDate.getFullYear(), currentDate.getMonth(), d);
        return getJobsForDate(jobs, ds).length > 0;
      });
    }
    if (view === 'week') {
      return weekDates.some((d) => getJobsForDate(jobs, d).length > 0);
    }
    // day
    const ds = currentDate.toISOString().split('T')[0];
    return getJobsForDate(jobs, ds).length > 0;
  }, [view, currentDate]);

  /* ── Error State ── */
  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Failed to load schedule"
          message={error}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <SkeletonCalendar />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Schedule</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Plan and dispatch jobs on the calendar</p>
        </div>
        <Button size="sm" onClick={() => { setSelectedSlotDate(''); setNewJobModalOpen(true); }}>
          + New Job
        </Button>
      </div>

      {/* View Toggle + Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* View toggles */}
        <div className="flex items-center gap-1 rounded-xl bg-whiteer p-1 w-fit">
          {(['day', 'week', 'month'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all capitalize ${
                view === v
                  ? 'bg-electric text-[#0a0e2a] shadow-sm'
                  : 'text-muted-foreground/80 hover:text-foreground'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Nav */}
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            className="rounded-xl p-2 text-muted-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToday}
            className="rounded-xl px-3 py-1.5 text-xs font-semibold text-primary border border-electric/30 hover:bg-blue-50 transition-colors"
          >
            Today
          </button>
          <span className="min-w-[180px] text-center text-sm font-semibold text-foreground">
            {headerLabel}
          </span>
          <button
            onClick={goNext}
            className="rounded-xl p-2 text-muted-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── MONTH VIEW ── */}
      {view === 'month' && (
        <>
          {!hasJobsThisPeriod ? (
            <Card variant="bordered" padding="lg">
              <EmptyState
                title="No jobs this month"
                description="There are no jobs scheduled for this period."
                action={<Button size="sm" onClick={() => { setSelectedSlotDate(''); setNewJobModalOpen(true); }}>Create First Job</Button>}
              />
            </Card>
          ) : (
            <Card variant="default" padding="none" className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-[560px]">
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-border">
                {DAY_NAMES_SHORT.map((day) => (
                  <div key={day} className="px-2 py-2.5 text-center border-r border-border last:border-r-0">
                    <p className="text-[11px] font-semibold uppercase text-muted-foreground">{day}</p>
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="divide-y divide-white-border">
                {monthGrid.map((week, wi) => (
                  <div key={wi} className="grid grid-cols-7 divide-x divide-white-border">
                    {week.map((day, di) => {
                      if (day === null) {
                        return <div key={`empty-${di}`} className="min-h-[100px] bg-whiteer/30" />;
                      }
                      const dateStr = formatDateStr(currentDate.getFullYear(), currentDate.getMonth(), day);
                      const dayJobs = getJobsForDate(jobs, dateStr);
                      const today = isToday(currentDate.getFullYear(), currentDate.getMonth(), day);

                      return (
                        <div
                          key={dateStr}
                          onClick={() => handleSlotClick(dateStr)}
                          className={`min-h-[100px] p-1.5 cursor-pointer transition-colors hover:bg-muted ${
                            today ? 'ring-1 ring-electric/60 ring-inset' : ''
                          }`}
                        >
                          <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold mb-1 ${
                            today ? 'bg-electric text-[#0a0e2a]' : 'text-muted-foreground/80'
                          }`}>
                            {day}
                          </div>
                          <div className="space-y-1">
                            {dayJobs.slice(0, 3).map((job) => (
                              <div
                                key={job.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/jobs/${job.id}`);
                                }}
                                className={`rounded px-1.5 py-0.5 cursor-pointer transition-all hover:brightness-110 ${STATUS_COLORS[job.status] || 'border-l-2 border-steel bg-muted'}`}
                              >
                                <p className="text-[10px] font-semibold text-foreground truncate">{job.title}</p>
                                <p className="text-[9px] text-muted-foreground/80 truncate">{job.clientName}</p>
                              </div>
                            ))}
                            {dayJobs.length > 3 && (
                              <p className="text-[9px] text-primary pl-1">+{dayJobs.length - 3} more</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            </Card>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-whiteer flex-wrap">
            <span className="text-[11px] text-muted-foreground">Legend:</span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-electric/30" /> In Progress
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-accent-amber/30" /> Scheduled
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-green-500/30" /> Completed
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-500/30" /> Urgent
            </span>
          </div>
        </>
      )}

      {/* ── WEEK VIEW ── */}
      {view === 'week' && (
        <>
          {!hasJobsThisPeriod ? (
            <Card variant="bordered" padding="lg">
              <EmptyState
                title="No jobs this week"
                description="There are no jobs scheduled for this week."
                action={<Button size="sm" onClick={() => { setSelectedSlotDate(''); setNewJobModalOpen(true); }}>Create First Job</Button>}
              />
            </Card>
          ) : (
            <div className="rounded-xl ring-1 ring-black/5 bg-white overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-[560px]">
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-border">
                {weekDates.map((date, i) => {
                  const dateObj = new Date(date);
                  const isTodayDate = date === todayStr;
                  return (
                    <div
                      key={date}
                      className={`px-2 py-3 text-center border-r border-border last:border-r-0 ${
                        isTodayDate ? 'bg-electric/8' : ''
                      }`}
                    >
                      <p className="text-[10px] font-semibold uppercase text-muted-foreground">{DAY_NAMES_SHORT[i]}</p>
                      <p className={`text-base font-bold mt-0.5 ${isTodayDate ? 'text-primary' : 'text-foreground'}`}>
                        {dateObj.getDate()}
                      </p>
                      <p className="text-[9px] text-muted-foreground-dark">{dateObj.toLocaleDateString('en-US', { month: 'short' })}</p>
                    </div>
                  );
                })}
              </div>

              {/* Body */}
              <div className="grid grid-cols-7 divide-x divide-white-border">
                {weekDates.map((date) => {
                  const dayJobs = getJobsForDate(jobs, date);
                  return (
                    <div
                      key={date}
                      onClick={() => handleSlotClick(date)}
                      className="min-h-[400px] p-1.5 space-y-1.5 cursor-pointer hover:bg-muted transition-colors"
                    >
                      {dayJobs.length === 0 && (
                        <p className="text-[10px] text-muted-foreground-dark text-center pt-8">—</p>
                      )}
                      {dayJobs.map((job) => {
                        const techNames = job.assignedTo
                          .map((t) => teamMembers.find((m) => m.id === t)?.name?.split(' ')[0] || t)
                          .join(', ');
                        return (
                          <div
                            key={job.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/jobs/${job.id}`);
                            }}
                            className={`rounded-xl px-2 py-1.5 cursor-pointer transition-all hover:brightness-110 ${STATUS_COLORS[job.status] || 'border-l-2 border-steel bg-muted'}`}
                          >
                            <p className="text-[11px] font-semibold text-foreground truncate">{job.title}</p>
                            <p className="text-[10px] text-muted-foreground/80 truncate">{job.clientName}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              {job.scheduledTime && (
                                <span className="text-[9px] text-muted-foreground">{formatTime(job.scheduledTime)}</span>
                              )}
                              <span className={`text-[9px] font-medium ${TEXT_COLORS[job.status] || 'text-steel'}`}>
                                {job.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-whiteer flex-wrap">
            <span className="text-[11px] text-muted-foreground">Legend:</span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
              <span className="inline-block w-2.5 h-2.5 rounded bg-electric/30" /> In Progress
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
              <span className="inline-block w-2.5 h-2.5 rounded bg-accent-amber/30" /> Scheduled
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
              <span className="inline-block w-2.5 h-2.5 rounded bg-green-500/30" /> Completed
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
              <span className="inline-block w-2.5 h-2.5 rounded bg-red-500/30" /> Urgent
            </span>
          </div>
        </>
      )}

      {/* ── DAY VIEW ── */}
      {view === 'day' && (
        <>
          {(() => {
            const dateStr = currentDate.toISOString().split('T')[0];
            const dayJobs = getJobsForDate(jobs, dateStr);
            return (
              <>
                {dayJobs.length === 0 ? (
                  <Card variant="bordered" padding="lg">
                    <EmptyState
                      title="No jobs on this day"
                      description={currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      action={<Button size="sm" onClick={() => handleSlotClick(dateStr)}>Create Job for This Day</Button>}
                    />
                  </Card>
                ) : (
                  <div className="rounded-xl ring-1 ring-black/5 bg-white overflow-hidden">
                    {/* Timeline */}
                    <div className="divide-y divide-white-border">
                      {HOUR_SLOTS.map((hour) => {
                        const hourStr = `${String(hour).padStart(2, '0')}:00`;
                        const jobsAtHour = dayJobs.filter(
                          (j) => j.scheduledTime?.startsWith(String(hour).padStart(2, '0'))
                        );
                        const ampm = hour >= 12 ? 'PM' : 'AM';
                        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

                        return (
                          <div
                            key={hour}
                            onClick={() => handleSlotClick(dateStr)}
                            className="flex min-h-[60px] cursor-pointer transition-colors hover:bg-muted group"
                          >
                            {/* Time label */}
                            <div className="w-16 shrink-0 border-r border-border px-2 py-2 text-right">
                              <span className="text-[11px] font-medium text-muted-foreground">{displayHour}{ampm}</span>
                            </div>
                            {/* Slot content */}
                            <div className="flex-1 px-3 py-1.5 space-y-1">
                              {jobsAtHour.length === 0 && (
                                <div className="flex items-center justify-center h-full opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="text-[10px] text-muted-foreground-dark">+ Click to add job</span>
                                </div>
                              )}
                              {jobsAtHour.map((job) => {
                                const techNames = job.assignedTo
                                  .map((t) => teamMembers.find((m) => m.id === t)?.name?.split(' ')[0] || t)
                                  .join(', ');
                                return (
                                  <div
                                    key={job.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/jobs/${job.id}`);
                                    }}
                                    className={`rounded-xl px-3 py-2 cursor-pointer transition-all hover:brightness-110 ${STATUS_COLORS[job.status] || 'border-l-2 border-steel bg-muted'}`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-semibold text-foreground">{job.title}</p>
                                      <span className={`text-[11px] font-medium ${TEXT_COLORS[job.status]}`}>
                                        {job.status}
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground/80">{job.clientName}</p>
                                    <div className="flex items-center gap-3 mt-0.5">
                                      <span className="text-[11px] text-muted-foreground">{techNames}</span>
                                      <span className="text-[11px] font-semibold text-foreground">{formatCurrency(job.estimatedCost)}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Legend */}
                <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-whiteer flex-wrap">
                  <span className="text-[11px] text-muted-foreground">Legend:</span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
                    <span className="inline-block w-2.5 h-2.5 rounded bg-electric/30" /> In Progress
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
                    <span className="inline-block w-2.5 h-2.5 rounded bg-accent-amber/30" /> Scheduled
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
                    <span className="inline-block w-2.5 h-2.5 rounded bg-green-500/30" /> Completed
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
                    <span className="inline-block w-2.5 h-2.5 rounded bg-red-500/30" /> Urgent
                  </span>
                </div>
              </>
            );
          })()}
        </>
      )}

      {/* ── New Job Modal ── */}
      <Modal
        open={newJobModalOpen}
        onClose={() => setNewJobModalOpen(false)}
        title={selectedSlotDate ? `New Job — ${new Date(selectedSlotDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'New Job'}
        description="Fill in the details to create a new job."
      >
        <NewJobForm onClose={() => setNewJobModalOpen(false)} />
      </Modal>
    </div>
  );
}