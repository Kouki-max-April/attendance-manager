'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { CalendarView } from '@/components/calendar/CalendarView'
import { SubjectCard } from '@/components/dashboard/SubjectCard'
import { AttendanceModal } from '@/components/attendance/AttendanceModal'
import { SubjectSettingsModal } from '@/components/dashboard/SubjectSettingsModal'
import { LessonEditModal } from '@/components/calendar/LessonEditModal'
import { PdfImportModal } from '@/components/import/PdfImportModal'
import { UserSwitcher } from '@/components/UserSwitcher'
import { calcSubjectStats } from '@/lib/attendance'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Lesson, AttendanceStatus, AttendanceRecord, Subject, AppUser } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, CalendarDays, FileUp, BarChart2 } from 'lucide-react'
import { StatsTab } from '@/components/stats/StatsTab'
import { PushToggle } from '@/components/PushToggle'

const INITIAL_USERS: AppUser[] = [
  { id: 'u1', name: '自分',  color: '#3b82f6' },
  { id: 'u2', name: '相手',  color: '#ec4899' },
]

const supabase = createSupabaseBrowserClient()

export default function Home() {
  const [users, setUsers] = useState<AppUser[]>(INITIAL_USERS)
  const [activeUserId, setActiveUserId] = useState('u1')

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [allRecords, setAllRecords] = useState<Record<string, AttendanceRecord[]>>({ u1: [], u2: [] })
  const [loading, setLoading] = useState(true)

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [importOpen, setImportOpen] = useState(false)

  // ── 初期データ読み込み ────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const [{ data: subData }, { data: lesData }, { data: recData }] = await Promise.all([
        supabase.from('subjects').select('*').order('id'),
        supabase.from('lessons').select('*').order('scheduled_at'),
        supabase.from('attendance_records').select('*'),
      ])

      if (subData) {
        setSubjects(subData.map((s) => ({ ...s, user_id: '' })))
      }
      if (lesData) {
        setLessons(lesData.map((l) => ({ ...l, user_id: '' })))
      }
      if (recData) {
        const u1 = recData.filter((r) => r.user_key === 'u1').map(toRecord)
        const u2 = recData.filter((r) => r.user_key === 'u2').map(toRecord)
        setAllRecords({ u1, u2 })
      }
      setLoading(false)
    }
    load()
  }, [])

  function toRecord(r: any): AttendanceRecord {
    return {
      id: r.id,
      user_id: r.user_key,
      lesson_id: r.lesson_id,
      subject_id: r.subject_id,
      status: r.status,
      memo: r.memo,
      recorded_at: r.recorded_at,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }
  }

  // ── 派生データ ────────────────────────────────────────────────
  const activeRecords = allRecords[activeUserId] ?? []
  const activeUser = users.find((u) => u.id === activeUserId)!

  const allStats = subjects.map((subject) => ({
    subject,
    userStatsList: users.map((user) => ({
      user,
      stats: calcSubjectStats(subject, lessons, allRecords[user.id] ?? []),
    })),
  }))

  const activeSubjectStatusMap = Object.fromEntries(
    allStats.map(({ subject, userStatsList }) => {
      const activeStats = userStatsList.find((u) => u.user.id === activeUserId)
      return [subject.id, activeStats?.stats.status ?? 'SAFE']
    })
  )

  const dangerStatsList = allStats.flatMap(({ subject, userStatsList }) =>
    userStatsList
      .filter(({ stats }) => stats.status === 'DANGER')
      .map(({ user, stats }) => ({ ...stats, _userName: user.name, _userColor: user.color }))
  )

  const selectedRecord = selectedLesson
    ? activeRecords.find((r) => r.lesson_id === selectedLesson.id)
    : undefined

  // ── ハンドラー ────────────────────────────────────────────────
  const handleSaveAttendance = async (lessonId: string, status: AttendanceStatus) => {
    const lesson = lessons.find((l) => l.id === lessonId)!
    const id = `r_${activeUserId}_${lessonId}`
    const record = {
      id,
      user_key: activeUserId,
      lesson_id: lessonId,
      subject_id: lesson.subject_id,
      status,
      recorded_at: new Date().toISOString(),
    }
    await supabase.from('attendance_records').upsert(record, { onConflict: 'lesson_id,user_key' })

    const newRecord: AttendanceRecord = {
      ...record, user_id: activeUserId,
      memo: undefined, created_at: record.recorded_at, updated_at: record.recorded_at,
    }
    setAllRecords((prev) => {
      const list = prev[activeUserId] ?? []
      const idx = list.findIndex((r) => r.lesson_id === lessonId)
      const next = idx >= 0 ? [...list.slice(0, idx), newRecord, ...list.slice(idx + 1)] : [...list, newRecord]
      return { ...prev, [activeUserId]: next }
    })
    setSelectedLesson(null)
  }

  const handleDeleteAttendance = async (lessonId: string) => {
    await supabase.from('attendance_records')
      .delete()
      .eq('lesson_id', lessonId)
      .eq('user_key', activeUserId)
    setAllRecords((prev) => ({
      ...prev,
      [activeUserId]: (prev[activeUserId] ?? []).filter((r) => r.lesson_id !== lessonId),
    }))
    setSelectedLesson(null)
  }

  const handleSaveLesson = async (lessonId: string, patch: Partial<Lesson>) => {
    const { user_id, subject, attendance_record, ...dbPatch } = patch as any
    await supabase.from('lessons').update(dbPatch).eq('id', lessonId)
    setLessons((prev) => prev.map((l) => l.id === lessonId ? { ...l, ...patch } : l))
  }

  const handleDeleteLesson = async (lessonId: string) => {
    await supabase.from('lessons').delete().eq('id', lessonId)
    setLessons((prev) => prev.filter((l) => l.id !== lessonId))
    for (const user of users) {
      setAllRecords((prev) => ({
        ...prev,
        [user.id]: (prev[user.id] ?? []).filter((r) => r.lesson_id !== lessonId),
      }))
    }
  }

  const handleAddMakeup = async (lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>) => {
    const id = `makeup_${Date.now()}`
    const { user_id, subject, attendance_record, ...dbLesson } = lesson as any
    const { data } = await supabase.from('lessons').insert({ ...dbLesson, id }).select().single()
    if (data) setLessons((prev) => [...prev, { ...data, user_id: '' }])
  }

  const handleImport = async (newLessons: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>[]) => {
    const rows = newLessons.map((l, i) => {
      const { user_id, subject, attendance_record, ...dbLesson } = l as any
      return { ...dbLesson, id: `import_${Date.now()}_${i}` }
    })
    const { data } = await supabase.from('lessons').insert(rows).select()
    if (data) setLessons((prev) => [...prev, ...data.map((l: any) => ({ ...l, user_id: '' }))])
  }

  const handleSaveSubjectSettings = async (subjectId: string, patch: Partial<Subject>) => {
    const { user_id, ...dbPatch } = patch as any
    await supabase.from('subjects').update(dbPatch).eq('id', subjectId)
    setSubjects((prev) => prev.map((s) => s.id === subjectId ? { ...s, ...patch } : s))
  }

  const handleRenameUser = (userId: string, name: string) =>
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, name } : u))

  // ── ローディング ──────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-muted-foreground">
        読み込み中...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

        {/* ヘッダー */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h1 className="text-xl font-bold shrink-0">Attendance Manager</h1>
          <UserSwitcher
            users={users}
            activeUserId={activeUserId}
            onSwitch={setActiveUserId}
            onRename={handleRenameUser}
          />
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)} className="shrink-0">
            <FileUp className="h-4 w-4 mr-1.5" />
            時間割インポート
          </Button>
          <PushToggle />
        </div>

        {/* 危険アラート */}
        {dangerStatsList.length > 0 && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm flex flex-wrap gap-x-3 gap-y-1">
            <span className="font-semibold text-destructive">危険アラート:</span>
            {dangerStatsList.map((s, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: (s as any)._userColor }} />
                {(s as any)._userName}: {s.subject.name}
                （{s.remaining_absences <= 0 ? `${Math.abs(s.remaining_absences)}回超過` : 'あと0回'}）
              </span>
            ))}
          </div>
        )}

        <Tabs defaultValue="dashboard">
          <TabsList>
            <TabsTrigger value="dashboard" className="flex items-center gap-1.5">
              <LayoutDashboard className="h-4 w-4" />
              ダッシュボード
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              カレンダー
              <span className="text-[10px] px-1 py-0.5 rounded" style={{ backgroundColor: activeUser.color + '30', color: activeUser.color }}>
                {activeUser.name}
              </span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-1.5">
              <BarChart2 className="h-4 w-4" />
              統計
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allStats.map(({ subject, userStatsList }) => (
                <SubjectCard
                  key={subject.id}
                  userStatsList={userStatsList}
                  onSettingsClick={() => setEditingSubject(subject)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="mt-4">
            <CalendarView
              lessons={lessons}
              records={activeRecords}
              subjects={subjects}
              subjectStatusMap={activeSubjectStatusMap}
              onLessonClick={setSelectedLesson}
            />
          </TabsContent>

          <TabsContent value="stats" className="mt-4">
            <StatsTab
              users={users}
              activeUserId={activeUserId}
              subjects={subjects}
              lessons={lessons}
              allRecords={allRecords}
            />
          </TabsContent>
        </Tabs>
      </div>

      <AttendanceModal
        lesson={selectedLesson}
        record={selectedRecord}
        onClose={() => setSelectedLesson(null)}
        onSave={handleSaveAttendance}
        onDelete={handleDeleteAttendance}
        onEditLesson={(lesson) => setEditingLesson(lesson)}
      />
      <LessonEditModal
        lesson={editingLesson}
        subjects={subjects}
        onClose={() => setEditingLesson(null)}
        onSave={handleSaveLesson}
        onDelete={handleDeleteLesson}
        onAddMakeup={handleAddMakeup}
      />
      <SubjectSettingsModal
        subject={editingSubject}
        onClose={() => setEditingSubject(null)}
        onSave={handleSaveSubjectSettings}
      />
      <PdfImportModal
        open={importOpen}
        subjects={subjects}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
      />
    </main>
  )
}
