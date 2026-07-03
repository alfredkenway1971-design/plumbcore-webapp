const { createClient } = require('@supabase/supabase-js');
const url = 'https://zwlwmehlewcyyljskpfv.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bHdtZWhsZXdjeXlsanNrcGZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMDE1ODgsImV4cCI6MjA5ODY3NzU4OH0.mcUrYbr0BguOPZLJNg63f6L_ncUNKzkKJqeqbsnoA08';
const svc = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bHdtZWhsZXdjeXlsanNrcGZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzEwMTU4OCwiZXhwIjoyMDk4Njc3NTg4fQ.wbGoFI-ffsjW7rWzAMT0mQ20h4IBWkdDP2kmQ4AIOWM';
const supabase = createClient(url, svc, { auth: { autoRefreshToken: false, persistSession: false } });
async function run() {
  for (const table of ['companies','profiles','clients','jobs','invoices','line_items','inventory_items','pricebook_items']) {
    const { error } = await supabase.from(table).select('id', { count: 'exact', head: true });
    console.log(`${table}: ${error ? ('NO - ' + error.message).substring(0,80) : 'YES, exists'}`);
  }
}
run().catch(e => console.error('FATAL:', e.message));
