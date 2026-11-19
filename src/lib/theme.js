import { useSyncExternalStore } from 'react'

// Light or dark appearance, remembered per browser (light until the user switches).
// index.html applies the saved choice before the app loads so the page never
// flashes the wrong theme; keep THEME_KEY in sync with the inline script there.
export const THEME_KEY = 'teamsync.theme'

const listeners = new Set()

function readTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

let theme = readTheme()

function apply() {
  document.documentElement.dataset.theme = theme
}

export function setTheme(next) {
  theme = next === 'dark' ? 'dark' : 'light'
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // Storage blocked (private mode): the choice still applies for this visit.
  }
  apply()
  listeners.forEach((fn) => fn())
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** Current theme: 'light' | 'dark'. */
export function useTheme() {
  return useSyncExternalStore(subscribe, () => theme)
}

apply()
