import { api } from '@/shared/api/axios'
import { extractErrorMessage } from '@/shared/api/extractErrorMessage'
import { installmentsDueSchema } from '../schemas/installmentsDueSchema'
import type { InstallmentStatus, InstallmentsDueResponse } from '../types/installmentsDue'

const DUE_ENDPOINT = 'loans/installments/due'

type FetchInstallmentsDueParams = {
  status: InstallmentStatus
  page: number
  size: number
  search?: string
  startDate?: string
  endDate?: string
  orderBy?: 'due_date' | 'amount' | 'delay'
  orderDir?: 'asc' | 'desc'
}

export async function fetchInstallmentsDue({
  status,
  page,
  size,
  search,
  startDate,
  endDate,
  orderBy,
  orderDir,
}: FetchInstallmentsDueParams): Promise<InstallmentsDueResponse> {
  try {
    const { data } = await api.get(DUE_ENDPOINT, {
      params: {
        status,
        page,
        size,
        search: search || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        order_by: orderBy || undefined,
        order_dir: orderDir || undefined,
      },
    })

    const parsed = installmentsDueSchema.parse(data)

    return {
      total: parsed.total,
      page: parsed.page,
      size: parsed.size,
      status: parsed.status,
      counts: parsed.counts,
      items: parsed.items.map((item) => ({
        installmentId: item.installment_id,
        loanId: item.loan_id,
        clientId: item.client_id,
        clientName: item.client_name,
        clientPhone: item.client_phone,
        installmentLabel: item.installment_label,
        installmentNumber: item.installment_number,
        totalInstallments: item.total_installments,
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
