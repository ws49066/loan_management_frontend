import { api } from '@/shared/api/axios'
import { extractErrorMessage } from '@/shared/api/extractErrorMessage'

type PayInstallmentPayload = {
  received_amount: number
  discount: number
  extra: number
}

export async function payInstallment(installmentId: number, payload: PayInstallmentPayload) {
  try {
    const { data } = await api.post(`loans/installments/${installmentId}/pay`, payload)
    return data
  } catch (err) {
    const message = extractErrorMessage(err)
    if (message) {
      throw new Error(message)
    }
    throw err
  }
}
