import type { Metadata } from 'next';
import { Geist_Mono, Inter } from 'next/font/google';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { BisAppProviders } from '@/components/layout/BisAppProviders';
import { BisThemeProvider } from '@/theme/ThemeProvider';
import { THEME_STORAGE_KEYS } from '@/theme/tokens';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Barangay Information System (BIS) — Barangay Cebole',
  description:
    'Community information portal and administrative platform for Philippine local barangay operations.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <InitColorSchemeScript
          attribute={THEME_STORAGE_KEYS.attribute}
          modeStorageKey={THEME_STORAGE_KEYS.mode}
          colorSchemeStorageKey={THEME_STORAGE_KEYS.colorScheme}
          defaultMode="system"
        />
      </head>
      <body className="min-h-full bg-bis-bg text-bis-text" suppressHydrationWarning>
        <BisThemeProvider>
          <BisAppProviders>{children}</BisAppProviders>
        </BisThemeProvider>
      </body>
    </html>
  );
}
