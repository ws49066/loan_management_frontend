import { api } from '@/shared/api/axios'
import { loanListSchema } from '../schemas/loanSchema'
import type { Loan } from '../types/loan'

const LOANS_ENDPOINT = 'loans'

export async function fetchLoans(): Promise<Loan[]> {
  const { data } = await api.get(LOANS_ENDPOINT)
  return loanListSchema.parse(data)
}
