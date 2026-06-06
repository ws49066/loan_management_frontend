export type InstallmentStatus = 'ALL' | 'PENDING' | 'LATE' | 'PAID'

export type InstallmentsDueCounts = {
  all: number
  pending: number
  late: number
  paid: number
}

export type InstallmentDueItem = {
  installmentId: number
  loanId: number
  clientId: number
  clientName: string
  clientPhone?: string | null
  installmentLabel: string
  installmentNumber: number
  totalInstallments: number
  dueDate: string
  amount: number
  status: 'PENDING' | 'LATE' | 'PAID'
  info?: string | null
  daysLate?: number | null
  paymentDate?: string | null
}

export type InstallmentsDueResponse = {
  total: number
  page: number
  size: number
  status: InstallmentStatus
  counts: InstallmentsDueCounts
  items: InstallmentDueItem[]
}
