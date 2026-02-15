import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Home, Target, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Wallet, Menu, X } from 'lucide-react'
import { cn } from '@/src/lib/utils'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  const router = useRouter()
  // NOVO: Estado para expansão do sidebar
  const [isExpanded, setIsExpanded] = React.useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Metas', href: '/goals', icon: Target },
    { name: 'Despesas', href: '/registrations/expenses', icon: TrendingDown },
    { name: 'Receitas', href: '/registrations/receipts', icon: TrendingUp },
  ]

  // NOVO: Fecha menu mobile ao navegar
  React.useEffect(() => {
    setMobileMenuOpen(false)
  }, [router.pathname])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* NOVO: Mobile Header (antes não existia header mobile separado) */}
      <header className="lg:hidden sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg">
              {/* MUDANÇA: Ícone Wallet ao invés de letra C */}
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
              Cogni Cash
            </span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            {/* NOVO: Ícone X quando aberto */}
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* NOVO: Mobile Overlay (escurece fundo quando menu aberto) */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* NOVO: Sidebar Lateral (substitui header horizontal) */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-white border-r border-slate-200 transition-all duration-300 ease-in-out shadow-lg',
          'lg:translate-x-0', // NOVO: Sempre visível no desktop
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0', // NOVO: Toggle mobile
          isExpanded ? 'w-64' : 'lg:w-20 w-64' // NOVO: Largura dinâmica
        )}
      >
        <div className="flex h-full flex-col">
          {/* NOVO: Logo Desktop dentro do Sidebar */}
          <div className="hidden lg:flex h-16 items-center justify-between px-4 border-b">
            <Link href="/dashboard" className="flex items-center space-x-3 group overflow-hidden">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all flex-shrink-0">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              {/* NOVO: Texto só aparece se expandido */}
              {isExpanded && (
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent whitespace-nowrap">
                  Cogni Cash
                </span>
              )}
            </Link>
          </div>

          {/* NOVO: Logo Mobile dentro do Sidebar */}
          <div className="lg:hidden flex h-16 items-center justify-between px-4 border-b">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                Cogni Cash
              </span>
            </Link>
          </div>

          {/* NOVO: Navigation VERTICAL no Sidebar */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-x-hidden overflow-y-auto">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all group relative',
                    isActive
                      ? 'bg-gradient-to-r from-primary to-emerald-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                  title={!isExpanded ? item.name : undefined}
                >
                  <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-white')} />
                  {/* NOVO: Texto esconde no desktop quando recolhido */}
                  <span className={cn('whitespace-nowrap', !isExpanded && 'lg:hidden')}>{item.name}</span>
                  
                  {/* NOVO: Tooltip quando recolhido (desktop) */}
                  {!isExpanded && (
                    <div className="hidden lg:block absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* NOVO: Botão de Toggle (só desktop) */}
          <div className="hidden lg:block border-t p-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-center w-full px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-all"
              title={isExpanded ? 'Recolher menu' : 'Expandir menu'}
            >
              {isExpanded ? (
                <>
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Recolher</span>
                </>
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* NOVO: Footer Mobile no Sidebar */}
          <div className="lg:hidden border-t p-4">
            <p className="text-xs text-center text-slate-600">
              © 2026 Cogni Cash
            </p>
          </div>
        </div>
      </aside>

      {/* MUDANÇA: Main Content com margem dinâmica */}
      <main
        className={cn(
          'transition-all duration-300 ease-in-out',
          'lg:ml-64', // NOVO: Margem padrão para sidebar expandido
          !isExpanded && 'lg:ml-20' // NOVO: Margem menor quando recolhido
        )}
      >
        {/* NOVO: Header Desktop dentro do conteúdo */}
        <header className="hidden lg:block sticky top-0 z-30 w-full border-b bg-white/80 backdrop-blur-xl shadow-sm">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              {/* NOVO: Título da página atual */}
              <h1 className="text-xl font-semibold text-slate-900">
                {navigation.find(item => item.href === router.pathname)?.name || 'Cogni Cash'}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-slate-600">
                Bem-vindo de volta! 👋
              </div>
            </div>
          </div>
        </header>

        {/* MUDANÇA: Padding responsivo */}
        <div className="p-4 lg:p-6 xl:p-8">
          {children}
        </div>

        {/* Footer mantido igual */}
        <footer className="border-t bg-white/50 backdrop-blur-sm mt-16">
          <div className="px-4 lg:px-6 xl:px-8 py-6">
            <p className="text-center text-sm text-slate-600">
              © 2026 Cogni Cash. Gerencie suas finanças com inteligência.
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}