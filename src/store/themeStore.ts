/**
 * themeStore — 深色/浅色主题状态
 *
 * 持久化到 localStorage（key: app-theme）。
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeStore {
  mode: 'light' | 'dark'
  fontFamily: string
  fontSize: number
  toggleMode: () => void
  setFontFamily: (font: string) => void
  setFontSize: (size: number) => void
}

const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'light',
      fontFamily: "'PingFang SC', 'Microsoft YaHei', -apple-system, sans-serif",
      fontSize: 14,
      toggleMode: () => set((state) => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setFontSize: (fontSize) => set({ fontSize }),
    }),
    { name: 'resume-theme-mode' }
  )
)

export default useThemeStore
