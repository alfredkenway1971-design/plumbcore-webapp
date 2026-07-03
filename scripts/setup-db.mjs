import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zwlwmehlewcyyljskpfv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bHdtZWhsZXdjeXlsanNrcGZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzEwMTU4OCwiZXhwIjoyMDk4Njc3NTg4fQ.wbGoFI-ffsjW7rWzAMT0mQ20h4IBWkdDP2kmQ4AIOWM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Run SQL via management API
const mgmtApiKey = 'sbp_...en'; // Need this

// Alternative: use supabase.rpc to run SQL
async function setupDatabase() {
  console.log('Setting up database schema...');
  
  // Create tables using raw SQL via the PostgREST API
  // We'll use the supabase client to call the /pg/ endpoint
  const response = await fetch(`${supabaseUrl}/rest/v1/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
    },
    body: '{}',
  });
}

setupDatabase().catch(console.error);