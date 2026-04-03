'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Settings2 } from 'lucide-react'
import type { SubjectStats, AppUser } from '@/lib/types'

const statusConfig = {
  SAFE:    { label: '安全', className: 'bg-green-100 text-green-800 border-green-200' },
  WARNING: { label: '注意', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  DANGER:  { label: '危険', className: 'bg-red-100 text-red-800 border-red-200' },
  NONE:    { label: '不問', className: 'bg-gray-100 text-gray-600 border-gray-200' },
}

const requirementLabel: Record<string, string> = {
  TWO_THIRDS: '2/3以上', FULL: '全出席', CUSTOM: 'カスタム', NONE: '不問',
}

interface UserStats {
  user: AppUser
  stats: SubjectStats
}

interface Props {
  userStatsList: UserStats[]
  onSettingsClick: () => void
}

const statusBarColor: Record<string, string> = {
  SAFE:    '#22c55e',
  WARNING: '#eab308',
  DANGER:  '#ef4444',
  NONE:    '#94a3b8',
}

function UserRow({ user, stats }: UserStats) {
  const { attendance_rate, attended_count, total_lessons, remaining_absences, status } = stats

  const remainingText =
    remaining_absences === Infinity ? '制限なし' :
    remaining_absences <= 0 ? `超過 ${Math.abs(remaining_absences)}回` :
    `あと ${remaining_absences} 回`

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: user.color }} />
          <span className="text-xs font-medium">{user.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold">{attendance_rate}%</span>
          <Badge variant="outline" className={`text-[10px] px-1 py-0 ${statusConfig[status].className}`}>
            {statusConfig[status].label}
          </Badge>
        </div>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full transition-all" style={{ width: `${Math.min(attendance_rate, 100)}%`, backgroundColor: statusBarColor[status] }} />
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{attended_count}/{total_lessons} 回出席</span>
        <span className={remaining_absences <= 0 ? 'text-red-600 font-medium' : remaining_absences <= 2 ? 'text-yellow-600 font-medium' : ''}>{remainingText}</span>
      </div>
    </div>
  )
}

export function SubjectCard({ userStatsList, onSettingsClick }: Props) {
  const subject = userStatsList[0].stats.subject

  const reqLabel = subject.requirement_type === 'CUSTOM' && subject.custom_threshold != null
    ? `${Math.round(subject.custom_threshold * 100)}%以上`
    : requirementLabel[subject.requirement_type]

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold truncate flex-1 mr-1">{subject.name}</CardTitle>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] text-muted-foreground">{reqLabel}</span>
          <Button
            variant="ghost" size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={(e) => { e.stopPropagation(); onSettingsClick() }}
          >
            <Settings2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {userStatsList.map(({ user, stats }) => (
          <UserRow key={user.id} user={user} stats={stats} />
        ))}
      </CardContent>
    </Card>
  )
}
