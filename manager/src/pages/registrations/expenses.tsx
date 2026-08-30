import React, { useMemo, useState } from "react"
import { ColumnDef, ColumnFiltersState, SortingState } from "@tanstack/react-table"
import { Button } from "@/src/components/ui/button"
import { DataTable } from "@/src/components/ui/data-table"
import { ExpenseFormDialog } from "@/src/components/registrations/ExpenseFormDialog"
import {
  EMPTY_TRANSACTION_FILTERS,
  TransactionFilters,
  TransactionFilterValues,
} from "@/src/components/registrations/TransactionFilters"
import { useExpenses } from "@/src/hooks/use-transactions"
import { formatCurrency, formatDate } from "@/src/lib/utils"
import { CATEGORY_LABELS } from "@/src/lib/mockData"
import { Expense } from "@/src/types"
import { Plus } from "lucide-react"

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

function toColumnFilters(filters: TransactionFilterValues): ColumnFiltersState {
  const next: ColumnFiltersState = []
  if (filters.search) next.push({ id: "description", value: filters.search })
  if (filters.category) next.push({ id: "category", value: filters.category })
  if (filters.type) next.push({ id: "type", value: filters.type })
  if (filters.dateFrom || filters.dateTo) {
    next.push({ id: "date", value: [filters.dateFrom, filters.dateTo] })
  }
  if (filters.valueMin || filters.valueMax) {
    next.push({
      id: "value",
      value: [
        filters.valueMin ? Number(filters.valueMin) : undefined,
        filters.valueMax ? Number(filters.valueMax) : undefined,
      ],
    })
  }
  return next
}

export default function ExpensesPage() {
  const { data, isLoading } = useExpenses()
  const expenses = data?.expenses ?? []

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filters, setFilters] = useState<TransactionFilterValues>(
    EMPTY_TRANSACTION_FILTERS,
  )
  const [sorting, setSorting] = useState<SortingState>([])

  const columnFilters = useMemo(() => toColumnFilters(filters), [filters])

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1 text-balance">Despesas</h1>
            <p className="text-muted-foreground">Anote o gasto agora — seu futuro eu agradece.</p>
          </div>
          <Button
            variant="soft"
            className="shrink-0 sm:mt-1"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Nova despesa
          </Button>
        </div>

        <TransactionFilters
          variant="expense"
          value={filters}
          onChange={setFilters}
        />

        <DataTable
          columns={columns}
          data={expenses}
          columnFilters={columnFilters}
          onColumnFiltersChange={() => undefined}
          sorting={sorting}
          onSortingChange={setSorting}
          isLoading={isLoading}
        />
      </div>

      <ExpenseFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  )
}
