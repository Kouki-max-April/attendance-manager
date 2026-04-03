-- attendance_records の unique 制約を (lesson_id) → (lesson_id, user_id) に変更
-- これにより複数ユーザーが同じ授業に対して個別の記録を持てるようになる

ALTER TABLE attendance_records
  DROP CONSTRAINT IF EXISTS attendance_records_lesson_id_key,
  ADD CONSTRAINT attendance_records_lesson_id_user_id_key UNIQUE (lesson_id, user_id);
