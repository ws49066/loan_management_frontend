'use client'

import { create } from 'zustand'
import { fetchCustomerSummary } from '../services/customerSummaryService'
import type { CustomerSummary } from '../types/customerSummary'

type CustomerSummaryState = {
  summary: CustomerSummary | null
  loading: boolean
  error: string | null
  load: (id: number) => Promise<void>
}

export const useCustomerSummaryStore = create<CustomerSummaryState>((set) => ({
  summary: null,
  loading: false,
  error: null,
  async load(id) {
    set({ loading: true, error: null })
    try {
      const summary = await fetchCustomerSummary(id)
      set({ summary })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar resumo do cliente'
      set({ error: message })
    } finally {
      set({ loading: false })
    }
  },
}))
