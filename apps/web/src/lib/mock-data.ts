/* ──────────────────────────────────────────────
   PlumbCore AI — Data Layer
   Proxies all mock-data imports to Supabase when authenticated
   Falls back to mock data when no auth session
   ────────────────────────────────────────────── */

import { supabase } from '@/lib/supabase';

// Re-export all types
export type JobStatus = 'scheduled' | 'in-progress' | 'completed' | 'urgent' | 'cancelled';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'check' | 'cash';
export type InventoryCategory = 'pipe' | 'fitting' | 'valve' | 'fixture' | 'tool' | 'sealant' | 'heater' | 'pump';
export type ActivityType = 'job_created' | 'job_completed' | 'invoice_paid' | 'client_added' | 'estimate_sent';
export type TransactionType = 'Received' | 'Used' | 'Adjusted';
export type POStatus = 'Draft' | 'Sent' | 'Received' | 'Cancelled';

export interface Client {
  id: string; name: string; email: string; phone: string;
  address: string; city: string; state: string; zip: string;
  company?: string; notes?: string; createdAt: string;
  totalJobs: number; totalRevenue: number;
}

export interface TeamMember {
  id: string; name: string; email: string; phone: string;
  role: 'tech' | 'senior-tech' | 'lead-tech' | 'dispatcher' | 'admin';
  status: 'online' | 'busy' | 'away' | 'offline';
  activeJobs: number; completedToday: number; rating: number;
  specialties: string[]; joinedAt: string;
}

export interface Job {
  id: string; clientId: string; clientName: string;
  title: string; description: string;
  status: JobStatus; priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string[]; address: string; city: string; state: string; zip: string;
  scheduledDate: string; scheduledTime?: string; completedDate?: string;
  estimatedCost: number; actualCost?: number; materialsCost?: number;
  laborHours?: number; notes?: string; createdAt: string;
}

export interface Invoice {
  id: string; clientId: string; clientName: string; jobId: string; jobTitle: string;
  status: InvoiceStatus; amount: number; paidAmount?: number;
  dueDate: string; issueDate: string; paidDate?: string;
  paymentMethod?: PaymentMethod;
  lineItems: { description: string; quantity: number; unitPrice: number; total: number }[];
  notes?: string;
  depositPaid?: number; // cents — deposit paid by customer via PlumbCore
}

export interface InventoryItem {
  id: string; name: string; category: InventoryCategory; sku: string;
  quantity: number; minQuantity: number; unitPrice: number;
  supplier: string; location: string; description: string;
}

export interface Supplier {
  id: string; name: string; contactPerson: string; phone: string; email: string;
  address: string; categories: string[];
}

export interface InventoryTransaction {
  id: string; itemId: string; date: string; type: TransactionType;
  quantity: number; note: string;
}

export interface PurchaseOrder {
  id: string; poNumber: string; supplierId: string; supplierName: string;
  items: { itemId: string; itemName: string; quantity: number; unitPrice: number; total: number }[];
  itemsCount: number; total: number; status: POStatus;
  expectedDelivery: string; notes: string; createdAt: string;
  sentDate?: string; receivedDate?: string; cancelledDate?: string;
}

export interface ActivityItem {
  id: string; type: ActivityType; description: string; timestamp: string;
  clientName?: string; amount?: number; userId?: string;
}

