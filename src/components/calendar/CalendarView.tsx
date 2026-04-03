'use client'

import { useState } from 'react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
} from 'date-fns'
import { ja } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import type { Lesson, AttendanceRecord, Subject, SubjectStatus } from '@/lib/types'
import { getPeriodFromTime } from '@/lib/periods'

// 出席状況ドットの色
const statusDot: Record<string, string> = {
  PRESENT:    'bg-green-500',
  ABSENT:     'bg-red-500',
  TARDINESS:  'bg-yellow-500',
  EXCUSED:    'bg-blue-400',
  UNRECORDED: 'bg-gray-300',
}

// ステータス → テキスト色
const statusTextColor: Record<string, string> = {
  SAFE:    '#16a34a',
  WARNING: '#ca8a04',
  DANGER:  '#dc2626',
  NONE:    '#64748b',
}

// hex → rgba 変換
function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

interface Props {
  lessons: Lesson[]
  records: AttendanceRecord[]
  subjects: Subject[]
  subjectStatusMap: Record<string, SubjectStatus>
  onLessonClick: (lesson: Lesson) => void
  onDayClick: (date: Date) => void
}

export function CalendarView({ lessons, records, subjects, subjectStatusMap, onLessonClick, onDayClick }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const recordMap = Object.fromEntries(records.map((r) => [r.lesson_id, r]))
  const subjectMap = Object.fromEntries(subjects.map((s) => [s.id, s]))

  const getLessonsForDay = (day: Date) =>
    lessons
      .filter((l) => isSameDay(new Date(l.scheduled_at), day))
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

  const weekDays = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div className="space-y-2">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'yyyy年M月', { locale: ja })}
        </h2>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
            今月
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground border-l border-t">
        {weekDays.map((d, i) => (
          <div key={d} className={`py-1.5 border-r border-b ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : ''}`}>
            {d}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 border-l border-t">
        {days.map((day) => {
          const dayLessons = getLessonsForDay(day)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isToday = isSameDay(day, new Date())
          const dow = day.getDay()

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[96px] border-r border-b p-1 ${!isCurrentMonth ? 'bg-gray-50' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className={`text-xs w-6 h-6 flex items-center justify-center rounded-full font-medium
                  ${isToday ? 'bg-primary text-primary-foreground' : ''}
                  ${!isCurrentMonth ? 'text-muted-foreground' : dow === 0 ? 'text-red-500' : dow === 6 ? 'text-blue-500' : ''}
                `}>
                  {format(day, 'd')}
                </div>
                {isCurrentMonth && (
                  <button
                    onClick={() => onDayClick(day)}
                    className="w-4 h-4 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="space-y-0.5">
                {dayLessons.map((lesson) => {
                  const record = recordMap[lesson.id]
                  const statusKey = record?.status ?? 'UNRECORDED'
                  const subject = subjectMap[lesson.subject_id]
                  const textColor = lesson.display_color ?? statusTextColor[subjectStatusMap[lesson.subject_id] ?? 'SAFE']
                  const period = getPeriodFromTime(lesson.scheduled_at)

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => onLessonClick({ ...lesson, subject, attendance_record: record })}
                      className="w-full text-left text-[10px] px-1 py-0.5 rounded flex items-center gap-0.5 hover:opacity-80 transition-opacity bg-white border border-gray-200"
                    >
                      {period && <span className="shrink-0 font-bold text-gray-400">{period}</span>}
                      <span className="truncate flex-1 font-medium" style={{ color: textColor }}>{subject?.name ?? '不明'}</span>
                      <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${statusDot[statusKey]}`} />
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* 凡例 */}
      <div className="flex flex-wrap gap-3 text-xs pt-1 items-center">
        <span className="text-muted-foreground">出席状況:</span>
        {[
          { key: 'PRESENT',    label: '出席' },
          { key: 'ABSENT',     label: '欠席' },
          { key: 'TARDINESS',  label: '遅刻' },
          { key: 'EXCUSED',    label: '公欠' },
          { key: 'UNRECORDED', label: '未記録' },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${statusDot[key]}`} />
            <span className="text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
