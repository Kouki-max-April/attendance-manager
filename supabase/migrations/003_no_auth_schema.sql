-- ログイン不要版スキーマ
-- 既存テーブルを削除して作り直す

drop table if exists attendance_records cascade;
drop table if exists lessons cascade;
drop table if exists subjects cascade;

-- subjects（科目）
create table subjects (
  id text primary key,
  name text not null,
  requirement_type text not null default 'TWO_THIRDS',
  custom_threshold numeric(4,3),
  count_tardiness_as numeric(3,1) not null default 0.5,
  ignore_excused boolean not null default true,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- lessons（授業回）
create table lessons (
  id text primary key,
  subject_id text not null references subjects(id) on delete cascade,
  scheduled_at timestamptz not null,
  end_at timestamptz,
  location text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- attendance_records（出席記録）
-- user_key は 'u1' / 'u2' など任意の文字列
create table attendance_records (
  id text primary key,
  user_key text not null,
  lesson_id text not null references lessons(id) on delete cascade,
  subject_id text not null references subjects(id) on delete cascade,
  status text not null,
  memo text,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(lesson_id, user_key)
);

-- インデックス
create index lessons_subject_id_idx on lessons(subject_id);
create index lessons_scheduled_at_idx on lessons(scheduled_at);
create index attendance_records_lesson_id_idx on attendance_records(lesson_id);
create index attendance_records_user_key_idx on attendance_records(user_key);

-- RLS は無効（認証不要）
alter table subjects disable row level security;
alter table lessons disable row level security;
alter table attendance_records disable row level security;
