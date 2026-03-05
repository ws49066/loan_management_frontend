import { api } from '@/shared/api/axios'
import { extractErrorMessage } from '@/shared/api/extractErrorMessage'

type LoanSimulationPayload = {
  amount: number
  interest_rate: number
  installment_value: number
  installments: number
}

type LoanSimulationResponse = Record<string, number>

const LOANS_SIMULATE_ENDPOINT = 'loans/simulate'

export async function simulateLoan(payload: LoanSimulationPayload): Promise<LoanSimulationResponse> {
  try {
    const { data } = await api.post<LoanSimulationResponse>(LOANS_SIMULATE_ENDPOINT, payload)
    return data
  } catch (err) {
    const message = extractErrorMessage(err)
    if (message) {
      throw new Error(message)
    }
    throw err
  }
}
