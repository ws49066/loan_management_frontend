import { z } from 'zod'

const optionalPositiveNumber = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) {
    return undefined
  }
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}, z.number().positive('Enter a valid amount'))

export const simulateLoanProposalSchema = z.object({
  amount: z.coerce.number().positive('Enter a valid amount'),
  interest_rate: z.coerce.number().min(0, 'Enter a valid rate'),
  installment_value: optionalPositiveNumber.optional(),
  installments: z.coerce.number().int().positive('Enter a valid number of installments'),
  first_due_date: z
    .string()
    .min(1, 'Enter the first due date')
    .regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/, 'Invalid date'),
})

export type SimulateLoanProposalSchema = z.infer<typeof simulateLoanProposalSchema>
export type SimulateLoanProposalFormValues = z.input<typeof simulateLoanProposalSchema>

const optionalNumber = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) {
    return undefined
  }
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}, z.number())

export const loanSimulationProposalResultSchema = z.object({
  valor_contratado: z.coerce.number(),
  total_com_juros: optionalNumber.optional(),
  total_juros: optionalNumber.optional(),
  taxa_juros: optionalNumber.optional(),
  quantidade_parcelas: optionalNumber.optional(),
  valor_primeira_parcela: z.coerce.number(),
  data_primeira_parcela: z.string(),
  valor_ultima_parcela: optionalNumber.optional().nullable(),
  data_ultima_parcela: z.string().optional().nullable(),
})

export type LoanSimulationProposalResult = z.infer<typeof loanSimulationProposalResultSchema>
