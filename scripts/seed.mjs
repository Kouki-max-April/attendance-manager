import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// .env.local を読み込む
const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dir, '../.env.local')
const env = Object.fromEntries(
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(l => l && !l.startsWith('#'))
    .map(l => l.split('=').map((p, i) => i === 0 ? p.trim() : l.slice(l.indexOf('=') + 1).trim()))
)

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// ── 科目一覧 ──────────────────────────────────────────────────────
const subjects = [
  { id: 'ds',  name: '医療情報科学・データサイエンス3', requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#6366f1' },
  { id: 'ph',  name: '薬物・放射線と生体',             requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#ef4444' },
  { id: 'pa',  name: '病因と病態',                     requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#f97316' },
  { id: 'en',  name: '英語3',                          requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#84cc16' },
  { id: 'bh',  name: '行動科学3',                      requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#14b8a6' },
  { id: 's1',  name: '社会医学1',                      requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#3b82f6' },
  { id: 's2',  name: '社会医学2',                      requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#0ea5e9' },
  { id: 'ip',  name: '国際保健',                       requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#10b981' },
  { id: 'me',  name: '医学工学',                       requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#64748b' },
  { id: 'sy',  name: '症候学',                         requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#a855f7' },
  { id: 'in',  name: '感染症',                         requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#ec4899' },
  { id: 'cm',  name: '臨床医学概論',                   requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#f59e0b' },
  { id: 'pr',  name: '医学実地演習3',                  requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#78716c' },
  { id: 'ca',  name: '循環器',                         requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#e11d48' },
  { id: 'ne',  name: '神経',                           requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#7c3aed' },
  { id: 're',  name: '呼吸器',                         requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#0891b2' },
  { id: 'gi',  name: '消化器',                         requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#65a30d' },
  { id: 'rs',  name: '科学的探究3',                    requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#d97706' },
  { id: 'kn',  name: '腎・泌尿器',                     requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#be185d' },
  { id: 'ed',  name: '内分泌・代謝',                   requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#0f766e' },
  { id: 'bl',  name: '血液',                           requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#b91c1c' },
  { id: 'al',  name: 'アレルギー・膠原病',             requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#c026d3' },
  { id: 'on',  name: '腫瘍',                           requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#1d4ed8' },
  { id: 'ra',  name: '放射線',                         requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#475569' },
]

// ── 時限 → 開始時刻 ──────────────────────────────────────────────
const PERIOD_TIMES = [
  { h: 8,  m: 40 },
  { h: 10, m: 0  },
  { h: 11, m: 20 },
  { h: 13, m: 20 },
  { h: 14, m: 40 },
  { h: 16, m: 0  },
]

const PERIOD_END_TIMES = [
  { h: 9,  m: 50 },
  { h: 11, m: 10 },
  { h: 12, m: 30 },
  { h: 14, m: 30 },
  { h: 15, m: 50 },
  { h: 17, m: 10 },
]

function toISO(date, h, m) {
  return `${date}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00+09:00`
}

// ── スケジュール ──────────────────────────────────────────────────
const N = null
const SCHEDULE = [
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
  ['2026-05-15', 's1', 'pa', 'ds', 'ph', 'ph', 'ph'],
  ['2026-05-18', 'pa', 'pa', 'pa', 'en', 'en', N   ],
  ['2026-05-19', N,    's1', 's1', 'ph', 'ph', 'ph'],
  ['2026-05-20', 'bh', 'bh', 'bh', 's2', 's2', N   ],
  ['2026-05-21', 's2', 's2', 's2', 's1', 's1', N   ],
  ['2026-05-22', 's1', 'pa', 'ds', 'ph', 'ph', 'ph'],
  ['2026-05-25', 'pa', 's1', 'pa', 'en', 'en', N   ],
  ['2026-05-26', 's1', 's2', 's1', 'ip', 'ip', N   ],
  ['2026-05-27', N,    'me', 'me', 's2', 's2', N   ],
  ['2026-05-28', 's2', 's1', 's2', 'ph', 'ph', N   ],
  ['2026-05-29', N,    N,    'ds', 'ph', 'ph', N   ],
  ['2026-06-01', 's2', 's2', 'pa', 'pa', 'sy', 'sy'],
  ['2026-06-02', 's1', 's1', 's1', 'ph', 'ph', 'ph'],
  ['2026-06-03', 'bh', 'bh', 'bh', 'sy', 'sy', N   ],
  ['2026-06-04', 'sy', 'sy', 'sy', 's1', 's1', N   ],
  ['2026-06-05', 's1', 'pa', 'ds', 'ph', 'ph', 'ph'],
  ['2026-06-08', 'pa', 'pa', 'pa', 'en', 'en', N   ],
  ['2026-06-09', N,    's1', 's1', 'in', 'in', 'in'],
  ['2026-06-10', 'in', 'in', 'in', 's2', 's2', N   ],
  ['2026-06-11', 's2', 's2', 's2', 's1', 's1', N   ],
  ['2026-06-12', 's1', 'pa', 'ds', 'ph', 'ph', 'ph'],
  ['2026-06-15', 'pa', 's1', 'pa', 'en', 'en', N   ],
  ['2026-06-16', 's1', 's2', 's1', 'in', 'in', N   ],
  ['2026-06-17', 'in', 'in', 'bh', 's2', 's2', N   ],
  ['2026-06-18', 's2', 's1', 's2', 'ph', 'ph', N   ],
  ['2026-06-19', N,    'cm', 'cm', 'ph', 'ph', N   ],
  ['2026-06-22', 's2', 's2', 'pa', 'pa', 'cm', N   ],
  ['2026-06-23', 's1', 's1', 's1', 'ph', 'ph', 'ph'],
  ['2026-06-24', 'cm', 'cm', 'cm', 's2', 's2', N   ],
  ['2026-06-25', 's2', 's2', 's2', 's1', 's1', N   ],
  ['2026-06-26', 's1', 'pa', 'ds', 'pr', 'pr', 'pr'],
  ['2026-06-29', 'pa', 'pa', 'pa', 'en', 'en', N   ],
  ['2026-06-30', N,    's1', 's1', 'pr', 'pr', 'pr'],
  ['2026-07-01', 'pr', 'pr', 'pr', 's2', 's2', N   ],
  ['2026-07-02', 's2', 's2', 's2', 's1', 's1', N   ],
  ['2026-07-03', 's1', 'pa', 'ds', 'pr', 'pr', 'pr'],
  // ══ Ⅱ学期 ══
  ['2026-08-31', N,    N,    'ca', 'ca', 'ca', N   ],
  ['2026-09-01', 'ca', 'ca', 'ca', 'ne', 'ne', N   ],
  ['2026-09-02', 'ne', 'ne', 'ne', 'ca', 'ca', N   ],
  ['2026-09-03', 'ca', 'ca', 'ca', 'ne', 'ne', N   ],
  ['2026-09-04', 'ne', 'ne', 'ne', 'ca', 'ca', N   ],
  ['2026-09-07', 'ca', 'ca', 'ca', 'ne', 'ne', N   ],
  ['2026-09-08', 'ne', 'ne', 're', 're', 're', N   ],
  ['2026-09-09', 're', 're', 're', 'ca', 'ca', N   ],
  ['2026-09-10', 'ca', 'ca', 'ca', 're', 're', N   ],
  ['2026-09-11', 're', 're', 're', 'ne', 'ne', N   ],
  ['2026-09-14', 'ne', 'ne', 'ne', 're', 're', N   ],
  ['2026-09-15', 're', 're', 'gi', 'gi', 'gi', N   ],
  ['2026-09-16', 'gi', 'gi', 'gi', 're', 're', N   ],
  ['2026-09-17', 're', 're', 're', 'gi', 'gi', N   ],
  ['2026-09-18', 'gi', 'gi', 'gi', 're', 're', N   ],
  ['2026-09-24', 're', 're', 're', 'gi', 'gi', N   ],
  ['2026-09-25', 'gi', 'gi', 'gi', 're', 're', N   ],
  ['2026-09-28', 're', 're', 're', 'gi', 'gi', N   ],
  ['2026-09-29', 'gi', 'gi', 'gi', 'ca', 'ca', N   ],
  ['2026-09-30', 'ca', 'ca', 'ca', 'gi', 'gi', N   ],
  ['2026-10-01', 'gi', 'gi', 'gi', 'ca', 'ca', N   ],
  ['2026-10-02', 'ca', 'ca', 'ca', 'gi', 'gi', N   ],
  ['2026-10-05', 'gi', 'gi', 'gi', 'ca', 'ca', N   ],
  ['2026-10-06', 'ca', 'ca', 'ca', 'ne', 'ne', N   ],
  ['2026-10-07', 'ne', 'ne', 'ne', 'ca', 'ca', N   ],
  ['2026-10-08', 'ca', 'ca', 'ca', 'ne', 'ne', N   ],
  ['2026-10-09', 'ne', 'ne', 'ne', 'ca', 'ca', N   ],
  // ══ Ⅲ学期 ══
  ['2027-01-07', N,    N,    'kn', 'kn', 'kn', N   ],
  ['2027-01-08', 'kn', 'kn', 'kn', 'ed', 'ed', N   ],
  ['2027-01-12', 'ed', 'ed', 'ed', 'kn', 'kn', N   ],
  ['2027-01-13', 'kn', 'kn', 'kn', 'ed', 'ed', N   ],
  ['2027-01-14', 'ed', 'ed', 'ed', 'bl', 'bl', N   ],
  ['2027-01-15', 'bl', 'bl', 'bl', 'ed', 'ed', N   ],
  ['2027-01-18', 'ed', 'ed', 'ed', 'bl', 'bl', N   ],
  ['2027-01-19', 'bl', 'bl', 'bl', 'al', 'al', N   ],
  ['2027-01-20', 'al', 'al', 'al', 'bl', 'bl', N   ],
  ['2027-01-21', 'bl', 'bl', 'bl', 'al', 'al', N   ],
  ['2027-01-22', 'al', 'al', 'al', 'on', 'on', N   ],
  ['2027-01-25', 'on', 'on', 'on', 'al', 'al', N   ],
  ['2027-01-26', 'al', 'al', 'al', 'on', 'on', N   ],
  ['2027-01-27', 'on', 'on', 'on', 'ra', 'ra', N   ],
  ['2027-01-28', 'ra', 'ra', 'ra', 'on', 'on', N   ],
  ['2027-01-29', 'on', 'on', 'on', 'ra', 'ra', N   ],
  ['2027-02-01', 'ra', 'ra', 'ra', 'on', 'on', N   ],
  ['2027-02-02', 'on', 'on', 'on', 'ra', 'ra', N   ],
  ['2027-02-03', 'ra', 'ra', 'ra', 'kn', 'kn', N   ],
  ['2027-02-04', 'kn', 'kn', 'kn', 'ed', 'ed', N   ],
  ['2027-02-05', 'ed', 'ed', 'ed', 'kn', 'kn', N   ],
]

// 科学的探究3（金曜 3-4限、通年）
function addResearchLessons(lessons) {
  const start = new Date('2026-04-10')
  const end   = new Date('2027-02-05')
  const holidays = new Set([
    '2026-04-29','2026-05-03','2026-05-04','2026-05-05',
    '2026-07-20','2026-08-11','2026-09-21','2026-09-22','2026-09-23',
    '2026-10-12','2026-11-03','2026-11-23','2027-01-01',
  ])
  let d = new Date(start)
  let idx = 0
  while (d <= end) {
    if (d.getDay() === 5) {
      const ds = d.toISOString().slice(0,10)
      if (!holidays.has(ds)) {
        ;[2,3].forEach((p) => {
          lessons.push({
            id: `rs_${ds}_${p}`,
            subject_id: 'rs',
            scheduled_at: toISO(ds, PERIOD_TIMES[p].h, PERIOD_TIMES[p].m),
            end_at: toISO(ds, PERIOD_END_TIMES[p].h, PERIOD_END_TIMES[p].m),
          })
        })
        idx++
      }
    }
    d.setDate(d.getDate()+1)
  }
}

// レッスン生成
function buildLessons() {
  const lessons = []
  for (const [date, ...periods] of SCHEDULE) {
    periods.forEach((subjectId, pi) => {
      if (!subjectId) return
      lessons.push({
        id: `${subjectId}_${date}_${pi+1}`,
        subject_id: subjectId,
        scheduled_at: toISO(date, PERIOD_TIMES[pi].h, PERIOD_TIMES[pi].m),
        end_at: toISO(date, PERIOD_END_TIMES[pi].h, PERIOD_END_TIMES[pi].m),
      })
    })
  }
  addResearchLessons(lessons)
  return lessons
}

// ── メイン ────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 シード開始...')

  // subjects
  console.log(`  科目 ${subjects.length}件 を挿入...`)
  const { error: subErr } = await supabase
    .from('subjects')
    .upsert(subjects, { onConflict: 'id' })
  if (subErr) { console.error('subjects error:', subErr); process.exit(1) }

  // lessons
  const lessons = buildLessons()
  console.log(`  授業 ${lessons.length}件 を挿入...`)
  // 100件ずつバッチ挿入
  for (let i = 0; i < lessons.length; i += 100) {
    const batch = lessons.slice(i, i + 100)
    const { error } = await supabase
      .from('lessons')
      .upsert(batch, { onConflict: 'id' })
    if (error) { console.error('lessons error:', error); process.exit(1) }
    process.stdout.write(`\r  授業 ${Math.min(i+100, lessons.length)}/${lessons.length} 件完了`)
  }
  console.log('\n✅ シード完了!')
}

seed()
