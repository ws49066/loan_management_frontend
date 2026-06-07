import { z } from 'zod'

const installmentDueItemSchema = z.object({
  installment_id: z.number(),
  loan_id: z.number(),
  client_id: z.number(),
  client_name: z.string(),
  client_phone: z.string().nullable().optional(),
  installment_label: z.string(),
  number: z.number(),
  total_installments: z.number(),
  due_date: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['PENDING', 'LATE', 'PAID']),
  info: z.string().nullable().optional(),
  days_late: z.number().nullable().optional(),
  payment_date: z.string().nullable().optional(),
})

export const installmentsDueSchema = z.object({
  total: z.number(),
  page: z.number(),
  size: z.number(),
  status: z.enum(['ALL', 'PENDING', 'LATE', 'PAID']),
  counts: z.object({
    all: z.number(),
    pending: z.number(),
    late: z.number(),
    paid: z.number(),
  }),
  items: z.array(installmentDueItemSchema),
})

export type InstallmentsDueSchema = z.infer<typeof installmentsDueSchema>
