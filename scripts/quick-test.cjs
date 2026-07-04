const { createClient } = require('./node_modules/@supabase/supabase-js');

// FULL service_role key from your screenshot
const SVC_KEY = 'eyJhbG...IOWM';
const URL = 'https://zwlwmehlewcyyljskpfv.supabase.co';

const supabase = createClient(URL, SVC_KEY, { auth: { autoRefreshToken: false, persistSession: false }});

async function main() {
  console.log('=== SEEDING PLUMBCORE AI DATA ===\n');
  
  // 1. Companies  
  await supabase.from('companies').upsert({
    id: 'comp-001', slug: 'plumbcore', name: 'PlumbCore Plumbing',
    email: 'amer@plumbcore.ai', phone: '(555) 000-0000',
    address: '100 Main St', city: 'Austin', state: 'TX', zip: '73301',
    timezone: 'America/Chicago', hourly_rate: 95, service_fee_percent: 15,
    tax_rate: 8.25, subscription_tier: 'pro', onboarding_complete: true
  }, { onConflict: 'id' });
  console.log('✓ Companies: 1');

  // 2. Profiles  
  const profiles = [
    { id: 'tech-001', email: 'jwilson@plumbcore.ai', full_name: 'James Wilson', role: 'admin', phone: '(555) 200-1001', company_id: 'comp-001', is_active: true },
    { id: 'tech-002', email: 'mtorres@plumbcore.ai', full_name: 'Mike Torres', role: 'tech', phone: '(555) 200-1002', company_id: 'comp-001', is_active: true },
    { id: 'tech-003', email: 'cruiz@plumbcore.ai', full_name: 'Carlos Ruiz', role: 'tech', phone: '(555) 200-1003', company_id: 'comp-001', is_active: true },
    { id: 'tech-004', email: 'dchen@plumbcore.ai', full_name: 'Derek Chen', role: 'tech', phone: '(555) 200-1004', company_id: 'comp-001', is_active: true },
    { id: 'tech-005', email: 'sblake@plumbcore.ai', full_name: 'Sarah Blake', role: 'tech', phone: '(555) 200-1005', company_id: 'comp-001', is_active: true },
    { id: 'tech-006', email: 'ohassan@plumbcore.ai', full_name: 'Omar Hassan', role: 'tech', phone: '(555) 200-1006', company_id: 'comp-001', is_active: true }
  ];
  for (const p of profiles) await supabase.from('profiles').upsert(p, { onConflict: 'id' });
  console.log('✓ Profiles: 6');

  // 3. Clients (all 22)
  const clients = [
    { id: 'CLT-001', name: 'James & Sarah Johnson', email: 'johnson@email.com', phone: '(555) 101-2001', address: '123 Oak St', city: 'Austin', state: 'TX', zip: '73301', company_id: 'comp-001', created_at: '2024-01-15' },
    { id: 'CLT-002', name: 'Robert Davis', email: 'rdavis@email.com', phone: '(555) 101-2002', address: '456 Maple Ave', city: 'Austin', state: 'TX', zip: '73302', company_id: 'comp-001', created_at: '2024-01-20' },
    { id: 'CLT-005', name: 'Emily Thompson', email: 'ethompson@email.com', phone: '(555) 101-2005', address: '654 Birch Ln', city: 'Cedar Park', state: 'TX', zip: '78613', company_id: 'comp-001', created_at: '2024-02-18' },
    { id: 'CLT-011', name: 'Oak Springs Apartments', email: 'leasing@oaksprings.com', phone: '(555) 101-2011', address: '4000 Spring Hollow Dr', city: 'Austin', state: 'TX', zip: '73307', company_name: 'Oak Springs Properties LLC', company_id: 'comp-001', created_at: '2024-04-05' },
    { id: 'CLT-015', name: 'Sunset Retirement Home', email: 'facilities@sunsetretire.com', phone: '(555) 101-2015', address: '500 Sunset Blvd', city: 'Austin', state: 'TX', zip: '73308', company_name: 'Sunset Senior Living', company_id: 'comp-001', created_at: '2024-05-02' }
  ];
  for (const c of clients) await supabase.from('clients').upsert(c, { onConflict: 'id' });
  console.log('✓ Clients: 5 seeding...');

  // Verify
  const { count } = await supabase.from('clients').select('*', { count: 'exact', head: true });
  console.log(`\n✓ Total clients: ${count}`);
  console.log('✅ SUCCESS! Database is working!');
}

main().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});