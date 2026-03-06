'use client'

import Link from 'next/link'
// import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { AuthGuard, useAuthStore } from '@/features/auth'
import { LayoutDashboard, Users, HandCoins, CalendarClock, User, Menu, X } from 'lucide-react'
import Image from "next/image";
import { tokenService } from '@/shared/auth/tokenService'
import { useState } from 'react'




const navItems = [
  { label: 'Painel Principal', description: "Resumo do negócio com indicadores, alertas e pendências.", href: '/dashboard', Icon: LayoutDashboard },
  { label: 'Clientes', description: "Cadastro e gestão completa dos clientes da carteira.", href: '/customers', Icon: Users },
  { label: 'Empréstimos', description: "Controle de contratos, parcelas, juros e histórico.", href: '/loans', Icon: HandCoins },
  { label: 'Vencimentos', description: "Calendário de cobranças, atrasos e próximos vencimentos.", href: '/due', Icon: CalendarClock },
  { label: 'Usuários', description: "Gestão de acessos, permissões e perfis administrativos.", href: '/users', Icon: User, adminOnly: true },
]

const pageMetaByPath: Record<string, { label: string; description?: string }> = {
  '/loans/new': {
    label: 'Novo empréstimo',
    description: 'Preencha os dados para registrar um novo empréstimo.',
  },
}


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
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const currentMeta =
    pageMetaByPath[pathname] || visibleNavItems.find((item) => item.href === pathname)

  function handleLogout() {
    tokenService.remove()
    clearMessages()
    router.replace('/login')
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 flex">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 md:static md:translate-x-0 md:w-64 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <div className="h-20 flex items-center px-6 border-b border-slate-200">
            <Image
              src="/images/Logo.png"
              alt="Group Logo"
              width={200}
              height={60}
              priority
            />
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 md:hidden"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="px-4 py-6 flex flex-col gap-2 flex-1 overflow-y-auto">
            {visibleNavItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.Icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
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

        {mobileNavOpen ? (
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="fixed inset-0 z-30 bg-slate-900/30 md:hidden"
            aria-label="Fechar menu"
          />
        ) : null}

        <div className="flex-1 min-h-screen flex flex-col">
          <header className="h-20 bg-white border-b border-slate-200 flex items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50 md:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {
              <header className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold text-slate-900">{currentMeta?.label || 'Dashboard'}</h2>
                <p className="text-slate-600">{currentMeta?.description}</p>
              </header>
            }

          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
