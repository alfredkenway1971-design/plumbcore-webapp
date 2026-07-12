'use client';

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'dark' | 'light'; // dark = navy text for light bg, light = white text for dark bg
  showText?: boolean;
  href?: string;
}

export default function PlumbCoreLogo({ size = 'sm', variant = 'dark', showText = true, href = '/dashboard' }: Props) {
  const isLight = variant === 'light';
  const navyColor = isLight ? '#FFFFFF' : '#0F172A';
  const blueColor = '#3B82F6';
  const mutedColor = isLight ? 'rgba(255,255,255,0.6)' : '#94A3B8';

  const heights: Record<string, string> = { sm: '28', md: '34', lg: '40', xl: '48', '2xl': '56' };
  const h = heights[size] || '34';
  const Tag = href ? 'a' : 'div';

  return (
    // @ts-ignore
    <Tag href={href || undefined} className="flex items-center gap-2.5 no-underline select-none shrink-0">
      {/* Hexagon AI icon */}
      <svg
        viewBox="0 0 48 48"
        width={h}
        height={h}
        className="shrink-0"
        fill="none"
      >
        {/* Hexagonal border */}
        <path
          d="M14 8h20l10 16-10 16H14L4 24z"
          fill="none"
          stroke={blueColor}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Left line */}
        <line x1="2" y1="24" x2="12" y2="24" stroke={blueColor} strokeWidth="2.5" strokeLinecap="round" />
        {/* Right line */}
        <line x1="36" y1="24" x2="46" y2="24" stroke={blueColor} strokeWidth="2.5" strokeLinecap="round" />
        {/* AI text */}
        <text
          x="24"
          y="29"
          textAnchor="middle"
          fill={blueColor}
          fontSize="16"
          fontWeight="800"
          fontFamily="Inter, system-ui, sans-serif"
          letterSpacing="0.05em"
        >
          AI
        </text>
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            style={{
              fontSize: size === 'sm' ? '16px' : size === 'md' ? '18px' : size === 'lg' ? '20px' : size === 'xl' ? '22px' : '26px',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
            }}
          >
            <span style={{ color: navyColor }}>PLUMB</span>
            <span style={{ color: blueColor }}>CORE</span>
          </span>
          {size !== 'sm' && (
            <span
              style={{
                color: mutedColor,
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                lineHeight: 1,
              }}
            >
              AI · Plumbing Intelligence
            </span>
          )}
        </div>
      )}
    </Tag>
  );
}
