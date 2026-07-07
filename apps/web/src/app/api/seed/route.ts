import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE || '';

interface SeedCompany {
  id: string; slug: string; name: string; email: string; phone: string;
  address: string; city: string; state: string; zip: string;
  timezone: string; subscription_tier: string; subscription_status: string;
}

const COMPANY: SeedCompany = {
  id: 'demo-company-001',
  slug: 'plumbcore-demo',
  name: 'PlumbCore Demo',
  email: 'demo@plumbcore.com',
  phone: '(555) 123-4567',
  address: '1200 PlumbCore Blvd',
  city: 'Austin',
  state: 'TX',
  zip: '73301',
  timezone: 'America/Chicago',
  subscription_tier: 'pro',
  subscription_status: 'active',
};

const CLIENTS = [
  { name: 'James & Sarah Johnson', email: 'johnson@email.com', phone: '(555) 101-2001', address: '123 Oak St', city: 'Austin', state: 'TX', zip: '73301', total_jobs: 8, total_revenue: 12450 },
  { name: 'Robert Davis', email: 'rdavis@email.com', phone: '(555) 101-2002', address: '456 Maple Ave', city: 'Austin', state: 'TX', zip: '73302', total_jobs: 5, total_revenue: 8900 },
  { name: 'Maria Wilson', email: 'mwilson@email.com', phone: '(555) 101-2003', address: '789 Pine Rd', city: 'Round Rock', state: 'TX', zip: '78664', total_jobs: 12, total_revenue: 18300 },
  { name: 'Emily Thompson', email: 'ethompson@email.com', phone: '(555) 101-2005', address: '654 Birch Ln', city: 'Cedar Park', state: 'TX', zip: '78613', total_jobs: 7, total_revenue: 11200 },
  { name: 'Oak Springs Apartments', company_name: 'Oak Springs Properties LLC', email: 'leasing@oaksprings.com', phone: '(555) 101-2011', address: '4000 Spring Hollow Dr', city: 'Austin', state: 'TX', zip: '73307', total_jobs: 15, total_revenue: 45000 },
  { name: 'Sunset Retirement Home', company_name: 'Sunset Senior Living', email: 'facilities@sunsetretire.com', phone: '(555) 101-2015', address: '500 Sunset Blvd', city: 'Austin', state: 'TX', zip: '73308', total_jobs: 20, total_revenue: 68000 },
  { name: 'Carlos Mendez', email: 'cmendez@email.com', phone: '(555) 101-2007', address: '321 Elm St', city: 'Austin', state: 'TX', zip: '73304' },
  { name: 'Lisa Park', email: 'lpark@email.com', phone: '(555) 101-2008', address: '777 Cedar Ct', city: 'Pflugerville', state: 'TX', zip: '78660' },
  { name: 'Downtown Pet Clinic', company_name: 'DPC Veterinary', email: 'frontdesk@dpc-vet.com', phone: '(555) 101-2020', address: '300 Commerce St', city: 'Austin', state: 'TX', zip: '73301' },
  { name: 'Henry Ford', email: 'hford@email.com', phone: '(555) 101-2009', address: '1500 Lakeview Dr', city: 'Austin', state: 'TX', zip: '73305' },
];

const TEAM_MEMBERS = [
  { name: 'James Wilson', email: 'jwilson@plumbcore.ai', phone: '(555) 200-1001', role: 'lead-tech', specialties: ['Water Heaters', 'Sewer Lines'] },
  { name: 'Mike Torres', email: 'mtorres@plumbcore.ai', phone: '(555) 200-1002', role: 'senior-tech', specialties: ['Drain Cleaning', 'Pipe Repair'] },
  { name: 'Alex Chen', email: 'achen@plumbcore.ai', phone: '(555) 200-1003', role: 'senior-tech', specialties: ['Gas Lines', 'Water Heaters'] },
  { name: 'Carlos Ruiz', email: 'cruiz@plumbcore.ai', phone: '(555) 200-1004', role: 'tech', specialties: ['Faucets', 'Toilets'] },
  { name: 'Sarah Blake', email: 'sblake@plumbcore.ai', phone: '(555) 200-1005', role: 'tech', specialties: ['Gas Lines', 'Water Heaters'] },
  { name: 'David Kim', email: 'dkim@plumbcore.ai', phone: '(555) 200-1006', role: 'dispatcher', specialties: ['Scheduling'] },
];

