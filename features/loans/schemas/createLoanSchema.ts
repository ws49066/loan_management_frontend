import { z } from 'zod'

export const createLoanSchema = z.object({
  borrowerName: z.string().min(3, 'Informe o nome do cliente'),
  amount: z.coerce.number().positive('Informe um valor válido'),
})

export type CreateLoanSchema = z.infer<typeof createLoanSchema>
