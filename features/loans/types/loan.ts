export type Loan = {
  client_name: string
  amount: number
  installments_count: number
  installment_value: number
  paid_installments: number
  status: 'ACTIVE' | 'PAID' | 'PENDING' | 'REJECTED'
  created_at: string
}
