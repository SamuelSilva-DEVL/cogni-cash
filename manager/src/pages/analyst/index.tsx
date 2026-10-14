import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import axios from "axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Layout } from "@/src/components/Layout"
import { PageHeader } from "@/src/components/PageHeader"
import { Button } from "@/src/components/ui/button"
import { Skeleton } from "@/src/components/ui/skeleton"
import api from "@/src/api"
import { useAuth } from "@/src/contexts/authContext"
import { cn, formatCurrency } from "@/src/lib/utils"

type Period = "month" | "quarter" | "year"

type CategoryTotal = {
  name: string
  total: string
  count: number
}

type AnalystSnapshot = {
  period: Period
  label: string
  income: string
  expense: string
  balance: string
  transactionCount: number
  ready: boolean
  expenseCategories: CategoryTotal[]
  incomeCategories: CategoryTotal[]
}

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

type AskResponse = {
  reply: string
  snapshot: AnalystSnapshot
}

const PERIODS: { id: Period; label: string }[] = [
  { id: "month", label: "Este mês" },
  { id: "quarter", label: "3 meses" },
  { id: "year", label: "Este ano" },
]

const SUGGESTIONS = [
  "Onde foi a maior parte das despesas?",
  "A receita cobre o que saiu?",
  "Qual categoria pede atenção primeiro?",
]

function readApiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === "string" && message.trim()) return message
  }

  return "Não consegui falar com o analista agora. Tente de novo em instantes."
}

function AnalystReply({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/)

  return (
    <div className="max-w-[68ch] space-y-3 text-sm leading-relaxed text-foreground">
      {blocks.map((block, index) => {
        const lines = block.split("\n").map((line) => line.trim()).filter(Boolean)
        const isList = lines.length > 0 && lines.every((line) => /^[-•]\s+/.test(line))

        if (isList) {
          return (
            <ul key={index} className="list-disc space-y-1 pl-5">
              {lines.map((line) => (
                <li key={line}>{line.replace(/^[-•]\s+/, "")}</li>
              ))}
            </ul>
          )
        }

        return (
          <p key={index} className="text-pretty">
            {block}
          </p>
        )
      })}
    </div>
  )
}

function CategoryList({
  title,
  categories,
}: {
  title: string
  categories: CategoryTotal[]
}) {
  if (categories.length === 0) return null

  const visible = categories.slice(0, 5)
  const hidden = categories.length - visible.length

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <ul className="mt-2 space-y-1.5">
        {visible.map((category) => (
          <li key={category.name} className="flex items-baseline justify-between gap-4 text-sm">
            <span className="text-foreground">{category.name}</span>
            <span className="font-mono tabular-nums text-foreground">
              {formatCurrency(Number(category.total))}
            </span>
          </li>
        ))}
      </ul>
      {hidden > 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          e mais {hidden} {hidden === 1 ? "categoria" : "categorias"}
        </p>
      ) : null}
    </div>
  )
}

