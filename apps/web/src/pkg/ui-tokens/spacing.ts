/**
 * PlumbCore AI — Spacing & Radius Scale
 */

export const spacing = {
  0: '0',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',       // 4px
  1.5: '0.375rem',    // 6px
  2: '0.5rem',        // 8px
  2.5: '0.625rem',    // 10px
  3: '0.75rem',       // 12px
  3.5: '0.875rem',    // 14px
  4: '1rem',          // 16px
  5: '1.25rem',       // 20px
  6: '1.5rem',        // 24px
  7: '1.75rem',       // 28px
  8: '2rem',          // 32px
  9: '2.25rem',       // 36px
  10: '2.5rem',       // 40px
  12: '3rem',         // 48px
  14: '3.5rem',       // 56px
  16: '4rem',         // 64px
  20: '5rem',         // 80px
} as const;

export const radius = {
  none: '0',
  sm: '0.25rem',      // 4px
  md: '0.375rem',     // 6px
  lg: '0.5rem',       // 8px
  xl: '0.75rem',      // 12px
  '2xl': '1rem',      // 16px
  full: '9999px',
} as const;

/* ── Semantic Status Tokens ── */
export type JobStatus = 'completed' | 'in-progress' | 'scheduled' | 'urgent' | 'pending' | 'cancelled';
export type TechStatus = 'available' | 'busy' | 'break' | 'offline';
export type EstimateStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export const jobStatusTokens: Record<JobStatus, { label: string; color: string; bgColor: string }> = {
  completed:    { label: 'Completed',    color: '#10b981', bgColor: 'rgba(16,185,129,0.1)' },
  'in-progress': { label: 'In Progress', color: '#00bfff', bgColor: 'rgba(0,191,255,0.1)' },
  scheduled:    { label: 'Scheduled',    color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)' },
  urgent:       { label: 'Urgent',       color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)' },
  pending:      { label: 'Pending',      color: '#6b7280', bgColor: 'rgba(107,114,128,0.1)' },
  cancelled:    { label: 'Cancelled',    color: '#4b5563', bgColor: 'rgba(75,85,99,0.1)' },
};
