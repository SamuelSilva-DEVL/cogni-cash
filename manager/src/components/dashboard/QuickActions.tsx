import Link from "next/link"
import { TrendingDown, TrendingUp, Gauge } from "lucide-react"
import { Button } from "@/src/components/ui/button"

export const QuickActions = () => {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button asChild className="h-10">
        <Link href="/registrations/expenses">
          <TrendingDown className="mr-2 h-4 w-4" />
          Registrar despesa
        </Link>
      </Button>
      <Button asChild variant="outline" className="h-10">
        <Link href="/registrations/receipts">
          <TrendingUp className="mr-2 h-4 w-4" />
          Registrar receita
        </Link>
      </Button>
      <Button asChild variant="outline" className="h-10">
        <Link href="/registrations/budgets">
          <Gauge className="mr-2 h-4 w-4" />
          Limites por categoria
        </Link>
      </Button>
    </div>
  )
}
