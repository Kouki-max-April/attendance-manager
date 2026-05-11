'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { CalendarView } from '@/components/calendar/CalendarView'
import { SubjectCard } from '@/components/dashboard/SubjectCard'
import { AttendanceModal } from '@/components/attendance/AttendanceModal'
import { SubjectSettingsModal } from '@/components/dashboard/SubjectSettingsModal'
import { LessonEditModal } from '@/components/calendar/LessonEditModal'
import { PdfImportModal } from '@/components/import/PdfImportModal'
import { CsvImportModal } from '@/components/import/CsvImportModal'
import { calcSubjectStats } from '@/lib/attendance'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { mockSubjects, mockLessons } from '@/lib/mock-data'
import type { Lesson, AttendanceStatus, AttendanceRecord, Subject } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, CalendarDays, FileUp, BarChart2, Plus } from 'lucide-react'
import { StatsTab } from '@/components/stats/StatsTab'
import { SubjectCreateModal } from '@/components/dashboard/SubjectCreateModal'
import { LessonAddModal } from '@/components/calendar/LessonAddModal'
import { PushToggle } from '@/components/PushToggle'

const supabase = createSupabaseBrowserClient()

export default function Home() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [csvImportOpen, setCsvImportOpen] = useState(false)
  const [createSubjectOpen, setCreateSubjectOpen] = useState(false)
  const [addLessonDate, setAddLessonDate] = useState<Date | null>(null)

  // ── 初期データ読み込み ────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const [{ data: subData }, { data: lesData }, { data: recData }] = await Promise.all([
        supabase.from('subjects').select('*').order('id'),
        supabase.from('lessons').select('*').order('scheduled_at'),
        supabase.from('attendance_records').select('*'),
      ])

      // データが空なら mock-data でデフォルトシード
      if (!subData || subData.length === 0) {
        const subRows = mockSubjects.map(({ user_id, created_at, updated_at, ...rest }) => rest)
        await supabase.from('subjects').insert(subRows)

        const lesRows = mockLessons.map(({ user_id, subject, attendance_record, created_at, updated_at, ...rest }) => rest)
        for (let i = 0; i < lesRows.length; i += 200) {
          await supabase.from('lessons').insert(lesRows.slice(i, i + 200))
        }

        setSubjects(mockSubjects)
        setLessons(mockLessons)
        setRecords([])
        setLoading(false)
        return
      }

      if (subData) setSubjects(subData.map((s) => ({ ...s, user_id: '' })))
      if (lesData) setLessons(lesData.map((l) => ({ ...l, user_id: '' })))
      if (recData) setRecords(recData.map(toRecord))
      setLoading(false)
    }
    load()
  }, [])

  function toRecord(r: any): AttendanceRecord {
    return {
      id: r.id,
      user_id: '',
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
  const subjectStats = subjects.map((subject) => ({
    subject,
    stats: calcSubjectStats(subject, lessons, records),
  }))

  const subjectStatusMap = Object.fromEntries(
    subjectStats.map(({ subject, stats }) => [subject.id, stats.status])
  )

  const dangerList = subjectStats.filter(({ stats }) => stats.status === 'DANGER')

  const selectedRecord = selectedLesson
    ? records.find((r) => r.lesson_id === selectedLesson.id)
    : undefined

  // ── ハンドラー ────────────────────────────────────────────────
  const handleSaveAttendance = async (lessonId: string, status: AttendanceStatus) => {
    const lesson = lessons.find((l) => l.id === lessonId)!
    const id = `r_${lessonId}`
    const record = {
      id,
      lesson_id: lessonId,
      subject_id: lesson.subject_id,
      status,
      recorded_at: new Date().toISOString(),
    }
    await supabase.from('attendance_records').upsert(record, { onConflict: 'lesson_id' })

    const newRecord: AttendanceRecord = {
      ...record, user_id: '',
      memo: undefined, created_at: record.recorded_at, updated_at: record.recorded_at,
    }
    setRecords((prev) => {
      const idx = prev.findIndex((r) => r.lesson_id === lessonId)
      return idx >= 0 ? [...prev.slice(0, idx), newRecord, ...prev.slice(idx + 1)] : [...prev, newRecord]
    })
    setSelectedLesson(null)
  }

  const handleDeleteAttendance = async (lessonId: string) => {
    await supabase.from('attendance_records').delete().eq('lesson_id', lessonId)
    setRecords((prev) => prev.filter((r) => r.lesson_id !== lessonId))
    setSelectedLesson(null)
  }

  const handleSaveLesson = async (lessonId: string, patch: Partial<Lesson>) => {
    setLessons((prev) => prev.map((l) => l.id === lessonId ? { ...l, ...patch } : l))
    const { user_id, subject, attendance_record, ...dbPatch } = patch as any
    const cleanPatch = Object.fromEntries(
      Object.entries(dbPatch).filter(([, v]) => v !== undefined)
    )
    const { error } = await supabase.from('lessons').update(cleanPatch).eq('id', lessonId)
    if (error) console.error('lesson update error:', error)
  }

  const handleDeleteLesson = async (lessonId: string) => {
    await supabase.from('lessons').delete().eq('id', lessonId)
    setLessons((prev) => prev.filter((l) => l.id !== lessonId))
    setRecords((prev) => prev.filter((r) => r.lesson_id !== lessonId))
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

  const handleCreateSubject = async (data: Omit<Subject, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const id = `custom_${Date.now()}`
    const { data: row, error } = await supabase
      .from('subjects')
      .insert({ id, ...data })
      .select()
      .single()
    if (!error && row) {
      setSubjects((prev) => [...prev, { ...row, user_id: '' }])
    }
  }

  const handleSaveSubjectSettings = async (subjectId: string, patch: Partial<Subject>) => {
    const { user_id, ...dbPatch } = patch as any
    await supabase.from('subjects').update(dbPatch).eq('id', subjectId)
    setSubjects((prev) => prev.map((s) => s.id === subjectId ? { ...s, ...patch } : s))
  }

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
          <Button variant="outline" size="sm" onClick={() => setCreateSubjectOpen(true)} className="shrink-0">
            <Plus className="h-4 w-4 mr-1.5" />
            科目追加
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)} className="shrink-0">
            <FileUp className="h-4 w-4 mr-1.5" />
            PDF取込
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCsvImportOpen(true)} className="shrink-0">
            <FileUp className="h-4 w-4 mr-1.5" />
            CSV取込
          </Button>
          <PushToggle />
        </div>

        {/* 危険アラート */}
        {dangerList.length > 0 && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm flex flex-wrap gap-x-3 gap-y-1">
            <span className="font-semibold text-destructive">危険アラート:</span>
            {dangerList.map(({ subject, stats }, i) => (
              <span key={i}>
                {subject.name}
                （{stats.remaining_absences <= 0 ? `${Math.abs(stats.remaining_absences)}回超過` : 'あと0回'}）
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
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-1.5">
              <BarChart2 className="h-4 w-4" />
              統計
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjectStats.map(({ subject, stats }) => (
                <SubjectCard
                  key={subject.id}
                  stats={stats}
                  onSettingsClick={() => setEditingSubject(subject)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="mt-4">
            <CalendarView
              lessons={lessons}
              records={records}
              subjects={subjects}
              subjectStatusMap={subjectStatusMap}
              onLessonClick={setSelectedLesson}
              onDayClick={setAddLessonDate}
            />
          </TabsContent>

          <TabsContent value="stats" className="mt-4">
            <StatsTab
              subjects={subjects}
              lessons={lessons}
              records={records}
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
        key={editingLesson?.id ?? 'none'}
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
      <SubjectCreateModal
        open={createSubjectOpen}
        onClose={() => setCreateSubjectOpen(false)}
        onSave={handleCreateSubject}
      />
      <LessonAddModal
        date={addLessonDate}
        subjects={subjects}
        onClose={() => setAddLessonDate(null)}
        onAdd={handleAddMakeup}
      />
      <PdfImportModal
        open={importOpen}
        subjects={subjects}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
      />
      <CsvImportModal
        open={csvImportOpen}
        subjects={subjects}
        onClose={() => setCsvImportOpen(false)}
        onImport={handleImport}
      />
    </main>
  )
}
