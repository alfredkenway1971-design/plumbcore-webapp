#!/usr/bin/env node
// PlumbCore Database Setup

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zwlwmehlewcyyljskpfv.supabase.co';
const supabaseServiceKey = 'eyJhbG...IOWM';

console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseServiceKey.length);
console.log('Key prefix:', supabaseServiceKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Try listing existing tables via REST API introspection
async function run() {
  // The pg_catalog approach won't work via REST
  // Let's just try to call /rest/v1/ to see what's available
  const { data, error } = await supabase.from('companies').select('id', { count: 'exact', head: true });
  if (error) console.log('companies table check:', error.message);
  else console.log('companies table exists, count:', data);
  
  // Check a few more tables
  for (const table of ['profiles', 'clients', 'jobs', 'invoices', 'line_items', 'inventory_items', 'pricebook_items']) {
    const { error: e } = await supabase.from(table).select('id', { count: 'exact', head: true });
    console.log(`${table}: ${e ? 'NOT FOUND - ' + e.message : 'EXISTS'}`);
  }
}

run().catch(console.error);