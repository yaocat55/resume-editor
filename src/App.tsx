/**
 * App — 应用根组件
 *
 * 提供 ThemeProvider（浅色/深色）、CssBaseline、日期本地化（dayjs）。
 * 子组件 EditorLayout 是主布局。
 */
import React from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { getTheme } from './theme'
import useThemeStore from './store/themeStore'
import EditorLayout from './components/layout/EditorLayout'

const App: React.FC = () => {
  const mode = useThemeStore((s) => s.mode)
  const theme = React.useMemo(() => getTheme(mode), [mode])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <EditorLayout />
      </LocalizationProvider>
    </ThemeProvider>
  )
}

export default App
