'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  Card,
  Input,
  TextArea,
  StatusBadge,
  Avatar,
  Modal,
  EmptyState,
  ErrorState,
} from '@/pkg/ui-components';
import { jobs, clients, teamMembers, activities } from '@/lib/mock-data';
import type { ActivityItem } from '@/lib/mock-data';
import type { Job } from '@/lib/mock-data';

/* ── Helpers ── */
function formatCurrency(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDateTime(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

const priorityStyles: Record<string, string> = {
  low: 'bg-steel/10 text-muted-foreground/80',
  medium: 'bg-accent-amber/10 text-amber-600',
  high: 'bg-red-50 text-red-600',
  urgent: 'bg-red-500/20 text-red-600 animate-pulse',
};

/* ── Timeline icon by type ── */
function TimelineIcon({ type }: { type: ActivityItem['type'] }) {
  const iconMap: Record<string, React.ReactNode> = {
    job_created: (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
    job_completed: (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    invoice_paid: (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    client_added: (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
    estimate_sent: (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  };
  return (
    <span className="flex items-center justify-center">
      {iconMap[type] || (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
    </span>
  );
}

/* ── Skeleton ── */
function SplitViewSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-pulse">
      <div className="lg:col-span-2 space-y-4">
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="h-5 w-72 rounded bg-muted" />
        <div className="h-32 rounded-xl bg-white ring-1 ring-black/5" />
        <div className="h-24 rounded-xl bg-white ring-1 ring-black/5" />
      </div>
      <div className="space-y-3">
        <div className="h-6 w-24 rounded bg-muted" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const jobId = params.id;

  /* ── Local job list for CRUD ── */
  const [jobList, setJobList] = useState<Job[]>([]);
  const [localNotes, setLocalNotes] = useState<ActivityItem[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);

  /* ── Edit Job Modal ── */
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [editEstimatedCost, setEditEstimatedCost] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editTechId, setEditTechId] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setJobList([...jobs]);
      const found = jobs.find((j) => j.id === jobId);
      if (!found) {
        setNotFound(true);
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [jobId]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setJobList([...jobs]);
      const found = jobs.find((j) => j.id === jobId);
      if (!found) setNotFound(true);
      setLoading(false);
    }, 300);
  };

  // Find the job from mock data (local state)
  const job = useMemo(() => jobList.find((j) => j.id === jobId), [jobId, jobList]);

  // Related client
  const client = useMemo(
    () => (job ? clients.find((c) => c.id === job.clientId) : null),
    [job]
  );

  // Related activities (filtered + local notes)
  const jobActivities = useMemo(() => {
    if (!job) return [];
    const related = activities.filter(
      (a) =>
        a.clientName === job.clientName ||
        a.description.toLowerCase().includes(job.clientName.toLowerCase())
    );
    // Merge local notes (typed as ActivityItem)
    const all = [...related, ...localNotes];
    return all.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [job, localNotes]);

  const techNames = useMemo(
    () =>
      job
        ? job.assignedTo
            .map((t) => teamMembers.find((m) => m.id === t))
            .filter(Boolean)
            .map((t) => t!.name)
            .join(', ')
        : '',
    [job]
  );

  /* ── Handle Add Note ── */
  const handleAddNote = () => {
    if (!noteText.trim()) return;
    const newNote: ActivityItem = {
      id: `NOTE-${Date.now()}`,
      type: 'job_created',
      description: noteText.trim(),
      timestamp: new Date().toISOString(),
      clientName: job?.clientName,
      userId: 'You',
    };
    setLocalNotes((prev) => [newNote, ...prev]);
    setNoteText('');
  };

  /* ── Handle Add Photo ── */
  const handleAddPhoto = () => {
    // For mock data, just add a placeholder image
    const placeholderColors = ['3b82f6', '10b981', 'f59e0b', 'ef4444', '8b5cf6', 'ec4899'];
    const color = placeholderColors[photos.length % placeholderColors.length];
    const newPhoto = `https://placehold.co/400x300/${color}/ffffff?text=Photo+${photos.length + 1}`;
    setPhotos((prev) => [...prev, newPhoto]);
  };

  /* ── Edit Job ── */
  const openEditJob = () => {
    if (!job) return;
    setEditTitle(job.title);
    setEditDescription(job.description);
    setEditPriority(job.priority);
    setEditEstimatedCost(String(job.estimatedCost));
    setEditDate(job.scheduledDate);
    setEditTime(job.scheduledTime ?? '');
    setEditTechId(job.assignedTo[0] ?? '');
    setShowEditModal(true);
  };

  const handleEditJob = () => {
    if (!job || !editTitle.trim() || !editDescription.trim()) return;
    setSavingEdit(true);
    setTimeout(() => {
      setJobList((prev) =>
        prev.map((j) =>
          j.id === job.id
            ? {
                ...j,
                title: editTitle.trim(),
                description: editDescription.trim(),
                priority: editPriority,
                estimatedCost: Number(editEstimatedCost) || 0,
                scheduledDate: editDate || j.scheduledDate,
                scheduledTime: editTime || undefined,
                assignedTo: editTechId ? [editTechId] : j.assignedTo,
              }
            : j
        )
      );
      setSavingEdit(false);
      setShowEditModal(false);
    }, 600);
  };

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <ErrorState title="Failed to load job" message={error} onRetry={handleRetry} />
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <SplitViewSkeleton />
      </div>
    );
  }

  // Not found
  if (notFound || !job) {
    return (
      <div className="p-6">
        <Card variant="bordered" padding="lg">
          <EmptyState
            title="Job not found"
            description={`No job exists with ID "${jobId}". It may have been deleted or the link is incorrect.`}
            action={<Button variant="outline" size="sm" onClick={() => router.push('/jobs')}>Back to Jobs</Button>}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Back link */}
      <button
        onClick={() => router.push('/jobs')}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground/80 hover:text-foreground transition-colors"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Jobs
      </button>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── LEFT PANEL: Job Info (2/3) ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">{job.id}</h1>
              <StatusBadge status={job.status} size="md" />
              <span
                className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full ${priorityStyles[job.priority] || 'bg-steel/10 text-muted-foreground/80'}`}
              >
                {job.priority}
              </span>
              {job.priority === 'urgent' && job.status !== 'completed' && (
                <span className="inline-flex items-center gap-1 text-xs text-red-600">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  Requires immediate attention
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{job.title}</p>
          </div>

          {/* Customer Info */}
          <Card variant="default" padding="md">
            <h3 className="text-sm font-semibold text-foreground mb-3">Customer</h3>
            <div className="flex items-center gap-3">
              <Avatar name={job.clientName} size="md" />
              <div>
                <button
                  onClick={() => router.push(`/clients/${client?.id || job.clientId}`)}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {job.clientName}
                </button>
                {client && (
                  <p className="text-xs text-muted-foreground">{client.email} · {client.phone}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Job Details */}
          <Card variant="default" padding="md">
            <h3 className="text-sm font-semibold text-foreground mb-3">Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Description</p>
                <p className="text-sm text-foreground">{job.description}</p>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Date & Time</p>
                  <p className="text-sm text-foreground">{formatDate(job.scheduledDate)}{job.scheduledTime ? ` at ${job.scheduledTime}` : ''}</p>
                  {job.completedDate && (
                    <p className="text-xs text-muted-foreground mt-0.5">Completed: {formatDate(job.completedDate)}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Address</p>
                  <p className="text-sm text-foreground">{job.address}</p>
                  <p className="text-xs text-muted-foreground">{job.city}, {job.state} {job.zip}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Assigned Tech(s)</p>
                  <p className="text-sm text-foreground">{techNames || 'Unassigned'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Photo Gallery */}
          <Card variant="default" padding="md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Photos</h3>
              <Button variant="secondary" size="sm" onClick={handleAddPhoto}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Photo
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={() => handleAddPhoto()}
            />
            {photos.length === 0 ? (
              <div className="flex items-center justify-center py-8 border border-dashed border-border rounded-xl bg-whiteer/30">
                <div className="text-center">
                  <svg className="mx-auto h-10 w-10 text-muted-foreground-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A1.5 1.5 0 0021.75 19.5V4.5A1.5 1.5 0 0020.25 3H3.75A1.5 1.5 0 002.25 4.5v15A1.5 1.5 0 003.75 21z" />
                  </svg>
                  <p className="mt-2 text-xs text-muted-foreground">No photos yet. Click &quot;Add Photo&quot; to upload.</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {photos.map((src, i) => (
                  <div key={i} className="shrink-0 relative group">
                    <img
                      src={src}
                      alt={`Job photo ${i + 1}`}
                      className="h-28 w-40 rounded-xl object-cover ring-1 ring-black/5"
                    />
                    <button
                      onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Pricing */}
          <Card variant="default" padding="md">
            <h3 className="text-sm font-semibold text-foreground mb-3">Pricing</h3>
            <div className="space-y-2">
              {job.actualCost !== undefined && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground/80">Labor</span>
                  <span className="text-sm text-foreground">{formatCurrency(job.actualCost - (job.materialsCost || 0))}</span>
                </div>
              )}
              {job.materialsCost !== undefined && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground/80">Parts / Materials</span>
                  <span className="text-sm text-foreground">{formatCurrency(job.materialsCost)}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-t border-border">
                <span className="text-sm font-semibold text-foreground">
                  {job.actualCost !== undefined ? 'Total (Actual)' : 'Estimated Total'}
                </span>
                <span className="text-base font-bold text-primary">
                  {formatCurrency(job.actualCost ?? job.estimatedCost)}
                </span>
              </div>
              {job.laborHours !== undefined && (
                <p className="text-xs text-muted-foreground">{job.laborHours} labor hours</p>
              )}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" onClick={openEditJob}>Edit Job</Button>
            <Button variant="secondary" size="sm">Create Invoice</Button>
            {job.status !== 'completed' && (
              <Button variant="primary" size="sm" onClick={() => setShowCompletion(true)}>Mark Complete</Button>
            )}
          </div>

          {/* ══ Job Completion Celebration ══ */}
          {showCompletion && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowCompletion(false)}>
              <div className="relative bg-white rounded-3xl p-8 text-center max-w-sm mx-4 shadow-2xl animate-in zoom-in-105" onClick={e => e.stopPropagation()}>
                {/* Confetti particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
                  {['🎉', '✨', '⭐', '🔧', '💵', '✅', '🎊', '🔥'].map((emoji, i) => (
                    <span
                      key={i}
                      className="absolute text-xl animate-bounce"
                      style={{
                        left: `${10 + i * 10}%`,
                        top: `${i % 2 === 0 ? '5%' : '15%'}`,
                        animationDelay: `${i * 0.15}s`,
                        animationDuration: '1.5s',
                      }}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
                <div className="relative z-10">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-200">
                    <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-1">Job Complete! 🎉</h2>
                  <p className="text-sm text-muted-foreground mb-2">{job.title} finished successfully.</p>
                  <p className="text-2xl font-bold text-emerald-600 mb-5">
                    {formatCurrency(job.actualCost || job.estimatedCost)}
                  </p>
                  <div className="space-y-2">
                    <Button size="lg" className="w-full" onClick={() => { setShowCompletion(false); }}>
                      Create Invoice
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowCompletion(false)}>
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL: Activity Timeline (1/3) ── */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Activity</h3>

          <div className="rounded-xl ring-1 ring-black/5 bg-white overflow-hidden">
            <div className="divide-y divide-white-border max-h-[500px] overflow-y-auto">
              {jobActivities.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
                </div>
              ) : (
                jobActivities.map((act) => {
                  const isStatusChange = act.type === 'job_created' || act.type === 'job_completed';
                  const isOwnNote = act.userId === 'You';
                  return (
                    <div
                      key={act.id}
                      className={`px-4 py-3 transition-colors ${
                        isStatusChange
                          ? 'bg-accent-amber/5 border-l-2 border-accent-amber'
                          : isOwnNote
                          ? 'bg-electric/5 border-l-2 border-electric'
                          : 'border-l-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 shrink-0 flex items-center justify-center w-6 h-6 rounded-full ${
                            isStatusChange
                              ? 'bg-accent-amber/20 text-amber-600'
                              : isOwnNote
                              ? 'bg-blue-tint text-primary'
                              : 'bg-muted text-muted-foreground/80'
                          }`}
                        >
                          <TimelineIcon type={act.type} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm ${isOwnNote ? 'text-primary font-medium' : 'text-foreground'}`}>
                            {act.description}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                            <span>{formatDateTime(act.timestamp)}</span>
                            <span>·</span>
                            <span className={`${isOwnNote ? 'text-primary font-medium' : 'text-primary'}`}>
                              {act.userId === 'You' ? 'You' : (teamMembers.find((m) => m.id === act.userId)?.name || act.userId || 'System')}
                            </span>
                            {act.amount !== undefined && (
                              <>
                                <span>·</span>
                                <span className="font-medium text-foreground">{formatCurrency(act.amount)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Note Input */}
            <div className="border-t border-border p-3">
              <div className="flex flex-col gap-2">
                <TextArea
                  placeholder="Add a note..."
                  rows={2}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddNote}
                    disabled={!noteText.trim()}
                  >
                    Post Note
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Mini card: job metadata */}
          <Card variant="bordered" padding="sm">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-steel">Created</span>
                <span className="text-foreground">{formatDate(job.createdAt)}</span>
              </div>
              {job.completedDate && (
                <div className="flex justify-between">
                  <span className="text-steel">Completed</span>
                  <span className="text-foreground">{formatDate(job.completedDate)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-steel">Client ID</span>
                <button
                  onClick={() => router.push(`/clients/${client?.id || job.clientId}`)}
                  className="text-primary hover:underline"
                >
                  {job.clientId}
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Edit Job Modal ── */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Job"
        description={`Editing ${job.id}: ${job.title}`}
        size="lg"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" loading={savingEdit} disabled={!editTitle.trim() || !editDescription.trim()} onClick={handleEditJob}>
              Update Job
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Title *"
            placeholder="Job title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <TextArea
            label="Description *"
            placeholder="Job description"
            rows={3}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-muted-foreground/80">Priority</label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')}
                className="w-full rounded-xl border border-white/10 bg-whiteer px-4 py-2.5 text-sm text-foreground outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Critical</option>
              </select>
            </div>
            <Input
              label="Estimated Cost ($)"
              type="number"
              placeholder="0"
              value={editEstimatedCost}
              onChange={(e) => setEditEstimatedCost(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Scheduled Date"
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
            />
            <Input
              label="Scheduled Time"
              type="time"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-muted-foreground/80">Assigned Tech</label>
            <select
              value={editTechId}
              onChange={(e) => setEditTechId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-whiteer px-4 py-2.5 text-sm text-foreground outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20"
            >
              <option value="">Unassigned</option>
              {teamMembers.map((tm) => (
                <option key={tm.id} value={tm.id}>{tm.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}