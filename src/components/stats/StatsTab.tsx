'use client'

import { useMemo } from 'react'
import { format, isSameMonth } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import type { Lesson, AttendanceRecord, Subject } from '@/lib/types'
import { calcSubjectStats } from '@/lib/attendance'

const STATUS_PIE_COLORS = {
  PRESENT:    '#22c55e',
  ABSENT:     '#ef4444',
  TARDINESS:  '#eab308',
  EXCUSED:    '#60a5fa',
  UNRECORDED: '#cbd5e1',
}
const DOW_LABELS = ['日', '月', '火', '水', '木', '金', '土']
const PERIOD_LABELS = ['1限', '2限', '3限', '4限', '5限', '6限']

interface Props {
  subjects: Subject[]
  lessons: Lesson[]
  records: AttendanceRecord[]
}

function buildMonthlyData(lessons: Lesson[], records: AttendanceRecord[]) {
  const now = new Date()
  const pastLessons = lessons.filter((l) => new Date(l.scheduled_at) <= now)
  if (pastLessons.length === 0) return []

  const monthSet = new Set(pastLessons.map((l) => format(new Date(l.scheduled_at), 'yyyy-MM')))
  const months = Array.from(monthSet).sort()

  return months.map((ym) => {
    const [y, m] = ym.split('-').map(Number)
    const monthDate = new Date(y, m - 1, 1)
    const monthLessons = pastLessons.filter((l) => isSameMonth(new Date(l.scheduled_at), monthDate))
    const monthRecords = records.filter((r) => monthLessons.some((l) => l.id === r.lesson_id))
    const presentCount = monthRecords.filter((r) => r.status === 'PRESENT' || r.status === 'EXCUSED').length
    return {
      month: format(monthDate, 'M月', { locale: ja }),
      出席率: monthLessons.length > 0 ? Math.round((presentCount / monthLessons.length) * 100) : 0,
    }
  })
}

function buildPieData(lessons: Lesson[], records: AttendanceRecord[]) {
  const now = new Date()
  const pastLessons = lessons.filter((l) => new Date(l.scheduled_at) <= now)
  const recordMap = Object.fromEntries(records.map((r) => [r.lesson_id, r]))
  const counts = { PRESENT: 0, ABSENT: 0, TARDINESS: 0, EXCUSED: 0, UNRECORDED: 0 }
  pastLessons.forEach((l) => {
    const status = recordMap[l.id]?.status ?? 'UNRECORDED'
    counts[status as keyof typeof counts] = (counts[status as keyof typeof counts] ?? 0) + 1
  })
  return [
    { name: '出席', value: counts.PRESENT,    key: 'PRESENT' },
    { name: '欠席', value: counts.ABSENT,     key: 'ABSENT' },
    { name: '遅刻', value: counts.TARDINESS,  key: 'TARDINESS' },
    { name: '公欠', value: counts.EXCUSED,    key: 'EXCUSED' },
    { name: '未記録', value: counts.UNRECORDED, key: 'UNRECORDED' },
  ].filter((d) => d.value > 0)
}

function buildHeatmap(lessons: Lesson[], records: AttendanceRecord[]) {
  const recordMap = Object.fromEntries(records.map((r) => [r.lesson_id, r]))
  const grid: number[][] = Array.from({ length: 7 }, () => Array(6).fill(0))
  lessons.forEach((l) => {
    const rec = recordMap[l.id]
    if (rec?.status === 'ABSENT' || rec?.status === 'TARDINESS') {
      const d = new Date(l.scheduled_at)
      const dow = d.getDay()
      const totalMin = d.getHours() * 60 + d.getMinutes()
      const bounds = [520, 600, 680, 800, 880, 960, 1030]
      const p = bounds.findIndex((b, i) => totalMin >= b && (i === bounds.length - 1 || totalMin < bounds[i + 1]))
      if (p >= 0 && p < 6) grid[dow][p]++
    }
  })
  return grid
}

