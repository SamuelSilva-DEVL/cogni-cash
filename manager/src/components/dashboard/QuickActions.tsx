import Link from 'next/link'
import { TrendingDown, TrendingUp, Gauge } from 'lucide-react'
import { Button } from '@/src/components/ui/button'

export const QuickActions = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button asChild className="flex-1 h-11">
        <Link href="/registrations/expenses">
          <TrendingDown className="h-4 w-4 mr-2" />
          Registrar despesa
        </Link>
      </Button>
      <Button asChild variant="outline" className="flex-1 h-11">
        <Link href="/registrations/receipts">
          <TrendingUp className="h-4 w-4 mr-2" />
          Registrar receita
        </Link>
      </Button>
      <Button asChild variant="outline" className="flex-1 h-11">
        <Link href="/registrations/budgets">
          <Gauge className="h-4 w-4 mr-2" />
          Limites por categoria
        </Link>
      </Button>
    </div>
  )
}
