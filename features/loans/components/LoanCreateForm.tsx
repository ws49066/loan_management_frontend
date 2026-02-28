'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createLoanSchema, type CreateLoanSchema } from '../schemas/createLoanSchema'
import { useLoansStore } from '../stores/useLoansStore'

export function LoanCreateForm() {
  const { create, creating, error } = useLoansStore()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateLoanSchema>({
    resolver: zodResolver(createLoanSchema),
    defaultValues: {
      borrowerName: '',
      amount: 0,
    },
  })

  async function onSubmit(values: CreateLoanSchema) {
    await create(values)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-slate-700">
          Nome do cliente
          <input
            type="text"
            {...register('borrowerName')}
            className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-slate-500"
            placeholder="Ex: Ana Souza"
          />
          {errors.borrowerName && (
            <span className="text-xs text-red-600">{errors.borrowerName.message}</span>
          )}
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-700">
          Valor do empréstimo
          <input
            type="number"
            step="0.01"
            {...register('amount', { valueAsNumber: true })}
            className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-slate-500"
            placeholder="0,00"
          />
          {errors.amount && (
            <span className="text-xs text-red-600">{errors.amount.message}</span>
          )}
        </label>
      </div>

      <button
        type="submit"
        disabled={creating}
        className="h-11 rounded-md bg-slate-900 text-white font-semibold disabled:opacity-60"
      >
        {creating ? 'Salvando...' : 'Criar empréstimo'}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  )
}
