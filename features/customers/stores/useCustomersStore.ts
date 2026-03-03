'use client'

import { create } from 'zustand'
import { createCustomer, fetchCustomers, updateCustomer } from '../services/customersService'
import type { Customer } from '../types/customer'

type CustomersState = {
  items: Customer[]
  total: number
  loading: boolean
  creating: boolean
  savingId: number | null
  error: string | null
  load: () => Promise<void>
  create: (payload: { name: string; phone?: string | null }) => Promise<boolean>
  update: (id: number, payload: { name: string; phone?: string | null }) => Promise<boolean>
}

export const useCustomersStore = create<CustomersState>((set) => ({
  items: [],
  total: 0,
  loading: false,
  creating: false,
  savingId: null,
  error: null,
  async load() {
    set({ loading: true, error: null })
    try {
      const { items, total } = await fetchCustomers()
      set({ items, total })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar clientes'
      set({ error: message })
    } finally {
      set({ loading: false })
    }
  },
  async create(payload) {
    set({ creating: true, error: null })
    try {
      const created = await createCustomer(payload)
      set((state) => ({
        items: [created, ...state.items],
        total: state.total + 1,
      }))
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao cadastrar cliente'
      set({ error: message })
      return false
    } finally {
      set({ creating: false })
    }
  },
  async update(id, payload) {
    set({ savingId: id, error: null })
    try {
      await updateCustomer(id, payload)
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, ...payload } : item
        ),
      }))
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao atualizar cliente'
      set({ error: message })
      return false
    } finally {
      set({ savingId: null })
    }
  },
}))
