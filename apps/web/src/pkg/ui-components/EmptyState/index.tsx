'use client';

import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      {icon ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white-subtle text-steel-light">
          {icon}
        </div>
      ) : (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white-subtle">
          <svg className="h-7 w-7 text-steel-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      )}
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-steel">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}