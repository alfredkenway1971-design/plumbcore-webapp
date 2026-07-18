/**
 * Custom auth system — replaces broken Supabase Auth
 * 
 * WHY: Supabase project has infinite RLS recursion on profiles table,
 * causing "Database error saving new user" on every signup attempt.
 * 
 * PERSISTENCE: Uses Supabase (service_role key) when available in production.
 * Falls back to in-memory Map for local development.
 * 
 * Storage: Self-contained JWTs with all session data encoded inside the token.
 */

import { randomBytes, createHmac, timingSafeEqual } from 'crypto';
import { scryptSync } from 'crypto';
import { getAdminClient, hasAdminClient } from './supabase-admin';

// ── Types ──
export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  companyName: string;
  companySlug: string;
  companyId: string;
  phone: string;
  role: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  subscriptionTier: string;
}

export interface AuthSession {
  user: { id: string; email: string };
  profile: {
    id: string;
    company_id: string;
    email: string;
    full_name: string;
    phone: string;
    role: string;
    is_active: boolean;
  };
  company: {
    id: string;
    slug: string;
    name: string;
    timezone: string;
    subscription_tier: string;
    subscription_status: string;
    stripe_customer_id: string;
    stripe_subscription_id: string;
    onboarding_complete: boolean;
  };
}

// ── Config ──
const authSecret = process.env.AUTH_SECRET || '';

// ── Password Hashing ──
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  const verify = scryptSync(password, salt, 64).toString('hex');
  try { return timingSafeEqual(Buffer.from(hash), Buffer.from(verify)); }
  catch { return false; }
}

// ── Token: encodes complete session data ──
export function createSessionToken(session: AuthSession): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...session,
    iat: Date.now(),
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000,
  })).toString('base64url');
  const signature = createHmac('sha256', authSecret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function decodeSessionToken(token: string): (AuthSession & { iat: number; exp: number }) | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = createHmac('sha256', authSecret).update(`${header}.${body}`).digest('base64url');
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch { return null; }
}

// ── In-Memory Fallback Store (local dev only) ──
const inMemoryUsers = new Map<string, StoredUser>();

// Seed demo users so login always has working accounts
// NOTE: These are seeded for local development only.
// In production, users must sign up. Do not rely on these in prod.
(function seedDemoUsers() {
  const companyId = 'demo-company-001';
  
  // Demo admin account — password set via env or DB in production
  const demoUser: StoredUser = {
    id: 'demo-user-001',
    email: 'demo@plumbcore.com',
    passwordHash: hashPassword('Demo123!'),
    fullName: 'Demo User',
    companyName: 'PlumbCore Demo',
    companySlug: 'plumbcore-demo',
    companyId,
    phone: '(555) 123-4567',
    role: 'super_admin',
    stripeCustomerId: '',
    stripeSubscriptionId: '',
    subscriptionTier: '',
  };
  inMemoryUsers.set(demoUser.id, demoUser);

  // Amer's super admin account — password set via env or DB in production
  const amerUser: StoredUser = {
    id: 'amer-super-admin',
    email: 'amer.niyonzima@gmail.com',
    passwordHash: hashPassword('Admin123!'),
    fullName: 'Niyonzima Amer Moreau',
    companyName: 'PlumbCore AI',
    companySlug: 'plumbcore-ai',
    companyId,
    phone: '(514) 269-5558',
    role: 'super_admin',
    stripeCustomerId: '',
    stripeSubscriptionId: '',
    subscriptionTier: 'unlimited',
  };
  inMemoryUsers.set(amerUser.id, amerUser);
})();

// ── Persistence Layer ──

function useDb(): boolean {
  return hasAdminClient();
}

