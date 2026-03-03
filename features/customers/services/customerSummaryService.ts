import { api } from '@/shared/api/axios'
import { customerSummarySchema } from '../schemas/customerSummarySchema'
import type { CustomerSummary } from '../types/customerSummary'

const CUSTOMERS_ENDPOINT = 'clients'

export async function fetchCustomerSummary(id: number): Promise<CustomerSummary> {
  const { data } = await api.get(`${CUSTOMERS_ENDPOINT}/${id}/summary`)
  const parsed = customerSummarySchema.parse(data)

  return {
    client: parsed.client,
    totalLoaned: parsed.total_emprestado,
    totalToReceive: parsed.total_a_receber,
    totalReceived: parsed.total_recebido,
    loansTotal: parsed.emprestimos_total,
    loansActive: parsed.emprestimos_ativos,
    history: parsed.historico.map((item) => ({
      loanId: item.loan_id ?? item.id,
      amount: item.valor,
      totalWithInterest: item.total_com_juros,
      totalInterest: item.total_juros,
      interestRate: item.taxa_juros,
      totalPaid: item.total_pago,
      totalPending: item.total_pendente,
      installmentsCount: item.quantidade_parcelas,
      installmentsPaid: item.parcelas_pagas,
      progress: item.progresso,
      status: item.status,
      firstDueDate: item.primeiro_vencimento,
    })),
  }
}
