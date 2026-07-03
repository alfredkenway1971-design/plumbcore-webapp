'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ClientDb } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

/* ── useClients ── */
export function useClients() {
  const companyId = useAuthStore((s) => s.company?.id);

  return useQuery<ClientDb[]>({
    queryKey: ['clients', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!companyId,
  });
}

/* ── useClient ── */
export function useClient(id: string) {
  return useQuery<ClientDb | null>({
    queryKey: ['clients', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!id,
  });
}

/* ── useCreateClient ── */
export function useCreateClient() {
  const queryClient = useQueryClient();
  const companyId = useAuthStore((s) => s.company?.id);

  return useMutation({
    mutationFn: async (data: Omit<ClientDb, 'id' | 'created_at'>) => {
      const { data: client, error } = await supabase
        .from('clients')
        .insert({ ...data, company_id: companyId })
        .select()
        .single();
      if (error) throw error;
      return client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

/* ── useUpdateClient ── */
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<ClientDb, 'id' | 'created_at'>> }) => {
      const { data: client, error } = await supabase
        .from('clients')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return client;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients', variables.id] });
    },
  });
}