import { LoanDetails } from '@/features/loans/components/LoanDetails'

export default function LoanDetailsPage({ params }: { params: { id: string } }) {
  const parsedId = Number(params.id)

  if (!Number.isFinite(parsedId)) {
    return <p className="text-slate-600">Empréstimo inválido.</p>
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <LoanDetails loanId={parsedId} />
    </div>
  )
}
