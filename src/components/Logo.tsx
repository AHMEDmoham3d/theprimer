interface LogoProps {
  size?: number;
  className?: string;
  variant?: 'light' | 'dark';
}

export function Logo({ size = 36, className = '', variant = 'light' }: LogoProps) {
  const bg = variant === 'light' ? '#0a0a0a' : '#ffffff';
  const fg = variant === 'light' ? '#ffffff' : '#0a0a0a';
  const accent = '#10b981';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="48" rx="14" fill={bg} />

      {/* Stylized "P" — bold stem with a geometric bowl that doubles as a spark/arrow */}
      {/* Vertical stem */}
      <rect x="14" y="11" width="6" height="26" rx="2" fill={fg} />

      {/* The bowl of the P — a rounded shape with an emerald accent slash cutting through */}
      <path
        d="M20 11 H31 C35 11 38 14 38 18.5 C38 23 35 26 31 26 H20 Z"
        fill={fg}
      />

      {/* Emerald accent — a dynamic diagonal slash through the bowl, like a spark/ignition */}
      <path
        d="M22 13 L34 24"
        stroke={accent}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Small accent dot at the tip — the "spark" point */}
      <circle cx="34.5" cy="24.5" r="2.5" fill={accent} />
    </svg>
  );
}
