export type Loan = {
  id: string
  borrowerName: string
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  createdAt: string
}
