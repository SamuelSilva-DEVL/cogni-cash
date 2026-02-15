import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { useFinance } from '@/src/contexts/FinanceContext'
import { Goal } from '@/src/types'

interface GoalFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal?: Goal
  mode: 'create' | 'edit'
}

const CATEGORY_OPTIONS = [
  { value: 'casa', label: 'Casa', icon: '🏠' },
  { value: 'viagem', label: 'Viagem', icon: '✈️' },
  { value: 'educacao', label: 'Educação', icon: '🎓' },
  { value: 'investimento', label: 'Investimento', icon: '💰' },
  { value: 'outros', label: 'Outros', icon: '🎯' },
]

export const GoalFormDialog = ({ open, onOpenChange, goal, mode }: GoalFormDialogProps) => {
  const { addGoal, updateGoal } = useFinance()
  const [formData, setFormData] = useState({
    name: goal?.name || '',
    totalValue: goal?.totalValue || '',
    currentValue: goal?.currentValue || '',
    deadlineDate: goal?.deadlineDate || '',
    category: goal?.category || 'outros',
    icon: goal?.icon || '🎯',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const goalData = {
      name: formData.name,
      totalValue: Number(formData.totalValue),
      currentValue: Number(formData.currentValue),
      deadlineDate: formData.deadlineDate,
      category: formData.category as any,
      icon: formData.icon,
      active: true,
    }

    if (mode === 'create') {
      addGoal(goalData)
    } else if (goal) {
      updateGoal(goal.id, goalData)
    }

    onOpenChange(false)
    setFormData({
      name: '',
      totalValue: '',
      currentValue: '',
      deadlineDate: '',
      category: 'outros',
      icon: '🎯',
    })
  }

  const handleCategoryChange = (category: string) => {
    const selectedCategory = CATEGORY_OPTIONS.find(c => c.value === category)
    setFormData({
      ...formData,
      category,
      icon: selectedCategory?.icon || '🎯',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Criar Nova Meta' : 'Editar Meta'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Meta</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Viagem para Europa"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalValue">Valor Total</Label>
              <Input
                id="totalValue"
                type="number"
                step="0.01"
                value={formData.totalValue}
                onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
                placeholder="15000.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentValue">Valor Atual</Label>
              <Input
                id="currentValue"
                type="number"
                step="0.01"
                value={formData.currentValue}
                onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                placeholder="5000.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadlineDate">Data Limite</Label>
            <Input
              id="deadlineDate"
              type="date"
              value={formData.deadlineDate}
              onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
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
                  className={`p-3 rounded-lg border-2 transition-all hover:border-primary ${
                    formData.category === cat.value
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <div className="text-xs font-medium">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Criar Meta' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
