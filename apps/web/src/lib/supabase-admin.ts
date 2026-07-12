/**
 * Server-side Supabase admin client
 * Uses SERVICE_ROLE key to bypass RLS — NEVER expose to the client
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE || '';

export function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Check if the service role key is configured (production-ready) */
export function hasAdminClient(): boolean {
  return !!(supabaseUrl && serviceRoleKey);
}
