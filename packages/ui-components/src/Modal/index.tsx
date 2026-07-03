'use client';

import React, { useEffect, useCallback } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({ open, onClose, title, description, children, footer, size = 'md', className = '' }: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className={`relative w-full ${sizeStyles[size]} rounded-2xl border border-white-border bg-surface-elevated shadow-2xl shadow-black/40 animate-in fade-in zoom-in-95`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-steel-light hover:bg-white-subtle hover:text-white transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        {(title || description) && (
          <div className="px-6 pt-6 pb-2">
            {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
            {description && <p className="mt-1 text-sm text-steel">{description}</p>}
          </div>
        )}

        {/* Body */}
        {children && <div className="px-6 py-4">{children}</div>}

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-white-border px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}