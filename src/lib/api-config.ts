/**
 * Dynamic API URL configuration.
 *
 * Priority:
 * 1. localStorage override (set via Settings → Almennt)
 * 2. VITE_API_URL env variable (build-time)
 * 3. Auto-detect: same-origin /api when on GitHub Pages, else localhost fallback
 */

const STORAGE_KEY = 'lanicad_api_url'
const ENV_URL = import.meta.env.VITE_API_URL as string | undefined
const LOCAL_FALLBACK = 'http://localhost:3001/api'

/** Get the current API base URL */
export function getApiUrl(): string {
  // 1. User-configured override
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) return stored

  // 2. Build-time env variable
  if (ENV_URL) return ENV_URL

  // 3. If running on GitHub Pages, there's no local server — return empty so
  //    the UI can prompt the user to configure it
  if (isGitHubPages()) return ''

  // 4. Local dev fallback
  return LOCAL_FALLBACK
}

/** Save a custom API URL (from Settings page) */
export function setApiUrl(url: string): void {
  const trimmed = url.trim().replace(/\/+$/, '') // strip trailing slashes
  if (trimmed) {
    localStorage.setItem(STORAGE_KEY, trimmed)
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

/** Clear the custom API URL (revert to env/default) */
export function clearApiUrl(): void {
  localStorage.removeItem(STORAGE_KEY)
}

/** Whether a custom URL has been set by the user */
export function hasCustomApiUrl(): boolean {
  return Boolean(localStorage.getItem(STORAGE_KEY))
}

/** Whether the API URL is configured (non-empty) */
export function isApiReady(): boolean {
  return Boolean(getApiUrl())
}

function isGitHubPages(): boolean {
  return typeof window !== 'undefined' &&
    window.location.hostname.endsWith('.github.io')
}
