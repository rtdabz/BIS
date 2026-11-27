'use client';

import * as React from 'react';
import {
  animate,
  domMax,
  LazyMotion,
  m,
  MotionConfig,
  useInView,
} from 'motion/react';
import {
  CARD_HOVER_LIFT,
  CARD_HOVER_TRANSITION,
  COUNTER_EASE,
  createStaggerContainerVariants,
  EDITORIAL_EASE,
  fadeInVariants,
  fadeUpVariants,
  PORTAL_VIEWPORT,
  scaleRevealVariants,
  staggerItemVariants,
  STATS_VIEWPORT,
} from './variants';

export interface PortalMotionProviderProps {
  children: React.ReactNode;
}

/**
 * Configures lightweight Motion runtime features and respects the user's
 * system reduced-motion setting across the public landing portal.
 */
export function PortalMotionProvider({ children }: PortalMotionProviderProps) {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

const REVEAL_VARIANTS = {
  fadeUp: fadeUpVariants,
  fadeIn: fadeInVariants,
  scale: scaleRevealVariants,
} as const;

export interface PortalRevealProps {
  children: React.ReactNode;
  variant?: keyof typeof REVEAL_VARIANTS;
  delay?: number;
  immediate?: boolean;
  className?: string;
}

/**
 * Subtle viewport-triggered (or immediate above-the-fold) reveal container
 * prioritizing GPU transform and opacity transitions.
 */
export function PortalReveal({
  children,
  variant = 'fadeUp',
  delay = 0,
  immediate = false,
  className = '',
}: PortalRevealProps) {
  const baseVariant = REVEAL_VARIANTS[variant];
  const variants =
    delay > 0
      ? {
          hidden: baseVariant.hidden,
          visible: {
            ...baseVariant.visible,
            transition: {
              duration: variant === 'scale' ? 0.44 : 0.38,
              delay,
              ease: EDITORIAL_EASE,
            },
          },
        }
      : baseVariant;

  if (immediate) {
    return (
      <m.div
        initial="hidden"
        animate="visible"
        variants={variants}
        className={className}
      >
        {children}
      </m.div>
    );
  }

  return (
    <m.div
      initial="hidden"
      whileInView="visible"
      viewport={PORTAL_VIEWPORT}
      variants={variants}
      className={className}
    >
      {children}
    </m.div>
  );
}

export interface PortalStaggerGridProps {
  children: React.ReactNode;
  stagger?: number;
  delayChildren?: number;
  immediate?: boolean;
  className?: string;
}

/**
 * Staggers child card entrances once upon entering the viewport.
 */
export function PortalStaggerGrid({
  children,
  stagger = 0.055,
  delayChildren = 0.03,
  immediate = false,
  className = '',
}: PortalStaggerGridProps) {
  const variants = React.useMemo(
    () => createStaggerContainerVariants(stagger, delayChildren),
    [stagger, delayChildren]
  );

  if (immediate) {
    return (
      <m.div
        initial="hidden"
        animate="visible"
        variants={variants}
        className={className}
      >
        {children}
      </m.div>
    );
  }

  return (
    <m.div
      initial="hidden"
      whileInView="visible"
      viewport={PORTAL_VIEWPORT}
      variants={variants}
      className={className}
    >
      {children}
    </m.div>
  );
}

export interface PortalStaggerItemProps {
  children: React.ReactNode;
  hoverLift?: boolean;
  className?: string;
}

/**
 * Individual staggered item with optional restrained hover elevation.
 */
export function PortalStaggerItem({
  children,
  hoverLift = false,
  className = '',
}: PortalStaggerItemProps) {
  return (
    <m.div
      variants={staggerItemVariants}
      whileHover={hoverLift ? CARD_HOVER_LIFT : undefined}
      transition={hoverLift ? CARD_HOVER_TRANSITION : undefined}
      className={className}
    >
      {children}
    </m.div>
  );
}

interface ParsedMetricValue {
  prefix: string;
  target: number;
  decimals: number;
  useGrouping: boolean;
  suffix: string;
}

function parseMetricValue(raw: string): ParsedMetricValue | null {
  const match = raw.trim().match(/^([^\d-]*)(-?[\d,]+(?:\.\d+)?)(.*)$/);
  if (!match) return null;

  const [, prefix, numericToken, suffix] = match;
  const normalized = numericToken.replace(/,/g, '');
  const target = Number(normalized);
  if (!Number.isFinite(target)) return null;

  const decimalIndex = normalized.indexOf('.');
  const decimals = decimalIndex >= 0 ? normalized.length - decimalIndex - 1 : 0;

  return {
    prefix,
    target,
    decimals,
    useGrouping: numericToken.includes(','),
    suffix,
  };
}

export interface AnimatedStatNumberProps {
  value: string;
  className?: string;
}

/**
 * Counts up formatted statistics once when scrolled into view while keeping
 * SSR output deterministic and respecting prefers-reduced-motion.
 */
export function AnimatedStatNumber({
  value,
  className = '',
}: AnimatedStatNumberProps) {
  const spanRef = React.useRef<HTMLSpanElement | null>(null);
  const hasAnimatedRef = React.useRef(false);
  const isInView = useInView(spanRef, STATS_VIEWPORT);

  React.useEffect(() => {
    if (!isInView || hasAnimatedRef.current) {
      return;
    }

    hasAnimatedRef.current = true;
    const node = spanRef.current;
    if (!node) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      node.textContent = value;
      return;
    }

    const parsed = parseMetricValue(value);
    if (!parsed) {
      node.textContent = value;
      return;
    }

    const formatter = new Intl.NumberFormat('en-US', {
      useGrouping: parsed.useGrouping,
      minimumFractionDigits: parsed.decimals,
      maximumFractionDigits: parsed.decimals,
    });

    const controls = animate(0, parsed.target, {
      duration: 0.85,
      ease: COUNTER_EASE,
      onUpdate: (latest) => {
        const rounded =
          parsed.decimals > 0
            ? Number(latest.toFixed(parsed.decimals))
            : Math.round(latest);
        node.textContent = `${parsed.prefix}${formatter.format(rounded)}${parsed.suffix}`;
      },
      onComplete: () => {
        node.textContent = value;
      },
    });

    return () => {
      controls.stop();
      node.textContent = value;
    };
  }, [isInView, value]);

  return (
    <span ref={spanRef} aria-label={value} className={className}>
      {value}
    </span>
  );
}
