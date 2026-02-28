import { api } from '@/shared/api/axios'

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
  const { data } = await api.get<MeResponse>('users/me')
  return data
}
