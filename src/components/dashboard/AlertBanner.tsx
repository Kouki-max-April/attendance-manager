'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import type { SubjectStats } from '@/lib/types'

interface Props {
  dangerSubjects: SubjectStats[]
}

export function AlertBanner({ dangerSubjects }: Props) {
  if (dangerSubjects.length === 0) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <span className="font-semibold">出席危険アラート: </span>
        {dangerSubjects.map((s, i) => (
          <span key={s.subject.id}>
            {s.subject.name}
            {s.remaining_absences < 0
              ? `（${Math.abs(s.remaining_absences)}回超過）`
              : '（あと0回）'}
            {i < dangerSubjects.length - 1 ? '、' : ''}
          </span>
        ))}
      </AlertDescription>
    </Alert>
  )
}
