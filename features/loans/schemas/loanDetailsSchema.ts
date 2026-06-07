import { z } from 'zod'

export const loanDetailsSchema = z.object({
  loan: z.object({
    id: z.number(),
    client_id: z.number(),
    amount: z.number(),
    total_with_interest: z.number(),
    total_interest: z.number(),
    interest_rate: z.number(),
    total_paid: z.number(),
    total_pending: z.number(),
    installments_count: z.number(),
    installments_paid: z.number(),
    progress: z.number(),
    status: z.string(),
    first_due_date: z.string(),
    installment_value: z.number(),
    loan_date: z.string(),
  }),
  client: z.object({
    id: z.number(),
    name: z.string(),
    phone: z.string().nullable().optional(),
  }),
  installments: z.array(
    z.object({
      id: z.number(),
      number: z.number(),
      installment_label: z.string(),
      due_date: z.string(),
      amount: z.number(),
      status: z.string(),
      info: z.string().nullable().optional(),
      days_late: z.number().nullable(),
      payment_date: z.string().nullable(),
    }),
  ),
})

export type LoanDetailsSchema = z.infer<typeof loanDetailsSchema>
