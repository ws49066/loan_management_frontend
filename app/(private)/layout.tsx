'use client'

import Link from 'next/link'
// import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { AuthGuard, useAuthStore } from '@/features/auth'
import { LayoutDashboard, Users, HandCoins, CalendarClock, User } from 'lucide-react'
import Image from "next/image";
import { tokenService } from '@/shared/auth/tokenService'


const navItems = [
  { label: 'Painel Principal', href: '/dashboard', Icon: LayoutDashboard },
  { label: 'Clientes', href: '/customers', Icon: Users },
  { label: 'Empréstimos', href: '/loans', Icon: HandCoins },
  { label: 'Vencimentos', href: '/due', Icon: CalendarClock },
  { label: 'Usuários', href: '/users', Icon: User, adminOnly: true },
]

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const clearMessages = useAuthStore((state) => state.clearMessages)
  const isAdmin = user?.role === 'ADMIN'
  const visibleNavItems = navItems.filter((item) => !item.adminOnly || isAdmin)

  function handleLogout() {
    tokenService.remove()
    clearMessages()
    router.replace('/login')
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 flex">
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-slate-200">
            <Image
              src="/images/logo.svg"
              alt="Group Logo"
              width={200}
              height={60}
              priority
            />
          </div>
          <nav className="px-4 py-6 flex flex-col gap-2 flex-1">
            {visibleNavItems.map((item) => {
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
          <div className="border-t border-slate-200 px-4 py-4">
            <div className="text-xs font-semibold text-slate-500">Logado como</div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {user?.name || user?.email || 'Sem nome'}
              {user?.role ? (
                <span className="ml-2 text-xs font-semibold text-slate-500">
                  ({user.role})
                </span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 w-full rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
            >
              Sair
            </button>
          </div>
        </aside>

        <div className="flex-1 min-h-screen flex flex-col">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6">
            <h1 className="text-base font-semibold text-slate-900">
              {visibleNavItems.find((item) => item.href === pathname)?.label || 'Dashboard'}
            </h1>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
