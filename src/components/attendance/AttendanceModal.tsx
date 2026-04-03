'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import type { Lesson, AttendanceStatus, AttendanceRecord } from '@/lib/types'
import { getPeriodFromTime } from '@/lib/periods'

const statusOptions: { value: AttendanceStatus; label: string; className: string }[] = [
  { value: 'PRESENT',   label: '出席', className: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200' },
  { value: 'ABSENT',    label: '欠席', className: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200' },
  { value: 'TARDINESS', label: '遅刻', className: 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200' },
  { value: 'EXCUSED',   label: '公欠', className: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200' },
]

interface Props {
  lesson: Lesson | null
  record: AttendanceRecord | undefined
  onClose: () => void
  onSave: (lessonId: string, status: AttendanceStatus) => void
  onDelete: (lessonId: string) => void
  onEditLesson: (lesson: Lesson) => void
}

export function AttendanceModal({ lesson, record, onClose, onSave, onDelete, onEditLesson }: Props) {
  const [selected, setSelected] = useState<AttendanceStatus | null>(record?.status ?? null)

  if (!lesson) return null

  const subjectName = lesson.subject?.name ?? '不明な科目'
  const period = getPeriodFromTime(lesson.scheduled_at)
  const date = format(new Date(lesson.scheduled_at), 'M月d日(E) HH:mm', { locale: ja })
  const endTime = lesson.end_at ? format(new Date(lesson.end_at), 'HH:mm') : ''

  return (
    <Dialog open={!!lesson} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-6">
            <span>{subjectName}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
              onClick={() => { onClose(); onEditLesson(lesson) }}
            >
              <Pencil className="h-3.5 w-3.5 mr-1" />
              授業を変更
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="text-sm text-muted-foreground space-y-1">
            {period && <div className="font-medium text-foreground">{period}限</div>}
            <div>{date}{endTime ? ` 〜 ${endTime}` : ''}</div>
            {lesson.location && <div>教室: {lesson.location}</div>}
            {lesson.notes && <div>備考: {lesson.notes}</div>}
          </div>

          <div>
            <p className="text-sm font-medium mb-2">出席状況を選択</p>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelected(opt.value)}
                  className={`
                    px-4 py-2 rounded-md border text-sm font-medium transition-all
                    ${opt.className}
                    ${selected === opt.value ? 'ring-2 ring-offset-1 ring-current opacity-100' : 'opacity-70'}
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row items-center justify-between sm:justify-between">
          {record ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(lesson.id)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              取り消し
            </Button>
          ) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>キャンセル</Button>
            <Button
              disabled={!selected}
              onClick={() => selected && onSave(lesson.id, selected)}
            >
              保存
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
