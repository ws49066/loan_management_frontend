import { api } from '@/shared/api/axios'
import type { Loan } from '../types/loan'
import type { CreateLoanSchema } from '../schemas/createLoanSchema'

const LOANS_ENDPOINT = 'loans'

export async function createLoan(payload: CreateLoanSchema): Promise<Loan> {
  const sanitizedPayload = {
    ...payload,
    installment_value: payload.installment_value ?? undefined,
  }
  const { data } = await api.post<Loan>(LOANS_ENDPOINT, sanitizedPayload)
  return data
}
