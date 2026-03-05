import { api } from '@/shared/api/axios'
import { extractErrorMessage } from '@/shared/api/extractErrorMessage'

export type MeResponse = {
  success: boolean
  data?: {
    id: string
    name?: string | null
    email: string
    role?: string | null
  }
}

export async function getMe() {
  try {
    const { data } = await api.get<MeResponse>('users/me')
    return data
  } catch (err) {
    const message = extractErrorMessage(err)
    if (message) {
      throw new Error(message)
    }
    throw err
  }
}
