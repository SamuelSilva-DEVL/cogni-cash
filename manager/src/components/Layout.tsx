import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Home,
  MessageSquareText,
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
  analyst: 'Analista',
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
    { name: 'Analista', href: '/analyst', icon: MessageSquareText },
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
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground">
      <Wallet className="h-4 w-4" />
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-card lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            {brandMark}
            <span className="text-base font-bold text-foreground">Cogni Cash</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-foreground transition-colors hover:bg-accent"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-[transform,width] duration-200 ease-out',
          'lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isExpanded ? 'w-64' : 'w-64 lg:w-16',
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b border-sidebar-border px-3">
            <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
              {brandMark}
              <span
                className={cn(
                  'truncate whitespace-nowrap text-base font-bold text-foreground',
                  !isExpanded && 'lg:hidden',
                )}
              >
                Cogni Cash
              </span>
            </Link>
          </div>

          <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3" aria-label="Principal">
            {navigation.map((item) => {
              const isActive =
                router.pathname === item.href ||
                (item.href !== '/dashboard' && router.pathname.startsWith(item.href + '/'))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={!isExpanded ? item.name : undefined}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    !isExpanded && 'lg:justify-center lg:px-2',
                    isActive
                      ? 'bg-brand text-brand-foreground'
                      : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground',
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className={cn('truncate whitespace-nowrap', !isExpanded && 'lg:hidden')}>
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-sidebar-border p-2">
            <button
              type="button"
              onClick={handleLogout}
              title={!isExpanded ? 'Sair' : undefined}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground',
                !isExpanded && 'lg:justify-center lg:px-2',
              )}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span className={cn('whitespace-nowrap', !isExpanded && 'lg:hidden')}>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      <main
        className={cn(
          'min-h-screen transition-[margin] duration-200 ease-out',
          isExpanded ? 'lg:ml-64' : 'lg:ml-16',
        )}
      >
        <header className="sticky top-0 z-30 hidden h-14 items-center gap-3 border-b bg-card px-4 lg:flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Recolher menu' : 'Expandir menu'}
            className="h-8 w-8 shrink-0"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>

          {breadcrumbs.length > 0 && (
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb) => (
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

        <div className="mx-auto w-full max-w-6xl p-4 lg:p-6 xl:p-8">{children}</div>
      </main>
    </div>
  )
}
