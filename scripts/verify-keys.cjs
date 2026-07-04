const { createClient } = require('./node_modules/@supabase/supabase-js');

const URL = 'https://zwlwmehlewcyyljskpfv.supabase.co';
const ANON_KEY = 'eyJhbG...' + '...oA08'; // <- truncated
const SVC_KEY = 'eyJhbG...' + '...IOWM'; // <- truncated

console.log('Keys are truncated! Need full 200+ char keys');
process.exit(1);