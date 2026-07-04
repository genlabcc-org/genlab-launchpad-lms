-- Add is_active column to courses_t table
ALTER TABLE public.courses_t ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
