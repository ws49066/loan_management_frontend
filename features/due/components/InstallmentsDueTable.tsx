'use client'

import { useEffect, useMemo, useState } from 'react'
import { useInstallmentsDueStore } from '../stores/useInstallmentsDueStore'
import { payInstallment } from '../services/installmentPayService'
import type { InstallmentStatus } from '../types/installmentsDue'

const statusTabs: Array<{ key: InstallmentStatus; label: string }> = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'LATE', label: 'Late' },
  { key: 'PAID', label: 'Paid' },
]

const statusStyles: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
  LATE: { label: 'Late', className: 'bg-red-100 text-red-700' },
  PAID: { label: 'Paid', className: 'bg-emerald-100 text-emerald-700' },
}

function formatCurrency(value: number) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'BRL' })
}

function formatDate(value: string) {
  if (!value) return '-'
  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('en-US')
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
  const totalLoadedLabel = `${items.length} of ${total} installments loaded`

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

  function openPaymentModal(item: { installmentId: number; clientName: string; amount: number }) {
    setSelectedInstallmentId(item.installmentId)
    setSelectedClientName(item.clientName)
    setSelectedOriginalValue(item.amount)
    setReceivedAmount(item.amount.toString())
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
      setPayError('Please enter the received amount to confirm payment.')
      return
    }
    if (!isFinalAmountValid) {
      setPayError('Final amount cannot be negative.')
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
      const message = err instanceof Error ? err.message : 'Failed to record payment.'
      setPayError(message)
    } finally {
      setPayLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl">

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
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
            <input
              type="text"
              placeholder="Client or phone"
              value={clientQuery}
              onChange={(event) => {
                setClientQuery(event.target.value)
                setPage(1)
              }}
              className="w-full min-w-[220px] flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <label className="text-xs font-medium text-slate-500">From</label>
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
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <label className="text-xs font-medium text-slate-500">To</label>
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
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <label className="text-xs font-medium text-slate-500">Sort by</label>
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
                <option value="due_date">Due Date</option>
                <option value="amount">Amount</option>
                <option value="delay">Delay</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  setOrderDir(orderDir === 'asc' ? 'desc' : 'asc')
                  setPage(1)
                }}
                className="rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300"
              >
                {orderDir === 'asc' ? 'Ascending' : 'Descending'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
            <span>
              {totalLoadedLabel}
            </span>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500">Per page</label>
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

        <div className="mt-4 md:hidden space-y-3">
          {loading ? (
            <p className="py-6 text-center text-sm text-slate-500">Loading installments...</p>
          ) : error ? (
            <p className="py-6 text-center text-sm text-red-600">{error}</p>
          ) : items.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No installments found.</p>
          ) : (
            items.map((item) => (
              <div
                key={item.installmentId}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Client</p>
                    <p className="text-sm font-medium text-slate-900">{item.clientName}</p>
                    <p className="text-xs text-slate-500">{item.clientPhone || '-'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                      <div>
                      <p className="text-xs font-semibold text-slate-500">Installment</p>
                      <p className="text-sm text-slate-700">{item.installmentLabel}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Amount</p>
                      <p className="text-sm text-slate-700">{formatCurrency(item.amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Due Date</p>
                      <p className="text-sm text-slate-700">{formatDate(item.dueDate)}</p>
                      <p className="text-xs text-slate-500">{item.info || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Status</p>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          statusStyles[item.status]?.className || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {statusStyles[item.status]?.label || item.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.status === 'PAID' ? (
                      <span className="text-xs text-slate-400">-</span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            const phone = formatPhoneToWhatsApp(item.clientPhone)
                            if (!phone) return
                            window.open(`https://wa.me/${phone}`, '_blank', 'noopener,noreferrer')
                          }}
                          className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700"
                        >
                          Request Payment
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            openPaymentModal({
                              installmentId: item.installmentId,
                              clientName: item.clientName,
                                 amount: item.amount,
                            })
                          }
                          className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-blue-700"
                        >
                          Receive
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 hidden md:block overflow-x-auto">
          {loading ? (
            <p className="py-6 text-center text-sm text-slate-500">Loading installments...</p>
          ) : error ? (
            <p className="py-6 text-center text-sm text-red-600">{error}</p>
          ) : items.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No installments found.</p>
          ) : (
            <table className="w-full min-w-[880px] border border-slate-200 text-xs sm:text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-3 py-2 text-left">Client</th>
                  <th className="px-3 py-2 text-left">Installment</th>
                  <th className="px-3 py-2 text-left">Due Date</th>
                  <th className="px-3 py-2 text-left">Amount</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Actions</th>
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
                    <td className="px-3 py-3 text-slate-700">{item.installmentLabel}</td>
                    <td className="px-3 py-3 text-slate-700">
                      <div className="flex flex-col">
                        <span>{formatDate(item.dueDate)}</span>
                        <span className="text-xs text-slate-500">{item.info || '-'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-700">{formatCurrency(item.amount)}</td>
                    <td className="px-3 py-3 text-slate-700">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          statusStyles[item.status]?.className || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {statusStyles[item.status]?.label || item.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {item.status === 'PAID' ? (
                        <span className="text-xs text-slate-400">-</span>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const phone = formatPhoneToWhatsApp(item.clientPhone)
                              if (!phone) return
                              window.open(`https://wa.me/${phone}`, '_blank', 'noopener,noreferrer')
                            }}
                            className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700"
                          >
                            Request Payment
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              openPaymentModal({
                                installmentId: item.installmentId,
                                clientName: item.clientName,
                                amount: item.amount,
                              })
                            }
                            className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-blue-700"
                          >
                            Receive
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
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Record Payment</h3>
                <p className="text-sm text-slate-500">Confirm the values before finalizing.</p>
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
                <p className="text-xs font-semibold uppercase text-slate-400">Client</p>
                <p className="font-medium text-slate-900">{selectedClientName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Original Installment Amount</p>
                <p className="font-medium text-slate-900">{formatCurrency(selectedOriginalValue)}</p>
              </div>

              <div className="grid gap-3">
                <label className="text-xs font-medium text-slate-500">Received Amount</label>
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
                <label className="text-xs font-medium text-slate-500">Discount</label>
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
                <label className="text-xs font-medium text-slate-500">Extra Charge (fee/penalty)</label>
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
                  <span>Received amount:</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(receivedValueNumber)}
                  </span>
                </div>
                <div className="mt-1 flex justify-between">
                  <span>Final amount:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(finalAmount)}</span>
                </div>
                {!isFinalAmountValid ? (
                    <p className="mt-2 text-xs font-medium">Final amount cannot be negative.</p>
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
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleOpenConfirm}
                  disabled={!receivedValueNumber || payLoading || !isFinalAmountValid}
                  className="h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {payLoading ? 'Confirming...' : 'Confirm Payment'}
                </button>
            </div>
          </div>
        </div>
      ) : null}

      {showConfirmPay ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h4 className="text-lg font-semibold text-slate-900">Confirm payment</h4>
            <p className="mt-2 text-sm text-slate-600">
              Do you want to confirm the payment for {selectedClientName}?
            </p>
            <div className="mt-4 space-y-1 text-sm text-slate-600">
              <p>Received amount: {formatCurrency(receivedValueNumber)}</p>
              <p>Discount: {formatCurrency(discountNumber)}</p>
              <p>Extra charge: {formatCurrency(extraNumber)}</p>
              <p className="font-semibold text-slate-900">Final amount: {formatCurrency(finalAmount)}</p>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowConfirmPay(false)}
                className="h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={payLoading}
                className="h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-60"
              >
                {payLoading ? 'Confirming...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
