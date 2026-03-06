'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createLoanSchema, type CreateLoanSchema, type CreateLoanFormValues } from '../schemas/createLoanSchema'
import { useLoansStore } from '../stores/useLoansStore'
import { useCustomersStore } from '@/features/customers/stores/useCustomersStore'
import { simulateLoan } from '../services/simulateLoanService'
import { useRouter } from 'next/navigation'

type LoanSummary = {
  installmentValue: number
  totalToReceive: number
  totalInterest: number
  interestPercent: number
}

const emptySummary: LoanSummary = {
  installmentValue: 0,
  totalToReceive: 0,
  totalInterest: 0,
  interestPercent: 0,
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatPercent(value: number) {
  return `${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`
}

function normalizeNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function mapSimulationResponse(
  response: Record<string, number>,
  fallback: { amount: number; installments: number }
): LoanSummary {
  const installmentValue =
    normalizeNumber(response.installment_value) ||
    normalizeNumber(response.installmentValue) ||
    normalizeNumber(response.parcela) ||
    normalizeNumber(response.installment)

  const totalToReceive =
    normalizeNumber(response.total_to_receive) ||
    normalizeNumber(response.total_receivable) ||
    normalizeNumber(response.total) ||
    normalizeNumber(response.total_amount)

  const totalInterest =
    normalizeNumber(response.total_interest) ||
    normalizeNumber(response.interest_total) ||
    normalizeNumber(response.juros_total)

  const interestPercent =
    normalizeNumber(response.interest_percent) ||
    normalizeNumber(response.interest_percentage) ||
    normalizeNumber(response.interest_rate) ||
    normalizeNumber(response.percent)

  const inferredTotal =
    totalToReceive || (installmentValue > 0 ? installmentValue * fallback.installments : 0)
  const inferredInterest =
    totalInterest || (inferredTotal > 0 ? Math.max(inferredTotal - fallback.amount, 0) : 0)
  const inferredPercent =
    interestPercent || (fallback.amount > 0 ? (inferredInterest / fallback.amount) * 100 : 0)

  return {
    installmentValue,
    totalToReceive: inferredTotal,
    totalInterest: inferredInterest,
    interestPercent: inferredPercent,
  }
}

export function LoanCreateForm() {
  const router = useRouter()
  const { create, creating, error } = useLoansStore()
  const {
    items: customers,
    loading: customersLoading,
    error: customersError,
    load: loadCustomers,
  } = useCustomersStore()

  const [summary, setSummary] = useState<LoanSummary>(emptySummary)
  const [simulating, setSimulating] = useState(false)
  const [simulationError, setSimulationError] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingPayload, setPendingPayload] = useState<CreateLoanSchema | null>(null)

  const todayString = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const resolver: Resolver<CreateLoanFormValues> = zodResolver(createLoanSchema)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateLoanFormValues>({
    resolver,
    defaultValues: {
      client_id: 0,
      amount: 0,
      interest_rate: 0,
      installment_value: undefined,
      installments: 1,
      first_due_date: todayString,
    },
  })

  const [amount, interestRate, installmentValue, installments] = useWatch({
    control,
    name: ['amount', 'interest_rate', 'installment_value', 'installments'],
  })
  const amountValue = normalizeNumber(amount)
  const interestRateValue = normalizeNumber(interestRate)
  const installmentValueNumber = normalizeNumber(installmentValue)
  const installmentsValue = Math.max(0, Math.round(normalizeNumber(installments)))

  useEffect(() => {
    if (customers.length === 0) {
      void loadCustomers()
    }
  }, [customers.length, loadCustomers])

  useEffect(() => {
    const canSimulate = amountValue > 0 && installmentsValue > 0

    if (!canSimulate) {
      setSummary(emptySummary)
      setSimulationError(null)
      return
    }

    const timeout = window.setTimeout(() => {
      setSimulating(true)
      setSimulationError(null)

      void simulateLoan({
        amount: amountValue,
        interest_rate: interestRateValue,
        installment_value: installmentValueNumber,
        installments: installmentsValue,
      })
        .then((data) => {
          setSummary(mapSimulationResponse(data, { amount: amountValue, installments: installmentsValue }))
        })
        .catch((err) => {
          const message = err instanceof Error ? err.message : 'Falha ao simular o empréstimo'
          setSimulationError(message)
          setSummary(emptySummary)
        })
        .finally(() => {
          setSimulating(false)
        })
    }, 400)

    return () => window.clearTimeout(timeout)
  }, [amountValue, interestRateValue, installmentValueNumber, installmentsValue])

  function onSubmit(values: CreateLoanFormValues) {
    const parsed = createLoanSchema.parse(values)
    setPendingPayload(parsed)
    setShowConfirm(true)
  }

  async function handleConfirmCreate() {
    if (!pendingPayload) return
    const success = await create(pendingPayload)
    if (success) {
      reset({
        client_id: 0,
        amount: 0,
        interest_rate: 0,
        installment_value: undefined,
        installments: 1,
        first_due_date: todayString,
      })
      setSummary(emptySummary)
      router.push('/loans?created=1')
    }
    setPendingPayload(null)
    setShowConfirm(false)
  }

  function handleCancelConfirm() {
    setPendingPayload(null)
    setShowConfirm(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Cliente *
            <select
              {...register('client_id', { valueAsNumber: true })}
              disabled={customersLoading}
              className={`h-11 rounded-md border px-3 text-slate-900 outline-none ${
                errors.client_id ? 'border-red-500' : 'border-slate-300'
              }`}
            >
              <option value={0}>Selecione...</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            {customersError && <span className="text-xs text-red-600">{customersError}</span>}
            {errors.client_id && (
              <span className="text-xs text-red-600">{errors.client_id.message}</span>
            )}
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Valor do Empréstimo *
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('amount', { valueAsNumber: true })}
              className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-slate-500"
              placeholder="0,00"
            />
            {errors.amount && <span className="text-xs text-red-600">{errors.amount.message}</span>}
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Número de Parcelas *
            <input
              type="number"
              min="1"
              {...register('installments', { valueAsNumber: true })}
              className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-slate-500"
              placeholder="1"
            />
            {errors.installments && (
              <span className="text-xs text-red-600">{errors.installments.message}</span>
            )}
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Taxa de Juros (%) *
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('interest_rate', { valueAsNumber: true })}
              className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-slate-500"
              placeholder="0"
            />
            {errors.interest_rate && (
              <span className="text-xs text-red-600">{errors.interest_rate.message}</span>
            )}
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Primeira Parcela *
            <input
              type="date"
              {...register('first_due_date')}
              className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-slate-500"
            />
            {errors.first_due_date && (
              <span className="text-xs text-red-600">{errors.first_due_date.message}</span>
            )}
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700 md:col-span-2">
            Valor da Parcela (opcional - deixe vazio para cálculo automático)
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('installment_value', {
                setValueAs: (value) => (value === '' ? undefined : Number(value)),
              })}
              className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-slate-500"
              placeholder="Calculado automaticamente"
            />
            {errors.installment_value && (
              <span className="text-xs text-red-600">{errors.installment_value.message}</span>
            )}
          </label>
        </div>

        <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-800">Resumo do Empréstimo</h4>
            {simulating && <span className="text-xs text-slate-500">Simulando...</span>}
          </div>
          {simulationError && <p className="mt-2 text-xs text-red-600">{simulationError}</p>}
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-1 text-sm text-slate-600">
              <p>Valor da Parcela</p>
              <p className="text-base font-semibold text-slate-900">
                {formatCurrency(summary.installmentValue)}
              </p>
            </div>
            <div className="space-y-1 text-sm text-slate-600">
              <p>Total a Receber</p>
              <p className="text-base font-semibold text-slate-900">
                {formatCurrency(summary.totalToReceive)}
              </p>
            </div>
            <div className="space-y-1 text-sm text-slate-600">
              <p>Juros Total</p>
              <p className="text-base font-semibold text-emerald-600">
                {formatCurrency(summary.totalInterest)}
              </p>
            </div>
            <div className="space-y-1 text-sm text-slate-600">
              <p>Percentual de Juros</p>
              <p className="text-base font-semibold text-emerald-600">
                {formatPercent(summary.interestPercent)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="submit"
            disabled={creating}
            className="h-11 rounded-md bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {creating ? 'Salvando...' : 'Criar Empréstimo'}
          </button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h4 className="text-lg font-semibold text-slate-900">Confirmar empréstimo</h4>
            <p className="mt-2 text-sm text-slate-600">
              Deseja realmente realizar este empréstimo? Você pode cancelar para revisar os dados.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCancelConfirm}
                className="h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmCreate}
                className="h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
