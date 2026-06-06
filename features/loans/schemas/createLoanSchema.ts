import { z } from 'zod'

const optionalNumber = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) {
    return undefined
  }
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}, z.number().positive('Enter a valid amount'))

export const createLoanSchema = z.object({
  client_id: z.coerce.number().int().positive('Select a customer'),
  amount: z.coerce.number().positive('Enter a valid amount'),
  interest_rate: z.coerce.number().min(0, 'Enter a valid interest rate'),
  installment_value: optionalNumber.optional(),
  installments: z.coerce.number().int().positive('Enter a valid number of installments'),
  first_due_date: z
    .string()
    .min(1, 'Enter the first due date')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
})

export type CreateLoanSchema = z.infer<typeof createLoanSchema>
export type CreateLoanFormValues = z.input<typeof createLoanSchema>
