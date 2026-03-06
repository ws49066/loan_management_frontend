import { z } from 'zod'

const optionalNumber = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) {
    return undefined
  }
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}, z.number().positive('Informe um valor válido'))

export const createLoanSchema = z.object({
  client_id: z.coerce.number().int().positive('Selecione um cliente'),
  amount: z.coerce.number().positive('Informe um valor válido'),
  interest_rate: z.coerce.number().min(0, 'Informe uma taxa válida'),
  installment_value: optionalNumber.optional(),
  installments: z.coerce.number().int().positive('Informe um número de parcelas válido'),
  first_due_date: z
    .string()
    .min(1, 'Informe a primeira parcela')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
})

export type CreateLoanSchema = z.infer<typeof createLoanSchema>
export type CreateLoanFormValues = z.input<typeof createLoanSchema>
