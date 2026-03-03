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
  parcela: string
  numero: number
  totalParcelas: number
  vencimento: string
  valor: number
  status: 'PENDING' | 'LATE' | 'PAID'
  informacao?: string | null
  diasAtraso?: number | null
  pagamento?: string | null
}

export type InstallmentsDueResponse = {
  total: number
  page: number
  size: number
  status: InstallmentStatus
  counts: InstallmentsDueCounts
  items: InstallmentDueItem[]
}
