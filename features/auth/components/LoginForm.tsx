'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginSchema } from '../schemas/loginSchema'
import { useAuthStore } from '../stores/useAuthStore'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const router = useRouter()
  const { login, loading, error, successMessage, clearMessages } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    if (error || successMessage) {
      const timeout = setTimeout(() => clearMessages(), 5000)
      return () => clearTimeout(timeout)
    }
  }, [error, successMessage, clearMessages])

  useEffect(() => {
    if (successMessage) {
      clearMessages()
      router.replace('/dashboard')
    }
  }, [successMessage, router, clearMessages])

  async function onSubmit(values: LoginSchema) {
    await login(values)
  }

  return (
    <div className="w-full bg-white border border-slate-200 rounded-md p-5 sm:p-6 shadow-sm">
      <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 text-center">
        Entre na sua conta
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm text-slate-700">
          E-mail
          <input
            type="email"
            {...register('email')}
            className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-slate-500"
            placeholder="Insira seu e-mail"
            autoComplete="email"
          />
          {errors.email && (
            <span className="text-xs text-red-600">{errors.email.message}</span>
          )}
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-700">
          Senha de acesso
          <input
            type="password"
            {...register('password')}
            className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-slate-500"
            placeholder="Insira sua senha"
            autoComplete="current-password"
          />
          {errors.password && (
            <span className="text-xs text-red-600">{errors.password.message}</span>
          )}
        </label>

        <button
          type="submit"
          disabled={loading}
          className="h-11 rounded-md bg-slate-900 text-white font-semibold disabled:opacity-60"
        >
          {loading ? 'Entrando...' : 'Acessar Conta'}
        </button>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        {successMessage && (
          <p className="text-sm text-emerald-600 text-center">{successMessage}</p>
        )}
      </form>
    </div>
  )
}
