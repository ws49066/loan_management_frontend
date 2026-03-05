import { api } from '@/shared/api/axios'
import { extractErrorMessage } from '@/shared/api/extractErrorMessage'
import type { Loan } from '../types/loan'
import type { CreateLoanSchema } from '../schemas/createLoanSchema'

const LOANS_ENDPOINT = 'loans'

export async function createLoan(payload: CreateLoanSchema): Promise<Loan> {
  try {
    const sanitizedPayload = {
      ...payload,
      installment_value: payload.installment_value ?? undefined,
    }
    const { data } = await api.post<Loan>(LOANS_ENDPOINT, sanitizedPayload)
    return data
  } catch (err) {
    const message = extractErrorMessage(err)
    if (message) {
      throw new Error(message)
    }
    throw err
  }
}
