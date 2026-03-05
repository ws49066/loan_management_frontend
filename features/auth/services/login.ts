import { api } from '@/shared/api/axios'
import { extractErrorMessage } from '@/shared/api/extractErrorMessage'
import type { LoginResponse } from '../types/auth'
import type { LoginSchema } from '../schemas/loginSchema'

const LOGIN_ENDPOINT = 'users/login'

export async function loginService(payload: LoginSchema) {
  try {
    const { data } = await api.post<LoginResponse>(LOGIN_ENDPOINT, payload)
    return data
  } catch (err) {
    const message = extractErrorMessage(err)
    if (message) {
      throw new Error(message)
    }
    throw err
  }
}
