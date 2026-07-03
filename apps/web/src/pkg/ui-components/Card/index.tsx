'use client';

import React from 'react';

export type CardVariant = 'default' | 'elevated' | 'bordered';

interface CardProps {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-surface-card border border-white-border',
  elevated: 'bg-surface-elevated border border-white-border shadow-lg shadow-black/20',
  bordered: 'bg-surface-card border border-white/10',
};

const paddingStyles: Record<string, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-6',
};

export function Card({
  variant = 'default',
  padding = 'md',
  hover = false,
  children,
  className = '',
  onClick,
}: CardProps) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={`
        rounded-xl
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${hover ? 'transition-all hover:border-electric/20 hover:glow-electric' : ''}
        ${onClick ? 'w-full text-left cursor-pointer' : ''}
        ${className}
      `}
      {...(onClick ? { onClick } : {})}
    >
      {children}
    </Component>
  );
}
