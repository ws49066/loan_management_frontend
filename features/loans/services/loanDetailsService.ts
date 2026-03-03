import { api } from '@/shared/api/axios'
import { loanDetailsSchema } from '../schemas/loanDetailsSchema'
import type { LoanDetails } from '../types/loanDetails'

const LOANS_ENDPOINT = 'loans'

export async function fetchLoanDetails(id: number): Promise<LoanDetails> {
  const { data } = await api.get(`${LOANS_ENDPOINT}/${id}/details`)
  const parsed = loanDetailsSchema.parse(data)

  return {
    loan: {
      id: parsed.loan.id,
      clientId: parsed.loan.cliente_id,
      amount: parsed.loan.valor,
      totalWithInterest: parsed.loan.total_com_juros,
      totalInterest: parsed.loan.total_juros,
      interestRate: parsed.loan.taxa_juros,
      totalPaid: parsed.loan.total_pago,
      totalPending: parsed.loan.total_pendente,
      installmentsCount: parsed.loan.quantidade_parcelas,
      installmentsPaid: parsed.loan.parcelas_pagas,
      progress: parsed.loan.progresso,
      status: parsed.loan.status,
      firstDueDate: parsed.loan.primeiro_vencimento,
      installmentValue: parsed.loan.valor_parcela,
      loanDate: parsed.loan.data_emprestimo,
    },
    client: parsed.client,
    installments: parsed.installments.map((item) => ({
      id: item.id,
      number: item.numero,
      installment: item.parcela,
      dueDate: item.vencimento,
      amount: item.valor,
      status: item.status,
      info: item.informacao ?? '',
      daysLate: item.dias_atraso,
      paymentDate: item.pagamento,
    })),
  }
}
