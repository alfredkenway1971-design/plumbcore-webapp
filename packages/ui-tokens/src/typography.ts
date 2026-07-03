/**
 * PlumbCore AI — Typography Scale
 */

export const typography = {
  fontFamily: {
    sans: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'Geist Mono', 'Fira Code', monospace",
  },

  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],        // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],     // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],         // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],      // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],       // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],        // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],   // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],     // 36px
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;
