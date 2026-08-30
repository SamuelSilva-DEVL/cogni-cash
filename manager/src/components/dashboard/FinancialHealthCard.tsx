import React, { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"
import { Skeleton } from "@/src/components/ui/skeleton"
import { useFinancialSummary } from "@/src/hooks/use-financial-summary"
import { HelpCircle } from "lucide-react"
import { cn } from "@/src/lib/utils"

const METRIC_HELP = {
  expenseRatio: "Percentual da sua receita usado em despesas. Quanto menor, melhor.",
  savingsRate: "Quanto você está guardando em relação às metas e receitas.",
  goalsOnTrack: "Metas com progresso adequado para o prazo restante.",
} as const

const STATUS = {
  excelente: {
    ring: "oklch(0.55 0.15 152)",
    label: "Excelente",
    description: "Suas finanças estão em ótimo estado.",
    border: "border-emerald-200",
  },
  bom: {
    ring: "oklch(0.55 0.18 250)",
    label: "Bom",
    description: "Você está no caminho certo.",
    border: "border-blue-200",
  },
  atencao: {
    ring: "oklch(0.75 0.15 70)",
    label: "Atenção",
    description: "Algumas áreas merecem um olhar — vamos ajustar juntos.",
    border: "border-amber-200",
  },
  critico: {
    ring: "oklch(0.58 0.2 25)",
    label: "Crítico",
    description: "Vamos revisar juntos onde ajustar, passo a passo.",
    border: "border-red-200",
  },
} as const

function MetricLabel({ label, help }: { label: string; help: string }) {
  return (
    <p className="mb-1 flex items-center justify-center gap-1 text-xs text-slate-700">
      <span>{label}</span>
      <span title={help} className="inline-flex">
        <HelpCircle className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        <span className="sr-only">{help}</span>
      </span>
    </p>
  )
}

export const FinancialHealthCard = () => {
  const { financialHealth: health, isLoading } = useFinancialSummary()
  const [showFormula, setShowFormula] = useState(false)

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-2 h-4 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="mx-auto size-40 rounded-full" />
        </CardContent>
      </Card>
    )
  }

  const config = STATUS[health.status]

  return (
    <Card className={cn("h-full border-2", config.border)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Saúde financeira</CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="relative mx-auto size-40"
          role="img"
          aria-label={`Pontuação ${health.score} de 100, status ${config.label}`}
        >
          <div
            className="size-full rounded-full"
            style={{
              background: `conic-gradient(${config.ring} ${health.score}%, oklch(0.93 0 0) 0)`,
            }}
          />
          <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-card text-center">
            <span className="font-mono text-3xl font-bold tabular-nums text-foreground">
              {health.score}
            </span>
            <span className="text-xs text-slate-600">{config.label}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowFormula(!showFormula)}
          className="mx-auto mt-4 block text-xs font-medium text-emerald-800 hover:text-emerald-950"
        >
          {showFormula ? "Ocultar cálculo" : "Como calculamos?"}
        </button>
        {showFormula && (
          <p className="mt-2 text-center text-xs leading-relaxed text-slate-700">
            O score combina: gastos sobre receita (40%), taxa de poupança (30%)
            e metas no prazo (30%).
          </p>
        )}

        <div className="mt-6 grid grid-cols-3 gap-3 border-t pt-4">
          <div className="text-center">
            <MetricLabel label="Gastos" help={METRIC_HELP.expenseRatio} />
            <p className="font-mono text-base font-semibold tabular-nums">
              {Math.round(health.factors.expenseRatio)}%
            </p>
          </div>
          <div className="text-center">
            <MetricLabel label="Poupança" help={METRIC_HELP.savingsRate} />
            <p className="font-mono text-base font-semibold tabular-nums">
              {Math.round(health.factors.savingsRate)}%
            </p>
          </div>
          <div className="text-center">
            <MetricLabel label="Metas" help={METRIC_HELP.goalsOnTrack} />
            <p className="font-mono text-base font-semibold tabular-nums">
              {Math.round(health.factors.goalsOnTrack)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
