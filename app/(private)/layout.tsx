'use client'

import Link from 'next/link'
// import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { AuthGuard } from '@/features/auth'
import { LayoutDashboard, Users, HandCoins } from 'lucide-react'
import Image from "next/image";


const navItems = [
  { label: 'Painel Principal', href: '/dashboard', Icon: LayoutDashboard },
  { label: 'Clientes', href: '/customers', Icon: Users },
  { label: 'Empréstimos', href: '/loans', Icon: HandCoins },
]

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 flex">
        <aside className="w-64 bg-white border-r border-slate-200">
          <div className="h-16 flex items-center px-6 border-b border-slate-200">
            <Image
              src="/images/logo.svg"
              alt="Group Logo"
              width={200}
              height={60}
              priority
            />
          </div>
          <nav className="px-4 py-6 flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.Icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-4 py-3 text-sm font-medium transition ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </nav>
        </aside>

        <div className="flex-1 min-h-screen flex flex-col">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6">
            <h1 className="text-base font-semibold text-slate-900">
              {navItems.find((item) => item.href === pathname)?.label || 'Dashboard'}
            </h1>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