// ── Fallback mock data ──
const fallbackClients: Client[] = [
  { id: 'CLT-001', name: 'James & Sarah Johnson', email: 'johnson@email.com', phone: '(555) 101-2001', address: '123 Oak St', city: 'Austin', state: 'TX', zip: '73301', createdAt: '2024-01-15', totalJobs: 8, totalRevenue: 12450 },
  { id: 'CLT-002', name: 'Robert Davis', email: 'rdavis@email.com', phone: '(555) 101-2002', address: '456 Maple Ave', city: 'Austin', state: 'TX', zip: '73302', createdAt: '2024-01-20', totalJobs: 5, totalRevenue: 8900 },
  { id: 'CLT-003', name: 'Maria Wilson', email: 'mwilson@email.com', phone: '(555) 101-2003', address: '789 Pine Rd', city: 'Round Rock', state: 'TX', zip: '78664', createdAt: '2024-02-03', totalJobs: 12, totalRevenue: 18300 },
  { id: 'CLT-005', name: 'Emily Thompson', email: 'ethompson@email.com', phone: '(555) 101-2005', address: '654 Birch Ln', city: 'Cedar Park', state: 'TX', zip: '78613', createdAt: '2024-02-18', totalJobs: 7, totalRevenue: 11200 },
  { id: 'CLT-011', name: 'Oak Springs Apartments', email: 'leasing@oaksprings.com', phone: '(555) 101-2011', address: '4000 Spring Hollow Dr', city: 'Austin', state: 'TX', zip: '73307', company: 'Oak Springs Properties LLC', createdAt: '2024-04-05', totalJobs: 15, totalRevenue: 45000 },
  { id: 'CLT-015', name: 'Sunset Retirement Home', email: 'facilities@sunsetretire.com', phone: '(555) 101-2015', address: '500 Sunset Blvd', city: 'Austin', state: 'TX', zip: '73308', company: 'Sunset Senior Living', createdAt: '2024-05-02', totalJobs: 20, totalRevenue: 68000 },
];

const fallbackTeamMembers: TeamMember[] = [
  { id: 'TECH-001', name: 'James Wilson', email: 'jwilson@plumbcore.ai', phone: '(555) 200-1001', role: 'lead-tech', status: 'online', activeJobs: 2, completedToday: 4, rating: 4.9, specialties: ['Water Heaters', 'Sewer Lines'], joinedAt: '2023-03-01' },
  { id: 'TECH-002', name: 'Mike Torres', email: 'mtorres@plumbcore.ai', phone: '(555) 200-1002', role: 'senior-tech', status: 'busy', activeJobs: 3, completedToday: 3, rating: 4.8, specialties: ['Drain Cleaning', 'Pipe Repair'], joinedAt: '2023-06-15' },
  { id: 'TECH-005', name: 'Sarah Blake', email: 'sblake@plumbcore.ai', phone: '(555) 200-1005', role: 'tech', status: 'online', activeJobs: 2, completedToday: 3, rating: 4.9, specialties: ['Gas Lines', 'Water Heaters'], joinedAt: '2024-02-20' },
];