const JOB_TEMPLATES = [
  { title: 'Water Heater Repair', desc: 'Rheem 50-gal gas water heater not heating. Diagnose and repair or replace.', status: 'completed', priority: 'high', cost: 850 },
  { title: 'Drain Cleaning - Kitchen Sink', desc: 'Kitchen sink backing up. Needs drain snake and hydro-jetting.', status: 'in-progress', priority: 'medium', cost: 320 },
  { title: 'Pipe Replacement - Main Line', desc: 'Cast iron main sewer line has crack. Excavate and replace with PVC.', status: 'scheduled', priority: 'urgent', cost: 4500 },
  { title: 'Faucet Installation', desc: 'Install new Moen kitchen faucet. Customer provided fixture.', status: 'scheduled', priority: 'low', cost: 180 },
  { title: 'Sewer Line Inspection', desc: 'Camera inspection of main sewer line. Customer buying house.', status: 'in-progress', priority: 'medium', cost: 350 },
  { title: 'Gas Line Hookup', desc: 'Run new gas line for BBQ island. Include permit.', status: 'scheduled', priority: 'medium', cost: 1200 },
  { title: 'Tankless Water Heater Install', desc: 'Replace 50-gal tank with Navien tankless unit. Include recirc line.', status: 'scheduled', priority: 'high', cost: 3200 },
  { title: 'Emergency - Burst Pipe', desc: 'Pipe burst in basement ceiling. Emergency call - isolate and repair.', status: 'completed', priority: 'critical', cost: 1800 },
  { title: 'Toilet Replacement', desc: 'Replace old toilet with new Toto Drake. Includes wax ring and supply line.', status: 'completed', priority: 'low', cost: 450 },
  { title: 'Water Softener Installation', desc: 'Install whole-house water softener in garage. Connect to main line.', status: 'scheduled', priority: 'medium', cost: 1500 },
  { title: 'Remodel - Full Repipe', desc: 'Full repipe of 3-bedroom house. Replace all galvanized with PEX.', status: 'scheduled', priority: 'high', cost: 8500 },
  { title: 'Water Pressure Regulator', desc: 'Replace failing water pressure regulator at main shutoff.', status: 'completed', priority: 'medium', cost: 680 },
];

