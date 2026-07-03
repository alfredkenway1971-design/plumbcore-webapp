/**
 * PlumbCore AI — "Balanced Pro" Design System v2
 * Light, professional, clean SaaS aesthetic
 */

export const designTokens = {
  /* ── Backgrounds ── */
  bg: {
    page: '#f8f9fa',
    card: '#ffffff',
    sidebar: '#ffffff',
    sidebarHover: '#f1f5f9',
    topbar: '#ffffff',
    elevated: '#ffffff',
    modal: '#ffffff',
    input: '#ffffff',
    code: '#f1f5f9',
  },

  /* ── Text ── */
  text: {
    primary: '#1a1a2e',
    secondary: '#6b7280',
    muted: '#9ca3af',
    inverse: '#ffffff',
    link: '#2563eb',
  },

  /* ── Accent / Primary ── */
  accent: {
    DEFAULT: '#2563eb',
    hover: '#1d4ed8',
    light: '#dbeafe',
    lighter: '#eff6ff',
    subtle: 'rgba(37, 99, 235, 0.08)',
  },

  /* ── Status Colors ── */
  status: {
    success: '#10b981',
    successBg: '#d1fae5',
    warning: '#f59e0b',
    warningBg: '#fef3c7',
    error: '#ef4444',
    errorBg: '#fee2e2',
    info: '#3b82f6',
    infoBg: '#dbeafe',
    neutral: '#6b7280',
    neutralBg: '#f3f4f6',
  },

  /* ── Borders ── */
  border: {
    DEFAULT: '#e5e7eb',
    light: '#f3f4f6',
    hover: '#d1d5db',
    focus: '#2563eb',
  },

  /* ── Shadows ── */
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px -1px rgba(0,0,0,0.07)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.08)',
    xl: '0 20px 25px -5px rgba(0,0,0,0.1)',
  },

  /* ── Sidebar ── */
  sidebar: {
    bg: '#ffffff',
    border: '#e5e7eb',
    itemActive: '#eff6ff',
    itemActiveText: '#2563eb',
    itemHover: '#f1f5f9',
    text: '#6b7280',
    textActive: '#1a1a2e',
    sectionLabel: '#9ca3af',
  },

  /* ── Topbar ── */
  topbar: {
    bg: '#ffffff',
    border: '#e5e7eb',
    text: '#1a1a2e',
  },

  /* ── Tables ── */
  table: {
    header: '#f9fafb',
    headerText: '#6b7280',
    rowHover: '#f8fafc',
    border: '#e5e7eb',
    stripe: '#fafbfc',
  },

  /* ── Typography ── */
  font: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
    size: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
  },

  /* ── Radius ── */
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
};

/* ── Tailwind v4 CSS Theme Block ── */
export const tailwindTheme = `
@theme inline {
  --color-bg-page: #f8f9fa;
  --color-bg-card: #ffffff;
  --color-bg-sidebar: #ffffff;
  --color-bg-topbar: #ffffff;
  --color-bg-elevated: #ffffff;
  --color-bg-input: #ffffff;

  --color-text-primary: #1a1a2e;
  --color-text-secondary: #6b7280;
  --color-text-muted: #9ca3af;
  --color-text-inverse: #ffffff;
  --color-text-link: #2563eb;

  --color-accent: #2563eb;
  --color-accent-hover: #1d4ed8;
  --color-accent-light: #dbeafe;
  --color-accent-lighter: #eff6ff;
  --color-accent-subtle: rgba(37, 99, 235, 0.08);

  --color-success: #10b981;
  --color-success-bg: #d1fae5;
  --color-warning: #f59e0b;
  --color-warning-bg: #fef3c7;
  --color-error: #ef4444;
  --color-error-bg: #fee2e2;
  --color-info: #3b82f6;
  --color-info-bg: #dbeafe;
  --color-neutral: #6b7280;
  --color-neutral-bg: #f3f4f6;

  --color-border: #e5e7eb;
  --color-border-light: #f3f4f6;
  --color-border-hover: #d1d5db;
  --color-border-focus: #2563eb;

  --color-sidebar-bg: #ffffff;
  --color-sidebar-border: #e5e7eb;
  --color-sidebar-item-active: #eff6ff;
  --color-sidebar-item-active-text: #2563eb;
  --color-sidebar-item-hover: #f1f5f9;
  --color-sidebar-text: #6b7280;
  --color-sidebar-text-active: #1a1a2e;

  --color-table-header: #f9fafb;
  --color-table-header-text: #6b7280;
  --color-table-row-hover: #f8fafc;
  --color-table-border: #e5e7eb;
  --color-table-stripe: #fafbfc;

  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.07);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.08);
  --shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1);

  --color-background: #f8f9fa;
  --color-foreground: #1a1a2e;
  --color-muted: #6b7280;
  --color-muted-foreground: #9ca3af;
  --color-border: #e5e7eb;
  --color-ring: #2563eb;
}

body {
  background: var(--color-bg-page);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
}
`;