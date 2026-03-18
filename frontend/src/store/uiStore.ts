import { create } from 'zustand'

type ThemeMode = 'light' | 'dark' | 'system'

type UiState = {
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
}

const THEME_KEY = 'itx_theme'

function readStoredTheme(): ThemeMode {
  const raw = localStorage.getItem(THEME_KEY)
  if (raw === 'light' || raw === 'dark' || raw === 'system') return raw
  return 'system'
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement
  const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  const shouldUseDark = theme === 'dark' || (theme === 'system' && systemDark)
  root.classList.toggle('dark', shouldUseDark)
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  theme: typeof window === 'undefined' ? 'system' : readStoredTheme(),
  setTheme: (theme) => {
    localStorage.setItem(THEME_KEY, theme)
    applyTheme(theme)
    set({ theme })
  },
}))

export function initTheme() {
  const theme = readStoredTheme()
  applyTheme(theme)
}

