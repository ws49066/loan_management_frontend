export type LoginResponse = {
  success: boolean
  message: string
  data?: {
    access_token: string
    refresh_token: string
    token_type: string
  }
}
