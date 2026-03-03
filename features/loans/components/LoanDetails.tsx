'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useLoanDetailsStore } from '../stores/useLoanDetailsStore'

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
  LATE: {
    label: 'Atrasado',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
  },
  OVERDUE: {
    label: 'Atrasado',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
  },
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatPercent(value: number) {
  return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`
}

function formatDate(value: string | null) {
  if (!value) return '-'
  const parsed = new Date(value.includes('T') ? value : `${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('pt-BR')
}

function clampProgress(value: number) {
  if (Number.isNaN(value)) return 0
  return Math.min(100, Math.max(0, value))
}

type LoanDetailsProps = {
  loanId: number
}

export function LoanDetails({ loanId }: LoanDetailsProps) {
  const router = useRouter()
  const { details, loading, error, load } = useLoanDetailsStore()

  useEffect(() => {
    void load(loanId)
  }, [loanId, load])

  if (loading) {
    return <p className="text-slate-600">Carregando detalhes do empréstimo...</p>
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {error}
      </div>
    )
  }

  if (!details) {
    return <p className="text-slate-600">Nenhum detalhe disponível para este empréstimo.</p>
  }

  const { loan, client, installments } = details
  const progress = clampProgress(loan.progress)
  const status = statusConfig[loan.status]

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Detalhes do Empréstimo</h2>
            <p className="mt-1 text-sm text-slate-600">Cliente: {client.name}</p>
            <p className="text-sm text-slate-500">
              Telefone: {client.phone || 'Não informado'}
            </p>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              status ? status.className : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            {status ? status.label : loan.status}
          </span>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500">Valor Emprestado</p>
            <p className="text-sm font-semibold text-slate-900">{formatCurrency(loan.amount)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total com Juros</p>
            <p className="text-sm font-semibold text-blue-600">
              {formatCurrency(loan.totalWithInterest)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Juros Total</p>
            <p className="text-sm font-semibold text-emerald-600">
              {formatCurrency(loan.totalInterest)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Taxa de Juros</p>
            <p className="text-sm font-semibold text-slate-900">{formatPercent(loan.interestRate)}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500">Total Pago</p>
            <p className="text-sm font-semibold text-emerald-600">{formatCurrency(loan.totalPaid)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Pendente</p>
            <p className="text-sm font-semibold text-amber-600">{formatCurrency(loan.totalPending)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Parcelas Pagas</p>
            <p className="text-sm font-semibold text-slate-900">
              {loan.installmentsPaid}/{loan.installmentsCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Progresso</p>
            <p className="text-sm font-semibold text-slate-900">{formatPercent(progress)}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Informações do Empréstimo</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs text-slate-500">Data do Empréstimo</p>
            <p className="text-sm font-semibold text-slate-900">{formatDate(loan.loanDate)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Primeiro Vencimento</p>
            <p className="text-sm font-semibold text-slate-900">{formatDate(loan.firstDueDate)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Número de Parcelas</p>
            <p className="text-sm font-semibold text-slate-900">{loan.installmentsCount}x</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Valor da Parcela</p>
            <p className="text-sm font-semibold text-slate-900">
              {formatCurrency(loan.installmentValue)}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Histórico de Parcelas</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-slate-200 text-left text-xs text-slate-500">
              <tr>
                <th className="pb-2">Parcela</th>
                <th className="pb-2">Vencimento</th>
                <th className="pb-2">Valor</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Informação</th>
                <th className="pb-2">Pagamento</th>
              </tr>
            </thead>
            <tbody>
              {installments.map((installment) => {
                const installmentStatus = statusConfig[installment.status]
                return (
                  <tr key={installment.id} className="border-b border-slate-100">
                    <td className="py-3 text-slate-900">{installment.installment}</td>
                    <td className="py-3 text-slate-700">{formatDate(installment.dueDate)}</td>
                    <td className="py-3 text-slate-700">{formatCurrency(installment.amount)}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          installmentStatus
                            ? installmentStatus.className
                            : 'border-slate-200 bg-slate-50 text-slate-600'
                        }`}
                      >
                        {installmentStatus ? installmentStatus.label : installment.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600">
                      {installment.info ||
                        (installment.daysLate
                          ? `${installment.daysLate} dias de atraso`
                          : '-')}
                    </td>
                    <td className="py-3 text-slate-600">
                      {formatDate(installment.paymentDate)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
