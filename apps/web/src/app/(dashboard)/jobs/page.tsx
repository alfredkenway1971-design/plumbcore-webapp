'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  Input,
  TextArea,
  StatusBadge,
  Modal,
  EmptyState,
  ErrorState,
} from '@/pkg/ui-components';
import { jobs, clients, teamMembers } from '@/lib/mock-data';
import type { Job, JobStatus } from '@/lib/mock-data';
import AddressAutocomplete from '@/components/AddressAutocomplete';

/* ── Helpers ── */
function formatCurrency(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getDayName(d: string) {
  return new Date(d).toLocaleDateString('en-US', { weekday: 'short' });
}

function getDayNumber(d: string) {
  return new Date(d).getDate();
}

function getDayIndex(d: string) {
  return new Date(d).getDay(); // 0=Sun, 1=Mon, ...
}

const statusFilterOptions = ['All', 'Scheduled', 'In Progress', 'Completed', 'Urgent', 'Cancelled'] as const;

const priorityFilterOptions = ['All', 'Low', 'Medium', 'High', 'Critical'] as const;

const statusMap: Record<string, JobStatus | 'all'> = {
  'All': 'all',
  'Scheduled': 'scheduled',
  'In Progress': 'in-progress',
  'Completed': 'completed',
  'Urgent': 'urgent',
  'Cancelled': 'cancelled',
};

const priorityStyles: Record<string, string> = {
  low: 'bg-steel/10 text-muted-foreground/80',
  medium: 'bg-accent-amber/10 text-amber-600',
  high: 'bg-red-50 text-red-600',
  critical: 'bg-red-500/20 text-red-600',
};

const calendarColorMap: Record<string, string> = {
  'in-progress': 'border-l-2 border-electric bg-electric/5',
  'scheduled': 'border-l-2 border-accent-amber bg-accent-amber/5',
  'completed': 'border-l-2 border-status-success bg-green-500/5',
  'urgent': 'border-l-2 border-status-error bg-red-500/5',
  'cancelled': 'border-l-2 border-steel-dark bg-muted opacity-60',
};

/* ── Skeleton Row ── */
function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 animate-pulse">
      <div className="h-4 w-20 rounded bg-muted" />
      <div className="h-4 w-32 rounded bg-muted" />
      <div className="h-4 w-48 rounded bg-muted hidden md:block" />
      <div className="h-4 w-24 rounded bg-muted hidden lg:block" />
      <div className="h-5 w-24 rounded-full bg-muted" />
      <div className="h-4 w-24 rounded bg-muted hidden lg:block" />
      <div className="h-4 w-28 rounded bg-muted hidden lg:block" />
      <div className="h-4 w-16 rounded bg-muted" />
      <div className="h-4 w-20 rounded bg-muted" />
    </div>
  );
}

