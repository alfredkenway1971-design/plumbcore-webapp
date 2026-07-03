'use client';

import React from 'react';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

interface AvatarProps {
  name: string;
  size?: AvatarSize;
  src?: string;
  status?: AvatarStatus;
  className?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; dot: string }> = {
  sm: { container: 'h-7 w-7', text: 'text-[10px]', dot: 'h-1.5 w-1.5 -right-0.5 -top-0.5' },
  md: { container: 'h-8 w-8', text: 'text-xs', dot: 'h-2 w-2 -right-0.5 top-0' },
  lg: { container: 'h-10 w-10', text: 'text-sm', dot: 'h-2.5 w-2.5 -right-0.5 top-0' },
  xl: { container: 'h-14 w-14', text: 'text-lg', dot: 'h-3 w-3 -right-0.5 top-0' },
};

const statusColors: Record<AvatarStatus, string> = {
  online: 'bg-status-success',
  offline: 'bg-steel',
  busy: 'bg-status-warning',
  away: 'bg-steel-light',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ name, size = 'md', src, status, className = '' }: AvatarProps) {
  const s = sizeStyles[size];

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <img src={src} alt={name} className={`${s.container} rounded-full object-cover border-2 border-white-border`} />
      ) : (
        <div className={`${s.container} rounded-full bg-electric/15 text-electric font-semibold flex items-center justify-center border-2 border-white-border ${s.text}`}>
          {getInitials(name)}
        </div>
      )}
      {status && (
        <span className={`absolute ${s.dot} rounded-full border-2 border-surface ${statusColors[status]}`} />
      )}
    </div>
  );
}