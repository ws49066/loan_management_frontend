import { LoanCreateForm } from '@/features/loans/components/LoanCreateForm'
import Link from 'next/link'

export default function NewLoanPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-slate-900">Novo empréstimo</h2>
          <p className="text-slate-600">Preencha os dados para registrar um novo empréstimo.</p>
        </div>
        <Link
          href="/loans"
          className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
        >
          Voltar
        </Link>
      </header>

      <section className="mt-6 rounded-md bg-white p-4 shadow-sm">
        <LoanCreateForm />
      </section>
    </div>
  )
}
