/**
 * POST /api/admin/create-tables
 * Creates inventory and subscriptions tables in Supabase
 * Run this ONCE after deployment
 */
import { NextResponse } from 'next/server';

const SQL = `
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  sku TEXT DEFAULT '',
  quantity INTEGER DEFAULT 0,
  min_quantity INTEGER DEFAULT 0,
  unit_price DECIMAL(10,2) DEFAULT 0,
  category TEXT DEFAULT '',
  supplier TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  stripe_subscription_id TEXT DEFAULT '',
  stripe_customer_id TEXT DEFAULT '',
  plan_tier TEXT DEFAULT 'solo',
  status TEXT DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
`;

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  if (supabaseUrl && serviceKey) {
    try {
      const response = await fetch(`${supabaseUrl}/sql`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey,
          'Content-Type': 'text/plain',
        },
        body: SQL,
      });
      
      if (response.ok) {
        return NextResponse.json({ success: true, message: 'Tables created' });
      }
    } catch {}
  }
  
  return NextResponse.json({
    success: false,
    message: 'Could not create tables via API. Run this SQL in Supabase dashboard SQL editor:',
    sql: SQL,
    dashboard: 'https://supabase.com/dashboard/project/zwlwmehlewcyyljskpfv/sql/new',
  });
}
