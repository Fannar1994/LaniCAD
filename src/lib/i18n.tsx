// ── i18n — Lightweight internationalisation for LániCAD ──
// Two languages: Icelandic (default) and English

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import isTranslations from './i18n/is.json'
import enTranslations from './i18n/en.json'

export type Locale = 'is' | 'en'

const translations: Record<Locale, Record<string, string>> = {
  is: isTranslations,
  en: enTranslations,
}

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType>({
  locale: 'is',
  setLocale: () => {},
  t: (key: string) => key,
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleRaw] = useState<Locale>(
    () => (localStorage.getItem('lanicad_locale') as Locale) || 'is'
  )

  const setLocale = useCallback((l: Locale) => {
    setLocaleRaw(l)
    localStorage.setItem('lanicad_locale', l)
    document.documentElement.lang = l
  }, [])

  const t = useCallback((key: string): string => {
    return translations[locale][key] ?? key
  }, [locale])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  return useContext(I18nContext)
}
