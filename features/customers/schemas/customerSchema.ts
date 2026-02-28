import { z } from 'zod'

export const customerSchema = z.object({
  id: z.number(),
  name: z.string(),
  phone: z.string().optional().nullable(),
})

export const customerListSchema = z.object({
  total: z.number(),
  page: z.number(),
  size: z.number(),
  items: z.array(customerSchema),
})

export type CustomerSchema = z.infer<typeof customerSchema>
export type CustomerListSchema = z.infer<typeof customerListSchema>
