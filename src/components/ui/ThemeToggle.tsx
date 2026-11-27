'use client';

import * as React from 'react';
import Tooltip from '@mui/material/Tooltip';
import { Monitor, Moon, Sun } from 'lucide-react';
import { type ThemeMode, useThemePreference } from '@/theme/ThemeProvider';

const THEME_OPTIONS: {
  value: ThemeMode;
  label: string;
  icon: typeof Sun;
}[] = [
  { value: 'light', label: 'Light mode', icon: Sun },
  { value: 'dark', label: 'Dark mode', icon: Moon },
  { value: 'system', label: 'System preference', icon: Monitor },
];

/**
 * Three-way Light / Dark / System theme switcher persisted via localStorage
 * without hydration flicker.
 */
export function ThemeToggle() {
  const { mounted, mode, setMode } = useThemePreference();

  return (
    <div
      role="group"
      aria-label="Theme preference"
      className="inline-flex items-center rounded-lg border border-bis-border bg-bis-surface-subtle p-0.5"
    >
      {THEME_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isSelected = mounted && mode === option.value;

        return (
          <Tooltip key={option.value} title={option.label} arrow>
            <button
              type="button"
              onClick={() => setMode(option.value)}
              aria-label={option.label}
              aria-pressed={isSelected}
              className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-bis-accent ${
                isSelected
                  ? 'bg-bis-accent text-bis-accent-contrast shadow-[var(--bis-shadow-sm)]'
                  : 'text-bis-muted hover:text-bis-text'
              }`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
