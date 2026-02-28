'use client'

import { useEffect, useMemo, useState } from 'react'
import { useCustomersStore } from '../stores/useCustomersStore'

type Draft = {
  name: string
  phone: string
}

export function CustomersList() {
  const { items, total, loading, error, load, update, savingId } = useCustomersStore()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [draft, setDraft] = useState<Draft>({ name: '', phone: '' })

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

  if (loading) {
    return <p className="text-slate-600">Carregando clientes...</p>
  }

  if (items.length === 0) {
    return <p className="text-slate-600">Nenhum cliente encontrado.</p>
  }

  return (
    <div className="overflow-x-auto">
      <div className="mb-3 text-sm text-slate-600">Total: {total}</div>
      {error && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
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
                    <button
                      type="button"
                      onClick={() => startEdit(customer.id)}
                      className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      Editar
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
