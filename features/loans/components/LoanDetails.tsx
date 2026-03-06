'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useLoanDetailsStore } from '../stores/useLoanDetailsStore'
import { payInstallment } from '@/features/due'

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

function formatPhoneToWhatsApp(phone?: string | null) {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (!digits) return ''
  if (digits.length === 11 && !digits.startsWith('55')) {
    return `55${digits}`
  }
  return digits
}

type LoanDetailsProps = {
  loanId: number
}

export function LoanDetails({ loanId }: LoanDetailsProps) {
  const router = useRouter()
  const { details, loading, error, load } = useLoanDetailsStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedInstallmentId, setSelectedInstallmentId] = useState<number | null>(null)
  const [selectedClientName, setSelectedClientName] = useState('')
  const [selectedOriginalValue, setSelectedOriginalValue] = useState(0)
  const [receivedAmount, setReceivedAmount] = useState('')
  const [discount, setDiscount] = useState('')
  const [extra, setExtra] = useState('')
  const [payLoading, setPayLoading] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)
  const [showConfirmPay, setShowConfirmPay] = useState(false)

  useEffect(() => {
    void load(loanId)
  }, [loanId, load])

  const receivedValueNumber = useMemo(() => {
    const parsed = Number(receivedAmount.replace(',', '.'))
    return Number.isFinite(parsed) ? parsed : 0
  }, [receivedAmount])

  const discountNumber = useMemo(() => {
    const parsed = Number(discount.replace(',', '.'))
    return Number.isFinite(parsed) ? parsed : 0
  }, [discount])

  const extraNumber = useMemo(() => {
    const parsed = Number(extra.replace(',', '.'))
    return Number.isFinite(parsed) ? parsed : 0
  }, [extra])

  const finalAmount = receivedValueNumber - discountNumber + extraNumber
  const isFinalAmountValid = finalAmount >= 0

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
  const whatsappPhone = formatPhoneToWhatsApp(client.phone)

  function openPaymentModal(item: { installmentId: number; clientName: string; valor: number }) {
    setSelectedInstallmentId(item.installmentId)
    setSelectedClientName(item.clientName)
    setSelectedOriginalValue(item.valor)
    setReceivedAmount(item.valor.toString())
    setDiscount('0')
    setExtra('0')
    setPayError(null)
    setShowConfirmPay(false)
    setIsModalOpen(true)
  }

  function closePaymentModal() {
    setIsModalOpen(false)
    setSelectedInstallmentId(null)
    setPayError(null)
    setShowConfirmPay(false)
  }

  function handleOpenConfirm() {
    if (!receivedValueNumber) {
      setPayError('Informe o valor recebido para confirmar o pagamento.')
      return
    }
    if (!isFinalAmountValid) {
      setPayError('O valor final não pode ser negativo.')
      return
    }

    setPayError(null)
    setShowConfirmPay(true)
  }

  async function handleConfirmPayment() {
    if (!selectedInstallmentId) return

    try {
      setPayLoading(true)
      setPayError(null)
      await payInstallment(selectedInstallmentId, {
        received_amount: receivedValueNumber,
        discount: discountNumber,
        extra: extraNumber,
      })
      closePaymentModal()
      void load(loanId)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao registrar pagamento.'
      setPayError(message)
    } finally {
      setPayLoading(false)
    }
  }

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

        <div className="mt-4 md:hidden space-y-3">
          {installments.map((installment) => {
            const installmentStatus = statusConfig[installment.status]
            return (
              <div
                key={installment.id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Parcela</p>
                      <p className="text-sm font-medium text-slate-900">
                        {installment.installment}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        installmentStatus
                          ? installmentStatus.className
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      {installmentStatus ? installmentStatus.label : installment.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Vencimento</p>
                      <p className="text-sm text-slate-700">
                        {formatDate(installment.dueDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Valor</p>
                      <p className="text-sm text-slate-700">
                        {formatCurrency(installment.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Informação</p>
                      <p className="text-sm text-slate-600">
                        {installment.info ||
                          (installment.daysLate
                            ? `${installment.daysLate} dias de atraso`
                            : '-')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Pagamento</p>
                      <p className="text-sm text-slate-600">
                        {formatDate(installment.paymentDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {installment.status === 'PAID' ? (
                      <span className="text-xs text-slate-400">-</span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            if (!whatsappPhone) return
                            window.open(
                              `https://wa.me/${whatsappPhone}`,
                              '_blank',
                              'noopener,noreferrer',
                            )
                          }}
                          disabled={!whatsappPhone}
                          className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Cobrar
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            openPaymentModal({
                              installmentId: installment.id,
                              clientName: client.name,
                              valor: installment.amount,
                            })
                          }
                          className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-blue-700"
                        >
                          Receber
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 hidden md:block overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-slate-200 text-left text-xs text-slate-500">
              <tr>
                <th className="pb-2">Parcela</th>
                <th className="pb-2">Vencimento</th>
                <th className="pb-2">Valor</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Informação</th>
                <th className="pb-2">Pagamento</th>
                <th className="pb-2">Ações</th>
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
                    <td className="py-3">
                      {installment.status === 'PAID' ? (
                        <span className="text-xs text-slate-400">-</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (!whatsappPhone) return
                              window.open(
                                `https://wa.me/${whatsappPhone}`,
                                '_blank',
                                'noopener,noreferrer',
                              )
                            }}
                            disabled={!whatsappPhone}
                            className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Cobrar
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              openPaymentModal({
                                installmentId: installment.id,
                                clientName: client.name,
                                valor: installment.amount,
                              })
                            }
                            className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-blue-700"
                          >
                            Receber
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Registrar Pagamento</h3>
                <p className="text-sm text-slate-500">Confirme os valores antes de finalizar.</p>
              </div>
              <button
                type="button"
                onClick={closePaymentModal}
                className="text-slate-400 transition hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm text-slate-700">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Cliente</p>
                <p className="font-medium text-slate-900">{selectedClientName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Valor Original da Parcela</p>
                <p className="font-medium text-slate-900">{formatCurrency(selectedOriginalValue)}</p>
              </div>

              <div className="grid gap-3">
                <label className="text-xs font-medium text-slate-500">Valor Recebido</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={receivedAmount}
                  onChange={(event) => setReceivedAmount(event.target.value)}
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid gap-3">
                <label className="text-xs font-medium text-slate-500">Desconto</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={discount}
                  onChange={(event) => setDiscount(event.target.value)}
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid gap-3">
                <label className="text-xs font-medium text-slate-500">Acréscimo (juros/multa)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={extra}
                  onChange={(event) => setExtra(event.target.value)}
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div
                className={`rounded-lg border p-3 text-xs ${
                  isFinalAmountValid
                    ? 'border-blue-100 bg-blue-50 text-slate-600'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                <div className="flex justify-between">
                  <span>Valor recebido:</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(receivedValueNumber)}
                  </span>
                </div>
                <div className="mt-1 flex justify-between">
                  <span>Valor final:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(finalAmount)}</span>
                </div>
                {!isFinalAmountValid ? (
                  <p className="mt-2 text-xs font-medium">O valor final não pode ser negativo.</p>
                ) : null}
              </div>

              {payError ? <p className="text-xs text-red-600">{payError}</p> : null}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closePaymentModal}
                className="h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleOpenConfirm}
                disabled={!receivedValueNumber || payLoading || !isFinalAmountValid}
                className="h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {payLoading ? 'Confirmando...' : 'Confirmar Pagamento'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showConfirmPay ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h4 className="text-lg font-semibold text-slate-900">Confirmar pagamento</h4>
            <p className="mt-2 text-sm text-slate-600">
              Deseja confirmar o pagamento de {selectedClientName}?
            </p>
            <div className="mt-4 space-y-1 text-sm text-slate-600">
              <p>Valor recebido: {formatCurrency(receivedValueNumber)}</p>
              <p>Desconto: {formatCurrency(discountNumber)}</p>
              <p>Acréscimo: {formatCurrency(extraNumber)}</p>
              <p className="font-semibold text-slate-900">Valor final: {formatCurrency(finalAmount)}</p>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowConfirmPay(false)}
                className="h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={payLoading}
                className="h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-60"
              >
                {payLoading ? 'Confirmando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
