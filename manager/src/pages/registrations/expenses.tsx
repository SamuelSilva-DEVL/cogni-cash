import React, { useState } from 'react'
import { Layout } from '@/src/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { useFinance } from '@/src/contexts/FinanceContext'
import { formatCurrency, formatDate } from '@/src/lib/utils'
import { CATEGORY_LABELS } from '@/src/lib/mockData'
import { TrendingDown, Check } from 'lucide-react'

export default function ExpensesPage() {
  const { addExpense, expenses } = useFinance()
  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState({
    value: '',
    category: 'alimentacao',
    type: 'variavel',
    date: new Date().toISOString().split('T')[0],
    description: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    addExpense({
      value: Number(formData.value),
      category: formData.category as any,
      type: formData.type as any,
      date: formData.date,
      description: formData.description,
    })

    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)

    setFormData({
      value: '',
      category: 'alimentacao',
      type: 'variavel',
      date: new Date().toISOString().split('T')[0],
      description: '',
    })
  }

  const recentExpenses = expenses.slice(-5).reverse()

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Registrar Despesa</h1>
          <p className="text-slate-600">
            Adicione suas despesas para melhor controle financeiro
          </p>
        </div>

        {showSuccess && (
          <div className="p-4 rounded-lg bg-emerald-50 border-2 border-emerald-200 flex items-center gap-3 animate-fade-in">
            <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-emerald-900">Despesa registrada com sucesso!</p>
              <p className="text-sm text-emerald-700">A despesa foi adicionada ao seu histórico.</p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Nova Despesa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Valor (R$)</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="150.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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

                <div className="space-y-2">
                  <Label>Tipo de Despesa</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="fixo"
                        checked={formData.type === 'fixo'}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="h-4 w-4 text-primary"
                      />
                      <span className="text-sm">Fixa</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="variavel"
                        checked={formData.type === 'variavel'}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="h-4 w-4 text-primary"
                      />
                      <span className="text-sm">Variável</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Supermercado do mês"
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Registrar Despesa
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Despesas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentExpenses.length > 0 ? (
                  recentExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="p-4 rounded-lg border bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-slate-900">{expense.description}</p>
                          <p className="text-xs text-slate-600 mt-1">
                            {CATEGORY_LABELS[expense.category]} • {expense.type === 'fixo' ? 'Fixa' : 'Variável'}
                          </p>
                        </div>
                        <p className="font-bold text-red-600">{formatCurrency(expense.value)}</p>
                      </div>
                      <p className="text-xs text-slate-500">{formatDate(expense.date)}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <p>Nenhuma despesa registrada ainda</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
