import { api } from '@/shared/api/axios'
import { extractErrorMessage } from '@/shared/api/extractErrorMessage'
import {
  loanSimulationProposalResultSchema,
  type LoanSimulationProposalResult,
  type SimulateLoanProposalSchema,
} from '../schemas/simulateLoanProposalSchema'

type SimulationResponse = {
  success?: boolean
  message?: string
  data?: LoanSimulationProposalResult
}

const LOANS_SIMULATE_PROPOSAL_ENDPOINT = 'loans/simulate/proposal'

export async function simulateLoanProposal(
  payload: SimulateLoanProposalSchema,
): Promise<LoanSimulationProposalResult> {
  try {
    const { data } = await api.post<SimulationResponse | LoanSimulationProposalResult>(
      LOANS_SIMULATE_PROPOSAL_ENDPOINT,
      payload,
    )
    if (data && typeof data === 'object' && 'success' in data && data.success === false) {
      throw new Error(data.message || 'Falha ao simular proposta')
    }
    const payloadData = data && typeof data === 'object' && 'data' in data ? data.data : data
    return loanSimulationProposalResultSchema.parse(payloadData ?? {})
  } catch (err) {
    const message = extractErrorMessage(err)
    if (message) {
      throw new Error(message)
    }
    throw err
  }
}
