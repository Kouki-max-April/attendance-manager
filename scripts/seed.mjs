import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dir, '../.env.local')
const env = Object.fromEntries(
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(l => l && !l.startsWith('#'))
    .map(l => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

// ── 科目 ────────────────────────────────────────────────────────
const subjects = [
  { id: 'ds',  name: '医療情報科学・データサイエンス3',         requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#6366f1' },
  { id: 'ph',  name: '薬物・放射線と生体',                     requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#ef4444' },
  { id: 'pa',  name: '病因と病態',                             requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#f97316' },
  { id: 'en',  name: '英語3',                                  requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#84cc16' },
  { id: 'bh',  name: '行動科学3',                              requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#14b8a6' },
  { id: 's1',  name: '社会医学1',                              requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#3b82f6' },
  { id: 's2',  name: '社会医学2',                              requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#0ea5e9' },
  { id: 'ip',  name: '国際保健',                               requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#10b981' },
  { id: 'me',  name: '医学工学',                               requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#64748b' },
  { id: 'mp',  name: '医学統合プログラム３・生体システムの概念', requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#8b5cf6' },
  { id: 'sy',  name: '症候学',                                 requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#a855f7' },
  { id: 'in',  name: '感染症',                                 requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#ec4899' },
  { id: 'cm',  name: '臨床医学概論',                           requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#f59e0b' },
  { id: 'pr',  name: '医学実地演習3',                          requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#78716c' },
  { id: 'ca',  name: '循環器',                                 requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#e11d48' },
  { id: 'ne',  name: '神経',                                   requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#7c3aed' },
  { id: 're',  name: '呼吸器',                                 requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#0891b2' },
  { id: 'gi',  name: '消化器',                                 requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#65a30d' },
  { id: 'rs',  name: '科学的探究3',                            requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#d97706' },
  { id: 'kn',  name: '腎・泌尿器',                             requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#be185d' },
  { id: 'ed',  name: '内分泌・代謝',                           requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#0f766e' },
  { id: 'bl',  name: '血液',                                   requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#b91c1c' },
  { id: 'al',  name: 'アレルギー・膠原病',                     requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#c026d3' },
  { id: 'on',  name: '腫瘍',                                   requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#1d4ed8' },
  { id: 'ra',  name: '放射線',                                 requirement_type: 'TWO_THIRDS', count_tardiness_as: 0.5, ignore_excused: true, color: '#475569' },
]

// ── 時限 ─────────────────────────────────────────────────────────
const PT = [
  { h: 8,  m: 40 }, { h: 10, m: 0  }, { h: 11, m: 20 },
  { h: 13, m: 20 }, { h: 14, m: 40 }, { h: 16, m: 0  },
]
const PE = [
  { h: 9,  m: 50 }, { h: 11, m: 10 }, { h: 12, m: 30 },
  { h: 14, m: 30 }, { h: 15, m: 50 }, { h: 17, m: 10 },
]

const toISO = (date, h, m) =>
  `${date}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00+09:00`

// ── スケジュール [日付, 1限〜6限] ────────────────────────────────
// CSV: 令和8年度 第3学年時間割 v3.csv より正確に転記
const N = null
const SCHEDULE = [
  // ══ Ⅰ学期 ══
  ['2026-04-10', N,    N,    'ds', 'ph', 'ph', N   ],
  ['2026-04-13', 'pa', 'pa', 'pa', 'en', 'en', N   ], // 6限=オリエンテーション(除外)
  ['2026-04-14', N,    's1', 's1', 'bh', 'ds', N   ],
  ['2026-04-15', 'pa', 'pa', 'pa', 's2', 's2', N   ],
  ['2026-04-16', 's2', 's2', 's2', 'bh', 's1', N   ],
  ['2026-04-17', N,    's1', 'ds', N,    N,    N   ],
  ['2026-04-20', 'pa', 'pa', 'pa', 'en', 'en', N   ],
  ['2026-04-21', N,    's1', 's1', 'ph', 'ph', 'ph'],
  ['2026-04-22', 'bh', 'bh', 'bh', 's2', 's2', N   ],
  ['2026-04-23', 's2', 's2', 's2', 's1', 's1', N   ],
  ['2026-04-24', N,    's1', 'ds', 'ph', 'ph', 'ph'],
  ['2026-04-27', 'pa', 'pa', 'pa', 'en', 'en', N   ],
  ['2026-04-28', N,    's1', 's1', 'ph', 'ph', N   ],
  // 4/29 昭和の日
  ['2026-04-30', 's2', 's2', 's2', 'ph', 'ds', N   ],
  ['2026-05-01', N,    's1', 'ds', 'ph', 'ph', N   ],
  // 5/4 みどりの日 / 5/5 こどもの日 / 5/6 振替休日
  ['2026-05-07', N,    's2', 's2', 'pa', 'ds', N   ],
  ['2026-05-08', N,    's1', N,    'ph', 'ph', N   ],
  ['2026-05-11', N,    'ip', 'ip', 'en', 'en', N   ],
  ['2026-05-12', N,    'me', 'me', 'mp', 'mp', 'mp'],
  ['2026-05-13', N,    'pa', 'pa', 's2', 's2', 's2'],
  ['2026-05-14', 's2', 's2', 's2', 's1', 's1', N   ],
  ['2026-05-15', 'ph', 'ph', 'ph', 'ph', 'ph', N   ],
  ['2026-05-18', 'pa', 'ip', 'ip', 'en', 'en', N   ],
  ['2026-05-19', N,    'me', 'me', 'mp', 'mp', 'mp'],
  ['2026-05-20', 'pa', 'pa', 'pa', 's2', 's2', 's2'],
  ['2026-05-21', 's2', 's2', 's2', 's1', 's1', N   ],
  ['2026-05-22', 'ph', 'ph', 'ph', 'ph', 'ph', N   ],
  ['2026-05-25', N,    'pa', 'pa', 'en', 'en', 's1'],
  ['2026-05-26', N,    N,    'me', 'mp', 'mp', 'mp'],
  ['2026-05-27', N,    'sy', 'sy', 'ip', N,    N   ],
  ['2026-05-28', 'sy', 'sy', 'sy', 'sy', 'sy', 'sy'],
  ['2026-05-29', N,    'in', 'in', 's2', 's2', 's2'],
  ['2026-06-01', 'sy', 'sy', 'sy', 'en', 'en', N   ],
  ['2026-06-02', N,    'in', 'in', 's1', 's1', 's1'],
  ['2026-06-03', 'sy', 'sy', 'sy', 'in', 'in', N   ],
  ['2026-06-04', N,    'in', 'in', 'in', 'in', N   ],
  ['2026-06-05', 'ph', 'ph', 'ph', 'ph', 'ph', N   ],
  ['2026-06-08', 'sy', 'sy', 'sy', 's1', 's1', 's1'],
  ['2026-06-09', N,    'cm', 'cm', 'in', 'in', N   ],
  ['2026-06-10', N,    'in', 'in', 's1', 's1', 's1'],
  ['2026-06-11', 'sy', 'cm', 'cm', 'cm', 'cm', 'sy'],
  ['2026-06-12', 'ph', 'ph', 'ph', 'ph', 'ph', N   ],
  ['2026-06-15', N,    'in', 'in', 's1', 's1', 's1'],
  ['2026-06-16', 'sy', 'sy', 'sy', 'cm', 'cm', N   ],
  ['2026-06-17', 's1', 'sy', 'sy', 'sy', 'sy', 'sy'],
  ['2026-06-18', 'sy', 'sy', 'sy', 's1', 's1', 's1'],
  ['2026-06-19', 'ph', 'ph', 'ph', 'ph', 'ph', N   ],
  ['2026-06-22', 'pr', 'pr', 'pr', 'cm', 'cm', N   ],
  ['2026-06-23', N,    'sy', 'sy', 's1', 's1', 's1'],
  ['2026-06-24', N,    'in', 'in', 'sy', 'sy', 'sy'],
  ['2026-06-25', 'sy', 'sy', 'sy', 'pr', 'pr', N   ],
  ['2026-06-26', N,    N,    N,    'pr', 'pr', N   ],
  ['2026-06-29', N,    'sy', 'sy', 'sy', 'sy', N   ],

  // ══ Ⅱ学期 ══
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
  // 9/21 敬老の日 / 9/22 国民の休日 / 9/23 秋分の日
  ['2026-09-24', 'gi', 'gi', 'gi', 'mp', 'mp', 'mp'],
  ['2026-09-25', 'ca', 'ca', 'ca', 'gi', 'gi', N   ],
  ['2026-09-28', 'ne', 'ne', 'ne', 're', 're', N   ],
  ['2026-09-29', 're', 're', 're', 'gi', 'gi', N   ],
  ['2026-09-30', 'gi', 'gi', 'gi', 'ca', 'ca', N   ],
  ['2026-10-01', 'ca', 'ca', 'ca', 'mp', 'mp', 'mp'],
  ['2026-10-02', 'ne', 'ne', 'ne', 'ca', 'ca', N   ],
  ['2026-10-05', 're', 're', 're', 'ne', 'ne', N   ],
  ['2026-10-06', 'gi', 'gi', 'gi', 'ca', 'ca', N   ],
  ['2026-10-07', 'ca', 'ca', 'ca', 'gi', 'gi', N   ],
  // 10/08-10/14 授業なし（CSV上空欄）/ 10/12 スポーツの日
  // 10/15-10/20 試験期間
  // 10/21-12/22 科学的探究3（buildResearchLessons で生成）

  // ══ Ⅲ学期（1月〜）══
  ['2027-01-05', 'kn', 'kn', 'kn', 'ed', 'ed', N   ],
  ['2027-01-06', 'bl', 'bl', 'bl', 'al', 'al', N   ],
  ['2027-01-07', 'ed', 'ed', 'ed', 'kn', 'kn', 'kn'],
  ['2027-01-08', 'al', 'al', 'al', 'bl', 'bl', N   ],
  // 1/11 成人の日
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
  ['2027-01-29', N,    N,    N,    'mp', 'mp', 'mp'],
  ['2027-02-01', N,    N,    N,    'mp', 'mp', 'mp'],
  // 2/02 入学試験のため休講
  ['2027-02-03', N,    N,    N,    'mp', 'mp', 'mp'],
  ['2027-02-04', N,    N,    N,    'mp', 'mp', 'mp'],
  ['2027-02-05', N,    N,    N,    'mp', 'mp', 'mp'],
  ['2027-02-08', N,    N,    N,    'mp', 'mp', 'mp'],
  // 2/09-2/18 入学試験・休み
]

// ── 科学的探究3（10/21〜12/22、各日 1〜6限）────────────────────────
function buildResearchLessons(lessons) {
  const holidays = new Set([
    '2026-10-29','2026-10-30','2026-10-31',
    '2026-11-01','2026-11-02','2026-11-03', // 医獣祭 + 文化の日
    '2026-11-23',                            // 勤労感謝の日
  ])
  let d = new Date('2026-10-21')
  const end = new Date('2026-12-22')
  while (d <= end) {
    const dow = d.getDay()
    const ds = d.toISOString().slice(0, 10)
    if (dow !== 0 && dow !== 6 && !holidays.has(ds)) {
      for (let pi = 0; pi < 6; pi++) {
        lessons.push({
          id: `rs_${ds}_${pi + 1}`,
          subject_id: 'rs',
          scheduled_at: toISO(ds, PT[pi].h, PT[pi].m),
          end_at:       toISO(ds, PE[pi].h, PE[pi].m),
        })
      }
    }
    d.setDate(d.getDate() + 1)
  }
}

// ── レッスン生成 ──────────────────────────────────────────────────
function buildLessons() {
  const lessons = []
  for (const [date, ...periods] of SCHEDULE) {
    periods.forEach((sid, pi) => {
      if (!sid) return
      lessons.push({
        id: `${sid}_${date}_${pi + 1}`,
        subject_id: sid,
        scheduled_at: toISO(date, PT[pi].h, PT[pi].m),
        end_at:       toISO(date, PE[pi].h, PE[pi].m),
      })
    })
  }
  buildResearchLessons(lessons)
  return lessons
}

// ── メイン ────────────────────────────────────────────────────────
async function seed() {
  console.log('🗑  既存データをクリア...')
  await supabase.from('attendance_records').delete().neq('id', '')
  await supabase.from('lessons').delete().neq('id', '')
  await supabase.from('subjects').delete().neq('id', '')

  console.log(`📚 科目 ${subjects.length}件 を挿入...`)
  const { error: subErr } = await supabase.from('subjects').insert(subjects)
  if (subErr) { console.error(subErr); process.exit(1) }

  const lessons = buildLessons()
  console.log(`📅 授業 ${lessons.length}件 を挿入...`)
  for (let i = 0; i < lessons.length; i += 100) {
    const { error } = await supabase.from('lessons').insert(lessons.slice(i, i + 100))
    if (error) { console.error(error); process.exit(1) }
    process.stdout.write(`\r   ${Math.min(i + 100, lessons.length)}/${lessons.length}`)
  }
  console.log('\n✅ 完了!')
}

seed()
