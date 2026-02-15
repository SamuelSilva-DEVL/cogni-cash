import React, { useState } from 'react'
import { Layout } from '@/src/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { useFinance } from '@/src/contexts/FinanceContext'
import { formatCurrency, formatDate } from '@/src/lib/utils'
import { TrendingUp, Check } from 'lucide-react'

export default function ReceiptsPage() {
  const { addReceipt, receipts } = useFinance()
  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState({
    value: '',
    origin: '',
    date: new Date().toISOString().split('T')[0],
    recurrence: 'unico',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    addReceipt({
      value: Number(formData.value),
      origin: formData.origin,
      date: formData.date,
      recurrence: formData.recurrence as any,
    })

    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)

    setFormData({
      value: '',
      origin: '',
      date: new Date().toISOString().split('T')[0],
      recurrence: 'unico',
    })
  }

  const recentReceipts = receipts.slice(-5).reverse()

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Registrar Receita</h1>
          <p className="text-slate-600">
            Adicione suas fontes de renda para acompanhamento completo
          </p>
        </div>

        {showSuccess && (
          <div className="p-4 rounded-lg bg-emerald-50 border-2 border-emerald-200 flex items-center gap-3 animate-fade-in">
            <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-emerald-900">Receita registrada com sucesso!</p>
              <p className="text-sm text-emerald-700">A receita foi adicionada ao seu histórico.</p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Nova Receita
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
                    placeholder="5500.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="origin">Origem</Label>
                  <Input
                    id="origin"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    placeholder="Ex: Salário, Freelance, Investimento"
                    required
                  />
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
                  <Label htmlFor="recurrence">Recorrência</Label>
                  <select
                    id="recurrence"
                    value={formData.recurrence}
                    onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  >
                    <option value="unico">Única</option>
                    <option value="mensal">Mensal</option>
                  </select>
                </div>

                <Button type="submit" className="w-full">
                  Registrar Receita
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Receitas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentReceipts.length > 0 ? (
                  recentReceipts.map((receipt) => (
                    <div
                      key={receipt.id}
                      className="p-4 rounded-lg border bg-emerald-50 hover:bg-emerald-100 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-slate-900">{receipt.origin}</p>
                          <p className="text-xs text-slate-600 mt-1">
                            {receipt.recurrence === 'mensal' ? '🔄 Mensal' : '📅 Única'}
                          </p>
                        </div>
                        <p className="font-bold text-emerald-600">{formatCurrency(receipt.value)}</p>
                      </div>
                      <p className="text-xs text-slate-500">{formatDate(receipt.date)}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <p>Nenhuma receita registrada ainda</p>
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
