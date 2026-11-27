'use client';

import * as React from 'react';

const emptySubscribe = () => () => {};

/**
 * Hydration-safe client mount check without triggering cascading renders in effects.
 */
export function useIsMounted(): boolean {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
