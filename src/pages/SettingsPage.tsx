import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import {
  fetchUsers, createApiUser, updateApiUser, deleteApiUser, changeOwnPassword,
  fetchProducts, upsertProduct, updateProduct, deleteProduct,
  type DbUser, type DbProduct,
} from '@/lib/db'
import type { CalculatorType } from '@/types'
import { formatKr } from '@/lib/format'
import { UserPlus, Trash2, Key, Save, Plus, Settings, Package, Users, Shield } from 'lucide-react'

type Tab = 'general' | 'products' | 'users'

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
    </div>
  )
}

// ══════════════════════════════════════════════════════
// Tab 2: Vörur — Product Catalog Management
// ══════════════════════════════════════════════════════

function ProductSettings() {
  const { isAdmin } = useAuth()
  const [products, setProducts] = useState<DbProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<CalculatorType | ''>('')
  const [showAdd, setShowAdd] = useState(false)
  const [error, setError] = useState('')

  // New product form
  const [newCalcType, setNewCalcType] = useState<CalculatorType>('fence')
  const [newRentalNo, setNewRentalNo] = useState('')
  const [newSaleNo, setNewSaleNo] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newSalePrice, setNewSalePrice] = useState(0)
  const [newWeight, setNewWeight] = useState(0)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchProducts(filterType || undefined)
      setProducts(data)
    } catch {
      setError('Villa við að sækja vörur')
    } finally {
      setLoading(false)
    }
  }, [filterType])

  useEffect(() => { loadProducts() }, [loadProducts])

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
        active: true,
      })
      setShowAdd(false)
      setNewRentalNo('')
      setNewSaleNo('')
      setNewDesc('')
      setNewCategory('')
      setNewSalePrice(0)
      setNewWeight(0)
      loadProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Villa')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Villa')
    }
  }

  const handleToggleActive = async (product: DbProduct) => {
    try {
      const updated = await updateProduct(product.id, { active: !product.active })
      setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Villa')
    }
  }

  return (
    <div className="space-y-4">
      {/* Header + filter */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value as CalculatorType | '')}
          className="rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
        >
          <option value="">Allar tegundir</option>
          {Object.entries(CALCULATOR_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        {isAdmin && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="ml-auto flex items-center gap-2 rounded-md bg-brand-accent px-3 py-1.5 text-sm font-medium text-brand-dark hover:bg-brand-accent-hover"
          >
            <Plus className="h-4 w-4" />
            Ný vara
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Add product form */}
      {showAdd && isAdmin && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-3 font-condensed font-semibold text-brand-dark">Ný vara</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <select value={newCalcType} onChange={e => setNewCalcType(e.target.value as CalculatorType)}
              className="rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent">
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

      {/* Products table */}
      {loading ? (
        <p className="py-8 text-center text-sm text-gray-400">Sæki vörur...</p>
      ) : products.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">Engar vörur fundust</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Vörunúmer</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Lýsing</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Tegund</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Flokkur</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">Söluverð</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">Þyngd</th>
                  <th className="px-4 py-2 text-center font-medium text-gray-600">Virk</th>
                  {isAdmin && <th className="px-4 py-2 text-right font-medium text-gray-600">Aðgerðir</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {products.map(p => (
                  <tr key={p.id} className={p.active ? '' : 'opacity-50'}>
                    <td className="px-4 py-2 font-mono text-xs text-gray-500">{p.rental_no}</td>
                    <td className="max-w-xs truncate px-4 py-2">{p.description}</td>
                    <td className="px-4 py-2 text-xs text-gray-400">{CALCULATOR_LABELS[p.calculator_type] || p.calculator_type}</td>
                    <td className="px-4 py-2 text-xs text-gray-400">{p.category}</td>
                    <td className="px-4 py-2 text-right">{formatKr(p.sale_price)}</td>
                    <td className="px-4 py-2 text-right">{p.weight} kg</td>
                    <td className="px-4 py-2 text-center">
                      {isAdmin ? (
                        <button onClick={() => handleToggleActive(p)}
                          className={`h-4 w-4 rounded border ${p.active ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-white'}`}
                          title={p.active ? 'Óvirkja' : 'Virkja'} />
                      ) : (
                        <span className={`inline-block h-2 w-2 rounded-full ${p.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-2 text-right">
                        <button onClick={() => handleDelete(p.id)}
                          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600" title="Eyða vöru">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400">{products.length} vörur</p>
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
  const [error, setError] = useState('')

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchUsers()
      setUsers(data)
    } catch {
      setError('Villa við að sækja notendur')
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
              className="rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent">
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
                  <td className="px-4 py-2 font-medium text-brand-dark">{u.name}</td>
                  <td className="px-4 py-2 text-gray-600">{u.email}</td>
                  <td className="px-4 py-2">
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value as 'admin' | 'user')}
                      disabled={u.id === currentUser?.id}
                      className="rounded border-gray-200 bg-transparent text-xs font-medium disabled:opacity-50"
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
