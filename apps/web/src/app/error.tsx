'use client';

import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error('[PlumbCore] Page error:', error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Something went wrong</h1>
        <p className="text-base text-muted-foreground mb-2">An unexpected error occurred. Our team has been notified.</p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/80 mb-6 font-mono">Error ID: {error.digest}</p>
        )}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-blue-tint0 hover:bg-primary text-white text-sm font-bold shadow-sm transition-all active:scale-[0.97]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-full border border-border text-foreground hover:bg-muted text-sm font-medium transition-all"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
