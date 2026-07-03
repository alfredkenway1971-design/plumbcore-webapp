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
    subscription_tier: 'starter' | 'pro' | 'unlimited';
    onboarding_complete: boolean;
  } | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<NonNullable<AuthState['profile']>>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      company: null,
      isAuthenticated: false,

      login: async (_email: string, _password: string) => {
        // Mock login – will be replaced with Supabase auth
        const mockUser = { id: 'usr-001', email: _email };
        const mockProfile = {
          id: 'prof-001',
          company_id: 'comp-001',
          email: _email,
          full_name: 'Amer Moreau',
          phone: '(555) 000-0000',
          role: 'admin' as const,
          avatar_url: undefined,
          is_active: true,
        };
        const mockCompany = {
          id: 'comp-001',
          slug: 'plumbcore',
          name: 'PlumbCore Plumbing',
          timezone: 'America/Chicago',
          subscription_tier: 'pro' as const,
          onboarding_complete: true,
        };
        set({ user: mockUser, profile: mockProfile, company: mockCompany, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, profile: null, company: null, isAuthenticated: false });
      },

      updateProfile: (data) => {
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...data } : null,
        }));
      },
    }),
    { name: 'plumbcore-auth' }
  )
);

/* ── UI Store ── */
export type Theme = 'light' | 'dark';

export interface UIState {
  sidebarOpen: boolean;
  theme: Theme;
  toggleSidebar: () => void;
  setTheme: (theme: Theme) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      theme: 'dark',

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setTheme: (theme) => set({ theme }),
    }),
    { name: 'plumbcore-ui' }
  )
);

/* ── Onboarding Store ── */
export interface OnboardingState {
  step: number;
  companyData: {
    name?: string;
    slug?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    timezone?: string;
    hourly_rate?: number;
  };
  setStep: (step: number) => void;
  updateCompany: (data: Partial<OnboardingState['companyData']>) => void;
  complete: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      step: 0,
      companyData: {},

      setStep: (step) => set({ step }),

      updateCompany: (data) => {
        set((state) => ({
          companyData: { ...state.companyData, ...data },
        }));
      },

      complete: () => {
        set({ step: 5 });
      },
    }),
    { name: 'plumbcore-onboarding' }
  )
);