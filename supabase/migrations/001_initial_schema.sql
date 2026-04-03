-- subjects（科目）
create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  -- 出席要件タイプ: TWO_THIRDS | FULL | CUSTOM | NONE
  requirement_type text not null default 'TWO_THIRDS',
  -- CUSTOM の場合の出席率閾値（0.0〜1.0）
  custom_threshold numeric(4,3),
  -- 遅刻を欠席何回分としてカウントするか
  count_tardiness_as numeric(3,1) not null default 0.5,
  -- 公欠を欠席としてカウントするか
  ignore_excused boolean not null default true,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- lessons（授業回）
create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  scheduled_at timestamptz not null,
  end_at timestamptz,
  location text,
  notes text,
  -- 繰り返しグループID（繰り返し登録された授業はこれで紐付け）
  recurrence_group_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- attendance_records（出席記録）
create table if not exists attendance_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  -- ステータス: PRESENT | ABSENT | TARDINESS | EXCUSED
  status text not null,
  memo text,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(lesson_id)
);

-- インデックス
create index if not exists lessons_subject_id_idx on lessons(subject_id);
create index if not exists lessons_scheduled_at_idx on lessons(scheduled_at);
create index if not exists attendance_records_lesson_id_idx on attendance_records(lesson_id);
create index if not exists attendance_records_subject_id_idx on attendance_records(subject_id);

-- updated_at 自動更新トリガー
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger subjects_updated_at before update on subjects
  for each row execute function update_updated_at();

create trigger lessons_updated_at before update on lessons
  for each row execute function update_updated_at();

create trigger attendance_records_updated_at before update on attendance_records
  for each row execute function update_updated_at();

-- RLS（Row Level Security）
alter table subjects enable row level security;
alter table lessons enable row level security;
alter table attendance_records enable row level security;

-- subjects RLS ポリシー
create policy "subjects: own data only" on subjects
  for all using (auth.uid() = user_id);

-- lessons RLS ポリシー
create policy "lessons: own data only" on lessons
  for all using (auth.uid() = user_id);

-- attendance_records RLS ポリシー
create policy "attendance_records: own data only" on attendance_records
  for all using (auth.uid() = user_id);
