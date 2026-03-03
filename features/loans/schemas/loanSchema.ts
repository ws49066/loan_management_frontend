import { z } from 'zod'

export const loanSchema = z.object({
  client_name: z.string(),
  amount: z.coerce.number(),
  installments_count: z.coerce.number(),
  installment_value: z.coerce.number(),
  paid_installments: z.coerce.number(),
  status: z.enum(['ACTIVE', 'PAID', 'PENDING', 'REJECTED']),
  created_at: z.string(),
})

export const loanListSchema = z.array(loanSchema)

export type LoanSchema = z.infer<typeof loanSchema>
