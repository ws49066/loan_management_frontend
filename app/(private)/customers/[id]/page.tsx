import { CustomerSummary } from '@/features/customers/components/CustomerSummary'

type CustomerSummaryPageProps = {
  params: {
    id: string
  }
}

export default async function CustomerSummaryPage({ params }: CustomerSummaryPageProps) {
  const { id } = await params
  const customerId = Number(id)

  if (!Number.isFinite(customerId)) {
    return <p className="text-slate-600">Invalid customer.</p>
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-slate-900">Customer Details</h2>
        <p className="text-slate-600">Track totals and full history.</p>
      </header>
      <section className="mt-6">
        <CustomerSummary customerId={customerId} />
      </section>
    </div>
  )
}
