import {
  getCurrentYearMonth,
  getMonthDateRange,
  getPreviousMonthDateRange,
  getPreviousYearMonth,
  shiftMonth,
} from "./timezone-date"

describe("timezone-date", () => {
  test("getMonthDateRange uses America/Sao_Paulo civil bounds", () => {
    const september = getMonthDateRange(9, 2026)

    expect(september.year).toBe(2026)
    expect(september.month).toBe(9)
    expect(september.periodStart.toISOString()).toBe("2026-09-01T03:00:00.000Z")
    expect(september.periodEnd.toISOString()).toBe("2026-10-01T02:59:59.999Z")
  })

  test("getMonthDateRange handles February in a leap year", () => {
    const february = getMonthDateRange(2, 2024)

    expect(february.periodStart.toISOString()).toBe("2024-02-01T03:00:00.000Z")
    expect(february.periodEnd.toISOString()).toBe("2024-03-01T02:59:59.999Z")
  })

  test("shiftMonth crosses year boundary", () => {
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 })
    expect(shiftMonth(2025, 12, 1)).toEqual({ year: 2026, month: 1 })
  })

  test("previous month respects Sao Paulo calendar near midnight UTC", () => {
    // Still August 31 in SP (UTC-3)
    const stillAugust = new Date("2026-09-01T02:00:00.000Z")
    expect(getCurrentYearMonth(stillAugust)).toEqual({ year: 2026, month: 8 })
    expect(getPreviousYearMonth(stillAugust)).toEqual({ year: 2026, month: 7 })

    const previous = getPreviousMonthDateRange(stillAugust)
    expect(previous.month).toBe(7)
    expect(previous.year).toBe(2026)
    expect(previous.periodStart.toISOString()).toBe("2026-07-01T03:00:00.000Z")
    expect(previous.periodEnd.toISOString()).toBe("2026-08-01T02:59:59.999Z")
  })
})
