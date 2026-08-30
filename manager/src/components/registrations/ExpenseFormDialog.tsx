import React, { useEffect } from "react"
import { isAxiosError } from "axios"
import { toast } from "sonner"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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

const expenseSchema = z.object({
  value: z.string().min(1, "Campo obrigatório").refine(
    (v) => !Number.isNaN(Number(v)) && Number(v) > 0,
    "Informe um valor válido maior que zero",
  ),
  category: z.string().min(1, "Campo obrigatório"),
  type: z.enum(["fixo", "variavel"]),
  date: z.string().min(1, "Campo obrigatório"),
  description: z.string().min(1, "Campo obrigatório"),
})

type ExpenseSchema = z.infer<typeof expenseSchema>

const DEFAULT_VALUES: ExpenseSchema = {
  value: "",
  category: "alimentacao",
  type: "variavel",
  date: new Date().toISOString().split("T")[0],
  description: "",
}

export function ExpenseFormDialog({ open, onOpenChange }: ExpenseFormDialogProps) {
  const createExpense = useCreateExpense()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseSchema>({
    resolver: zodResolver(expenseSchema),
    defaultValues: DEFAULT_VALUES,
  })

  useEffect(() => {
    if (open) {
      reset({
        ...DEFAULT_VALUES,
        date: new Date().toISOString().split("T")[0],
      })
    }
  }, [open, reset])

  const onSubmit = async (data: ExpenseSchema) => {
    try {
      await createExpense.mutateAsync({
        value: Number(data.value),
        category: data.category as Expense["category"],
        type: data.type,
        date: data.date,
        description: data.description,
      })
      toast.success("Despesa registrada", { description: "Já está no seu histórico." })
      reset({
        ...DEFAULT_VALUES,
        date: new Date().toISOString().split("T")[0],
      })
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

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="exp-value">Valor (R$)</Label>
                <Input
                  id="exp-value"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="150,00"
                  className="font-mono tabular-nums"
                  {...register("value")}
                />
                {errors.value && (
                  <p className="text-sm text-red-600">{errors.value.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exp-date">Data</Label>
                <Input
                  id="exp-date"
                  type="date"
                  {...register("date")}
                />
                {errors.date && (
                  <p className="text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exp-description">Descrição</Label>
              <Input
                id="exp-description"
                placeholder="Ex: Supermercado do mês"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exp-category">Categoria</Label>
              <select
                id="exp-category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("category")}
              >
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <div className="flex gap-4 pt-0.5">
                {(["fixo", "variavel"] as Expense["type"][]).map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value={t}
                      className="h-4 w-4"
                      {...register("type")}
                    />
                    <span className="text-sm">{t === "fixo" ? "Fixa" : "Variável"}</span>
                  </label>
                ))}
              </div>
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type.message}</p>
              )}
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
