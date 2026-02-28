'use client'

import { useEffect } from 'react'
import { useDashboardStore } from '../stores/useDashboardStore'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CalendarClock,
  HandCoins,
  Percent,
} from 'lucide-react'

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function DashboardSummary() {
  const { summary, loading, error, load } = useDashboardStore()

  useEffect(() => {
    void load()
  }, [load])

  if (loading) {
    return <p className="text-slate-600">Carregando resumo...</p>
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {error}
      </div>
    )
  }

  if (!summary) {
    return <p className="text-slate-600">Sem dados para exibir.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h3 className="text-base font-semibold text-slate-900">Visão Geral</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Investido</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {formatCurrency(summary.totalInvested)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Banknote className="h-6 w-6" />
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Emprestado</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {formatCurrency(summary.totalLoaned)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <ArrowDownRight className="h-6 w-6" />
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Recebido</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {formatCurrency(summary.totalReceived)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500 text-white">
                <ArrowUpRight className="h-6 w-6" />
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Lucro</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {formatCurrency(summary.profit)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600 text-white">
                <Percent className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="grid gap-4 lg:grid-cols-1">
          
        </div>
      </section>

      <section>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-red-600">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-red-200">
                <AlertTriangle className="h-4 w-4" />
              </span>
              <span className="font-medium">Pagamentos Atrasados</span>
            </div>
            <div className="mt-6 text-center">
              <p className="text-3xl font-semibold text-red-600">{summary.overdue.count}</p>
              <p className="mt-1 text-sm text-slate-500">parcelas em atraso</p>
              <p className="mt-3 text-lg font-semibold text-red-600">
                {formatCurrency(summary.overdue.amount)}
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-amber-600">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-amber-200">
                <CalendarClock className="h-4 w-4" />
              </span>
              <span className="font-medium">Próximos Vencimentos</span>
            </div>
            <div className="mt-6 text-center">
              <p className="text-3xl font-semibold text-amber-600">{summary.upcoming.count}</p>
              <p className="mt-1 text-sm text-slate-500">próximos 7 dias</p>
              <p className="mt-3 text-lg font-semibold text-amber-600">
                {formatCurrency(summary.upcoming.amount)}
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-blue-200">
                <HandCoins className="h-4 w-4" />
              </span>
              <span className="font-medium">Empréstimos Ativos</span>
            </div>
            <div className="mt-6 text-center">
              <p className="text-3xl font-semibold text-blue-600">{summary.activeLoans.count}</p>
              <p className="mt-1 text-sm text-slate-500">contratos ativos</p>
              <p className="mt-3 text-lg font-semibold text-blue-600">
                {formatCurrency(summary.activeLoans.amount)}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
