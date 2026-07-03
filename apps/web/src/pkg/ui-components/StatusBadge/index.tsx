'use client';

import React from 'react';
import type { JobStatus } from '@/pkg/ui-tokens';
import { jobStatusTokens } from '@/pkg/ui-tokens';

export { jobStatusTokens };
export type { JobStatus };

interface StatusBadgeProps {
  status: JobStatus | string;
  size?: 'sm' | 'md';
  className?: string;
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

export function StatusBadge({ status, size = 'sm', className = '' }: StatusBadgeProps) {
  const token = jobStatusTokens[status as JobStatus];
  const color = token?.color || '#6b7280';
  const bgColor = token?.bgColor || 'rgba(107,114,128,0.1)';
  const label = token?.label || status;

  return (
    <span
      className={`inline-flex items-center font-medium uppercase tracking-wider rounded-full border ${sizeStyles[size]} ${className}`}
      style={{ color, backgroundColor: bgColor, borderColor: `${color}33` }}
    >
      {label}
    </span>
  );
}