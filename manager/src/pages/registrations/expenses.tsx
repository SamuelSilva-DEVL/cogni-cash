import React, { useState } from "react"
import { Layout } from "@/src/components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Skeleton } from "@/src/components/ui/skeleton"
import { useExpenses, useCreateExpense } from "@/src/hooks/use-transactions"
import { formatCurrency, formatDate } from "@/src/lib/utils"
import { CATEGORY_LABELS } from "@/src/lib/mockData"
import { Expense } from "@/src/types"
import { TrendingDown, Check, AlertCircle } from "lucide-react"
import { isAxiosError } from "axios"

export default function ExpensesPage() {
  const { data, isLoading } = useExpenses()
  const createExpense = useCreateExpense()
  const expenses = data?.expenses ?? []
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    value: "",
    category: "alimentacao" as Expense["category"],
    type: "variavel" as Expense["type"],
    date: new Date().toISOString().split("T")[0],
    description: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await createExpense.mutateAsync({
        value: Number(formData.value),
        category: formData.category,
        type: formData.type,
        date: formData.date,
        description: formData.description,
      })

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)

      setFormData({
        value: "",
        category: "alimentacao",
        type: "variavel",
        date: new Date().toISOString().split("T")[0],
        description: "",
      })
    } catch (err) {
      const message = isAxiosError(err)
        ? (err.response?.data?.message as string | undefined) ??
          "Não foi possível registrar a despesa."
        : "Não foi possível registrar a despesa."
      setError(message)
    }
  }

  const recentExpenses = expenses.slice(0, 5)

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">
            Registrar despesa
          </h1>
          <p className="text-slate-700">
            Anote o gasto agora — seu futuro eu agradece.
          </p>
        </div>

        {showSuccess && (
          <div
            role="status"
            className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-3"
          >
            <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
              <Check className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-emerald-900">
                Despesa registrada
              </p>
              <p className="text-sm text-emerald-800">
                Já está no seu histórico.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 text-red-800"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" aria-hidden="true" />
                Nova despesa
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
                    min="0"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    placeholder="150.00"
                    className="font-mono tabular-nums"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as Expense["category"],
                      })
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

                <div className="space-y-2">
                  <Label>Tipo de despesa</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="fixo"
                        checked={formData.type === "fixo"}
                        onChange={() =>
                          setFormData({ ...formData, type: "fixo" })
                        }
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Fixa</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="variavel"
                        checked={formData.type === "variavel"}
                        onChange={() =>
                          setFormData({ ...formData, type: "variavel" })
                        }
                        className="h-4 w-4"
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
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Ex: Supermercado do mês"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createExpense.isPending}
                >
                  {createExpense.isPending ? "Registrando..." : "Registrar despesa"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Despesas recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))
                ) : recentExpenses.length > 0 ? (
                  recentExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="p-4 rounded-lg border bg-slate-50"
                    >
                      <div className="flex items-start justify-between mb-2 gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {expense.description}
                          </p>
                          <p className="text-xs text-slate-700 mt-1">
                            {CATEGORY_LABELS[expense.category]} •{" "}
                            {expense.type === "fixo" ? "Fixa" : "Variável"}
                          </p>
                        </div>
                        <p className="font-bold text-red-600 tabular-nums font-mono shrink-0">
                          {formatCurrency(expense.value)}
                        </p>
                      </div>
                      <p className="text-xs text-slate-600">
                        {formatDate(expense.date)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-700">
                    <p className="font-medium mb-1">Nenhuma despesa ainda</p>
                    <p className="text-sm">
                      Use o formulário ao lado para registrar a primeira.
                    </p>
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
