'use client';

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]',
  secondary:
    'bg-slate-800 text-slate-300 ring-1 ring-white/10 hover:bg-muted hover:text-white',
  destructive:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  ghost:
    'bg-transparent text-muted-foreground/80 hover:text-white hover:bg-white/10 active:bg-white/5',
  outline:
    'ring-1 ring-white/10 text-muted-foreground/80 hover:text-white hover:ring-white/20 hover:bg-white/5 active:bg-white/10',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5 min-h-[36px]',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2 min-h-[44px]',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5 min-h-[48px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-semibold transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-cyan-500/40
        disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100
        ${fullWidth ? 'w-full' : ''}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
    </button>
  );
}
