import { api } from '@/shared/api/axios'
import { extractErrorMessage } from '@/shared/api/extractErrorMessage'
import { loanDetailsSchema } from '../schemas/loanDetailsSchema'
import type { LoanDetails } from '../types/loanDetails'

const LOANS_ENDPOINT = 'loans'

export async function fetchLoanDetails(id: number): Promise<LoanDetails> {
  try {
    const { data } = await api.get(`${LOANS_ENDPOINT}/${id}/details`)
    const parsed = loanDetailsSchema.parse(data)

    return {
      loan: {
        id: parsed.loan.id,
        clientId: parsed.loan.client_id,
        amount: parsed.loan.amount,
        totalWithInterest: parsed.loan.total_with_interest,
        totalInterest: parsed.loan.total_interest,
        interestRate: parsed.loan.interest_rate,
        totalPaid: parsed.loan.total_paid,
        totalPending: parsed.loan.total_pending,
        installmentsCount: parsed.loan.installments_count,
        installmentsPaid: parsed.loan.installments_paid,
        progress: parsed.loan.progress,
        status: parsed.loan.status,
        firstDueDate: parsed.loan.first_due_date,
        installmentValue: parsed.loan.installment_value,
        loanDate: parsed.loan.loan_date,
      },
      client: parsed.client,
      installments: parsed.installments.map((item) => ({
        id: item.id,
        number: item.number,
        installment: item.installment_label,
        dueDate: item.due_date,
        amount: item.amount,
        status: item.status,
        info: item.info ?? '',
        daysLate: item.days_late,
        paymentDate: item.payment_date,
      })),
    }
  } catch (err) {
    const message = extractErrorMessage(err)
    if (message) {
      throw new Error(message)
    }
    throw err
  }
}
