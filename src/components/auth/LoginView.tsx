'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogIn,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { BarangaySealLogo } from '@/components/layout/BarangaySealLogo';
import {
  AppButton,
  AppModal,
  CheckboxField,
  FormField,
  StatusBadge,
  TextInput,
  ThemeToggle,
  useToast,
} from '@/components/ui';
import { useAuth } from '@/lib/auth/AuthContext';
import { useBisStore } from '@/lib/store/BisStoreContext';

const QUICK_ROLE_IDS = [
  'usr-sec-001',
  'usr-pb-002',
  'usr-trs-003',
  'usr-clk-004',
  'usr-lup-005',
];

export function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/dashboard';

  const { db } = useBisStore();
  const { login, isAuthenticated, authChecked } = useAuth();
  const { showToast } = useToast();

  const [identifier, setIdentifier] = React.useState('m.santos@cebole-quezon.gov.ph');
  const [password, setPassword] = React.useState('bisdemo2026');
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<{
    identifier?: string;
    password?: string;
  }>({});
  const [forgotOpen, setForgotOpen] = React.useState(false);

  const demoAccounts = React.useMemo(
    () =>
      db.users.filter(
        (u) => u.status === 'Active' && QUICK_ROLE_IDS.includes(u.id)
      ),
    [db.users]
  );

  React.useEffect(() => {
    if (authChecked && isAuthenticated) {
      router.replace(
        redirectTarget.startsWith('/') && redirectTarget !== '/login'
          ? redirectTarget
          : '/dashboard'
      );
    }
  }, [authChecked, isAuthenticated, redirectTarget, router]);

  const handleSelectDemoAccount = (email: string, demoPassword: string) => {
    setIdentifier(email);
    setPassword(demoPassword);
    setErrorMsg(null);
    setFieldErrors({});
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: { identifier?: string; password?: string } = {};

    if (!identifier.trim()) {
      nextErrors.identifier = 'Please enter your staff email or username.';
    }
    if (!password) {
      nextErrors.password = 'Please enter your password.';
    } else if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setErrorMsg(null);
      return;
    }

    setFieldErrors({});
    setErrorMsg(null);
    setSubmitting(true);

    const result = await login(identifier, password, rememberMe);
    setSubmitting(false);

    if (!result.ok) {
      setErrorMsg(result.error ?? 'Unable to sign in.');
      return;
    }

    showToast({
      title: `Welcome, ${result.user?.fullName}`,
      message: `Signed in as ${result.user?.role} (Demo Session).`,
      tone: 'success',
    });

    const destination =
      redirectTarget.startsWith('/') && redirectTarget !== '/login'
        ? redirectTarget
        : '/dashboard';
    router.replace(destination);
  };

  return (
    <div className="min-h-screen w-full bg-bis-bg text-bis-text grid grid-cols-1 lg:grid-cols-12">
      {/* Left Branding Section (Deep Navy + Photographic Overlay) */}
      <aside className="relative hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-between overflow-hidden bg-bis-navy-deep p-10 text-white">
        <div className="pointer-events-none absolute inset-0">
          <Image
            src="/images/portal/hero-barangay-hall.jpg"
            alt="Barangay Hall civic complex"
            fill
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-[#0B192E]/94 via-[#173B63]/86 to-[#0F213B]/92"
          />
        </div>

        {/* Top Identity */}
        <div className="relative z-10 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-bis-highlight"
          >
            <BarangaySealLogo variant="on-dark" className="h-11 w-11 shrink-0" />
            <div>
              <p className="text-base font-semibold tracking-tight text-white">
                {db.settings.systemName}
              </p>
              <p className="text-xs font-medium text-[#F1C77B]">
                {db.settings.barangayName} • {db.settings.municipalityOrCity}
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Public Portal</span>
          </Link>
        </div>

        {/* Middle Platform Overview */}
        <div className="relative z-10 max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-500/15 px-3 py-1 text-[11px] font-semibold tracking-wide text-amber-200 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden="true" />
            Barangay Operations Workspace
          </div>

          <h1 className="text-3xl xl:text-4xl font-semibold tracking-tight leading-[1.15] text-white">
            Unified digital records, front-desk clearances, and community governance.
          </h1>

          <p className="text-[15px] leading-relaxed text-slate-200/90">
            Designed for barangay officials, records clerks, treasury staff, and the
            Lupon Tagapamayapa to manage resident profiles, certifications, blotter dockets,
            and financial records in one consistent platform.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="rounded-lg border border-white/15 bg-white/8 p-3.5 backdrop-blur-sm">
              <UserCheck className="h-4 w-4 text-amber-300" aria-hidden="true" />
              <p className="mt-2 text-xs font-semibold text-white">
                Community Registry
              </p>
              <p className="mt-0.5 text-[11px] text-slate-300">
                Residents, households &amp; sectoral masterlists
              </p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/8 p-3.5 backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4 text-amber-300" aria-hidden="true" />
              <p className="mt-2 text-xs font-semibold text-white">
                Clearances &amp; Lupon
              </p>
              <p className="mt-0.5 text-[11px] text-slate-300">
                Verified issuance, complaints &amp; blotter tracking
              </p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/8 p-3.5 backdrop-blur-sm">
              <Building2 className="h-4 w-4 text-amber-300" aria-hidden="true" />
              <p className="mt-2 text-xs font-semibold text-white">
                Treasury &amp; Reports
              </p>
              <p className="mt-0.5 text-[11px] text-slate-300">
                Collections, inventory, projects &amp; audit trail
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-t border-white/15 pt-4 text-xs text-slate-300">
          <span>
            {db.settings.barangayName} • {db.settings.provinceOrRegion}
          </span>
          <span className="font-mono text-[11px] text-slate-300/90">
            {db.settings.fiscalPeriod}
          </span>
        </div>
      </aside>

      {/* Right Login Workspace */}
      <main className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between px-4 py-6 sm:px-8 lg:px-10 xl:px-14 bg-bis-surface lg:border-l lg:border-bis-border">
        {/* Top Mobile Branding + Theme Switcher */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 lg:hidden">
            <BarangaySealLogo className="h-9 w-9 shrink-0" />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold text-bis-text">
                {db.settings.systemName}
              </p>
              <p className="truncate text-[11px] text-bis-muted">
                {db.settings.barangayName}
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="hidden lg:inline-flex items-center gap-1.5 text-xs font-medium text-bis-muted transition-colors hover:text-bis-text"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Community Portal</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="lg:hidden inline-flex items-center gap-1 rounded-lg border border-bis-border px-2.5 py-1.5 text-xs font-medium text-bis-muted hover:text-bis-text"
            >
              Portal
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* Centered Login Form */}
        <div className="mx-auto my-8 w-full max-w-[420px] space-y-6">
          <div>
            <StatusBadge label="Simulated Demo Session" tone="accent" />
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-bis-text">
              Sign in to BIS
            </h2>
            <p className="mt-1 text-sm text-bis-muted">
              Enter your barangay staff credentials or pick a demonstration role below.
            </p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg border border-bis-danger/35 bg-bis-danger-soft px-3.5 py-3 text-xs text-bis-danger dark:text-[#FCA5A5]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="leading-relaxed font-medium">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <FormField
              label="Email or Username"
              htmlFor="login-identifier"
              required
              error={fieldErrors.identifier}
            >
              <TextInput
                id="login-identifier"
                type="text"
                autoComplete="username"
                placeholder="e.g. m.santos@cebole-quezon.gov.ph or secretary"
                value={identifier}
                hasError={Boolean(fieldErrors.identifier)}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (fieldErrors.identifier) {
                    setFieldErrors((prev) => ({ ...prev, identifier: undefined }));
                  }
                }}
              />
            </FormField>

            <FormField
              label="Password"
              htmlFor="login-password"
              required
              error={fieldErrors.password}
            >
              <TextInput
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                hasError={Boolean(fieldErrors.password)}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-bis-muted transition-colors hover:bg-bis-border/50 hover:text-bis-text"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />
            </FormField>

            <div className="flex items-center justify-between gap-2 pt-0.5">
              <div className="flex-1">
                <CheckboxField
                  id="login-remember-me"
                  label="Remember this device"
                  checked={rememberMe}
                  onChange={setRememberMe}
                />
              </div>
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="shrink-0 text-xs font-semibold text-bis-accent hover:underline dark:text-[#93B9E6]"
              >
                Forgot password?
              </button>
            </div>

            <AppButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={submitting}
              disabled={submitting}
              startIcon={<LogIn className="h-4 w-4" />}
            >
              {submitting ? 'Signing In...' : 'Sign In to Workspace'}
            </AppButton>
          </form>

          {/* Sample Credentials Selector */}
          <div className="rounded-[10px] border border-bis-border bg-bis-surface-subtle p-3.5 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-bis-text">
                <KeyRound className="h-3.5 w-3.5 text-bis-accent dark:text-[#93B9E6]" />
                Demo Staff Accounts (Click to Autofill)
              </span>
              <span className="font-mono text-[10px] text-bis-muted">
                pw: bisdemo2026
              </span>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {demoAccounts.map((acc) => {
                const isSelected =
                  identifier.trim().toLowerCase() === acc.email.toLowerCase() ||
                  identifier.trim().toLowerCase() === acc.username.toLowerCase();

                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() =>
                      handleSelectDemoAccount(acc.email, acc.demoPassword)
                    }
                    className={`flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors ${
                      isSelected
                        ? 'border-bis-accent bg-bis-accent-soft/70'
                        : 'border-bis-border bg-bis-surface hover:border-bis-border-strong'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-bis-text">
                        {acc.fullName}
                      </p>
                      <p className="truncate font-mono text-[10.5px] text-bis-muted">
                        {acc.email} ({acc.username})
                      </p>
                    </div>
                    <StatusBadge
                      label={acc.role}
                      tone={isSelected ? 'accent' : 'neutral'}
                      dot={false}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Honest Demonstration Security Disclaimer */}
        <div className="mx-auto w-full max-w-[420px] flex items-start gap-2 rounded-lg border border-bis-border bg-bis-surface-subtle/70 px-3 py-2 text-[11px] text-bis-muted">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-bis-muted" />
          <p>
            Demonstration authentication uses seeded local sample accounts and browser
            storage only — not production-grade security or backend token verification.
          </p>
        </div>
      </main>

      {/* Forgot Password Modal (UI Only for Demo Phase) */}
      <AppModal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Password Recovery Assistance"
        eyebrow="Account Support"
        maxWidth="xs"
        footer={
          <AppButton variant="primary" onClick={() => setForgotOpen(false)}>
            Got It
          </AppButton>
        }
      >
        <div className="space-y-3 text-sm text-bis-muted leading-relaxed">
          <p>
            Self-service email password resets will connect to the Laravel authentication
            service in a future backend phase.
          </p>
          <div className="rounded-lg border border-bis-border bg-bis-surface-subtle p-3 text-xs space-y-1">
            <p className="font-semibold text-bis-text">
              Demonstration Credentials
            </p>
            <p>
              All seeded active staff accounts use password{' '}
              <code className="rounded bg-bis-surface px-1.5 py-0.5 font-mono font-semibold text-bis-text">
                bisdemo2026
              </code>{' '}
              or select any staff role from the quick-fill panel on the sign-in screen.
            </p>
          </div>
        </div>
      </AppModal>
    </div>
  );
}
