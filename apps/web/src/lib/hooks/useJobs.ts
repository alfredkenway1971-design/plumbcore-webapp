'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { JobDb } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

/* ── useJobs ── */
export function useJobs() {
  const companyId = useAuthStore((s) => s.company?.id);

  return useQuery<JobDb[]>({
    queryKey: ['jobs', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!companyId,
  });
}

/* ── useJob ── */
export function useJob(id: string) {
  return useQuery<JobDb | null>({
    queryKey: ['jobs', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!id,
  });
}

/* ── useCreateJob ── */
export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<JobDb, 'id' | 'created_at'>) => {
      const { data: job, error } = await supabase
        .from('jobs')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return job;
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<JobDb, 'id' | 'created_at'>> }) => {
      const { data: job, error } = await supabase
        .from('jobs')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return job;
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
      const { error } = await supabase.from('jobs').delete().eq('id', id);
      if (error) throw error;
      return { deleted: true, id };
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.removeQueries({ queryKey: ['jobs', id] });
    },
  });
}