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
  default: 'bg-white border border-border/50 shadow-sm',
  elevated: 'bg-white border border-border/50 shadow-md',
  bordered: 'bg-white border border-border',
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
        ${hover ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5' : ''}
        ${onClick ? 'w-full text-left cursor-pointer' : ''}
        ${className}
      `}
      {...(onClick ? { onClick } : {})}
    >
      {children}
    </Component>
  );
}
