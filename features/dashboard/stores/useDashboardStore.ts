'use client'

import { create } from 'zustand'
import { fetchDashboardSummary } from '../services/summaryService'
import type { DashboardSummary } from '../types/summary'

type DashboardState = {
  summary: DashboardSummary | null
  loading: boolean
  error: string | null
  load: () => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set) => ({
  summary: null,
  loading: false,
  error: null,
  async load() {
    set({ loading: true, error: null })
    try {
      const summary = await fetchDashboardSummary()
      set({ summary })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar resumo'
      set({ error: message })
    } finally {
      set({ loading: false })
    }
  },
}))
