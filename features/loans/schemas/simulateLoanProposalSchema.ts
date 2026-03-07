import { z } from 'zod'

const optionalPositiveNumber = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) {
    return undefined
  }
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}, z.number().positive('Informe um valor válido'))

export const simulateLoanProposalSchema = z.object({
  amount: z.coerce.number().positive('Informe um valor válido'),
  interest_rate: z.coerce.number().min(0, 'Informe uma taxa válida'),
  installment_value: optionalPositiveNumber.optional(),
  installments: z.coerce.number().int().positive('Informe um número de parcelas válido'),
  first_due_date: z
    .string()
    .min(1, 'Informe a primeira parcela')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
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
