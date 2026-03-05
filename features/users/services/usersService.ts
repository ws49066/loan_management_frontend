import { api } from '@/shared/api/axios'
import { extractErrorMessage } from '@/shared/api/extractErrorMessage'
import { userListSchema, userSchema } from '../schemas/userSchema'
import type { User } from '../types/user'

const USERS_ENDPOINT = 'users'

type CreateUserPayload = {
  name: string
  email: string
  password: string
  role: string
  is_active: boolean
}

type UpdateUserPayload = {
  name?: string | null
  email?: string
  role?: string | null
  is_active?: boolean
  password?: string
}

const extractArray = (payload: unknown) => {
  if (Array.isArray(payload)) return payload
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    const knownKeys = ['items', 'users', 'data', 'results']
    for (const key of knownKeys) {
      if (Array.isArray(record[key])) return record[key]
    }
    const firstArray = Object.values(record).find(Array.isArray)
    if (firstArray) return firstArray
  }
  return payload
}

const extractTotal = (payload: unknown, itemsCount: number) => {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    if (typeof record.total === 'number') return record.total
  }
  return itemsCount
}

export async function fetchUsers(
  params: { page?: number; size?: number } = {}
): Promise<{ items: User[]; total: number }> {
  try {
    const { data } = await api.get(`${USERS_ENDPOINT}/`, {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 10,
      },
    })
    const rawItems = extractArray(data)
    const items = userListSchema.parse(rawItems)
    const total = extractTotal(data, items.length)
    return { items, total }
  } catch (err) {
    const message = extractErrorMessage(err)
    if (message) {
      throw new Error(message)
    }
    throw err
  }
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  try {
    const { data } = await api.post(USERS_ENDPOINT, payload)
    const record = data && typeof data === 'object' ? (data as Record<string, unknown>) : null
    const candidate = record?.data ?? record?.user ?? record?.result ?? data
    return userSchema.parse(candidate)
  } catch (err) {
    const message = extractErrorMessage(err)
    if (message) {
      throw new Error(message)
    }
    throw err
  }
}

export async function updateUser(id: string | number, payload: UpdateUserPayload) {
  try {
    const { data } = await api.put(`${USERS_ENDPOINT}/${id}`, payload)
    return data
  } catch (err) {
    const message = extractErrorMessage(err)
    if (message) {
      throw new Error(message)
    }
    throw err
  }
}
