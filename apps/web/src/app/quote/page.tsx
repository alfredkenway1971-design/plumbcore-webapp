'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QuoteRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/quote/plumbcore');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="flex items-center gap-3 text-slate-500">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm font-medium">Redirecting to quote...</span>
      </div>
    </div>
  );
}
