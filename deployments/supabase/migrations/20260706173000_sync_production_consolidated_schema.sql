-- 1. Create batches_t table if not exists
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
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'batches_t' AND policyname = 'Allow authenticated users to read batches'
    ) THEN
        CREATE POLICY "Allow authenticated users to read batches"
        ON public.batches_t FOR SELECT TO authenticated USING (true);
    END IF;
END$$;

-- Allow all authenticated users to modify batches
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'batches_t' AND policyname = 'Allow authenticated users to modify batches'
    ) THEN
        CREATE POLICY "Allow authenticated users to modify batches"
        ON public.batches_t FOR ALL TO authenticated USING (true);
    END IF;
END$$;

-- Seed default batches
INSERT INTO public.batches_t (id, name, start_date, cutoff_date)
VALUES 
    ('2026_july_batch_1', '2026 July Batch 1', '2026-07-01', '2026-07-14'),
    ('2026_july_batch_2', '2026 July Batch 2', '2026-07-15', '2026-07-31')
ON CONFLICT (id) DO NOTHING;


-- 2. Update courses_t table
ALTER TABLE public.courses_t ADD COLUMN IF NOT EXISTS syllabus jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.courses_t ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.courses_t ADD COLUMN IF NOT EXISTS duration_in_days INTEGER NOT NULL DEFAULT 90;


-- 3. Update students_t table
ALTER TABLE public.students_t ADD COLUMN IF NOT EXISTS interested_course_id UUID REFERENCES public.courses_t(id) ON DELETE SET NULL;
ALTER TABLE public.students_t DROP COLUMN IF EXISTS terms_accepted;
ALTER TABLE public.students_t DROP COLUMN IF EXISTS personal_mobile;


-- 4. Update mentor_schedules_t table
ALTER TABLE public.mentor_schedules_t ADD COLUMN IF NOT EXISTS batch_id TEXT;

-- Clean and format existing batch IDs if present
UPDATE public.mentor_schedules_t
SET batch_id = '2026_july_batch_1'
WHERE batch_id = 'JULY BATCH 1';

UPDATE public.mentor_schedules_t
SET batch_id = '2026_july_batch_2'
WHERE batch_id = 'JULY BATCH 2';

-- Add foreign key constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_mentor_schedules_batch' AND table_name = 'mentor_schedules_t'
    ) THEN
        ALTER TABLE public.mentor_schedules_t
            ADD CONSTRAINT fk_mentor_schedules_batch
            FOREIGN KEY (batch_id) REFERENCES public.batches_t(id)
            ON DELETE SET NULL;
    END IF;
END$$;


-- 5. Update enrollments_t table
ALTER TABLE public.enrollments_t ADD COLUMN IF NOT EXISTS batch_id TEXT;
ALTER TABLE public.enrollments_t ADD COLUMN IF NOT EXISTS certificate_key TEXT;

UPDATE public.enrollments_t
SET batch_id = '2026_july_batch_1'
WHERE batch_id = 'JULY BATCH 1';

UPDATE public.enrollments_t
SET batch_id = '2026_july_batch_2'
WHERE batch_id = 'JULY BATCH 2';

-- Add foreign key constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_enrollments_batch' AND table_name = 'enrollments_t'
    ) THEN
        ALTER TABLE public.enrollments_t
            ADD CONSTRAINT fk_enrollments_batch
            FOREIGN KEY (batch_id) REFERENCES public.batches_t(id)
            ON DELETE SET NULL;
    END IF;
END$$;


-- 6. Create certificate_generation_tasks_t table if not exists
CREATE TABLE IF NOT EXISTS public.certificate_generation_tasks_t (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES public.enrollments_t(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index status and created_at
CREATE INDEX IF NOT EXISTS cert_tasks_status_created_idx ON public.certificate_generation_tasks_t(status, created_at);

-- Enable RLS on certificate_generation_tasks_t
ALTER TABLE public.certificate_generation_tasks_t ENABLE ROW LEVEL SECURITY;

-- Allow only admins to write/read tasks, and students to read their own task status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'certificate_generation_tasks_t' AND policyname = 'Admins manage tasks'
    ) THEN
        CREATE POLICY "Admins manage tasks" ON public.certificate_generation_tasks_t
            FOR ALL USING (internal.get_user_role((select auth.uid())) = 'admin');
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'certificate_generation_tasks_t' AND policyname = 'Students read own tasks'
    ) THEN
        CREATE POLICY "Students read own tasks" ON public.certificate_generation_tasks_t
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.enrollments_t e
                    WHERE e.id = enrollment_id
                      AND e.student_id = (select auth.uid())
                )
            );
    END IF;
END$$;


-- 7. Migrate capacity settings in system_settings_t
INSERT INTO public.system_settings_t (key, value, updated_at)
VALUES 
    ('max_student_per_slot_all_mentor_all_course', '40', NOW()),
    ('max_student_per_slot_per_mentor', '12', NOW())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

DELETE FROM public.system_settings_t WHERE key IN ('max_students_total', 'max_students_per_mentor');
