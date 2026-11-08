import type { ThemePreference } from './db'

/**
 * Single source of truth for the theme preference logic.
 * Note: the inline script in `src/app.html` (runs before hydration, cannot import modules) mirrors `shouldUseDarkTheme`.
 */

export const THEME_COOKIE = 'emlat-theme'
export const THEME_PREFERENCES = ['system', 'light', 'dark'] as const satisfies readonly ThemePreference[]

/** Cookie must stay readable by the inline script in app.html (SvelteKit defaults to httpOnly). */
export function themeCookieOptions(url: URL) {
  return {
    path: '/',
    httpOnly: false,
    sameSite: 'lax' as const,
    secure: url.protocol === 'https:',
    maxAge: 60 * 60 * 24 * 365
  }
}

const TRANSITION_DURATION = 240

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && (THEME_PREFERENCES as readonly string[]).includes(value)
}

/** Normalizes any stored value (legacy, empty, unknown) to a valid preference. */
export function toThemePreference(value: unknown): ThemePreference {
  return isThemePreference(value) ? value : 'system'
}

export function shouldUseDarkTheme(preference: ThemePreference, systemPrefersDark: boolean): boolean {
  return preference === 'dark' || (preference === 'system' && systemPrefersDark)
}

/** Applies the preference to `<html>` (browser only). */
export function applyThemePreference(preference: ThemePreference, { animate = false } = {}) {
  const root = document.documentElement
  const isDark = shouldUseDarkTheme(preference, window.matchMedia('(prefers-color-scheme: dark)').matches)

  root.dataset.themePreference = preference
  if (root.classList.contains('dark-theme') === isDark) return

  if (animate) {
    root.classList.add('theme-transitioning')
    window.setTimeout(() => root.classList.remove('theme-transitioning'), TRANSITION_DURATION)
  }
  root.classList.toggle('dark-theme', isDark)
}
