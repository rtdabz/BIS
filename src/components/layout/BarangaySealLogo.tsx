import * as React from 'react';

export interface BarangaySealLogoProps {
  className?: string;
  variant?: 'default' | 'on-dark';
}

/**
 * Clean civic seal placeholder for Barangay Cebole (Navy + Slate + Amber vector emblem).
 */
export function BarangaySealLogo({
  className = 'h-9 w-9',
  variant = 'default',
}: BarangaySealLogoProps) {
  const isOnDark = variant === 'on-dark';

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width="38"
        height="38"
        rx="9"
        fill={isOnDark ? 'rgba(255, 255, 255, 0.1)' : 'var(--bis-accent)'}
        stroke={isOnDark ? 'rgba(214, 154, 56, 0.6)' : 'none'}
        strokeWidth={isOnDark ? '1.25' : undefined}
      />
      <circle
        cx="20"
        cy="20"
        r="13.5"
        stroke={isOnDark ? '#FFFFFF' : 'var(--bis-accent-contrast)'}
        strokeOpacity="0.35"
        strokeWidth="1.25"
      />
      <path
        d="M20 9.5L28 13V19.6C28 24.45 24.6 28.85 20 30.25C15.4 28.85 12 24.45 12 19.6V13L20 9.5Z"
        stroke={isOnDark ? '#FFFFFF' : 'var(--bis-accent-contrast)'}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M20 14.2V25.2M16 19.5H24"
        stroke={isOnDark ? '#E0AA50' : 'var(--bis-accent-contrast)'}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
