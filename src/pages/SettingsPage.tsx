import { useState } from 'react'
import { useAuth, getAllUsers, createUser, deleteUser, updateUserPassword } from '@/lib/auth'
import type { UserProfile } from '@/types'
import { UserPlus, Trash2, Key } from 'lucide-react'

export function SettingsPage() {
  const { isAdmin } = useAuth()

  return (
    <div>
      <h1 className="font-condensed text-2xl font-bold text-brand-dark">Stillingar</h1>

      {isAdmin && (
        <div className="mt-6">
          <UserManagement />
        </div>
      )}

      {!isAdmin && (
        <p className="mt-4 text-sm text-gray-500">
          Aðeins stjórnendur hafa aðgang að stillingum.
        </p>
      )}
    </div>
  )
}

function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>(getAllUsers)
  const [showCreate, setShowCreate] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user')
  const [editingPassword, setEditingPassword] = useState<string | null>(null)
  const [tempPassword, setTempPassword] = useState('')

  const handleCreate = () => {
    if (createUser(newEmail, newName, newPassword, newRole)) {
      setUsers(getAllUsers())
      setShowCreate(false)
      setNewEmail('')
      setNewName('')
      setNewPassword('')
      setNewRole('user')
    }
  }

  const handleDelete = (id: string) => {
    if (deleteUser(id)) {
      setUsers(getAllUsers())
    }
  }

  const handlePasswordUpdate = (id: string) => {
    if (updateUserPassword(id, tempPassword)) {
      setEditingPassword(null)
      setTempPassword('')
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

      {showCreate && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Nafn"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
            />
            <input
              type="email"
              placeholder="Netfang"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              className="rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
            />
            <input
              type="password"
              placeholder="Lykilorð"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
            />
            <select
              value={newRole}
              onChange={e => setNewRole(e.target.value as 'admin' | 'user')}
              className="rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
            >
              <option value="user">Notandi</option>
              <option value="admin">Stjórnandi</option>
            </select>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!newEmail || !newName || !newPassword}
              className="rounded-md bg-brand-accent px-3 py-1.5 text-sm font-medium text-brand-dark hover:bg-brand-accent-hover disabled:opacity-50"
            >
              Búa til
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="rounded-md px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-200"
            >
              Hætta við
            </button>
          </div>
        </div>
      )}

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
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    u.role === 'admin'
                      ? 'bg-brand-accent/20 text-brand-dark'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {u.role === 'admin' ? 'Stjórnandi' : 'Notandi'}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {editingPassword === u.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="password"
                          placeholder="Nýtt lykilorð"
                          value={tempPassword}
                          onChange={e => setTempPassword(e.target.value)}
                          className="w-32 rounded border-gray-300 text-xs"
                        />
                        <button
                          onClick={() => handlePasswordUpdate(u.id)}
                          className="rounded bg-green-500 px-2 py-1 text-xs text-white hover:bg-green-600"
                        >
                          Vista
                        </button>
                        <button
                          onClick={() => setEditingPassword(null)}
                          className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => { setEditingPassword(u.id); setTempPassword('') }}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-brand-dark"
                          title="Breyta lykilorði"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          title="Eyða notanda"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
