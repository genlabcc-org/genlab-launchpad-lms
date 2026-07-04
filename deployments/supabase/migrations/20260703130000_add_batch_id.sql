-- Add batch_id column to mentor_schedules_t and enrollments_t tables
ALTER TABLE public.mentor_schedules_t ADD COLUMN IF NOT EXISTS batch_id TEXT;
ALTER TABLE public.enrollments_t ADD COLUMN IF NOT EXISTS batch_id TEXT;
