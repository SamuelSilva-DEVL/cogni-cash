import React, { useState, useMemo } from "react"
import { ColumnDef, ColumnFiltersState, SortingState } from "@tanstack/react-table"
import { Layout } from "@/src/components/Layout"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { DataTable } from "@/src/components/ui/data-table"
import { ExpenseFormDialog } from "@/src/components/registrations/ExpenseFormDialog"
import { useExpenses } from "@/src/hooks/use-transactions"
import { formatCurrency, formatDate } from "@/src/lib/utils"
import { CATEGORY_LABELS } from "@/src/lib/mockData"
import { Expense } from "@/src/types"
import { Plus, X } from "lucide-react"

const columns: ColumnDef<Expense>[] = [
  {
    accessorKey: "description",
    header: "Descrição",
    filterFn: "includesString",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "category",
    header: "Categoria",
    filterFn: "equals",
    cell: ({ getValue }) => CATEGORY_LABELS[getValue<string>()] ?? getValue<string>(),
  },
  {
    accessorKey: "type",
    header: "Tipo",
    filterFn: "equals",
    cell: ({ getValue }) => (getValue<string>() === "fixo" ? "Fixa" : "Variável"),
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
      <span className="font-mono tabular-nums text-red-600 font-semibold">
        {formatCurrency(getValue<number>())}
      </span>
    ),
  },
]

export default function ExpensesPage() {
  const { data, isLoading } = useExpenses()
  const expenses = data?.expenses ?? []

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])

  const [descFilter, setDescFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [valueMin, setValueMin] = useState("")
  const [valueMax, setValueMax] = useState("")

  const hasActiveFilters =
    descFilter || categoryFilter || typeFilter || dateFrom || dateTo || valueMin || valueMax

  function buildFilters(): ColumnFiltersState {
    const filters: ColumnFiltersState = []
    if (descFilter) filters.push({ id: "description", value: descFilter })
    if (categoryFilter) filters.push({ id: "category", value: categoryFilter })
    if (typeFilter) filters.push({ id: "type", value: typeFilter })
    if (dateFrom || dateTo) filters.push({ id: "date", value: [dateFrom, dateTo] })
    if (valueMin || valueMax)
      filters.push({ id: "value", value: [valueMin ? Number(valueMin) : undefined, valueMax ? Number(valueMax) : undefined] })
    return filters
  }

  useMemo(() => {
    setColumnFilters(buildFilters())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [descFilter, categoryFilter, typeFilter, dateFrom, dateTo, valueMin, valueMax])

  function clearFilters() {
    setDescFilter("")
    setCategoryFilter("")
    setTypeFilter("")
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
            <h1 className="text-3xl font-bold text-foreground mb-1 text-balance">Despesas</h1>
            <p className="text-muted-foreground">Anote o gasto agora — seu futuro eu agradece.</p>
          </div>
          <Button
            variant="soft"
            className="gap-2 shrink-0 sm:mt-1"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Nova despesa
          </Button>
        </div>

        {/* Filter bar */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Buscar descrição..."
              value={descFilter}
              onChange={(e) => setDescFilter(e.target.value)}
              className="h-9 w-48"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Todas as categorias</option>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Todos os tipos</option>
              <option value="fixo">Fixa</option>
              <option value="variavel">Variável</option>
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
          data={expenses}
          columnFilters={columnFilters}
          onColumnFiltersChange={setColumnFilters}
          sorting={sorting}
          onSortingChange={setSorting}
          isLoading={isLoading}
        />
      </div>

      <ExpenseFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </Layout>
  )
}
