import React, { useState, useMemo } from "react"
import { ColumnDef, ColumnFiltersState, SortingState } from "@tanstack/react-table"
import { Layout } from "@/src/components/Layout"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { DataTable } from "@/src/components/ui/data-table"
import { ReceiptFormDialog } from "@/src/components/registrations/ReceiptFormDialog"
import { useReceipts } from "@/src/hooks/use-transactions"
import { formatCurrency, formatDate } from "@/src/lib/utils"
import { Receipt } from "@/src/types"
import { Plus, X } from "lucide-react"

const columns: ColumnDef<Receipt>[] = [
  {
    accessorKey: "origin",
    header: "Origem",
    filterFn: "includesString",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "recurrence",
    header: "Recorrência",
    filterFn: "equals",
    cell: ({ getValue }) => (getValue<string>() === "mensal" ? "Mensal" : "Única"),
  },
  {
    accessorKey: "date",
    header: "Data",
    filterFn: "dateRange" as never,
    enableSorting: true,
    cell: ({ getValue }) => formatDate(getValue<string>()),
  },
  {
    accessorKey: "value",
    header: "Valor",
    filterFn: "inNumberRange",
    enableSorting: true,
    cell: ({ getValue }) => (
      <span className="font-mono tabular-nums text-emerald-700 font-semibold">
        {formatCurrency(getValue<number>())}
      </span>
    ),
  },
]

export default function ReceiptsPage() {
  const { data, isLoading } = useReceipts()
  const receipts = data?.receipts ?? []

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])

  const [originFilter, setOriginFilter] = useState("")
  const [recurrenceFilter, setRecurrenceFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [valueMin, setValueMin] = useState("")
  const [valueMax, setValueMax] = useState("")

  const hasActiveFilters =
    originFilter || recurrenceFilter || dateFrom || dateTo || valueMin || valueMax

  function buildFilters(): ColumnFiltersState {
    const filters: ColumnFiltersState = []
    if (originFilter) filters.push({ id: "origin", value: originFilter })
    if (recurrenceFilter) filters.push({ id: "recurrence", value: recurrenceFilter })
    if (dateFrom || dateTo) filters.push({ id: "date", value: [dateFrom, dateTo] })
    if (valueMin || valueMax)
      filters.push({ id: "value", value: [valueMin ? Number(valueMin) : undefined, valueMax ? Number(valueMax) : undefined] })
    return filters
  }

  useMemo(() => {
    setColumnFilters(buildFilters())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originFilter, recurrenceFilter, dateFrom, dateTo, valueMin, valueMax])

  function clearFilters() {
    setOriginFilter("")
    setRecurrenceFilter("")
    setDateFrom("")
    setDateTo("")
    setValueMin("")
    setValueMax("")
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1 text-balance">Receitas</h1>
            <p className="text-muted-foreground">Registre entradas para manter o quadro completo.</p>
          </div>
          <Button
            variant="soft"
            className="gap-2 shrink-0 sm:mt-1"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Nova receita
          </Button>
        </div>

        {/* Filter bar */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Buscar origem..."
              value={originFilter}
              onChange={(e) => setOriginFilter(e.target.value)}
              className="h-9 w-48"
            />
            <select
              value={recurrenceFilter}
              onChange={(e) => setRecurrenceFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Todas as recorrências</option>
              <option value="unico">Única</option>
              <option value="mensal">Mensal</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 w-40"
              title="Data inicial"
            />
            <span className="text-muted-foreground text-sm">até</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 w-40"
              title="Data final"
            />
            <Input
              type="number"
              placeholder="Valor mín."
              value={valueMin}
              onChange={(e) => setValueMin(e.target.value)}
              className="h-9 w-32 font-mono tabular-nums"
            />
            <Input
              type="number"
              placeholder="Valor máx."
              value={valueMax}
              onChange={(e) => setValueMax(e.target.value)}
              className="h-9 w-32 font-mono tabular-nums"
            />
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-9 gap-1.5 text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" />
                Limpar filtros
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={receipts}
          columnFilters={columnFilters}
          onColumnFiltersChange={setColumnFilters}
          sorting={sorting}
          onSortingChange={setSorting}
          isLoading={isLoading}
        />
      </div>

      <ReceiptFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </Layout>
  )
}
