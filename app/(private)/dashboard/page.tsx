'use client'

import { DashboardSummary } from '@/features/dashboard'

export default function DashboardPage() {

  return (
    <div className="mx-auto w-full max-w-6xl">

      <div className="mt-6">
        <DashboardSummary />
      </div>
    </div>
  )
}
