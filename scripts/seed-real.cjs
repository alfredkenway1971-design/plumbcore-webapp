const { createClient } = require('/root/plumbcore-ai/node_modules/@supabase/supabase-js');

const SVC_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bHdtZWhsZXdjeXlsanNrcGZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzEwMTU4OCwiZXhwIjoyMDk4Njc3NTg4fQ.wbGoFI-ffsjW7rWzAMT0mQ20h4IBWkdDP2kmQ4AIOWM';
const supabase = createClient('https://zwlwmehlewcyyljskpfv.supabase.co', SVC_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

async function seedClients() {
  const clients = [
    { id: 'CLT-001', name: 'James & Sarah Johnson', email: 'johnson@email.com', phone: '(555) 101-2001', address: '123 Oak St', city: 'Austin', state: 'TX', zip: '73301', company_name: undefined, company_id: 'comp-001', created_at: '2024-01-15' },
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

  for (const c of clients) {
    await supabase.from('clients').upsert(c, { onConflict: 'id' }).select();
  }
  console.log('✓ Clients: 22 seeded');
}

async function seedProfiles() {
  const profiles = [
    { id: 'tech-001', email: 'jwilson@plumbcore.ai', full_name: 'James Wilson', role: 'admin', phone: '(555) 200-1001', company_id: 'comp-001', is_active: true },
    { id: 'tech-002', email: 'mtorres@plumbcore.ai', full_name: 'Mike Torres', role: 'tech', phone: '(555) 200-1002', company_id: 'comp-001', is_active: true },
    { id: 'tech-003', email: 'cruiz@plumbcore.ai', full_name: 'Carlos Ruiz', role: 'tech', phone: '(555) 200-1003', company_id: 'comp-001', is_active: true },
    { id: 'tech-004', email: 'dchen@plumbcore.ai', full_name: 'Derek Chen', role: 'tech', phone: '(555) 200-1004', company_id: 'comp-001', is_active: true },
    { id: 'tech-005', email: 'sblake@plumbcore.ai', full_name: 'Sarah Blake', role: 'tech', phone: '(555) 200-1005', company_id: 'comp-001', is_active: true },
    { id: 'tech-006', email: 'ohassan@plumbcore.ai', full_name: 'Omar Hassan', role: 'tech', phone: '(555) 200-1006', company_id: 'comp-001', is_active: true }
  ];

  for (const p of profiles) {
    await supabase.from('profiles').upsert(p, { onConflict: 'id' }).select();
  }
  console.log('✓ Profiles: 6 seeded');
}

async function seedJobs() {
  const jobs = [
    { id: 'JOB-001', company_id: 'comp-001', client_id: 'CLT-001', title: 'Main line repair', description: 'Main sewer line clogged, water backing up into basement. Needs urgent clearing and camera inspection.', status: 'completed', priority: 'critical', scheduled_date: '2024-06-10', completed_at: '2024-06-10', estimated_cost: 450, actual_cost: 520, parts_cost: 180, labor_cost: 227.5, address: '123 Oak St', city: 'Austin', state: 'TX', zip: '73301', source: 'manual', created_at: '2024-06-09' },
    { id: 'JOB-002', company_id: 'comp-001', client_id: 'CLT-002', title: 'Water heater install', description: 'Replace 50-gallon gas water heater. New unit: Bradford White 50-gal gas. Old unit failing, leaking.', status: 'completed', priority: 'high', scheduled_date: '2024-06-11', completed_at: '2024-06-11', estimated_cost: 1200, actual_cost: 1095, parts_cost: 670, labor_cost: 340, address: '456 Maple Ave', city: 'Austin', state: 'TX', zip: '73302', source: 'manual', created_at: '2024-06-08' },
    { id: 'JOB-003', company_id: 'comp-001', client_id: 'CLT-003', title: 'Leak detection & fix', description: 'Water stain on ceiling under bathroom. Needs leak detection and pipe repair.', status: 'scheduled', priority: 'medium', scheduled_date: '2024-07-15', estimated_cost: 350, address: '789 Pine Rd', city: 'Round Rock', state: 'TX', zip: '78664', source: 'manual', created_at: '2024-07-10' },
    { id: 'JOB-004', company_id: 'comp-001', client_id: 'CLT-004', title: 'Sewer line backup', description: 'Emergency call - raw sewage backing up into floor drain. Immediate response needed.', status: 'in-progress', priority: 'critical', scheduled_date: '2024-07-12', estimated_cost: 650, address: '321 Elm St', city: 'Austin', state: 'TX', zip: '73303', source: 'manual', created_at: '2024-07-12' },
    { id: 'JOB-005', company_id: 'comp-001', client_id: 'CLT-005', title: 'Faucet replacement', description: 'Replace kitchen faucet with new Moen single-handle model. Old faucet leaking under sink.', status: 'completed', priority: 'low', scheduled_date: '2024-06-12', completed_at: '2024-06-12', estimated_cost: 150, actual_cost: 175, parts_cost: 110, labor_cost: 65, address: '654 Birch Ln', city: 'Cedar Park', state: 'TX', zip: '78613', source: 'manual', created_at: '2024-06-11' }
  ];

  for (const j of jobs) {
    await supabase.from('jobs').upsert(j, { onConflict: 'id' }).select();
  }
  console.log(`✓ Jobs: ${jobs.length} seeded (of 31 total)`);
}

async function seedInvoices() {
  const invoices = [
    { id: 'INV-001', company_id: 'comp-001', job_id: 'JOB-001', client_id: 'CLT-001', invoice_number: 'INV-001', status: 'paid', subtotal: 520, tax: 0, total: 520, amount_paid: 520, due_date: '2024-07-10', issued_date: '2024-06-10', paid_at: '2024-06-25' },
    { id: 'INV-002', company_id: 'comp-001', job_id: 'JOB-002', client_id: 'CLT-002', invoice_number: 'INV-002', status: 'paid', subtotal: 1095, tax: 0, total: 1095, amount_paid: 1095, due_date: '2024-07-11', issued_date: '2024-06-11', paid_at: '2024-07-01' },
    { id: 'INV-003', company_id: 'comp-001', job_id: 'JOB-005', client_id: 'CLT-005', invoice_number: 'INV-003', status: 'paid', subtotal: 175, tax: 0, total: 175, amount_paid: 175, due_date: '2024-07-12', issued_date: '2024-06-12', paid_at: '2024-06-28' },
    { id: 'INV-013', company_id: 'comp-001', client_id: 'CLT-022', invoice_number: 'INV-013', status: 'sent', subtotal: 145, tax: 0, total: 145, due_date: '2024-08-08', issued_date: '2024-07-08' },
    { id: 'INV-014', company_id: 'comp-001', client_id: 'CLT-003', invoice_number: 'INV-014', status: 'draft', subtotal: 350, tax: 0, total: 350, due_date: '2024-08-15', issued_date: '2024-07-15' }
  ];

  for (const inv of invoices) {
    await supabase.from('invoices').upsert(inv, { onConflict: 'id' }).select();
    
    // Add line items
    if (inv.id === 'INV-001') {
      await supabase.from('line_items').upsert([
        { invoice_id: 'INV-001', description: 'Sewer line clearing - hydro jet', quantity: 1, unit_price: 340, total: 340, type: 'labor' },
        { invoice_id: 'INV-001', description: 'Camera inspection', quantity: 1, unit_price: 100, total: 100, type: 'labor' },
        { invoice_id: 'INV-001', description: 'Materials - PVC fittings, glue', quantity: 1, unit_price: 80, total: 80, type: 'part' }
      ], { onConflict: ['invoice_id', 'description'] });
    }
    if (inv.id === 'INV-002') {
      await supabase.from('line_items').upsert([
        { invoice_id: 'INV-002', description: 'Bradford White 50-gal gas water heater', quantity: 1, unit_price: 670, total: 670, type: 'part' },
        { invoice_id: 'INV-002', description: 'Installation labor', quantity: 4, unit_price: 85, total: 340, type: 'labor' },
        { invoice_id: 'INV-002', description: 'Permit fee', quantity: 1, unit_price: 85, total: 85, type: 'fee' }
      ], { onConflict: ['invoice_id', 'description'] });
    }
    if (inv.id === 'INV-003') {
      await supabase.from('line_items').upsert([
        { invoice_id: 'INV-003', description: 'Moen One-Handle kitchen faucet', quantity: 1, unit_price: 110, total: 110, type: 'part' },
        { invoice_id: 'INV-003', description: 'Labor - removal & install', quantity: 1, unit_price: 65, total: 65, type: 'labor' }
      ], { onConflict: ['invoice_id', 'description'] });
    }
  }
  console.log(`✓ Invoices: ${invoices.length} seeded with line items`);
}

async function seedInventory() {
  const inventory = [
    { id: 'INV-ITM-001', company_id: 'comp-001', name: '1/2" PEX Tubing (100ft roll)', sku: 'PEX-12-100', category: 'pipe', quantity: 15, min_stock: 5, unit_price: 45, supplier: 'SupplyHouse.com', location: 'Bay A-1', notes: 'Uponor PEX tubing' },
    { id: 'INV-ITM-002', company_id: 'comp-001', name: '3/4" PEX Tubing (100ft roll)', sku: 'PEX-34-100', category: 'pipe', quantity: 12, min_stock: 5, unit_price: 62, supplier: 'SupplyHouse.com', location: 'Bay A-1', notes: 'Uponor PEX tubing' },
    { id: 'INV-ITM-016', company_id: 'comp-001', name: 'Bradford White 50-gal Gas Water Heater', sku: 'HWT-BW-50G', category: 'heater', quantity: 4, min_stock: 2, unit_price: 670, supplier: 'Ferguson Plumbing', location: 'Bay E-1', notes: 'Bradford White water heater' },
    { id: 'INV-ITM-014', company_id: 'comp-001', name: 'Toto Drake Complete Toilet', sku: 'FIX-TOTO-DRK', category: 'fixture', quantity: 6, min_stock: 3, unit_price: 280, supplier: 'Ferguson Plumbing', location: 'Bay D-1', notes: 'Toto Drake toilet' },
    { id: 'INV-ITM-011', company_id: 'comp-001', name: '3/4" Ball Valve - Full Port Brass', sku: 'VAL-BRZ-34FP', category: 'valve', quantity: 22, min_stock: 10, unit_price: 18, supplier: 'Ferguson Plumbing', location: 'Bay C-1', notes: 'Brass ball valve' }
  ];

  for (const item of inventory) {
    await supabase.from('inventory_items').upsert(item, { onConflict: 'id' }).select();
  }
  console.log('✓ Inventory: 5 items seeded (of 24 total)');
}

async function main() {
  console.log('=== SEEDING PLUMBCORE AI DATA ===\n');
  
  await seedClients();
  await seedProfiles();
  await seedJobs();
  await seedInvoices();
  await seedInventory();

  // Verify
  console.log('\n=== VERIFICATION ===');
  const { count: clientCount } = await supabase.from('clients').select('*', { count: 'exact', head: true });
  const { count: jobCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
  const { count: invoiceCount } = await supabase.from('invoices').select('*', { count: 'exact', head: true });
  const { count: lineItemCount } = await supabase.from('line_items').select('*', { count: 'exact', head: true });
  const { count: inventoryCount } = await supabase.from('inventory_items').select('*', { count: 'exact', head: true });

  console.log(`clients: ${clientCount || 0}`);
  console.log(`jobs: ${jobCount || 0}`);
  console.log(`invoices: ${invoiceCount || 0}`);
  console.log(`line_items: ${lineItemCount || 0}`);
  console.log(`inventory_items: ${inventoryCount || 0}`);
  console.log('\n✅ SEED COMPLETE!');
}

main().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});