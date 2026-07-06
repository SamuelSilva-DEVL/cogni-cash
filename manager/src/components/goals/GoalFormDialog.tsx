import React, { useState } from "react"
import { Goal } from "@/src/types"
import { useCreateGoal } from "@/src/hooks/use-goals"
import { isAxiosError } from "axios"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

type GoalCategory = Goal["category"]

interface GoalFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal?: Goal
  mode: "create" | "edit"
}

const CATEGORY_OPTIONS: {
  value: GoalCategory
  label: string
  icon: string
}[] = [
  { value: "casa", label: "Casa", icon: "🏠" },
  { value: "viagem", label: "Viagem", icon: "✈️" },
  { value: "educacao", label: "Educação", icon: "🎓" },
  { value: "investimento", label: "Investimento", icon: "💰" },
  { value: "outros", label: "Outros", icon: "🎯" },
]

export const GoalFormDialog = ({
  open,
  onOpenChange,
  goal,
  mode,
}: GoalFormDialogProps) => {
  const createGoal = useCreateGoal()
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: goal?.name || "",
    totalValue: goal?.totalValue?.toString() || "",
    currentValue: goal?.currentValue?.toString() || "",
    deadlineDate: goal?.deadlineDate || "",
    category: (goal?.category || "outros") as GoalCategory,
    icon: goal?.icon || "🎯",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (mode === "edit") {
      setError("Edição de metas ainda não está disponível na API.")
      return
    }

    try {
      await createGoal.mutateAsync({
        title: formData.name,
        targetAmount: Number(formData.totalValue),
        currentAmount: Number(formData.currentValue) || 0,
        deadline: formData.deadlineDate || undefined,
      })

      onOpenChange(false)
      setFormData({
        name: "",
        totalValue: "",
        currentValue: "",
        deadlineDate: "",
        category: "outros",
        icon: "🎯",
      })
    } catch (err) {
      const message = isAxiosError(err)
        ? (err.response?.data?.message as string | undefined) ??
          "Não foi possível criar a meta."
        : "Não foi possível criar a meta."
      setError(message)
    }
  }

  const handleCategoryChange = (category: GoalCategory) => {
    const selectedCategory = CATEGORY_OPTIONS.find((c) => c.value === category)
    setFormData({
      ...formData,
      category,
      icon: selectedCategory?.icon || "🎯",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Criar nova meta" : "Editar meta"}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da meta</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ex: Viagem para Europa"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalValue">Valor total</Label>
              <Input
                id="totalValue"
                type="number"
                step="0.01"
                value={formData.totalValue}
                onChange={(e) =>
                  setFormData({ ...formData, totalValue: e.target.value })
                }
                placeholder="15000.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentValue">Valor atual</Label>
              <Input
                id="currentValue"
                type="number"
                step="0.01"
                value={formData.currentValue}
                onChange={(e) =>
                  setFormData({ ...formData, currentValue: e.target.value })
                }
                placeholder="5000.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadlineDate">Data limite</Label>
            <Input
              id="deadlineDate"
              type="date"
              value={formData.deadlineDate}
              onChange={(e) =>
                setFormData({ ...formData, deadlineDate: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`p-3 rounded-lg border transition-colors hover:border-emerald-300 ${
                    formData.category === cat.value
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-slate-200"
                  }`}
                >
                  <div className="text-2xl mb-1" aria-hidden="true">
                    {cat.icon}
                  </div>
                  <div className="text-xs font-medium">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createGoal.isPending}>
              {createGoal.isPending
                ? "Salvando..."
                : mode === "create"
                  ? "Criar meta"
                  : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