// ── Fallback demo jobs ──
const fallbackJobs: Job[] = [
  { id: 'JOB-001', clientId: 'CLT-001', clientName: 'James & Sarah Johnson', title: 'Water Heater Repair', description: 'Replace failed water heater element', status: 'in-progress', priority: 'high', assignedTo: ['TECH-001'], address: '123 Oak St', city: 'Austin', state: 'TX', zip: '73301', scheduledDate: new Date(Date.now() + 2*60*60*1000).toISOString(), estimatedCost: 850, actualCost: 0, materialsCost: 0, notes: '', createdAt: new Date().toISOString() },
  { id: 'JOB-002', clientId: 'CLT-002', clientName: 'Robert Davis', title: 'Drain Cleaning', description: 'Kitchen sink drain clogged', status: 'scheduled', priority: 'medium', assignedTo: ['TECH-002'], address: '456 Maple Ave', city: 'Austin', state: 'TX', zip: '73302', scheduledDate: new Date(Date.now() + 5*60*60*1000).toISOString(), estimatedCost: 350, actualCost: 0, materialsCost: 0, notes: '', createdAt: new Date().toISOString() },
  { id: 'JOB-003', clientId: 'CLT-003', clientName: 'Maria Wilson', title: 'Pipe Replacement', description: 'Replace corroded pipe in basement', status: 'completed', priority: 'high', assignedTo: ['TECH-001', 'TECH-002'], address: '789 Pine Rd', city: 'Round Rock', state: 'TX', zip: '78664', scheduledDate: new Date(Date.now() - 24*60*60*1000).toISOString(), completedDate: new Date().toISOString(), estimatedCost: 1800, actualCost: 2100, materialsCost: 600, laborHours: 16, notes: '', createdAt: new Date(Date.now() - 3*24*60*60*1000).toISOString() },
  { id: 'JOB-004', clientId: 'CLT-005', clientName: 'Emily Thompson', title: 'Faucet Installation', description: 'Install new kitchen faucet', status: 'scheduled', priority: 'low', assignedTo: ['TECH-005'], address: '654 Birch Ln', city: 'Cedar Park', state: 'TX', zip: '78613', scheduledDate: new Date(Date.now() + 8*60*60*1000).toISOString(), estimatedCost: 250, actualCost: 0, materialsCost: 0, notes: '', createdAt: new Date().toISOString() },
  { id: 'JOB-005', clientId: 'CLT-001', clientName: 'James & Sarah Johnson', title: 'Emergency Leak Repair', description: 'Burst pipe under kitchen sink', status: 'urgent', priority: 'urgent', assignedTo: ['TECH-001'], address: '123 Oak St', city: 'Austin', state: 'TX', zip: '73301', scheduledDate: new Date().toISOString(), estimatedCost: 1200, actualCost: 0, materialsCost: 0, notes: '', createdAt: new Date().toISOString() },
  { id: 'JOB-006', clientId: 'CLT-011', clientName: 'Oak Springs Apartments', title: 'Sewer Line Inspection', description: 'Annual sewer line inspection for apartment complex', status: 'scheduled', priority: 'medium', assignedTo: ['TECH-002'], address: '4000 Spring Hollow Dr', city: 'Austin', state: 'TX', zip: '73307', scheduledDate: new Date(Date.now() + 3*24*60*60*1000).toISOString(), estimatedCost: 1500, actualCost: 0, materialsCost: 0, notes: '', createdAt: new Date(Date.now() - 7*24*60*60*1000).toISOString() },
  { id: 'JOB-007', clientId: 'CLT-015', clientName: 'Sunset Retirement Home', title: 'Water Main Repair', description: 'Emergency water main repair', status: 'completed', priority: 'urgent', assignedTo: ['TECH-001', 'TECH-002', 'TECH-005'], address: '500 Sunset Blvd', city: 'Austin', state: 'TX', zip: '73308', scheduledDate: new Date(Date.now() - 5*24*60*60*1000).toISOString(), completedDate: new Date(Date.now() - 4*24*60*60*1000).toISOString(), estimatedCost: 4500, actualCost: 5200, materialsCost: 2800, laborHours: 32, notes: 'Emergency call at 2 AM', createdAt: new Date(Date.now() - 5*24*60*60*1000).toISOString() },
  { id: 'JOB-008', clientId: 'CLT-002', clientName: 'Robert Davis', title: 'Gas Line Test', description: 'Test gas line for leaks after installation', status: 'completed', priority: 'high', assignedTo: ['TECH-005'], address: '456 Maple Ave', city: 'Austin', state: 'TX', zip: '73302', scheduledDate: new Date(Date.now() - 2*24*60*60*1000).toISOString(), completedDate: new Date(Date.now() - 2*24*60*60*1000).toISOString(), estimatedCost: 300, actualCost: 275, materialsCost: 45, laborHours: 4, notes: '', createdAt: new Date(Date.now() - 14*24*60*60*1000).toISOString() },
];

// ── Fallback demo invoices ──
const fallbackInvoices: Invoice[] = [
  { id: 'INV-001', clientId: 'CLT-003', clientName: 'Maria Wilson', jobId: 'JOB-003', jobTitle: 'Pipe Replacement', status: 'paid', amount: 2100, paidAmount: 2100, dueDate: new Date(Date.now() + 14*24*60*60*1000).toISOString(), issueDate: new Date(Date.now() - 1*24*60*60*1000).toISOString(), paidDate: new Date().toISOString(), paymentMethod: 'credit_card', lineItems: [{ description: 'Pipe Replacement - Labor', quantity: 1, unitPrice: 1500, total: 1500 }, { description: 'Materials', quantity: 1, unitPrice: 600, total: 600 }], notes: '' },
  { id: 'INV-002', clientId: 'CLT-001', clientName: 'James & Sarah Johnson', jobId: 'JOB-001', jobTitle: 'Water Heater Repair', status: 'sent', amount: 850, paidAmount: 0, dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString(), issueDate: new Date().toISOString(), lineItems: [{ description: 'Water Heater Repair Service', quantity: 1, unitPrice: 850, total: 850 }], notes: '', depositPaid: 4900 },
  { id: 'INV-003', clientId: 'CLT-002', clientName: 'Robert Davis', jobId: 'JOB-008', jobTitle: 'Gas Line Test', status: 'paid', amount: 275, paidAmount: 275, dueDate: new Date(Date.now() - 1*24*60*60*1000).toISOString(), issueDate: new Date(Date.now() - 2*24*60*60*1000).toISOString(), paidDate: new Date(Date.now() - 1*24*60*60*1000).toISOString(), paymentMethod: 'check', lineItems: [{ description: 'Gas Line Test Service', quantity: 1, unitPrice: 275, total: 275 }], notes: '' },
  { id: 'INV-004', clientId: 'CLT-011', clientName: 'Oak Springs Apartments', jobId: 'JOB-006', jobTitle: 'Sewer Line Inspection', status: 'overdue', amount: 1500, paidAmount: 0, dueDate: new Date(Date.now() - 3*24*60*60*1000).toISOString(), issueDate: new Date(Date.now() - 30*24*60*60*1000).toISOString(), lineItems: [{ description: 'Annual Sewer Line Inspection', quantity: 1, unitPrice: 1500, total: 1500 }], notes: 'Payment overdue - 2nd notice sent' },
];

// ── Shared data store ──
const data = {
  clients: [...fallbackClients],
  jobs: [...fallbackJobs],
  invoices: [...fallbackInvoices],
  teamMembers: [...fallbackTeamMembers],
  inventory: [] as InventoryItem[],
  suppliers: [] as Supplier[],
  inventoryTransactions: [] as InventoryTransaction[],
  purchaseOrders: [] as PurchaseOrder[],
  activities: [] as ActivityItem[],
};

// Exports matching the old mock-data API
export const clients = [];
export const jobs: any[] = [];
export const invoices: any[] = [];
export const teamMembers: any[] = [];
export const inventory: any[] = [];
export const suppliers: any[] = [];
export const inventoryTransactions: any[] = [];
export const purchaseOrders: any[] = [];
export const activities: any[] = [];

