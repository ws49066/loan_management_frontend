'use client'

import { InstallmentsDueTable } from '@/features/due'

export default function DuePage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <InstallmentsDueTable />
    </div>
  )
}
