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
import { Activity, TrendingUp, TrendingDown, AlertCircle, HelpCircle } from "lucide-react"
import { cn } from "@/src/lib/utils"

const METRIC_HELP = {
  expenseRatio: "Percentual da sua receita usado em despesas. Quanto menor, melhor.",
  savingsRate: "Quanto você está guardando em relação às metas e receitas.",
  goalsOnTrack: "Metas com progresso adequado para o prazo restante.",
} as const

function MetricLabel({
  label,
  help,
}: {
  label: string
  help: string
}) {
  return (
    <p className="text-xs text-slate-700 mb-1 flex items-center gap-1">
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

  const statusConfig = {
    excelente: {
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: TrendingUp,
      label: "Excelente",
      description: "Suas finanças estão em ótimo estado!",
    },
    bom: {
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: Activity,
      label: "Bom",
      description: "Você está no caminho certo!",
    },
    atencao: {
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: AlertCircle,
      label: "Atenção",
      description: "Algumas áreas merecem um olhar — vamos ajustar juntos.",
    },
    critico: {
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      icon: TrendingDown,
      label: "Crítico",
      description: "Vamos revisar juntos onde ajustar, passo a passo.",
    },
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  const config = statusConfig[health.status]
  const StatusIcon = config.icon

  return (
    <Card className={cn("border-2", config.border)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Saúde Financeira</CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </div>
          <div className={cn("p-3 rounded-full", config.bg)}>
            <StatusIcon className={cn("h-6 w-6", config.color)} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold tabular-nums">{health.score}</span>
                <span
                  className={cn(
                    "text-sm font-semibold px-3 py-1 rounded-full",
                    config.bg,
                    config.color,
                  )}
                >
                  {config.label}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className={cn(
                    "max-w-full h-2 rounded-full transition-all duration-500",
                    health.status === "excelente" && "bg-emerald-500",
                    health.status === "bom" && "bg-blue-500",
                    health.status === "atencao" && "bg-amber-500",
                    health.status === "critico" && "bg-red-500",
                  )}
                  style={{ width: `${health.score}%` }}
                  role="progressbar"
                  aria-valuenow={health.score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Pontuação de saúde financeira"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFormula(!showFormula)}
                className="mt-2 text-xs text-emerald-700 hover:text-emerald-800 font-medium"
              >
                {showFormula ? "Ocultar cálculo" : "Como calculamos?"}
              </button>
              {showFormula && (
                <p className="mt-2 text-xs text-slate-700 leading-relaxed">
                  O score combina: gastos sobre receita (40%), taxa de poupança
                  (30%) e metas no prazo (30%).
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <MetricLabel label="Gastos/Receita" help={METRIC_HELP.expenseRatio} />
              <p className="text-lg font-semibold tabular-nums font-mono">
                {Math.round(health.factors.expenseRatio)}%
              </p>
            </div>
            <div>
              <MetricLabel label="Taxa Poupança" help={METRIC_HELP.savingsRate} />
              <p className="text-lg font-semibold tabular-nums font-mono">
                {Math.round(health.factors.savingsRate)}%
              </p>
            </div>
            <div>
              <MetricLabel label="Metas no Prazo" help={METRIC_HELP.goalsOnTrack} />
              <p className="text-lg font-semibold tabular-nums font-mono">
                {Math.round(health.factors.goalsOnTrack)}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
