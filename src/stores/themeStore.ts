import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ThemeStore = {
  isDark: boolean
  toggleTheme: () => void
  init: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDark: false,
      toggleTheme: () => {
        set((state) => {
          const newTheme = !state.isDark
          if (newTheme) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
          return { isDark: newTheme }
        })
      },
      init: () => {
        set((state) => {
          if (state.isDark) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
          return state
        })
      },
    }),
    {
      name: 'theme-storage',
    }
  )
)
