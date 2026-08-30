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
import { useCreateReceipt } from "@/src/hooks/use-transactions"
import { Receipt } from "@/src/types"

interface ReceiptFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const receiptSchema = z.object({
  value: z.string().min(1, "Campo obrigatório").refine(
    (v) => !Number.isNaN(Number(v)) && Number(v) > 0,
    "Informe um valor válido maior que zero",
  ),
  origin: z.string().min(1, "Campo obrigatório"),
  date: z.string().min(1, "Campo obrigatório"),
  recurrence: z.enum(["unico", "mensal"]),
})

type ReceiptSchema = z.infer<typeof receiptSchema>

const DEFAULT_VALUES: ReceiptSchema = {
  value: "",
  origin: "",
  date: new Date().toISOString().split("T")[0],
  recurrence: "unico",
}

export function ReceiptFormDialog({ open, onOpenChange }: ReceiptFormDialogProps) {
  const createReceipt = useCreateReceipt()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReceiptSchema>({
    resolver: zodResolver(receiptSchema),
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

  const onSubmit = async (data: ReceiptSchema) => {
    try {
      await createReceipt.mutateAsync({
        value: Number(data.value),
        origin: data.origin,
        date: data.date,
        recurrence: data.recurrence as Receipt["recurrence"],
      })
      toast.success("Receita registrada", { description: "Já está no seu histórico." })
      reset({
        ...DEFAULT_VALUES,
        date: new Date().toISOString().split("T")[0],
      })
      onOpenChange(false)
    } catch (err) {
      toast.error(
        isAxiosError(err)
          ? ((err.response?.data?.message as string | undefined) ?? "Não foi possível registrar a receita.")
          : "Não foi possível registrar a receita.",
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Nova receita</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="rec-value">Valor (R$)</Label>
                <Input
                  id="rec-value"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="5.500,00"
                  className="font-mono tabular-nums"
                  {...register("value")}
                />
                {errors.value && (
                  <p className="text-sm text-red-600">{errors.value.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rec-date">Data</Label>
                <Input
                  id="rec-date"
                  type="date"
                  {...register("date")}
                />
                {errors.date && (
                  <p className="text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rec-origin">Origem</Label>
              <Input
                id="rec-origin"
                placeholder="Ex: Salário, freelance"
                {...register("origin")}
              />
              {errors.origin && (
                <p className="text-sm text-red-600">{errors.origin.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rec-recurrence">Recorrência</Label>
              <select
                id="rec-recurrence"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("recurrence")}
              >
                <option value="unico">Única</option>
                <option value="mensal">Mensal</option>
              </select>
              {errors.recurrence && (
                <p className="text-sm text-red-600">{errors.recurrence.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="cancel" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="soft" disabled={createReceipt.isPending} className="min-w-[120px]">
              {createReceipt.isPending ? "Registrando..." : "Registrar receita"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
