import { api } from '@/shared/api/axios'
import { extractErrorMessage } from '@/shared/api/extractErrorMessage'
import { customerListSchema, customerSchema } from '../schemas/customerSchema'
import type { Customer } from '../types/customer'

const CUSTOMERS_ENDPOINT = 'clients'

type UpdateCustomerPayload = {
  name: string
  phone?: string | null
}

type CreateCustomerPayload = {
  name: string
  phone?: string | null
}

export async function fetchCustomers(): Promise<{ items: Customer[]; total: number }> {
  try {
    const { data } = await api.get(CUSTOMERS_ENDPOINT)
    const parsed = customerListSchema.parse(data)
    return { items: parsed.items, total: parsed.total }
  } catch (err) {
    const message = extractErrorMessage(err)
    if (message) {
      throw new Error(message)
    }
    throw err
  }
}

export async function createCustomer(payload: CreateCustomerPayload): Promise<Customer> {
  try {
    const { data } = await api.post(CUSTOMERS_ENDPOINT, payload)
    return customerSchema.parse(data)
  } catch (err) {
    const message = extractErrorMessage(err)
    if (message) {
      throw new Error(message)
    }
    throw err
  }
}

export async function updateCustomer(id: number, payload: UpdateCustomerPayload) {
  try {
    const { data } = await api.put(`${CUSTOMERS_ENDPOINT}/${id}`, payload)
    return data
  } catch (err) {
    const message = extractErrorMessage(err)
    if (message) {
      throw new Error(message)
    }
    throw err
  }
}
