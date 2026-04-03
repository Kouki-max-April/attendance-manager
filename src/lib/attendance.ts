import type { Subject, Lesson, AttendanceRecord, SubjectStats, SubjectStatus } from './types'

export function calcRemainingAbsences(
  subject: Subject,
  lessons: Lesson[],
  records: AttendanceRecord[]
): number {
  const totalLessons = lessons.length
  const now = new Date()

  const absentCount = records.reduce((count, record) => {
    if (record.status === 'EXCUSED' && subject.ignore_excused) return count
    if (record.status === 'ABSENT') return count + 1
    if (record.status === 'TARDINESS') return count + subject.count_tardiness_as
    return count
  }, 0)

  switch (subject.requirement_type) {
    case 'TWO_THIRDS':
      // 2/3出席必要 → 欠席可能数 = total - ceil(total * 2/3)
      return totalLessons - Math.ceil(totalLessons * 2 / 3) - absentCount
    case 'FULL':
      return 0 - absentCount
    case 'CUSTOM': {
      const threshold = subject.custom_threshold ?? 2 / 3
      return totalLessons - Math.ceil(totalLessons * threshold) - absentCount
    }
    case 'NONE':
      return Infinity
    default:
      return 0
  }
}

export function calcAttendanceRate(
  lessons: Lesson[],
  records: AttendanceRecord[],
  ignoreExcused: boolean
): number {
  const pastLessons = lessons.filter(
    (l) => new Date(l.scheduled_at) <= new Date()
  )
  if (pastLessons.length === 0) return 100

  const presentCount = records.filter((r) => {
    if (r.status === 'PRESENT') return true
    if (r.status === 'EXCUSED' && ignoreExcused) return true
    return false
  }).length

  return Math.round((presentCount / pastLessons.length) * 100)
}

export function calcSubjectStatus(remaining: number): SubjectStatus {
  if (remaining === Infinity) return 'NONE'
  if (remaining <= 0) return 'DANGER'
  if (remaining <= 2) return 'WARNING'
  return 'SAFE'
}

export function calcSubjectStats(
  subject: Subject,
  lessons: Lesson[],
  records: AttendanceRecord[]
): SubjectStats {
  const subjectLessons = lessons.filter((l) => l.subject_id === subject.id)
  const subjectRecords = records.filter((r) => r.subject_id === subject.id)
  const now = new Date()
  const pastLessons = subjectLessons.filter(
    (l) => new Date(l.scheduled_at) <= now
  )

  const attendedCount = subjectRecords.filter((r) => r.status === 'PRESENT').length

  const absentCount = subjectRecords.reduce((count, record) => {
    if (record.status === 'EXCUSED' && subject.ignore_excused) return count
    if (record.status === 'ABSENT') return count + 1
    if (record.status === 'TARDINESS') return count + subject.count_tardiness_as
    return count
  }, 0)

  const remaining = calcRemainingAbsences(subject, subjectLessons, subjectRecords)
  const attendanceRate = calcAttendanceRate(subjectLessons, subjectRecords, subject.ignore_excused)
  const status = calcSubjectStatus(remaining)

  return {
    subject,
    total_lessons: subjectLessons.length,
    past_lessons: pastLessons.length,
    attended_count: attendedCount,
    absent_count: absentCount,
    remaining_absences: remaining,
    attendance_rate: attendanceRate,
    status,
  }
}
