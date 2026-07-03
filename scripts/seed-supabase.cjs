#!/usr/bin/env node
/* ──────────────────────────────────────────────────────────────────
   PlumbCore AI — Supabase Seed Script (.cjs)
   1. Extracts mock data from mock-data.ts (TypeScript) into CJS
   2. Maps to Supabase DB column names
   3. Upserts into all tables
   4. Verifies row counts
   ────────────────────────────────────────────────────────────────── */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

/* ── 1. Load service role key from .env.local ── */
function loadEnv(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const envPath = path.resolve(__dirname, '..', 'apps/web/.env.local');
const env = loadEnv(envPath);
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('FATAL: Could not load SUPABASE_SERVICE_ROLE_KEY from', envPath);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const COMPANY_ID = 'comp-001';

/* ── 2. Extract mock data arrays from TypeScript file ── */
function extractArray(tsContent, varName) {
  const re = new RegExp(`export\\s+const\\s+${varName}\\s*:\\s*[^=]+=\\s*\\[`);
  const match = re.exec(tsContent);
  if (!match) throw new Error(`Could not find export const ${varName}`);
  
  const startIdx = match.index + match[0].length;
  let depth = 1, i = startIdx, inStr = null;
  while (i < tsContent.length && depth > 0) {
    const ch = tsContent[i], prev = i > 0 ? tsContent[i-1] : '';
    if (inStr) { if (ch === inStr && prev !== '\\') inStr = null; }
    else {
      if (ch === '"' || ch === "'" || ch === '`') inStr = ch;
      else if (ch === '[') depth++;
      else if (ch === ']') depth--;
    }
    i++;
  }
  return tsContent.slice(startIdx, i - 1).trim().replace(/;\s*$/, '');
}

console.log('Reading mock data...');
const tsPath = path.resolve(__dirname, '..', 'apps/web/src/lib/mock-data.ts');
const tsContent = fs.readFileSync(tsPath, 'utf8');

const varNames = ['clients', 'teamMembers', 'jobs', 'invoices', 'inventory', 'suppliers', 'inventoryTransactions', 'purchaseOrders'];
const data = {};

for (const name of varNames) {
  const body = extractArray(tsContent, name);
  const tempCode = `const ${name} = [${body}];\nmodule.exports = { ${name} };`;
  const tempPath = path.resolve(__dirname, '..', 'scripts', `.tmp-${name}.cjs`);
  fs.writeFileSync(tempPath, tempCode);
  const mod = require(tempPath);
  data[name] = mod[name];
  fs.unlinkSync(tempPath);
}

const { clients, teamMembers, jobs, invoices, inventory, suppliers, inventoryTransactions, purchaseOrders } = data;

console.log(`Parsed: ${clients.length} clients, ${teamMembers.length} team members, ${jobs.length} jobs, ${invoices.length} invoices, ${inventory.length} inventory items, ${suppliers.length} suppliers, ${inventoryTransactions.length} inventory transactions, ${purchaseOrders.length} purchase orders`);

/* ── 3. Mapping functions ── */

function mapClient(c) {
  return {
    id: c.id, company_id: COMPANY_ID, name: c.name, email: c.email, phone: c.phone,
    address: c.address, city: c.city, state: c.state, zip: c.zip,
    company_name: c.company || null, notes: c.notes || null, created_at: c.createdAt,
  };
}

function mapProfile(tm) {
  return {
    id: tm.id, company_id: COMPANY_ID, email: tm.email, full_name: tm.name, phone: tm.phone,
    role: tm.role === 'dispatcher' ? 'dispatcher' : 'tech',
    is_active: true, created_at: tm.joinedAt,
  };
}

function mapJob(j) {
  return {
    id: j.id, company_id: COMPANY_ID, client_id: j.clientId,
    assigned_tech_id: j.assignedTo ? j.assignedTo[0] || null : null,
    title: j.title, description: j.description,
    status: j.status, priority: j.priority === 'urgent' ? 'critical' : j.priority,
    scheduled_date: j.scheduledDate, scheduled_start: j.scheduledTime || null,
    completed_at: j.completedDate || null, estimated_cost: j.estimatedCost,
    actual_cost: j.actualCost || null,
    labor_cost: j.laborHours ? Math.round(j.laborHours * 85 * 100) / 100 : null,
    parts_cost: j.materialsCost || null,
    address: j.address, city: j.city, state: j.state, zip: j.zip,
    notes: j.notes || null, source: 'manual', created_at: j.createdAt,
  };
}

function mapInvoice(inv) {
  return {
    id: inv.id, company_id: COMPANY_ID, job_id: inv.jobId, client_id: inv.clientId,
    invoice_number: inv.id, status: inv.status,
    subtotal: inv.amount, tax: 0, total: inv.amount,
    amount_paid: inv.paidAmount || null,
    due_date: inv.dueDate, issued_date: inv.issueDate, paid_at: inv.paidDate || null,
    notes: inv.notes || null, created_at: inv.issueDate,
  };
}

let liCounter = 0;
function mapLineItem(li, invoiceId) {
  liCounter++;
  const desc = li.description.toLowerCase();
  let type = 'part';
  if (desc.includes('labor')) type = 'labor';
  else if (desc.includes('fee') || desc.includes('permit') || desc.includes('disposal') || desc.includes('disposal fee')) type = 'fee';
  return {
    id: `${invoiceId}-LI-${String(liCounter).padStart(3, '0')}`,
    invoice_id: invoiceId, description: li.description,
    quantity: li.quantity, unit_price: li.unitPrice, total: li.total, type,
  };
}

function mapInventoryItem(item) {
  return {
    id: item.id, company_id: COMPANY_ID, name: item.name, sku: item.sku,
    category: item.category, quantity: item.quantity, min_stock: item.minQuantity,
    unit_price: item.unitPrice, supplier: item.supplier || null,
    location: item.location || null, notes: item.description || null,
    created_at: new Date().toISOString(),
  };
}

function mapPricebookItem(item) {
  return {
    id: `PB-${item.id}`, company_id: COMPANY_ID, name: item.name,
    category: item.category, unit_price: item.unitPrice, unit_type: 'each',
    is_repair_type: false, estimated_hours: null, description: item.description || null,
  };
}

/* ── 4. Insert helpers ── */

async function upsert(table, records, batchSize = 50) {
  if (!records || records.length === 0) return { count: 0, errors: [] };
  const errors = [];
  let count = 0;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error } = await supabase.from(table).upsert(batch, { ignoreDuplicates: false });
    if (error) {
      errors.push(error.message);
      console.error(`  ERROR ${table} batch ${Math.floor(i / batchSize)}: ${error.message}`);
    } else {
      count += batch.length;
    }
  }
  return { count, errors };
}

