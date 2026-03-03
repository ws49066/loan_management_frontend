'use client'

import { useEffect, useMemo, useState } from 'react'
import { useInstallmentsDueStore } from '../stores/useInstallmentsDueStore'
import { payInstallment } from '../services/installmentPayService'
import type { InstallmentStatus } from '../types/installmentsDue'

const statusTabs: Array<{ key: InstallmentStatus; label: string }> = [
  { key: 'ALL', label: 'Todos' },
  { key: 'PENDING', label: 'Pendentes' },
  { key: 'LATE', label: 'Atrasados' },
  { key: 'PAID', label: 'Pagos' },
]

const statusStyles: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pendente', className: 'bg-amber-100 text-amber-700' },
  LATE: { label: 'Atrasado', className: 'bg-red-100 text-red-700' },
  PAID: { label: 'Pago', className: 'bg-emerald-100 text-emerald-700' },
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(value: string) {
  if (!value) return '-'
  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('pt-BR')
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

export function InstallmentsDueTable() {
  const {
    items,
    counts,
    total,
    page,
    size,
    status,
    clientQuery,
    startDate,
    endDate,
    orderBy,
    orderDir,
    loading,
    error,
    load,
    setStatus,
    setPage,
    setSize,
    setClientQuery,
    setStartDate,
    setEndDate,
    setOrderBy,
    setOrderDir,
  } = useInstallmentsDueStore()

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
    const handler = window.setTimeout(() => {
      void load({
        status,
        page,
        size,
        clientQuery,
        startDate,
        endDate,
        orderBy,
        orderDir,
      })
    }, 350)

    return () => window.clearTimeout(handler)
  }, [
    load,
    status,
    page,
    size,
    clientQuery,
    startDate,
    endDate,
    orderBy,
    orderDir,
  ])

  const totalPages = Math.max(1, Math.ceil(total / size))
  const totalLoadedLabel = `${items.length} de ${total} parcelas carregadas`

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

  function openPaymentModal(item: { installmentId: number; clientName: string; valor: number }) {
    setSelectedInstallmentId(item.installmentId)
    setSelectedClientName(item.clientName)
    setSelectedOriginalValue(item.valor)
    setReceivedAmount(item.valor.toString())
    setDiscount('0')
    setExtra('0')
    setPayError(null)
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
      void load()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao registrar pagamento.'
      setPayError(message)
    } finally {
      setPayLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-slate-900">Controle de Vencimentos</h2>
        <p className="text-sm text-slate-500">
          Visualize parcelas por status, filtre por cliente e priorize cobranças com mais atraso.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {statusTabs.map((tab) => {
          const isActive = status === tab.key
          const countKey = tab.key.toLowerCase() as keyof typeof counts
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setStatus(tab.key)
                setPage(1)
              }}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? 'border-red-500 bg-red-500 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {tab.label} ({counts[countKey] ?? 0})
            </button>
          )
        })}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Cliente ou telefone"
              value={clientQuery}
              onChange={(event) => {
                setClientQuery(event.target.value)
                setPage(1)
              }}
              className="w-full min-w-[220px] flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500">De</label>
              <input
                type="date"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value)
                  setPage(1)
                }}
                className="rounded-md border border-slate-200 px-2 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500">Ate</label>
              <input
                type="date"
                value={endDate}
                onChange={(event) => {
                  setEndDate(event.target.value)
                  setPage(1)
                }}
                className="rounded-md border border-slate-200 px-2 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500">Ordenar</label>
              <select
                value={orderBy}
                onChange={(event) => {
                  const value = event.target.value as 'due_date' | 'amount' | 'delay'
                  setOrderBy(value)
                  setOrderDir(value === 'due_date' ? 'asc' : 'desc')
                  setPage(1)
                }}
                className="rounded-md border border-slate-200 px-2 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="due_date">Vencimento</option>
                <option value="amount">Valor</option>
                <option value="delay">Atraso</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  setOrderDir(orderDir === 'asc' ? 'desc' : 'asc')
                  setPage(1)
                }}
                className="rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300"
              >
                {orderDir === 'asc' ? 'Crescente' : 'Decrescente'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
            <span>
              {totalLoadedLabel}
            </span>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500">Por pagina</label>
              <select
                value={size}
                onChange={(event) => {
                  setSize(Number(event.target.value))
                  setPage(1)
                }}
                className="rounded-md border border-slate-200 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
              >
                {[10, 20, 30, 50].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          {loading ? (
            <p className="py-6 text-center text-sm text-slate-500">Carregando vencimentos...</p>
          ) : error ? (
            <p className="py-6 text-center text-sm text-red-600">{error}</p>
          ) : items.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">Nenhuma parcela encontrada.</p>
          ) : (
            <table className="w-full border border-slate-200 text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-3 py-2 text-left">Cliente</th>
                  <th className="px-3 py-2 text-left">Parcela</th>
                  <th className="px-3 py-2 text-left">Vencimento</th>
                  <th className="px-3 py-2 text-left">Valor</th>
                  <th className="px-3 py-2 text-left">Situacao</th>
                  <th className="px-3 py-2 text-left">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.installmentId} className="border-t border-slate-200">
                    <td className="px-3 py-3 text-slate-900">
                      <div className="flex flex-col">
                        <span className="font-medium">{item.clientName}</span>
                        <span className="text-xs text-slate-500">{item.clientPhone || '-'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-700">{item.parcela}</td>
                    <td className="px-3 py-3 text-slate-700">
                      <div className="flex flex-col">
                        <span>{formatDate(item.vencimento)}</span>
                        <span className="text-xs text-slate-500">{item.informacao || '-'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-700">{formatCurrency(item.valor)}</td>
                    <td className="px-3 py-3 text-slate-700">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          statusStyles[item.status]?.className || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {statusStyles[item.status]?.label || item.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {item.status === 'PAID' ? (
                        <span className="text-xs text-slate-400">-</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const phone = formatPhoneToWhatsApp(item.clientPhone)
                              if (!phone) return
                              window.open(`https://wa.me/${phone}`, '_blank', 'noopener,noreferrer')
                            }}
                            className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700"
                          >
                            Cobrar
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              openPaymentModal({
                                installmentId: item.installmentId,
                                clientName: item.clientName,
                                valor: item.valor,
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
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <span>
            Pagina {page} de {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 disabled:opacity-50"
            >
              Proxima
            </button>
          </div>
        </div>
      </div>

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
