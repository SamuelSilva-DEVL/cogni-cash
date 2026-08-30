import React, { useEffect } from "react"
import { Goal } from "@/src/types"
import { useCreateGoal } from "@/src/hooks/use-goals"
import { isAxiosError } from "axios"
import { toast } from "sonner"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogFooter,
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

const goalSchema = z.object({
  name: z.string().min(1, "Campo obrigatório"),
  totalValue: z.string().min(1, "Campo obrigatório").refine(
    (v) => !Number.isNaN(Number(v)) && Number(v) > 0,
    "Informe um valor válido maior que zero",
  ),
  currentValue: z.string().refine(
    (v) => v === "" || (!Number.isNaN(Number(v)) && Number(v) >= 0),
    "Informe um valor válido",
  ),
  deadlineDate: z.string().min(1, "Campo obrigatório"),
  category: z.enum(["casa", "viagem", "educacao", "investimento", "outros"]),
  icon: z.string(),
})

type GoalSchema = z.infer<typeof goalSchema>

export const GoalFormDialog = ({
  open,
  onOpenChange,
  goal,
  mode,
}: GoalFormDialogProps) => {
  const createGoal = useCreateGoal()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<GoalSchema>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: goal?.name || "",
      totalValue: goal?.totalValue?.toString() || "",
      currentValue: goal?.currentValue?.toString() || "",
      deadlineDate: goal?.deadlineDate || "",
      category: (goal?.category || "outros") as GoalCategory,
      icon: goal?.icon || "🎯",
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: goal?.name || "",
        totalValue: goal?.totalValue?.toString() || "",
        currentValue: goal?.currentValue?.toString() || "",
        deadlineDate: goal?.deadlineDate || "",
        category: (goal?.category || "outros") as GoalCategory,
        icon: goal?.icon || "🎯",
      })
    }
  }, [open, goal, reset])

  const category = watch("category")

  const onSubmit = async (data: GoalSchema) => {
    if (mode === "edit") {
      toast.error("Edição de metas ainda não está disponível na API.")
      return
    }

    try {
      await createGoal.mutateAsync({
        title: data.name,
        targetAmount: Number(data.totalValue),
        currentAmount: Number(data.currentValue) || 0,
        deadline: data.deadlineDate || undefined,
      })

      toast.success("Meta criada com sucesso!")
      onOpenChange(false)
      reset({
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

  const handleCategoryChange = (nextCategory: GoalCategory) => {
    const selectedCategory = CATEGORY_OPTIONS.find((c) => c.value === nextCategory)
    setValue("category", nextCategory)
    setValue("icon", selectedCategory?.icon || "🎯")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {mode === "create" ? "Nova meta" : "Editar meta"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-5 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome da meta</Label>
              <Input
                id="name"
                placeholder="Ex: Viagem para Europa"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="totalValue">Valor total (R$)</Label>
                <Input
                  id="totalValue"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="15000.00"
                  className="font-mono tabular-nums"
                  {...register("totalValue")}
                />
                {errors.totalValue && (
                  <p className="text-sm text-red-600">{errors.totalValue.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="currentValue">Valor atual (R$)</Label>
                <Input
                  id="currentValue"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="font-mono tabular-nums"
                  {...register("currentValue")}
                />
                {errors.currentValue && (
                  <p className="text-sm text-red-600">{errors.currentValue.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="deadlineDate">Prazo</Label>
              <Input
                id="deadlineDate"
                type="date"
                {...register("deadlineDate")}
              />
              {errors.deadlineDate && (
                <p className="text-sm text-red-600">{errors.deadlineDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = category === cat.value
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

          <DialogFooter>
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
