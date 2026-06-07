import { api } from '@/shared/api/axios'
import { extractErrorMessage } from '@/shared/api/extractErrorMessage'
import { customerSummarySchema } from '../schemas/customerSummarySchema'
import type { CustomerSummary } from '../types/customerSummary'

const CUSTOMERS_ENDPOINT = 'clients'

export async function fetchCustomerSummary(id: number): Promise<CustomerSummary> {
  try {
    const { data } = await api.get(`${CUSTOMERS_ENDPOINT}/${id}/summary`)
    const parsed = customerSummarySchema.parse(data)

    return {
      client: parsed.client,
      totalLoaned: parsed.total_loaned,
      totalToReceive: parsed.total_to_receive,
      totalReceived: parsed.total_received,
      loansTotal: parsed.loans_total,
      loansActive: parsed.loans_active,
      history: parsed.history.map((item) => ({
        loanId: item.loan_id ?? item.id,
        amount: item.amount,
        totalWithInterest: item.total_with_interest,
        totalInterest: item.total_interest,
        interestRate: item.interest_rate,
        totalPaid: item.total_paid,
        totalPending: item.total_pending,
        installmentsCount: item.installments_count,
        installmentsPaid: item.installments_paid,
        progress: item.progress,
        status: item.status,
        firstDueDate: item.first_due_date,
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
