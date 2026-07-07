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
import { useCreateReceipt } from "@/src/hooks/use-transactions"
import { Receipt } from "@/src/types"

interface ReceiptFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const INITIAL = {
  value: "",
  origin: "",
  date: new Date().toISOString().split("T")[0],
  recurrence: "unico" as Receipt["recurrence"],
}

export function ReceiptFormDialog({ open, onOpenChange }: ReceiptFormDialogProps) {
  const createReceipt = useCreateReceipt()
  const [formData, setFormData] = useState(INITIAL)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createReceipt.mutateAsync({
        value: Number(formData.value),
        origin: formData.origin,
        date: formData.date,
        recurrence: formData.recurrence,
      })
      toast.success("Receita registrada", { description: "Já está no seu histórico." })
      setFormData(INITIAL)
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

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="rec-value">Valor (R$)</Label>
                <Input
                  id="rec-value"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="5.500,00"
                  className="font-mono tabular-nums"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rec-date">Data</Label>
                <Input
                  id="rec-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rec-origin">Origem</Label>
              <Input
                id="rec-origin"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                placeholder="Ex: Salário, freelance"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rec-recurrence">Recorrência</Label>
              <select
                id="rec-recurrence"
                value={formData.recurrence}
                onChange={(e) =>
                  setFormData({ ...formData, recurrence: e.target.value as Receipt["recurrence"] })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="unico">Única</option>
                <option value="mensal">Mensal</option>
              </select>
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
