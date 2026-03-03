'use client'

import { useEffect } from 'react'
import { useCustomerSummaryStore } from '../stores/useCustomerSummaryStore'
import { BadgeCheck, Phone, User } from 'lucide-react'
import Link from 'next/link'

type CustomerSummaryProps = {
  customerId: number
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PAID: {
    label: 'Pago',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  ACTIVE: {
    label: 'Ativo',
    className: 'border-blue-200 bg-blue-50 text-blue-700',
  },
  PENDING: {
    label: 'Pendente',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  REJECTED: {
    label: 'Rejeitado',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
  },
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function formatPercent(value: number) {
  return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`
}

function formatDate(value: string) {
  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return parsed.toLocaleDateString('pt-BR')
}

function clampProgress(value: number) {
  if (Number.isNaN(value)) return 0
  return Math.min(100, Math.max(0, value))
}

function formatInstallmentValue(totalWithInterest: number, installmentsCount: number) {
  if (!installmentsCount) return 0
  return totalWithInterest / installmentsCount
}

export function CustomerSummary({ customerId }: CustomerSummaryProps) {
  const { summary, loading, error, load } = useCustomerSummaryStore()

  useEffect(() => {
    void load(customerId)
  }, [customerId, load])

  if (loading) {
    return <p className="text-slate-600">Carregando detalhes do cliente...</p>
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {error}
      </div>
    )
  }

  if (!summary) {
    return <p className="text-slate-600">Nenhum detalhe disponível para este cliente.</p>
  }

  const { client } = summary

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <User className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{client.name}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-blue-500" />
                  Cliente #{client.id}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {client.phone || 'Telefone não informado'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="grid gap-4 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Total Emprestado</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {formatCurrency(summary.totalLoaned)}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Total a Receber</p>
            <p className="mt-1 text-lg font-semibold text-blue-600">
              {formatCurrency(summary.totalToReceive)}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Total Recebido</p>
            <p className="mt-1 text-lg font-semibold text-emerald-600">
              {formatCurrency(summary.totalReceived)}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Empréstimos</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {summary.loansTotal}
            </p>
            <p className="mt-1 text-sm text-slate-500">{summary.loansActive} ativos</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-semibold text-slate-900">Histórico de Empréstimos</h4>
          <span className="text-sm text-slate-500">{summary.history.length} registros</span>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {summary.history.map((item, index) => {
            const progress = clampProgress(item.progress)
            const status = statusConfig[item.status]
            const installmentValue = formatInstallmentValue(
              item.totalWithInterest,
              item.installmentsCount,
            )
            const card = (
              <div
                className={`rounded-lg border border-slate-200 p-4 transition ${
                  item.loanId ? 'hover:border-blue-200 hover:bg-blue-50/40' : ''
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-slate-900">
                        {formatCurrency(item.amount)}
                      </p>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          status
                            ? status.className
                            : 'border-slate-200 bg-slate-50 text-slate-600'
                        }`}
                      >
                        {status ? status.label : item.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {item.installmentsCount}x de {formatCurrency(installmentValue)}
                    </p>
                    <p className="text-sm text-slate-500">
                      Iniciado em {formatDate(item.firstDueDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">
                      {item.installmentsPaid}/{item.installmentsCount} pagas
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatPercent(progress)} concluído
                    </p>
                  </div>
                </div>

                <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )

            if (item.loanId) {
              return (
                <Link
                  key={item.loanId}
                  href={`/customers/${client.id}/loan/details?loanId=${item.loanId}`}
                  className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {card}
                </Link>
              )
            }

            return <div key={`${item.firstDueDate}-${index}`}>{card}</div>
          })}
        </div>
      </section>
    </div>
  )
}
