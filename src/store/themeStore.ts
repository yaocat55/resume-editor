/**
 * themeStore — 深色/浅色主题状态
 *
 * 持久化到 localStorage（key: app-theme）。
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeStore {
  mode: 'light' | 'dark'
  toggleMode: () => void
}

const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'light',
      toggleMode: () => set((state) => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
    }),
    { name: 'resume-theme-mode' }
  )
)

export default useThemeStore
