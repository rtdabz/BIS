import * as React from 'react';
import Image from 'next/image';
import { Camera } from 'lucide-react';

export interface PortalMediaProps {
  src?: string;
  alt: string;
  placeholderLabel?: string;
  aspectClass?: string;
  priority?: boolean;
  zoomOnHover?: boolean;
  sizes?: string;
  className?: string;
}

/**
 * Editorial media frame supporting Next.js optimized community photographs
 * and clean, restrained placeholder slots when an asset is pending replacement.
 */
export function PortalMedia({
  src,
  alt,
  placeholderLabel = 'Community Photo Placeholder',
  aspectClass = 'aspect-[16/10]',
  priority = false,
  zoomOnHover = false,
  sizes = '(max-width: 768px) 100vw, 50vw',
  className = '',
}: PortalMediaProps) {
  if (src) {
    return (
      <div
        className={`relative overflow-hidden bg-bis-surface-subtle ${aspectClass} ${className}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          loading={priority ? 'eager' : undefined}
          fetchPriority={priority ? 'high' : undefined}
          sizes={sizes}
          className={`object-cover ${
            zoomOnHover
              ? 'transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.03] motion-reduce:transition-none'
              : ''
          }`}
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex flex-col items-center justify-center gap-2 bg-bis-surface-subtle border-b border-bis-border px-4 text-center ${aspectClass} ${className}`}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-bis-border bg-bis-surface text-bis-muted">
        <Camera className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <span className="text-[11px] font-medium text-bis-muted">
        {placeholderLabel}
      </span>
    </div>
  );
}
