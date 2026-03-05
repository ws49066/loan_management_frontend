import { api } from '@/shared/api/axios'
import { extractErrorMessage } from '@/shared/api/extractErrorMessage'
import { loanListSchema } from '../schemas/loanSchema'
import type { Loan } from '../types/loan'

const LOANS_ENDPOINT = 'loans'

export async function fetchLoans(): Promise<Loan[]> {
  try {
    const { data } = await api.get(LOANS_ENDPOINT)
    const extractArray = (payload: unknown) => {
      if (Array.isArray(payload)) return payload
      if (payload && typeof payload === 'object') {
        const record = payload as Record<string, unknown>
        const knownKeys = ['items', 'loans', 'data', 'results']
        for (const key of knownKeys) {
          if (Array.isArray(record[key])) return record[key]
        }
        const firstArray = Object.values(record).find(Array.isArray)
        if (firstArray) return firstArray
      }
      return payload
    }

    return loanListSchema.parse(extractArray(data))
  } catch (err) {
    const message = extractErrorMessage(err)
    if (message) {
      throw new Error(message)
    }
    throw err
  }
}
