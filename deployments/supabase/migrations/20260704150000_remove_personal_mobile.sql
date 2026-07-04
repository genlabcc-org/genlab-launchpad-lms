-- Remove personal_mobile column from public.students_t
ALTER TABLE public.students_t DROP COLUMN IF EXISTS personal_mobile;
