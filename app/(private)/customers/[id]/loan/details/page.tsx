import { LoanDetails } from '@/features/loans/components/LoanDetails'

type LoanDetailsPageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ loanId?: string }>
}

export default async function CustomerLoanDetailsPage({
  params,
  searchParams,
}: LoanDetailsPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const fallbackId = Number(resolvedParams.id)
  const parsedId = Number(resolvedSearchParams?.loanId ?? resolvedParams.id)
  const loanId = Number.isFinite(parsedId) ? parsedId : fallbackId

  if (!Number.isFinite(loanId)) {
    return <p className="text-slate-600">Empréstimo inválido.</p>
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <LoanDetails loanId={loanId} />
    </div>
  )
}
