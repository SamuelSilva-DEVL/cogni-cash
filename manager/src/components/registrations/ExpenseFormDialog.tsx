import React, { useState } from "react"
import { isAxiosError } from "axios"
import { toast } from "sonner"
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
import { useCreateExpense } from "@/src/hooks/use-transactions"
import { CATEGORY_LABELS } from "@/src/lib/mockData"
import { Expense } from "@/src/types"

interface ExpenseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const INITIAL = {
  value: "",
  category: "alimentacao" as Expense["category"],
  type: "variavel" as Expense["type"],
  date: new Date().toISOString().split("T")[0],
  description: "",
}

export function ExpenseFormDialog({ open, onOpenChange }: ExpenseFormDialogProps) {
  const createExpense = useCreateExpense()
  const [formData, setFormData] = useState(INITIAL)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createExpense.mutateAsync({
        value: Number(formData.value),
        category: formData.category,
        type: formData.type,
        date: formData.date,
        description: formData.description,
      })
      toast.success("Despesa registrada", { description: "Já está no seu histórico." })
      setFormData(INITIAL)
      onOpenChange(false)
    } catch (err) {
      toast.error(
        isAxiosError(err)
          ? ((err.response?.data?.message as string | undefined) ?? "Não foi possível registrar a despesa.")
          : "Não foi possível registrar a despesa.",
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Nova despesa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="exp-value">Valor (R$)</Label>
                <Input
                  id="exp-value"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="150,00"
                  className="font-mono tabular-nums"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exp-date">Data</Label>
                <Input
                  id="exp-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exp-description">Descrição</Label>
              <Input
                id="exp-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Supermercado do mês"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exp-category">Categoria</Label>
              <select
                id="exp-category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as Expense["category"] })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <div className="flex gap-4 pt-0.5">
                {(["fixo", "variavel"] as Expense["type"][]).map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="exp-type"
                      value={t}
                      checked={formData.type === t}
                      onChange={() => setFormData({ ...formData, type: t })}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">{t === "fixo" ? "Fixa" : "Variável"}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="cancel" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="soft" disabled={createExpense.isPending} className="min-w-[120px]">
              {createExpense.isPending ? "Registrando..." : "Registrar despesa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