function SubjectTable({ subjects, lessons, records }: { subjects: Subject[]; lessons: Lesson[]; records: AttendanceRecord[] }) {
  const rows = subjects.map((s) => calcSubjectStats(s, lessons, records))

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="text-left py-1.5 pr-3 font-medium">科目</th>
            <th className="text-right py-1.5 px-2 font-medium">出席/授業数</th>
            <th className="text-right py-1.5 px-2 font-medium">出席率</th>
            <th className="text-right py-1.5 px-2 font-medium">欠席</th>
            <th className="text-right py-1.5 pl-2 font-medium">残り</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ subject, total_lessons, past_lessons, attended_count, absent_count, remaining_absences, attendance_rate, status }) => (
            <tr key={subject.id} className="border-b hover:bg-muted/30 transition-colors">
              <td className="py-1.5 pr-3 font-medium truncate max-w-[160px]">{subject.name}</td>
              <td className="text-right py-1.5 px-2 text-muted-foreground">{attended_count}/{past_lessons}({total_lessons})</td>
              <td className="text-right py-1.5 px-2 font-bold">
                <span className={status === 'DANGER' ? 'text-red-600' : status === 'WARNING' ? 'text-yellow-600' : 'text-green-700'}>
                  {attendance_rate}%
                </span>
              </td>
              <td className="text-right py-1.5 px-2 text-muted-foreground">{absent_count}回</td>
              <td className="text-right py-1.5 pl-2">
                {remaining_absences === Infinity ? (
                  <span className="text-muted-foreground">-</span>
                ) : remaining_absences <= 0 ? (
                  <span className="text-red-600 font-bold">超過{Math.abs(remaining_absences)}</span>
                ) : (
                  <span className={remaining_absences <= 2 ? 'text-yellow-600 font-medium' : 'text-muted-foreground'}>
                    あと{remaining_absences}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function StatsTab({ subjects, lessons, records }: Props) {
  const monthlyData = useMemo(() => buildMonthlyData(lessons, records), [lessons, records])
  const pieData = useMemo(() => buildPieData(lessons, records), [lessons, records])
  const heatmap = useMemo(() => buildHeatmap(lessons, records), [lessons, records])

  const maxHeat = Math.max(1, ...heatmap.flat())

  return (
    <div className="space-y-6">

      {/* 月別出席率 */}
      <section>
        <h3 className="text-sm font-semibold mb-3">月別出席率</h3>
        {monthlyData.length === 0 ? (
          <p className="text-sm text-muted-foreground">まだ記録された授業がありません</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="出席率" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* 出席状況内訳 + ヒートマップ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* パイチャート */}
        <section>
          <h3 className="text-sm font-semibold mb-3">出席状況内訳</h3>
          {pieData.length === 0 ? (
            <p className="text-sm text-muted-foreground">記録なし</p>
          ) : (
            <div className="flex items-center gap-4">
              <PieChart width={120} height={120}>
                <Pie data={pieData} dataKey="value" cx={55} cy={55} innerRadius={30} outerRadius={55}>
                  {pieData.map((entry) => (
                    <Cell key={entry.key} fill={STATUS_PIE_COLORS[entry.key as keyof typeof STATUS_PIE_COLORS]} />
                  ))}
                </Pie>
              </PieChart>
              <ul className="space-y-1.5">
                {pieData.map((entry) => (
                  <li key={entry.key} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_PIE_COLORS[entry.key as keyof typeof STATUS_PIE_COLORS] }} />
                    <span className="text-muted-foreground">{entry.name}</span>
                    <span className="font-medium">{entry.value}回</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* 欠席ヒートマップ */}
        <section>
          <h3 className="text-sm font-semibold mb-3">欠席・遅刻ヒートマップ</h3>
          <div className="overflow-x-auto">
            <table className="text-[10px] border-collapse">
              <thead>
                <tr>
                  <th className="w-7 text-muted-foreground font-normal" />
                  {DOW_LABELS.map((d, i) => (
                    <th key={d} className={`w-7 h-6 text-center font-medium ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : ''}`}>{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIOD_LABELS.map((p, pi) => (
                  <tr key={p}>
                    <td className="pr-1 text-right text-muted-foreground font-medium">{p}</td>
                    {heatmap.map((row, dow) => {
                      const val = row[pi]
                      const intensity = val / maxHeat
                      return (
                        <td
                          key={dow}
                          className={`w-7 h-7 text-center rounded transition-colors ${val === 0 ? 'bg-muted/30' : ''}`}
                          style={val > 0 ? { backgroundColor: `rgba(239,68,68,${0.15 + intensity * 0.75})` } : undefined}
                          title={`${DOW_LABELS[dow]}曜 ${p}: ${val}回`}
                        >
                          {val > 0 ? val : ''}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* 科目別テーブル */}
      <section>
        <h3 className="text-sm font-semibold mb-3">科目別詳細</h3>
        <SubjectTable subjects={subjects} lessons={lessons} records={records} />
      </section>
    </div>
  )
}
