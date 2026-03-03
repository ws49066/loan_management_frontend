'use client'

import { useEffect } from 'react'
import { useLoansStore } from '../stores/useLoansStore'

const statusLabels: Record<string, string> = {
  ACTIVE: 'Ativo',
  PAID: 'Pago',
  PENDING: 'Pendente',
  REJECTED: 'Rejeitado',
}

export function LoansList() {
  const { items, loading, error, load } = useLoansStore()

  useEffect(() => {
    void load()
  }, [load])

  if (loading) {
    return <p className="text-slate-600">Carregando empréstimos...</p>
  }

  if (error) {
    return <p className="text-red-600">{error}</p>
  }

  if (items.length === 0) {
    return <p className="text-slate-600">Nenhum empréstimo encontrado.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-slate-200 text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="px-3 py-2 text-left">Cliente</th>
            <th className="px-3 py-2 text-left">Valor</th>
            <th className="px-3 py-2 text-left">Parcelas</th>
            <th className="px-3 py-2 text-left">Pagas</th>
            <th className="px-3 py-2 text-left">Status</th>
            <th className="px-3 py-2 text-left">Criado em</th>
          </tr>
        </thead>
        <tbody>
          {items.map((loan) => (
            <tr key={`${loan.client_name}-${loan.created_at}`} className="border-t border-slate-200">
              <td className="px-3 py-2 text-slate-900">{loan.client_name}</td>
              <td className="px-3 py-2 text-slate-900">
                {loan.amount.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </td>
              <td className="px-3 py-2 text-slate-700">
                <div className="flex flex-col">
                  <span>{loan.installments_count}x</span>
                  <span className="text-xs text-slate-500">
                    {loan.installment_value.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </div>
              </td>
              <td className="px-3 py-2 text-slate-700">
                {loan.paid_installments}/{loan.installments_count}
              </td>
              <td className="px-3 py-2 text-slate-700">
                {statusLabels[loan.status] || loan.status}
              </td>
              <td className="px-3 py-2 text-slate-700">
                {new Date(loan.created_at).toLocaleDateString('pt-BR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
