'use client';

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'dark' | 'light'; // dark = text on light bg, light = white text on dark bg
  showText?: boolean;
  href?: string;
}

export default function PlumbCoreLogo({ size = 'sm', variant = 'dark', showText = true, href = '/dashboard' }: Props) {
  const h = size === 'sm' ? 'h-8' : size === 'md' ? 'h-9' : size === 'lg' ? 'h-10' : size === 'xl' ? 'h-12' : 'h-14';
  const isLight = variant === 'light';
  const textColor = isLight ? '#FFFFFF' : '#0F172A';
  const mutedColor = isLight ? 'rgba(255,255,255,0.6)' : '#64748B';
  const accentColor = '#3B82F6';
  const accentLight = '#60A5FA';

  const Tag = href ? 'a' : 'div';

  return (
    // @ts-ignore
    <Tag href={href || undefined} className="flex items-center gap-3 no-underline select-none">
      {/* "P" icon */}
      <svg viewBox="0 0 40 40" width={h.replace('h-', '') + 'px' as any} height={h.replace('h-', '') + 'px' as any} style={{ maxHeight: '100%' }} className="shrink-0 drop-shadow-sm">
        <defs>
          <linearGradient id={`lg-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accentColor} />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="36" height="36" rx="10" fill={`url(#lg-${variant})`} />
        <text x="20" y="27" textAnchor="middle" fill="white" fontSize="22" fontWeight="800" fontFamily="Inter, system-ui, sans-serif">P</text>
      </svg>

      {showText && (
        <div className="flex flex-col leading-none" style={{ filter: isLight ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' : 'none' }}>
          <span style={{ color: textColor, fontSize: size === 'sm' ? '16px' : size === 'md' ? '18px' : '20px', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            PLUMB<span style={{ color: accentColor }}>CORE</span>
          </span>
          {size !== 'sm' && (
            <span style={{ color: mutedColor, fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: 1 }}>
              AI · Plumbing Intelligence
            </span>
          )}
        </div>
      )}
    </Tag>
  );
}