export default function AnalystPage() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [period, setPeriod] = useState<Period>("month")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState("")
  const [error, setError] = useState<string | null>(null)
  const periodRef = useRef(period)
  const threadEndRef = useRef<HTMLDivElement>(null)
  const fieldRef = useRef<HTMLTextAreaElement>(null)

  periodRef.current = period

  const snapshotQuery = useQuery({
    queryKey: ["analyst-snapshot", period],
    enabled: isAuthenticated,
    queryFn: async () => {
      const { data } = await api.get<AnalystSnapshot>("/analyst/snapshot", {
        params: { period },
      })
      return data
    },
  })

  const ask = useMutation({
    mutationFn: async (input: {
      message: string
      period: Period
      history: { role: "user" | "assistant"; content: string }[]
    }) => {
      const { data } = await api.post<AskResponse>("/analyst/messages", input)
      return data
    },
  })

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    threadEndRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "end" })
  }, [messages, ask.isPending, error])

  const snapshot = snapshotQuery.data
  const ready = snapshot?.ready ?? false

  function selectPeriod(next: Period) {
    if (next === period || ask.isPending) return
    setPeriod(next)
    setMessages([])
    setError(null)
  }

  async function submit(text: string) {
    const message = text.trim()
    if (!message || ask.isPending || !ready) return

    const history = messages.slice(-8).map((item) => ({
      role: item.role,
      content: item.content.slice(0, 4000),
    }))
    const askedPeriod = period

    setDraft("")
    setError(null)
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", content: message },
    ])

    try {
      const data = await ask.mutateAsync({ message, period: askedPeriod, history })
      if (periodRef.current !== askedPeriod) return

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply.slice(0, 4000),
        },
      ])
      queryClient.setQueryData(["analyst-snapshot", askedPeriod], data.snapshot)
    } catch (requestError) {
      if (periodRef.current !== askedPeriod) return
      setError(readApiError(requestError))
    } finally {
      fieldRef.current?.focus()
    }
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    void submit(draft)
  }

  return (
    <Layout>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <PageHeader
          title="Analista financeiro"
          description="Pergunte sobre receitas e despesas. As respostas usam os registros desta conta."
        />

        <div
          role="radiogroup"
          aria-label="Período da análise"
          className="flex flex-wrap gap-2"
          onKeyDown={(event) => {
            const index = PERIODS.findIndex((item) => item.id === period)
            if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
            event.preventDefault()
            const direction = event.key === "ArrowRight" ? 1 : -1
            const next = PERIODS[(index + direction + PERIODS.length) % PERIODS.length]
            selectPeriod(next.id)
          }}
        >
          {PERIODS.map((item) => {
            const selected = period === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={selected ? 0 : -1}
                disabled={ask.isPending}
                onClick={() => selectPeriod(item.id)}
                className={cn(
                  "h-9 rounded-md px-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50",
                  selected
                    ? "bg-brand text-brand-foreground"
                    : "border border-input bg-card text-foreground hover:bg-accent",
                )}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        <section aria-labelledby="period-totals" className="rounded-lg border bg-card p-6">
          <h2 id="period-totals" className="text-lg font-semibold leading-snug text-foreground">
            Neste período
          </h2>
          {snapshotQuery.isLoading ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index}>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="mt-2 h-7 w-28" />
                </div>
              ))}
            </div>
          ) : null}

          {snapshotQuery.isError ? (
            <div className="mt-4" role="alert">
              <p className="text-sm text-foreground">Não consegui carregar os totais deste período.</p>
              <Button
                type="button"
                variant="outline"
                className="mt-3"
                onClick={() => snapshotQuery.refetch()}
              >
                Tentar de novo
              </Button>
            </div>
          ) : null}

          {snapshot ? (
            <>
              <p className="mt-1 text-sm text-muted-foreground">{snapshot.label}</p>
              <dl className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-sm text-muted-foreground">Receitas</dt>
                  <dd className="mt-1 font-mono text-xl font-semibold tabular-nums text-brand">
                    {formatCurrency(Number(snapshot.income))}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Despesas</dt>
                  <dd className="mt-1 font-mono text-xl font-semibold tabular-nums text-destructive">
                    {formatCurrency(Number(snapshot.expense))}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Saldo</dt>
                  <dd className="mt-1 font-mono text-xl font-semibold tabular-nums text-foreground">
                    {formatCurrency(Number(snapshot.balance))}
                  </dd>
                </div>
              </dl>

              {snapshot.transactionCount === 0 ? (
                <p className="mt-4 max-w-[68ch] text-sm leading-relaxed text-foreground">
                  Este período ainda está sem lançamentos.{" "}
                  <Link
                    href="/registrations/receipts"
                    className="font-medium text-brand underline-offset-4 hover:underline"
                  >
                    Registre uma receita
                  </Link>{" "}
                  ou{" "}
                  <Link
                    href="/registrations/expenses"
                    className="font-medium text-brand underline-offset-4 hover:underline"
                  >
                    uma despesa
                  </Link>{" "}
                  para eu olhar os números com você.
                </p>
              ) : (
                <>
                  <CategoryList title="Despesas por categoria" categories={snapshot.expenseCategories} />
                  <CategoryList title="Receitas por categoria" categories={snapshot.incomeCategories} />
                </>
              )}
            </>
          ) : null}
        </section>

        <div className="flex flex-col gap-4" aria-live="polite">
          {messages.length === 0 && !ask.isPending ? (
            <div className="max-w-[68ch] space-y-4">
              <p className="text-sm leading-relaxed text-foreground">
                Escreva o que você quer entender. Eu olho o período selecionado e respondo com o que os registros mostram.
              </p>
              {ready && (snapshot?.transactionCount ?? 0) > 0 ? (
                <div className="flex flex-col items-start gap-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => void submit(suggestion)}
                      className="rounded-md border border-input bg-card px-3 py-2 text-left text-sm text-foreground transition-colors duration-200 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {messages.map((message) =>
            message.role === "user" ? (
              <div key={message.id} className="ml-auto max-w-[40rem] rounded-lg bg-brand-soft px-4 py-3">
                <p className="text-sm leading-relaxed text-foreground">{message.content}</p>
              </div>
            ) : (
              <div key={message.id} className="rounded-lg border bg-card px-4 py-3">
                <AnalystReply content={message.content} />
              </div>
            ),
          )}

          {ask.isPending ? (
            <div className="rounded-lg border bg-card px-4 py-3 text-sm text-foreground">
              Estou olhando os registros deste período.
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          ) : null}

          <div ref={threadEndRef} />
        </div>

        <form
          onSubmit={onSubmit}
          className="sticky bottom-0 z-20 border-t border-border bg-background pb-4 pt-4"
        >
          {!snapshotQuery.isLoading && snapshot && !ready ? (
            <p className="mb-3 max-w-[68ch] text-sm leading-relaxed text-foreground">
              O analista ainda precisa da chave de IA na API (AI_API_KEY) para responder. Os totais deste período continuam aqui.
            </p>
          ) : null}

          <label htmlFor="analyst-question" className="sr-only">
            Pergunta para o analista
          </label>
          <textarea
            ref={fieldRef}
            id="analyst-question"
            value={draft}
            maxLength={1000}
            rows={3}
            disabled={!ready || ask.isPending}
            placeholder="Ex.: o que mais pesou nas despesas?"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                void submit(draft)
              }
            }}
            className="flex w-full resize-none rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Enter envia. Shift+Enter quebra a linha.</p>
            <Button type="submit" disabled={!ready || ask.isPending || draft.trim().length === 0}>
              {ask.isPending ? "Olhando…" : "Perguntar"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
