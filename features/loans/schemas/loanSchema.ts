import { z } from 'zod'

export const loanSchema = z.object({
  id: z.string(),
  borrowerName: z.string(),
  amount: z.number(),
  status: z.enum(['pending', 'approved', 'rejected', 'paid']),
  createdAt: z.string(),
})

export const loanListSchema = z.array(loanSchema)

export type LoanSchema = z.infer<typeof loanSchema>
