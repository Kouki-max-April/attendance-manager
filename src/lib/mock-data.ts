import type { Subject, Lesson, AttendanceRecord } from './types'
import { PERIODS } from './periods'

// ─── 科目一覧 ────────────────────────────────────────────────
export const mockSubjects: Subject[] = [
  { id: 'ds',  user_id: 'u1', name: '医療情報科学・データサイエンス3', requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#6366f1', created_at: '', updated_at: '' },
  { id: 'ph',  user_id: 'u1', name: '薬物・放射線と生体',             requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#ef4444', created_at: '', updated_at: '' },
  { id: 'pa',  user_id: 'u1', name: '病因と病態',                     requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#f97316', created_at: '', updated_at: '' },
  { id: 'en',  user_id: 'u1', name: '英語3',                          requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#84cc16', created_at: '', updated_at: '' },
  { id: 'bh',  user_id: 'u1', name: '行動科学3',                      requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#14b8a6', created_at: '', updated_at: '' },
  { id: 's1',  user_id: 'u1', name: '社会医学1',                      requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#3b82f6', created_at: '', updated_at: '' },
  { id: 's2',  user_id: 'u1', name: '社会医学2',                      requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#0ea5e9', created_at: '', updated_at: '' },
  { id: 'ip',  user_id: 'u1', name: '国際保健',                       requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#10b981', created_at: '', updated_at: '' },
  { id: 'me',  user_id: 'u1', name: '医学工学',                       requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#64748b', created_at: '', updated_at: '' },
  { id: 'sy',  user_id: 'u1', name: '症候学',                         requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#a855f7', created_at: '', updated_at: '' },
  { id: 'in',  user_id: 'u1', name: '感染症',                         requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#ec4899', created_at: '', updated_at: '' },
  { id: 'cm',  user_id: 'u1', name: '臨床医学概論',                   requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#f59e0b', created_at: '', updated_at: '' },
  { id: 'pr',  user_id: 'u1', name: '医学実地演習3',                  requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#78716c', created_at: '', updated_at: '' },
  { id: 'ca',  user_id: 'u1', name: '循環器',                         requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#e11d48', created_at: '', updated_at: '' },
  { id: 'ne',  user_id: 'u1', name: '神経',                           requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#7c3aed', created_at: '', updated_at: '' },
  { id: 're',  user_id: 'u1', name: '呼吸器',                         requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#0891b2', created_at: '', updated_at: '' },
  { id: 'gi',  user_id: 'u1', name: '消化器',                         requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#65a30d', created_at: '', updated_at: '' },
  { id: 'rs',  user_id: 'u1', name: '科学的探究3',                    requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#d97706', created_at: '', updated_at: '' },
  { id: 'kn',  user_id: 'u1', name: '腎・泌尿器',                     requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#be185d', created_at: '', updated_at: '' },
  { id: 'ed',  user_id: 'u1', name: '内分泌・代謝',                   requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#0f766e', created_at: '', updated_at: '' },
  { id: 'bl',  user_id: 'u1', name: '血液',                           requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#b91c1c', created_at: '', updated_at: '' },
  { id: 'al',  user_id: 'u1', name: 'アレルギー・膠原病',             requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#c026d3', created_at: '', updated_at: '' },
  { id: 'on',  user_id: 'u1', name: '腫瘍',                           requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#1d4ed8', created_at: '', updated_at: '' },
  { id: 'ra',  user_id: 'u1', name: '放射線',                         requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#475569', created_at: '', updated_at: '' },
]

// ─── スケジュール定義 ─────────────────────────────────────────
// [日付, 1限, 2限, 3限, 4限, 5限, 6限]  null = 授業なし
type Row = [string, ...Array<string | null>]

const N = null

const SCHEDULE: Row[] = [
  // ══════════ Ⅰ学期 ══════════
  ['2026-04-10', N,    N,    'ds', 'ph', 'ph', N   ],
  ['2026-04-13', N,    'pa', 'pa', 'en', 'en', N   ],
  ['2026-04-14', N,    's1', 's1', 'bh', N,    N   ],
  ['2026-04-15', 'pa', 'pa', 'pa', 's2', 's2', N   ],
  ['2026-04-16', 's2', 's2', 's2', 'bh', 's1', N   ],
  ['2026-04-17', N,    's1', 'ds', N,    N,    N   ],
  ['2026-04-20', 'pa', 'pa', 'pa', 'en', 'en', N   ],
  ['2026-04-21', N,    's1', 's1', 'ph', 'ph', 'ph'],
  ['2026-04-22', 'bh', 'bh', 'bh', 's2', 's2', N   ],
  ['2026-04-23', 's2', 's2', 's2', 's1', 's1', N   ],
  ['2026-04-24', 's1', 'pa', 'ds', 'ph', 'ph', 'ph'],
  ['2026-04-27', 'pa', 's1', 'pa', 'en', 'en', N   ],
  ['2026-04-28', 's1', 's2', 's1', 'ph', 'ph', N   ],
  ['2026-04-30', 's2', 's1', 's2', 'ph', 'ph', N   ],
  ['2026-05-01', N,    N,    'ds', 'ph', 'ph', N   ],
  ['2026-05-07', 's2', 's2', 'pa', 'pa', 'ds', N   ],
  ['2026-05-08', 's1', 's1', 's1', 'ph', 'ph', 'ph'],
  ['2026-05-11', N,    'ip', 'ip', 'en', 'en', N   ],
  ['2026-05-12', N,    'me', 'me', N,    N,    N   ],
  ['2026-05-13', N,    'pa', 'pa', 's2', 's2', 's2'],
  ['2026-05-14', 's2', 's2', 's2', 's1', 's1', N   ],
  ['2026-05-15', 'ph', 'ph', 'ph', 'ph', 'ph', N   ],
  ['2026-05-18', 'pa', 'ip', 'ip', 'en', 'en', N   ],
  ['2026-05-19', N,    'me', 'me', N,    N,    N   ],
  ['2026-05-20', 'pa', 'pa', 'pa', 's2', 's2', 's2'],
  ['2026-05-21', 's2', 's2', 's2', 's1', 's1', N   ],
  ['2026-05-22', 'ph', 'ph', 'ph', 'ph', 'ph', N   ],
  ['2026-05-25', N,    'pa', 'pa', 'en', 'en', N   ],
  ['2026-05-26', N,    N,    'me', N,    N,    N   ],
  ['2026-05-27', N,    'sy', 'sy', N,    'ip', N   ],
  ['2026-05-28', 'sy', 'sy', 'sy', 'sy', 'sy', 's1'],
  ['2026-05-29', N,    'in', 'in', 's2', 's2', N   ],
  ['2026-06-01', 'sy', 'sy', 'sy', N,    'en', 'en'],
  ['2026-06-02', N,    'in', 'in', N,    's1', 's1'],
  ['2026-06-03', 'sy', 'sy', 'sy', N,    'in', 'in'],
  ['2026-06-04', N,    'in', 'in', N,    'in', 'in'],
  ['2026-06-05', 'ph', 'ph', 'ph', 'ph', 'ph', N   ],
  ['2026-06-08', 'sy', 'sy', 'sy', N,    's1', 's1'],
  ['2026-06-09', N,    'cm', 'cm', 'in', 'in', 's1'],
  ['2026-06-10', N,    'in', 'in', 's1', 's1', N   ],
  ['2026-06-11', 'sy', 'cm', 'cm', 'cm', 'cm', 'sy'],
  ['2026-06-12', 'ph', 'ph', 'ph', 'ph', 'ph', N   ],
  ['2026-06-15', N,    'in', 'in', 's1', 's1', 's1'],
  ['2026-06-16', 'sy', 'sy', 'sy', N,    'cm', 'cm'],
  ['2026-06-17', 's1', 'sy', 'sy', N,    'sy', 'sy'],
  ['2026-06-18', 'sy', 'sy', 'sy', N,    's1', 's1'],
  ['2026-06-19', 'ph', 'ph', 'ph', 'ph', 'ph', N   ],
  ['2026-06-22', 'pr', 'pr', 'pr', 'cm', 'cm', N   ],
  ['2026-06-23', N,    'sy', 'sy', N,    's1', 's1'],
  ['2026-06-24', N,    'in', 'in', N,    'sy', 'sy'],
  ['2026-06-25', 'sy', 'sy', 'sy', 'pr', 'pr', N   ],
  ['2026-06-26', N,    N,    N,    N,    'pr', 'pr'],
  ['2026-06-29', N,    'sy', 'sy', N,    'sy', 'sy'],

  // ══════════ Ⅱ学期 ══════════
  ['2026-08-31', 'ca', 'ca', 'ca', 'ne', 'ne', N   ],
  ['2026-09-01', 'ne', 'ne', 'ne', 'ca', 'ca', N   ],
  ['2026-09-02', 're', 're', 're', 'gi', 'gi', 'gi'],
  ['2026-09-03', 'gi', 'gi', 'gi', 're', 're', 're'],
  ['2026-09-04', 'ca', 'ca', 'ca', 'ne', 'ne', N   ],
  ['2026-09-07', 'ne', 'ne', 'ne', 'ca', 'ca', N   ],
  ['2026-09-08', 're', 're', 're', 'gi', 'gi', 'gi'],
  ['2026-09-09', 'gi', 'gi', 'gi', 're', 're', 're'],
  ['2026-09-10', 'ca', 'ca', 'ca', 'ne', 'ne', N   ],
  ['2026-09-11', 'ne', 'ne', 'ne', 'ca', 'ca', N   ],
  ['2026-09-14', 're', 're', 're', 'gi', 'gi', 'gi'],
  ['2026-09-15', 'gi', 'gi', 'gi', 're', 're', N   ],
  ['2026-09-16', 'ca', 'ca', 'ca', 'ne', 'ne', N   ],
  ['2026-09-17', 'ne', 'ne', 'ne', 'ca', 'ca', N   ],
  ['2026-09-18', 're', 're', 're', 'gi', 'gi', N   ],
  ['2026-09-24', 'gi', 'gi', 'gi', 're', 're', N   ],
  ['2026-09-25', 'ca', 'ca', 'ca', 'ne', 'ne', N   ],
  ['2026-09-28', 'ne', 'ne', 'ne', 'ca', 'ca', N   ],
  ['2026-09-29', 're', 're', 're', 'gi', 'gi', 'gi'],
  ['2026-09-30', 'gi', 'gi', 'gi', 'ca', 'ca', N   ],
  ['2026-10-01', 'ca', 'ca', 'ca', 'ne', 'ne', N   ],
  ['2026-10-02', 'ne', 'ne', 'ne', 'ca', 'ca', N   ],
  ['2026-10-05', 're', 're', 're', 'gi', 'gi', 'gi'],
  ['2026-10-06', 'gi', 'gi', 'gi', 're', 're', N   ],
  ['2026-10-07', 'ca', 'ca', 'ca', 'ne', 'ne', N   ],
  ['2026-10-08', 'ne', 'ne', 'ne', 'ca', 'ca', N   ],
  ['2026-10-09', 're', 're', 're', 'gi', 'gi', N   ],
  ['2026-10-13', 'gi', 'gi', 'gi', 'ca', 'ca', N   ],
  ['2026-10-14', 'ca', 'ca', 'ca', 'ne', 'ne', N   ],
  // 科学的探究3 (10/21〜12/22、休日除く) は下の関数で生成

  // ══════════ Ⅲ学期 ══════════
  ['2027-01-05', 'kn', 'kn', 'kn', 'ed', 'ed', N   ],
  ['2027-01-06', 'bl', 'bl', 'bl', 'al', 'al', N   ],
  ['2027-01-07', 'ed', 'ed', 'ed', 'kn', 'kn', N   ],
  ['2027-01-08', 'al', 'al', 'al', 'bl', 'bl', N   ],
  ['2027-01-12', 'kn', 'kn', 'kn', 'ed', 'ed', N   ],
  ['2027-01-13', 'bl', 'bl', 'bl', 'al', 'al', N   ],
  ['2027-01-14', 'on', 'on', 'on', 'ra', 'ra', N   ],
  ['2027-01-15', N,    'ed', 'ed', 'kn', 'kn', 'kn'],
  ['2027-01-18', 'al', 'al', 'al', 'bl', 'bl', N   ],
  ['2027-01-19', 'kn', 'kn', 'kn', 'ed', 'ed', N   ],
  ['2027-01-20', 'bl', 'bl', 'bl', 'al', 'al', N   ],
  ['2027-01-21', 'ra', 'ra', 'ra', 'on', 'on', 'on'],
  ['2027-01-22', 'ed', 'ed', 'ed', 'kn', 'kn', 'kn'],
  ['2027-01-25', 'al', 'al', 'al', 'bl', 'bl', 'ed'],
  ['2027-01-26', 'kn', 'kn', 'kn', 'ed', 'ed', 'ed'],
  ['2027-01-27', 'on', 'on', 'kn', 'kn', 'kn', 'kn'],
  ['2027-01-28', 'ed', 'ed', 'ed', 'kn', 'kn', 'kn'],
]

// ─── 科学的探究3 の日程を生成 ───────────────────────────────
function researchSchedule(): Row[] {
  const holidays = new Set([
    '2026-10-29', '2026-10-30', '2026-10-31',
    '2026-11-01', '2026-11-02', '2026-11-03',
    '2026-11-23',
  ])
  const rows: Row[] = []
  const start = new Date(2026, 9, 21)  // 10/21
  const end   = new Date(2026, 11, 22) // 12/22
  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay()
    if (dow === 0 || dow === 6) continue
    const str = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    if (holidays.has(str)) continue
    rows.push([str, 'rs', 'rs', 'rs', 'rs', 'rs', 'rs'])
  }
  return rows
}

// ─── Lesson オブジェクトを生成 ───────────────────────────────
function buildLessons(): Lesson[] {
  const allRows = [...SCHEDULE, ...researchSchedule()]
  allRows.sort((a, b) => a[0].localeCompare(b[0]))

  const lessons: Lesson[] = []
  let idx = 0
  for (const [dateStr, ...periods] of allRows) {
    const [y, m, d] = dateStr.split('-').map(Number)
    periods.forEach((subjectId, i) => {
      if (!subjectId) return
      const p = PERIODS[i]
      const start = new Date(y, m - 1, d, p.startHour, p.startMin)
      const end   = new Date(y, m - 1, d, p.endHour,   p.endMin)
      lessons.push({
        id: `l${String(++idx).padStart(4, '0')}`,
        user_id: 'u1',
        subject_id: subjectId,
        scheduled_at: start.toISOString(),
        end_at: end.toISOString(),
        created_at: start.toISOString(),
        updated_at: start.toISOString(),
      })
    })
  }
  return lessons
}

export const mockLessons: Lesson[] = buildLessons()
export const mockRecords: AttendanceRecord[] = []
