'use client';

import * as React from 'react';
import { ToastProvider } from '@/components/ui';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { BisStoreProvider } from '@/lib/store/BisStoreContext';

/**
 * Composes client-side notification, centralized demonstration data store,
 * and simulated authentication providers for the entire BIS application.
 */
export function BisAppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <BisStoreProvider>
        <AuthProvider>{children}</AuthProvider>
      </BisStoreProvider>
    </ToastProvider>
  );
}
