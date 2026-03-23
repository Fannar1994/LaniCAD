import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/lib/auth'
import {
  fetchUsers, createApiUser, updateApiUser, deleteApiUser, changeOwnPassword,
  fetchProducts, upsertProduct, updateProduct, deleteProduct,
  type DbUser, type DbProduct,
} from '@/lib/db'
import type { CalculatorType } from '@/types'
import { formatKr } from '@/lib/format'
import {
  UserPlus, Trash2, Key, Save, Plus, Settings, Package, Users, Shield,
  ArrowUpDown, ArrowUp, ArrowDown, Search, Download, Upload, Edit2, X, Check,
  ChevronDown, ChevronRight, Globe, RotateCcw, RefreshCw,
} from 'lucide-react'
import { getApiUrl, setApiUrl, clearApiUrl, hasCustomApiUrl } from '@/lib/api-config'
import { syncCatalogToDb, getLocalProductCount } from '@/lib/catalog-sync'
import { useTranslation, type Locale } from '@/lib/i18n'
import * as XLSX from 'xlsx'

type Tab = 'general' | 'products' | 'users'
type SortDir = 'asc' | 'desc' | null
type ProductSortKey = 'rental_no' | 'description' | 'calculator_type' | 'category' | 'sale_price' | 'weight'

const CALCULATOR_LABELS: Record<CalculatorType, string> = {
  fence: 'Girðingar',
  scaffolding: 'Vinnupallar',
  formwork: 'Steypumót',
  rolling: 'Hjólapallar',
  ceiling: 'Loftastoðir',
}

export function SettingsPage() {
  const { isAdmin } = useAuth()
  const [tab, setTab] = useState<Tab>('general')

  const tabs: { key: Tab; label: string; icon: typeof Settings; adminOnly: boolean }[] = [
    { key: 'general', label: 'Almennt', icon: Settings, adminOnly: false },
    { key: 'products', label: 'Vörur', icon: Package, adminOnly: false },
    { key: 'users', label: 'Notendur', icon: Users, adminOnly: true },
  ]

  return (
    <div className="space-y-6">
      <h1 className="font-condensed text-2xl font-bold text-brand-dark">Stillingar</h1>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs
          .filter(t => !t.adminOnly || isAdmin)
          .map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                tab === t.key
                  ? 'border-brand-accent text-brand-dark'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
      </div>

      {tab === 'general' && <GeneralSettings />}
      {tab === 'products' && <ProductSettings />}
      {tab === 'users' && isAdmin && <UserManagement />}
    </div>
  )
}

// ══════════════════════════════════════════════════════
// Tab 1: Almennt — General Preferences
// ══════════════════════════════════════════════════════

