'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import type { Subject, RequirementType } from '@/lib/types'

const REQUIREMENT_OPTIONS: { value: RequirementType; label: string; description: string }[] = [
  { value: 'TWO_THIRDS', label: '2/3以上',  description: '全授業の2/3以上の出席が必要（約66.7%）' },
  { value: 'CUSTOM',     label: 'カスタム', description: '任意の出席率を設定' },
  { value: 'FULL',       label: '全出席',   description: '全授業への出席が必要（100%）' },
  { value: 'NONE',       label: '不問',     description: '出席要件なし' },
]

interface Props {
  subject: Subject | null
  onClose: () => void
  onSave: (subjectId: string, patch: Partial<Subject>) => void
}

const PRESET_COLORS = [
  '#3b82f6','#ef4444','#f97316','#84cc16','#14b8a6',
  '#a855f7','#ec4899','#f59e0b','#0891b2','#65a30d',
  '#7c3aed','#e11d48','#1d4ed8','#0f766e','#b91c1c','#64748b',
]

export function SubjectSettingsModal({ subject, onClose, onSave }: Props) {
  const [requirementType, setRequirementType] = useState<RequirementType>(
    subject?.requirement_type ?? 'TWO_THIRDS'
  )
  const [customThreshold, setCustomThreshold] = useState(
    subject?.custom_threshold != null
      ? Math.round(subject.custom_threshold * 100)
      : 80
  )
  const [color, setColor] = useState(subject?.color ?? '#94a3b8')

  if (!subject) return null

  const handleSave = () => {
    onSave(subject.id, {
      requirement_type: requirementType,
      custom_threshold: requirementType === 'CUSTOM' ? customThreshold / 100 : undefined,
      color,
    })
    onClose()
  }

  return (
    <Dialog open={!!subject} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{subject.name} — 設定</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* カラー */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">カレンダー表示色</Label>
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
          <Label className="text-sm font-medium">必要出席率</Label>
          <div className="space-y-2">
            {REQUIREMENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRequirementType(opt.value)}
                className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all
                  ${requirementType === opt.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-muted-foreground'
                  }`}
              >
                <div className="font-medium">{opt.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{opt.description}</div>
              </button>
            ))}
          </div>

          {requirementType === 'CUSTOM' && (
            <div className="space-y-1.5 pt-1">
              <Label htmlFor="threshold">必要出席率（%）</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="threshold"
                  type="number"
                  min={1}
                  max={100}
                  value={customThreshold}
                  onChange={(e) => setCustomThreshold(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">%以上</span>
              </div>
            </div>
          )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>キャンセル</Button>
          <Button onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
