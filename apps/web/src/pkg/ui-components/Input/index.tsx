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
  w-full rounded-xl bg-white border-0 ring-1 ring-slate-200
  px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none
  transition-all duration-200
  focus:ring-blue-500/50 focus:bg-white
  disabled:cursor-not-allowed disabled:opacity-40
`;

const errorInputStyles = 'ring-red-500/50 focus:ring-red-500/50';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-slate-600 uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`${baseInputStyles} ${error ? errorInputStyles : ''} ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, hint, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-slate-600 uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`${baseInputStyles} resize-none ${error ? errorInputStyles : ''} ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    );
  }
);
TextArea.displayName = 'TextArea';
