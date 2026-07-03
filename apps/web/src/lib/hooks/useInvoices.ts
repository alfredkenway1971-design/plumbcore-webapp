'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoices, type Invoice } from '@/lib/mock-data';
import type { InvoiceDb, LineItemDb } from '@/lib/supabase';

function mapMockToInvoiceDb(mock: Invoice): InvoiceDb {
  return {
    id: mock.id,
    company_id: 'comp-001',
    job_id: mock.jobId,
    client_id: mock.clientId,
    invoice_number: mock.id.replace('INV-', 'INV-'),
    status: mock.status as InvoiceDb['status'],
    subtotal: mock.amount,
    tax: 0,
    total: mock.amount,
    amount_paid: mock.paidAmount,
    due_date: mock.dueDate,
    issued_date: mock.issueDate,
    paid_at: mock.paidDate,
    stripe_payment_intent_id: undefined,
    notes: mock.notes,
    created_at: mock.issueDate,
  };
}

/* ── useInvoices ── */
export function useInvoices() {
  return useQuery<InvoiceDb[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 100));
      return invoices.map(mapMockToInvoiceDb);
    },
  });
}

/* ── useInvoice ── */
export function useInvoice(id: string) {
  return useQuery<InvoiceDb | null>({
    queryKey: ['invoices', id],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 100));
      const found = invoices.find((inv) => inv.id === id);
      return found ? mapMockToInvoiceDb(found) : null;
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
      await new Promise((r) => setTimeout(r, 200));
      const newInvoice: InvoiceDb = {
        ...data.invoice,
        id: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
        created_at: new Date().toISOString(),
      };
      return { invoice: newInvoice, lineItems: data.lineItems };
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
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: InvoiceDb['status'];
    }) => {
      await new Promise((r) => setTimeout(r, 200));
      return { id, status };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.id] });
    },
  });
}