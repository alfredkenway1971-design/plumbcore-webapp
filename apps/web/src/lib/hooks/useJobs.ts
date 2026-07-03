'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobs, type Job } from '@/lib/mock-data';
import type { JobDb } from '@/lib/supabase';

function mapMockToJobDb(mock: Job): JobDb {
  return {
    id: mock.id,
    company_id: 'comp-001',
    client_id: mock.clientId,
    assigned_tech_id: mock.assignedTo[0] ?? undefined,
    title: mock.title,
    description: mock.description,
    status: mock.status === 'cancelled' ? 'cancelled' : mock.status === 'urgent' ? 'urgent' : mock.status as JobDb['status'],
    priority: mock.priority as JobDb['priority'],
    scheduled_date: mock.scheduledDate,
    scheduled_start: mock.scheduledTime,
    scheduled_end: undefined,
    completed_at: mock.completedDate,
    estimated_cost: mock.estimatedCost,
    actual_cost: mock.actualCost,
    labor_cost: mock.laborHours ? mock.laborHours * 65 : undefined,
    parts_cost: mock.materialsCost,
    address: mock.address,
    city: mock.city,
    state: mock.state,
    zip: mock.zip,
    photos: undefined,
    notes: mock.notes,
    source: 'manual',
    lead_id: undefined,
    created_at: mock.createdAt,
  };
}

/* ── useJobs ── */
export function useJobs() {
  return useQuery<JobDb[]>({
    queryKey: ['jobs'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 100));
      return jobs.map(mapMockToJobDb);
    },
  });
}

/* ── useJob ── */
export function useJob(id: string) {
  return useQuery<JobDb | null>({
    queryKey: ['jobs', id],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 100));
      const found = jobs.find((j) => j.id === id);
      return found ? mapMockToJobDb(found) : null;
    },
    enabled: !!id,
  });
}

/* ── useCreateJob ── */
export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<JobDb, 'id' | 'created_at'>) => {
      await new Promise((r) => setTimeout(r, 200));
      const newJob: JobDb = {
        ...data,
        id: `JOB-${String(jobs.length + 1).padStart(3, '0')}`,
        created_at: new Date().toISOString(),
      };
      return newJob;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

/* ── useUpdateJob ── */
export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<JobDb, 'id' | 'created_at'>>;
    }) => {
      await new Promise((r) => setTimeout(r, 200));
      return { id, ...data } as JobDb;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs', variables.id] });
    },
  });
}

/* ── useDeleteJob ── */
export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise((r) => setTimeout(r, 200));
      return { deleted: true, id };
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.removeQueries({ queryKey: ['jobs', id] });
    },
  });
}