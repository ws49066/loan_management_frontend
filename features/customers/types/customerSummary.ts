export type CustomerSummary = {
  client: {
    id: number
    name: string
    phone?: string | null
  }
  totalLoaned: number
  totalToReceive: number
  totalReceived: number
  loansTotal: number
  loansActive: number
  history: CustomerLoanHistory[]
}

export type CustomerLoanHistory = {
  loanId?: number
  amount: number
  totalWithInterest: number
  totalInterest: number
  interestRate: number
  totalPaid: number
  totalPending: number
  installmentsCount: number
  installmentsPaid: number
  progress: number
  status: string
  firstDueDate: string
}
