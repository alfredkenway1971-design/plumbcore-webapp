'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    subscription_tier: string;
    subscription_status: string;
    stripe_customer_id: string;
    stripe_subscription_id: string;
    onboarding_complete: boolean;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, companyName: string, phone?: string, sessionId?: string) => Promise<void>;
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
      token: null,

      login: async (email: string, password: string) => {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Sign in failed');

        set({
          user: data.session.user,
          profile: data.session.profile,
          company: data.session.company,
          isAuthenticated: true,
          isLoading: false,
          token: data.token,
        });
      },

      signUp: async (email: string, password: string, fullName: string, companyName: string, phone?: string, sessionId?: string) => {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, fullName, companyName, phone: phone || '', sessionId: sessionId || '' }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Sign up failed');

        set({
          user: data.session.user,
          profile: data.session.profile,
          company: data.session.company,
          isAuthenticated: true,
          isLoading: false,
          token: data.token,
        });
      },

      logout: async () => {
        try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
        set({ user: null, profile: null, company: null, isAuthenticated: false, isLoading: false, token: null });
      },

      restoreSession: async () => {
        try {
          const storedToken = get().token;
          if (!storedToken) {
            set({ isLoading: false });
            return;
          }

          const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${storedToken}` },
          });

          if (res.ok) {
            const data = await res.json();
            set({
              user: data.session.user,
              profile: data.session.profile,
              company: data.session.company,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }
        } catch {}
        set({ isLoading: false, token: null });
      },

      updateProfile: async (data) => {
        const { profile } = get();
        if (!profile) return;
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
        token: state.token,
      }),
    }
  )
);
