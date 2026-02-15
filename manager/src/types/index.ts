export interface Goal {
  id: string
  name: string
  totalValue: number
  currentValue: number
  deadlineDate: string
  category: 'casa' | 'viagem' | 'educacao' | 'investimento' | 'outros'
  icon: string
  active: boolean
  createdAt: string
}

export interface Expense {
  id: string
  value: number
  category: 'alimentacao' | 'transporte' | 'moradia' | 'saude' | 'educacao' | 'lazer' | 'outros'
  type: 'fixo' | 'variavel'
  date: string
  description: string
}

export interface Receipt {
  id: string
  value: number
  origin: string
  date: string
  recurrence: 'unico' | 'mensal'
}

export interface FinancialHealth {
  score: number
  status: 'excelente' | 'bom' | 'atencao' | 'critico'
  factors: {
    expenseRatio: number
    savingsRate: number
    goalsOnTrack: number
  }
}

export interface CategoryExpense {
  category: string
  value: number
  percentage: number
}
