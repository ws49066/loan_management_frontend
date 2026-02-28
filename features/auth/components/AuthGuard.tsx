'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { tokenService } from '@/shared/auth/tokenService'
import { useAuthStore } from '../stores/useAuthStore'

type AuthGuardProps = {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)
  const loadMe = useAuthStore((state) => state.loadMe)
  const clearMessages = useAuthStore((state) => state.clearMessages)

  useEffect(() => {
    const token = tokenService.get()

    if (!token) {
      router.replace('/login')
      return
    }

    let isMounted = true

    async function validate() {
      try {
        const ok = await loadMe()
        if (!ok) {
          throw new Error('Token inválido')
        }
        if (isMounted) {
          setIsReady(true)
        }
      } catch {
        tokenService.remove()
        clearMessages()
        router.replace('/login')
      }
    }

    void validate()

    return () => {
      isMounted = false
    }
  }, [router, loadMe, clearMessages])

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Validando sessão...</p>
      </div>
    )
  }

  return <>{children}</>
}
