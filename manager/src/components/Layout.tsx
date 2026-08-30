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
  ChevronsLeft,
  ChevronsRight,
  Calendar,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/src/components/ui/tooltip'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/src/contexts/authContext'

const SIDEBAR_KEY = 'COGNI_CASH_SIDEBAR_EXPANDED'

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  goals: 'Metas',
  registrations: 'Registros',
  expenses: 'Despesas',
  receipts: 'Receitas',
  budgets: 'Limites',
}

const NAV_SECTIONS = [
  {
    label: 'Principal',
    items: [{ name: 'Dashboard', href: '/dashboard', icon: Home }],
  },
  {
    label: 'Finanças',
    items: [
      { name: 'Despesas', href: '/registrations/expenses', icon: TrendingDown },
      { name: 'Receitas', href: '/registrations/receipts', icon: TrendingUp },
      { name: 'Limites', href: '/registrations/budgets', icon: Gauge },
      { name: 'Metas', href: '/goals', icon: Target },
    ],
  },
] as const

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

function formatHeaderDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function emailInitials(email: string | null) {
  if (!email) return 'CC'
  const local = email.split('@')[0] ?? ''
  const parts = local.split(/[._-]/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return local.slice(0, 2).toUpperCase() || 'CC'
}

function displayNameFromEmail(email: string | null) {
  if (!email) return 'Sua conta'
  const local = email.split('@')[0] ?? email
  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { logout, isAuthenticated, isReady, userEmail } = useAuth()
  const [isExpanded, setIsExpanded] = React.useState(true)
  const [sidebarReady, setSidebarReady] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [today] = React.useState(() => new Date())

  const breadcrumbs = buildBreadcrumbs(router.pathname)
  const initials = emailInitials(userEmail)
  const displayName = displayNameFromEmail(userEmail)

  React.useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_KEY)
    if (stored === 'false') setIsExpanded(false)
    setSidebarReady(true)
  }, [])

  React.useEffect(() => {
    setMobileMenuOpen(false)
  }, [router.pathname])

  React.useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isReady, isAuthenticated, router])

  const toggleExpanded = () => {
    setIsExpanded((prev) => {
      const next = !prev
      localStorage.setItem(SIDEBAR_KEY, String(next))
      return next
    })
  }

  const handleLogout = () => {
    logout()
    queryClient.clear()
    router.push('/login')
  }

  const isCollapsed = !isExpanded

  const brandMark = (
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 flex-shrink-0">
      <Wallet className="h-4 w-4 text-white" />
    </div>
  )

  const navLinkClass = (isActive: boolean, collapsed: boolean) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
      collapsed && 'lg:size-10 lg:justify-center lg:gap-0 lg:px-0 lg:py-0 lg:mx-auto',
      isActive
        ? 'bg-emerald-800 text-emerald-50'
        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900',
    )

  const isItemActive = (href: string) =>
    router.pathname === href ||
    (href !== '/dashboard' && router.pathname.startsWith(href + '/'))

  return (
    <div className="min-h-screen bg-background">
      <header className="lg:hidden sticky top-0 z-50 w-full border-b border-border bg-card">
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

      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-sidebar',
          sidebarReady && 'transition-[width,transform] duration-200 ease-out',
          'border-r border-sidebar-border',
          'lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isExpanded ? 'w-64' : 'lg:w-[72px] w-64',
        )}
      >
        <div className="flex h-full flex-col px-3 py-3">
          <div
            className={cn(
              'flex h-12 items-center gap-2',
              isCollapsed && 'lg:justify-center',
            )}
          >
            <Link href="/dashboard" className="flex min-w-0 items-center gap-3 overflow-hidden">
              {brandMark}
              <span
                className={cn(
                  'truncate text-base font-bold text-foreground',
                  isCollapsed && 'lg:hidden',
                )}
              >
                Cogni Cash
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleExpanded}
              aria-label={isExpanded ? 'Recolher menu' : 'Expandir menu'}
              className={cn(
                'ml-auto hidden h-8 w-8 text-slate-500 lg:inline-flex',
                isCollapsed && 'lg:hidden',
              )}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
          </div>

          {isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleExpanded}
              aria-label="Expandir menu"
              className="mx-auto mt-1 hidden h-8 w-8 text-slate-500 lg:inline-flex"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          )}

          <nav className="mt-4 flex-1 space-y-5 overflow-y-auto">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label} className="space-y-1">
                <p
                  className={cn(
                    'px-3 pb-1 text-[11px] font-medium text-slate-400',
                    isCollapsed && 'lg:hidden',
                  )}
                >
                  {section.label}
                </p>
                {section.items.map((item) => {
                  const active = isItemActive(item.href)

                  if (!isCollapsed) {
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={navLinkClass(active, false)}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    )
                  }

                  return (
                    <React.Fragment key={item.name}>
                      <div className="hidden lg:block">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              href={item.href}
                              aria-current={active ? "page" : undefined}
                              className={navLinkClass(active, true)}
                            >
                              <item.icon className="h-4 w-4 flex-shrink-0" />
                              <span className="sr-only">{item.name}</span>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right">{item.name}</TooltipContent>
                        </Tooltip>
                      </div>
                      <Link
                        href={item.href}
                        className={cn(navLinkClass(active, false), 'lg:hidden')}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span>{item.name}</span>
                      </Link>
                    </React.Fragment>
                  )
                })}
              </div>
            ))}
          </nav>

          <div className="mt-auto border-t border-sidebar-border pt-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors duration-150 hover:bg-slate-100',
                    isCollapsed && 'lg:justify-center lg:px-0',
                  )}
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800">
                    {initials}
                  </span>
                  <span className={cn('min-w-0 flex-1', isCollapsed && 'lg:hidden')}>
                    <span className="block truncate text-sm font-medium text-foreground">
                      {displayName}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {userEmail ?? 'Conta conectada'}
                    </span>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="min-w-56 w-56">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-medium text-foreground">{displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      <main
        className={cn(
          'min-h-screen',
          sidebarReady && 'transition-[margin] duration-200 ease-out',
          isExpanded ? 'lg:ml-64' : 'lg:ml-[72px]',
        )}
      >
        <header className="hidden h-14 items-center justify-between gap-4 px-6 lg:flex">
          <div className="flex min-w-0 items-center gap-4">
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
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="h-4 w-4 text-emerald-700" aria-hidden="true" />
            <time dateTime={today.toISOString()}>{formatHeaderDate(today)}</time>
          </div>
        </header>

        <div className="p-4 lg:p-6 xl:px-8 xl:pb-10 xl:pt-2">{children}</div>
      </main>
    </div>
  )
}
