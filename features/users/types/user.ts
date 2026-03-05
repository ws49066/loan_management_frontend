export type UserRole = 'ADMIN' | 'OPERATOR' | (string & {})

export type User = {
  id: string | number
  name?: string | null
  email: string
  role?: UserRole | null
  is_active: boolean
}
