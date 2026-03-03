export type LoanDetails = {
  loan: LoanDetailsInfo
  client: LoanDetailsClient
  installments: LoanInstallment[]
}

export type LoanDetailsInfo = {
  id: number
  clientId: number
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
  installmentValue: number
  loanDate: string
}

export type LoanDetailsClient = {
  id: number
  name: string
  phone?: string | null
}

export type LoanInstallment = {
  id: number
  number: number
  installment: string
  dueDate: string
  amount: number
  status: string
  info: string
  daysLate: number | null
  paymentDate: string | null
}