const INVENTORY_ITEMS = [
  { name: '3/4" PEX Pipe (100ft)', sku: 'PEX-34-100', category: 'pipe', quantity: 15, min_stock: 5, unit_price: 45, supplier: 'Ferguson Plumbing', location: 'Shelf A1' },
  { name: '1/2" PEX Pipe (100ft)', sku: 'PEX-12-100', category: 'pipe', quantity: 22, min_stock: 8, unit_price: 32, supplier: 'Ferguson Plumbing', location: 'Shelf A2' },
  { name: '3/4" Copper Pipe (10ft)', sku: 'CUP-34-10', category: 'pipe', quantity: 8, min_stock: 10, unit_price: 28, supplier: 'Winsupply', location: 'Rack B1' },
  { name: '1/2" Copper Pipe (10ft)', sku: 'CUP-12-10', category: 'pipe', quantity: 12, min_stock: 10, unit_price: 18, supplier: 'Winsupply', location: 'Rack B2' },
  { name: '3/4" PEX Crimp Ring (50pk)', sku: 'FIT-CR34-50', category: 'fitting', quantity: 6, min_stock: 3, unit_price: 12, supplier: 'Ferguson Plumbing', location: 'Drawer 4' },
  { name: '1/2" PEX Crimp Ring (50pk)', sku: 'FIT-CR12-50', category: 'fitting', quantity: 9, min_stock: 3, unit_price: 10, supplier: 'Ferguson Plumbing', location: 'Drawer 4' },
  { name: '3/4" Brass Ball Valve', sku: 'VAL-BR34', category: 'valve', quantity: 4, min_stock: 5, unit_price: 22, supplier: 'Winsupply', location: 'Drawer 7' },
  { name: '1/2" Brass Ball Valve', sku: 'VAL-BR12', category: 'valve', quantity: 7, min_stock: 5, unit_price: 16, supplier: 'Winsupply', location: 'Drawer 7' },
  { name: 'Rheem 50-gal Water Heater', sku: 'WH-RHEEM-50', category: 'heater', quantity: 2, min_stock: 2, unit_price: 620, supplier: 'Ferguson Plumbing', location: 'Warehouse A' },
  { name: 'Navien Tankless Heater', sku: 'WH-NAVIEN-240', category: 'heater', quantity: 1, min_stock: 1, unit_price: 1250, supplier: 'Ferguson Plumbing', location: 'Warehouse A' },
  { name: 'Toto Drake Toilet', sku: 'FIX-TOTO-DRAKE', category: 'fixture', quantity: 3, min_stock: 2, unit_price: 320, supplier: 'Winsupply', location: 'Warehouse B' },
  { name: 'Moen Kitchen Faucet', sku: 'FIX-MOEN-KIT', category: 'fixture', quantity: 2, min_stock: 2, unit_price: 180, supplier: 'Ferguson Plumbing', location: 'Warehouse B' },
  { name: 'Pipe Thread Sealant', sku: 'SEAL-PIPE-8', category: 'sealant', quantity: 18, min_stock: 5, unit_price: 6, supplier: 'Winsupply', location: 'Shelf C1' },
  { name: 'Teflon Tape (12pk)', sku: 'SEAL-TAPE-12', category: 'sealant', quantity: 24, min_stock: 10, unit_price: 4, supplier: 'Winsupply', location: 'Shelf C1' },
  { name: 'Wax Ring with Flange', sku: 'FIX-WAX-RING', category: 'fixture', quantity: 11, min_stock: 5, unit_price: 8, supplier: 'Ferguson Plumbing', location: 'Drawer 2' },
  { name: '1/2 HP Sump Pump', sku: 'PUMP-SUM-12HP', category: 'pump', quantity: 3, min_stock: 2, unit_price: 180, supplier: 'Ferguson Plumbing', location: 'Warehouse A' },
  { name: '3/4 HP Sewage Pump', sku: 'PUMP-SEW-34HP', category: 'pump', quantity: 1, min_stock: 1, unit_price: 420, supplier: 'Winsupply', location: 'Warehouse A' },
  { name: 'Drain Snake 50ft', sku: 'TOOL-SNAKE-50', category: 'tool', quantity: 2, min_stock: 1, unit_price: 280, supplier: 'Local Tool Supply', location: 'Tool Shed' },
  { name: 'Pipe Wrench 18"', sku: 'TOOL-WRENCH-18', category: 'tool', quantity: 4, min_stock: 2, unit_price: 45, supplier: 'Local Tool Supply', location: 'Tool Shed' },
];

async function exec(method: string, table: string, body: any) {
  const url = supabaseUrl + '/rest/v1/' + table;
  const auth = 'Bearer ' + serviceKey;
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': auth,
      'Prefer': 'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(table + ' error:', res.status, text.substring(0, 200));
  }
  return res.ok;
}

async function deleteAll(table: string) {
  if (!serviceKey || !supabaseUrl) return true;
  const url = supabaseUrl + '/rest/v1/' + table;
  const auth = 'Bearer ' + serviceKey;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'apikey': serviceKey,
      'Authorization': auth,
      'Prefer': 'return=minimal',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('DELETE ' + table + ' error:', res.status, text.substring(0, 200));
  }
  return res.ok;
}

