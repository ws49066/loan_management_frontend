import { LoanCreateForm } from '@/features/loans/components/LoanCreateForm'
import { LoansList } from '@/features/loans/components/LoansList'

export default function LoansPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-slate-900">Empréstimos</h2>
        <p className="text-slate-600">Acompanhe todos os empréstimos do sistema.</p>
      </header>

      <section className="mt-6 rounded-md bg-white p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Novo empréstimo</h3>
        <div className="mt-4">
          <LoanCreateForm />
        </div>
      </section>

      <section className="mt-6 rounded-md bg-white p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Lista de empréstimos</h3>
        <div className="mt-4">
          <LoansList />
        </div>
      </section>
    </div>
  )
}
