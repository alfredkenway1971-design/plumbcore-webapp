/**
 * PlumbCore AI — Design Tokens
 * Deep industrial blue/slate primary, warm amber/orange accent
 */

/* ── Color Palette ── */
export const colors = {
  /* Primary — Deep Industrial Blue/Slate */
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#1e1b4b',
    900: '#0f172a',
    950: '#060b1a',
  },

  /* Surface — Dark navy for app shells */
  surface: {
    DEFAULT: '#0a0e2a',
    light: '#151a3a',
    lighter: '#1e2448',
    card: '#121638',
    elevated: '#1a2048',
  },

  /* Accent — Warm Amber/Orange for highlights */
  accent: {
    amber: '#f59e0b',
    amberLight: '#fbbf24',
    amberDark: '#d97706',
    orange: '#f97316',
    orangeLight: '#fb923c',
    orangeDark: '#ea580c',
  },

  /* Electric Blue — Interactive elements */
  electric: {
    DEFAULT: '#00bfff',
    dark: '#0099cc',
    light: '#33ccff',
    subtle: 'rgba(0, 191, 255, 0.1)',
  },

  /* Neutrals */
  steel: {
    DEFAULT: '#6b7280',
    light: '#9ca3af',
    dark: '#4b5563',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  /* Semantic status colors */
  status: {
    success: '#10b981',
    successBg: 'rgba(16, 185, 129, 0.1)',
    warning: '#f59e0b',
    warningBg: 'rgba(245, 158, 11, 0.1)',
    error: '#ef4444',
    errorBg: 'rgba(239, 68, 68, 0.1)',
    info: '#3b82f6',
    infoBg: 'rgba(59, 130, 246, 0.1)',
    neutral: '#6b7280',
    neutralBg: 'rgba(107, 114, 128, 0.1)',
  },

  /* White/opacity helpers */
  white: '#ffffff',
  whiteSoft: 'rgba(255, 255, 255, 0.85)',
  whiteMuted: 'rgba(255, 255, 255, 0.6)',
  whiteSubtle: 'rgba(255, 255, 255, 0.08)',
  whiteBorder: 'rgba(255, 255, 255, 0.06)',
} as const;

export type ColorKey = keyof typeof colors;
