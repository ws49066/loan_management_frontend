import { api } from '@/shared/api/axios'
import { extractErrorMessage } from '@/shared/api/extractErrorMessage'
import type { DashboardSummary } from '../types/summary'

type DashboardSummaryApi = {
  total_invested: number
  total_loaned: number
  total_received: number
  profit: number
  overdue: {
    count: number
    amount: number
  }
  upcoming: {
    count: number
    amount: number
  }
  active_loans: {
    count: number
    amount: number
  }
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  try {
    const { data } = await api.get<DashboardSummaryApi>('dashboard/summary')
    return {
      totalInvested: data.total_invested,
      totalLoaned: data.total_loaned,
      totalReceived: data.total_received,
      profit: data.profit,
      overdue: data.overdue,
      upcoming: data.upcoming,
      activeLoans: data.active_loans,
    }
  } catch (err) {
    const message = extractErrorMessage(err)
    if (message) {
      throw new Error(message)
    }
    throw err
  }
}
