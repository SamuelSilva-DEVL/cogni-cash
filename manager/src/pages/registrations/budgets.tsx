import React, { useState } from "react"
import { Layout } from "@/src/components/Layout"
import { PageHeader } from "@/src/components/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Input } from "@/src/components/ui/input"
import { FieldSelect } from "@/src/components/ui/field-select"
import { Label } from "@/src/components/ui/label"
import { Skeleton } from "@/src/components/ui/skeleton"
import {
  useCategoryBudgets,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
  isBudgetConflict,
} from "@/src/hooks/use-budgets"
import { formatCurrency, cn } from "@/src/lib/utils"
import { CATEGORY_LABELS } from "@/src/lib/mockData"
import {
  Gauge,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Trash2,
} from "lucide-react"
import { isAxiosError } from "axios"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"

const MONTH_LABELS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

const PRESET_CATEGORIES = Object.values(CATEGORY_LABELS)

type BudgetStatus = "ok" | "warning" | "exceeded" | "no_limit"

function getStatusColor(status: BudgetStatus) {
  if (status === "exceeded") return "text-red-600"
  if (status === "warning") return "text-amber-600"
  return "text-emerald-600"
}

function getProgressColor(status: BudgetStatus) {
  if (status === "exceeded") return "bg-red-500"
  if (status === "warning") return "bg-amber-500"
  return "bg-emerald-500"
}

function statusLabel(status: BudgetStatus) {
  if (status === "exceeded") return "Ultrapassado"
  if (status === "warning") return "Atenção"
  if (status === "ok") return "Dentro do limite"
  return "Sem limite"
}

