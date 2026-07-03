'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clients, type Client } from '@/lib/mock-data';
import type { ClientDb } from '@/lib/supabase';

function mapMockToClientDb(mock: Client): ClientDb {
  return {
    id: mock.id,
    company_id: 'comp-001',
    name: mock.name,
    email: mock.email,
    phone: mock.phone,
    address: mock.address,
    city: mock.city,
    state: mock.state,
    zip: mock.zip,
    company_name: mock.company,
    notes: mock.notes,
    tags: undefined,
    properties: undefined,
    created_at: mock.createdAt,
  };
}

/* ── useClients ── */
export function useClients() {
  return useQuery<ClientDb[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 100));
      return clients.map(mapMockToClientDb);
    },
  });
}

/* ── useClient ── */
export function useClient(id: string) {
  return useQuery<ClientDb | null>({
    queryKey: ['clients', id],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 100));
      const found = clients.find((c) => c.id === id);
      return found ? mapMockToClientDb(found) : null;
    },
    enabled: !!id,
  });
}

/* ── useCreateClient ── */
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<ClientDb, 'id' | 'created_at'>) => {
      await new Promise((r) => setTimeout(r, 200));
      const newClient: ClientDb = {
        ...data,
        id: `CLT-${String(clients.length + 1).padStart(3, '0')}`,
        created_at: new Date().toISOString().split('T')[0],
      };
      return newClient;
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
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<ClientDb, 'id' | 'created_at'>>;
    }) => {
      await new Promise((r) => setTimeout(r, 200));
      return { id, ...data } as ClientDb;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients', variables.id] });
    },
  });
}