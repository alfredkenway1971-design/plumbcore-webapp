'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const baseInputStyles = `
  w-full rounded-lg border border-white/10 bg-surface-lighter px-4 py-2.5
  text-sm text-white placeholder-steel/50 outline-none
  transition-all
  focus:border-electric/50 focus:ring-1 focus:ring-electric/20
  disabled:cursor-not-allowed disabled:opacity-40
`;

const errorInputStyles = 'border-status-error/50 focus:border-status-error/50 focus:ring-status-error/20';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && <label className="block text-sm font-medium text-steel-light">{label}</label>}
        <input
          ref={ref}
          className={`${baseInputStyles} ${error ? errorInputStyles : ''} ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-status-error">{error}</p>}
        {hint && !error && <p className="text-xs text-steel">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, hint, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && <label className="block text-sm font-medium text-steel-light">{label}</label>}
        <textarea
          ref={ref}
          className={`${baseInputStyles} resize-none ${error ? errorInputStyles : ''} ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-status-error">{error}</p>}
        {hint && !error && <p className="text-xs text-steel">{hint}</p>}
      </div>
    );
  }
);
TextArea.displayName = 'TextArea';
