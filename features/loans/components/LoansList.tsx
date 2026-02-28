'use client'

import { useEffect } from 'react'
import { useLoansStore } from '../stores/useLoansStore'

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  paid: 'Pago',
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
            <th className="px-3 py-2 text-left">Status</th>
            <th className="px-3 py-2 text-left">Criado em</th>
          </tr>
        </thead>
        <tbody>
          {items.map((loan) => (
            <tr key={loan.id} className="border-t border-slate-200">
              <td className="px-3 py-2 text-slate-900">{loan.borrowerName}</td>
              <td className="px-3 py-2 text-slate-900">
                {loan.amount.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </td>
              <td className="px-3 py-2 text-slate-700">
                {statusLabels[loan.status] || loan.status}
              </td>
              <td className="px-3 py-2 text-slate-700">
                {new Date(loan.createdAt).toLocaleDateString('pt-BR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
