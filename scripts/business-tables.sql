-- PlumbCore AI — Business Tables Migration
-- Run this in Supabase SQL Editor

-- Clients
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  company_name TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  properties JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Jobs
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  assigned_tech_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','in-progress','completed','cancelled','urgent')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  scheduled_date TIMESTAMPTZ,
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_cost NUMERIC DEFAULT 0,
  actual_cost NUMERIC DEFAULT 0,
  labor_cost NUMERIC DEFAULT 0,
  parts_cost NUMERIC DEFAULT 0,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  photos TEXT[] DEFAULT '{}',
  notes TEXT,
  source TEXT DEFAULT 'manual',
  lead_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','overdue','cancelled')),
  subtotal NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  amount_paid NUMERIC DEFAULT 0,
  due_date TIMESTAMPTZ,
  issued_date TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ,
  stripe_payment_intent_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Line Items
CREATE TABLE IF NOT EXISTS public.line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  unit_price NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  type TEXT DEFAULT 'labor' CHECK (type IN ('labor','part','fee'))
);

-- Inventory Items
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  sku TEXT,
  category TEXT,
  quantity NUMERIC DEFAULT 0,
  min_stock NUMERIC DEFAULT 0,
  unit_price NUMERIC DEFAULT 0,
  supplier TEXT,
  location TEXT,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pricebook Items
CREATE TABLE IF NOT EXISTS public.pricebook_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  unit_price NUMERIC DEFAULT 0,
  unit_type TEXT,
  is_repair_type BOOLEAN DEFAULT false,
  estimated_hours NUMERIC,
  description TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clients_company ON public.clients(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_client ON public.jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company ON public.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_line_items_invoice ON public.line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_inventory_company ON public.inventory_items(company_id);
CREATE INDEX IF NOT EXISTS idx_pricebook_company ON public.pricebook_items(company_id);

-- Disable RLS for service_role usage
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricebook_items DISABLE ROW LEVEL SECURITY;
