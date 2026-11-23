import { Goal } from "@/src/types"
import { useDeleteGoal } from "@/src/hooks/use-goals"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"
import { Button } from "@/src/components/ui/button"

interface GoalDeleteDialogProps {
  goal?: Goal
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}

export const GoalDeleteDialog = ({
  goal,
  open,
  onOpenChange,
  onDeleted,
}: GoalDeleteDialogProps) => {
  const deleteGoal = useDeleteGoal()

  const handleConfirm = async () => {
    if (!goal) return

    try {
      await deleteGoal.mutateAsync(goal.id)
      toast.success("Meta excluída com sucesso!")
      onOpenChange(false)
      onDeleted?.()
    } catch {
      toast.error("Não foi possível excluir a meta.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir meta</DialogTitle>
          <DialogDescription>
            Deseja excluir a meta <strong>{goal?.name}</strong>? Esta ação não
            pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="cancel" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleteGoal.isPending}
          >
            {deleteGoal.isPending ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
