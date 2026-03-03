'use client'

import { create } from 'zustand'
import { fetchLoanDetails } from '../services/loanDetailsService'
import type { LoanDetails } from '../types/loanDetails'

type LoanDetailsState = {
  details: LoanDetails | null
  loading: boolean
  error: string | null
  load: (id: number) => Promise<void>
}

export const useLoanDetailsStore = create<LoanDetailsState>((set) => ({
  details: null,
  loading: false,
  error: null,
  async load(id) {
    set({ loading: true, error: null })
    try {
      const details = await fetchLoanDetails(id)
      set({ details })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar detalhes do empréstimo'
      set({ error: message })
    } finally {
      set({ loading: false })
    }
  },
}))
