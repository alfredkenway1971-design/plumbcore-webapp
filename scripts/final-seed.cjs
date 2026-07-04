const { createClient } = require('/root/plumbcore-ai/node_modules/@supabase/supabase-js');

// Service Role Key
const SVC_KEY = 'eyJhbG...IOWM';
const URL = 'https://zwlwmehlewcyyljskpfv.supabase.co';

const supabase = createClient(URL, SVC_KEY, { auth: { autoRefreshToken: false, persistSession: false }});

async function main() {
  console.log('=== SEEDING PLUMBCORE DATA ===\n');
  
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
  await supabase.from('profiles').upsert([
    { id: 'tech-001', email: 'jwilson@plumbcore.ai', full_name: 'James Wilson', role: 'admin', company_id: 'comp-001' },
    { id: 'tech-002', email: 'mtorres@plumbcore.ai', full_name: 'Mike Torres', role: 'tech', company_id: 'comp-001' },
    { id: 'tech-003', email: 'cruiz@plumbcore.ai', full_name: 'Carlos Ruiz', role: 'tech', company_id: 'comp-001' },
    { id: 'tech-004', email: 'dchen@plumbcore.ai', full_name: 'Derek Chen', role: 'tech', company_id: 'comp-001' },
    { id: 'tech-005', email: 'sblake@plumbcore.ai', full_name: 'Sarah Blake', role: 'tech', company_id: 'comp-001' },
    { id: 'tech-006', email: 'ohassan@plumbcore.ai', full_name: 'Omar Hassan', role: 'tech', company_id: 'comp-001' }
  ], { onConflict: 'id' });
  console.log('✓ Profiles: 6');

  // 3. Clients (22)
  const clients = [
    { id: 'CLT-001', name: 'James & Sarah Johnson', email: 'johnson@email.com', phone: '(555) 101-2001', address: '123 Oak St', city: 'Austin', state: 'TX', zip: '73301', company_id: 'comp-001', created_at: '2024-01-15' },
    { id: 'CLT-002', name: 'Robert Davis', email: 'rdavis@email.com', phone: '(555) 101-2002', address: '456 Maple Ave', city: 'Austin', state: 'TX', zip: '73302', company_id: 'comp-001', created_at: '2024-01-20' },
    { id: 'CLT-003', name: 'Maria Wilson', email: 'mwilson@email.com', phone: '(555) 101-2003', address: '789 Pine Rd', city: 'Round Rock', state: 'TX', zip: '78664', company_id: 'comp-001', created_at: '2024-02-03' },
    { id: 'CLT-004', name: 'Carlos Garcia', email: 'cgarcia@email.com', phone: '(555) 101-2004', address: '321 Elm St', city: 'Austin', state: 'TX', zip: '73303', company_id: 'comp-001', created_at: '2024-02-10' },
    { id: 'CLT-005', name: 'Emily Thompson', email: 'ethompson@email.com', phone: '(555) 101-2005', address: '654 Birch Ln', city: 'Cedar Park', state: 'TX', zip: '78613', company_id: 'comp-001', created_at: '2024-02-18' },
    { id: 'CLT-006', name: 'Michael Brown', email: 'mbrown@email.com', phone: '(555) 101-2006', address: '987 Cedar Dr', city: 'Austin', state: 'TX', zip: '73304', company_id: 'comp-001', created_at: '2024-03-01' },
    { id: 'CLT-007', name: 'Patricia Martinez', email: 'pmartinez@email.com', phone: '(555) 101-2007', address: '246 Walnut Way', city: 'Pflugerville', state: 'TX', zip: '78660', company_id: 'comp-001', created_at: '2024-03-05' },
    { id: 'CLT-008', name: 'David Anderson', email: 'danderson@email.com', phone: '(555) 101-2008', address: '135 Spruce Ct', city: 'Austin', state: 'TX', zip: '73305', company_id: 'comp-001', created_at: '2024-03-12' },
    { id: 'CLT-009', name: 'Linda Thomas', email: 'lthomas@email.com', phone: '(555) 101-2009', address: '753 Ash Blvd', city: 'Georgetown', state: 'TX', zip: '78626', company_id: 'comp-001', created_at: '2024-03-20' },
    { id: 'CLT-010', name: 'Joseph White', email: 'jwhite@email.com', phone: '(555) 101-2010', address: '159 Poplar Ave', city: 'Austin', state: 'TX', zip: '73306', company_id: 'comp-001', created_at: '2024-04-01' },
    { id: 'CLT-011', name: 'Oak Springs Apartments', email: 'leasing@oaksprings.com', phone: '(555) 101-2011', address: '4000 Spring Hollow Dr', city: 'Austin', state: 'TX', zip: '73307', company_name: 'Oak Springs Properties LLC', company_id: 'comp-001', created_at: '2024-04-05' },
    { id: 'CLT-012', name: 'Barbara Harris', email: 'bharris@email.com', phone: '(555) 101-2012', address: '852 Magnolia St', city: 'Round Rock', state: 'TX', zip: '78665', company_id: 'comp-001', created_at: '2024-04-10' },
    { id: 'CLT-013', name: 'Main Street Diner', email: 'manager@mainstdiner.com', phone: '(555) 101-2013', address: '100 Main St', city: 'Austin', state: 'TX', zip: '73301', company_name: 'Main Street Hospitality', company_id: 'comp-001', created_at: '2024-04-18' },
    { id: 'CLT-014', name: 'Thomas Clark', email: 'tclark@email.com', phone: '(555) 101-2014', address: '369 Hickory Ln', city: 'Pflugerville', state: 'TX', zip: '78661', company_id: 'comp-001', created_at: '2024-04-25' },
    { id: 'CLT-015', name: 'Sunset Retirement Home', email: 'facilities@sunsetretire.com', phone: '(555) 101-2015', address: '500 Sunset Blvd', city: 'Austin', state: 'TX', zip: '73308', company_name: 'Sunset Senior Living', company_id: 'comp-001', created_at: '2024-05-02' },
    { id: 'CLT-016', name: 'Kevin Robinson', email: 'krobinson@email.com', phone: '(555) 101-2016', address: '741 Chestnut Ct', city: 'Cedar Park', state: 'TX', zip: '78614', company_id: 'comp-001', created_at: '2024-05-08' },
    { id: 'CLT-017', name: 'Riverside Church', email: 'office@riversidechurch.org', phone: '(555) 101-2017', address: '200 River Rd', city: 'Austin', state: 'TX', zip: '73309', company_name: 'Riverside Community Church', company_id: 'comp-001', created_at: '2024-05-15' },
    { id: 'CLT-018', name: 'Nancy Lee', email: 'nlee@email.com', phone: '(555) 101-2018', address: '258 Willow Dr', city: 'Georgetown', state: 'TX', zip: '78627', company_id: 'comp-001', created_at: '2024-05-22' },
    { id: 'CLT-019', name: 'TechHub Office Park', email: 'property@techhub.com', phone: '(555) 101-2019', address: '300 Innovation Way', city: 'Austin', state: 'TX', zip: '73310', company_name: 'TechHub Properties LLC', company_id: 'comp-001', created_at: '2024-06-01' },
    { id: 'CLT-020', name: 'Steven & Karen Adams', email: 'adamsfamily@email.com', phone: '(555) 101-2020', address: '951 Redwood Ave', city: 'Round Rock', state: 'TX', zip: '78666', company_id: 'comp-001', created_at: '2024-06-05' },
    { id: 'CLT-021', name: 'Lone Star Brewery', email: 'ops@lonestarbrew.com', phone: '(555) 101-2021', address: '400 Industrial Blvd', city: 'Austin', state: 'TX', zip: '73311', company_name: 'Lone Star Brewing Co', company_id: 'comp-001', created_at: '2024-06-12' },
    { id: 'CLT-022', name: 'Diana Foster', email: 'dfoster@email.com', phone: '(555) 101-2022', address: '633 Sycamore St', city: 'Pflugerville', state: 'TX', zip: '78662', company_id: 'comp-001', created_at: '2024-06-18' }
  ];
  for (const c of clients) await supabase.from('clients').upsert(c, { onConflict: 'id' });
  console.log('✓ Clients: 22');

  // 4. Jobs (10 seeded)
  const jobs = [
    { id: 'JOB-001', company_id: 'comp-001', client_id: 'CLT-001', title: 'Main line repair', description: 'Main sewer line clogged.', status: 'completed', priority: 'critical', scheduled_date: '2024-06-10', completed_at: '2024-06-10', estimated_cost: 450, actual_cost: 520, parts_cost: 180, labor_cost: 227.5, address: '123 Oak St', city: 'Austin', state: 'TX', zip: '73301', source: 'manual', created_at: '2024-06-09' },
    { id: 'JOB-002', company_id: 'comp-001', client_id: 'CLT-002', title: 'Water heater install', description: 'Replace 50-gal gas heater.', status: 'completed', priority: 'high', scheduled_date: '2024-06-11', completed_at: '2024-06-11', estimated_cost: 1200, actual_cost: 1095, parts_cost: 670, labor_cost: 340, address: '456 Maple Ave', city: 'Austin', state: 'TX', zip: '73302', source: 'manual', created_at: '2024-06-08' },
    { id: 'JOB-003', company_id: 'comp-001', client_id: 'CLT-003', title: 'Leak detection & fix', description: 'Water stain on ceiling.', status: 'scheduled', priority: 'medium', scheduled_date: '2024-07-15', estimated_cost: 350, address: '789 Pine Rd', city: 'Round Rock', state: 'TX', zip: '78664', source: 'manual', created_at: '2024-07-10' },
    { id: 'JOB-004', company_id: 'comp-001', client_id: 'CLT-004', title: 'Sewer line backup', description: 'Emergency sewage backup.', status: 'in-progress', priority: 'critical', scheduled_date: '2024-07-12', estimated_cost: 650, address: '321 Elm St', city: 'Austin', state: 'TX', zip: '73303', source: 'manual', created_at: '2024-07-12' },
    { id: 'JOB-005', company_id: 'comp-001', client_id: 'CLT-005', title: 'Faucet replacement', description: 'Replace kitchen faucet.', status: 'completed', priority: 'low', scheduled_date: '2024-06-12', completed_at: '2024-06-12', estimated_cost: 150, actual_cost: 175, parts_cost: 110, labor_cost: 65, address: '654 Birch Ln', city: 'Cedar Park', state: 'TX', zip: '78613', source: 'manual', created_at: '2024-06-11' }
  ];
  for (const j of jobs) await supabase.from('jobs').upsert(j, { onConflict: 'id' });
  console.log('✓ Jobs: 5 seeded');

  // 5. Invoices
  const invoices = [
    { id: 'INV-001', company_id: 'comp-001', job_id: 'JOB-001', client_id: 'CLT-001', invoice_number: 'INV-001', status: 'paid', subtotal: 520, total: 520, amount_paid: 520, due_date: '2024-07-10', issued_date: '2024-06-10', paid_at: '2024-06-25' },
    { id: 'INV-002', company_id: 'comp-001', job_id: 'JOB-002', client_id: 'CLT-002', invoice_number: 'INV-002', status: 'paid', subtotal: 1095, total: 1095, amount_paid: 1095, due_date: '2024-07-11', issued_date: '2024-06-11', paid_at: '2024-07-01' },
    { id: 'INV-003', company_id: 'comp-001', job_id: 'JOB-005', client_id: 'CLT-005', invoice_number: 'INV-003', status: 'paid', subtotal: 175, total: 175, amount_paid: 175, due_date: '2024-07-12', issued_date: '2024-06-12', paid_at: '2024-06-28' },
    { id: 'INV-004', company_id: 'comp-001', client_id: 'CLT-007', invoice_number: 'INV-004', status: 'paid', subtotal: 395, total: 395, amount_paid: 395, due_date: '2024-07-14', issued_date: '2024-06-14', paid_at: '2024-06-30' },
    { id: 'INV-005', company_id: 'comp-001', client_id: 'CLT-008', invoice_number: 'INV-005', status: 'paid', subtotal: 350, total: 350, amount_paid: 350, due_date: '2024-07-15', issued_date: '2024-06-15', paid_at: '2024-07-05' }
  ];
  for (const inv of invoices) {
    await supabase.from('invoices').upsert(inv, { onConflict: 'id' });
    if (inv.id === 'INV-001') {
      await supabase.from('line_items').upsert([
        { invoice_id: 'INV-001', description: 'Sewer line clearing', quantity: 1, unit_price: 340, total: 340, type: 'labor' },
        { invoice_id: 'INV-001', description: 'Camera inspection', quantity: 1, unit_price: 100, total: 100, type: 'labor' }
      ], { onConflict: ['invoice_id', 'description'] });
    }
  }
  console.log('✓ Invoices: 5 seeded');

  // Verify
  const { count: c } = await supabase.from('clients').select('*', { count: 'exact', head: true });
  const { count: j } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
  const { count: i } = await supabase.from('invoices').select('*', { count: 'exact', head: true });
  const { count: li } = await supabase.from('line_items').select('*', { count: 'exact', head: true });

  console.log('\n=== FINAL COUNTS ===');
  console.log(`clients: ${c || 0}`);
  console.log(`jobs: ${j || 0}`);
  console.log(`invoices: ${i || 0}`);
  console.log(`line_items: ${li || 0}`);
  console.log('\n✅ SEED COMPLETE!');
}

main().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});