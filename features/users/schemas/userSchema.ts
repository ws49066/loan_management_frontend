import { z } from 'zod'

export const userSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string().optional().nullable(),
  email: z.string(),
  role: z.string().optional().nullable(),
  is_active: z.boolean().optional().default(true),
})

export const userListSchema = z.array(userSchema)

export type UserSchema = z.infer<typeof userSchema>
