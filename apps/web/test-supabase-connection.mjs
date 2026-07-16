import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE;

console.log('⚡ Testing Supabase connection...');
console.log('URL:', supabaseUrl?.substring(0, 30) + '...');
console.log('Service Role Key:', serviceRoleKey ? '✓ Set' : '✗ MISSING');

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Supabase credentials not configured!');
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey);

async function testConnection() {
  try {
    console.log('');
    console.log('🔍 Checking if leads table exists...');
    
    const { data: check, error } = await admin
      .from('leads')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Error checking leads table:', error.message);
      console.log('');
      console.log('🛠️ This means the table might not be created yet.');
      console.log('   You need to run the SQL migrations in your Supabase dashboard.');
      return false;
    }
    
    if (check) {
      console.log('✅ Leads table exists with', check.length, 'existing lead(s)');
    } else {
      console.log('✅ Leads table exists but empty');
    }
    
    console.log('');
    console.log('💾 Testing lead creation...');
    
    // Try creating a test lead
    const testResult = await admin
      .from('leads')
      .insert({
        stripe_session_id: 'TEST_SESSION_' + Date.now(),
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        customer_phone: '(555) 123-4567',
        customer_address: '123 Test Street',
        customer_city: 'Test City',
        diagnosis: 'Test diagnosis',
        severity: 'moderate',
        total_estimate: 499,
        deposit_paid: 49,
        deposit_charged: 49,
        deposit_tier: 'Under $1,000',
        estimated_job_value: 499,
        status: 'testing',
        tracking_token: 'TEST-' + Date.now(),
      })
      .select()
      .single();
    
    if (testResult.error) {
      console.error('❌ Lead creation failed:', testResult.error.message);
      console.log('');
      console.log('🛠️ This is the actual issue!');
      console.log('   Check your Supabase dashboard for error details.');
      return false;
    }
    
    console.log('✅ SUCCESS! Test lead created with ID:', testResult.data.id);
    
    // Delete test lead
    await admin.from('leads').delete().eq('stripe_session_id', testResult.data.stripe_session_id);
    console.log('🗑️ Test lead cleaned up');
    
    console.log('');
    console.log('🎉 ALL TESTS PASSED!');
    console.log('Your Supabase connection is working correctly.');
    console.log('Leads ARE being created - the issue must be elsewhere.');
    console.log('');
    console.log('⚠️ Next steps:');
    console.log('1. Check your Vercel production deployment has these env vars');
    console.log('2. Check /api/leads/create-from-session is being called');
    console.log('3. Check browser console for any JavaScript errors');
    console.log('4. Check server logs in Vercel dashboard');
    
    return true;
    
  } catch (err: any) {
    console.error('❌ Unexpected error:', err.message);
    console.log(err);
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
