import React from 'react'
import Link from 'next/link'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { Target, TrendingUp, PieChart, Sparkles } from 'lucide-react'

export const WelcomeBanner = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary via-teal-500 to-emerald-500 rounded-2xl p-8 md:p-12 text-white shadow-2xl">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-8 w-8" />
          <h2 className="text-3xl md:text-4xl font-bold">
            Bem-vindo ao Cogni Cash!
          </h2>
        </div>
        
        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
          Sua jornada rumo à saúde financeira começa aqui. 
          Organize suas finanças, alcance suas metas e construa o futuro que você deseja.
        </p>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <Target className="h-8 w-8 mb-2" />
            <h3 className="font-semibold mb-1">Defina Metas</h3>
            <p className="text-sm text-white/80">
              Crie e acompanhe objetivos financeiros
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <TrendingUp className="h-8 w-8 mb-2" />
            <h3 className="font-semibold mb-1">Monitore Gastos</h3>
            <p className="text-sm text-white/80">
              Registre despesas e receitas facilmente
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <PieChart className="h-8 w-8 mb-2" />
            <h3 className="font-semibold mb-1">Analise Dados</h3>
            <p className="text-sm text-white/80">
              Visualize sua saúde financeira em tempo real
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link href="/goals">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Começar Agora
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Explorar Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
