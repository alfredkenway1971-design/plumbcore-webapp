'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store';
import {
  type Company,
  type Profile,
} from '@/lib/supabase';

function getStoredAuth() {
  try {
    const raw = localStorage.getItem('plumbcore-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state ?? null;
  } catch {
    return null;
  }
}

/* ── useCurrentUser ── */
export function useCurrentUser() {
  return useQuery<{ id: string; email: string } | null>({
    queryKey: ['current-user'],
    queryFn: async () => {
      const auth = getStoredAuth();
      return auth?.user ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/* ── useProfile ── */
export function useProfile() {
  return useQuery<(Profile & { company_id: string }) | null>({
    queryKey: ['profile'],
    queryFn: async () => {
      const auth = getStoredAuth();
      return auth?.profile ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/* ── useCompany ── */
export function useCompany() {
  return useQuery<Company | null>({
    queryKey: ['company'],
    queryFn: async () => {
      const auth = getStoredAuth();
      return auth?.company ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/* ── useUpdateCompany ── */
export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Company>) => {
      const token = useAuthStore.getState().token;
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save company');
      }
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
    },
  });
}

/* ── useUpdateProfile ── */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      const token = useAuthStore.getState().token;
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save profile');
      }
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}