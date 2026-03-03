import axios from 'axios'
import Cookies from 'js-cookie'
import { tokenService } from '@/shared/auth/tokenService'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BE_URL,
  withCredentials: false,
})


api.interceptors.request.use((config) => {
    const token = Cookies.get('auth_token')

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status

    if (status === 401 || status === 403) {
      tokenService.remove()

      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    return Promise.reject(error)
  },
)

export { api }
