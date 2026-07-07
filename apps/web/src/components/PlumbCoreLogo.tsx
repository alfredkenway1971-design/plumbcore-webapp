'use client';

export default function PlumbCoreLogo({ size = 'sm', showText = true }: { size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'; showText?: boolean }) {
  const dims = size === 'sm' ? 'w-10 h-10' : size === 'md' ? 'w-12 h-12' : size === 'lg' ? 'w-14 h-14' : size === 'xl' ? 'w-16 h-16' : 'w-20 h-20';
  const wordmarkH = size === 'sm' ? 'h-30' : size === 'md' ? 'h-36' : size === 'lg' ? 'h-42' : size === 'xl' ? 'h-48' : 'h-60';
  const rounded = size === 'sm' || size === 'md' ? 'rounded-lg' : 'rounded-xl';

  return (
    <a href="/dashboard" className="flex items-center gap-3">
      <img
        src="/plumbcore-emblem.jpg"
        alt="PlumbCore AI"
        className={`${dims} ${rounded} object-contain shrink-0 shadow-sm`}
      />
      {showText && (
        <img
          src="/plumbcore-wordmark.png"
          alt="PLUMBCORE AI"
          className={`${wordmarkH} w-auto object-contain`}
        />
      )}
    </a>
  );
}
