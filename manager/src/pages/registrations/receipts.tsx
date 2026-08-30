import React, { useMemo, useState } from "react"
import { ColumnDef, ColumnFiltersState, SortingState } from "@tanstack/react-table"
import { Button } from "@/src/components/ui/button"
import { DataTable } from "@/src/components/ui/data-table"
import { ReceiptFormDialog } from "@/src/components/registrations/ReceiptFormDialog"
import {
  EMPTY_TRANSACTION_FILTERS,
  TransactionFilters,
  TransactionFilterValues,
} from "@/src/components/registrations/TransactionFilters"
import { useReceipts } from "@/src/hooks/use-transactions"
import { formatCurrency, formatDate } from "@/src/lib/utils"
import { Receipt } from "@/src/types"
import { Plus } from "lucide-react"

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

function toColumnFilters(filters: TransactionFilterValues): ColumnFiltersState {
  const next: ColumnFiltersState = []
  if (filters.search) next.push({ id: "origin", value: filters.search })
  if (filters.recurrence) next.push({ id: "recurrence", value: filters.recurrence })
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

export default function ReceiptsPage() {
  const { data, isLoading } = useReceipts()
  const receipts = data?.receipts ?? []

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
            <h1 className="text-3xl font-bold text-foreground mb-1 text-balance">Receitas</h1>
            <p className="text-muted-foreground">Registre entradas para manter o quadro completo.</p>
          </div>
          <Button
            variant="soft"
            className="shrink-0 sm:mt-1"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Nova receita
          </Button>
        </div>

        <TransactionFilters
          variant="receipt"
          value={filters}
          onChange={setFilters}
        />

        <DataTable
          columns={columns}
          data={receipts}
          columnFilters={columnFilters}
          onColumnFiltersChange={() => undefined}
          sorting={sorting}
          onSortingChange={setSorting}
          isLoading={isLoading}
        />
      </div>

      <ReceiptFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  )
}
