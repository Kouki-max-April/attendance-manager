export const PERIODS = [
  { period: 1, label: '1限', startHour: 8,  startMin: 40, endHour: 9,  endMin: 50 },
  { period: 2, label: '2限', startHour: 10, startMin: 0,  endHour: 11, endMin: 10 },
  { period: 3, label: '3限', startHour: 11, startMin: 20, endHour: 12, endMin: 30 },
  { period: 4, label: '4限', startHour: 13, startMin: 20, endHour: 14, endMin: 30 },
  { period: 5, label: '5限', startHour: 14, startMin: 40, endHour: 15, endMin: 50 },
  { period: 6, label: '6限', startHour: 16, startMin: 0,  endHour: 17, endMin: 10 },
] as const

export type PeriodNumber = 1 | 2 | 3 | 4 | 5 | 6

export function getPeriodFromTime(scheduledAt: string): PeriodNumber | null {
  const date = new Date(scheduledAt)
  const total = date.getHours() * 60 + date.getMinutes()
  for (const p of PERIODS) {
    if (total >= p.startHour * 60 + p.startMin && total <= p.endHour * 60 + p.endMin)
      return p.period as PeriodNumber
  }
  return null
}
