'use client'

import { create } from 'zustand'
import { loginService } from '../services/login'
import { tokenService } from '@/shared/auth/tokenService'
import type { LoginSchema } from '../schemas/loginSchema'
import type { MeResponse } from '../services/getMe'
import { getMe } from '../services/getMe'

type AuthState = {
  loading: boolean
  error: string | null
  successMessage: string | null
  user: MeResponse['data'] | null
  login: (payload: LoginSchema) => Promise<void>
  loadMe: () => Promise<boolean>
  clearMessages: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  loading: false,
  error: null,
  successMessage: null,
  user: null,
  async login(payload) {
    set({ loading: true, error: null, successMessage: null })

    try {
      const data = await loginService(payload)

      if (!data.success || !data.data?.access_token) {
        throw new Error(data.message || 'Falha ao realizar login')
      }

      tokenService.set(data.data.access_token)
      set({ successMessage: data.message || 'Login realizado com sucesso' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao realizar login'
      set({ error: message })
    } finally {
      set({ loading: false })
    }
  },
  async loadMe() {
    try {
      const data = await getMe()
      if (data.success && data.data) {
        set({ user: data.data })
        return true
      }
      return false
    } catch {
      set({ user: null })
      return false
    }
  },
  clearMessages() {
    set({ error: null, successMessage: null })
  },
}))
