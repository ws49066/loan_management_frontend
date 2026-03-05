'use client'

import { create } from 'zustand'
import { createUser, fetchUsers, updateUser } from '../services/usersService'
import type { User } from '../types/user'

type UsersState = {
  items: User[]
  total: number
  loading: boolean
  creating: boolean
  savingId: string | number | null
  error: string | null
  load: (params?: { page?: number; size?: number }) => Promise<void>
  create: (payload: {
    name: string
    email: string
    password: string
    role: string
    is_active: boolean
  }) => Promise<boolean>
  update: (
    id: string | number,
    payload: {
      name?: string | null
      email?: string
      role?: string | null
      is_active?: boolean
      password?: string
    }
  ) => Promise<boolean>
}

export const useUsersStore = create<UsersState>((set) => ({
  items: [],
  total: 0,
  loading: false,
  creating: false,
  savingId: null,
  error: null,
  async load(params) {
    set({ loading: true, error: null })
    try {
      const { items, total } = await fetchUsers(params)
      set({ items, total })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar usuários'
      set({ error: message })
    } finally {
      set({ loading: false })
    }
  },
  async create(payload) {
    set({ creating: true, error: null })
    try {
      const created = await createUser(payload)
      set((state) => ({
        items: [created, ...state.items],
        total: state.total + 1,
      }))
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao cadastrar usuário'
      set({ error: message })
      return false
    } finally {
      set({ creating: false })
    }
  },
  async update(id, payload) {
    set({ savingId: id, error: null })
    try {
      await updateUser(id, payload)
      const { password, ...safePayload } = payload
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, ...safePayload } : item
        ),
      }))
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao atualizar usuário'
      set({ error: message })
      return false
    } finally {
      set({ savingId: null })
    }
  },
}))
