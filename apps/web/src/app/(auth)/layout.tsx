export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Brand side - hidden on mobile, visible on desktop */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white p-12 xl:p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_30%_50%,white_0%,transparent_60%)]" />
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <img src="/plumbcore-logo.png" alt="PlumbCore" className="w-7 h-7 rounded-lg" />
            </div>
            <span className="text-lg font-bold tracking-tight">plumbcore</span>
          </div>
          <h2 className="text-3xl font-bold mb-4 leading-tight">Run your plumbing business on autopilot</h2>
          <p className="text-gray-400 text-sm max-w-md leading-relaxed">
            AI-powered estimates, smart scheduling, automated invoicing. Join 500+ plumbing companies already using PlumbCore.
          </p>
        </div>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">{[...Array(4)].map((_, i) => <div key={i} className="w-8 h-8 rounded-full bg-gray-600 border-2 border-gray-700 flex items-center justify-center text-[10px] font-bold text-white">P{i + 1}</div>)}</div>
            <div><p className="text-sm font-medium">Trusted by 500+ companies</p><p className="text-xs text-gray-500">4.9★ average rating</p></div>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex-1 flex items-center justify-center bg-white p-6 sm:p-10 min-h-screen lg:min-h-0">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">plumbcore</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}