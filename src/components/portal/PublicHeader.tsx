'use client';

import * as React from 'react';
import Link from 'next/link';
import { AnimatePresence, m, useMotionValueEvent, useScroll } from 'motion/react';
import { LogIn, Menu, X } from 'lucide-react';
import { BarangaySealLogo } from '@/components/layout/BarangaySealLogo';
import { AppButton, ThemeToggle } from '@/components/ui';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  BUTTON_HOVER_LIFT,
  BUTTON_TAP_PRESS,
  createStaggerContainerVariants,
  EDITORIAL_EASE,
  staggerItemVariants,
} from './motion';

export interface PublicHeaderProps {
  barangayName: string;
  locationLabel: string;
}

const NAV_LINKS = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'announcements', label: 'News & Announcements', href: '#announcements' },
  { id: 'events', label: 'Events', href: '#events' },
  { id: 'programs', label: 'Programs', href: '#programs' },
  { id: 'services', label: 'Services', href: '#services' },
  { id: 'contact', label: 'Contact', href: '#contact' },
] as const;

/**
 * Sticky public-facing portal header with section scroll-spy, mobile drawer,
 * shared theme toggle, and direct navigation to the admin portal.
 */
export function PublicHeader({
  barangayName,
  locationLabel,
}: PublicHeaderProps) {
  const { isAuthenticated } = useAuth();
  const [activeId, setActiveId] = React.useState<string>('home');
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const nextScrolled = latest > 12;
    setIsScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled));
  });

  React.useEffect(() => {
    const sectionIds = NAV_LINKS.map((item) => item.id);
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0.1, 0.35] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-200 ${
          isScrolled
            ? 'border-bis-border-strong bg-bis-surface/96 shadow-[var(--bis-shadow-md)]'
            : 'border-bis-border bg-bis-surface/90 shadow-none'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Barangay Seal & Portal Identity */}
          <Link
            href="#home"
            onClick={() => setActiveId('home')}
            className="flex min-w-0 items-center gap-2.5 rounded-lg transition-opacity duration-150 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-bis-accent"
          >
            <BarangaySealLogo className="h-9 w-9 shrink-0" />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold tracking-tight text-bis-text">
                {barangayName}
              </p>
              <p className="truncate text-[11px] text-bis-muted">
                Community Portal • {locationLabel}
              </p>
            </div>
          </Link>

          {/* Desktop Section Navigation */}
          <nav
            aria-label="Public portal navigation"
            className="hidden xl:flex items-center gap-1"
          >
            {NAV_LINKS.map((item) => {
              const isActive = activeId === item.id;
              return (
                <m.a
                  key={item.id}
                  href={item.href}
                  onClick={() => setActiveId(item.id)}
                  aria-current={isActive ? 'location' : undefined}
                  whileHover={{ y: -1 }}
                  whileTap={BUTTON_TAP_PRESS}
                  transition={{ duration: 0.16, ease: EDITORIAL_EASE }}
                  className={`relative rounded-lg px-2.5 py-1.5 text-[13px] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-bis-accent ${
                    isActive
                      ? 'font-semibold text-bis-accent dark:text-[#93B9E6]'
                      : 'font-medium text-bis-muted hover:bg-bis-surface-subtle hover:text-bis-text'
                  }`}
                >
                  {isActive && (
                    <m.span
                      layoutId="portal-nav-active-pill"
                      transition={{ duration: 0.24, ease: EDITORIAL_EASE }}
                      className="absolute inset-0 rounded-lg bg-bis-accent-soft"
                      aria-hidden="true"
                    >
                      <span className="absolute bottom-0.5 left-2.5 right-2.5 h-[2px] rounded-full bg-bis-amber" />
                    </m.span>
                  )}
                  <span className="relative z-10">{item.label}</span>
                </m.a>
              );
            })}
          </nav>

          {/* Right Controls: Theme Toggle, Login / Admin Portal, Mobile Menu */}
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />

            <m.div
              whileHover={BUTTON_HOVER_LIFT}
              whileTap={BUTTON_TAP_PRESS}
              transition={{ duration: 0.16, ease: EDITORIAL_EASE }}
              className="hidden sm:inline-flex"
            >
              <AppButton
                variant="primary"
                size="sm"
                href={isAuthenticated ? '/dashboard' : '/login'}
                startIcon={<LogIn className="h-3.5 w-3.5" />}
                className="transition-shadow duration-150 hover:shadow-[var(--bis-shadow-sm)]"
              >
                {isAuthenticated ? 'Admin Portal' : 'Staff Sign In'}
              </AppButton>
            </m.div>

            <m.button
              type="button"
              whileTap={BUTTON_TAP_PRESS}
              onClick={() => setMobileOpen(true)}
              aria-label="Open portal navigation menu"
              aria-expanded={mobileOpen}
              className="inline-flex xl:hidden h-9 w-9 items-center justify-center rounded-lg border border-bis-border bg-bis-surface text-bis-muted transition-colors hover:bg-bis-surface-subtle hover:text-bis-text"
            >
              <Menu className="h-[18px] w-[18px]" strokeWidth={1.85} />
            </m.button>
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Slide-Over Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <m.div
              key="portal-mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: EDITORIAL_EASE }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-[1px] xl:hidden"
              aria-hidden="true"
            />

            <m.aside
              key="portal-mobile-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile portal navigation"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.26, ease: EDITORIAL_EASE }}
              className="fixed inset-y-0 right-0 z-50 flex w-[290px] max-w-[86vw] flex-col border-l border-bis-border bg-bis-surface text-bis-text shadow-[var(--bis-shadow-md)] xl:hidden"
            >
              <div className="flex h-16 items-center justify-between border-b border-bis-border px-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <BarangaySealLogo className="h-8 w-8 shrink-0" />
                  <span className="truncate text-sm font-semibold">
                    {barangayName}
                  </span>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close portal navigation menu"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-bis-border text-bis-muted transition-colors hover:text-bis-text"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <m.nav
                aria-label="Mobile portal navigation links"
                initial="hidden"
                animate="visible"
                variants={createStaggerContainerVariants(0.035, 0.06)}
                className="flex-1 space-y-1 overflow-y-auto p-3"
              >
                {NAV_LINKS.map((item) => {
                  const isActive = activeId === item.id;
                  return (
                    <m.a
                      key={item.id}
                      href={item.href}
                      variants={staggerItemVariants}
                      onClick={() => {
                        setActiveId(item.id);
                        setMobileOpen(false);
                      }}
                      className={`block rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        isActive
                          ? 'bg-bis-accent-soft font-semibold text-bis-accent dark:text-[#93B9E6]'
                          : 'font-medium text-bis-muted hover:bg-bis-surface-subtle hover:text-bis-text'
                      }`}
                    >
                      {item.label}
                    </m.a>
                  );
                })}
              </m.nav>

              <div className="border-t border-bis-border p-4 space-y-3">
                <AppButton
                  variant="primary"
                  size="md"
                  href={isAuthenticated ? '/dashboard' : '/login'}
                  fullWidth
                  startIcon={<LogIn className="h-4 w-4" />}
                  onClick={() => setMobileOpen(false)}
                >
                  {isAuthenticated ? 'Open Admin Portal' : 'Staff Sign In'}
                </AppButton>
              </div>
            </m.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
