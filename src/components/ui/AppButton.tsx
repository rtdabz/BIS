'use client';

import * as React from 'react';
import Button, { type ButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Link from 'next/link';

export type AppButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type AppButtonSize = 'sm' | 'md' | 'lg';

export interface AppButtonProps
  extends Omit<ButtonProps, 'variant' | 'size' | 'color'> {
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  loading?: boolean;
  href?: string;
}

const VARIANT_CLASSES: Record<AppButtonVariant, string> = {
  primary:
    'bg-bis-accent text-bis-accent-contrast hover:bg-bis-accent-hover border border-transparent',
  secondary:
    'bg-bis-accent-soft text-bis-accent dark:text-bis-text hover:bg-bis-border border border-transparent',
  outline:
    'bg-bis-surface text-bis-text border border-bis-border hover:bg-bis-surface-subtle hover:border-bis-border-strong',
  ghost:
    'bg-transparent text-bis-muted hover:text-bis-text hover:bg-bis-surface-subtle border border-transparent',
  danger:
    'bg-bis-danger-soft text-bis-danger border border-bis-danger/25 hover:bg-bis-danger/20',
};

const SIZE_CLASSES: Record<AppButtonSize, string> = {
  sm: 'px-2.5 py-1.5 text-xs min-h-[30px]',
  md: 'px-3.5 py-2 text-sm min-h-[36px]',
  lg: 'px-4 py-2.5 text-sm min-h-[42px]',
};

/**
 * Standardized button built on MUI Button + Tailwind tokens to keep interactions,
 * focus rings, and Navy/Slate surfaces consistent across the app.
 */
export function AppButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  startIcon,
  children,
  className = '',
  href,
  ...props
}: AppButtonProps) {
  const resolvedStartIcon = loading ? (
    <CircularProgress size={14} color="inherit" />
  ) : (
    startIcon
  );

  const buttonClasses = `inline-flex items-center justify-center gap-1.5 rounded-lg font-medium normal-case tracking-normal transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bis-accent disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`;

  if (href) {
    return (
      <Button
        component={Link}
        href={href}
        disableRipple={false}
        disabled={disabled || loading}
        startIcon={resolvedStartIcon}
        className={buttonClasses}
        {...props}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button
      disabled={disabled || loading}
      startIcon={resolvedStartIcon}
      className={buttonClasses}
      {...props}
    >
      {children}
    </Button>
  );
}
