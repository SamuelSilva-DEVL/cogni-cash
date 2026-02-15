# Cogni Cash - Gestão Inteligente de Finanças Pessoais

Uma aplicação web moderna e completa para gerenciamento de finanças pessoais, desenvolvida com Next.js 14, TypeScript e Tailwind CSS.

## ✨ Funcionalidades

### 📊 Dashboard (/dashboard)
- **Sistema de Saúde Financeira**: Avaliação em tempo real baseada em regras simples (% de comprometimento da renda, metas no prazo)
- **Grid de Metas**: Visualização dinâmica do progresso de todas as metas
- **Gráfico de Progresso**: Comparação visual das metas usando Recharts
- **Tabela de Categorias**: Análise de despesas por categoria com percentuais
- **Cards de Resumo**: Totais de despesas fixas/variáveis e receitas previstas

### 🎯 Módulo de Metas (/goals)
- **Listagem Completa**: Todas as metas em um só lugar
- **CRUD Completo**: Criar, editar e excluir metas financeiras
- **Detalhes da Meta** (/goals/[id]): 
  - Visualização individual com progresso detalhado
  - Cálculo de dias restantes
  - Gráfico histórico do progresso
  - Indicador visual de metas em risco (próximas do prazo com baixo progresso)

Cada meta possui:
- ID, nome, valor total, valor atual, data limite, categoria, ícone, status ativo

### 💸 Módulo de Despesas (/registrations/expenses)
- **Formulário de Registro**: Campos para valor, categoria, tipo (fixo/variável), data e descrição
- **Listagem Recente**: Visualização das últimas despesas registradas
- **Feedback Visual**: Confirmação ao registrar nova despesa

### 💰 Módulo de Receitas (/registrations/receipts)
- **Formulário de Registro**: Campos para valor, origem, data e recorrência (única/mensal)
- **Listagem Recente**: Visualização das últimas receitas registradas
- **Feedback Visual**: Confirmação ao registrar nova receita

## 🎨 Design e UX

- **Paleta de Cores**: Tons de verde (primary/teal) transmitindo confiança e crescimento financeiro
- **Tipografia**: Manrope para textos e títulos, JetBrains Mono para dados numéricos
- **Animações**: Transições suaves com fade-in, slide-in e scale-in
- **Responsivo**: Design mobile-first, adaptável a todos os tamanhos de tela
- **Visual Moderno**: Gradientes sutis, sombras elegantes, bordas arredondadas

## 🗂️ Estrutura de Dados (Mock)

### Goals (Metas)
```typescript
{
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
```

### Expenses (Despesas)
```typescript
{
  id: string
  value: number
  category: 'alimentacao' | 'transporte' | 'moradia' | 'saude' | 'educacao' | 'lazer' | 'outros'
  type: 'fixo' | 'variavel'
  date: string
  description: string
}
```

### Receipts (Receitas)
```typescript
{
  id: string
  value: number
  origin: string
  date: string
  recurrence: 'unico' | 'mensal'
}
```

## 🏗️ Arquitetura Técnica

### Stack Principal
- **Framework**: Next.js 14.2.35 (Pages Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS + Shadcn UI
- **Gráficos**: Recharts
- **Gerenciamento de Estado**: Context API (FinanceContext)
- **Componentes UI**: Radix UI primitives

### Estrutura de Diretórios
```
src/
├── components/       # Componentes React organizados por feature
│   ├── ui/          # Componentes reutilizáveis Shadcn UI
│   ├── dashboard/   # Componentes específicos do dashboard
│   └── goals/       # Componentes do módulo de metas
├── contexts/        # React contexts (FinanceContext)
├── lib/             # Utilitários e dados mock
├── pages/           # Páginas Next.js
├── styles/          # CSS global
└── types/           # Definições TypeScript
```

## 🚀 Como Executar

1. **Instalar dependências**:
```bash
yarn install
```

2. **Executar em modo desenvolvimento**:
```bash
yarn run dev
```

3. **Acessar a aplicação**:
```
http://localhost:3000
```

A aplicação automaticamente redireciona para `/dashboard`.

## 📦 Dependências Principais

- `next`: 14.2.35
- `react`: ^18.2.0
- `recharts`: ^2.10.3
- `date-fns`: ^2.30.0
- `lucide-react`: ^0.263.1
- `@radix-ui/*`: Diversos componentes UI
- `tailwindcss`: ^3.4.0
- `typescript`: ^5.3.3

## 💡 Funcionalidades de Cálculo

### Saúde Financeira
O algoritmo calcula um score de 0-100 baseado em:
- **40%**: Taxa de despesas sobre receitas (quanto menor, melhor)
- **30%**: Taxa de poupança (metas/receitas)
- **30%**: Percentual de metas no prazo

**Status**:
- 80-100: Excelente ✅
- 60-79: Bom 👍
- 40-59: Atenção ⚠️
- 0-39: Crítico 🚨

### Indicadores de Risco
Uma meta é considerada "em risco" quando:
- Faltam menos de 60 dias para o prazo E
- O progresso é inferior a 70%

## 🎯 Próximos Passos (Possíveis Melhorias)

- [ ] Integração com backend real (API)
- [ ] Autenticação de usuários
- [ ] Exportação de relatórios em PDF
- [ ] Gráficos mais avançados (despesas ao longo do tempo)
- [ ] Notificações de metas próximas ao prazo
- [ ] Dark mode completo
- [ ] Previsões financeiras com IA
- [ ] Importação de extratos bancários

## 📄 Licença

Este é um projeto de demonstração para fins educacionais.

---

Desenvolvido com 💚 para ajudar você a ter controle total sobre suas finanças!
