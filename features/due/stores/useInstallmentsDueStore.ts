'use client'

import { create } from 'zustand'
import { fetchInstallmentsDue } from '../services/installmentsDueService'
import type { InstallmentStatus, InstallmentsDueCounts, InstallmentDueItem } from '../types/installmentsDue'

type InstallmentsDueState = {
  items: InstallmentDueItem[]
  counts: InstallmentsDueCounts
  total: number
  page: number
  size: number
  status: InstallmentStatus
  clientQuery: string
  startDate: string
  endDate: string
  orderBy: 'due_date' | 'amount' | 'delay'
  orderDir: 'asc' | 'desc'
  loading: boolean
  error: string | null
  load: (
    params?: Partial<
      Pick<
        InstallmentsDueState,
        | 'status'
        | 'page'
        | 'size'
        | 'clientQuery'
        | 'startDate'
        | 'endDate'
        | 'orderBy'
        | 'orderDir'
      >
    >
  ) => Promise<void>
  setStatus: (status: InstallmentStatus) => void
  setPage: (page: number) => void
  setSize: (size: number) => void
  setClientQuery: (value: string) => void
  setStartDate: (value: string) => void
  setEndDate: (value: string) => void
  setOrderBy: (value: 'due_date' | 'amount' | 'delay') => void
  setOrderDir: (value: 'asc' | 'desc') => void
}

const initialCounts: InstallmentsDueCounts = {
  all: 0,
  pending: 0,
  late: 0,
  paid: 0,
}

export const useInstallmentsDueStore = create<InstallmentsDueState>((set, get) => ({
  items: [],
  counts: initialCounts,
  total: 0,
  page: 1,
  size: 10,
  status: 'LATE',
  clientQuery: '',
  startDate: '',
  endDate: '',
  orderBy: 'due_date',
  orderDir: 'asc',
  loading: false,
  error: null,
  async load(params) {
    const current = get()
    const status = params?.status ?? current.status
    const page = params?.page ?? current.page
    const size = params?.size ?? current.size
    const clientQuery = params?.clientQuery ?? current.clientQuery
    const startDate = params?.startDate ?? current.startDate
    const endDate = params?.endDate ?? current.endDate
    const orderBy = params?.orderBy ?? current.orderBy
    const orderDir = params?.orderDir ?? current.orderDir

    set({
      loading: true,
      error: null,
      status,
      page,
      size,
      clientQuery,
      startDate,
      endDate,
      orderBy,
      orderDir,
    })

    try {
      const data = await fetchInstallmentsDue({
        status,
        page,
        size,
        search: clientQuery,
        startDate,
        endDate,
        orderBy,
        orderDir,
      })
      set({
        items: data.items,
        total: data.total,
        counts: data.counts,
        status: data.status,
        page: data.page,
        size: data.size,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar vencimentos'
      set({ error: message })
    } finally {
      set({ loading: false })
    }
  },
  setStatus(status) {
    set({ status })
  },
  setPage(page) {
    set({ page })
  },
  setSize(size) {
    set({ size })
  },
  setClientQuery(value) {
    set({ clientQuery: value })
  },
  setStartDate(value) {
    set({ startDate: value })
  },
  setEndDate(value) {
    set({ endDate: value })
  },
  setOrderBy(value) {
    set({ orderBy: value })
  },
  setOrderDir(value) {
    set({ orderDir: value })
  },
}))
