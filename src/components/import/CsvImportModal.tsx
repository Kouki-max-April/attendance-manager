'use client'

import { useState, useRef } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, Trash2, AlertTriangle, Download } from 'lucide-react'
import type { Lesson, Subject } from '@/lib/types'
import { PERIODS } from '@/lib/periods'
import type { ParsedLesson } from '@/lib/types'

interface Props {
  open: boolean
  subjects: Subject[]
  onClose: () => void
  onImport: (lessons: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>[]) => void
}

type Step = 'upload' | 'confirm' | 'error'

// 曜日文字列 → JS の getDay() 値（日=0）
const DAY_MAP: Record<string, number> = {
  日: 0, 月: 1, 火: 2, 水: 3, 木: 4, 金: 5, 土: 6,
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
}

function parseCsv(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .map((line) => line.split(',').map((c) => c.trim()))
    .filter((row) => row.some((c) => c !== ''))
}

/**
 * 日付指定形式: 日付,時限,科目名,教室,備考
 * 曜日繰り返し形式: 曜日,時限,科目名,教室,開始日,終了日,備考
 */
function parseLessonsFromCsv(rows: string[][]): ParsedLesson[] {
  if (rows.length < 2) return []
  const header = rows[0].map((h) => h.toLowerCase())
  const dataRows = rows.slice(1)

  const isDateFormat = header[0].includes('日付') || header[0].includes('date')

  const lessons: ParsedLesson[] = []

  if (isDateFormat) {
    // 日付指定形式
    for (const row of dataRows) {
      const [date, periodStr, subject_name, location, notes] = row
      if (!date || !subject_name) continue
      const periodNum = parseInt(periodStr, 10)
      const periodDef = PERIODS.find((p) => p.period === periodNum)
      lessons.push({
        subject_name: subject_name.trim(),
        date: date.trim(),
        start_time: periodDef
          ? `${String(periodDef.startHour).padStart(2, '0')}:${String(periodDef.startMin).padStart(2, '0')}`
          : '09:00',
        end_time: periodDef
          ? `${String(periodDef.endHour).padStart(2, '0')}:${String(periodDef.endMin).padStart(2, '0')}`
          : '10:30',
        location: location?.trim() || undefined,
        period: periodStr?.trim() || undefined,
        notes: notes?.trim() || undefined,
      })
    }
  } else {
    // 曜日繰り返し形式
    for (const row of dataRows) {
      const [dayStr, periodStr, subject_name, location, startDateStr, endDateStr, notes] = row
      if (!dayStr || !subject_name || !startDateStr || !endDateStr) continue

      const dayIndex = DAY_MAP[dayStr.trim()]
      if (dayIndex === undefined) continue

      const periodNum = parseInt(periodStr, 10)
      const periodDef = PERIODS.find((p) => p.period === periodNum)

      const startDate = new Date(startDateStr.trim())
      const endDate = new Date(endDateStr.trim())
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) continue

      // startDate から endDate の間で dayIndex に一致する日付を列挙
      const cur = new Date(startDate)
      // 最初の対象曜日まで進める
      while (cur.getDay() !== dayIndex) {
        cur.setDate(cur.getDate() + 1)
      }

      while (cur <= endDate) {
        const y = cur.getFullYear()
        const m = String(cur.getMonth() + 1).padStart(2, '0')
        const d = String(cur.getDate()).padStart(2, '0')
        lessons.push({
          subject_name: subject_name.trim(),
          date: `${y}-${m}-${d}`,
          start_time: periodDef
            ? `${String(periodDef.startHour).padStart(2, '0')}:${String(periodDef.startMin).padStart(2, '0')}`
            : '09:00',
          end_time: periodDef
            ? `${String(periodDef.endHour).padStart(2, '0')}:${String(periodDef.endMin).padStart(2, '0')}`
            : '10:30',
          location: location?.trim() || undefined,
          period: periodStr?.trim() || undefined,
          notes: notes?.trim() || undefined,
        })
        cur.setDate(cur.getDate() + 7)
      }
    }
  }

  return lessons
}

function parsedToLesson(
  p: ParsedLesson,
  subjects: Subject[],
): Omit<Lesson, 'id' | 'created_at' | 'updated_at'> {
  const periodNum = parseInt(p.period ?? '', 10)
  const periodDef = PERIODS.find((pd) => pd.period === periodNum)

  let scheduledAt: string
  let endAt: string | undefined

  if (periodDef) {
    const [y, m, d] = p.date.split('-').map(Number)
    scheduledAt = new Date(y, m - 1, d, periodDef.startHour, periodDef.startMin).toISOString()
    endAt       = new Date(y, m - 1, d, periodDef.endHour,   periodDef.endMin).toISOString()
  } else {
    const [sh, sm] = (p.start_time ?? '09:00').split(':').map(Number)
    const [eh, em] = (p.end_time   ?? '10:30').split(':').map(Number)
    const [y, m, d] = p.date.split('-').map(Number)
    scheduledAt = new Date(y, m - 1, d, sh, sm).toISOString()
    endAt       = new Date(y, m - 1, d, eh, em).toISOString()
  }

  const subject = subjects.find((s) =>
    s.name.includes(p.subject_name) || p.subject_name.includes(s.name)
  ) ?? subjects[0]

  return {
    user_id: 'u1',
    subject_id: subject?.id ?? '',
    scheduled_at: scheduledAt,
    end_at: endAt,
    location: p.location ?? undefined,
    notes: p.notes ?? undefined,
  }
}

