import { createTheme } from '@mui/material/styles'

export const getTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    ...(mode === 'light' ? {
      primary: { main: '#6366f1', light: '#eef2ff', dark: '#4f46e5', contrastText: '#ffffff' },
      secondary: { main: '#ec4899', light: '#fdf2f8', dark: '#db2777' },
      background: { default: '#f4f5f7', paper: '#ffffff' },
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
    subtitle2: { fontWeight: 600, fontSize: '0.875rem', letterSpacing: 0 },
    body2: { fontSize: '0.8125rem' },
    caption: { fontSize: '0.75rem', fontWeight: 500 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined', fullWidth: true },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { size: 'small', disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 24, px: 3 },
        sizeSmall: { borderRadius: 18, px: 2 },
        containedPrimary: { boxShadow: '0 2px 8px rgba(99,102,241,0.25)' },
        containedSecondary: { boxShadow: '0 2px 8px rgba(236,72,153,0.25)' },
      },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: { borderRadius: 18, borderColor: mode === 'light' ? '#e8ecf0' : '#1e293b' },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500, borderRadius: 8 },
        sizeSmall: { borderRadius: 6, height: 24 },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { height: 4, borderRadius: 4 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none', fontWeight: 500, minHeight: 48, borderRadius: '12px 12px 0 0',
          '&.Mui-selected': { fontWeight: 600 },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: { tooltip: { borderRadius: 8, fontSize: '0.75rem', padding: '6px 12px' } },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 24 } },
    },
    MuiMenu: {
      styleOverrides: { paper: { borderRadius: 16 } },
    },
    MuiSlider: {
      styleOverrides: {
        root: { borderRadius: 10 },
        thumb: { width: 20, height: 20 },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: { borderRadius: 16 },
        track: { borderRadius: 16 },
        thumb: { color: mode === 'light' ? '#fff' : '#94a3b8' },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
  },
})
