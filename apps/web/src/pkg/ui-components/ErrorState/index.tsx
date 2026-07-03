'use client';

import React from 'react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  icon,
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      {icon ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-status-error/10 text-status-error">
          {icon}
        </div>
      ) : (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-status-error/10">
          <svg className="h-7 w-7 text-status-error" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
      )}
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-steel">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-electric/10 px-4 py-2 text-sm font-semibold text-electric transition-all hover:bg-electric/20"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          Try Again
        </button>
      )}
    </div>
  );
}