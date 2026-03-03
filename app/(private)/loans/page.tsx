import { LoanCreatedBanner } from '@/features/loans/components/LoanCreatedBanner'
import { LoansList } from '@/features/loans/components/LoansList'
import Link from 'next/link'

export default function LoansPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-slate-900">Empréstimos</h2>
          <p className="text-slate-600">Acompanhe todos os empréstimos do sistema.</p>
        </div>
        <Link
          href="/loans/new"
          className="inline-flex h-11 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Novo Empréstimo
        </Link>
      </header>

      <section className="mt-6 rounded-md bg-white p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Lista de empréstimos</h3>
        <div className="mt-3">
          <LoanCreatedBanner />
        </div>
        <div className="mt-4">
          <LoansList />
        </div>
      </section>
    </div>
  )
}
