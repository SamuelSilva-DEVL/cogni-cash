import React from "react"
import Link from "next/link"
import { Wallet } from "lucide-react"

interface AuthShellProps {
  title: string
  description: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function AuthShell({
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-[26rem]">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/login" className="inline-flex flex-col items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand text-brand-foreground">
              <Wallet className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold text-foreground">Cogni Cash</span>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Um lugar calmo para ver para onde vai o dinheiro.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 sm:p-8">
          <h1 className="text-2xl font-bold leading-tight text-foreground">{title}</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
          <div className="mt-6">{children}</div>
        </div>

        {footer ? (
          <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
        ) : null}
      </div>
    </div>
  )
}
