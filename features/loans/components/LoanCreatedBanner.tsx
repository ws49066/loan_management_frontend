'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'

export function LoanCreatedBanner() {
  const searchParams = useSearchParams()
  const [dismissed, setDismissed] = useState(false)

  const shouldShow = useMemo(() => {
    if (dismissed) return false
    return searchParams.get('created') === '1'
  }, [dismissed, searchParams])

  if (!shouldShow) return null

  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      <span>Emprestimo criado com sucesso.</span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-xs font-semibold text-emerald-700"
      >
        Fechar
      </button>
    </div>
  )
}
