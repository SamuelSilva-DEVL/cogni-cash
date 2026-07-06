import React, { useState } from "react"
import { Layout } from "@/src/components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Skeleton } from "@/src/components/ui/skeleton"
import { useReceipts, useCreateReceipt } from "@/src/hooks/use-transactions"
import { formatCurrency, formatDate } from "@/src/lib/utils"
import { Receipt } from "@/src/types"
import { TrendingUp, Check, AlertCircle } from "lucide-react"
import { isAxiosError } from "axios"

export default function ReceiptsPage() {
  const { data, isLoading } = useReceipts()
  const createReceipt = useCreateReceipt()
  const receipts = data?.receipts ?? []
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    value: "",
    origin: "",
    date: new Date().toISOString().split("T")[0],
    recurrence: "unico" as Receipt["recurrence"],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await createReceipt.mutateAsync({
        value: Number(formData.value),
        origin: formData.origin,
        date: formData.date,
        recurrence: formData.recurrence,
      })

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)

      setFormData({
        value: "",
        origin: "",
        date: new Date().toISOString().split("T")[0],
        recurrence: "unico",
      })
    } catch (err) {
      const message = isAxiosError(err)
        ? (err.response?.data?.message as string | undefined) ??
          "Não foi possível registrar a receita."
        : "Não foi possível registrar a receita."
      setError(message)
    }
  }

  const recentReceipts = receipts.slice(0, 5)

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">
            Registrar receita
          </h1>
          <p className="text-slate-700">
            Registre entradas para manter o quadro completo.
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
                Receita registrada
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
                <TrendingUp className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                Nova receita
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
                    placeholder="5500.00"
                    className="font-mono tabular-nums"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="origin">Origem</Label>
                  <Input
                    id="origin"
                    value={formData.origin}
                    onChange={(e) =>
                      setFormData({ ...formData, origin: e.target.value })
                    }
                    placeholder="Ex: Salário, freelance"
                    required
                  />
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
                  <Label htmlFor="recurrence">Recorrência</Label>
                  <select
                    id="recurrence"
                    value={formData.recurrence}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recurrence: e.target.value as Receipt["recurrence"],
                      })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  >
                    <option value="unico">Única</option>
                    <option value="mensal">Mensal</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createReceipt.isPending}
                >
                  {createReceipt.isPending ? "Registrando..." : "Registrar receita"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Receitas recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))
                ) : recentReceipts.length > 0 ? (
                  recentReceipts.map((receipt) => (
                    <div
                      key={receipt.id}
                      className="p-4 rounded-lg border bg-emerald-50/50"
                    >
                      <div className="flex items-start justify-between mb-2 gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {receipt.origin}
                          </p>
                          <p className="text-xs text-slate-700 mt-1">
                            {receipt.recurrence === "mensal"
                              ? "Mensal"
                              : "Única"}
                          </p>
                        </div>
                        <p className="font-bold text-emerald-700 tabular-nums font-mono shrink-0">
                          {formatCurrency(receipt.value)}
                        </p>
                      </div>
                      <p className="text-xs text-slate-600">
                        {formatDate(receipt.date)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-700">
                    <p className="font-medium mb-1">Nenhuma receita ainda</p>
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
