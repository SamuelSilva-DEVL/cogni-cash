import { buildBriefing, buildSnapshot, buildSystemPrompt } from "./briefing"
import {
  readAnthropicMessage,
  readChatCompletion,
  resolveAnalystCall,
  toAnthropicMessages,
} from "./analyst-llm.client"
import { centsToDecimalString, moneyToCents } from "./money"
import { resolvePeriodRange } from "./period"

describe("analyst snapshot", () => {
  test("converts money to cents and back", () => {
    expect(moneyToCents("10.50")).toBe(1050)
    expect(moneyToCents({ toFixed: () => "10.5" })).toBe(1050)
    expect(moneyToCents(null)).toBe(0)
    expect(centsToDecimalString(-1050)).toBe("-10.50")
  })

  test("uses the calendar month in America/Sao_Paulo", () => {
    const beforeMidnight = resolvePeriodRange(
      "month",
      new Date("2026-09-01T02:00:00.000Z"),
    )
    expect(beforeMidnight.label).toBe("agosto de 2026")
    expect(beforeMidnight.from.toISOString()).toBe("2026-08-01T03:00:00.000Z")
    expect(beforeMidnight.to.toISOString()).toBe("2026-09-01T02:59:59.999Z")

    const september = resolvePeriodRange("month", new Date("2026-09-15T15:00:00.000Z"))
    expect(september.label).toBe("setembro de 2026")
    expect(september.from.toISOString()).toBe("2026-09-01T03:00:00.000Z")
  })

  test("quarter crosses the year boundary", () => {
    const range = resolvePeriodRange("quarter", new Date("2026-01-15T15:00:00.000Z"))

    expect(range.label).toBe("novembro de 2025 a janeiro de 2026")
    expect(range.from.toISOString()).toBe("2025-11-01T03:00:00.000Z")
  })

  test("year to date starts in January", () => {
    const range = resolvePeriodRange("year", new Date("2026-09-15T15:00:00.000Z"))

    expect(range.label).toBe("janeiro a setembro de 2026")
    expect(range.from.toISOString()).toBe("2026-01-01T03:00:00.000Z")
  })

  test("groups categories and keeps the period balance", () => {
    const range = resolvePeriodRange("month", new Date("2026-09-15T15:00:00.000Z"))
    const snapshot = buildSnapshot({
      range,
      incomeCents: 300000,
      expenseCents: 58025,
      transactionCount: 3,
      categories: [
        { type: "EXPENSE", name: "Mercado", totalCents: 50025, count: 1 },
        { type: "EXPENSE", name: "Sem categoria", totalCents: 4000, count: 1 },
        { type: "EXPENSE", name: "Sem categoria", totalCents: 4000, count: 1 },
        { type: "INCOME", name: "Salário", totalCents: 300000, count: 1 },
      ],
    })

    expect(snapshot.income).toBe("3000.00")
    expect(snapshot.expense).toBe("580.25")
    expect(snapshot.balance).toBe("2419.75")
    expect(snapshot.expenseCategories).toEqual([
      { name: "Mercado", total: "500.25", count: 1 },
      { name: "Sem categoria", total: "80.00", count: 2 },
    ])
  })

  test("briefing carries the totals the model is allowed to use", () => {
    const range = resolvePeriodRange("month", new Date("2026-09-15T15:00:00.000Z"))
    const snapshot = buildSnapshot({
      range,
      incomeCents: 300000,
      expenseCents: 80000,
      transactionCount: 2,
      categories: [
        { type: "EXPENSE", name: "Mercado", totalCents: 80000, count: 1 },
        { type: "INCOME", name: "Salário", totalCents: 300000, count: 1 },
      ],
    })

    const briefing = buildBriefing({
      snapshot,
      incomeCount: 1,
      expenseCount: 1,
      budgets: [],
      goals: [{ title: "Reserva", targetCents: 500000, currentCents: 100000 }],
      recent: [
        {
          date: new Date("2026-09-10T15:00:00.000Z"),
          type: "EXPENSE",
          description: "Feira",
          category: "Mercado",
          amountCents: 80000,
        },
      ],
    })
    const prompt = buildSystemPrompt(briefing)

    expect(briefing).toContain("3.000,00")
    expect(briefing).toContain("Mercado")
    expect(briefing).toContain("Reserva")
    expect(prompt).toContain(briefing)
    expect(prompt).toContain("Use somente o retrato abaixo.")
  })

  test("reads text from chat completion payloads", () => {
    expect(
      readChatCompletion({
        choices: [{ message: { content: "  A receita cobre as despesas.  " } }],
      }),
    ).toBe("A receita cobre as despesas.")

    expect(
      readChatCompletion({
        choices: [{ message: { content: [{ text: "Olhei " }, { text: "os registros." }] } }],
      }),
    ).toBe("Olhei os registros.")

    expect(readChatCompletion({ choices: [{ message: { content: "   " } }] })).toBeNull()
  })

  test("uses Claude Haiku when the key is from Anthropic", () => {
    const call = resolveAnalystCall({
      apiKey: "sk-ant-test",
      baseUrl: "https://api.openai.com/v1",
      model: "gpt-4o-mini",
    })

    expect(call.provider).toBe("anthropic")
    expect(call.model).toBe("claude-haiku-4-5")
    expect(call.url).toBe("https://api.anthropic.com/v1/messages")
    expect(call.headers["x-api-key"]).toBe("sk-ant-test")
  })

  test("keeps an explicit Claude model and an Anthropic base URL", () => {
    const call = resolveAnalystCall({
      apiKey: "sk-ant-test",
      baseUrl: "https://api.anthropic.com/v1",
      model: "claude-haiku-4-5-20251001",
    })

    expect(call.url).toBe("https://api.anthropic.com/v1/messages")
    expect(call.model).toBe("claude-haiku-4-5-20251001")
  })

  test("prepares alternating Anthropic messages", () => {
    expect(
      toAnthropicMessages([
        { role: "assistant", content: "oi" },
        { role: "user", content: "primeira" },
        { role: "user", content: "segunda" },
      ]),
    ).toEqual([{ role: "user", content: "primeira\n\nsegunda" }])
  })

  test("reads text blocks from an Anthropic message", () => {
    expect(
      readAnthropicMessage({
        content: [{ type: "text", text: "A receita cobre as despesas." }],
      }),
    ).toBe("A receita cobre as despesas.")
  })
})
