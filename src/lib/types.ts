export type RequirementType = 'TWO_THIRDS' | 'FULL' | 'CUSTOM' | 'NONE'
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'TARDINESS' | 'EXCUSED'
export type SubjectStatus = 'SAFE' | 'WARNING' | 'DANGER' | 'NONE'

export interface Subject {
  id: string
  user_id: string
  name: string
  requirement_type: RequirementType
  custom_threshold?: number
  count_tardiness_as: number
  ignore_excused: boolean
  color?: string
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: string
  user_id: string
  subject_id: string
  scheduled_at: string
  end_at?: string
  location?: string
  notes?: string
  recurrence_group_id?: string
  display_color?: string
  created_at: string
  updated_at: string
  subject?: Subject
  attendance_record?: AttendanceRecord
}

export interface AttendanceRecord {
  id: string
  user_id: string
  lesson_id: string
  subject_id: string
  status: AttendanceStatus
  memo?: string
  recorded_at: string
  created_at: string
  updated_at: string
}

export interface SubjectStats {
  subject: Subject
  total_lessons: number
  past_lessons: number
  attended_count: number
  absent_count: number
  remaining_absences: number
  attendance_rate: number
  status: SubjectStatus
}

// PDF解析結果
export interface ParsedLesson {
  subject_name: string
  date: string // YYYY-MM-DD
  start_time: string // HH:mm
  end_time: string // HH:mm
  location?: string
  period?: string
  notes?: string
}
