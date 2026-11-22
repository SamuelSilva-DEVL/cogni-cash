import { useState } from "react"
import { ListFilter, Search, X } from "lucide-react"
import { cn } from "@/src/lib/utils"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { CATEGORY_LABELS } from "@/src/lib/mockData"

const ALL_VALUE = "all"

export type TransactionFilterValues = {
  search: string
  category: string
  type: string
  recurrence: string
  dateFrom: string
  dateTo: string
  valueMin: string
  valueMax: string
}

export const EMPTY_TRANSACTION_FILTERS: TransactionFilterValues = {
  search: "",
  category: "",
  type: "",
  recurrence: "",
  dateFrom: "",
  dateTo: "",
  valueMin: "",
  valueMax: "",
}

type TransactionFiltersProps = {
  variant: "expense" | "receipt"
  value: TransactionFilterValues
  onChange: (next: TransactionFilterValues) => void
  className?: string
}

function countActiveFilters(
  variant: "expense" | "receipt",
  value: TransactionFilterValues,
) {
  let count = 0
  if (value.search.trim()) count += 1
  if (value.dateFrom || value.dateTo) count += 1
  if (value.valueMin || value.valueMax) count += 1
  if (variant === "expense") {
    if (value.category) count += 1
    if (value.type) count += 1
  } else if (value.recurrence) {
    count += 1
  }
  return count
}

export function TransactionFilters({
  variant,
  value,
  onChange,
  className,
}: TransactionFiltersProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)
  const activeFilters = countActiveFilters(variant, value)
  const searchPlaceholder =
    variant === "expense" ? "Buscar descrição…" : "Buscar origem…"

  const patchDraft = (partial: Partial<TransactionFilterValues>) => {
    setDraft((current) => ({ ...current, ...partial }))
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setDraft(value)
    setOpen(nextOpen)
  }

  const handleApply = () => {
    onChange(draft)
    setOpen(false)
  }

  const handleClearApplied = () => {
    onChange({ ...EMPTY_TRANSACTION_FILTERS })
    setDraft({ ...EMPTY_TRANSACTION_FILTERS })
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline">
            <ListFilter className="size-4" />
            Filtros
            {activeFilters > 0 && (
              <Badge className="ml-0.5">
                {activeFilters}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[360px] p-4"
          onInteractOutside={(event) => {
            const target = event.target as HTMLElement
            if (target.closest("[data-slot='select-content']")) {
              event.preventDefault()
            }
          }}
        >
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              handleApply()
            }}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="filter-search">
                {variant === "expense" ? "Descrição" : "Origem"}
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="filter-search"
                  type="search"
                  value={draft.search}
                  onChange={(e) => patchDraft({ search: e.target.value })}
                  placeholder={searchPlaceholder}
                  className="h-10 pl-9"
                />
              </div>
            </div>

            {variant === "expense" && (
              <>
                <div className="flex flex-col gap-2">
                  <Label>Tipo</Label>
                  <Select
                    value={draft.type || ALL_VALUE}
                    onValueChange={(type) =>
                      patchDraft({ type: type === ALL_VALUE ? "" : type })
                    }
                  >
                    <SelectTrigger className="h-10 w-full bg-white">
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>Todos os tipos</SelectItem>
                      <SelectItem value="fixo">Fixa</SelectItem>
                      <SelectItem value="variavel">Variável</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Categoria</Label>
                  <Select
                    value={draft.category || ALL_VALUE}
                    onValueChange={(category) =>
                      patchDraft({
                        category: category === ALL_VALUE ? "" : category,
                      })
                    }
                  >
                    <SelectTrigger className="h-10 w-full bg-white">
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>
                        Todas as categorias
                      </SelectItem>
                      {Object.entries(CATEGORY_LABELS).map(([id, label]) => (
                        <SelectItem key={id} value={id}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {variant === "receipt" && (
              <div className="flex flex-col gap-2">
                <Label>Recorrência</Label>
                <Select
                  value={draft.recurrence || ALL_VALUE}
                  onValueChange={(recurrence) =>
                    patchDraft({
                      recurrence: recurrence === ALL_VALUE ? "" : recurrence,
                    })
                  }
                >
                  <SelectTrigger className="h-10 w-full bg-white">
                    <SelectValue placeholder="Todas as recorrências" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>Todas as recorrências</SelectItem>
                    <SelectItem value="unico">Única</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="filter-date-from">Data inicial</Label>
                <Input
                  id="filter-date-from"
                  type="date"
                  value={draft.dateFrom}
                  onChange={(e) => patchDraft({ dateFrom: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="filter-date-to">Data final</Label>
                <Input
                  id="filter-date-to"
                  type="date"
                  value={draft.dateTo}
                  onChange={(e) => patchDraft({ dateTo: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="filter-value-min">Valor mín.</Label>
                <Input
                  id="filter-value-min"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={draft.valueMin}
                  onChange={(e) => patchDraft({ valueMin: e.target.value })}
                  className="font-mono tabular-nums"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="filter-value-max">Valor máx.</Label>
                <Input
                  id="filter-value-max"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={draft.valueMax}
                  onChange={(e) => patchDraft({ valueMax: e.target.value })}
                  className="font-mono tabular-nums"
                />
              </div>
            </div>

            <Button type="submit" variant="soft" className="w-full">
              Aplicar filtros
            </Button>
          </form>
        </PopoverContent>
      </Popover>

      {activeFilters > 0 && (
        <Button type="button" variant="ghost" size="sm" onClick={handleClearApplied}>
          <X className="size-3.5" />
          Limpar
        </Button>
      )}
    </div>
  )
}