export async function POST() {
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ error: 'Supabase not configured (missing service role key)' }, { status: 500 });
  }

  const results: string[] = [];

  // Delete existing data in reverse dependency order
  await deleteAll('line_items');
  await deleteAll('invoices');
  await deleteAll('jobs');
  await deleteAll('inventory_items');
  await deleteAll('pricebook_items');
  await deleteAll('clients');

  // 1. Seed company
  if (await exec('POST', 'companies', COMPANY)) results.push('Company seeded');

  // 2. Seed clients
  const clientIds: string[] = [];
  for (const c of CLIENTS) {
    const id = crypto.randomUUID();
    clientIds.push(id);
    await exec('POST', 'clients', {
      id, company_id: COMPANY.id,
      name: c.name, email: c.email || '', phone: c.phone || '',
      address: c.address || '', city: c.city || '', state: c.state || '', zip: c.zip || '',
      company_name: (c as any).company_name || '',
    });
  }
  results.push(CLIENTS.length + ' clients seeded');

  // 2.5 Seed team members
  const teamMemberIds: string[] = [];
  const teamNameToId: Record<string, string> = {};
  for (const tm of TEAM_MEMBERS) {
    const id = crypto.randomUUID();
    teamMemberIds.push(id);
    teamNameToId[tm.name] = id;
    await exec('POST', 'team_members', {
      id, company_id: COMPANY.id,
      name: tm.name, email: tm.email, phone: tm.phone,
      role: tm.role, status: 'online',
      specialties: tm.specialties, rating: 4.8,
      joined_at: new Date(Date.now() - Math.random() * 365 * 86400000).toISOString(),
    });
  }
  results.push(TEAM_MEMBERS.length + ' team members seeded');

  // 3. Seed jobs
  const jobIds: string[] = [];
  const techIds = teamMemberIds;
  for (let i = 0; i < JOB_TEMPLATES.length; i++) {
    const jt = JOB_TEMPLATES[i];
    const clientIdx = i % CLIENTS.length;
    const techIdx = i % techIds.length;
    const id = crypto.randomUUID();
    jobIds.push(id);

    const daysAgo = Math.floor(Math.random() * 30);
    const scheduledDate = new Date(Date.now() - daysAgo * 86400000);

    await exec('POST', 'jobs', {
      id, company_id: COMPANY.id,
      client_id: clientIds[clientIdx],
      assigned_tech_id: techIds[techIdx],
      title: jt.title,
      description: jt.desc,
      status: jt.status,
      priority: jt.priority,
      scheduled_date: scheduledDate.toISOString(),
      completed_at: jt.status === 'completed' ? scheduledDate.toISOString() : null,
      estimated_cost: jt.cost,
      actual_cost: jt.status === 'completed' ? jt.cost : null,
      address: CLIENTS[clientIdx].address,
      city: CLIENTS[clientIdx].city,
      state: CLIENTS[clientIdx].state,
      zip: CLIENTS[clientIdx].zip,
    });
  }
  results.push(JOB_TEMPLATES.length + ' jobs seeded');

  // 4. Seed invoices
  for (let i = 0; i < 8; i++) {
    const jobIdx = i % JOB_TEMPLATES.length;
    const clientIdx = jobIdx % CLIENTS.length;
    const invoiceId = crypto.randomUUID();
    const jobId = jobIds[jobIdx];
    const statuses = ['paid', 'paid', 'paid', 'sent', 'overdue'] as const;
    const status = statuses[i % statuses.length];
    const total = JOB_TEMPLATES[jobIdx].cost;
    const daysAgo = Math.floor(Math.random() * 20);
    const issueDate = new Date(Date.now() - daysAgo * 86400000);
    const dueDate = new Date(issueDate.getTime() + 30 * 86400000);

    await exec('POST', 'invoices', {
      id: invoiceId, company_id: COMPANY.id,
      job_id: jobId,
      client_id: clientIds[clientIdx],
      invoice_number: 'INV-' + (1001 + i),
      status,
      subtotal: total * 0.9,
      tax: total * 0.1,
      total,
      amount_paid: status === 'paid' ? total : 0,
      due_date: dueDate.toISOString(),
      issued_date: issueDate.toISOString(),
      paid_at: status === 'paid' ? issueDate.toISOString() : null,
    });

    // Add line items
    await exec('POST', 'line_items', {
      id: crypto.randomUUID(),
      invoice_id: invoiceId,
      description: JOB_TEMPLATES[jobIdx].title + ' - Labor',
      quantity: Math.floor(Math.random() * 4) + 2,
      unit_price: 85,
      total: (Math.floor(Math.random() * 4) + 2) * 85,
      type: 'labor',
    });

    await exec('POST', 'line_items', {
      id: crypto.randomUUID(),
      invoice_id: invoiceId,
      description: JOB_TEMPLATES[jobIdx].title + ' - Materials',
      quantity: 1,
      unit_price: JOB_TEMPLATES[jobIdx].cost * 0.4,
      total: JOB_TEMPLATES[jobIdx].cost * 0.4,
      type: 'part',
    });
  }
  results.push('8 invoices + line items seeded');

  // 5. Seed inventory
  for (const item of INVENTORY_ITEMS) {
    await exec('POST', 'inventory_items', {
      id: crypto.randomUUID(),
      company_id: COMPANY.id,
      ...item,
    });
  }
  results.push(INVENTORY_ITEMS.length + ' inventory items seeded');

  return NextResponse.json({
    success: true,
    results,
    company_id: COMPANY.id,
  });
}
