'use client'

import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { useUsersStore } from '../stores/useUsersStore'
import type { UserRole } from '../types/user'

type Draft = {
  name: string
  email: string
  role: UserRole
}

type CreateDraft = Draft & {
  password: string
  is_active: boolean
}

const ROLE_OPTIONS: UserRole[] = ['ADMIN', 'OPERATOR']

export function UsersList() {
  const { items, total, loading, error, load, update, create, savingId, creating } =
    useUsersStore()
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [draft, setDraft] = useState<Draft>({ name: '', email: '', role: 'OPERATOR' })
  const [isCreating, setIsCreating] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [createDraft, setCreateDraft] = useState<CreateDraft>({
    name: '',
    email: '',
    password: '',
    role: 'OPERATOR',
    is_active: true,
  })

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!successMessage) return
    const timeout = setTimeout(() => setSuccessMessage(null), 4000)
    return () => clearTimeout(timeout)
  }, [successMessage])

  function showSuccess(message: string) {
    setSuccessMessage(message)
  }

  const editingUser = useMemo(
    () => items.find((item) => item.id === editingId) || null,
    [items, editingId]
  )

  function startEdit(id: string | number) {
    const user = items.find((item) => item.id === id)
    if (!user) return
    setEditingId(id)
    setDraft({
      name: user.name || '',
      email: user.email || '',
      role: (user.role as UserRole) || 'OPERATOR',
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setDraft({ name: '', email: '', role: 'OPERATOR' })
  }

  function cancelCreate() {
    setIsCreating(false)
    setCreateDraft({ name: '', email: '', password: '', role: 'OPERATOR', is_active: true })
  }

  async function saveEdit() {
    if (!editingUser) return
    const payload = {
      name: draft.name.trim(),
      email: draft.email.trim(),
      role: draft.role,
      is_active: editingUser.is_active,
    }
    const ok = await update(editingUser.id, payload)
    if (ok) {
      cancelEdit()
      showSuccess('Usuário atualizado com sucesso.')
    }
  }

  async function saveCreate() {
    const trimmedName = createDraft.name.trim()
    const trimmedEmail = createDraft.email.trim()
    if (!trimmedName || !trimmedEmail || !createDraft.password.trim()) return
    const ok = await create({
      name: trimmedName,
      email: trimmedEmail,
      password: createDraft.password,
      role: createDraft.role,
      is_active: createDraft.is_active,
    })
    if (ok) {
      setCreateDraft({ name: '', email: '', password: '', role: 'OPERATOR', is_active: true })
      setIsCreating(false)
      showSuccess('Usuário cadastrado com sucesso.')
    }
  }

  async function toggleActive(id: string | number) {
    const user = items.find((item) => item.id === id)
    if (!user) return
    const ok = await update(id, {
      name: user.name || '',
      email: user.email,
      role: user.role || 'OPERATOR',
      is_active: !user.is_active,
    })
    if (ok) {
      showSuccess(`Usuário ${user.is_active ? 'desativado' : 'ativado'} com sucesso.`)
    }
  }

  if (loading) {
    return <p className="text-slate-600">Carregando usuários...</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-600">Total: {total}</div>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Novo Usuário
        </button>
      </div>
      {error && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}
      {isCreating && (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-600">Nome</label>
              <input
                type="text"
                value={createDraft.name}
                onChange={(event) =>
                  setCreateDraft((prev) => ({ ...prev, name: event.target.value }))
                }
                className="mt-1 h-9 w-full rounded-md border border-slate-300 px-2 text-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Email</label>
              <input
                type="email"
                value={createDraft.email}
                onChange={(event) =>
                  setCreateDraft((prev) => ({ ...prev, email: event.target.value }))
                }
                className="mt-1 h-9 w-full rounded-md border border-slate-300 px-2 text-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Senha</label>
              <input
                type="password"
                value={createDraft.password}
                onChange={(event) =>
                  setCreateDraft((prev) => ({ ...prev, password: event.target.value }))
                }
                className="mt-1 h-9 w-full rounded-md border border-slate-300 px-2 text-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Perfil</label>
              <select
                value={createDraft.role}
                onChange={(event) =>
                  setCreateDraft((prev) => ({
                    ...prev,
                    role: event.target.value as UserRole,
                  }))
                }
                className="mt-1 h-9 w-full rounded-md border border-slate-300 px-2 text-slate-900"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="create-is-active"
                type="checkbox"
                checked={createDraft.is_active}
                onChange={(event) =>
                  setCreateDraft((prev) => ({ ...prev, is_active: event.target.checked }))
                }
                className="h-4 w-4 rounded border-slate-300"
              />
              <label htmlFor="create-is-active" className="text-xs font-semibold text-slate-600">
                Usuário ativo
              </label>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={saveCreate}
              disabled={
                creating ||
                !createDraft.name.trim() ||
                !createDraft.email.trim() ||
                !createDraft.password.trim()
              }
              className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {creating ? 'Salvando...' : 'Cadastrar'}
            </button>
            <button
              type="button"
              onClick={cancelCreate}
              className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      {items.length === 0 && (
        <p className="text-sm text-slate-600">Nenhum usuário encontrado.</p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border border-slate-200 text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-3 py-2 text-left">Nome</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Perfil</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((user) => {
              const isEditing = user.id === editingId
              const isSaving = user.id === savingId

              return (
                <tr key={user.id} className="border-t border-slate-200">
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={draft.name}
                        onChange={(event) =>
                          setDraft((prev) => ({ ...prev, name: event.target.value }))
                        }
                        className="h-9 w-full rounded-md border border-slate-300 px-2 text-slate-900"
                      />
                    ) : (
                      <span className="text-slate-900">{user.name || '-'}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <input
                        type="email"
                        value={draft.email}
                        onChange={(event) =>
                          setDraft((prev) => ({ ...prev, email: event.target.value }))
                        }
                        className="h-9 w-full rounded-md border border-slate-300 px-2 text-slate-900"
                      />
                    ) : (
                      <span className="text-slate-700">{user.email}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <select
                        value={draft.role}
                        onChange={(event) =>
                          setDraft((prev) => ({
                            ...prev,
                            role: event.target.value as UserRole,
                          }))
                        }
                        className="h-9 w-full rounded-md border border-slate-300 px-2 text-slate-900"
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-slate-700">{user.role || '-'}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={user.is_active}
                      onClick={() => toggleActive(user.id)}
                      disabled={isSaving}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        user.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                      } ${isSaving ? 'opacity-60' : ''}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          user.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="ml-2 text-xs text-slate-600">
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={saveEdit}
                          disabled={isSaving || !draft.name.trim() || !draft.email.trim()}
                          className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          {isSaving ? 'Salvando...' : 'Salvar'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEdit(user.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                        aria-label={`Editar ${user.name || user.email}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {items.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-center text-slate-500" colSpan={5}>
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