/* ── 5. Run seed ── */

async function main() {
  console.log('\n=== Seeding Supabase ===\n');

  // 5a. Company
  console.log('Inserting company...');
  const { error: companyErr } = await supabase.from('companies').upsert({
    id: COMPANY_ID, slug: 'plumbcore', name: 'PlumbCore AI',
    email: 'admin@plumbcore.ai', phone: '(555) 000-0000',
    address: '123 Business Park Dr', city: 'Austin', state: 'TX', zip: '73301',
    timezone: 'America/Chicago',
    business_hours: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '17:00' },
    },
    hourly_rate: 85, service_fee_percent: 0, tax_rate: 8.25,
    stripe_onboarding_complete: false, trial_end: '2025-12-31T23:59:59Z',
    subscription_tier: 'pro', onboarding_complete: true,
    created_at: '2024-01-01T00:00:00Z',
  });
  if (companyErr) console.error('  ERROR company:', companyErr.message);
  else console.log('  Company inserted OK');

  // 5b. Profiles (team members)
  console.log(`Inserting ${teamMembers.length} profiles...`);
  const profiles = teamMembers.map(mapProfile);
  const { count: pCount, errors: pErrs } = await upsert('profiles', profiles);
  console.log(`  ${pCount} profiles inserted${pErrs.length ? ` (${pErrs.length} errors)` : ''}`);

  // 5c. Clients
  console.log(`Inserting ${clients.length} clients...`);
  const clientRecords = clients.map(mapClient);
  const { count: cCount, errors: cErrs } = await upsert('clients', clientRecords);
  console.log(`  ${cCount} clients inserted${cErrs.length ? ` (${cErrs.length} errors)` : ''}`);

  // 5d. Jobs
  console.log(`Inserting ${jobs.length} jobs...`);
  const jobRecords = jobs.map(mapJob);
  const { count: jCount, errors: jErrs } = await upsert('jobs', jobRecords);
  console.log(`  ${jCount} jobs inserted${jErrs.length ? ` (${jErrs.length} errors)` : ''}`);

  // 5e. Invoices
  console.log(`Inserting ${invoices.length} invoices...`);
  const invoiceRecords = invoices.map(mapInvoice);
  const { count: iCount, errors: iErrs } = await upsert('invoices', invoiceRecords);
  console.log(`  ${iCount} invoices inserted${iErrs.length ? ` (${iErrs.length} errors)` : ''}`);

  // Line Items
  const allLineItems = invoices.flatMap(inv => inv.lineItems.map(li => mapLineItem(li, inv.id)));
  console.log(`Inserting ${allLineItems.length} line items...`);
  const { count: liCount, errors: liErrs } = await upsert('line_items', allLineItems);
  console.log(`  ${liCount} line items inserted${liErrs.length ? ` (${liErrs.length} errors)` : ''}`);

  // 5f. Inventory Items
  console.log(`Inserting ${inventory.length} inventory items...`);
  const invRecords = inventory.map(mapInventoryItem);
  const { count: invCount, errors: invErrs } = await upsert('inventory_items', invRecords);
  console.log(`  ${invCount} inventory items inserted${invErrs.length ? ` (${invErrs.length} errors)` : ''}`);

  // 5g. Pricebook Items
  console.log(`Inserting ${inventory.length} pricebook items...`);
  const pbRecords = inventory.map(mapPricebookItem);
  const { count: pbCount, errors: pbErrs } = await upsert('pricebook_items', pbRecords);
  console.log(`  ${pbCount} pricebook items inserted${pbErrs.length ? ` (${pbErrs.length} errors)` : ''}`);

  /* ── 6. Verify row counts ── */
  console.log('\n=== Verification ===\n');
  const tables = ['companies', 'profiles', 'clients', 'jobs', 'invoices', 'line_items', 'inventory_items', 'pricebook_items'];
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('id', { count: 'exact', head: true });
    console.log(`  ${table}: ${error ? `ERROR - ${error.message}` : `${count} rows`}`);
  }
  console.log('\nSeed complete!');
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });