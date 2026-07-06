'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ── Database Types ── */
export type Database = {
  public: {
    Tables: {
      companies: { Row: Company; Insert: Omit<Company, 'id' | 'created_at'>; Update: Partial<Omit<Company, 'id'>> };
      profiles: { Row: Profile; Insert: Omit<Profile, 'id' | 'created_at'>; Update: Partial<Omit<Profile, 'id'>> };
      auth_users: { Row: AuthUserDb; Insert: Omit<AuthUserDb, 'id' | 'created_at'>; Update: Partial<Omit<AuthUserDb, 'id'>> };
      clients: { Row: ClientDb; Insert: Omit<ClientDb, 'id' | 'created_at'>; Update: Partial<Omit<ClientDb, 'id'>> };
      jobs: { Row: JobDb; Insert: Omit<JobDb, 'id' | 'created_at'>; Update: Partial<Omit<JobDb, 'id'>> };
      invoices: { Row: InvoiceDb; Insert: Omit<InvoiceDb, 'id' | 'created_at'>; Update: Partial<Omit<InvoiceDb, 'id'>> };
      line_items: { Row: LineItemDb; Insert: Omit<LineItemDb, 'id'>; Update: Partial<Omit<LineItemDb, 'id'>> };
      inventory_items: { Row: InventoryItemDb; Insert: Omit<InventoryItemDb, 'id' | 'created_at'>; Update: Partial<Omit<InventoryItemDb, 'id'>> };
      pricebook_items: { Row: PricebookItemDb; Insert: Omit<PricebookItemDb, 'id'>; Update: Partial<Omit<PricebookItemDb, 'id'>> };
    };
  };
};

export interface Company {
  id: string; slug: string; name: string; email: string; phone: string;
  address: string; city: string; state: string; zip: string; website?: string;
  logo_url?: string; timezone: string;
  business_hours: Record<string, {open:string;close:string}>;
  hourly_rate: number; service_fee_percent: number; tax_rate: number;
  stripe_account_id?: string; stripe_onboarding_complete: boolean;
  trial_end: string; subscription_tier: 'starter' | 'pro' | 'unlimited';
  created_at: string; onboarding_complete: boolean;
}
export interface Profile {
  id: string; company_id: string; email: string; full_name: string; phone: string;
  role: 'admin' | 'dispatcher' | 'tech' | 'lead-tech' | 'accountant';
  avatar_url?: string; is_active: boolean; created_at: string;
}
export interface ClientDb {
  id: string; company_id: string; name: string; email: string; phone: string;
  address: string; city: string; state: string; zip: string; company_name?: string;
  notes?: string; tags?: string[]; properties?: {address:string;type:string}[];
  created_at: string;
}
export interface JobDb {
  id: string; company_id: string; client_id: string; assigned_tech_id?: string;
  title: string; description: string;
  status: 'scheduled'|'in-progress'|'completed'|'cancelled'|'urgent';
  priority: 'low'|'medium'|'high'|'critical';
  scheduled_date: string; scheduled_start?: string; scheduled_end?: string;
  completed_at?: string; estimated_cost: number; actual_cost?: number;
  labor_cost?: number; parts_cost?: number;
  address: string; city: string; state: string; zip: string;
  photos?: string[]; notes?: string;
  source: 'manual'|'ai-quote'|'lead'; lead_id?: string;
  created_at: string;
}
export interface InvoiceDb {
  id: string; company_id: string; job_id: string; client_id: string;
  invoice_number: string; status: 'draft'|'sent'|'paid'|'overdue'|'cancelled';
  subtotal: number; tax: number; total: number; amount_paid?: number;
  due_date: string; issued_date: string; paid_at?: string;
  stripe_payment_intent_id?: string; notes?: string;
  created_at: string;
}
export interface LineItemDb {
  id: string; invoice_id: string; description: string; quantity: number;
  unit_price: number; total: number; type: 'labor'|'part'|'fee';
}
export interface InventoryItemDb {
  id: string; company_id: string; name: string; sku: string;
  category: string; quantity: number; min_stock: number; unit_price: number;
  supplier?: string; location?: string; notes?: string;
  photo_url?: string; created_at: string;
}
export interface PricebookItemDb {
  id: string; company_id: string; name: string; category: string;
  unit_price: number; unit_type: string; is_repair_type: boolean;
  estimated_hours?: number; description?: string;
}

export interface AuthUserDb {
  id: string; email: string; password_hash: string;
  full_name: string; company_name: string; company_slug: string;
  company_id: string; phone: string; role: string;
  stripe_customer_id: string; stripe_subscription_id: string;
  subscription_tier: string; created_at: string;
}