import { z } from 'zod'

export const customerSummaryHistorySchema = z.object({
  id: z.number().optional(),
  loan_id: z.number().optional(),
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
})

export const customerSummarySchema = z.object({
  client: z.object({
    id: z.number(),
    name: z.string(),
    phone: z.string().nullable().optional(),
  }),
  total_loaned: z.number(),
  total_to_receive: z.number(),
  total_received: z.number(),
  loans_total: z.number(),
  loans_active: z.number(),
  history: z.array(customerSummaryHistorySchema),
})

export type CustomerSummarySchema = z.infer<typeof customerSummarySchema>
