import { api } from '@/shared/api/axios'

type PayInstallmentPayload = {
  received_amount: number
  discount: number
  extra: number
}

export async function payInstallment(installmentId: number, payload: PayInstallmentPayload) {
  const { data } = await api.post(`loans/installments/${installmentId}/pay`, payload)
  return data
}
