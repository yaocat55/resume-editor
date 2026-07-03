import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n from '../i18n'

interface LocaleStore {
  locale: 'zh' | 'en'
  setLocale: (locale: 'zh' | 'en') => void
  toggleLocale: () => void
}

const useLocaleStore = create<LocaleStore>()(
  persist(
    (set, get) => ({
      locale: 'zh',
      setLocale: (locale) => {
        i18n.changeLanguage(locale)
        set({ locale })
      },
      toggleLocale: () => {
        const next = get().locale === 'zh' ? 'en' : 'zh'
        i18n.changeLanguage(next)
        set({ locale: next })
      },
    }),
    { name: 'app-locale' }
  )
)

export default useLocaleStore
