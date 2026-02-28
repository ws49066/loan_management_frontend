import { api } from '@/shared/api/axios'
import { customerListSchema } from '../schemas/customerSchema'
import type { Customer } from '../types/customer'

const CUSTOMERS_ENDPOINT = 'clients'

type UpdateCustomerPayload = {
  name: string
  phone?: string | null
}

export async function fetchCustomers(): Promise<{ items: Customer[]; total: number }> {
  const { data } = await api.get(CUSTOMERS_ENDPOINT)
  const parsed = customerListSchema.parse(data)
  return { items: parsed.items, total: parsed.total }
}

export async function updateCustomer(id: number, payload: UpdateCustomerPayload) {
  try {
    const { data } = await api.put(`${CUSTOMERS_ENDPOINT}/${id}`, payload)
    return data
  } catch (err) {
    if (err && typeof err === 'object' && 'response' in err) {
      const response = (err as { response?: { data?: { message?: string; error?: string } } }).response
      const message = response?.data?.message || response?.data?.error
      if (message) {
        throw new Error(message)
      }
    }
    throw err
  }
}