export default function BudgetsPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  // form de criação
  const [newCategory, setNewCategory] = useState(PRESET_CATEGORIES[0])
  const [customCategory, setCustomCategory] = useState("")
  const [newLimit, setNewLimit] = useState("")

  // estados inline de edição (budgetId → valor digitado)
  const [draftLimits, setDraftLimits] = useState<Record<string, string>>({})

  const [successBudgetId, setSuccessBudgetId] = useState<string | null>(null)

  // confirmação de exclusão
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    name: string
  } | null>(null)

  const { data, isLoading } = useCategoryBudgets(month, year)
  const createBudget = useCreateBudget(month, year)
  const updateBudget = useUpdateBudget(month, year)
  const deleteBudgetMutation = useDeleteBudget(month, year)

  const isCustomCategory = newCategory === "__custom__"
  const categoryToCreate = isCustomCategory ? customCategory.trim() : newCategory
  const isSaving = createBudget.isPending || updateBudget.isPending

  function shiftMonth(delta: number) {
    const d = new Date(year, month - 1 + delta, 1)
    setMonth(d.getMonth() + 1)
    setYear(d.getFullYear())
    setDraftLimits({})
    setSuccessBudgetId(null)
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault()
    const limit = Number(newLimit)

    if (!categoryToCreate) {
      toast.error("Selecione ou informe uma categoria.")
      return
    }
    if (!newLimit || Number.isNaN(limit) || limit <= 0) {
      toast.error("Informe um limite válido maior que zero.")
      return
    }

    try {
      await createBudget.mutateAsync({ categoryName: categoryToCreate, limit })
      setNewLimit("")
      setCustomCategory("")
      toast.success("Limite registrado com sucesso.")
    } catch (error) {
      if (isBudgetConflict(error)) {
        toast.error(
          `Já existe um limite para "${categoryToCreate}" em ${MONTH_LABELS[month - 1]}/${year}. Edite-o abaixo.`,
        )
        return
      }
      toast.error(
        isAxiosError(error)
          ? ((error.response?.data?.message as string | undefined) ??
            "Não foi possível registrar o limite.")
          : "Não foi possível registrar o limite.",
      )
    }
  }

  async function handleUpdate(budgetId: string) {
    const rawValue = draftLimits[budgetId]
    const limit = Number(rawValue)

    if (!rawValue || Number.isNaN(limit) || limit <= 0) {
      toast.error("Informe um limite válido maior que zero.")
      return
    }

    try {
      await updateBudget.mutateAsync({ id: budgetId, limit })
      setSuccessBudgetId(budgetId)
      setDraftLimits((prev) => {
        const next = { ...prev }
        delete next[budgetId]
        return next
      })
      setTimeout(() => setSuccessBudgetId(null), 2500)
      toast.success("Limite atualizado.")
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? ((error.response?.data?.message as string | undefined) ??
            "Não foi possível atualizar o limite.")
          : "Não foi possível atualizar o limite.",
      )
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    try {
      await deleteBudgetMutation.mutateAsync(deleteTarget.id)
      toast.success("Limite removido.")
    } catch {
      toast.error("Não foi possível remover o limite.")
    } finally {
      setDeleteTarget(null)
    }
  }

  const configuredLimits = (data?.items ?? []).filter(
    (item) => item.budgetId !== null,
  )

  return (
    <Layout>
      <div className="space-y-8">
        <PageHeader
          title="Limites por categoria"
          description="Defina quanto pretende gastar por categoria neste mês. As despesas registradas entram na conta automaticamente."
        />

        {/* ── Formulário de criação ── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5 text-brand" aria-hidden="true" />
              Registrar limite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleCreate}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <FieldSelect
                  id="category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  {PRESET_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="__custom__">Outra categoria...</option>
                </FieldSelect>
              </div>

              {isCustomCategory && (
                <div className="space-y-2">
                  <Label htmlFor="customCategory">Nome da categoria</Label>
                  <Input
                    id="customCategory"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Ex: Assinaturas"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="newLimit">Limite mensal (R$)</Label>
                <Input
                  id="newLimit"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  placeholder="500,00"
                  className="font-mono tabular-nums"
                  required
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createBudget.isPending}
                >
                  {createBudget.isPending ? "Registrando..." : "Registrar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ── Lista de limites do mês ── */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Gauge className="h-5 w-5 text-brand" aria-hidden="true" />
                {MONTH_LABELS[month - 1]} de {year}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => shiftMonth(-1)}
                  aria-label="Mês anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => shiftMonth(1)}
                  aria-label="Próximo mês"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {isLoading && (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full" />
                ))}
              </div>
            )}

            {!isLoading && configuredLimits.length === 0 && (
              <div className="rounded-lg border border-dashed p-10 text-center">
                <p className="mb-1 font-medium text-foreground">
                  Nenhum limite registrado neste mês
                </p>
                <p className="mx-auto max-w-md text-sm text-muted-foreground">
                  Use o formulário acima para definir o quanto pretende gastar
                  em cada categoria.
                </p>
              </div>
            )}

            {!isLoading &&
              configuredLimits.map((item) => {
                const limit = item.limit!
                const budgetId = item.budgetId!
                const percentage = item.percentUsed ?? 0
                const draftValue = draftLimits[budgetId] ?? String(limit)

                return (
                  <div
                    key={budgetId}
                    className="space-y-4 border-b pb-5 last:border-b-0 last:pb-0"
                  >
                    {/* cabeçalho do item */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {item.categoryName}
                        </h3>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          <span className="font-mono tabular-nums font-medium">
                            {formatCurrency(item.spent)}
                          </span>{" "}
                          gastos de{" "}
                          <span className="font-mono tabular-nums font-medium">
                            {formatCurrency(limit)}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Badge
                          tone={
                            item.status === "exceeded"
                              ? "danger"
                              : item.status === "warning"
                                ? "warning"
                                : "brand"
                          }
                        >
                          {statusLabel(item.status as BudgetStatus)}
                        </Badge>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:bg-red-50 hover:text-destructive"
                          onClick={() =>
                            setDeleteTarget({
                              id: budgetId,
                              name: item.categoryName,
                            })
                          }
                          aria-label={`Remover limite de ${item.categoryName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* barra de progresso */}
                    <div className="space-y-1.5">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-2 rounded-full transition-all duration-500",
                            getProgressColor(item.status as BudgetStatus),
                          )}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                          role="progressbar"
                          aria-valuenow={percentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                      <p
                        className={cn(
                          "text-xs",
                          getStatusColor(item.status as BudgetStatus),
                        )}
                      >
                        {percentage}% utilizado
                        {item.status !== "exceeded" &&
                          item.remaining !== null &&
                          ` — restam ${formatCurrency(item.remaining)}`}
                        {item.status === "exceeded" &&
                          ` — ultrapassado em ${formatCurrency(item.spent - limit)}`}
                      </p>
                    </div>

                    {/* edição inline */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={draftValue}
                        onChange={(e) =>
                          setDraftLimits((prev) => ({
                            ...prev,
                            [budgetId]: e.target.value,
                          }))
                        }
                        className="font-mono tabular-nums sm:max-w-[180px]"
                        aria-label={`Novo limite para ${item.categoryName}`}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleUpdate(budgetId)}
                        disabled={isSaving}
                      >
                        {updateBudget.isPending ? (
                          "Salvando..."
                        ) : successBudgetId === budgetId ? (
                          <span className="flex items-center gap-1.5">
                            <Check className="h-3.5 w-3.5" />
                            Salvo
                          </span>
                        ) : (
                          "Atualizar"
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
          </CardContent>
        </Card>
      </div>

      {/* ── Diálogo de confirmação de exclusão ── */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover limite</DialogTitle>
            <DialogDescription>
              Deseja remover o limite de{" "}
              <strong>{deleteTarget?.name}</strong> em{" "}
              {MONTH_LABELS[month - 1]}/{year}? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="cancel" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteBudgetMutation.isPending}
            >
              {deleteBudgetMutation.isPending ? "Removendo..." : "Remover"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}