function GeneralSettings() {
  const { user } = useAuth()
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [saving, setSaving] = useState(false)

  // API URL config
  const [apiUrlInput, setApiUrlInput] = useState(getApiUrl())
  const [apiMsg, setApiMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [testing, setTesting] = useState(false)
  const isCustom = hasCustomApiUrl()

  // Auto-test connection on mount if URL is configured
  useEffect(() => {
    const url = getApiUrl()
    if (!url) {
      setApiMsg({ ok: false, text: 'Enginn API þjónn stilltur. Sláðu inn slóð og smelltu á "Prófa og vista".' })
      return
    }
    let cancelled = false
    async function autoTest() {
      try {
        const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(5000) })
        if (cancelled) return
        if (!res.ok) {
          setApiMsg({ ok: false, text: `Þjónn svaraði með villu (${res.status}). Athugaðu slóðina.` })
          return
        }
        const data = await res.json()
        if (data.status === 'ok') {
          setApiMsg({ ok: true, text: `Tenging virkar! DB: ${data.db}` })
        } else {
          setApiMsg({ ok: false, text: 'API svaraði en staða er ekki "ok"' })
        }
      } catch {
        if (!cancelled) {
          setApiMsg({ ok: false, text: 'Ekki tókst að tengjast þjóni. Endurræstu þjóninn eða uppfærðu slóðina.' })
        }
      }
    }
    autoTest()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTestAndSave = async () => {
    const url = apiUrlInput.trim().replace(/\/+$/, '')
    if (!url) {
      setApiMsg({ ok: false, text: 'Sláðu inn API slóð' })
      return
    }
    setTesting(true)
    setApiMsg(null)
    try {
      const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(8000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.status === 'ok') {
        setApiUrl(url)
        setApiMsg({ ok: true, text: `Tenging virkar! DB: ${data.db}` })
      } else {
        setApiMsg({ ok: false, text: 'API svaraði en staða er ekki "ok"' })
      }
    } catch {
      setApiMsg({ ok: false, text: 'Ekki tókst að tengjast. Athugaðu slóðina og reyndu aftur.' })
    } finally {
      setTesting(false)
    }
  }

  const handleResetApi = () => {
    clearApiUrl()
    setApiUrlInput(getApiUrl())
    setApiMsg({ ok: true, text: 'Endurstillt á sjálfgildi' })
  }

  const handlePasswordChange = async () => {
    if (newPw !== confirmPw) {
      setPwMsg({ ok: false, text: 'Lykilorð stemma ekki' })
      return
    }
    if (newPw.length < 6) {
      setPwMsg({ ok: false, text: 'Lykilorð verður að vera a.m.k. 6 stafir' })
      return
    }
    setSaving(true)
    try {
      await changeOwnPassword(currentPw, newPw)
      setPwMsg({ ok: true, text: 'Lykilorð uppfært!' })
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    } catch (err) {
      setPwMsg({ ok: false, text: err instanceof Error ? err.message : 'Villa' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      {/* Profile info */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-condensed text-lg font-semibold text-brand-dark">Notandaupplýsingar</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Nafn</dt>
            <dd className="font-medium">{user?.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Netfang</dt>
            <dd className="font-medium">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Hlutverk</dt>
            <dd>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                user?.role === 'admin' ? 'bg-brand-accent/20 text-brand-dark' : 'bg-gray-100 text-gray-600'
              }`}>
                {user?.role === 'admin' && <Shield className="h-3 w-3" />}
                {user?.role === 'admin' ? 'Stjórnandi' : 'Notandi'}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      {/* Change password */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-condensed text-lg font-semibold text-brand-dark">Breyta lykilorði</h2>
        <div className="mt-3 space-y-3">
          <input
            type="password"
            placeholder="Núverandi lykilorð"
            value={currentPw}
            onChange={e => setCurrentPw(e.target.value)}
            className="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
          />
          <input
            type="password"
            placeholder="Nýtt lykilorð (a.m.k. 6 stafir)"
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            className="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
          />
          <input
            type="password"
            placeholder="Staðfesta nýtt lykilorð"
            value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)}
            className="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
          />
          {pwMsg && (
            <p className={`text-sm ${pwMsg.ok ? 'text-green-600' : 'text-red-600'}`}>{pwMsg.text}</p>
          )}
          <button
            onClick={handlePasswordChange}
            disabled={saving || !currentPw || !newPw}
            className="flex items-center gap-2 rounded-md bg-brand-dark px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            <Key className="h-4 w-4" />
            {saving ? 'Vista...' : 'Uppfæra lykilorð'}
          </button>
        </div>
      </div>

      {/* API Server URL */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-condensed text-lg font-semibold text-brand-dark flex items-center gap-2">
          <Globe className="h-5 w-5" />
          API þjónn
          {apiMsg && (
            <span className={`ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              apiMsg.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${apiMsg.ok ? 'bg-green-500' : 'bg-red-500'}`} />
              {apiMsg.ok ? 'Tengd' : 'Ótengd'}
            </span>
          )}
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Slóð á bakenda þjón (localhost eða Turso).
        </p>
        <div className="mt-3 space-y-3">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="http://localhost:3001/api"
              value={apiUrlInput}
              onChange={e => setApiUrlInput(e.target.value)}
              className="block flex-1 rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
            />
            {isCustom && (
              <button
                onClick={handleResetApi}
                title="Endurstilla"
                className="rounded-md border border-gray-300 px-2 text-gray-500 hover:bg-gray-50"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>
          {apiMsg && (
            <p className={`text-sm ${apiMsg.ok ? 'text-green-600' : 'text-red-600'}`}>{apiMsg.text}</p>
          )}
          <button
            onClick={handleTestAndSave}
            disabled={testing || !apiUrlInput.trim()}
            className="flex items-center gap-2 rounded-md bg-brand-dark px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            <Globe className="h-4 w-4" />
            {testing ? 'Prófa...' : 'Prófa og vista'}
          </button>
        </div>
      </div>

      {/* Language selector */}
      <LanguageSelector />

      {/* Product catalog sync */}
      <CatalogSyncSection />
    </div>
  )
}

// ══════════════════════════════════════════════════════
// Language Selector
// ══════════════════════════════════════════════════════

function LanguageSelector() {
  const { locale, setLocale } = useTranslation()
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="font-condensed text-lg font-semibold text-brand-dark flex items-center gap-2">
        <Globe className="h-5 w-5" />
        Tungumál / Language
      </h2>
      <p className="mt-1 text-xs text-gray-500">
        Veldu tungumál viðmótsins / Choose interface language
      </p>
      <select
        value={locale}
        onChange={e => setLocale(e.target.value as Locale)}
        className="mt-3 block w-full max-w-xs rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
        title="Tungumál"
      >
        <option value="is">🇮🇸 Íslenska</option>
        <option value="en">🇬🇧 English</option>
      </select>
    </div>
  )
}

// ══════════════════════════════════════════════════════
// Catalog Sync Section
// ══════════════════════════════════════════════════════

function CatalogSyncSection() {
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const localCount = getLocalProductCount()

  const handleSync = async () => {
    setSyncing(true)
    setSyncMsg(null)
    try {
      const result = await syncCatalogToDb()
      const parts: string[] = []
      if (result.uploaded > 0) parts.push(`${result.uploaded} nýjar vörur hlaðnar upp`)
      if (result.skipped > 0) parts.push(`${result.skipped} þegar til`)
      if (result.errors.length > 0) parts.push(`${result.errors.length} villur`)
      setSyncMsg({
        ok: result.errors.length === 0,
        text: parts.join(', ') || 'Engar breytingar',
      })
    } catch (err) {
      setSyncMsg({ ok: false, text: err instanceof Error ? err.message : 'Villa við samstillingu' })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="font-condensed text-lg font-semibold text-brand-dark flex items-center gap-2">
        <RefreshCw className="h-5 w-5" />
        Samstilling vörulista
      </h2>
      <p className="mt-1 text-xs text-gray-500">
        Hlaða {localCount} staðbundnum vörum úr reiknivélum í gagnagrunninn.
      </p>
      <div className="mt-3 space-y-3">
        {syncMsg && (
          <p className={`text-sm ${syncMsg.ok ? 'text-green-600' : 'text-red-600'}`}>{syncMsg.text}</p>
        )}
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 rounded-md bg-brand-dark px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Samstilli...' : 'Samstilla við gagnagrunn'}
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════
// Inline editable cell component
// ══════════════════════════════════════════════════════

function EditableCell({
  value,
  onChange,
  type = 'text',
  editable = true,
  align = 'left',
  mono = false,
  className = '',
}: {
  value: string | number
  onChange: (val: string | number) => void
  type?: 'text' | 'number'
  editable?: boolean
  align?: 'left' | 'right'
  mono?: boolean
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      setDraft(String(value))
      setTimeout(() => inputRef.current?.select(), 0)
    }
  }, [editing, value])

  const commit = () => {
    setEditing(false)
    const newVal = type === 'number' ? Number(draft) || 0 : draft.trim()
    if (newVal !== value) onChange(newVal)
  }

  if (!editable) {
    return (
      <span className={`block px-2 py-1 text-${align} ${mono ? 'font-mono text-xs text-gray-500' : ''} ${className}`}>
        {type === 'number' && typeof value === 'number' ? formatKr(value) : value}
      </span>
    )
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className={`group block w-full cursor-text rounded px-2 py-1 text-${align} hover:bg-brand-accent/10 ${mono ? 'font-mono text-xs text-gray-500' : ''} ${className}`}
        title="Smelltu til að breyta"
      >
        {type === 'number' && typeof value === 'number' ? formatKr(value) : value || '—'}
        <Edit2 className="ml-1 inline h-3 w-3 text-gray-300 opacity-0 group-hover:opacity-100" />
      </button>
    )
  }

  return (
    <input
      ref={inputRef}
      type={type}
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === 'Enter') commit()
        if (e.key === 'Escape') setEditing(false)
      }}
      className={`w-full rounded border border-brand-accent bg-white px-2 py-1 text-sm ${align === 'right' ? 'text-right' : 'text-left'} focus:outline-none focus:ring-1 focus:ring-brand-accent`}
      title="Breyta gildi"
    />
  )
}

// ══════════════════════════════════════════════════════
// Tab 2: Vörur — Product Catalog Management (Excel-like)
// ══════════════════════════════════════════════════════

function ProductSettings() {
  const { isAdmin } = useAuth()
  const [products, setProducts] = useState<DbProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<CalculatorType | ''>('')
  const [searchText, setSearchText] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sorting
  const [sortKey, setSortKey] = useState<ProductSortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

  // Rates expansion
  const [expandedRates, setExpandedRates] = useState<Set<string>>(new Set())

  // Selected rows for bulk operations
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // New product form
  const [newCalcType, setNewCalcType] = useState<CalculatorType>('fence')
  const [newRentalNo, setNewRentalNo] = useState('')
  const [newSaleNo, setNewSaleNo] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newSalePrice, setNewSalePrice] = useState(0)
  const [newWeight, setNewWeight] = useState(0)
  const [newImageUrl, setNewImageUrl] = useState('')

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchProducts(filterType || undefined)
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Villa við að sækja vörur')
    } finally {
      setLoading(false)
    }
  }, [filterType])

  useEffect(() => { loadProducts() }, [loadProducts])

  // Auto-clear messages
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(''), 3000)
      return () => clearTimeout(t)
    }
  }, [successMsg])

  // ── Sorting ──
  const handleSort = (key: ProductSortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc'))
      if (sortDir === 'desc') setSortKey(null)
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ col }: { col: ProductSortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="ml-1 inline h-3 w-3 text-gray-300" />
    if (sortDir === 'asc') return <ArrowUp className="ml-1 inline h-3 w-3 text-brand-accent" />
    return <ArrowDown className="ml-1 inline h-3 w-3 text-brand-accent" />
  }

  // ── Filter + Sort pipeline ──
  const displayProducts = (() => {
    let filtered = products
    if (searchText) {
      const q = searchText.toLowerCase()
      filtered = filtered.filter(p =>
        p.rental_no.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.sale_no && p.sale_no.toLowerCase().includes(q))
      )
    }
    if (sortKey && sortDir) {
      filtered = [...filtered].sort((a, b) => {
        const av = a[sortKey]
        const bv = b[sortKey]
        if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av
        return sortDir === 'asc'
          ? String(av).localeCompare(String(bv), 'is')
          : String(bv).localeCompare(String(av), 'is')
      })
    }
    return filtered
  })()

  // ── Inline edit handler ──
  const handleCellUpdate = async (product: DbProduct, field: string, value: string | number) => {
    try {
      const updated = await updateProduct(product.id, { [field]: value })
      setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Villa við að uppfæra')
    }
  }

  // ── Rate editing ──
  const handleRateUpdate = async (product: DbProduct, rateKey: string, value: number) => {
    const newRates = { ...product.rates, [rateKey]: value }
    try {
      const updated = await updateProduct(product.id, { rates: newRates })
      setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Villa við að uppfæra verð')
    }
  }

  const handleAddRate = async (product: DbProduct, rateKey: string, value: number) => {
    if (!rateKey.trim()) return
    const newRates = { ...product.rates, [rateKey.trim()]: value }
    try {
      const updated = await updateProduct(product.id, { rates: newRates })
      setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Villa')
    }
  }

  const handleDeleteRate = async (product: DbProduct, rateKey: string) => {
    const newRates = { ...product.rates }
    delete newRates[rateKey]
    try {
      const updated = await updateProduct(product.id, { rates: newRates })
      setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Villa')
    }
  }

  // ── Add product ──
  const handleAddProduct = async () => {
    if (!newRentalNo || !newDesc) return
    try {
      await upsertProduct({
        calculator_type: newCalcType,
        rental_no: newRentalNo,
        sale_no: newSaleNo,
        description: newDesc,
        category: newCategory,
        rates: {},
        sale_price: newSalePrice,
        weight: newWeight,
        image_url: newImageUrl,
        active: true,
      })
      setShowAdd(false)
      setNewRentalNo('')
      setNewSaleNo('')
      setNewDesc('')
      setNewCategory('')
      setNewSalePrice(0)
      setNewWeight(0)
      setNewImageUrl('')
      setSuccessMsg('Vara bætt við!')
      loadProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Villa')
    }
  }

  // ── Delete ──
  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id)
      setProducts(prev => prev.filter(p => p.id !== id))
      setSelected(prev => { const n = new Set(prev); n.delete(id); return n })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Villa')
    }
  }

  // ── Toggle active ──
  const handleToggleActive = async (product: DbProduct) => {
    try {
      const updated = await updateProduct(product.id, { active: !product.active })
      setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Villa')
    }
  }

  // ── Bulk operations ──
  const handleBulkDelete = async () => {
    const ids = Array.from(selected)
    for (const id of ids) {
      try {
        await deleteProduct(id)
      } catch { /* continue */ }
    }
    setSelected(new Set())
    loadProducts()
    setSuccessMsg(`${ids.length} vörur eyddar`)
  }

  const handleBulkToggle = async (active: boolean) => {
    const ids = Array.from(selected)
    for (const id of ids) {
      try {
        await updateProduct(id, { active })
      } catch { /* continue */ }
    }
    setSelected(new Set())
    loadProducts()
    setSuccessMsg(`${ids.length} vörur ${active ? 'virkjaðar' : 'óvirkjaðar'}`)
  }

  // ── Select all / none ──
  const toggleSelectAll = () => {
    if (selected.size === displayProducts.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(displayProducts.map(p => p.id)))
    }
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  // ── Excel export ──
  const handleExcelExport = () => {
    const rows = displayProducts.map(p => ({
      'Vörunúmer (Leiga)': p.rental_no,
      'Vörunúmer (Sala)': p.sale_no,
      'Lýsing': p.description,
      'Tegund': CALCULATOR_LABELS[p.calculator_type] || p.calculator_type,
      'Flokkur': p.category,
      'Söluverð': p.sale_price,
      'Þyngd (kg)': p.weight,
      'Mynd URL': p.image_url || '',
      'Virk': p.active ? 'Já' : 'Nei',
      'Verð (JSON)': JSON.stringify(p.rates),
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    // Auto-size columns
    const colWidths = Object.keys(rows[0] || {}).map(k => ({
      wch: Math.max(k.length, ...rows.map(r => String((r as Record<string, unknown>)[k] || '').length)) + 2
    }))
    ws['!cols'] = colWidths
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Vörur')
    XLSX.writeFile(wb, `LaniCAD_Vorur_${new Date().toISOString().slice(0, 10)}.xlsx`)
    setSuccessMsg('Excel skrá flutt út!')
  }

  // ── Sub-group → calculator type mapping for Leigulager import ──
  const SUB_GROUP_TO_CALC_TYPE: Record<string, CalculatorType> = {
    '01-BAT-GI': 'fence',
    '01-PAL-VP': 'scaffolding',
    '01-PAL-HP': 'rolling',
    '01-PAL-HP66': 'rolling',
    '01-PAL-HP88': 'rolling',
    '01-MÓT-KM': 'formwork',
    '01-MÓT-HM': 'formwork',
    '01-MÓT-AH': 'formwork',
    '01-MÓT-SM': 'formwork',
    '01-MÓT-LM51': 'ceiling',
    '01-MÓT-LM71': 'ceiling',
    '01-MÓT-LM55': 'ceiling',
    '01-MÓT-LM02': 'formwork',
    '01-MÓT-LM22': 'formwork',
    '01-MÓT-LM72': 'ceiling',
    '01-MÓT-LM81': 'formwork',
  }

  function resolveCalcType(subGroup: string): CalculatorType | null {
    // Try exact match first (e.g. 01-MÓT-LM51), then progressively shorter prefixes
    for (let len = subGroup.length; len >= 6; len--) {
      const prefix = subGroup.substring(0, len)
      if (SUB_GROUP_TO_CALC_TYPE[prefix]) return SUB_GROUP_TO_CALC_TYPE[prefix]
    }
    return null
  }

  // ── Excel import ──
  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result
        const wb = XLSX.read(data, { type: 'binary' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(ws)

        // Auto-detect Leigulager format (has "Item No." and "Sub Group" columns)
        const isLeigulager = rows.length > 0 && ('Item No.' in rows[0] || 'Sub Group' in rows[0])

        let imported = 0
        let skipped = 0

        for (const row of rows) {
          if (isLeigulager) {
            // ── Leigulager format ──
            const itemNo = String(row['Item No.'] || '').trim()
            const desc = String(row['Item Description'] || '').trim()
            const subGroup = String(row['Sub Group'] || '').trim()
            if (!itemNo || !desc) { skipped++; continue }

            // Only import construction rental items (01- prefix)
            const calcType = resolveCalcType(subGroup)
            if (!calcType) { skipped++; continue }

            const weekRate = Number(row['Default Week Rate'] || 0)
            const dayRate = Number(row['Default Day Rate'] || 0)
            const rates: Record<string, number> = {}
            if (dayRate) rates.daily = dayRate
            if (weekRate) rates.weekly = weekRate

            await upsertProduct({
              calculator_type: calcType,
              rental_no: itemNo,
              sale_no: String(row['Item Description 2'] || ''),
              description: desc,
              category: subGroup,
              rates,
              sale_price: Number(row['Selling Price'] || 0),
              weight: Number(row['Weight'] || 0),
              image_url: '',
              active: true,
            })
            imported++
          } else {
            // ── LániCAD native format ──
            const rentalNo = String(row['Vörunúmer (Leiga)'] || row['rental_no'] || '').trim()
            const desc = String(row['Lýsing'] || row['description'] || '').trim()
            if (!rentalNo || !desc) { skipped++; continue }

            // Map Icelandic type labels back to keys
            const typeLabel = String(row['Tegund'] || row['calculator_type'] || 'fence')
            const calcType = (Object.entries(CALCULATOR_LABELS).find(([, v]) => v === typeLabel)?.[0] || typeLabel) as CalculatorType

            let rates: Record<string, number> = {}
            const ratesStr = String(row['Verð (JSON)'] || row['rates'] || '{}')
            try { rates = JSON.parse(ratesStr) } catch { /* empty */ }

            await upsertProduct({
              calculator_type: calcType,
              rental_no: rentalNo,
              sale_no: String(row['Vörunúmer (Sala)'] || row['sale_no'] || ''),
              description: desc,
              category: String(row['Flokkur'] || row['category'] || ''),
              rates,
              sale_price: Number(row['Söluverð'] || row['sale_price'] || 0),
              weight: Number(row['Þyngd (kg)'] || row['weight'] || 0),
              image_url: String(row['Mynd URL'] || row['image_url'] || ''),
              active: (row['Virk'] || row['active'] || 'Já') !== 'Nei',
            })
            imported++
          }
        }
        const fmt = isLeigulager ? 'Leigulager' : 'LániCAD'
        setSuccessMsg(`${fmt}: ${imported} vörur fluttar inn, ${skipped} sleppt`)
        loadProducts()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Villa við innflutning')
      }
    }
    reader.readAsBinaryString(file)
    // Reset input so same file can be re-imported
    e.target.value = ''
  }

  const toggleRatesExpander = (id: string) => {
    setExpandedRates(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  return (
    <div className="space-y-4">
      {/* Toolbar: filter + search + actions */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value as CalculatorType | '')}
          className="rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
          title="Sía eftir tegund"
        >
          <option value="">Allar tegundir</option>
          {Object.entries(CALCULATOR_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Leita í vörum..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="w-56 rounded-md border-gray-300 pl-8 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
          />
          {searchText && (
            <button onClick={() => setSearchText('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" title="Hreinsa leit">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Bulk operations */}
          {isAdmin && selected.size > 0 && (
            <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1">
              <span className="text-xs text-gray-500">{selected.size} valdar:</span>
              <button onClick={() => handleBulkToggle(true)} className="rounded px-2 py-0.5 text-xs text-green-600 hover:bg-green-50" title="Virkja">
                Virkja
              </button>
              <button onClick={() => handleBulkToggle(false)} className="rounded px-2 py-0.5 text-xs text-orange-600 hover:bg-orange-50" title="Óvirkja">
                Óvirkja
              </button>
              <button onClick={handleBulkDelete} className="rounded px-2 py-0.5 text-xs text-red-600 hover:bg-red-50" title="Eyða">
                Eyða
              </button>
            </div>
          )}

          {/* Excel import/export */}
          <button onClick={handleExcelExport}
            className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            title="Flytja út sem Excel">
            <Download className="h-3.5 w-3.5" /> Excel
          </button>
          {isAdmin && (
            <>
              <button onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                title="Flytja inn úr Excel">
                <Upload className="h-3.5 w-3.5" /> Innflutningur
              </button>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleExcelImport} className="hidden" title="Flytja inn Excel" />
            </>
          )}

          {isAdmin && (
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="flex items-center gap-2 rounded-md bg-brand-accent px-3 py-1.5 text-sm font-medium text-brand-dark hover:bg-brand-accent-hover"
            >
              <Plus className="h-4 w-4" />
              Ný vara
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {successMsg && <p className="text-sm text-green-600">{successMsg}</p>}

      {/* Add product form */}
      {showAdd && isAdmin && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-3 font-condensed font-semibold text-brand-dark">Ný vara</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <select value={newCalcType} onChange={e => setNewCalcType(e.target.value as CalculatorType)}
              className="rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent" title="Tegund reiknivélar">
              {Object.entries(CALCULATOR_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input type="text" placeholder="Leiguvörunúmer *" value={newRentalNo} onChange={e => setNewRentalNo(e.target.value)}
              className="rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent" />
            <input type="text" placeholder="Söluvörunúmer" value={newSaleNo} onChange={e => setNewSaleNo(e.target.value)}
              className="rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent" />
            <input type="text" placeholder="Lýsing *" value={newDesc} onChange={e => setNewDesc(e.target.value)}
              className="rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:col-span-2" />
            <input type="text" placeholder="Flokkur" value={newCategory} onChange={e => setNewCategory(e.target.value)}
              className="rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent" />
            <input type="number" placeholder="Söluverð" min={0} value={newSalePrice} onChange={e => setNewSalePrice(Number(e.target.value))}
              className="rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent" />
            <input type="number" placeholder="Þyngd (kg)" min={0} step={0.1} value={newWeight} onChange={e => setNewWeight(Number(e.target.value))}
              className="rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent" />
            <input type="url" placeholder="Mynd URL (valfrjálst)" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)}
              className="rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:col-span-2" />
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={handleAddProduct} disabled={!newRentalNo || !newDesc}
              className="flex items-center gap-2 rounded-md bg-brand-accent px-3 py-1.5 text-sm font-medium text-brand-dark hover:bg-brand-accent-hover disabled:opacity-50">
              <Save className="h-4 w-4" /> Vista
            </button>
            <button onClick={() => setShowAdd(false)} className="rounded-md px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-200">
              Hætta við
            </button>
          </div>
        </div>
      )}

      {/* Products table — Excel-style with inline editing */}
      {loading ? (
        <p className="py-8 text-center text-sm text-gray-400">Sæki vörur...</p>
      ) : displayProducts.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          {searchText ? `Engar vörur fundust fyrir "${searchText}"` : 'Engar vörur fundust'}
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {isAdmin && (
                    <th className="w-8 px-2 py-2">
                      <input type="checkbox" checked={selected.size === displayProducts.length && displayProducts.length > 0}
                        onChange={toggleSelectAll} className="rounded border-gray-300" title="Velja allt" />
                    </th>
                  )}
                  <th className="cursor-pointer px-3 py-2 text-left font-medium text-gray-600 hover:text-brand-dark" onClick={() => handleSort('rental_no')}>
                    Vörunúmer <SortIcon col="rental_no" />
                  </th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600">Mynd</th>
                  <th className="cursor-pointer px-3 py-2 text-left font-medium text-gray-600 hover:text-brand-dark" onClick={() => handleSort('description')}>
                    Lýsing <SortIcon col="description" />
                  </th>
                  <th className="cursor-pointer px-3 py-2 text-left font-medium text-gray-600 hover:text-brand-dark" onClick={() => handleSort('calculator_type')}>
                    Tegund <SortIcon col="calculator_type" />
                  </th>
                  <th className="cursor-pointer px-3 py-2 text-left font-medium text-gray-600 hover:text-brand-dark" onClick={() => handleSort('category')}>
                    Flokkur <SortIcon col="category" />
                  </th>
                  <th className="cursor-pointer px-3 py-2 text-right font-medium text-gray-600 hover:text-brand-dark" onClick={() => handleSort('sale_price')}>
                    Söluverð <SortIcon col="sale_price" />
                  </th>
                  <th className="cursor-pointer px-3 py-2 text-right font-medium text-gray-600 hover:text-brand-dark" onClick={() => handleSort('weight')}>
                    Þyngd <SortIcon col="weight" />
                  </th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600">Verð</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600">Virk</th>
                  {isAdmin && <th className="px-3 py-2 text-right font-medium text-gray-600">Aðgerðir</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {displayProducts.map(p => (
                  <ProductRow
                    key={p.id}
                    product={p}
                    isAdmin={isAdmin}
                    isSelected={selected.has(p.id)}
                    onToggleSelect={() => toggleSelect(p.id)}
                    onCellUpdate={(field, value) => handleCellUpdate(p, field, value)}
                    onToggleActive={() => handleToggleActive(p)}
                    onDelete={() => handleDelete(p.id)}
                    ratesExpanded={expandedRates.has(p.id)}
                    onToggleRates={() => toggleRatesExpander(p.id)}
                    onRateUpdate={(key, val) => handleRateUpdate(p, key, val)}
                    onAddRate={(key, val) => handleAddRate(p, key, val)}
                    onDeleteRate={(key) => handleDeleteRate(p, key)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400">
        {displayProducts.length} af {products.length} vörum
        {searchText && ` — leit: "${searchText}"`}
      </p>
    </div>
  )
}

// ── Product Row with inline editing + rates expander ──
function ProductRow({
  product: p,
  isAdmin,
  isSelected,
  onToggleSelect,
  onCellUpdate,
  onToggleActive,
  onDelete,
  ratesExpanded,
  onToggleRates,
  onRateUpdate,
  onAddRate,
  onDeleteRate,
}: {
  product: DbProduct
  isAdmin: boolean
  isSelected: boolean
  onToggleSelect: () => void
  onCellUpdate: (field: string, value: string | number) => void
  onToggleActive: () => void
  onDelete: () => void
  ratesExpanded: boolean
  onToggleRates: () => void
  onRateUpdate: (key: string, val: number) => void
  onAddRate: (key: string, val: number) => void
  onDeleteRate: (key: string) => void
}) {
  const rateCount = Object.keys(p.rates || {}).length

  return (
    <>
      <tr className={`${p.active ? '' : 'opacity-50'} ${isSelected ? 'bg-brand-accent/5' : 'hover:bg-gray-50'}`}>
        {isAdmin && (
          <td className="w-8 px-2 py-1">
            <input type="checkbox" checked={isSelected} onChange={onToggleSelect} className="rounded border-gray-300" title="Velja vöru" />
          </td>
        )}
        <td className="px-1 py-1">
          <EditableCell value={p.rental_no} onChange={v => onCellUpdate('rental_no', v)} editable={isAdmin} mono />
        </td>
        <td className="px-2 py-1 text-center">
          {p.image_url ? (
            <div className="group relative mx-auto w-8">
              <img src={p.image_url} alt={p.description} className="h-8 w-8 rounded object-cover" />
              {isAdmin && (
                <button
                  onClick={() => {
                    const url = prompt('Mynd URL:', p.image_url)
                    if (url !== null) onCellUpdate('image_url', url)
                  }}
                  className="absolute -right-1 -top-1 hidden rounded-full bg-white p-0.5 shadow group-hover:block"
                  title="Breyta mynd"
                >
                  <Edit2 className="h-2.5 w-2.5 text-gray-400" />
                </button>
              )}
            </div>
          ) : isAdmin ? (
            <button
              onClick={() => {
                const url = prompt('Mynd URL:')
                if (url) onCellUpdate('image_url', url)
              }}
              className="text-xs text-gray-300 hover:text-brand-accent"
              title="Bæta við mynd"
            >
              + mynd
            </button>
          ) : (
            <span className="text-xs text-gray-300">—</span>
          )}
        </td>
        <td className="max-w-xs px-1 py-1">
          <EditableCell value={p.description} onChange={v => onCellUpdate('description', v)} editable={isAdmin} />
        </td>
        <td className="px-3 py-1 text-xs text-gray-400">{CALCULATOR_LABELS[p.calculator_type] || p.calculator_type}</td>
        <td className="px-1 py-1">
          <EditableCell value={p.category} onChange={v => onCellUpdate('category', v)} editable={isAdmin} className="text-xs text-gray-400" />
        </td>
        <td className="px-1 py-1">
          <EditableCell value={p.sale_price} onChange={v => onCellUpdate('sale_price', v)} type="number" editable={isAdmin} align="right" />
        </td>
        <td className="px-1 py-1">
          <EditableCell value={p.weight} onChange={v => onCellUpdate('weight', v)} type="number" editable={isAdmin} align="right" />
        </td>
        <td className="px-3 py-1 text-center">
          <button onClick={onToggleRates}
            className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-gray-500 hover:bg-gray-100"
            title={ratesExpanded ? 'Loka verðum' : 'Opna verð'}>
            {ratesExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            {rateCount} verð
          </button>
        </td>
        <td className="px-3 py-1 text-center">
          {isAdmin ? (
            <button onClick={onToggleActive}
              className={`h-4 w-4 rounded border ${p.active ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-white'}`}
              title={p.active ? 'Óvirkja' : 'Virkja'} />
          ) : (
            <span className={`inline-block h-2 w-2 rounded-full ${p.active ? 'bg-green-500' : 'bg-gray-300'}`} />
          )}
        </td>
        {isAdmin && (
          <td className="px-3 py-1 text-right">
            <button onClick={onDelete}
              className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600" title="Eyða vöru">
              <Trash2 className="h-4 w-4" />
            </button>
          </td>
        )}
      </tr>
      {/* Rates expansion row */}
      {ratesExpanded && (
        <tr>
          <td colSpan={isAdmin ? 11 : 10} className="bg-gray-50 px-6 py-3">
            <RatesEditor
              rates={p.rates || {}}
              editable={isAdmin}
              onUpdate={onRateUpdate}
              onAdd={onAddRate}
              onDeleteRate={onDeleteRate}
            />
          </td>
        </tr>
      )}
    </>
  )
}

// ── Rates Editor (mini-spreadsheet for JSONB rates) ──
function RatesEditor({
  rates,
  editable,
  onUpdate,
  onAdd,
  onDeleteRate,
}: {
  rates: Record<string, number>
  editable: boolean
  onUpdate: (key: string, val: number) => void
  onAdd: (key: string, val: number) => void
  onDeleteRate: (key: string) => void
}) {
  const [newKey, setNewKey] = useState('')
  const [newVal, setNewVal] = useState(0)
  const entries = Object.entries(rates)

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-gray-500">Verðskrá (rates)</h4>
      {entries.length === 0 ? (
        <p className="text-xs italic text-gray-400">Engin verð skráð</p>
      ) : (
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {entries.map(([k, v]) => (
            <div key={k} className="flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-1">
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-gray-600" title={k}>{k}</span>
              {editable ? (
                <>
                  <input
                    type="number"
                    value={v}
                    onChange={e => onUpdate(k, Number(e.target.value) || 0)}
                    className="w-20 rounded border-gray-200 text-right text-xs focus:border-brand-accent focus:ring-brand-accent"
                    title={k}
                  />
                  <button onClick={() => onDeleteRate(k)} className="text-gray-300 hover:text-red-500" title="Eyða">
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <span className="text-xs text-gray-500">{formatKr(v)}</span>
              )}
            </div>
          ))}
        </div>
      )}
      {editable && (
        <div className="flex items-center gap-2 pt-1">
          <input type="text" placeholder="Heiti verðs (t.d. day_rate)" value={newKey} onChange={e => setNewKey(e.target.value)}
            className="w-40 rounded border-gray-300 text-xs focus:border-brand-accent focus:ring-brand-accent" />
          <input type="number" placeholder="Upphæð" value={newVal} onChange={e => setNewVal(Number(e.target.value))}
            className="w-24 rounded border-gray-300 text-right text-xs focus:border-brand-accent focus:ring-brand-accent" />
          <button onClick={() => { onAdd(newKey, newVal); setNewKey(''); setNewVal(0) }}
            disabled={!newKey.trim()}
            className="flex items-center gap-1 rounded bg-brand-accent px-2 py-1 text-xs font-medium text-brand-dark hover:bg-brand-accent-hover disabled:opacity-50">
            <Plus className="h-3 w-3" /> Bæta við
          </button>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════
// Tab 3: Notendur — User Management (Admin Only)
// ══════════════════════════════════════════════════════

function UserManagement() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<DbUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user')
  const [editingPassword, setEditingPassword] = useState<string | null>(null)
  const [tempPassword, setTempPassword] = useState('')
  const [editingName, setEditingName] = useState<string | null>(null)
  const [tempName, setTempName] = useState('')
  const [error, setError] = useState('')

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchUsers()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Villa við að sækja notendur')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  const handleCreate = async () => {
    if (!newEmail || !newName || !newPassword) return
    setError('')
    try {
      await createApiUser({ email: newEmail, name: newName, password: newPassword, role: newRole })
      setShowCreate(false)
      setNewEmail('')
      setNewName('')
      setNewPassword('')
      setNewRole('user')
      loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Villa')
    }
  }

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) return
    setError('')
    try {
      await deleteApiUser(id)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Villa')
    }
  }

  const handlePasswordUpdate = async (id: string) => {
    if (!tempPassword || tempPassword.length < 6) {
      setError('Lykilorð verður að vera a.m.k. 6 stafir')
      return
    }
    setError('')
    try {
      await updateApiUser(id, { password: tempPassword })
      setEditingPassword(null)
      setTempPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Villa')
    }
  }

  const handleRoleChange = async (id: string, role: 'admin' | 'user') => {
    try {
      const updated = await updateApiUser(id, { role })
      setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Villa')
    }
  }

  const handleNameUpdate = async (id: string) => {
    if (!tempName.trim()) return
    setError('')
    try {
      const updated = await updateApiUser(id, { name: tempName.trim() })
      setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)))
      setEditingName(null)
      setTempName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Villa')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-condensed text-lg font-bold text-brand-dark">Notendur</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 rounded-md bg-brand-accent px-3 py-1.5 text-sm font-medium text-brand-dark hover:bg-brand-accent-hover"
        >
          <UserPlus className="h-4 w-4" />
          Nýr notandi
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {showCreate && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="text" placeholder="Nafn *" value={newName} onChange={e => setNewName(e.target.value)}
              className="rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent" />
            <input type="email" placeholder="Netfang *" value={newEmail} onChange={e => setNewEmail(e.target.value)}
              className="rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent" />
            <input type="password" placeholder="Lykilorð * (a.m.k. 6 stafir)" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              className="rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent" />
            <select value={newRole} onChange={e => setNewRole(e.target.value as 'admin' | 'user')}
              className="rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent" title="Hlutverk">
              <option value="user">Notandi</option>
              <option value="admin">Stjórnandi</option>
            </select>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={handleCreate} disabled={!newEmail || !newName || !newPassword}
              className="rounded-md bg-brand-accent px-3 py-1.5 text-sm font-medium text-brand-dark hover:bg-brand-accent-hover disabled:opacity-50">
              Búa til
            </button>
            <button onClick={() => setShowCreate(false)} className="rounded-md px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-200">
              Hætta við
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-gray-400">Sæki notendur...</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Nafn</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Netfang</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Hlutverk</th>
                <th className="px-4 py-2 text-right font-medium text-gray-600">Aðgerðir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {users.map(u => (
                <tr key={u.id}>
                  <td className="px-4 py-2">
                    {editingName === u.id ? (
                      <div className="flex items-center gap-1">
                        <input type="text" value={tempName} onChange={e => setTempName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleNameUpdate(u.id); if (e.key === 'Escape') setEditingName(null) }}
                          className="w-40 rounded border-gray-300 text-sm focus:border-brand-accent focus:ring-brand-accent" autoFocus title="Nafn notanda" />
                        <button onClick={() => handleNameUpdate(u.id)} className="rounded p-1 text-green-600 hover:bg-green-50" title="Staðfesta"><Check className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setEditingName(null)} className="rounded p-1 text-gray-400 hover:bg-gray-100" title="Hætta við"><X className="h-3.5 w-3.5" /></button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingName(u.id); setTempName(u.name) }}
                        className="group font-medium text-brand-dark hover:text-brand-accent">
                        {u.name}
                        <Edit2 className="ml-1 inline h-3 w-3 text-gray-300 opacity-0 group-hover:opacity-100" />
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{u.email}</td>
                  <td className="px-4 py-2">
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value as 'admin' | 'user')}
                      disabled={u.id === currentUser?.id}
                      className="rounded border-gray-200 bg-transparent text-xs font-medium disabled:opacity-50"
                      title="Breyta hlutverki"
                    >
                      <option value="user">Notandi</option>
                      <option value="admin">Stjórnandi</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {editingPassword === u.id ? (
                        <div className="flex items-center gap-1">
                          <input type="password" placeholder="Nýtt lykilorð" value={tempPassword}
                            onChange={e => setTempPassword(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handlePasswordUpdate(u.id); if (e.key === 'Escape') setEditingPassword(null) }}
                            className="w-32 rounded border-gray-300 text-xs" />
                          <button onClick={() => handlePasswordUpdate(u.id)}
                            className="rounded bg-green-500 px-2 py-1 text-xs text-white hover:bg-green-600">Vista</button>
                          <button onClick={() => setEditingPassword(null)}
                            className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100">×</button>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => { setEditingPassword(u.id); setTempPassword('') }}
                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-brand-dark" title="Breyta lykilorði">
                            <Key className="h-4 w-4" />
                          </button>
                          {u.id !== currentUser?.id && (
                            <button onClick={() => handleDelete(u.id)}
                              className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600" title="Eyða notanda">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