/* ── Skeleton Calendar ── */
function SkeletonCalendar() {
  return (
    <div className="grid grid-cols-7 gap-1 animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="space-y-2 p-2">
          <div className="h-4 w-full rounded bg-muted" />
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} className="h-12 w-full rounded bg-muted" />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── Main Page ── */
export default function JobsPage() {
  const router = useRouter();

  // Simulated loading & error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View mode
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [techFilter, setTechFilter] = useState<string>('All');

  // Sort
  const [sortField, setSortField] = useState<string>('scheduledDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  /* ── Job list state (local CRUD) ── */
  const [jobList, setJobList] = useState<Job[]>([]);

  /* ── Create Job Modal ── */
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newClientId, setNewClientId] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newZip, setNewZip] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newTechId, setNewTechId] = useState('');
  const [newEstimatedCost, setNewEstimatedCost] = useState('');

  /* ── Voice Input ── */
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'processing'>('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const handleVoiceInput = useCallback(() => {
    setVoiceError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('Speech recognition not supported in this browser. Use Chrome on desktop/Android.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceState('processing');
      setNewDescription(transcript + '...'); // show raw text while processing

      try {
        const res = await fetch('/api/ai/voice-to-job', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: transcript }),
        });
        const data = await res.json();
        if (data.title) setNewTitle(data.title);
        if (data.description) setNewDescription(data.description);
        if (data.suggestedClient) {
          const match = clients.find(c =>
            c.name.toLowerCase().includes(data.suggestedClient.toLowerCase()) ||
            data.suggestedClient.toLowerCase().includes(c.name.toLowerCase())
          );
          if (match) setNewClientId(match.id);
        }
        if (data.suggestedAddress) {
          setNewAddress(data.suggestedAddress);
        }
      } catch {
        setVoiceError('AI processing failed. Text captured, but couldn\'t auto-fill fields.');
      }
      setVoiceState('idle');
    };

    recognition.onerror = (event: any) => {
      setVoiceState('idle');
      if (event.error === 'not-allowed') setVoiceError('Microphone access denied. Allow microphone in your browser settings.');
      else if (event.error === 'no-speech') setVoiceError('No speech detected. Try again.');
      else setVoiceError(`Error: ${event.error}. Try typing instead.`);
    };

    recognition.onend = () => {
      if (voiceState === 'listening') {
        // only reset if we haven't already transitioned to processing
        setVoiceState(prev => prev === 'listening' ? 'idle' : prev);
      }
    };

    recognitionRef.current = recognition;
    setVoiceState('listening');
    recognition.start();
  }, [clients, voiceState]);

  /* ── Edit Job Modal ── */
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [editEstimatedCost, setEditEstimatedCost] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editTechId, setEditTechId] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  /* ── Delete Confirmation ── */
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setJobList([...jobs]);
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setJobList([...jobs]);
      setLoading(false);
    }, 400);
  };

  // Derive tech filter options
  const techOptions = useMemo(() => {
    const names = new Set<string>();
    jobList.forEach((j) => j.assignedTo.forEach((tId) => {
      const tm = teamMembers.find((m) => m.id === tId);
      if (tm) names.add(tm.name);
    }));
    return ['All', ...Array.from(names).sort()];
  }, [jobList]);

  // Filter + Sort logic
  const filteredJobs = useMemo(() => {
    let result = [...jobList];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.id.toLowerCase().includes(q) ||
          j.clientName.toLowerCase().includes(q) ||
          j.title.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q)
      );
    }

    // Status filter
    const mappedStatus = statusMap[statusFilter];
    if (mappedStatus && mappedStatus !== 'all') {
      result = result.filter((j) => j.status === mappedStatus);
    }

    // Priority filter
    if (priorityFilter !== 'All') {
      const mapped = priorityFilter.toLowerCase() as Job['priority'];
      result = result.filter((j) => j.priority === mapped);
    }

    // Tech filter
    if (techFilter !== 'All') {
      const tm = teamMembers.find((m) => m.name === techFilter);
      if (tm) {
        result = result.filter((j) => j.assignedTo.includes(tm.id));
      }
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'id') cmp = a.id.localeCompare(b.id);
      else if (sortField === 'clientName') cmp = a.clientName.localeCompare(b.clientName);
      else if (sortField === 'scheduledDate') cmp = a.scheduledDate.localeCompare(b.scheduledDate);
      else if (sortField === 'status') cmp = a.status.localeCompare(b.status);
      else if (sortField === 'priority') cmp = a.priority.localeCompare(b.priority);
      else if (sortField === 'estimatedCost') cmp = a.estimatedCost - b.estimatedCost;
      else if (sortField === 'assignedTo') {
        const aNames = a.assignedTo.map((t) => teamMembers.find((m) => m.id === t)?.name || t).join(', ');
        const bNames = b.assignedTo.map((t) => teamMembers.find((m) => m.id === t)?.name || t).join(', ');
        cmp = aNames.localeCompare(bNames);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [search, statusFilter, priorityFilter, techFilter, sortField, sortDir, jobList]);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setTechFilter('All');
  };

  const hasActiveFilters = search.trim() || statusFilter !== 'All' || priorityFilter !== 'All' || techFilter !== 'All';

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  function SortIcon({ field }: { field: string }) {
    if (sortField !== field) return <span className="ml-1 text-muted-foreground-dark">↕</span>;
    return <span className="ml-1 text-primary">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  }

  function SortableTh({ field, children }: { field: string; children: React.ReactNode }) {
    return (
      <th
        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
        onClick={() => toggleSort(field)}
      >
        {children}
        <SortIcon field={field} />
      </th>
    );
  }

  /* ── Create Job ── */
  const resetCreateForm = () => {
    setNewTitle('');
    setNewDescription('');
    setNewClientId('');
    setNewPriority('medium');
    setNewAddress('');
    setNewCity('');
    setNewState('');
    setNewZip('');
    setNewDate('');
    setNewTime('');
    setNewTechId('');
    setNewEstimatedCost('');
  };

  const handleCreateJob = () => {
    if (!newTitle.trim() || !newDescription.trim() || !newClientId) return;
    setCreating(true);
    setTimeout(() => {
      const selectedClient = clients.find((c) => c.id === newClientId);
      const newId = `JOB-${String(jobList.length + 1).padStart(3, '0')}`;
      const newJob: Job = {
        id: newId,
        clientId: newClientId,
        clientName: selectedClient?.name ?? 'Unknown',
        title: newTitle.trim(),
        description: newDescription.trim(),
        status: 'scheduled',
        priority: newPriority,
        assignedTo: newTechId ? [newTechId] : [],
        address: newAddress.trim() || selectedClient?.address || '',
        city: newCity.trim() || selectedClient?.city || '',
        state: newState.trim() || selectedClient?.state || '',
        zip: newZip.trim() || selectedClient?.zip || '',
        scheduledDate: newDate || new Date().toISOString().split('T')[0],
        scheduledTime: newTime || undefined,
        estimatedCost: Number(newEstimatedCost) || 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setJobList((prev) => [newJob, ...prev]);
      setCreating(false);
      setShowCreateModal(false);
      resetCreateForm();
    }, 600);
  };

  const createFormValid = newTitle.trim() && newDescription.trim() && newClientId;

  /* ── Edit Job ── */
  const openEditJob = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingJob(job);
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
    if (!editingJob || !editTitle.trim() || !editDescription.trim()) return;
    setSavingEdit(true);
    setTimeout(() => {
      setJobList((prev) =>
        prev.map((j) =>
          j.id === editingJob.id
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
      setEditingJob(null);
    }, 600);
  };

  /* ── Delete Job ── */
  const handleDeleteJob = (id: string) => {
    setJobList((prev) => prev.filter((j) => j.id !== id));
    setShowDeleteConfirm(null);
  };

  // ── Calendar helpers
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const calendarDates = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + monOffset);
    monday.setHours(0, 0, 0, 0);

    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  const jobsByDay = useMemo(() => {
    const map: Record<string, Job[]> = {};
    calendarDates.forEach((d) => { map[d] = []; });
    jobList.forEach((j) => {
      if (map[j.scheduledDate]) {
        map[j.scheduledDate].push(j);
      }
    });
    return map;
  }, [calendarDates, jobList]);

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Failed to load jobs"
          message={error}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-5">
        {/* Tabs skeleton */}
        <div className="flex items-center gap-4">
          <div className="h-9 w-24 rounded-xl bg-muted animate-pulse" />
          <div className="h-9 w-28 rounded-xl bg-muted animate-pulse" />
        </div>
        {/* Search skeleton */}
        <div className="h-10 w-full max-w-md rounded-xl bg-muted animate-pulse" />
        {/* Table skeleton */}
        <Card variant="default" padding="sm">
          <div className="divide-y divide-white-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Jobs & Schedule</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and dispatch jobs to your team</p>
        </div>
        <Button size="sm" onClick={() => { resetCreateForm(); setShowCreateModal(true); }}>+ New Job</Button>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-1 rounded-xl bg-whiteer p-1 w-fit">
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
            viewMode === 'list'
              ? 'bg-electric text-[#0a0e2a] shadow-sm'
              : 'text-muted-foreground/80 hover:text-foreground'
          }`}
        >
          List View
        </button>
        <button
          onClick={() => setViewMode('calendar')}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
            viewMode === 'calendar'
              ? 'bg-electric text-[#0a0e2a] shadow-sm'
              : 'text-muted-foreground/80 hover:text-foreground'
          }`}
        >
          Schedule View
        </button>
      </div>

      {/* Enhanced Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search jobs by ID, customer, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl ring-1 ring-black/5 bg-whiteer px-3 py-2.5 text-sm text-foreground outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20"
        >
          {statusFilterOptions.map((opt) => (
            <option key={opt} value={opt}>{opt === 'All' ? 'All Statuses' : opt}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-xl ring-1 ring-black/5 bg-whiteer px-3 py-2.5 text-sm text-foreground outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20"
        >
          {priorityFilterOptions.map((opt) => (
            <option key={opt} value={opt}>{opt === 'All' ? 'All Priorities' : opt}</option>
          ))}
        </select>
        <select
          value={techFilter}
          onChange={(e) => setTechFilter(e.target.value)}
          className="rounded-xl ring-1 ring-black/5 bg-whiteer px-3 py-2.5 text-sm text-foreground outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20"
        >
          {techOptions.map((opt) => (
            <option key={opt} value={opt}>{opt === 'All' ? 'All Techs' : opt}</option>
          ))}
        </select>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* ── LIST VIEW ── */}
      {viewMode === 'list' && (
        <>
          {filteredJobs.length === 0 ? (
            <Card variant="bordered" padding="lg">
              <EmptyState
                title="No jobs found"
                description={search || statusFilter !== 'All' || techFilter !== 'All' || priorityFilter !== 'All' ? 'Try adjusting your filters.' : 'No jobs scheduled yet. Create your first job.'}
                action={<Button size="sm" onClick={() => { resetCreateForm(); setShowCreateModal(true); }}>Create First Job</Button>}
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {/* Mobile card layout */}
              <div className="sm:hidden space-y-3">
                {filteredJobs.map((job) => {
                  const techNames = job.assignedTo
                    .map((t) => teamMembers.find((m) => m.id === t)?.name || t)
                    .join(', ');
                  return (
                    <div
                      key={job.id}
                      onClick={() => router.push(`/jobs/${job.id}`)}
                      className="bg-white border border-border rounded-xl p-4 space-y-3 cursor-pointer hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-sm font-medium text-primary">{job.id}</span>
                          <h3 className="text-sm font-semibold text-foreground mt-0.5">{job.clientName}</h3>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full ${priorityStyles[job.priority] || 'bg-steel/10 text-muted-foreground/80'}`}
                          >
                            {job.priority}
                          </span>
                          <StatusBadge status={job.status} size="sm" />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{job.title}</p>
                      <div className="flex items-center justify-between text-xs">
                        <div className="space-y-1">
                          <p className="text-muted-foreground/80">{formatDate(job.scheduledDate)}</p>
                          <p className="text-muted-foreground/80 truncate max-w-[140px]">{techNames}</p>
                        </div>
                        <span className="text-sm font-semibold text-foreground">{formatCurrency(job.estimatedCost)}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                        <button
                          onClick={(e) => { e.stopPropagation(); router.push(`/jobs/${job.id}`); }}
                          className="flex-1 h-8 text-xs font-medium text-muted-foreground bg-muted border border-border rounded-xl hover:bg-muted transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditJob(job, e); }}
                          className="flex-1 h-8 text-xs font-medium text-muted-foreground bg-muted border border-border rounded-xl hover:bg-muted transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(job.id); }}
                          className="flex-1 h-8 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
                <div className="px-1 text-xs text-muted-foreground">
                  Showing {filteredJobs.length} of {jobList.length} jobs
                </div>
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto rounded-xl ring-1 ring-black/5 bg-white">
              <table className="w-full min-w-[950px]">
                <thead>
                  <tr className="border-b border-border">
                    <SortableTh field="id">Job ID</SortableTh>
                    <SortableTh field="clientName">Customer</SortableTh>
                    <SortableTh field="scheduledDate">Description</SortableTh>
                    <SortableTh field="scheduledDate">Date</SortableTh>
                    <SortableTh field="priority">Priority</SortableTh>
                    <SortableTh field="status">Status</SortableTh>
                    <SortableTh field="assignedTo">Tech</SortableTh>
                    <SortableTh field="estimatedCost">Amount</SortableTh>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white-border">
                  {filteredJobs.map((job) => {
                    const techNames = job.assignedTo
                      .map((t) => teamMembers.find((m) => m.id === t)?.name || t)
                      .join(', ');
                    return (
                      <tr
                        key={job.id}
                        onClick={() => router.push(`/jobs/${job.id}`)}
                        className="cursor-pointer transition-colors hover:bg-muted"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-primary whitespace-nowrap">{job.id}</td>
                        <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{job.clientName}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground/80 max-w-[200px] truncate">{job.title}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground/80 whitespace-nowrap">{formatDate(job.scheduledDate)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full ${priorityStyles[job.priority] || 'bg-steel/10 text-muted-foreground/80'}`}
                          >
                            {job.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusBadge status={job.status} size="sm" />
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground/80 whitespace-nowrap max-w-[140px] truncate">{techNames}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-foreground whitespace-nowrap">{formatCurrency(job.estimatedCost)}</td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => router.push(`/jobs/${job.id}`)}
                              className="rounded-xl p-1.5 text-muted-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
                              title="View job"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => openEditJob(job, e)}
                              className="rounded-xl p-1.5 text-muted-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
                              title="Edit job"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(job.id)}
                              className="rounded-xl p-1.5 text-muted-foreground/80 hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="Delete job"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-4 py-2 text-xs text-muted-foreground border-t border-border">
                Showing {filteredJobs.length} of {jobList.length} jobs
              </div>
            </div>
            </div>
          )}
        </>
      )}

      {/* ── CALENDAR / SCHEDULE VIEW ── */}
      {viewMode === 'calendar' && (
        <>
          {filteredJobs.length === 0 ? (
            <Card variant="bordered" padding="lg">
              <EmptyState
                title="No jobs this week"
                description="No jobs are scheduled for this week."
                action={<Button size="sm" onClick={() => { resetCreateForm(); setShowCreateModal(true); }}>Create First Job</Button>}
              />
            </Card>
          ) : (
            <div className="rounded-xl ring-1 ring-black/5 bg-white overflow-hidden">
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-border">
                {weekDays.map((day, i) => {
                  const d = calendarDates[i];
                  const dateObj = new Date(d);
                  const isToday =
                    dateObj.toISOString().split('T')[0] ===
                    new Date().toISOString().split('T')[0];
                  return (
                    <div
                      key={day}
                      className={`px-2 py-3 text-center border-r border-border last:border-r-0 ${
                        isToday ? 'bg-electric/5' : ''
                      }`}
                    >
                      <p className="text-xs font-semibold uppercase text-muted-foreground">{day}</p>
                      <p className={`text-lg font-bold mt-0.5 ${isToday ? 'text-primary' : 'text-foreground'}`}>
                        {dateObj.getDate()}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Calendar body */}
              <div className="grid grid-cols-7 divide-x divide-white-border">
                {calendarDates.map((date, i) => {
                  const dayJobs = jobsByDay[date] || [];
                  return (
                    <div key={date} className="min-h-[300px] p-1.5 space-y-1.5">
                      {dayJobs.length === 0 && (
                        <p className="text-[10px] text-muted-foreground-dark text-center pt-6">—</p>
                      )}
                      {dayJobs.map((job) => {
                        const techNames = job.assignedTo
                          .map((t) => teamMembers.find((m) => m.id === t)?.name?.split(' ')[0] || t)
                          .join(', ');
                        return (
                          <div
                            key={job.id}
                            onClick={() => router.push(`/jobs/${job.id}`)}
                            className={`rounded-xl px-2 py-1.5 cursor-pointer transition-all hover:brightness-110 ${calendarColorMap[job.status] || 'border-l-2 border-steel bg-muted'}`}
                          >
                            <p className="text-[11px] font-semibold text-foreground truncate">{job.title}</p>
                            <p className="text-[10px] text-muted-foreground/80 truncate">{job.clientName}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{techNames}</p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 px-4 py-2 border-t border-border bg-whiteer flex-wrap">
                <span className="text-[11px] text-muted-foreground">Legend:</span>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
                  <span className="inline-block w-3 h-3 rounded bg-blue-tint border-l-2 border-electric" /> In Progress
                </span>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
                  <span className="inline-block w-3 h-3 rounded bg-accent-amber/20 border-l-2 border-accent-amber" /> Scheduled
                </span>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
                  <span className="inline-block w-3 h-3 rounded bg-green-500/20 border-l-2 border-status-success" /> Completed
                </span>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
                  <span className="inline-block w-3 h-3 rounded bg-red-500/20 border-l-2 border-status-error" /> Urgent
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Create Job Modal ── */}
      {showCreateModal && (
        <>
          <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-start justify-center pt-[5vh] pb-8 px-4 overflow-y-auto" onClick={() => { setShowCreateModal(false); resetCreateForm(); }}>
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-border overflow-hidden" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-border/50">
                <h2 className="text-lg font-bold text-foreground">Create New Job</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Fill in the details to create a new service job.</p>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
                  <input
                    type="text" placeholder="Kitchen sink repair"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full h-11 px-4 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/80 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Description *</label>
                  <div className="relative">
                    <textarea
                      rows={3} placeholder="Tap the mic and describe the job..."
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/80 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none pr-12"
                    />
                    <button
                      type="button"
                      onClick={handleVoiceInput}
                      disabled={voiceState === 'listening' || voiceState === 'processing'}
                      className={`absolute right-2 bottom-2 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        voiceState === 'listening'
                          ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200'
                          : voiceState === 'processing'
                          ? 'bg-blue-400 text-white'
                          : 'bg-muted text-muted-foreground/80 hover:bg-muted hover:text-muted-foreground'
                      }`}
                      title="Voice input"
                    >
                      {voiceState === 'listening' ? (
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="2" width="6" height="11" rx="3"/>
                          <path d="M5 10a7 7 0 0014 0"/>
                          <line x1="12" y1="19" x2="12" y2="23"/>
                          <line x1="8" y1="23" x2="16" y2="23"/>
                        </svg>
                      ) : voiceState === 'processing' ? (
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="2" width="6" height="11" rx="3"/>
                          <path d="M5 10a7 7 0 0014 0"/>
                          <line x1="12" y1="19" x2="12" y2="23"/>
                          <line x1="8" y1="23" x2="16" y2="23"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {voiceState === 'listening' && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      Listening... speak now
                    </p>
                  )}
                  {voiceError && (
                    <p className="text-xs text-red-500 mt-1">{voiceError}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Client *</label>
                    <select
                      value={newClientId}
                      onChange={(e) => {
                        const c = clients.find((cl) => cl.id === e.target.value);
                        setNewClientId(e.target.value);
                        if (c) {
                          if (!newAddress) setNewAddress(c.address);
                          if (!newCity) setNewCity(c.city);
                          if (!newState) setNewState(c.state);
                          if (!newZip) setNewZip(c.zip);
                        }
                      }}
                      className="w-full h-11 px-4 bg-white border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 appearance-none transition-all"
                    >
                      <option value="">Select a client</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Priority</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')}
                      className="w-full h-11 px-4 bg-white border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 appearance-none transition-all"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Critical</option>
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Address</label>
                  <AddressAutocomplete
                    value={newAddress}
                    onChange={(v) => setNewAddress(v)}
                    onSelect={(addr, city, state, zip) => {
                      setNewAddress(addr);
                      setNewCity(city);
                      setNewState(state);
                      setNewZip(zip);
                    }}
                    placeholder="Service address"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">City</label>
                    <input type="text" placeholder="Austin" value={newCity} onChange={(e) => setNewCity(e.target.value)} className="w-full h-11 px-4 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/80 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">State/Province</label>
                    <input type="text" placeholder="TX" value={newState} onChange={(e) => setNewState(e.target.value.toUpperCase().slice(0, 2))} className="w-full h-11 px-4 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/80 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">ZIP/Postal Code</label>
                    <input type="text" inputMode="numeric" placeholder="73301" value={newZip} onChange={(e) => setNewZip(e.target.value.replace(/\D/g, '').slice(0, 5))} className="w-full h-11 px-4 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/80 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Scheduled Date</label>
                    <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full h-11 px-4 bg-white border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Scheduled Time</label>
                    <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-full h-11 px-4 bg-white border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Assigned Tech</label>
                    <select
                      value={newTechId}
                      onChange={(e) => setNewTechId(e.target.value)}
                      className="w-full h-11 px-4 bg-white border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 appearance-none transition-all"
                    >
                      <option value="">Unassigned</option>
                      {teamMembers.map((tm) => (
                        <option key={tm.id} value={tm.id}>{tm.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Estimated Cost ($)</label>
                    <input type="number" placeholder="0" value={newEstimatedCost} onChange={(e) => setNewEstimatedCost(e.target.value)} className="w-full h-11 px-4 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/80 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 px-6 py-4 bg-white border-t border-border/50 flex items-center justify-end gap-3">
                <button onClick={() => { setShowCreateModal(false); resetCreateForm(); }} className="h-10 px-5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleCreateJob} disabled={creating || !createFormValid} className="h-10 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                  {creating ? 'Creating...' : 'Create Job'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Edit Job Modal ── */}
      <Modal
        open={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingJob(null); }}
        title="Edit Job"
        description={editingJob ? `Editing ${editingJob.id}: ${editingJob.title}` : ''}
        size="lg"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => { setShowEditModal(false); setEditingJob(null); }}>
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
              <label className="block text-sm font-medium text-foreground mb-1">Priority</label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')}
                className="w-full h-11 px-4 bg-white border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 appearance-none transition-all"
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
            <label className="block text-sm font-medium text-foreground mb-1">Assigned Tech</label>
            <select
              value={editTechId}
              onChange={(e) => setEditTechId(e.target.value)}
              className="w-full h-11 px-4 bg-white border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 appearance-none transition-all"
            >
              <option value="">Unassigned</option>
              {teamMembers.map((tm) => (
                <option key={tm.id} value={tm.id}>{tm.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
      <Modal
        open={showDeleteConfirm !== null}
        onClose={() => setShowDeleteConfirm(null)}
        title="Delete Job"
        description="Are you sure you want to delete this job? This action cannot be undone."
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (showDeleteConfirm) handleDeleteJob(showDeleteConfirm);
              }}
            >
              Delete Job
            </Button>
          </>
        }
      />
    </div>
  );
}