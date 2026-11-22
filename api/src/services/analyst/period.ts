const TIME_ZONE = "America/Sao_Paulo"

export type AnalystPeriod = "month" | "quarter" | "year"

export type PeriodRange = {
  period: AnalystPeriod
  label: string
  from: Date
  to: Date
}

type CalendarDate = {
  year: number
  month: number
  day: number
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

function midnightUtc(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day, 3, 0, 0, 0))
}

function endOfDayUtc(year: number, month: number, day: number) {
  return new Date(midnightUtc(year, month, day + 1).getTime() - 1)
}

function shiftMonth(year: number, month: number, delta: number) {
  const index = year * 12 + (month - 1) + delta
  const normalized = ((index % 12) + 12) % 12

  return {
    year: Math.floor(index / 12),
    month: normalized + 1,
  }
}

function monthYearLabel(year: number, month: number) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(midnightUtc(year, month, 15))
}

function monthName(year: number, month: number) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    timeZone: TIME_ZONE,
  }).format(midnightUtc(year, month, 15))
}

function rangeLabel(from: CalendarDate, to: CalendarDate) {
  if (from.year === to.year && from.month === to.month) {
    return monthYearLabel(to.year, to.month)
  }

  if (from.year === to.year) {
    return `${monthName(from.year, from.month)} a ${monthYearLabel(to.year, to.month)}`
  }

  return `${monthYearLabel(from.year, from.month)} a ${monthYearLabel(to.year, to.month)}`
}

export function resolvePeriodRange(period: AnalystPeriod, now = new Date()): PeriodRange {
  const today = calendarDateInSaoPaulo(now)
  const start =
    period === "year"
      ? { year: today.year, month: 1, day: 1 }
      : period === "quarter"
        ? { ...shiftMonth(today.year, today.month, -2), day: 1 }
        : { year: today.year, month: today.month, day: 1 }

  return {
    period,
    label: rangeLabel(start, today),
    from: midnightUtc(start.year, start.month, start.day),
    to: endOfDayUtc(today.year, today.month, today.day),
  }
}

export function isMonthInsideRange(
  range: PeriodRange,
  year: number,
  month: number,
) {
  const from = calendarDateInSaoPaulo(range.from)
  const to = calendarDateInSaoPaulo(range.to)
  const key = year * 12 + month

  return key >= from.year * 12 + from.month && key <= to.year * 12 + to.month
}

export function formatSaoPauloDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}
