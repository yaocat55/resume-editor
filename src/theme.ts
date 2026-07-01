import { createTheme } from '@mui/material/styles'

export const getTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    ...(mode === 'light' ? {
      primary: { main: '#6366f1', light: '#eef2ff', dark: '#4f46e5', contrastText: '#ffffff' },
      secondary: { main: '#ec4899', light: '#fdf2f8', dark: '#db2777' },
      background: { default: '#f1f2f6', paper: '#ffffff' },
      text: { primary: '#1e293b', secondary: '#64748b', disabled: '#94a3b8' },
      divider: '#e2e8f0',
      error: { main: '#ef4444', light: '#fef2f2' },
      info: { main: '#0ea5e9', light: '#f0f9ff' },
      success: { main: '#10b981', light: '#ecfdf5' },
      warning: { main: '#f59e0b', light: '#fffbeb' },
    } : {
      primary: { main: '#818cf8', light: '#1e1b4b', dark: '#a5b4fc', contrastText: '#0f172a' },
      secondary: { main: '#f472b6', light: '#2e0f22', dark: '#f9a8d4' },
      background: { default: '#0d1117', paper: '#161b22' },
      text: { primary: '#e2e8f0', secondary: '#94a3b8', disabled: '#475569' },
      divider: '#1e293b',
      error: { main: '#f87171', light: '#2e0f0f' },
      info: { main: '#38bdf8', light: '#0f202e' },
      success: { main: '#34d399', light: '#0f1e17' },
      warning: { main: '#fbbf24', light: '#2e1f0a' },
    }),
  },
  typography: {
    fontFamily: [
      '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"PingFang SC"',
      '"Hiragino Sans GB"', '"Microsoft YaHei"', 'sans-serif',
    ].join(','),
    h6: { fontWeight: 600, fontSize: '1rem', letterSpacing: 0 },
    subtitle2: { fontWeight: 600, fontSize: '0.875rem', letterSpacing: 0.1 },
    body2: { fontSize: '0.8125rem', letterSpacing: 0.25 },
    caption: { fontSize: '0.75rem', letterSpacing: 0.4, fontWeight: 400 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0.5 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined', fullWidth: true },
    },
    MuiButton: {
      defaultProps: { size: 'small', disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 10 },
        containedPrimary: {
          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
          color: '#fff',
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #ec4899, #db2777)',
          color: '#fff',
        },
      },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          borderRadius: 12,
          borderLeft: '3px solid',
          borderLeftColor: mode === 'light' ? '#6366f1' : '#818cf8',
          ...(mode === 'light'
            ? { boxShadow: '0 1px 4px rgba(99,102,241,0.06)', borderColor: '#e2e8f0' }
            : { boxShadow: '0 1px 4px rgba(0,0,0,0.2)', borderColor: '#1e293b' }),
          '& + &': {
            marginTop: '10px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 500 } },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { height: 3, borderRadius: '3px 3px 0 0' },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none', fontWeight: 500, minHeight: 48,
          '&.Mui-selected': { fontWeight: 600 },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: { tooltip: { fontSize: '0.75rem', borderRadius: 6 } },
    },
    MuiSwitch: {
      styleOverrides: {
        thumb: {
          ...(mode === 'light'
            ? { color: '#fff' }
            : { color: '#94a3b8' }),
        },
      },
    },
  },
})
