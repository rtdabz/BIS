import type { Variants } from 'motion/react';

/**
 * Refined editorial cubic-bezier curve for natural SaaS motion without bounce.
 */
export const EDITORIAL_EASE = [0.22, 1, 0.36, 1] as const;

export const COUNTER_EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Permissive once-only viewport trigger so tall sections on mobile reveal reliably.
 */
export const PORTAL_VIEWPORT = { once: true, amount: 0.08 } as const;

export const STATS_VIEWPORT = { once: true, amount: 0.25 } as const;

export const CARD_HOVER_TRANSITION = {
  duration: 0.2,
  ease: EDITORIAL_EASE,
} as const;

export const CARD_HOVER_LIFT = { y: -2 } as const;

export const BUTTON_HOVER_LIFT = { y: -1 } as const;

export const BUTTON_TAP_PRESS = { scale: 0.985 } as const;

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35, ease: EDITORIAL_EASE },
  },
};

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: EDITORIAL_EASE },
  },
};

export const scaleRevealVariants: Variants = {
  hidden: { opacity: 0, scale: 0.975 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.44, ease: EDITORIAL_EASE },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.36, ease: EDITORIAL_EASE },
  },
};

export function createStaggerContainerVariants(
  staggerChildren = 0.055,
  delayChildren = 0.03
): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
  };
}
