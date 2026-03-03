'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Eye, Pencil, Plus } from 'lucide-react'
import { useCustomersStore } from '../stores/useCustomersStore'

type Draft = {
  name: string
  phone: string
}

export function CustomersList() {
  const { items, total, loading, error, load, update, create, savingId, creating } =
    useCustomersStore()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [draft, setDraft] = useState<Draft>({ name: '', phone: '' })
  const [isCreating, setIsCreating] = useState(false)
  const [createDraft, setCreateDraft] = useState<Draft>({ name: '', phone: '' })

  useEffect(() => {
    void load()
  }, [load])

  const editingCustomer = useMemo(
    () => items.find((item) => item.id === editingId) || null,
    [items, editingId]
  )

  function startEdit(id: number) {
    const customer = items.find((item) => item.id === id)
    if (!customer) return
    setEditingId(id)
    setDraft({ name: customer.name, phone: customer.phone || '' })
  }

  function cancelEdit() {
    setEditingId(null)
    setDraft({ name: '', phone: '' })
  }

  function cancelCreate() {
    setIsCreating(false)
    setCreateDraft({ name: '', phone: '' })
  }

  async function saveEdit() {
    if (!editingCustomer) return
    const ok = await update(editingCustomer.id, {
      name: draft.name.trim(),
      phone: draft.phone.trim() ? draft.phone.trim() : null,
    })
    if (ok) {
      cancelEdit()
    }
  }

  async function saveCreate() {
    const trimmedName = createDraft.name.trim()
    if (!trimmedName) return
    const ok = await create({
      name: trimmedName,
      phone: createDraft.phone.trim() ? createDraft.phone.trim() : null,
    })
    if (ok) {
      setCreateDraft({ name: '', phone: '' })
      setIsCreating(false)
    }
  }

  if (loading) {
    return <p className="text-slate-600">Carregando clientes...</p>
  }

  if (items.length === 0) {
    return <p className="text-slate-600">Nenhum cliente encontrado.</p>
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
          Novo Cliente
        </button>
      </div>
      {error && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {isCreating && (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
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
              <label className="text-xs font-semibold text-slate-600">Telefone</label>
              <input
                type="text"
                value={createDraft.phone}
                onChange={(event) =>
                  setCreateDraft((prev) => ({ ...prev, phone: event.target.value }))
                }
                className="mt-1 h-9 w-full rounded-md border border-slate-300 px-2 text-slate-900"
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={saveCreate}
              disabled={creating || !createDraft.name.trim()}
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
      <div className="overflow-x-auto">
        <table className="w-full border border-slate-200 text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-3 py-2 text-left">Nome</th>
              <th className="px-3 py-2 text-left">Telefone</th>
              <th className="px-3 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((customer) => {
              const isEditing = customer.id === editingId
              const isSaving = customer.id === savingId

              return (
                <tr key={customer.id} className="border-t border-slate-200">
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
                      <span className="text-slate-900">{customer.name}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={draft.phone}
                        onChange={(event) =>
                          setDraft((prev) => ({ ...prev, phone: event.target.value }))
                        }
                        className="h-9 w-full rounded-md border border-slate-300 px-2 text-slate-900"
                      />
                    ) : (
                      <span className="text-slate-700">{customer.phone || '-'}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={saveEdit}
                          disabled={isSaving}
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
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/customers/${customer.id}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:border-blue-200 hover:text-blue-600"
                          aria-label={`Ver detalhes de ${customer.name}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => startEdit(customer.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                          aria-label={`Editar ${customer.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
