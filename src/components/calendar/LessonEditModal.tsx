'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Trash2 } from 'lucide-react'
import type { Lesson, Subject } from '@/lib/types'
import { PERIODS } from '@/lib/periods'

interface Props {
  lesson: Lesson | null
  subjects: Subject[]
  onClose: () => void
  onSave: (lessonId: string, patch: Partial<Lesson>) => void
  onDelete: (lessonId: string) => void
  onAddMakeup: (lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>) => void
}

type Mode = 'edit' | 'makeup'

export function LessonEditModal({ lesson, subjects, onClose, onSave, onDelete, onAddMakeup }: Props) {
  const [mode, setMode] = useState<Mode>('edit')
  const [confirmDelete, setConfirmDelete] = useState(false)

  // edit フォーム
  const [date, setDate] = useState(
    lesson ? format(new Date(lesson.scheduled_at), 'yyyy-MM-dd') : ''
  )
  const [period, setPeriod] = useState<string>(() => {
    if (!lesson) return '1'
    const h = new Date(lesson.scheduled_at).getHours()
    const min = new Date(lesson.scheduled_at).getMinutes()
    const total = h * 60 + min
    const p = PERIODS.find((p) => p.startHour * 60 + p.startMin === total)
    return p ? String(p.period) : '1'
  })
  const [location, setLocation] = useState(lesson?.location ?? '')
  const [notes, setNotes] = useState(lesson?.notes ?? '')

  // 補講フォーム
  const [makeupDate, setMakeupDate] = useState('')
  const [makeupPeriod, setMakeupPeriod] = useState('1')
  const [makeupLocation, setMakeupLocation] = useState('')
  const [makeupSubjectId, setMakeupSubjectId] = useState(lesson?.subject_id ?? '')

  if (!lesson) return null

  const handleSave = () => {
    const p = PERIODS[Number(period) - 1]
    const [y, m, d] = date.split('-').map(Number)
    const start = new Date(y, m - 1, d, p.startHour, p.startMin)
    const end   = new Date(y, m - 1, d, p.endHour,   p.endMin)
    onSave(lesson.id, {
      scheduled_at: start.toISOString(),
      end_at: end.toISOString(),
      location: location || undefined,
      notes: notes || undefined,
    })
    onClose()
  }

  const handleAddMakeup = () => {
    if (!makeupDate) return
    const p = PERIODS[Number(makeupPeriod) - 1]
    const [y, m, d] = makeupDate.split('-').map(Number)
    const start = new Date(y, m - 1, d, p.startHour, p.startMin)
    const end   = new Date(y, m - 1, d, p.endHour,   p.endMin)
    onAddMakeup({
      user_id: lesson.user_id,
      subject_id: makeupSubjectId,
      scheduled_at: start.toISOString(),
      end_at: end.toISOString(),
      location: makeupLocation || undefined,
      notes: '補講',
    })
    onClose()
  }

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    onDelete(lesson.id)
    onClose()
  }

  const subjectName = subjects.find((s) => s.id === lesson.subject_id)?.name ?? '不明'

  return (
    <Dialog open={!!lesson} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{subjectName} — 授業の変更</DialogTitle>
        </DialogHeader>

        {/* モード切替 */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {(['edit', 'makeup'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setConfirmDelete(false) }}
              className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-all
                ${mode === m ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {m === 'edit' ? '授業を編集' : '補講を追加'}
            </button>
          ))}
        </div>

        {mode === 'edit' && (
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label>日付</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>時限</Label>
              <Select value={period} onValueChange={(v) => v && setPeriod(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIODS.map((p) => (
                    <SelectItem key={p.period} value={String(p.period)}>
                      {p.label}（{String(p.startHour).padStart(2,'0')}:{String(p.startMin).padStart(2,'0')}〜{String(p.endHour).padStart(2,'0')}:{String(p.endMin).padStart(2,'0')}）
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>教室</Label>
              <Input
                placeholder="例: 第一講義室"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>備考</Label>
              <Input
                placeholder="例: 休講、教室変更など"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Separator />

            <Button
              variant={confirmDelete ? 'destructive' : 'outline'}
              size="sm"
              className="w-full"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              {confirmDelete ? 'もう一度押すと削除します' : 'この授業を削除（休講）'}
            </Button>
          </div>
        )}

        {mode === 'makeup' && (
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label>科目</Label>
              <Select value={makeupSubjectId} onValueChange={(v) => v && setMakeupSubjectId(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>日付</Label>
              <Input type="date" value={makeupDate} onChange={(e) => setMakeupDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>時限</Label>
              <Select value={makeupPeriod} onValueChange={(v) => v && setMakeupPeriod(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIODS.map((p) => (
                    <SelectItem key={p.period} value={String(p.period)}>
                      {p.label}（{String(p.startHour).padStart(2,'0')}:{String(p.startMin).padStart(2,'0')}〜{String(p.endHour).padStart(2,'0')}:{String(p.endMin).padStart(2,'0')}）
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>教室</Label>
              <Input
                placeholder="例: 第二講義室"
                value={makeupLocation}
                onChange={(e) => setMakeupLocation(e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>キャンセル</Button>
          {mode === 'edit' && (
            <Button onClick={handleSave}>変更を保存</Button>
          )}
          {mode === 'makeup' && (
            <Button onClick={handleAddMakeup} disabled={!makeupDate}>補講を追加</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