// ── Load data from Supabase ──
export async function loadDataFromSupabase(companyId?: string) {
  if (!companyId) return;

  // Skip Supabase queries if user isn't authenticated (anon key can't read RLS tables)
  const storedAuth = typeof window !== 'undefined' ? localStorage.getItem('plumbcore-auth') : null;
  if (!storedAuth) return;

  try {
    let hasRealData = false;

    // Load clients
    const { data: dbClients } = await supabase
      .from('clients')
      .select('*')
      .eq('company_id', companyId);
    
    if (dbClients && dbClients.length > 0) {
      hasRealData = true;
      data.clients.length = 0;
      dbClients.forEach((c: any) => {
        data.clients.push({
          id: c.id, name: c.name, email: c.email || '', phone: c.phone || '',
          address: c.address || '', city: c.city || '', state: c.state || '', zip: c.zip || '',
          company: c.company_name, notes: c.notes, createdAt: c.created_at,
          totalJobs: 0, totalRevenue: 0
        });
      });
    }
    
    // Load jobs
    const { data: dbJobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('company_id', companyId);
    
    if (dbJobs && dbJobs.length > 0) {
      hasRealData = true;
      data.jobs.length = 0;
      dbJobs.forEach((j: any) => {
        data.jobs.push({
          id: j.id, clientId: j.client_id, clientName: data.clients.find(c => c.id === j.client_id)?.name || '',
          title: j.title, description: j.description || '',
          status: j.status as JobStatus, priority: j.priority as any,
          assignedTo: j.assigned_tech_id ? [j.assigned_tech_id] : [],
          address: j.address || '', city: j.city || '', state: j.state || '', zip: j.zip || '',
          scheduledDate: j.scheduled_date || '', completedDate: j.completed_at,
          estimatedCost: j.estimated_cost || 0, actualCost: j.actual_cost,
          materialsCost: j.parts_cost, laborHours: j.labor_cost ? j.labor_cost / 65 : undefined,
          notes: j.notes, createdAt: j.created_at
        });
      });
    }
    
    // Load invoices
    const { data: dbInvoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('company_id', companyId);
    
    if (dbInvoices && dbInvoices.length > 0) {
      hasRealData = true;
      data.invoices.length = 0;
      dbInvoices.forEach((inv: any) => {
        const client = data.clients.find(c => c.id === inv.client_id);
        data.invoices.push({
          id: inv.id, clientId: inv.client_id, clientName: client?.name || '',
          jobId: inv.job_id || '', jobTitle: data.jobs.find(j => j.id === inv.job_id)?.title || '',
          status: inv.status as InvoiceStatus, amount: inv.total || 0, paidAmount: inv.amount_paid,
          dueDate: inv.due_date || '', issueDate: inv.issued_date || '', paidDate: inv.paid_at,
          lineItems: [], notes: inv.notes
        });
      });
    }
    
    // Load team members
    const { data: dbTeam } = await supabase
      .from('team_members')
      .select('*')
      .eq('company_id', companyId);
    
    if (dbTeam && dbTeam.length > 0) {
      hasRealData = true;
      data.teamMembers.length = 0;
      dbTeam.forEach((t: any) => {
        const activeJobs = data.jobs.filter(j => j.assignedTo.includes(t.id) && j.status === 'in-progress').length;
        const completedToday = data.jobs.filter(j =>
          j.assignedTo.includes(t.id) && j.status === 'completed' &&
          j.completedDate && new Date(j.completedDate).toDateString() === new Date().toDateString()
        ).length;
        data.teamMembers.push({
          id: t.id, name: t.name, email: t.email || '', phone: t.phone || '',
          role: t.role, status: t.status,
          activeJobs, completedToday, rating: t.rating || 4.5,
          specialties: t.specialties || [], joinedAt: t.joined_at,
        });
      });
    }

    // If user is authenticated but has NO real data in Supabase, clear all mock data
    // so new users see empty states instead of fake demo data
    if (!hasRealData) {
      data.clients.length = 0;
      data.jobs.length = 0;
      data.invoices.length = 0;
      data.teamMembers.length = 0;
      console.log('[PlumbCore] Authenticated user with no data — showing empty states');
    } else {
      console.log(`[PlumbCore] Data loaded: ${data.clients.length} clients, ${data.jobs.length} jobs, ${data.invoices.length} invoices, ${data.teamMembers.length} team members`);
    }
  } catch (e) {
    // On error, clear mock data for authenticated users to avoid showing fake data
    const storedAuth = typeof window !== 'undefined' ? localStorage.getItem('plumbcore-auth') : null;
    if (storedAuth) {
      data.clients.length = 0;
      data.jobs.length = 0;
      data.invoices.length = 0;
      data.teamMembers.length = 0;
      console.warn('[PlumbCore] Auth error — cleared mock data, showing empty states:', e);
    } else {
      console.warn('[PlumbCore] Using fallback data:', e);
    }
  }
}

// ── In-memory cache with 5-minute TTL ──
let cachedStats: { data: { totalRevenue: number; outstandingRevenue: number; activeJobs: number; scheduledJobs: number; completedJobs: number; urgentJobs: number; partsLowStock: number; totalClients: number; totalJobs: number; totalInvoices: number; totalInventoryItems: number } | null; timestamp: number } = { data: null, timestamp: 0 };
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ── Helper functions ──
export function getStats() {
  return {
    totalRevenue: 0,
    outstandingRevenue: 0,
    monthlyGoal: 50000,
    activeJobs: 0,
    scheduledJobs: 0,
    completedJobs: 0,
    urgentJobs: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    overdueInvoices: [],
    overdueCount: 0,
    averageResponseTime: '0m',
    jobCompletionRate: 0,
    newClientsThisMonth: 0,
    activeProjects: 0,
    totalJobs: 0,
  };
}

/**
 * Invalidate the stats cache so the next call to getStats() recomputes.
 * Call this after any mutation to jobs, invoices, clients, or inventory.
 */
export function invalidateStatsCache() {
  cachedStats.data = null;
  cachedStats.timestamp = 0;
}

export function getItemTransactions(itemId: string): InventoryTransaction[] {
  return data.inventoryTransactions
    .filter(t => t.itemId === itemId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
}