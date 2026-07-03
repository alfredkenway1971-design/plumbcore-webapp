'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

/* ── Auth Store ── */
export interface AuthState {
  user: { id: string; email: string } | null;
  profile: {
    id: string;
    company_id: string;
    email: string;
    full_name: string;
    phone: string;
    role: 'admin' | 'dispatcher' | 'tech' | 'lead-tech' | 'accountant';
    avatar_url?: string;
    is_active: boolean;
  } | null;
  company: {
    id: string;
    slug: string;
    name: string;
    timezone: string;
    subscription_tier: 'starter' | 'pro' | 'unlimited';
    onboarding_complete: boolean;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, companyName: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  updateProfile: (data: Partial<NonNullable<AuthState['profile']>>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      company: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*, companies(*)')
          .eq('id', data.user.id)
          .single();

        if (!profile) throw new Error('Profile not found');

        set({
          user: { id: data.user.id, email: data.user.email! },
          profile: {
            id: profile.id,
            company_id: profile.company_id,
            email: profile.email,
            full_name: profile.full_name,
            phone: profile.phone,
            role: profile.role,
            avatar_url: profile.avatar_url,
            is_active: profile.is_active,
          },
          company: {
            id: profile.company_id,
            slug: profile.companies?.slug || '',
            name: profile.companies?.name || '',
            timezone: profile.companies?.timezone || 'America/Chicago',
            subscription_tier: profile.companies?.subscription_tier || 'pro',
            onboarding_complete: profile.companies?.onboarding_complete || false,
          },
          isAuthenticated: true,
          isLoading: false,
        });
      },

      signUp: async (email: string, password: string, fullName: string, companyName: string) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.user) throw new Error('Sign up failed');

        // Create company
        const { data: company, error: companyErr } = await supabase
          .from('companies')
          .insert({
            name: companyName,
            slug: companyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            email,
            phone: '',
            address: '', city: '', state: '', zip: '',
            timezone: 'America/Chicago',
            hourly_rate: 95, service_fee_percent: 0, tax_rate: 8.25,
            stripe_onboarding_complete: false,
            trial_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            subscription_tier: 'starter',
            onboarding_complete: false,
            business_hours: {},
          })
          .select()
          .single();

        if (companyErr) throw companyErr;

        // Create profile
        const { error: profileErr } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            company_id: company.id,
            email,
            full_name: fullName,
            phone: '',
            role: 'admin',
            is_active: true,
          });

        if (profileErr) throw profileErr;

        set({
          user: { id: data.user.id, email: data.user.email! },
          profile: { id: data.user.id, company_id: company.id, email, full_name: fullName, phone: '', role: 'admin', is_active: true },
          company: { id: company.id, slug: company.slug, name: company.name, timezone: company.timezone, subscription_tier: 'starter', onboarding_complete: false },
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, profile: null, company: null, isAuthenticated: false, isLoading: false });
      },

      restoreSession: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*, companies(*)')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              set({
                user: { id: session.user.id, email: session.user.email! },
                profile: {
                  id: profile.id, company_id: profile.company_id, email: profile.email,
                  full_name: profile.full_name, phone: profile.phone, role: profile.role,
                  avatar_url: profile.avatar_url, is_active: profile.is_active,
                },
                company: {
                  id: profile.company_id, slug: profile.companies?.slug || '',
                  name: profile.companies?.name || '', timezone: profile.companies?.timezone || 'America/Chicago',
                  subscription_tier: profile.companies?.subscription_tier || 'pro',
                  onboarding_complete: profile.companies?.onboarding_complete || false,
                },
                isAuthenticated: true,
                isLoading: false,
              });
              return;
            }
          }
          set({ isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      },

      updateProfile: async (data) => {
        const { profile } = get();
        if (!profile) return;

        await supabase.from('profiles').update(data).eq('id', profile.id);
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...data } : null,
        }));
      },
    }),
    {
      name: 'plumbcore-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);