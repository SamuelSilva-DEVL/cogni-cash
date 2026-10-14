import React, { useState, useMemo } from "react"
import { ColumnDef, ColumnFiltersState, SortingState } from "@tanstack/react-table"
import { Layout } from "@/src/components/Layout"
import { PageHeader } from "@/src/components/PageHeader"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { FieldSelect } from "@/src/components/ui/field-select"
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
      <span className="font-mono font-semibold tabular-nums text-brand">
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
        <PageHeader
          title="Receitas"
          description="Registre entradas para manter o quadro completo."
        >
          <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova receita
          </Button>
        </PageHeader>

        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="flex flex-col gap-3 border-b bg-muted/40 p-4">
            <div className="flex flex-wrap gap-3">
              <Input
                placeholder="Buscar origem"
                value={originFilter}
                onChange={(e) => setOriginFilter(e.target.value)}
                className="h-10 w-full sm:w-52"
                aria-label="Buscar por origem"
              />
              <FieldSelect
                value={recurrenceFilter}
                onChange={(e) => setRecurrenceFilter(e.target.value)}
                className="h-10 w-full sm:w-48"
                aria-label="Filtrar por recorrência"
              >
                <option value="">Todas as recorrências</option>
                <option value="unico">Única</option>
                <option value="mensal">Mensal</option>
              </FieldSelect>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-10 w-full sm:w-40"
                aria-label="Data inicial"
              />
              <span className="text-sm text-muted-foreground">até</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-10 w-full sm:w-40"
                aria-label="Data final"
              />
              <Input
                type="number"
                placeholder="Valor mín."
                value={valueMin}
                onChange={(e) => setValueMin(e.target.value)}
                className="h-10 w-full font-mono tabular-nums sm:w-32"
                aria-label="Valor mínimo"
              />
              <Input
                type="number"
                placeholder="Valor máx."
                value={valueMax}
                onChange={(e) => setValueMax(e.target.value)}
                className="h-10 w-full font-mono tabular-nums sm:w-32"
                aria-label="Valor máximo"
              />
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-10 gap-1.5 text-muted-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                  Limpar filtros
                </Button>
              )}
            </div>
          </div>

          <DataTable
            columns={columns}
            data={receipts}
            columnFilters={columnFilters}
            onColumnFiltersChange={setColumnFilters}
            sorting={sorting}
            onSortingChange={setSorting}
            isLoading={isLoading}
            className="rounded-none border-0"
            emptyLabel="Nenhuma receita com esses filtros."
          />
        </div>
      </div>

      <ReceiptFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </Layout>
  )
}
