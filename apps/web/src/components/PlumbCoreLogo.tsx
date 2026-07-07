'use client';

export default function PlumbCoreLogo({ size = 'sm', showText = true }: { size?: 'sm' | 'md' | 'lg'; showText?: boolean }) {
  const dims = size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-10 h-10' : 'w-12 h-12';
  const textSize = size === 'sm' ? 'text-base' : size === 'md' ? 'text-lg' : 'text-xl';
  const rounded = size === 'sm' ? 'rounded-lg' : 'rounded-xl';

  return (
    <a href="/dashboard" className="flex items-center gap-2.5">
      <img
        src="/plumbcore-logo.jpg"
        alt="PlumbCore AI"
        className={`${dims} ${rounded} object-cover shrink-0 shadow-sm`}
      />
      {showText && (
        <span className={`font-bold ${textSize} text-slate-900 tracking-tight`}>
          PlumbCore <span className="text-blue-500">AI</span>
        </span>
      )}
    </a>
  );
}
