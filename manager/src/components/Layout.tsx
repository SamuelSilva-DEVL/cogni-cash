import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Home,
  Target,
  TrendingUp,
  TrendingDown,
  Gauge,
  Wallet,
  Menu,
  X,
  LogOut,
  PanelLeft,
} from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { Button } from '@/src/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/src/components/ui/breadcrumb'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/src/contexts/authContext'

interface LayoutProps {
  children: React.ReactNode
}

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  goals: 'Metas',
  registrations: 'Registros',
  expenses: 'Despesas',
  receipts: 'Receitas',
  budgets: 'Limites',
}

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.replace(/^\//, '').split('/').filter(Boolean)
  return segments
    .filter((seg) => !seg.startsWith('['))
    .map((seg, i, arr) => ({
      label: ROUTE_LABELS[seg] ?? seg,
      href: '/' + arr.slice(0, i + 1).join('/'),
      isLast: i === arr.length - 1,
    }))
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

  const breadcrumbs = buildBreadcrumbs(router.pathname)

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
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 flex-shrink-0">
      <Wallet className="h-4 w-4 text-white" />
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* ── Mobile header ─────────────────────────────────── */}
      <header className="lg:hidden sticky top-0 z-50 w-full shadow-sm bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            {brandMark}
            <span className="text-base font-bold text-emerald-700">Cogni Cash</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 hover:bg-muted transition-colors"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* ── Mobile backdrop ───────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-sidebar shadow-[1px_0_0_0_var(--sidebar-border)] transition-all duration-300 ease-out',
          'lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isExpanded ? 'w-64' : 'lg:w-16 w-64',
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 items-center border-b px-3">
            <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
              {brandMark}
              <span
                className={cn(
                  'truncate text-base font-bold text-emerald-700 whitespace-nowrap transition-all duration-300',
                  !isExpanded && 'lg:hidden',
                )}
              >
                Cogni Cash
              </span>
            </Link>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
            {navigation.map((item) => {
              const isActive =
                router.pathname === item.href ||
                (item.href !== '/dashboard' && router.pathname.startsWith(item.href + '/'))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={!isExpanded ? item.name : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    !isExpanded && 'lg:justify-center lg:px-2',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className={cn('truncate whitespace-nowrap', !isExpanded && 'lg:hidden')}>
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="border-t p-2">
            <button
              type="button"
              onClick={handleLogout}
              title={!isExpanded ? 'Sair' : undefined}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                !isExpanded && 'lg:justify-center lg:px-2',
              )}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span className={cn('whitespace-nowrap', !isExpanded && 'lg:hidden')}>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content area ─────────────────────────────── */}
      <main
        className={cn(
          'min-h-screen transition-all duration-300 ease-out',
          isExpanded ? 'lg:ml-64' : 'lg:ml-16',
        )}
      >
        {/* Topbar: toggle + breadcrumb */}
        <header className="sticky top-0 z-30 hidden h-14 items-center gap-3 shadow-sm bg-background/95 backdrop-blur-sm px-4 lg:flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Recolher menu' : 'Expandir menu'}
            className="h-8 w-8 flex-shrink-0"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>

          {breadcrumbs.length > 0 && (
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, i) => (
                  <React.Fragment key={crumb.href}>
                    <BreadcrumbItem>
                      {crumb.isLast ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={crumb.href}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!crumb.isLast && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}
        </header>

        <div className="p-4 lg:p-6 xl:p-8">{children}</div>
      </main>
    </div>
  )
}
