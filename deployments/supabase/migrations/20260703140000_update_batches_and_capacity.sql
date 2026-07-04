-- 1. Create batches_t table
CREATE TABLE IF NOT EXISTS public.batches_t (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(250) NOT NULL,
    start_date DATE NOT NULL,
    cutoff_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on batches_t
ALTER TABLE public.batches_t ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read batches
CREATE POLICY "Allow authenticated users to read batches"
ON public.batches_t FOR SELECT TO authenticated USING (true);

-- Allow all authenticated users to insert/update/delete batches (since admins use the same auth role in our current simple rules)
CREATE POLICY "Allow authenticated users to modify batches"
ON public.batches_t FOR ALL TO authenticated USING (true);

-- 2. Insert default batches and migrate existing string columns
INSERT INTO public.batches_t (id, name, start_date, cutoff_date)
VALUES 
    ('2026_july_batch_1', '2026 July Batch 1', '2026-07-01', '2026-07-14'),
    ('2026_july_batch_2', '2026 July Batch 2', '2026-07-15', '2026-07-31')
ON CONFLICT (id) DO NOTHING;

-- Clean existing string batch values and format them
UPDATE public.mentor_schedules_t
SET batch_id = '2026_july_batch_1'
WHERE batch_id = 'JULY BATCH 1';

UPDATE public.mentor_schedules_t
SET batch_id = '2026_july_batch_2'
WHERE batch_id = 'JULY BATCH 2';

UPDATE public.enrollments_t
SET batch_id = '2026_july_batch_1'
WHERE batch_id = 'JULY BATCH 1';

UPDATE public.enrollments_t
SET batch_id = '2026_july_batch_2'
WHERE batch_id = 'JULY BATCH 2';

-- Now add foreign key constraints
ALTER TABLE public.mentor_schedules_t
    ADD CONSTRAINT fk_mentor_schedules_batch
    FOREIGN KEY (batch_id) REFERENCES public.batches_t(id)
    ON DELETE SET NULL;

ALTER TABLE public.enrollments_t
    ADD CONSTRAINT fk_enrollments_batch
    FOREIGN KEY (batch_id) REFERENCES public.batches_t(id)
    ON DELETE SET NULL;

-- 3. Add duration_in_days to courses_t
ALTER TABLE public.courses_t ADD COLUMN IF NOT EXISTS duration_in_days INTEGER NOT NULL DEFAULT 90;

-- 4. Add interested_course_id to students_t
ALTER TABLE public.students_t ADD COLUMN IF NOT EXISTS interested_course_id UUID REFERENCES public.courses_t(id) ON DELETE SET NULL;

-- 5. Migrate capacity settings in system_settings_t
INSERT INTO public.system_settings_t (key, value, updated_at)
VALUES 
    ('max_student_per_slot_all_mentor_all_course', '40', NOW()),
    ('max_student_per_slot_per_mentor', '12', NOW())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

DELETE FROM public.system_settings_t WHERE key IN ('max_students_total', 'max_students_per_mentor');
