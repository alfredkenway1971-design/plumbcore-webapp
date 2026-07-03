'use client';

import { supabase } from '@/lib/supabase';

/* ── Stats / Dashboard ── */
export async function getCompanyStats(companyId: string) {
  const now = new Date().toISOString();

  const [clientsRes, jobsRes, invoicesRes, inventoryRes] = await Promise.all([
    supabase.from('clients').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
    supabase.from('jobs').select('status,priority,estimated_cost,actual_cost').eq('company_id', companyId),
    supabase.from('invoices').select('status,total,amount_paid').eq('company_id', companyId),
    supabase.from('inventory_items').select('quantity,min_stock').eq('company_id', companyId),
  ]);

  const jobs = jobsRes.data ?? [];
  const invoices = invoicesRes.data ?? [];
  const inventory = inventoryRes.data ?? [];

  const totalRevenue = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + (i.amount_paid ?? i.total), 0);
  const outstandingRevenue = invoices
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .reduce((sum, i) => sum + i.total, 0);
  const activeJobs = jobs.filter((j) => j.status === 'in-progress').length;
  const scheduledJobs = jobs.filter((j) => j.status === 'scheduled').length;
  const completedJobs = jobs.filter((j) => j.status === 'completed').length;
  const urgentJobs = jobs.filter((j) => j.priority === 'urgent' && j.status !== 'completed').length;
  const partsLowStock = inventory.filter((i) => i.quantity <= i.min_stock).length;

  return {
    totalRevenue,
    outstandingRevenue,
    activeJobs,
    scheduledJobs,
    completedJobs,
    urgentJobs,
    partsLowStock,
    totalClients: clientsRes.count ?? 0,
    totalJobs: jobs.length,
    totalInvoices: invoices.length,
    totalInventoryItems: inventory.length,
  };
}

/* ── Activity Feed ── */
export async function getRecentActivity(companyId: string, limit = 20) {
  // Combine recent jobs + invoices
  const [jobs, invoices] = await Promise.all([
    supabase
      .from('jobs')
      .select('id,title,status,estimated_cost,created_at,client_id')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase
      .from('invoices')
      .select('id,invoice_number,status,total,created_at,client_id')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(limit),
  ]);

  const activities: { id: string; type: string; description: string; timestamp: string; amount?: number }[] = [];

  for (const job of jobs.data ?? []) {
    activities.push({
      id: `job-${job.id}`,
      type: job.status === 'completed' ? 'job_completed' : 'job_created',
      description: `${job.status === 'completed' ? 'Completed: ' : ''}${job.title}`,
      timestamp: job.created_at,
      amount: job.estimated_cost,
    });
  }

  for (const inv of invoices.data ?? []) {
    activities.push({
      id: `inv-${inv.id}`,
      type: inv.status === 'paid' ? 'invoice_paid' : `invoice_${inv.status}`,
      description: `${inv.invoice_number}: ${inv.status === 'paid' ? 'Paid' : inv.status}`,
      timestamp: inv.created_at,
      amount: inv.total,
    });
  }

  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

/* ── Line Items for an invoice ── */
export async function getInvoiceLineItems(invoiceId: string) {
  const { data } = await supabase
    .from('line_items')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('id');
  return data ?? [];
}

/* ── Inventory Transactions ── */
export async function getItemTransactions(itemId: string) {
  // Simplified — return recent job references for this inventory item
  return [];
}

/* ── Job line items for invoicing ── */
export async function getJobLineItems(companyId: string) {
  const { data } = await supabase
    .from('pricebook_items')
    .select('*')
    .eq('company_id', companyId);
  return data ?? [];
}