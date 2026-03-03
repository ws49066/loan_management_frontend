import { api } from '@/shared/api/axios'

type LoanSimulationPayload = {
  amount: number
  interest_rate: number
  installment_value: number
  installments: number
}

type LoanSimulationResponse = Record<string, number>

const LOANS_SIMULATE_ENDPOINT = 'loans/simulate'

export async function simulateLoan(payload: LoanSimulationPayload): Promise<LoanSimulationResponse> {
  const { data } = await api.post<LoanSimulationResponse>(LOANS_SIMULATE_ENDPOINT, payload)
  return data
}
