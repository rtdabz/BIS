import { createTheme } from '@mui/material/styles';
import { DARK_TOKENS, LIGHT_TOKENS, THEME_STORAGE_KEYS } from './tokens';

/**
 * Material UI theme configured with CSS theme variables so Light, Dark, and System
 * preferences switch instantaneously without hydration flicker and stay in sync
 * with Tailwind CSS tokens.
 */
export const bisMuiTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: THEME_STORAGE_KEYS.attribute,
    cssVarPrefix: 'bis-mui',
  },
  defaultColorScheme: 'light',
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: LIGHT_TOKENS.accent,
          dark: LIGHT_TOKENS.accentHover,
          contrastText: LIGHT_TOKENS.accentContrast,
        },
        secondary: {
          main: LIGHT_TOKENS.textSecondary,
          contrastText: '#FFFFFF',
        },
        background: {
          default: LIGHT_TOKENS.background,
          paper: LIGHT_TOKENS.surface,
        },
        text: {
          primary: LIGHT_TOKENS.textPrimary,
          secondary: LIGHT_TOKENS.textSecondary,
        },
        divider: LIGHT_TOKENS.border,
        success: {
          main: LIGHT_TOKENS.success,
        },
        warning: {
          main: LIGHT_TOKENS.warning,
        },
        error: {
          main: LIGHT_TOKENS.danger,
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: DARK_TOKENS.accent,
          light: DARK_TOKENS.accentHover,
          contrastText: DARK_TOKENS.accentContrast,
        },
        secondary: {
          main: DARK_TOKENS.textSecondary,
          contrastText: DARK_TOKENS.background,
        },
        background: {
          default: DARK_TOKENS.background,
          paper: DARK_TOKENS.surface,
        },
        text: {
          primary: DARK_TOKENS.textPrimary,
          secondary: DARK_TOKENS.textSecondary,
        },
        divider: DARK_TOKENS.border,
        success: {
          main: DARK_TOKENS.success,
        },
        warning: {
          main: DARK_TOKENS.warning,
        },
        error: {
          main: DARK_TOKENS.danger,
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },
  typography: {
    fontFamily: 'var(--font-inter), ui-sans-serif, system-ui, -apple-system, sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: 'var(--bis-bg)',
          color: 'var(--bis-text-primary)',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'var(--bis-surface)',
          color: 'var(--bis-text-primary)',
          borderColor: 'var(--bis-border)',
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'var(--bis-surface)',
          border: '1px solid var(--bis-border)',
          boxShadow: 'var(--bis-shadow-sm)',
          borderRadius: 10,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'var(--bis-text-primary)',
          color: 'var(--bis-surface)',
          fontSize: '0.75rem',
          fontWeight: 500,
          padding: '6px 10px',
          borderRadius: 6,
          boxShadow: 'var(--bis-shadow-md)',
        },
        arrow: {
          color: 'var(--bis-text-primary)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          border: '1px solid var(--bis-border)',
          boxShadow: 'var(--bis-shadow-md)',
          borderRadius: 10,
          marginTop: 6,
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          border: '1px solid var(--bis-border)',
          boxShadow: 'var(--bis-shadow-md)',
          borderRadius: 10,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          border: '1px solid var(--bis-border)',
          boxShadow: 'var(--bis-shadow-md)',
          borderRadius: 12,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: 'var(--bis-surface)',
          borderRight: '1px solid var(--bis-border)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'var(--bis-border)',
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: 'var(--bis-border)',
        },
      },
    },
  },
});
