import { CustomersList } from '@/features/customers/components/CustomersList'

export default function CustomersPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <section className="mt-6 rounded-md bg-white p-4 shadow-sm">
        <CustomersList />
      </section>
    </div>
  )
}
