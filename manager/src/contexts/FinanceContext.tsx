import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Goal, Expense, Receipt, FinancialHealth, CategoryExpense } from '@/src/types'
import { mockGoals, mockExpenses, mockReceipts } from '@/src/lib/mockData'
import { calculatePercentage, getDaysRemaining } from '@/src/lib/utils'

interface FinanceContextType {
  goals: Goal[]
  expenses: Expense[]
  receipts: Receipt[]
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void
  updateGoal: (id: string, goal: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  addExpense: (expense: Omit<Expense, 'id'>) => void
  addReceipt: (receipt: Omit<Receipt, 'id'>) => void
  getGoalById: (id: string) => Goal | undefined
  getCategoryExpenses: () => CategoryExpense[]
  getTotalExpenses: () => { fixed: number; variable: number; total: number }
  getTotalReceipts: () => number
  getFinancialHealth: () => FinancialHealth
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const [goals, setGoals] = useState<Goal[]>(mockGoals)
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses)
  const [receipts, setReceipts] = useState<Receipt[]>(mockReceipts)

  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setGoals([...goals, newGoal])
  }

  const updateGoal = (id: string, updatedGoal: Partial<Goal>) => {
    setGoals(goals.map(goal => (goal.id === id ? { ...goal, ...updatedGoal } : goal)))
  }

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id))
  }

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
    }
    setExpenses([...expenses, newExpense])
  }

  const addReceipt = (receipt: Omit<Receipt, 'id'>) => {
    const newReceipt: Receipt = {
      ...receipt,
      id: Date.now().toString(),
    }
    setReceipts([...receipts, newReceipt])
  }

  const getGoalById = (id: string) => {
    return goals.find(goal => goal.id === id)
  }

  const getCategoryExpenses = (): CategoryExpense[] => {
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.value
      return acc
    }, {} as Record<string, number>)

    const total = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0)

    return Object.entries(categoryTotals).map(([category, value]) => ({
      category,
      value,
      percentage: calculatePercentage(value, total),
    }))
  }

  const getTotalExpenses = () => {
    const fixed = expenses
      .filter(e => e.type === 'fixo')
      .reduce((sum, e) => sum + e.value, 0)
    const variable = expenses
      .filter(e => e.type === 'variavel')
      .reduce((sum, e) => sum + e.value, 0)
    return { fixed, variable, total: fixed + variable }
  }

  const getTotalReceipts = () => {
    return receipts.reduce((sum, receipt) => sum + receipt.value, 0)
  }

  const getFinancialHealth = (): FinancialHealth => {
    const totalExpenses = getTotalExpenses().total
    const totalReceipts = getTotalReceipts()
    const expenseRatio = totalReceipts > 0 ? (totalExpenses / totalReceipts) * 100 : 0
    
    const totalSavings = goals.reduce((sum, goal) => sum + goal.currentValue, 0)
    const savingsRate = totalReceipts > 0 ? (totalSavings / totalReceipts) * 100 : 0

    const goalsOnTrack = goals.filter(goal => {
      const progress = calculatePercentage(goal.currentValue, goal.totalValue)
      const daysRemaining = getDaysRemaining(goal.deadlineDate)
      const totalDays = getDaysRemaining(goal.deadlineDate) + 365
      const expectedProgress = calculatePercentage(365, totalDays)
      return progress >= expectedProgress * 0.8
    }).length

    const goalsOnTrackPercentage = goals.length > 0 ? (goalsOnTrack / goals.length) * 100 : 0

    let score = 0
    score += (100 - expenseRatio) * 0.4
    score += savingsRate * 0.3
    score += goalsOnTrackPercentage * 0.3

    let status: FinancialHealth['status'] = 'critico'
    if (score >= 80) status = 'excelente'
    else if (score >= 60) status = 'bom'
    else if (score >= 40) status = 'atencao'

    return {
      score: Math.round(score),
      status,
      factors: {
        expenseRatio,
        savingsRate,
        goalsOnTrack: goalsOnTrackPercentage,
      },
    }
  }

  return (
    <FinanceContext.Provider
      value={{
        goals,
        expenses,
        receipts,
        addGoal,
        updateGoal,
        deleteGoal,
        addExpense,
        addReceipt,
        getGoalById,
        getCategoryExpenses,
        getTotalExpenses,
        getTotalReceipts,
        getFinancialHealth,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export const useFinance = () => {
  const context = useContext(FinanceContext)
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider')
  }
  return context
}
