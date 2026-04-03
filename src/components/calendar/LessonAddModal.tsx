'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Lesson, Subject } from '@/lib/types'
import { PERIODS } from '@/lib/periods'

interface Props {
  date: Date | null
  subjects: Subject[]
  onClose: () => void
  onAdd: (lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>) => void
}

export function LessonAddModal({ date, subjects, onClose, onAdd }: Props) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '')
  const [period, setPeriod] = useState('1')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')

  if (!date) return null

  const handleAdd = () => {
    if (!subjectId) return
    const p = PERIODS[Number(period) - 1]
    const d = format(date, 'yyyy-MM-dd')
    const [y, mo, day] = d.split('-').map(Number)
    const start = new Date(y, mo - 1, day, p.startHour, p.startMin)
    const end   = new Date(y, mo - 1, day, p.endHour,   p.endMin)
    onAdd({
      user_id: '',
      subject_id: subjectId,
      scheduled_at: start.toISOString(),
      end_at: end.toISOString(),
      location: location || undefined,
      notes: notes || undefined,
    })
    onClose()
  }

  return (
    <Dialog open={!!date} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{format(date, 'M月d日')} — 授業を追加</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label>科目</Label>
            <Select value={subjectId} onValueChange={(v) => v && setSubjectId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="科目を選択" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color ?? '#94a3b8' }} />
                      {s.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Label>教室 <span className="text-muted-foreground text-xs">（任意）</span></Label>
            <Input placeholder="例: 第一講義室" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>備考 <span className="text-muted-foreground text-xs">（任意）</span></Label>
            <Input placeholder="例: 実習、特別講義など" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>キャンセル</Button>
          <Button onClick={handleAdd} disabled={!subjectId}>追加</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
