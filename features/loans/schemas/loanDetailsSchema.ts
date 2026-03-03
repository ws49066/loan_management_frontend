import { z } from 'zod'

export const loanDetailsSchema = z.object({
  loan: z.object({
    id: z.number(),
    cliente_id: z.number(),
    valor: z.number(),
    total_com_juros: z.number(),
    total_juros: z.number(),
    taxa_juros: z.number(),
    total_pago: z.number(),
    total_pendente: z.number(),
    quantidade_parcelas: z.number(),
    parcelas_pagas: z.number(),
    progresso: z.number(),
    status: z.string(),
    primeiro_vencimento: z.string(),
    valor_parcela: z.number(),
    data_emprestimo: z.string(),
  }),
  client: z.object({
    id: z.number(),
    name: z.string(),
    phone: z.string().nullable().optional(),
  }),
  installments: z.array(
    z.object({
      id: z.number(),
      numero: z.number(),
      parcela: z.string(),
      vencimento: z.string(),
      valor: z.number(),
      status: z.string(),
      informacao: z.string().nullable().optional(),
      dias_atraso: z.number().nullable(),
      pagamento: z.string().nullable(),
    }),
  ),
})

export type LoanDetailsSchema = z.infer<typeof loanDetailsSchema>