const DATE_TEMPLATE = `日付,時限,科目名,教室,備考
2025-04-07,1,数学,101号室,
2025-04-08,2,英語,202号室,`

const WEEKLY_TEMPLATE = `曜日,時限,科目名,教室,開始日,終了日,備考
月,1,数学,101号室,2025-04-07,2025-07-25,
火,2,英語,202号室,2025-04-08,2025-07-26,
水,3,物理,301号室,2025-04-09,2025-07-23,`

export function CsvImportModal({ open, subjects, onClose, onImport }: Props) {
  const [step, setStep] = useState<Step>('upload')
  const [errorMsg, setErrorMsg] = useState('')
  const [parsed, setParsed] = useState<ParsedLesson[]>([])
  const [excluded, setExcluded] = useState<Set<number>>(new Set())
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setStep('upload')
    setErrorMsg('')
    setParsed([])
    setExcluded(new Set())
  }

  const handleClose = () => { reset(); onClose() }

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setErrorMsg('CSVファイル (.csv) のみ対応しています')
      setStep('error')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const rows = parseCsv(text)
        const lessons = parseLessonsFromCsv(rows)
        if (lessons.length === 0) {
          setErrorMsg('授業データが見つかりませんでした。フォーマットを確認してください。')
          setStep('error')
          return
        }
        setParsed(lessons)
        setStep('confirm')
      } catch {
        setErrorMsg('CSVの解析に失敗しました')
        setStep('error')
      }
    }
    reader.readAsText(file, 'UTF-8')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const toggleExclude = (i: number) => {
    setExcluded((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const handleImport = () => {
    const toImport = parsed
      .filter((_, i) => !excluded.has(i))
      .map((p) => parsedToLesson(p, subjects))
      .filter((l) => l.subject_id)
    onImport(toImport)
    handleClose()
  }

  const downloadTemplate = (type: 'date' | 'weekly') => {
    const content = type === 'date' ? DATE_TEMPLATE : WEEKLY_TEMPLATE
    const filename = type === 'date' ? 'timetable_date.csv' : 'timetable_weekly.csv'
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const activeCount = parsed.length - excluded.size

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>時間割CSVをインポート</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {step === 'upload' && (
            <div className="space-y-4">
              {/* テンプレートダウンロード */}
              <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">CSVテンプレート</p>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => downloadTemplate('date')}>
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    日付指定形式
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadTemplate('weekly')}>
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    曜日繰り返し形式
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  曜日繰り返し形式は 月〜金・開始日〜終了日 を指定すると全授業日を自動生成します
                </p>
              </div>

              {/* ドロップゾーン */}
              <div
                className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer
                  ${dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium">CSVをドラッグ＆ドロップ</p>
                <p className="text-sm text-muted-foreground mt-1">またはクリックしてファイルを選択</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
                />
              </div>
            </div>
          )}

          {step === 'error' && (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <AlertTriangle className="h-10 w-10 text-destructive" />
              <p className="font-medium text-destructive">読み込みに失敗しました</p>
              <p className="text-sm text-muted-foreground">{errorMsg}</p>
              <Button variant="outline" onClick={reset}>もう一度試す</Button>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {parsed.length} 件検出 → <span className="font-medium text-foreground">{activeCount} 件をインポート</span>
                </span>
                <span className="text-xs text-muted-foreground">不要な行はゴミ箱で除外</span>
              </div>

              {parsed.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  授業データが見つかりませんでした
                </div>
              ) : (
                <div className="space-y-1.5">
                  {parsed.map((item, i) => {
                    const isExcluded = excluded.has(i)
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm transition-opacity
                          ${isExcluded ? 'opacity-40 bg-muted' : 'bg-background'}`}
                      >
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{item.subject_name}</div>
                          <div className="text-xs text-muted-foreground flex gap-2 flex-wrap">
                            <span>{item.date}</span>
                            {item.period && <Badge variant="outline" className="text-[10px] px-1 py-0">{item.period}限</Badge>}
                            <span>{item.start_time}〜{item.end_time}</span>
                            {item.location && <span>{item.location}</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleExclude(i)}
                          className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {step === 'confirm' && (
          <DialogFooter className="pt-3 border-t">
            <Button variant="outline" onClick={handleClose}>キャンセル</Button>
            <Button onClick={handleImport} disabled={activeCount === 0}>
              {activeCount} 件をインポート
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
