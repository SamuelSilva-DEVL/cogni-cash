import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Home,
  Target,
  TrendingUp,
  TrendingDown,
  Gauge,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { Button } from '@/src/components/ui/button'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/src/contexts/authContext'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { logout, isAuthenticated, isReady } = useAuth()
  const [isExpanded, setIsExpanded] = React.useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Metas', href: '/goals', icon: Target },
    { name: 'Despesas', href: '/registrations/expenses', icon: TrendingDown },
    { name: 'Receitas', href: '/registrations/receipts', icon: TrendingUp },
    { name: 'Limites', href: '/registrations/budgets', icon: Gauge },
  ]

  React.useEffect(() => {
    setMobileMenuOpen(false)
  }, [router.pathname])

  React.useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isReady, isAuthenticated, router])

  const handleLogout = () => {
    logout()
    queryClient.clear()
    router.push('/login')
  }

  const brandMark = (
    <div className="h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
      <Wallet className="h-5 w-5 text-white" />
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="lg:hidden sticky top-0 z-50 w-full border-b bg-white">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            {brandMark}
            <span className="text-lg font-bold text-emerald-700">Cogni Cash</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-slate-100"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-white border-r border-slate-200 transition-all duration-300 ease-out',
          'lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isExpanded ? 'w-64' : 'lg:w-20 w-64',
        )}
      >
        <div className="flex h-full flex-col">
          <div className="hidden lg:flex h-16 items-center px-4 border-b">
            <Link href="/dashboard" className="flex items-center space-x-3 overflow-hidden">
              {brandMark}
              {isExpanded && (
                <span className="text-lg font-bold text-emerald-700 whitespace-nowrap">
                  Cogni Cash
                </span>
              )}
            </Link>
          </div>

          <div className="lg:hidden flex h-16 items-center px-4 border-b">
            <Link href="/dashboard" className="flex items-center space-x-3">
              {brandMark}
              <span className="text-lg font-bold text-emerald-700">Cogni Cash</span>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors group relative',
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
                  )}
                  title={!isExpanded ? item.name : undefined}
                >
                  <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-white')} />
                  <span className={cn('whitespace-nowrap', !isExpanded && 'lg:hidden')}>
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </nav>

          <div className="hidden lg:block border-t p-4">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-center w-full px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
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

          <div className="border-t p-4 space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-slate-600"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className={cn(!isExpanded && 'lg:hidden')}>Sair</span>
            </Button>
            <p className={cn('text-xs text-center text-slate-500', !isExpanded && 'lg:hidden')}>
              © 2026 Cogni Cash
            </p>
          </div>
        </div>
      </aside>

      <main
        className={cn(
          'transition-all duration-300 ease-out',
          'lg:ml-64',
          !isExpanded && 'lg:ml-20',
        )}
      >
        <header className="hidden lg:flex sticky top-0 z-30 h-16 items-center justify-end border-b bg-white px-6">
          <p className="text-sm text-slate-600 mr-4">Bem-vindo de volta</p>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </header>

        <div className="p-4 lg:p-6 xl:p-8">{children}</div>

        <footer className="border-t bg-white mt-16">
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
