'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Subject, RequirementType } from '@/lib/types'

const REQUIREMENT_OPTIONS: { value: RequirementType; label: string; description: string }[] = [
  { value: 'TWO_THIRDS', label: '2/3以上',  description: '全授業の2/3以上の出席が必要' },
  { value: 'CUSTOM',     label: 'カスタム', description: '任意の出席率を設定' },
  { value: 'FULL',       label: '全出席',   description: '全授業への出席が必要' },
  { value: 'NONE',       label: '不問',     description: '出席要件なし' },
]

const PRESET_COLORS = [
  '#3b82f6','#ef4444','#f97316','#84cc16','#14b8a6',
  '#a855f7','#ec4899','#f59e0b','#0891b2','#65a30d',
  '#7c3aed','#e11d48','#1d4ed8','#0f766e','#b91c1c',
]

interface Props {
  open: boolean
  onClose: () => void
  onSave: (subject: Omit<Subject, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void
}

export function SubjectCreateModal({ open, onClose, onSave }: Props) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [requirementType, setRequirementType] = useState<RequirementType>('TWO_THIRDS')
  const [customThreshold, setCustomThreshold] = useState(80)

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      color,
      requirement_type: requirementType,
      custom_threshold: requirementType === 'CUSTOM' ? customThreshold / 100 : undefined,
      count_tardiness_as: 0.5,
      ignore_excused: true,
    })
    // リセット
    setName('')
    setColor('#3b82f6')
    setRequirementType('TWO_THIRDS')
    setCustomThreshold(80)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>科目を追加</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 科目名 */}
          <div className="space-y-1.5">
            <Label>科目名</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 解剖学"
              autoFocus
            />
          </div>

          {/* カラー */}
          <div className="space-y-1.5">
            <Label>カラー</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* 必要出席率 */}
          <div className="space-y-2">
            <Label>必要出席率</Label>
            {REQUIREMENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRequirementType(opt.value)}
                className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all
                  ${requirementType === opt.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-muted-foreground'
                  }`}
              >
                <div className="font-medium">{opt.label}</div>
                <div className="text-xs text-muted-foreground">{opt.description}</div>
              </button>
            ))}
            {requirementType === 'CUSTOM' && (
              <div className="flex items-center gap-2 pt-1">
                <Input
                  type="number" min={1} max={100}
                  value={customThreshold}
                  onChange={(e) => setCustomThreshold(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">%以上</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>キャンセル</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>追加</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
