'use client';

import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider, useColorScheme } from '@mui/material/styles';
import { useIsMounted } from '@/hooks/useIsMounted';
import { bisMuiTheme } from './muiTheme';
import { THEME_STORAGE_KEYS } from './tokens';

export type ThemeMode = 'light' | 'dark' | 'system';

interface BisThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Root theme provider integrating Next.js App Router Emotion SSR cache (with CSS layers
 * for clean Tailwind v4 precedence) and MUI CSS-variable color schemes.
 */
export function BisThemeProvider({ children }: BisThemeProviderProps) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <MuiThemeProvider
        theme={bisMuiTheme}
        defaultMode="system"
        modeStorageKey={THEME_STORAGE_KEYS.mode}
        colorSchemeStorageKey={THEME_STORAGE_KEYS.colorScheme}
        disableTransitionOnChange
      >
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </AppRouterCacheProvider>
  );
}

/**
 * Exposes the persisted theme preference ('light' | 'dark' | 'system'),
 * resolved visual scheme ('light' | 'dark'), and setter with SSR safety.
 */
export function useThemePreference() {
  const { mode, setMode, systemMode, colorScheme } = useColorScheme();
  const mounted = useIsMounted();

  const currentMode: ThemeMode = mounted && mode ? mode : 'system';
  const resolvedTheme: 'light' | 'dark' =
    mounted && (colorScheme === 'dark' || (mode === 'system' && systemMode === 'dark'))
      ? 'dark'
      : 'light';

  return {
    mounted,
    mode: currentMode,
    resolvedTheme,
    setMode: (nextMode: ThemeMode) => setMode(nextMode),
  };
}
