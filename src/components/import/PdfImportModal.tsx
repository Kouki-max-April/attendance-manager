'use client'

import { useState, useRef } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, Loader2, Trash2, AlertTriangle } from 'lucide-react'
import type { ParsedLesson, Lesson, Subject } from '@/lib/types'
import { PERIODS } from '@/lib/periods'

interface Props {
  open: boolean
  subjects: Subject[]
  onClose: () => void
  onImport: (lessons: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>[]) => void
}

type Step = 'upload' | 'parsing' | 'confirm' | 'error'

export function PdfImportModal({ open, subjects, onClose, onImport }: Props) {
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

  const uploadFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setErrorMsg('PDFファイルのみ対応しています')
      setStep('error')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('ファイルサイズは20MB以下にしてください')
      setStep('error')
      return
    }

    setStep('parsing')
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/import-pdf', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'AI解析に失敗しました')
      setParsed(data.lessons ?? [])
      setStep('confirm')
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : '不明なエラー')
      setStep('error')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
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
      .map((p): Omit<Lesson, 'id' | 'created_at' | 'updated_at'> => {
        // 時限から時刻を決定（見つからなければ p.start_time を使用）
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

        // 科目名が既存科目と一致すれば紐付け、なければ最初の科目
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
      })
      .filter((l) => l.subject_id)

    onImport(toImport)
    handleClose()
  }

  const activeCount = parsed.length - excluded.size

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>時間割PDFをインポート</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* アップロード */}
          {step === 'upload' && (
            <div
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer
                ${dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium">PDFをドラッグ＆ドロップ</p>
              <p className="text-sm text-muted-foreground mt-1">またはクリックしてファイルを選択</p>
              <p className="text-xs text-muted-foreground mt-3">最大 20MB・複数ページ対応</p>
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
              />
            </div>
          )}

          {/* 解析中 */}
          {step === 'parsing' && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="font-medium">AIが時間割を解析中...</p>
              <p className="text-sm text-muted-foreground">しばらくお待ちください</p>
            </div>
          )}

          {/* エラー */}
          {step === 'error' && (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <AlertTriangle className="h-10 w-10 text-destructive" />
              <p className="font-medium text-destructive">解析に失敗しました</p>
              <p className="text-sm text-muted-foreground">{errorMsg}</p>
              <Button variant="outline" onClick={reset}>もう一度試す</Button>
            </div>
          )}

          {/* 確認 */}
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
