import React, { useState } from "react"
import { Goal } from "@/src/types"
import { useCreateGoal } from "@/src/hooks/use-goals"
import { isAxiosError } from "axios"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { cn } from "@/src/lib/utils"

type GoalCategory = Goal["category"]

interface GoalFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal?: Goal
  mode: "create" | "edit"
}

const CATEGORY_OPTIONS: { value: GoalCategory; label: string; icon: string }[] = [
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

    if (mode === "edit") {
      toast.error("Edição de metas ainda não está disponível na API.")
      return
    }

    try {
      await createGoal.mutateAsync({
        title: formData.name,
        targetAmount: Number(formData.totalValue),
        currentAmount: Number(formData.currentValue) || 0,
        deadline: formData.deadlineDate || undefined,
      })

      toast.success("Meta criada com sucesso!")
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
      toast.error(message)
    }
  }

  const handleCategoryChange = (category: GoalCategory) => {
    const selectedCategory = CATEGORY_OPTIONS.find((c) => c.value === category)
    setFormData({ ...formData, category, icon: selectedCategory?.icon || "🎯" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            {mode === "create" ? "Nova meta" : "Editar meta"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome da meta</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Viagem para Europa"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="totalValue">Valor total (R$)</Label>
                <Input
                  id="totalValue"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.totalValue}
                  onChange={(e) =>
                    setFormData({ ...formData, totalValue: e.target.value })
                  }
                  placeholder="15000.00"
                  className="font-mono tabular-nums"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="currentValue">Valor atual (R$)</Label>
                <Input
                  id="currentValue"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.currentValue}
                  onChange={(e) =>
                    setFormData({ ...formData, currentValue: e.target.value })
                  }
                  placeholder="0.00"
                  className="font-mono tabular-nums"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="deadlineDate">Prazo</Label>
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
              <div className="flex gap-2 flex-wrap">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = formData.category === cat.value
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleCategoryChange(cat.value)}
                      className={cn(
                        "flex flex-1 min-w-[80px] flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-medium transition-all",
                        isSelected
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500"
                          : "border-border bg-background text-muted-foreground hover:border-emerald-300 hover:bg-emerald-50/50",
                      )}
                    >
                      <span className="text-xl leading-none" aria-hidden="true">
                        {cat.icon}
                      </span>
                      <span>{cat.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/30">
            <Button
              type="button"
              variant="cancel"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="soft" disabled={createGoal.isPending} className="min-w-[110px]">
              {createGoal.isPending ? "Salvando..." : mode === "create" ? "Criar meta" : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
