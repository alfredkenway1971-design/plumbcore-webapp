import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-5xl font-extrabold text-foreground mb-2">404</h1>
        <p className="text-base text-muted-foreground mb-8">This page doesn&apos;t exist. It might have been moved or deleted.</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-blue-500 hover:bg-primary text-white text-sm font-bold shadow-sm transition-all active:scale-[0.97]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