async function dbFindUserByEmail(email: string): Promise<StoredUser | undefined> {
  const admin = getAdminClient();
  if (!admin) return undefined;

  const { data } = await (admin as any)
    .from('auth_users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single() as { data: any };

  if (!data) return undefined;

  return {
    id: data.id,
    email: data.email,
    passwordHash: data.password_hash,
    fullName: data.full_name,
    companyName: data.company_name,
    companySlug: data.company_slug,
    companyId: data.company_id,
    phone: data.phone,
    role: data.role,
    stripeCustomerId: data.stripe_customer_id || '',
    stripeSubscriptionId: data.stripe_subscription_id || '',
    subscriptionTier: data.subscription_tier || '',
  };
}

async function dbAddUser(user: StoredUser): Promise<void> {
  const admin = getAdminClient();
  if (!admin) return;

  const sb = admin as any;

  // 1. Create company record
  await sb
    .from('companies')
    .insert({
      id: user.companyId,
      slug: user.companySlug,
      name: user.companyName,
      subscription_tier: user.subscriptionTier || '',
      stripe_customer_id: user.stripeCustomerId || '',
      stripe_subscription_id: user.stripeSubscriptionId || '',
    });

  // 2. Create profile record
  await sb
    .from('profiles')
    .insert({
      id: user.id,
      company_id: user.companyId,
      email: user.email,
      full_name: user.fullName,
      phone: user.phone || '',
      role: user.role || 'tech',
      is_active: true,
    });

  // 3. Create auth user record
  await sb
    .from('auth_users')
    .insert({
      id: user.id,
      email: user.email,
      password_hash: user.passwordHash,
      full_name: user.fullName,
      company_name: user.companyName,
      company_slug: user.companySlug,
      company_id: user.companyId,
      phone: user.phone || '',
      role: user.role || 'tech',
      stripe_customer_id: user.stripeCustomerId || '',
      stripe_subscription_id: user.stripeSubscriptionId || '',
      subscription_tier: user.subscriptionTier || '',
    });
}

async function dbUpdateSubscription(email: string, updates: {
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionTier?: string;
  subscriptionStatus?: string;
}): Promise<void> {
  const admin = getAdminClient();
  if (!admin) return;

  const sb = admin as any;

  // Find the auth_user
  const { data: authUser } = await sb
    .from('auth_users')
    .select('company_id')
    .eq('email', email.toLowerCase())
    .single() as { data: { company_id: string } | null };

  if (!authUser) {
    // User not found in DB — they may have been stored in-memory
    // Create the company + auth_user record so webhook can update it
    console.log(`  → No auth_user found for ${email}, creating company record from Stripe data`);
    try {
      const companyId = generateId();
      const now = new Date().toISOString();
      const cusId = updates.stripeCustomerId || '';
      
      await sb.from('companies').insert({
        id: companyId,
        name: email.split('@')[0],
        email: email.toLowerCase(),
        stripe_customer_id: cusId,
        stripe_subscription_id: updates.stripeSubscriptionId || '',
        subscription_tier: updates.subscriptionTier || 'solo',
        created_at: now,
      });
      
      await sb.from('auth_users').insert({
        id: generateId(),
        email: email.toLowerCase(),
        company_id: companyId,
        role: 'tech',
        stripe_customer_id: cusId,
        stripe_subscription_id: updates.stripeSubscriptionId || '',
        subscription_tier: updates.subscriptionTier || 'solo',
      });
      
      console.log(`  → Created company + auth_user for ${email}`);
    } catch (createErr: any) {
      console.error(`  → Failed to create missing user: ${createErr.message}`);
    }
    return;
  }

  // Update auth_users
  const authUpdates: Record<string, string> = {};
  if (updates.stripeCustomerId !== undefined) authUpdates.stripe_customer_id = updates.stripeCustomerId;
  if (updates.stripeSubscriptionId !== undefined) authUpdates.stripe_subscription_id = updates.stripeSubscriptionId;
  if (updates.subscriptionTier !== undefined) authUpdates.subscription_tier = updates.subscriptionTier;
  if (Object.keys(authUpdates).length > 0) {
    await sb.from('auth_users').update(authUpdates).eq('email', email.toLowerCase());
  }

  // Update company
  const companyUpdates: Record<string, string> = {};
  if (updates.stripeCustomerId !== undefined) companyUpdates.stripe_customer_id = updates.stripeCustomerId;
  if (updates.stripeSubscriptionId !== undefined) companyUpdates.stripe_subscription_id = updates.stripeSubscriptionId;
  if (updates.subscriptionTier !== undefined) companyUpdates.subscription_tier = updates.subscriptionTier;
  if (Object.keys(companyUpdates).length > 0) {
    const { error: updateErr, count } = await sb.from('companies').update(companyUpdates).eq('id', authUser.company_id).select('id', { count: 'exact', head: true });
    // If no rows updated, company doesn't exist — create it
    if (updateErr || (count === 0)) {
      await sb.from('companies').insert({
        id: authUser.company_id,
        email: email.toLowerCase(),
        stripe_customer_id: companyUpdates.stripe_customer_id || '',
        stripe_subscription_id: companyUpdates.stripe_subscription_id || '',
        subscription_tier: companyUpdates.subscription_tier || 'solo',
        created_at: new Date().toISOString(),
      }).select('id');
      console.log(`  → Created missing company record for ${email}`);
    }
  }
}

// ── Public API ──

export async function findUserByEmail(email: string): Promise<StoredUser | undefined> {
  if (useDb()) {
    return dbFindUserByEmail(email);
  }
  return Promise.resolve(Array.from(inMemoryUsers.values()).find(u => u.email === email.toLowerCase()));
}

export async function addUser(user: StoredUser): Promise<void> {
  if (useDb()) {
    return dbAddUser(user);
  }
  inMemoryUsers.set(user.id, user);
}

export async function updateUserSubscription(email: string, updates: {
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionTier?: string;
  subscriptionStatus?: string;
}): Promise<void> {
  if (useDb()) {
    return dbUpdateSubscription(email, updates);
  }
  // Fallback: update in-memory user
  const user = Array.from(inMemoryUsers.values()).find(u => u.email === email.toLowerCase());
  if (user) {
    if (updates.stripeCustomerId !== undefined) user.stripeCustomerId = updates.stripeCustomerId;
    if (updates.stripeSubscriptionId !== undefined) user.stripeSubscriptionId = updates.stripeSubscriptionId;
    if (updates.subscriptionTier !== undefined) user.subscriptionTier = updates.subscriptionTier;
  }
}

export { hashPassword as hashPw, verifyPassword as verifyPw };

export function generateId(): string {
  return randomBytes(16).toString('hex');
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function buildSession(user: StoredUser): AuthSession {
  return {
    user: { id: user.id, email: user.email },
    profile: {
      id: user.id,
      company_id: user.companyId,
      email: user.email,
      full_name: user.fullName,
      phone: user.phone,
      role: user.role,
      is_active: true,
    },
    company: {
      id: user.companyId,
      slug: user.companySlug,
      name: user.companyName,
      timezone: 'America/Chicago',
      subscription_tier: user.subscriptionTier || 'solo',
      subscription_status: user.subscriptionTier ? 'active' : 'none',
      stripe_customer_id: user.stripeCustomerId,
      stripe_subscription_id: user.stripeSubscriptionId,
      onboarding_complete: false,
    },
  };
}
