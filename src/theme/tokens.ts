/**
 * Centralized Design Tokens for the Barangay Information System (BIS).
 * Strictly follows the Navy Blue + Slate + White 60/30/10 palette rule.
 */

export const THEME_STORAGE_KEYS = {
  mode: 'bis-theme-mode',
  colorScheme: 'bis-color-scheme',
  attribute: 'data-theme',
  sidebarCollapsed: 'bis-sidebar-collapsed',
} as const;

export const LAYOUT_DIMENSIONS = {
  sidebarExpandedWidth: 264,
  sidebarCollapsedWidth: 72,
  headerHeight: 64,
} as const;

export const LIGHT_TOKENS = {
  // 60 / 30 / 10 Core SaaS Hierarchy
  background: '#F1F4F8',
  surface: '#FFFFFF',
  surfaceSubtle: '#F8FAFC',
  sidebarBackground: '#173B63',
  accent: '#173B63',
  accentHover: '#112C4A',
  accentSoft: 'rgba(23, 59, 99, 0.08)',
  accentContrast: '#FFFFFF',
  highlight: '#D69A38',
  highlightSoft: 'rgba(214, 154, 56, 0.14)',

  // Supporting Colors
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',

  // Semantic Status Colors (status indicators only)
  success: '#15803D',
  successSoft: 'rgba(21, 128, 61, 0.10)',
  warning: '#8A5A10',
  warningSoft: 'rgba(214, 154, 56, 0.14)',
  danger: '#B91C1C',
  dangerSoft: 'rgba(185, 28, 28, 0.10)',
} as const;

export const DARK_TOKENS = {
  // 60 / 30 / 10 Core SaaS Hierarchy
  background: '#111827',
  surface: '#1E293B',
  surfaceSubtle: '#172031',
  sidebarBackground: '#0C1626',
  accent: '#5285C1',
  accentHover: '#6696CE',
  accentSoft: 'rgba(82, 133, 193, 0.16)',
  accentContrast: '#0F172A',
  highlight: '#E0AA50',
  highlightSoft: 'rgba(224, 170, 80, 0.16)',

  // Supporting Colors
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  border: '#334155',
  borderStrong: '#475569',

  // Semantic Status Colors (status indicators only)
  success: '#4ADE80',
  successSoft: 'rgba(74, 222, 128, 0.14)',
  warning: '#E0AA50',
  warningSoft: 'rgba(224, 170, 80, 0.16)',
  danger: '#F87171',
  dangerSoft: 'rgba(248, 113, 113, 0.14)',
} as const;

/**
 * CSS variable references for Recharts, SVG charts, and inline theme-reactive styles.
 */
export const CSS_VAR_TOKENS = {
  background: 'var(--bis-bg)',
  surface: 'var(--bis-surface)',
  surfaceSubtle: 'var(--bis-surface-subtle)',
  accent: 'var(--bis-accent)',
  accentHover: 'var(--bis-accent-hover)',
  accentSoft: 'var(--bis-accent-soft)',
  accentContrast: 'var(--bis-accent-contrast)',
  textPrimary: 'var(--bis-text-primary)',
  textSecondary: 'var(--bis-text-secondary)',
  border: 'var(--bis-border)',
  borderStrong: 'var(--bis-border-strong)',
  success: 'var(--bis-success)',
  warning: 'var(--bis-warning)',
  danger: 'var(--bis-danger)',
  chartPrimary: 'var(--bis-chart-primary)',
  chartSecondary: 'var(--bis-chart-secondary)',
  chartTertiary: 'var(--bis-chart-tertiary)',
  chartQuaternary: 'var(--bis-chart-quaternary)',
} as const;
