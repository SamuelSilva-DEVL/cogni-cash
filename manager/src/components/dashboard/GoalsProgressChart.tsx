import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { useFinance } from "@/src/contexts/FinanceContext"
import { calculatePercentage } from "@/src/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

export const GoalsProgressChart = () => {
  const { goals } = useFinance()

  const chartData = goals
    .filter((g) => g.active)
    .map((goal) => ({
      name:
        goal.name.length > 15 ? goal.name.substring(0, 15) + "..." : goal.name,
      progress: calculatePercentage(goal.currentValue, goal.totalValue),
      icon: goal.icon,
    }))
    .slice(0, 5)

  const getBarColor = (progress: number) => {
    if (progress >= 80) return "#10b981"
    if (progress >= 50) return "#3b82f6"
    if (progress >= 30) return "#f59e0b"
    return "#ef4444"
  }

  return (
    <Card className="animate-fade-in animate-delay-300">
      <CardHeader>
        <CardTitle className="text-lg">Progresso das Metas</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#64748b"
              label={{
                value: "Progresso (%)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number) => [`${value}%`, "Progresso"]}
            />
            <Bar dataKey="progress" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(entry.progress)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
