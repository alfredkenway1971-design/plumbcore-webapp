/**
 * PlumbCore AI — Seed Script
 *
 * Inserts all mock data from /root/plumbcore-ai/apps/web/src/lib/mock-data.ts
 * into the Supabase database using the service_role key (bypasses RLS).
 *
 * Tables seeded: companies, profiles, clients, jobs, invoices, line_items, inventory_items
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// ── Supabase connection ────────────────────────────────────────────
const scriptContent = fs.readFileSync(__filename, 'utf8');
const checkDbContent = fs.readFileSync(
  require('path').join(__dirname, 'check-db.cjs'),
  'utf8'
);
const url = checkDbContent.match(/url\s*=\s*'([^']+)'/)[1];
const svc = checkDbContent.match(/svc\s*=\s*'([^']+)'/)[1];

const supabase = createClient(url, svc, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Company ID (shared across all records) ────────────────────────
const COMPANY_ID = 'company-001';

// ── Helpers ────────────────────────────────────────────────────────
function now() {
  return new Date().toISOString();
}

async function upsertAll(table, rows, options = {}) {
  if (!rows || rows.length === 0) {
    console.log(`  ⏭  ${table}: 0 rows (nothing to insert)`);
    return;
  }
  const { error } = await supabase.from(table).upsert(rows, {
    onConflict: 'id',
    ignoreDuplicates: false,
    ...options,
  });
  if (error) {
    console.error(`  ❌ ${table}: UPSERT FAILED — ${error.message}`);
    throw error;
  }
  console.log(`  ✅ ${table}: ${rows.length} rows upserted`);
}

// ══════════════════════════════════════════════════════════════════
//  0. COMPANY
// ══════════════════════════════════════════════════════════════════
const company = {
  id: COMPANY_ID,
  slug: 'plumbcore-ai',
  name: 'PlumbCore AI Plumbing',
  email: 'hello@plumbcore.ai',
  phone: '(555) 000-0000',
  address: '100 Business Park Dr',
  city: 'Austin',
  state: 'TX',
  zip: '73301',
  timezone: 'America/Chicago',
  business_hours: {
    monday: { open: '07:00', close: '18:00' },
    tuesday: { open: '07:00', close: '18:00' },
    wednesday: { open: '07:00', close: '18:00' },
    thursday: { open: '07:00', close: '18:00' },
    friday: { open: '07:00', close: '17:00' },
    saturday: { open: '08:00', close: '14:00' },
    sunday: { open: '00:00', close: '00:00' },
  },
  hourly_rate: 85,
  service_fee_percent: 0,
  tax_rate: 8.25,
  trial_end: '2025-12-31T23:59:59Z',
  subscription_tier: 'pro',
  onboarding_complete: true,
  created_at: '2024-01-01T00:00:00Z',
};

// ══════════════════════════════════════════════════════════════════
//  1. PROFILES  (from teamMembers mock data)
// ══════════════════════════════════════════════════════════════════
const teamMembers = [
  { id: 'TECH-001', name: 'James Wilson', email: 'jwilson@plumbcore.ai', phone: '(555) 200-1001', role: 'lead-tech', joinedAt: '2023-03-01' },
  { id: 'TECH-002', name: 'Mike Torres', email: 'mtorres@plumbcore.ai', phone: '(555) 200-1002', role: 'senior-tech', joinedAt: '2023-06-15' },
  { id: 'TECH-003', name: 'Carlos Ruiz', email: 'cruiz@plumbcore.ai', phone: '(555) 200-1003', role: 'senior-tech', joinedAt: '2023-09-01' },
  { id: 'TECH-004', name: 'Derek Chen', email: 'dchen@plumbcore.ai', phone: '(555) 200-1004', role: 'tech', joinedAt: '2024-01-10' },
  { id: 'TECH-005', name: 'Sarah Blake', email: 'sblake@plumbcore.ai', phone: '(555) 200-1005', role: 'tech', joinedAt: '2024-02-20' },
  { id: 'TECH-006', name: 'Omar Hassan', email: 'ohassan@plumbcore.ai', phone: '(555) 200-1006', role: 'tech', joinedAt: '2024-04-05' },
];

const ROLE_MAP = {
  'lead-tech': 'lead-tech',
  'senior-tech': 'tech',
  tech: 'tech',
  dispatcher: 'dispatcher',
  admin: 'admin',
};

function toProfile(tm) {
  return {
    id: tm.id,
    company_id: COMPANY_ID,
    email: tm.email,
    full_name: tm.name,
    phone: tm.phone,
    role: ROLE_MAP[tm.role] || 'tech',
    is_active: true,
    created_at: new Date(tm.joinedAt + 'T00:00:00Z').toISOString(),
  };
}

// ══════════════════════════════════════════════════════════════════
//  2. CLIENTS
// ══════════════════════════════════════════════════════════════════
const mockClients = [
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
  { id: 'CLT-011', name: 'Oak Springs Apartments', email: 'leasing@oaksprings.com', phone: '(555) 101-2011', address: '4000 Spring Hollow Dr', city: 'Austin', state: 'TX', zip: '73307', createdAt: '2024-04-05', company: 'Oak Springs Properties LLC' },
  { id: 'CLT-012', name: 'Barbara Harris', email: 'bharris@email.com', phone: '(555) 101-2012', address: '852 Magnolia St', city: 'Round Rock', state: 'TX', zip: '78665', createdAt: '2024-04-10' },
  { id: 'CLT-013', name: 'Main Street Diner', email: 'manager@mainstdiner.com', phone: '(555) 101-2013', address: '100 Main St', city: 'Austin', state: 'TX', zip: '73301', createdAt: '2024-04-18', company: 'Main Street Hospitality' },
  { id: 'CLT-014', name: 'Thomas Clark', email: 'tclark@email.com', phone: '(555) 101-2014', address: '369 Hickory Ln', city: 'Pflugerville', state: 'TX', zip: '78661', createdAt: '2024-04-25' },
  { id: 'CLT-015', name: 'Sunset Retirement Home', email: 'facilities@sunsetretire.com', phone: '(555) 101-2015', address: '500 Sunset Blvd', city: 'Austin', state: 'TX', zip: '73308', createdAt: '2024-05-02', company: 'Sunset Senior Living' },
  { id: 'CLT-016', name: 'Kevin Robinson', email: 'krobinson@email.com', phone: '(555) 101-2016', address: '741 Chestnut Ct', city: 'Cedar Park', state: 'TX', zip: '78614', createdAt: '2024-05-08' },
  { id: 'CLT-017', name: 'Riverside Church', email: 'office@riversidechurch.org', phone: '(555) 101-2017', address: '200 River Rd', city: 'Austin', state: 'TX', zip: '73309', createdAt: '2024-05-15', company: 'Riverside Community Church' },
  { id: 'CLT-018', name: 'Nancy Lee', email: 'nlee@email.com', phone: '(555) 101-2018', address: '258 Willow Dr', city: 'Georgetown', state: 'TX', zip: '78627', createdAt: '2024-05-22' },
  { id: 'CLT-019', name: 'TechHub Office Park', email: 'property@techhub.com', phone: '(555) 101-2019', address: '300 Innovation Way', city: 'Austin', state: 'TX', zip: '73310', createdAt: '2024-06-01', company: 'TechHub Properties LLC' },
  { id: 'CLT-020', name: 'Steven & Karen Adams', email: 'adamsfamily@email.com', phone: '(555) 101-2020', address: '951 Redwood Ave', city: 'Round Rock', state: 'TX', zip: '78666', createdAt: '2024-06-05' },
  { id: 'CLT-021', name: 'Lone Star Brewery', email: 'ops@lonestarbrew.com', phone: '(555) 101-2021', address: '400 Industrial Blvd', city: 'Austin', state: 'TX', zip: '73311', createdAt: '2024-06-12', company: 'Lone Star Brewing Co' },
  { id: 'CLT-022', name: 'Diana Foster', email: 'dfoster@email.com', phone: '(555) 101-2022', address: '633 Sycamore St', city: 'Pflugerville', state: 'TX', zip: '78662', createdAt: '2024-06-18' },
];

function toClient(c) {
  return {
    id: c.id,
    company_id: COMPANY_ID,
    name: c.name,
    email: c.email,
    phone: c.phone,
    address: c.address,
    city: c.city,
    state: c.state,
    zip: c.zip,
    company_name: c.company || null,
    created_at: new Date(c.createdAt + 'T00:00:00Z').toISOString(),
  };
}

// ══════════════════════════════════════════════════════════════════
//  3. JOBS
// ══════════════════════════════════════════════════════════════════
const mockJobs = [
  { id: 'JOB-001', clientId: 'CLT-001', title: 'Main line repair', description: 'Main sewer line clogged, water backing up into basement. Needs urgent clearing and camera inspection.', status: 'completed', priority: 'urgent', assignedTo: ['TECH-001', 'TECH-004'], address: '123 Oak St', city: 'Austin', state: 'TX', zip: '73301', scheduledDate: '2024-06-10', completedDate: '2024-06-10', estimatedCost: 450, actualCost: 520, materialsCost: 180, laborHours: 3.5, createdAt: '2024-06-09' },
  { id: 'JOB-002', clientId: 'CLT-002', title: 'Water heater install', description: 'Replace 50-gallon gas water heater. New unit: Bradford White 50-gal gas. Old unit failing, leaking.', status: 'completed', priority: 'high', assignedTo: ['TECH-003', 'TECH-005'], address: '456 Maple Ave', city: 'Austin', state: 'TX', zip: '73302', scheduledDate: '2024-06-11', completedDate: '2024-06-11', estimatedCost: 1200, actualCost: 1095, materialsCost: 670, laborHours: 4, createdAt: '2024-06-08' },
  { id: 'JOB-003', clientId: 'CLT-003', title: 'Leak detection & fix', description: 'Water stain on ceiling under bathroom. Needs leak detection and pipe repair.', status: 'scheduled', priority: 'medium', assignedTo: ['TECH-002'], address: '789 Pine Rd', city: 'Round Rock', state: 'TX', zip: '78664', scheduledDate: '2024-07-15', estimatedCost: 350, createdAt: '2024-07-10' },
  { id: 'JOB-004', clientId: 'CLT-004', title: 'Sewer line backup', description: 'Emergency call - raw sewage backing up into floor drain. Immediate response needed.', status: 'in-progress', priority: 'urgent', assignedTo: ['TECH-001', 'TECH-006'], address: '321 Elm St', city: 'Austin', state: 'TX', zip: '73303', scheduledDate: '2024-07-12', estimatedCost: 650, createdAt: '2024-07-12' },
  { id: 'JOB-005', clientId: 'CLT-005', title: 'Faucet replacement', description: 'Replace kitchen faucet with new Moen single-handle model. Old faucet leaking under sink.', status: 'completed', priority: 'low', assignedTo: ['TECH-004'], address: '654 Birch Ln', city: 'Cedar Park', state: 'TX', zip: '78613', scheduledDate: '2024-06-12', completedDate: '2024-06-12', estimatedCost: 150, actualCost: 175, materialsCost: 110, laborHours: 1, createdAt: '2024-06-11' },
  { id: 'JOB-006', clientId: 'CLT-006', title: 'Whole house repipe', description: 'Full repipe of 3-bedroom house. Replace all galvanized pipes with PEX. 2 bathrooms + kitchen.', status: 'in-progress', priority: 'high', assignedTo: ['TECH-001', 'TECH-002', 'TECH-005'], address: '987 Cedar Dr', city: 'Austin', state: 'TX', zip: '73304', scheduledDate: '2024-07-08', estimatedCost: 6500, createdAt: '2024-06-25' },
  { id: 'JOB-007', clientId: 'CLT-007', title: 'Toilet replacement', description: 'Replace old toilet with new Toto Drake comfort-height model. Existing toilet cracked.', status: 'completed', priority: 'medium', assignedTo: ['TECH-004'], address: '246 Walnut Way', city: 'Pflugerville', state: 'TX', zip: '78660', scheduledDate: '2024-06-14', completedDate: '2024-06-14', estimatedCost: 380, actualCost: 395, materialsCost: 280, laborHours: 1.5, createdAt: '2024-06-13' },
  { id: 'JOB-008', clientId: 'CLT-008', title: 'Drain cleaning - kitchen', description: 'Kitchen sink drain severely clogged. Grease buildup. Need hydro jetting.', status: 'completed', priority: 'high', assignedTo: ['TECH-002', 'TECH-006'], address: '135 Spruce Ct', city: 'Austin', state: 'TX', zip: '73305', scheduledDate: '2024-06-15', completedDate: '2024-06-15', estimatedCost: 320, actualCost: 350, materialsCost: 40, laborHours: 2, createdAt: '2024-06-14' },
  { id: 'JOB-009', clientId: 'CLT-009', title: 'Gas line inspection', description: 'Annual gas line inspection for property. Check all gas appliances and lines for leaks.', status: 'scheduled', priority: 'low', assignedTo: ['TECH-005'], address: '753 Ash Blvd', city: 'Georgetown', state: 'TX', zip: '78626', scheduledDate: '2024-07-20', estimatedCost: 200, createdAt: '2024-07-05' },
  { id: 'JOB-010', clientId: 'CLT-010', title: 'Sump pump replacement', description: 'Sump pump failed. Basement flooding risk. Replace with new Zoeller 1/2 HP unit.', status: 'completed', priority: 'urgent', assignedTo: ['TECH-003'], address: '159 Poplar Ave', city: 'Austin', state: 'TX', zip: '73306', scheduledDate: '2024-06-18', completedDate: '2024-06-18', estimatedCost: 550, actualCost: 590, materialsCost: 320, laborHours: 2, createdAt: '2024-06-17' },
  { id: 'JOB-011', clientId: 'CLT-011', title: 'Unit 204 - toilet leak', description: 'Tenant reports water leaking from toilet base onto bathroom floor. Wax ring likely failed.', status: 'completed', priority: 'high', assignedTo: ['TECH-004'], address: '4000 Spring Hollow Dr', city: 'Austin', state: 'TX', zip: '73307', scheduledDate: '2024-06-20', completedDate: '2024-06-20', estimatedCost: 180, actualCost: 165, materialsCost: 25, laborHours: 1, createdAt: '2024-06-19' },
  { id: 'JOB-012', clientId: 'CLT-011', title: 'Building B - main water shutoff', description: 'Replace main water shutoff valve for Building B. Valve corroded and hard to turn.', status: 'scheduled', priority: 'high', assignedTo: ['TECH-001', 'TECH-002'], address: '4000 Spring Hollow Dr', city: 'Austin', state: 'TX', zip: '73307', scheduledDate: '2024-07-22', estimatedCost: 850, createdAt: '2024-07-15' },
  { id: 'JOB-013', clientId: 'CLT-012', title: 'Shower valve replacement', description: 'Shower diverter valve not working properly. Water only comes out of tub spout.', status: 'completed', priority: 'medium', assignedTo: ['TECH-004'], address: '852 Magnolia St', city: 'Round Rock', state: 'TX', zip: '78665', scheduledDate: '2024-06-22', completedDate: '2024-06-22', estimatedCost: 280, actualCost: 300, materialsCost: 140, laborHours: 2, createdAt: '2024-06-20' },
  { id: 'JOB-014', clientId: 'CLT-013', title: 'Commercial grease trap cleaning', description: 'Monthly grease trap maintenance. Kitchen drain slow - grease buildup in trap and lines.', status: 'completed', priority: 'high', assignedTo: ['TECH-002', 'TECH-006'], address: '100 Main St', city: 'Austin', state: 'TX', zip: '73301', scheduledDate: '2024-06-25', completedDate: '2024-06-25', estimatedCost: 450, actualCost: 480, materialsCost: 60, laborHours: 3, createdAt: '2024-06-20' },
  { id: 'JOB-015', clientId: 'CLT-013', title: 'Dishwasher drain line replacement', description: 'Commercial dishwasher drain line corroded and leaking. Replace with new PVC run.', status: 'in-progress', priority: 'medium', assignedTo: ['TECH-002'], address: '100 Main St', city: 'Austin', state: 'TX', zip: '73301', scheduledDate: '2024-07-14', estimatedCost: 600, createdAt: '2024-07-10' },
  { id: 'JOB-016', clientId: 'CLT-014', title: 'Water pressure issue', description: 'Low water pressure throughout house. Suspect pressure regulator or partial pipe blockage.', status: 'scheduled', priority: 'medium', assignedTo: ['TECH-001'], address: '369 Hickory Ln', city: 'Pflugerville', state: 'TX', zip: '78661', scheduledDate: '2024-07-25', estimatedCost: 300, createdAt: '2024-07-18' },
  { id: 'JOB-017', clientId: 'CLT-015', title: 'Emergency pipe burst - Building A', description: 'Pipe burst in common room ceiling. Shut off water to Building A. Need immediate repair.', status: 'in-progress', priority: 'urgent', assignedTo: ['TECH-001', 'TECH-003', 'TECH-005'], address: '500 Sunset Blvd', city: 'Austin', state: 'TX', zip: '73308', scheduledDate: '2024-07-12', estimatedCost: 2800, createdAt: '2024-07-12' },
  { id: 'JOB-018', clientId: 'CLT-015', title: 'Quarterly backflow prevention testing', description: 'Annual backflow prevention device testing for all 4 buildings. Required by city code.', status: 'scheduled', priority: 'medium', assignedTo: ['TECH-005'], address: '500 Sunset Blvd', city: 'Austin', state: 'TX', zip: '73308', scheduledDate: '2024-08-01', estimatedCost: 1200, createdAt: '2024-07-10' },
  { id: 'JOB-019', clientId: 'CLT-016', title: 'New bathroom rough-in', description: 'Rough-in plumbing for new bathroom in finished basement. Includes toilet, sink, shower drain.', status: 'scheduled', priority: 'low', assignedTo: ['TECH-001', 'TECH-003'], address: '741 Chestnut Ct', city: 'Cedar Park', state: 'TX', zip: '78614', scheduledDate: '2024-07-28', estimatedCost: 3200, createdAt: '2024-07-05' },
  { id: 'JOB-020', clientId: 'CLT-017', title: 'Restroom renovation plumbing', description: 'Full plumbing for restroom renovation. 4 toilets, 4 sinks, 2 urinals. Commercial grade fixtures.', status: 'in-progress', priority: 'high', assignedTo: ['TECH-001', 'TECH-002', 'TECH-003'], address: '200 River Rd', city: 'Austin', state: 'TX', zip: '73309', scheduledDate: '2024-07-08', estimatedCost: 8500, createdAt: '2024-06-20' },
  { id: 'JOB-021', clientId: 'CLT-018', title: 'Garbage disposal replacement', description: 'Replace InSinkErator garbage disposal. Unit jammed and burned out motor.', status: 'completed', priority: 'medium', assignedTo: ['TECH-004'], address: '258 Willow Dr', city: 'Georgetown', state: 'TX', zip: '78627', scheduledDate: '2024-07-01', completedDate: '2024-07-01', estimatedCost: 250, actualCost: 275, materialsCost: 160, laborHours: 1, createdAt: '2024-06-28' },
  { id: 'JOB-022', clientId: 'CLT-019', title: 'Floor 2 restroom - clogged toilets', description: 'Multiple toilets on Floor 2 not flushing properly. Main line blockage suspected.', status: 'completed', priority: 'high', assignedTo: ['TECH-002', 'TECH-006'], address: '300 Innovation Way', city: 'Austin', state: 'TX', zip: '73310', scheduledDate: '2024-07-02', completedDate: '2024-07-02', estimatedCost: 500, actualCost: 550, materialsCost: 80, laborHours: 3, createdAt: '2024-07-01' },
  { id: 'JOB-023', clientId: 'CLT-019', title: 'Cooling tower water treatment line repair', description: 'Water treatment chemical feed line leaking. PVC pipe cracked near cooling tower.', status: 'scheduled', priority: 'medium', assignedTo: ['TECH-003'], address: '300 Innovation Way', city: 'Austin', state: 'TX', zip: '73310', scheduledDate: '2024-07-26', estimatedCost: 750, createdAt: '2024-07-20' },
  { id: 'JOB-024', clientId: 'CLT-020', title: 'Outdoor spigot install', description: 'Install new frost-free outdoor spigot on back patio. Tap into existing line in crawl space.', status: 'completed', priority: 'low', assignedTo: ['TECH-004'], address: '951 Redwood Ave', city: 'Round Rock', state: 'TX', zip: '78666', scheduledDate: '2024-07-05', completedDate: '2024-07-05', estimatedCost: 220, actualCost: 250, materialsCost: 85, laborHours: 2, createdAt: '2024-07-03' },
  { id: 'JOB-025', clientId: 'CLT-021', title: 'Brewery floor drain maintenance', description: 'Main production floor drains slow due to sediment and hop residue buildup. Need hydro jetting.', status: 'scheduled', priority: 'high', assignedTo: ['TECH-002', 'TECH-006'], address: '400 Industrial Blvd', city: 'Austin', state: 'TX', zip: '73311', scheduledDate: '2024-07-30', estimatedCost: 950, createdAt: '2024-07-22' },
  { id: 'JOB-026', clientId: 'CLT-021', title: 'Hot water recirculation pump replacement', description: 'Recirculation pump for hot water loop failed. Rating at 1.5 HP. Need commercial grade replacement.', status: 'in-progress', priority: 'high', assignedTo: ['TECH-003', 'TECH-005'], address: '400 Industrial Blvd', city: 'Austin', state: 'TX', zip: '73311', scheduledDate: '2024-07-15', estimatedCost: 1800, createdAt: '2024-07-10' },
  { id: 'JOB-027', clientId: 'CLT-022', title: 'Bathroom sink drain repair', description: 'Sink drain pipe under cabinet leaking at P-trap connection. PVC joint failed.', status: 'completed', priority: 'low', assignedTo: ['TECH-004'], address: '633 Sycamore St', city: 'Pflugerville', state: 'TX', zip: '78662', scheduledDate: '2024-07-08', completedDate: '2024-07-08', estimatedCost: 130, actualCost: 145, materialsCost: 25, laborHours: 1, createdAt: '2024-07-07' },
  { id: 'JOB-028', clientId: 'CLT-003', title: 'Tankless water heater flush', description: 'Annual descaling and flush of Navien tankless water heater. Prevent mineral buildup.', status: 'scheduled', priority: 'low', assignedTo: ['TECH-003'], address: '789 Pine Rd', city: 'Round Rock', state: 'TX', zip: '78664', scheduledDate: '2024-08-05', estimatedCost: 200, createdAt: '2024-07-25' },
  { id: 'JOB-029', clientId: 'CLT-006', title: 'Outdoor shower plumbing', description: 'Run hot/cold water lines to new outdoor shower on back deck. Include freeze-proof valve.', status: 'scheduled', priority: 'low', assignedTo: ['TECH-001'], address: '987 Cedar Dr', city: 'Austin', state: 'TX', zip: '73304', scheduledDate: '2024-08-10', estimatedCost: 1400, createdAt: '2024-07-28' },
  { id: 'JOB-030', clientId: 'CLT-009', title: 'Water softener install', description: 'Install whole-house water softener in garage. Include bypass loop and drain line.', status: 'scheduled', priority: 'medium', assignedTo: ['TECH-001', 'TECH-005'], address: '753 Ash Blvd', city: 'Georgetown', state: 'TX', zip: '78626', scheduledDate: '2024-08-12', estimatedCost: 1100, createdAt: '2024-07-30' },
  { id: 'JOB-031', clientId: 'CLT-015', title: 'Building C - water heater bank inspection', description: 'Inspect bank of 4 commercial water heaters. One unit showing error code. Diagnose and repair.', status: 'scheduled', priority: 'high', assignedTo: ['TECH-003', 'TECH-005'], address: '500 Sunset Blvd', city: 'Austin', state: 'TX', zip: '73308', scheduledDate: '2024-08-03', estimatedCost: 600, createdAt: '2024-07-28' },
];

function toJob(j) {
  const record = {
    id: j.id,
    company_id: COMPANY_ID,
    client_id: j.clientId,
    assigned_tech_id: j.assignedTo && j.assignedTo.length > 0 ? j.assignedTo[0] : null,
    title: j.title,
    description: j.description,
    status: j.status,
    priority: j.priority === 'urgent' ? 'critical' : j.priority,
    scheduled_date: new Date(j.scheduledDate + 'T00:00:00Z').toISOString(),
    completed_at: j.completedDate ? new Date(j.completedDate + 'T00:00:00Z').toISOString() : null,
    estimated_cost: j.estimatedCost,
    actual_cost: j.actualCost || null,
    parts_cost: j.materialsCost || null,
    labor_cost: j.actualCost && j.materialsCost ? j.actualCost - j.materialsCost : null,
    address: j.address,
    city: j.city,
    state: j.state,
    zip: j.zip,
    notes: j.notes || null,
    source: 'manual',
    created_at: new Date(j.createdAt + 'T00:00:00Z').toISOString(),
  };
  return record;
}

// ══════════════════════════════════════════════════════════════════
//  4. INVOICES + LINE ITEMS
// ══════════════════════════════════════════════════════════════════
const mockInvoices = [
  { id: 'INV-001', clientId: 'CLT-001', jobId: 'JOB-001', status: 'paid', amount: 520, paidAmount: 520, dueDate: '2024-07-10', issueDate: '2024-06-10', paidDate: '2024-06-25', paymentMethod: 'credit_card', lineItems: [{ description: 'Sewer line clearing - hydro jet', quantity: 1, unitPrice: 340, total: 340 }, { description: 'Camera inspection', quantity: 1, unitPrice: 100, total: 100 }, { description: 'Materials - PVC fittings, glue', quantity: 1, unitPrice: 80, total: 80 }] },
  { id: 'INV-002', clientId: 'CLT-002', jobId: 'JOB-002', status: 'paid', amount: 1095, paidAmount: 1095, dueDate: '2024-07-11', issueDate: '2024-06-11', paidDate: '2024-07-01', paymentMethod: 'check', lineItems: [{ description: 'Bradford White 50-gal gas water heater', quantity: 1, unitPrice: 670, total: 670 }, { description: 'Installation labor', quantity: 4, unitPrice: 85, total: 340 }, { description: 'Permit fee', quantity: 1, unitPrice: 85, total: 85 }] },
  { id: 'INV-003', clientId: 'CLT-005', jobId: 'JOB-005', status: 'paid', amount: 175, paidAmount: 175, dueDate: '2024-07-12', issueDate: '2024-06-12', paidDate: '2024-06-28', paymentMethod: 'credit_card', lineItems: [{ description: 'Moen One-Handle kitchen faucet', quantity: 1, unitPrice: 110, total: 110 }, { description: 'Labor - removal & install', quantity: 1, unitPrice: 65, total: 65 }] },
  { id: 'INV-004', clientId: 'CLT-007', jobId: 'JOB-007', status: 'paid', amount: 395, paidAmount: 395, dueDate: '2024-07-14', issueDate: '2024-06-14', paidDate: '2024-06-30', paymentMethod: 'credit_card', lineItems: [{ description: 'Toto Drake comfort-height toilet', quantity: 1, unitPrice: 280, total: 280 }, { description: 'Labor - removal & install', quantity: 1.5, unitPrice: 76.67, total: 115 }] },
  { id: 'INV-005', clientId: 'CLT-008', jobId: 'JOB-008', status: 'paid', amount: 350, paidAmount: 350, dueDate: '2024-07-15', issueDate: '2024-06-15', paidDate: '2024-07-05', paymentMethod: 'check', lineItems: [{ description: 'Kitchen drain hydro jetting', quantity: 1, unitPrice: 250, total: 250 }, { description: 'Drain snake fee', quantity: 1, unitPrice: 60, total: 60 }, { description: 'Disposal fee - grease', quantity: 1, unitPrice: 40, total: 40 }] },
  { id: 'INV-006', clientId: 'CLT-010', jobId: 'JOB-010', status: 'paid', amount: 590, paidAmount: 590, dueDate: '2024-07-18', issueDate: '2024-06-18', paidDate: '2024-07-08', paymentMethod: 'credit_card', lineItems: [{ description: 'Zoeller 1/2 HP sump pump', quantity: 1, unitPrice: 320, total: 320 }, { description: 'Labor - removal & install', quantity: 2, unitPrice: 85, total: 170 }, { description: 'Check valve & fittings', quantity: 1, unitPrice: 100, total: 100 }] },
  { id: 'INV-007', clientId: 'CLT-011', jobId: 'JOB-011', status: 'paid', amount: 165, paidAmount: 165, dueDate: '2024-07-20', issueDate: '2024-06-20', paidDate: '2024-07-10', paymentMethod: 'bank_transfer', lineItems: [{ description: 'Wax ring & toilet reseal', quantity: 1, unitPrice: 25, total: 25 }, { description: 'Labor', quantity: 1, unitPrice: 140, total: 140 }] },
  { id: 'INV-008', clientId: 'CLT-012', jobId: 'JOB-013', status: 'paid', amount: 300, paidAmount: 300, dueDate: '2024-07-22', issueDate: '2024-06-22', paidDate: '2024-07-12', paymentMethod: 'credit_card', lineItems: [{ description: 'Moen shower valve cartridge', quantity: 1, unitPrice: 90, total: 90 }, { description: 'Trim kit', quantity: 1, unitPrice: 50, total: 50 }, { description: 'Labor - valve replacement', quantity: 2, unitPrice: 80, total: 160 }] },
  { id: 'INV-009', clientId: 'CLT-013', jobId: 'JOB-014', status: 'paid', amount: 480, paidAmount: 480, dueDate: '2024-07-25', issueDate: '2024-06-25', paidDate: '2024-07-15', paymentMethod: 'check', lineItems: [{ description: 'Grease trap clean & pump out', quantity: 1, unitPrice: 300, total: 300 }, { description: 'Grease disposal fee', quantity: 1, unitPrice: 80, total: 80 }, { description: 'Line jetting', quantity: 1, unitPrice: 100, total: 100 }] },
  { id: 'INV-010', clientId: 'CLT-018', jobId: 'JOB-021', status: 'paid', amount: 275, paidAmount: 275, dueDate: '2024-08-01', issueDate: '2024-07-01', paidDate: '2024-07-20', paymentMethod: 'credit_card', lineItems: [{ description: 'InSinkErator Evolution Compact', quantity: 1, unitPrice: 160, total: 160 }, { description: 'Labor - removal & install', quantity: 1, unitPrice: 115, total: 115 }] },
  { id: 'INV-011', clientId: 'CLT-019', jobId: 'JOB-022', status: 'paid', amount: 550, paidAmount: 550, dueDate: '2024-08-02', issueDate: '2024-07-02', paidDate: '2024-07-22', paymentMethod: 'bank_transfer', lineItems: [{ description: 'Main line unclogging', quantity: 1, unitPrice: 350, total: 350 }, { description: 'Camera inspection', quantity: 1, unitPrice: 120, total: 120 }, { description: 'Materials', quantity: 1, unitPrice: 80, total: 80 }] },
  { id: 'INV-012', clientId: 'CLT-020', jobId: 'JOB-024', status: 'paid', amount: 250, paidAmount: 250, dueDate: '2024-08-05', issueDate: '2024-07-05', paidDate: '2024-07-25', paymentMethod: 'credit_card', lineItems: [{ description: 'Frost-free spigot', quantity: 1, unitPrice: 45, total: 45 }, { description: 'PEX pipe & fittings', quantity: 1, unitPrice: 40, total: 40 }, { description: 'Labor', quantity: 2, unitPrice: 82.50, total: 165 }] },
  { id: 'INV-013', clientId: 'CLT-022', jobId: 'JOB-027', status: 'sent', amount: 145, dueDate: '2024-08-08', issueDate: '2024-07-08', lineItems: [{ description: 'PVC P-trap & fittings', quantity: 1, unitPrice: 25, total: 25 }, { description: 'Labor - repair', quantity: 1, unitPrice: 120, total: 120 }] },
  { id: 'INV-014', clientId: 'CLT-003', jobId: 'JOB-003', status: 'draft', amount: 350, dueDate: '2024-08-15', issueDate: '2024-07-15', lineItems: [{ description: 'Leak detection service', quantity: 1, unitPrice: 150, total: 150 }, { description: 'Pipe repair', quantity: 1, unitPrice: 200, total: 200 }] },
  { id: 'INV-015', clientId: 'CLT-004', jobId: 'JOB-004', status: 'draft', amount: 650, dueDate: '2024-08-12', issueDate: '2024-07-12', lineItems: [{ description: 'Emergency sewer line clearing', quantity: 1, unitPrice: 450, total: 450 }, { description: 'Camera inspection', quantity: 1, unitPrice: 120, total: 120 }, { description: 'Materials', quantity: 1, unitPrice: 80, total: 80 }] },
  { id: 'INV-016', clientId: 'CLT-006', jobId: 'JOB-006', status: 'draft', amount: 6500, dueDate: '2024-09-08', issueDate: '2024-07-08', lineItems: [{ description: 'PEX tubing & fittings - whole house', quantity: 1, unitPrice: 2800, total: 2800 }, { description: 'Labor - 3 techs, 4 days', quantity: 96, unitPrice: 35, total: 3360 }, { description: 'Permit & inspection fees', quantity: 1, unitPrice: 340, total: 340 }] },
  { id: 'INV-017', clientId: 'CLT-017', jobId: 'JOB-020', status: 'sent', amount: 8500, dueDate: '2024-09-08', issueDate: '2024-07-08', lineItems: [{ description: 'Commercial fixtures (4 toilets, 4 sinks, 2 urinals)', quantity: 1, unitPrice: 4200, total: 4200 }, { description: 'Rough-in labor & installation', quantity: 1, unitPrice: 3800, total: 3800 }, { description: 'Permit fees', quantity: 1, unitPrice: 500, total: 500 }] },
];

function toInvoice(inv) {
  return {
    id: inv.id,
    company_id: COMPANY_ID,
    job_id: inv.jobId,
    client_id: inv.clientId,
    invoice_number: inv.id.replace('INV-', 'INV-2024-'),
    status: inv.status,
    subtotal: inv.amount,
    tax: 0,
    total: inv.amount,
    amount_paid: inv.paidAmount || null,
    due_date: new Date(inv.dueDate + 'T00:00:00Z').toISOString(),
    issued_date: new Date(inv.issueDate + 'T00:00:00Z').toISOString(),
    paid_at: inv.paidDate ? new Date(inv.paidDate + 'T00:00:00Z').toISOString() : null,
    notes: inv.notes || null,
    created_at: new Date(inv.issueDate + 'T00:00:00Z').toISOString(),
  };
}

function toLineItems(invoiceId, lineItems) {
  return lineItems.map((li, idx) => ({
    id: `LI-${invoiceId.replace('INV-', '')}-${String(idx + 1).padStart(2, '0')}`,
    invoice_id: invoiceId,
    description: li.description,
    quantity: li.quantity,
    unit_price: li.unitPrice,
    total: li.total,
    type: li.description.toLowerCase().includes('labor') ? 'labor' : li.description.toLowerCase().includes('permit') || li.description.toLowerCase().includes('fee') || li.description.toLowerCase().includes('disposal') ? 'fee' : 'part',
  }));
}

// ══════════════════════════════════════════════════════════════════
//  5. INVENTORY ITEMS
// ══════════════════════════════════════════════════════════════════
const mockInventory = [
  { id: 'INV-ITM-001', name: '1/2" PEX Tubing (100ft roll)', category: 'pipe', sku: 'PEX-12-100', quantity: 15, minQuantity: 5, unitPrice: 45, supplier: 'SupplyHouse.com', location: 'Bay A-1', description: 'Uponor 1/2" PEX tubing, 100ft roll, red' },
  { id: 'INV-ITM-002', name: '3/4" PEX Tubing (100ft roll)', category: 'pipe', sku: 'PEX-34-100', quantity: 12, minQuantity: 5, unitPrice: 62, supplier: 'SupplyHouse.com', location: 'Bay A-1', description: 'Uponor 3/4" PEX tubing, 100ft roll, blue' },
  { id: 'INV-ITM-003', name: '1" PVC Schedule 40 Pipe (10ft)', category: 'pipe', sku: 'PVC-1-10', quantity: 25, minQuantity: 10, unitPrice: 8, supplier: 'Ferguson Plumbing', location: 'Bay A-2', description: '1" Schedule 40 PVC pipe, 10ft length' },
  { id: 'INV-ITM-004', name: '2" PVC Schedule 40 Pipe (10ft)', category: 'pipe', sku: 'PVC-2-10', quantity: 18, minQuantity: 8, unitPrice: 14, supplier: 'Ferguson Plumbing', location: 'Bay A-2', description: '2" Schedule 40 PVC pipe, 10ft length' },
  { id: 'INV-ITM-005', name: '3/4" Copper Type L Pipe (10ft)', category: 'pipe', sku: 'COP-34-10', quantity: 8, minQuantity: 4, unitPrice: 28, supplier: 'Ferguson Plumbing', location: 'Bay A-3', description: '3/4" Type L rigid copper pipe, 10ft' },
  { id: 'INV-ITM-006', name: '1/2" PEX Crimp Rings (100pk)', category: 'fitting', sku: 'FIT-PEX-CR12', quantity: 20, minQuantity: 10, unitPrice: 12, supplier: 'SupplyHouse.com', location: 'Bay B-1', description: 'Uponor 1/2" PEX cinch clamp rings, 100-pack' },
  { id: 'INV-ITM-007', name: '3/4" PEX Crimp Rings (100pk)', category: 'fitting', sku: 'FIT-PEX-CR34', quantity: 15, minQuantity: 10, unitPrice: 15, supplier: 'SupplyHouse.com', location: 'Bay B-1', description: 'Uponor 3/4" PEX cinch clamp rings, 100-pack' },
  { id: 'INV-ITM-008', name: '1/2" Brass PEX Fitting - Coupling', category: 'fitting', sku: 'FIT-BRZ-12CP', quantity: 50, minQuantity: 20, unitPrice: 3, supplier: 'SupplyHouse.com', location: 'Bay B-2', description: '1/2" brass PEX coupling' },
  { id: 'INV-ITM-009', name: '3/4" Brass PEX Fitting - 90° Elbow', category: 'fitting', sku: 'FIT-BRZ-34EL', quantity: 40, minQuantity: 15, unitPrice: 4, supplier: 'SupplyHouse.com', location: 'Bay B-2', description: '3/4" brass PEX 90-degree elbow' },
  { id: 'INV-ITM-010', name: '1/2" SharkBite Push-to-Connect Coupling', category: 'fitting', sku: 'FIT-SHK-12CP', quantity: 30, minQuantity: 10, unitPrice: 7, supplier: 'Ferguson Plumbing', location: 'Bay B-3', description: 'SharkBite 1/2" push-to-connect coupling' },
  { id: 'INV-ITM-011', name: '3/4" Ball Valve - Full Port Brass', category: 'valve', sku: 'VAL-BRZ-34FP', quantity: 22, minQuantity: 10, unitPrice: 18, supplier: 'Ferguson Plumbing', location: 'Bay C-1', description: '3/4" full port brass ball valve with threaded ends' },
  { id: 'INV-ITM-012', name: '1" Ball Valve - Full Port Brass', category: 'valve', sku: 'VAL-BRZ-1FP', quantity: 14, minQuantity: 5, unitPrice: 24, supplier: 'Ferguson Plumbing', location: 'Bay C-1', description: '1" full port brass ball valve with threaded ends' },
  { id: 'INV-ITM-013', name: 'Water Pressure Regulator 3/4"', category: 'valve', sku: 'VAL-PR-34', quantity: 8, minQuantity: 3, unitPrice: 55, supplier: 'SupplyHouse.com', location: 'Bay C-2', description: '3/4" adjustable water pressure reducing valve' },
  { id: 'INV-ITM-014', name: 'Toto Drake Complete Toilet', category: 'fixture', sku: 'FIX-TOTO-DRK', quantity: 6, minQuantity: 3, unitPrice: 280, supplier: 'Ferguson Plumbing', location: 'Bay D-1', description: 'Toto Drake CST454CEFG, comfort height, cotton white' },
  { id: 'INV-ITM-015', name: 'Moen One-Handle Kitchen Faucet', category: 'fixture', sku: 'FIX-MOEN-KF', quantity: 10, minQuantity: 5, unitPrice: 110, supplier: 'Ferguson Plumbing', location: 'Bay D-2', description: 'Moen 7594ESRS Arsley one-handle kitchen faucet, stainless' },
  { id: 'INV-ITM-016', name: 'Bradford White 50-gal Gas Water Heater', category: 'heater', sku: 'HWT-BW-50G', quantity: 4, minQuantity: 2, unitPrice: 670, supplier: 'Ferguson Plumbing', location: 'Bay E-1', description: 'Bradford White RG250T6N 50-gal gas water heater' },
  { id: 'INV-ITM-017', name: 'Navien 240E Tankless Water Heater', category: 'heater', sku: 'HWT-NVN-240E', quantity: 2, minQuantity: 1, unitPrice: 1200, supplier: 'SupplyHouse.com', location: 'Bay E-1', description: 'Navien NPE-240E condensing tankless water heater' },
  { id: 'INV-ITM-018', name: 'Zoeller 1/2 HP Sump Pump', category: 'pump', sku: 'PMP-ZL-12HP', quantity: 5, minQuantity: 2, unitPrice: 320, supplier: 'Ferguson Plumbing', location: 'Bay F-1', description: 'Zoeller M53 1/2 HP submersible sump pump' },
  { id: 'INV-ITM-019', name: 'InSinkErator Evolution Compact Disposal', category: 'fixture', sku: 'FIX-DSP-ECOMP', quantity: 8, minQuantity: 3, unitPrice: 160, supplier: 'SupplyHouse.com', location: 'Bay D-2', description: 'InSinkErator Evolution Compact 3/4 HP garbage disposal' },
  { id: 'INV-ITM-020', name: 'Milwaukee M18 ProPEX Expansion Tool', category: 'tool', sku: 'TOL-MIL-PEX', quantity: 3, minQuantity: 1, unitPrice: 450, supplier: 'SupplyHouse.com', location: 'Bay T-1', description: 'Milwaukee 2674-20 M18 ProPEX expansion tool' },
  { id: 'INV-ITM-021', name: 'Ridgid K-60 Drain Cleaning Machine', category: 'tool', sku: 'TOL-RGD-K60', quantity: 4, minQuantity: 1, unitPrice: 850, supplier: 'Ferguson Plumbing', location: 'Bay T-2', description: 'Ridgid K-60 3/4 HP drain cleaning machine with cables' },
  { id: 'INV-ITM-022', name: 'Oatey PVC Cement (1qt)', category: 'sealant', sku: 'SL-OAT-1QT', quantity: 30, minQuantity: 10, unitPrice: 12, supplier: 'Ferguson Plumbing', location: 'Bay G-1', description: 'Oatey 30169 PVC cement, clear, 1 quart' },
  { id: 'INV-ITM-023', name: 'Oatey PVC Primer (1qt)', category: 'sealant', sku: 'SL-OAT-PRM1QT', quantity: 25, minQuantity: 10, unitPrice: 10, supplier: 'Ferguson Plumbing', location: 'Bay G-1', description: 'Oatey 30167 PVC purple primer, 1 quart' },
  { id: 'INV-ITM-024', name: 'Teflon Tape (1/2" x 260ft)', category: 'sealant', sku: 'SL-TFL-12-260', quantity: 60, minQuantity: 20, unitPrice: 3, supplier: 'SupplyHouse.com', location: 'Bay G-2', description: 'Professional grade PTFE thread seal tape, 260ft roll' },
];

function toInventoryItem(item) {
  return {
    id: item.id,
    company_id: COMPANY_ID,
    name: item.name,
    sku: item.sku,
    category: item.category,
    quantity: item.quantity,
    min_stock: item.minQuantity,
    unit_price: item.unitPrice,
    supplier: item.supplier || null,
    location: item.location || null,
    notes: item.description || null,
    created_at: now(),
  };
}

// ══════════════════════════════════════════════════════════════════
//  MAIN
// ══════════════════════════════════════════════════════════════════
async function main() {
  console.log('\n🔧 PlumbCore AI — Database Seed');
  console.log('═══════════════════════════════════\n');

  // 0. Company
  console.log('📦 Step 0: Company');
  await upsertAll('companies', [company]);

  // 1. Profiles
  console.log('\n👤 Step 1: Profiles (from Team Members mock data)');
  const profiles = teamMembers.map(toProfile);
  await upsertAll('profiles', profiles);

  // 2. Clients
  console.log('\n🏢 Step 2: Clients');
  const clients = mockClients.map(toClient);
  await upsertAll('clients', clients);

  // 3. Jobs
  console.log('\n🔨 Step 3: Jobs');
  const jobs = mockJobs.map(toJob);
  await upsertAll('jobs', jobs);

  // 4. Invoices + Line Items
  console.log('\n📄 Step 4: Invoices & Line Items');
  const dbInvoices = mockInvoices.map(toInvoice);
  await upsertAll('invoices', dbInvoices);

  // Collect and insert all line items
  const allLineItems = [];
  for (const inv of mockInvoices) {
    const items = toLineItems(inv.id, inv.lineItems);
    allLineItems.push(...items);
  }
  await upsertAll('line_items', allLineItems);

  // 5. Inventory Items
  console.log('\n📦 Step 5: Inventory Items');
  const inventoryItems = mockInventory.map(toInventoryItem);
  await upsertAll('inventory_items', inventoryItems);

  // ── Summary ──────────────────────────────────
  const totalProfiles = profiles.length;
  const totalClients = clients.length;
  const totalJobs = jobs.length;
  const totalInvoices = dbInvoices.length;
  const totalLineItems = allLineItems.length;
  const totalInventory = inventoryItems.length;

  console.log('\n═══════════════════════════════════');
  console.log('✅ SEED COMPLETE');
  console.log('═══════════════════════════════════');
  console.log(`  Companies:       1`);
  console.log(`  Profiles:        ${totalProfiles}`);
  console.log(`  Clients:         ${totalClients}`);
  console.log(`  Jobs:            ${totalJobs}`);
  console.log(`  Invoices:        ${totalInvoices}`);
  console.log(`  Line Items:      ${totalLineItems}`);
  console.log(`  Inventory Items: ${totalInventory}`);
  console.log('═══════════════════════════════════');

  console.log('\n⚠️  Note: The following mock data types have NO corresponding');
  console.log('   Supabase tables and were skipped:');
  console.log('   • Suppliers (6)      — no "suppliers" table');
  console.log('   • Inventory Transactions (28) — no "inventory_transactions" table');
  console.log('   • Purchase Orders (6) — no "purchase_orders" table');
  console.log('   • Activities (20)    — no "activities" table');
  console.log('   • Pricebook Items (0) — no pricebook mock data provided\n');
}

main().catch((err) => {
  console.error('\n🔥 SEED FAILED:', err.message);
  process.exit(1);
});