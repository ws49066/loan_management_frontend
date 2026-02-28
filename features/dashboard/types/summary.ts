export type DashboardSummary = {
  totalInvested: number
  totalLoaned: number
  totalReceived: number
  profit: number
  overdue: {
    count: number
    amount: number
  }
  upcoming: {
    count: number
    amount: number
  }
  activeLoans: {
    count: number
    amount: number
  }
}
