// ── i18n — Lightweight internationalisation for LániCAD ──
// Two languages: Icelandic (default) and English

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type Locale = 'is' | 'en'

const translations: Record<Locale, Record<string, string>> = {
  is: {
    // Navigation
    'nav.dashboard': 'Yfirlit',
    'nav.projects': 'Verkefni',
    'nav.calculators': 'Reiknivélar',
    'nav.drawing': 'CAD Teikning',
    'nav.schematics': 'Skýringarmyndir',
    'nav.drawings': 'Teikningar',
    'nav.templates': 'Sniðmát',
    'nav.settings': 'Stillingar',
    'nav.logout': 'Útskrá',
    'nav.fence': 'Girðingar',
    'nav.scaffolding': 'Vinnupallar',
    'nav.formwork': 'Steypumót',
    'nav.rolling': 'Hjólapallar',
    'nav.ceiling': 'Loftastoðir',

    // Calculators
    'calc.fence': 'Girðingar',
    'calc.scaffolding': 'Vinnupallar',
    'calc.formwork': 'Steypumót',
    'calc.rolling': 'Hjólapallar',
    'calc.ceiling': 'Loftastoðir',

    // Common
    'common.save': 'Vista',
    'common.cancel': 'Hætta við',
    'common.delete': 'Eyða',
    'common.edit': 'Breyta',
    'common.add': 'Bæta við',
    'common.search': 'Leita',
    'common.loading': 'Hleð...',
    'common.error': 'Villa',
    'common.success': 'Tókst',
    'common.export': 'Flytja út',
    'common.import': 'Flytja inn',
    'common.close': 'Loka',
    'common.yes': 'Já',
    'common.no': 'Nei',
    'common.back': 'Til baka',
    'common.next': 'Áfram',

    // Settings
    'settings.title': 'Stillingar',
    'settings.general': 'Almennt',
    'settings.products': 'Vörur',
    'settings.users': 'Notendur',
    'settings.language': 'Tungumál',
    'settings.changePassword': 'Breyta lykilorði',
    'settings.apiServer': 'API þjónn',
    'settings.catalogSync': 'Samstilling vörulista',

    // Drawing
    'drawing.exportSvg': 'Flytja út SVG',
    'drawing.exportDxf': 'Flytja út DXF',
    'drawing.exportPdf': 'Flytja út PDF',
    'drawing.importDxf': 'Flytja inn DXF',
    'drawing.importPdf': 'Flytja inn PDF',
    'drawing.undo': 'Afturkalla',
    'drawing.redo': 'Endurgera',
    'drawing.zoomIn': 'Zoom inn',
    'drawing.zoomOut': 'Zoom út',
    'drawing.zoomFit': 'Passa í glugga',
    'drawing.grid': 'Hnit',
    'drawing.snap': 'Snap',
    'drawing.cadView': 'CAD Teikning',
    'drawing.3dView': '3D Sýning',
    'drawing.equipment': 'Búnaður',

    // Auth
    'auth.login': 'Innskráning',
    'auth.email': 'Netfang',
    'auth.password': 'Lykilorð',
    'auth.loginButton': 'Skrá inn',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.projects': 'Projects',
    'nav.calculators': 'Calculators',
    'nav.drawing': 'CAD Drawing',
    'nav.schematics': 'Schematics',
    'nav.drawings': 'Drawings',
    'nav.templates': 'Templates',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    'nav.fence': 'Fences',
    'nav.scaffolding': 'Scaffolding',
    'nav.formwork': 'Formwork',
    'nav.rolling': 'Rolling Scaffolds',
    'nav.ceiling': 'Ceiling Props',

    // Calculators
    'calc.fence': 'Fences',
    'calc.scaffolding': 'Scaffolding',
    'calc.formwork': 'Formwork',
    'calc.rolling': 'Rolling Scaffold',
    'calc.ceiling': 'Ceiling Props',

    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.close': 'Close',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.back': 'Back',
    'common.next': 'Next',

    // Settings
    'settings.title': 'Settings',
    'settings.general': 'General',
    'settings.products': 'Products',
    'settings.users': 'Users',
    'settings.language': 'Language',
    'settings.changePassword': 'Change Password',
    'settings.apiServer': 'API Server',
    'settings.catalogSync': 'Catalog Sync',

    // Drawing
    'drawing.exportSvg': 'Export SVG',
    'drawing.exportDxf': 'Export DXF',
    'drawing.exportPdf': 'Export PDF',
    'drawing.importDxf': 'Import DXF',
    'drawing.importPdf': 'Import PDF',
    'drawing.undo': 'Undo',
    'drawing.redo': 'Redo',
    'drawing.zoomIn': 'Zoom In',
    'drawing.zoomOut': 'Zoom Out',
    'drawing.zoomFit': 'Fit to Window',
    'drawing.grid': 'Grid',
    'drawing.snap': 'Snap',
    'drawing.cadView': 'CAD Drawing',
    'drawing.3dView': '3D View',
    'drawing.equipment': 'Equipment',

    // Auth
    'auth.login': 'Login',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.loginButton': 'Sign In',
  },
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
