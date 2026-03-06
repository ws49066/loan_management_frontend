'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/features/auth'
import { UsersList } from '@/features/users/components/UsersList'

export default function UsersPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.replace('/dashboard')
    }
  }, [user, router])

  if (!user) {
    return <p className="text-slate-600">Carregando usuários...</p>
  }

  if (user.role !== 'ADMIN') {
    return <p className="text-slate-600">Você não tem permissão para acessar.</p>
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <section className="mt-6 rounded-md bg-white p-4 shadow-sm">
        <UsersList />
      </section>
    </div>
  )
}
