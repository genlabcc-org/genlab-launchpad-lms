-- Add syllabus JSONB column to courses_t table
ALTER TABLE public.courses_t ADD COLUMN IF NOT EXISTS syllabus jsonb DEFAULT '[]'::jsonb;

-- Add certificate_key column to enrollments_t table
ALTER TABLE public.enrollments_t ADD COLUMN IF NOT EXISTS certificate_key TEXT;

-- Create certificate_generation_tasks_t table for queue processing
CREATE TABLE IF NOT EXISTS public.certificate_generation_tasks_t (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES public.enrollments_t(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index status and created_at for fast SKIP LOCKED queue queries
CREATE INDEX IF NOT EXISTS cert_tasks_status_created_idx ON public.certificate_generation_tasks_t(status, created_at);

-- Enable RLS on the task queue table
ALTER TABLE public.certificate_generation_tasks_t ENABLE ROW LEVEL SECURITY;

-- Allow only admins to write/read tasks, and students to read their own task status
DROP POLICY IF EXISTS "Admins manage tasks" ON public.certificate_generation_tasks_t;
CREATE POLICY "Admins manage tasks" ON public.certificate_generation_tasks_t
    FOR ALL USING (internal.get_user_role((select auth.uid())) = 'admin');

DROP POLICY IF EXISTS "Students read own tasks" ON public.certificate_generation_tasks_t;
CREATE POLICY "Students read own tasks" ON public.certificate_generation_tasks_t
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.enrollments_t e
            WHERE e.id = enrollment_id
              AND e.student_id = (select auth.uid())
        )
    );
