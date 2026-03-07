"use client"

import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import {
  loanSimulationProposalResultSchema,
  simulateLoanProposalSchema,
  type LoanSimulationProposalResult,
  type SimulateLoanProposalFormValues,
} from '../schemas/simulateLoanProposalSchema'
import { simulateLoanProposal } from '../services/simulateLoanProposalService'

const emptySummary: LoanSimulationProposalResult = loanSimulationProposalResultSchema.parse({
  valor_contratado: 0,
  valor_primeira_parcela: 0,
  data_primeira_parcela: '',
})

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(value?: string | null) {
  if (!value) return '-'
  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return parsed.toLocaleDateString('pt-BR')
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

export function LoanSimulationForm() {
  const [summary, setSummary] = useState<LoanSimulationProposalResult | null>(null)
  const [simulating, setSimulating] = useState(false)
  const [simulationError, setSimulationError] = useState<string | null>(null)

  const todayString = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const resolver: Resolver<SimulateLoanProposalFormValues> = zodResolver(
    simulateLoanProposalSchema,
  )

  const {
    register,
    control,
    formState: { errors },
  } = useForm<SimulateLoanProposalFormValues>({
    resolver,
    defaultValues: {
      amount: 0,
      interest_rate: 0,
      installment_value: undefined,
      installments: 1,
      first_due_date: todayString,
    },
  })

  const [amount, interestRate, installmentValue, installments, firstDueDate] = useWatch({
    control,
    name: ['amount', 'interest_rate', 'installment_value', 'installments', 'first_due_date'],
  })

  const amountValue = normalizeNumber(amount)
  const interestRateValue = normalizeNumber(interestRate)
  const installmentValueNumber = normalizeNumber(installmentValue)
  const installmentsValue = Math.max(0, Math.round(normalizeNumber(installments)))
  const canSimulate = amountValue > 0 && installmentsValue > 0 && Boolean(firstDueDate)

  useEffect(() => {
    if (!canSimulate) {
      return
    }

    const timeout = window.setTimeout(() => {
      setSimulating(true)
      setSimulationError(null)

      void simulateLoanProposal({
        amount: amountValue,
        interest_rate: interestRateValue,
        installment_value: installmentValueNumber || undefined,
        installments: installmentsValue,
        first_due_date: String(firstDueDate),
      })
        .then((data) => {
          setSummary(data)
        })
        .catch((err) => {
          const message = err instanceof Error ? err.message : 'Falha ao simular empréstimo'
          setSimulationError(message)
          setSummary(null)
        })
        .finally(() => {
          setSimulating(false)
        })
    }, 400)

    return () => window.clearTimeout(timeout)
  }, [amountValue, interestRateValue, installmentValueNumber, installmentsValue, firstDueDate, canSimulate])

  const displaySummary = canSimulate && summary ? summary : emptySummary
  const displayError = canSimulate ? simulationError : null
  const showLastInstallment = installmentsValue > 1
  const lastInstallmentValue =
    displaySummary.valor_ultima_parcela ?? displaySummary.valor_primeira_parcela
  const lastInstallmentDate =
    displaySummary.data_ultima_parcela ?? displaySummary.data_primeira_parcela

  return (
    <div className="flex flex-col gap-6">
      <form className="flex flex-col gap-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Valor contratado *
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
            Número de parcelas *
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
            Taxa de juros (%) *
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
            Primeira parcela *
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
            Valor da parcela (opcional - deixe vazio para cálculo automático)
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

        <div className="rounded-md border border-blue-100 bg-blue-50 p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-800">Resumo da proposta</div>
            {simulating && <span className="text-xs text-slate-500">Simulando...</span>}
          </div>
          {displayError && <p className="mt-2 text-xs text-red-600">{displayError}</p>}

          <div className="mt-4 w-full max-w-md overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <Image src="/images/Logo.png" alt="Logo" width={150} height={40} />
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Proposta de empréstimo
              </div>
            </div>

            <div className="border-b border-slate-200 px-4 py-4">
              <div className="text-xs font-medium uppercase text-slate-500">Valor contratado</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">
                {formatCurrency(displaySummary.valor_contratado)}
              </div>
            </div>

            <div className="divide-y divide-slate-200 text-sm text-slate-700">
              <div className="flex items-center justify-between px-4 py-3">
                <span>Total de parcelas</span>
                <span className="font-semibold text-slate-900">
                  {displaySummary.quantidade_parcelas ?? installmentsValue}x
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span>Primeira parcela</span>
                <div className="text-right">
                  <div className="font-semibold text-slate-900">
                    {formatCurrency(displaySummary.valor_primeira_parcela)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatDate(displaySummary.data_primeira_parcela)}
                  </div>
                </div>
              </div>
              {showLastInstallment ? (
                <div className="flex items-center justify-between px-4 py-3">
                  <span>Última parcela</span>
                  <div className="text-right">
                    <div className="font-semibold text-slate-900">
                      {formatCurrency(lastInstallmentValue)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatDate(lastInstallmentDate)}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
