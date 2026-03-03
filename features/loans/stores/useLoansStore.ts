'use client'

import { create } from 'zustand'
import { fetchLoans } from '../services/loansService'
import { createLoan } from '../services/createLoanService'
import type { CreateLoanSchema } from '../schemas/createLoanSchema'
import type { Loan } from '../types/loan'

type LoansState = {
  items: Loan[]
  loading: boolean
  creating: boolean
  error: string | null
  load: () => Promise<void>
  create: (payload: CreateLoanSchema) => Promise<boolean>
}

export const useLoansStore = create<LoansState>((set, get) => ({
  items: [],
  loading: false,
  creating: false,
  error: null,
  async load() {
    set({ loading: true, error: null })
    try {
      const items = await fetchLoans()
      set({ items })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar empréstimos'
      set({ error: message })
    } finally {
      set({ loading: false })
    }
  },
  async create(payload) {
    set({ creating: true, error: null })
    try {
      await createLoan(payload)
      await get().load()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao criar empréstimo'
      set({ error: message })
      return false
    } finally {
      set({ creating: false })
    }
  },
}))
