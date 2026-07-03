'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { InvoiceDb, LineItemDb } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

/* ── useInvoices ── */
export function useInvoices() {
  const companyId = useAuthStore((s) => s.company?.id);

  return useQuery<InvoiceDb[]>({
    queryKey: ['invoices', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!companyId,
  });
}

/* ── useInvoice ── */
export function useInvoice(id: string) {
  return useQuery<InvoiceDb | null>({
    queryKey: ['invoices', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, line_items(*)')
        .eq('id', id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!id,
  });
}

/* ── useCreateInvoice ── */
export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      invoice: Omit<InvoiceDb, 'id' | 'created_at'>;
      lineItems: Omit<LineItemDb, 'id'>[];
    }) => {
      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert(data.invoice)
        .select()
        .single();
      if (error) throw error;

      // Insert line items
      const lineItemsWithInvoice = data.lineItems.map((li) => ({
        ...li,
        invoice_id: invoice.id,
      }));

      const { error: liError } = await supabase
        .from('line_items')
        .insert(lineItemsWithInvoice);
      if (liError) throw liError;

      return { invoice, lineItems: lineItemsWithInvoice };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

/* ── useUpdateInvoiceStatus ── */
export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: InvoiceDb['status'] }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          status,
          paid_at: status === 'paid' ? new Date().toISOString() : null,
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.id] });
    },
  });
}