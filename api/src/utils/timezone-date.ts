const TIME_ZONE = "America/Sao_Paulo"

export type CalendarDate = {
  year: number
  month: number
  day: number
}

export type YearMonth = {
  year: number
  month: number
}

export type MonthDateRange = {
  year: number
  month: number
  periodStart: Date
  periodEnd: Date
}

export function calendarDateInSaoPaulo(date: Date): CalendarDate {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  })
  const map = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  )

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
  }
}

/** Midnight of that calendar day in America/Sao_Paulo, as UTC Instant. */
export function startOfDaySaoPaulo(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day, 3, 0, 0, 0))
}

export function endOfDaySaoPaulo(year: number, month: number, day: number) {
  return new Date(startOfDaySaoPaulo(year, month, day + 1).getTime() - 1)
}

export function shiftMonth(year: number, month: number, delta: number): YearMonth {
  const index = year * 12 + (month - 1) + delta
  const normalized = ((index % 12) + 12) % 12

  return {
    year: Math.floor(index / 12),
    month: normalized + 1,
  }
}

export function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

/** Full civil month in America/Sao_Paulo (day 1 00:00 → last day 23:59:59.999). */
export function getMonthDateRange(month: number, year: number): MonthDateRange {
  const lastDay = daysInMonth(year, month)

  return {
    year,
    month,
    periodStart: startOfDaySaoPaulo(year, month, 1),
    periodEnd: endOfDaySaoPaulo(year, month, lastDay),
  }
}

export function getCurrentYearMonth(now = new Date()): YearMonth {
  const today = calendarDateInSaoPaulo(now)
  return { year: today.year, month: today.month }
}

export function getPreviousYearMonth(now = new Date()): YearMonth {
  const current = getCurrentYearMonth(now)
  return shiftMonth(current.year, current.month, -1)
}

export function getPreviousMonthDateRange(now = new Date()): MonthDateRange {
  const previous = getPreviousYearMonth(now)
  return getMonthDateRange(previous.month, previous.year)
}

export function getCurrentMonthDateRange(now = new Date()): MonthDateRange {
  const current = getCurrentYearMonth(now)
  return getMonthDateRange(current.month, current.year)
}
