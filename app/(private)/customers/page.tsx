import { CustomersList } from '@/features/customers/components/CustomersList'

export default function CustomersPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-slate-900">Clientes</h2>
        <p className="text-slate-600">Gerencie os clientes cadastrados.</p>
      </header>
      <section className="mt-6 rounded-md bg-white p-4 shadow-sm">
        <CustomersList />
      </section>
    </div>
  )
}
