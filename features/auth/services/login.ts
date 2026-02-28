import { api } from '@/shared/api/axios'
import type { LoginResponse } from '../types/auth'
import type { LoginSchema } from '../schemas/loginSchema'

const LOGIN_ENDPOINT = 'users/login'

export async function loginService(payload: LoginSchema) {
  const { data } = await api.post<LoginResponse>(LOGIN_ENDPOINT, payload)
  return data
}
