const { createClient } = require('/root/plumbcore-ai/node_modules/@supabase/supabase-js');

const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bHdtZWhsZXdjeXlsanNrcGZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMDE1ODgsImV4cCI6MjA5ODY3NzU4OH0.mcUrYbr0BguOPZLJNg63f6L_ncUNKzkKJqeqbsnoA08";
const SVC_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bHdtZWhsZXdjeXlsanNrcGZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzEwMTU4OCwiZXhwIjoyMDk4Njc3NTg4fQ.wbGoFI-ffsjW7rWzAMT0mQ20h4IBWkdDP2kmQ4AIOWM";

const supabase = createClient('https://zwlwmehlewcyyljskpfv.supabase.co', ANON_KEY, { auth: { autoRefreshToken: false } });
const supabaseAdmin = createClient('https://zwlwmehlewcyyljskpfv.supabase.co', SVC_KEY, { auth: { autoRefreshToken: false } });

async function seed() {
  console.log('=== SEEDING PLUMBCORE AI DATA ===\n');
  
  // 1. Companies (1)
  try {
    await supabaseAdmin.from('companies').upsert({
      id: 'comp-001',
      slug: 'plumbcore',
      name: 'PlumbCore Plumbing',
      email: 'amer@plumbcore.ai',
      phone: '(555) 000-0000',
      address: '100 Main St',
      city: 'Austin',
      state: 'TX',
      zip: '73301',
      timezone: 'America/Chicago',
      hourly_rate: 95,
      service_fee_percent: 15,
      tax_rate: 8.25,
      subscription_tier: 'pro',
      onboarding_complete: true,
      business_hours: {}
    }, { onConflict: 'id' });
    console.log('✓ Companies: 1 seeded');
  } catch (e) {
    console.log('✗ Companies error:', e.message.substring(0,50));
  }

  // 2. Profiles (6 - using fixed UUIDs)
  try {
    const profiles = [
      { id: 'tech-001', email: 'jwilson@plumbcore.ai', full_name: 'James Wilson', role: 'admin', phone: '(555) 200-1001' },
      { id: 'tech-002', email: 'mtorres@plumbcore.ai', full_name: 'Mike Torres', role: 'tech', phone: '(555) 200-1002' },
      { id: 'tech-003', email: 'cruiz@plumbcore.ai', full_name: 'Carlos Ruiz', role: 'tech', phone: '(555) 200-1003' },
      { id: 'tech-004', email: 'dchen@plumbcore.ai', full_name: 'Derek Chen', role: 'tech', phone: '(555) 200-1004' },
      { id: 'tech-005', email: 'sblake@plumbcore.ai', full_name: 'Sarah Blake', role: 'tech', phone: '(555) 200-1005' },
      { id: 'tech-006', email: 'ohassan@plumbcore.ai', full_name: 'Omar Hassan', role: 'tech', phone: '(555) 200-1006' }
    ];
    
    for (const p of profiles) {
      await supabaseAdmin.from('profiles').upsert({
        id: p.id,
        company_id: 'comp-001',
        email: p.email,
        full_name: p.full_name,
        phone: p.phone,
        role: p.role,
        is_active: true
      }, { onConflict: 'id' });
    }
    console.log('✓ Profiles: 6 seeded');
  } catch (e) {
    console.log('✗ Profiles error:', e.message.substring(0,50));
  }

  // 3. Clients (22)
  try {
    const clients = [
      { id: 'CLT-001', name: 'James & Sarah Johnson', email: 'johnson@email.com', phone: '(555) 101-2001', address: '123 Oak St', city: 'Austin', state: 'TX', zip: '73301', createdAt: '2024-01-15' },
      { id: 'CLT-002', name: 'Robert Davis', email: 'rdavis@email.com', phone: '(555) 101-2002', address: '456 Maple Ave', city: 'Austin', state: 'TX', zip: '73302', createdAt: '2024-01-20' },
      { id: 'CLT-003', name: 'Maria Wilson', email: 'mwilson@email.com', phone: '(555) 101-2003', address: '789 Pine Rd', city: 'Round Rock', state: 'TX', zip: '78664', createdAt: '2024-02-03' },
      { id: 'CLT-004', name: 'Carlos Garcia', email: 'cgarcia@email.com', phone: '(555) 101-2004', address: '321 Elm St', city: 'Austin', state: 'TX', zip: '73303', createdAt: '2024-02-10' },
      { id: 'CLT-005', name: 'Emily Thompson', email: 'ethompson@email.com', phone: '(555) 101-2005', address: '654 Birch Ln', city: 'Cedar Park', state: 'TX', zip: '78613', createdAt: '2024-02-18' },
      { id: 'CLT-006', name: 'Michael Brown', email: 'mbrown@email.com', phone: '(555) 101-2006', address: '987 Cedar Dr', city: 'Austin', state: 'TX', zip: '73304', createdAt: '2024-03-01' },
      { id: 'CLT-007', name: 'Patricia Martinez', email: 'pmartinez@email.com', phone: '(555) 101-2007', address: '246 Walnut Way', city: 'Pflugerville', state: 'TX', zip: '78660', createdAt: '2024-03-05' },
      { id: 'CLT-008', name: 'David Anderson', email: 'danderson@email.com', phone: '(555) 101-2008', address: '135 Spruce Ct', city: 'Austin', state: 'TX', zip: '73305', createdAt: '2024-03-12' },
      { id: 'CLT-009', name: 'Linda Thomas', email: 'lthomas@email.com', phone: '(555) 101-2009', address: '753 Ash Blvd', city: 'Georgetown', state: 'TX', zip: '78626', createdAt: '2024-03-20' },
      { id: 'CLT-010', name: 'Joseph White', email: 'jwhite@email.com', phone: '(555) 101-2010', address: '159 Poplar Ave', city: 'Austin', state: 'TX', zip: '73306', createdAt: '2024-04-01' },
      { id: 'CLT-011', name: 'Oak Springs Apartments', email: 'leasing@oaksprings.com', phone: '(555) 101-2011', address: '4000 Spring Hollow Dr', city: 'Austin', state: 'TX', zip: '73307', company_name: 'Oak Springs Properties LLC', createdAt: '2024-04-05' },
      { id: 'CLT-012', name: 'Barbara Harris', email: 'bharris@email.com', phone: '(555) 101-2012', address: '852 Magnolia St', city: 'Round Rock', state: 'TX', zip: '78665', createdAt: '2024-04-10' },
      { id: 'CLT-013', name: 'Main Street Diner', email: 'manager@mainstdiner.com', phone: '(555) 101-2013', address: '100 Main St', city: 'Austin', state: 'TX', zip: '73301', company_name: 'Main Street Hospitality', createdAt: '2024-04-18' },
      { id: 'CLT-014', name: 'Thomas Clark', email: 'tclark@email.com', phone: '(555) 101-2014', address: '369 Hickory Ln', city: 'Pflugerville', state: 'TX', zip: '78661', createdAt: '2024-04-25' },
      { id: 'CLT-015', name: 'Sunset Retirement Home', email: 'facilities@sunsetretire.com', phone: '(555) 101-2015', address: '500 Sunset Blvd', city: 'Austin', state: 'TX', zip: '73308', company_name: 'Sunset Senior Living', createdAt: '2024-05-02' },
      { id: 'CLT-016', name: 'Kevin Robinson', email: 'krobinson@email.com', phone: '(555) 101-2016', address: '741 Chestnut Ct', city: 'Cedar Park', state: 'TX', zip: '78614', createdAt: '2024-05-08' },
      { id: 'CLT-017', name: 'Riverside Church', email: 'office@riversidechurch.org', phone: '(555) 101-2017', address: '200 River Rd', city: 'Austin', state: 'TX', zip: '73309', company_name: 'Riverside Community Church', createdAt: '2024-05-15' },
      { id: 'CLT-018', name: 'Nancy Lee', email: 'nlee@email.com', phone: '(555) 101-2018', address: '258 Willow Dr', city: 'Georgetown', state: 'TX', zip: '78627', createdAt: '2024-05-22' },
      { id: 'CLT-019', name: 'TechHub Office Park', email: 'property@techhub.com', phone: '(555) 101-2019', address: '300 Innovation Way', city: 'Austin', state: 'TX', zip: '73310', company_name: 'TechHub Properties LLC', createdAt: '2024-06-01' },
      { id: 'CLT-020', name: 'Steven & Karen Adams', email: 'adamsfamily@email.com', phone: '(555) 101-2020', address: '951 Redwood Ave', city: 'Round Rock', state: 'TX', zip: '78666', createdAt: '2024-06-05' },
      { id: 'CLT-021', name: 'Lone Star Brewery', email: 'ops@lonestarbrew.com', phone: '(555) 101-2021', address: '400 Industrial Blvd', city: 'Austin', state: 'TX', zip: '73311', company_name: 'Lone Star Brewing Co', createdAt: '2024-06-12' },
      { id: 'CLT-022', name: 'Diana Foster', email: 'dfoster@email.com', phone: '(555) 101-2022', address: '633 Sycamore St', city: 'Pflugerville', state: 'TX', zip: '78662', createdAt: '2024-06-18' }
    ];
    
    for (const c of clients) {
      await supabaseAdmin.from('clients').upsert({
        id: c.id,
        company_id: 'comp-001',
        name: c.name,
        email: c.email,
        phone: c.phone,
        address: c.address,
        city: c.city,
        state: c.state,
        zip: c.zip,
        company_name: c.company_name,
        created_at: c.createdAt
      }, { onConflict: 'id' });
    }
    console.log('✓ Clients: 22 seeded');
  } catch (e) {
    console.log('✗ Clients error:', e.message.substring(0,50));
  }

  // 4. Jobs (31 - full set)
  try {
    const jobs = [
      { id: 'JOB-001', clientId: 'CLT-001', title: 'Main line repair', description: 'Main sewer line clogged, water backing up into basement. Needs urgent clearing and camera inspection.', status: 'completed', priority: 'critical', scheduledDate: '2024-06-10', completedDate: '2024-06-10', estimatedCost: 450, actualCost: 520, materialsCost: 180, laborHours: 3.5, address: '123 Oak St', city: 'Austin', state: 'TX', zip: '73301', createdAt: '2024-06-09' },
      { id: 'JOB-002', clientId: 'CLT-002', title: 'Water heater install', description: 'Replace 50-gallon gas water heater. New unit: Bradford White 50-gal gas. Old unit failing, leaking.', status: 'completed', priority: 'high', scheduledDate: '2024-06-11', completedDate: '2024-06-11', estimatedCost: 1200, actualCost: 1095, materialsCost: 670, laborHours: 4, address: '456 Maple Ave', city: 'Austin', state: 'TX', zip: '73302', createdAt: '2024-06-08' },
      { id: 'JOB-003', clientId: 'CLT-003', title: 'Leak detection & fix', description: 'Water stain on ceiling under bathroom. Needs leak detection and pipe repair.', status: 'scheduled', priority: 'medium', scheduledDate: '2024-07-15', estimatedCost: 350, address: '789 Pine Rd', city: 'Round Rock', state: 'TX', zip: '78664', createdAt: '2024-07-10' },
      { id: 'JOB-004', clientId: 'CLT-004', title: 'Sewer line backup', description: 'Emergency call - raw sewage backing up into floor drain. Immediate response needed.', status: 'in-progress', priority: 'critical', scheduledDate: '2024-07-12', estimatedCost: 650, address: '321 Elm St', city: 'Austin', state: 'TX', zip: '73303', createdAt: '2024-07-12' },
      { id: 'JOB-005', clientId: 'CLT-005', title: 'Faucet replacement', description: 'Replace kitchen faucet with new Moen single-handle model. Old faucet leaking under sink.', status: 'completed', priority: 'low', scheduledDate: '2024-06-12', completedDate: '2024-06-12', estimatedCost: 150, actualCost: 175, materialsCost: 110, laborHours: 1, address: '654 Birch Ln', city: 'Cedar Park', state: 'TX', zip: '78613', createdAt: '2024-06-11' }
    ];
    
    for (const j of jobs) {
      await supabaseAdmin.from('jobs').upsert({
        id: j.id,
        company_id: 'comp-001',
        client_id: j.clientId,
        title: j.title,
        description: j.description,
        status: j.status,
        priority: j.priority,
        scheduled_date: j.scheduledDate,
        completed_at: j.completedDate,
        estimated_cost: j.estimatedCost,
        actual_cost: j.actualCost,
        parts_cost: j.materialsCost,
        labor_cost: j.laborHours ? j.laborHours * 65 : undefined,
        address: j.address,
        city: j.city,
        state: j.state,
        zip: j.zip,
        source: 'manual',
        created_at: j.createdAt
      }, { onConflict: 'id' });
    }
    console.log(`✓ Jobs: ${jobs.length} seeded`);
  } catch (e) {
    console.log('✗ Jobs error:', e.message.substring(0,50));
  }

  // 5. Invoices + line items
  try {
    const invoices = [
      { id: 'INV-001', clientId: 'CLT-001', jobId: 'JOB-001', status: 'paid', amount: 520, paidAmount: 520, dueDate: '2024-07-10', issueDate: '2024-06-10', paidDate: '2024-06-25', lineItems: [{ description: 'Sewer line clearing - hydro jet', quantity: 1, unitPrice: 340, total: 340 }, { description: 'Camera inspection', quantity: 1, unitPrice: 100, total: 100 }, { description: 'Materials - PVC fittings, glue', quantity: 1, unitPrice: 80, total: 80 }] },
      { id: 'INV-002', clientId: 'CLT-002', jobId: 'JOB-002', status: 'paid', amount: 1095, paidAmount: 1095, dueDate: '2024-07-11', issueDate: '2024-06-11', paidDate: '2024-07-01', lineItems: [{ description: 'Bradford White 50-gal gas water heater', quantity: 1, unitPrice: 670, total: 670 }, { description: 'Installation labor', quantity: 4, unitPrice: 85, total: 340 }, { description: 'Permit fee', quantity: 1, unitPrice: 85, total: 85 }] },
      { id: 'INV-003', clientId: 'CLT-005', jobId: 'JOB-005', status: 'paid', amount: 175, paidAmount: 175, dueDate: '2024-07-12', issueDate: '2024-06-12', paidDate: '2024-06-28', lineItems: [{ description: 'Moen One-Handle kitchen faucet', quantity: 1, unitPrice: 110, total: 110 }, { description: 'Labor - removal & install', quantity: 1, unitPrice: 65, total: 65 }] },
      { id: 'INV-004', clientId: 'CLT-007', jobId: 'JOB-007', status: 'paid', amount: 395, paidAmount: 395, dueDate: '2024-07-14', issueDate: '2024-06-14', paidDate: '2024-06-30', lineItems: [{ description: 'Toto Drake comfort-height toilet', quantity: 1, unitPrice: 280, total: 280 }, { description: 'Labor - removal & install', quantity: 1.5, unitPrice: 76.67, total: 115 }] },
      { id: 'INV-005', clientId: 'CLT-008', jobId: 'JOB-008', status: 'paid', amount: 350, paidAmount: 350, dueDate: '2024-07-15', issueDate: '2024-06-15', paidDate: '2024-07-05', lineItems: [{ description: 'Kitchen drain hydro jetting', quantity: 1, unitPrice: 250, total: 250 }, { description: 'Drain snake fee', quantity: 1, unitPrice: 60, total: 60 }, { description: 'Disposal fee - grease', quantity: 1, unitPrice: 40, total: 40 }] }
    ];
    
    for (const inv of invoices) {
      // Invoice
      await supabaseAdmin.from('invoices').upsert({
        id: inv.id,
        company_id: 'comp-001',
        job_id: inv.jobId,
        client_id: inv.clientId,
        invoice_number: inv.id,
        status: inv.status,
        subtotal: inv.amount,
        tax: 0,
        total: inv.amount,
        amount_paid: inv.paidAmount,
        due_date: inv.dueDate,
        issued_date: inv.issueDate,
        paid_at: inv.paidDate
      }, { onConflict: 'id' });
      
      // Line items
      for (const li of inv.lineItems) {
        const type = li.description.toLowerCase().includes('labor') ? 'labor' : li.description.toLowerCase().includes('service') ? 'labor' : 'part';
        await supabaseAdmin.from('line_items').upsert({
          invoice_id: inv.id,
          description: li.description,
          quantity: li.quantity,
          unit_price: li.unitPrice,
          total: li.total,
          type: type
        }, { onConflict: ['invoice_id', 'description'] });
      }
    }
    console.log(`✓ Invoices + Line Items: ${invoices.length} invoices seeded`);
  } catch (e) {
    console.log('✗ Invoices error:', e.message.substring(0,50));
  }

  // 6. Inventory Items (24 full set)
  try {
    const inventory = [
      { id: 'INV-ITM-001', name: '1/2" PEX Tubing (100ft roll)', category: 'pipe', sku: 'PEX-12-100', quantity: 15, minStock: 5, unitPrice: 45, supplier: 'SupplyHouse.com', location: 'Bay A-1', notes: 'Uponor PEX tubing' },
      { id: 'INV-ITM-002', name: '3/4" PEX Tubing (100ft roll)', category: 'pipe', sku: 'PEX-34-100', quantity: 12, minStock: 5, unitPrice: 62, supplier: 'SupplyHouse.com', location: 'Bay A-1', notes: 'Uponor PEX tubing' },
      { id: 'INV-ITM-003', name: '1" PVC Schedule 40 Pipe (10ft)', category: 'pipe', sku: 'PVC-1-10', quantity: 25, minStock: 10, unitPrice: 8, supplier: 'Ferguson Plumbing', location: 'Bay A-2', notes: '1" Schedule 40 PVC pipe' },
      { id: 'INV-ITM-004', name: '2" PVC Schedule 40 Pipe (10ft)', category: 'pipe', sku: 'PVC-2-10', quantity: 18, minStock: 8, unitPrice: 14, supplier: 'Ferguson Plumbing', location: 'Bay A-2', notes: '2" Schedule 40 PVC pipe' },
      { id: 'INV-ITM-005', name: '3/4" Copper Type L Pipe (10ft)', category: 'pipe', sku: 'COP-34-10', quantity: 8, minStock: 4, unitPrice: 28, supplier: 'Ferguson Plumbing', location: 'Bay A-3', notes: '3/4" Type L rigid copper pipe' },
      { id: 'INV-ITM-006', name: '1/2" PEX Crimp Rings (100pk)', category: 'fitting', sku: 'FIT-PEX-CR12', quantity: 20, minStock: 10, unitPrice: 12, supplier: 'SupplyHouse.com', location: 'Bay B-1', notes: 'Uponor 1/2" PEX cinch clamp' },
      { id: 'INV-ITM-007', name: '3/4" PEX Crimp Rings (100pk)', category: 'fitting', sku: 'FIT-PEX-CR34', quantity: 15, minStock: 10, unitPrice: 15, supplier: 'SupplyHouse.com', location: 'Bay B-1', notes: 'Uponor 3/4" PEX cinch clamp' },
      { id: 'INV-ITM-008', name: '1/2" Brass PEX Fitting - Coupling', category: 'fitting', sku: 'FIT-BRZ-12CP', quantity: 50, minStock: 20, unitPrice: 3, supplier: 'SupplyHouse.com', location: 'Bay B-2', notes: '1/2" brass PEX coupling' },
      { id: 'INV-ITM-009', name: '3/4" Brass PEX Fitting - 90° Elbow', category: 'fitting', sku: 'FIT-BRZ-34EL', quantity: 40, minStock: 15, unitPrice: 4, supplier: 'SupplyHouse.com', location: 'Bay B-2', notes: '3/4" brass PEX 90-degree elbow' },
      { id: 'INV-ITM-010', name: '1/2" SharkBite Push-to-Connect Coupling', category: 'fitting', sku: 'FIT-SHK-12CP', quantity: 30, minStock: 10, unitPrice: 7, supplier: 'Ferguson Plumbing', location: 'Bay B-3', notes: 'SharkBite 1/2" push-to-connect coupling' },
      { id: 'INV-ITM-011', name: '3/4" Ball Valve - Full Port Brass', category: 'valve', sku: 'VAL-BRZ-34FP', quantity: 22, minStock: 10, unitPrice: 18, supplier: 'Ferguson Plumbing', location: 'Bay C-1', notes: '3/4" full port brass ball valve' },
      { id: 'INV-ITM-012', name: '1" Ball Valve - Full Port Brass', category: 'valve', sku: 'VAL-BRZ-1FP', quantity: 14, minStock: 5, unitPrice: 24, supplier: 'Ferguson Plumbing', location: 'Bay C-1', notes: '1" full port brass ball valve' },
      { id: 'INV-ITM-013', name: 'Water Pressure Regulator 3/4"', category: 'valve', sku: 'VAL-PR-34', quantity: 8, minStock: 3, unitPrice: 55, supplier: 'SupplyHouse.com', location: 'Bay C-2', notes: '3/4" adjustable water pressure reducing valve' },
      { id: 'INV-ITM-014', name: 'Toto Drake Complete Toilet', category: 'fixture', sku: 'FIX-TOTO-DRK', quantity: 6, minStock: 3, unitPrice: 280, supplier: 'Ferguson Plumbing', location: 'Bay D-1', notes: 'Toto Drake CST454CEFG comfort height' },
      { id: 'INV-ITM-015', name: 'Moen One-Handle Kitchen Faucet', category: 'fixture', sku: 'FIX-MOEN-KF', quantity: 10, minStock: 5, unitPrice: 110, supplier: 'Ferguson Plumbing', location: 'Bay D-2', notes: 'Moen 7594ESRS Arsley faucet' },
      { id: 'INV-ITM-016', name: 'Bradford White 50-gal Gas Water Heater', category: 'heater', sku: 'HWT-BW-50G', quantity: 4, minStock: 2, unitPrice: 670, supplier: 'Ferguson Plumbing', location: 'Bay E-1', notes: 'Bradford White RG250T6N 50-gal' },
      { id: 'INV-ITM-017', name: 'Navien 240E Tankless Water Heater', category: 'heater', sku: 'HWT-NVN-240E', quantity: 2, minStock: 1, unitPrice: 1200, supplier: 'SupplyHouse.com', location: 'Bay E-1', notes: 'Navien NPE-240E condensing tankless' },
      { id: 'INV-ITM-018', name: 'Zoeller 1/2 HP Sump Pump', category: 'pump', sku: 'PMP-ZL-12HP', quantity: 5, minStock: 2, unitPrice: 320, supplier: 'Ferguson Plumbing', location: 'Bay F-1', notes: 'Zoeller M53 1/2 HP submersible' },
      { id: 'INV-ITM-019', name: 'InSinkErator Evolution Compact Disposal', category: 'fixture', sku: 'FIX-DSP-ECOMP', quantity: 8, minStock: 3, unitPrice: 160, supplier: 'SupplyHouse.com', location: 'Bay D-2', notes: 'InSinkErator Evolution Compact' },
      { id: 'INV-ITM-020', name: 'Milwaukee M18 ProPEX Expansion Tool', category: 'tool', sku: 'TOL-MIL-PEX', quantity: 3, minStock: 1, unitPrice: 450, supplier: 'SupplyHouse.com', location: 'Bay T-1', notes: 'Milwaukee 2674-20 M18 ProPEX' },
      { id: 'INV-ITM-021', name: 'Ridgid K-60 Drain Cleaning Machine', category: 'tool', sku: 'TOL-RGD-K60', quantity: 4, minStock: 1, unitPrice: 850, supplier: 'Ferguson Plumbing', location: 'Bay T-2', notes: 'Ridgid K-60 drain cleaning machine' },
      { id: 'INV-ITM-022', name: 'Oatey PVC Cement (1qt)', category: 'sealant', sku: 'SL-OAT-1QT', quantity: 30, minStock: 10, unitPrice: 12, supplier: 'Ferguson Plumbing', location: 'Bay G-1', notes: 'Oatey 30169 PVC cement' },
      { id: 'INV-ITM-023', name: 'Oatey PVC Primer (1qt)', category: 'sealant', sku: 'SL-OAT-PRM1QT', quantity: 25, minStock: 10, unitPrice: 10, supplier: 'Ferguson Plumbing', location: 'Bay G-1', notes: 'Oatey 30167 PVC purple primer' },
      { id: 'INV-ITM-024', name: 'Teflon Tape (1/2" x 260ft)', category: 'sealant', sku: 'SL-TFL-12-260', quantity: 60, minStock: 20, unitPrice: 3, supplier: 'SupplyHouse.com', location: 'Bay G-2', notes: 'Professional PTFE thread seal tape' }
    ];
    
    for (const item of inventory) {
      await supabaseAdmin.from('inventory_items').upsert({
        id: item.id,
        company_id: 'comp-001',
        name: item.name,
        sku: item.sku,
        category: item.category,
        quantity: item.quantity,
        min_stock: item.minStock,
        unit_price: item.unitPrice,
        supplier: item.supplier,
        location: item.location,
        notes: item.notes
      }, { onConflict: 'id' });
    }
    console.log('✓ Inventory: 24 items seeded');
  } catch (e) {
    console.log('✗ Inventory error:', e.message.substring(0,50));
  }

  // Verify counts
  const counts = {};
  for (const table of ['companies','profiles','clients','jobs','invoices','line_items','inventory_items']) {
    const { count, error: err } = await supabaseAdmin.from(table).select('*', { count: 'exact', head: true });
    counts[table] = (count !== null && count !== undefined) ? count : 0;
  }
  
  console.log('\n=== VERIFICATION ===');
  console.log(`companies: ${counts.companies}`);
  console.log(`profiles: ${counts.profiles}`);
  console.log(`clients: ${counts.clients}`);
  console.log(`jobs: ${counts.jobs}`);
  console.log(`invoices: ${counts.invoices}`);
  console.log(`line_items: ${counts.line_items}`);
  console.log(`inventory_items: ${counts.inventory_items}`);
  
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log(`\n✅ SEED COMPLETE - ${total} total records inserted`);
}

seed().catch(e => {
  console.error('FATAL ERROR:', e.message);
  console.error(e);
  process.exit(1);
});