import { z } from 'zod'

export const customerSummaryHistorySchema = z.object({
  id: z.number().optional(),
  loan_id: z.number().optional(),
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
})

export const customerSummarySchema = z.object({
  client: z.object({
    id: z.number(),
    name: z.string(),
    phone: z.string().nullable().optional(),
  }),
  total_emprestado: z.number(),
  total_a_receber: z.number(),
  total_recebido: z.number(),
  emprestimos_total: z.number(),
  emprestimos_ativos: z.number(),
  historico: z.array(customerSummaryHistorySchema),
})

export type CustomerSummarySchema = z.infer<typeof customerSummarySchema>
