-- Enable btree_gist extension for GIS/exclusion constraints on UUID/Date fields
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Create internal schema for secure security definer trigger functions
CREATE SCHEMA IF NOT EXISTS internal;
REVOKE ALL ON SCHEMA internal FROM public;
GRANT USAGE ON SCHEMA internal TO anon, authenticated;

-- Create user_role enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('student', 'mentor', 'admin');
    END IF;
END$$;

-- Create courses_t table
CREATE TABLE IF NOT EXISTS public.courses_t (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    duration_in_days INTEGER NOT NULL DEFAULT 90,
    syllabus JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create students_t table
CREATE TABLE IF NOT EXISTS public.students_t (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    gender TEXT,
    emergency_mobile TEXT,
    address TEXT,
    address_proof_key TEXT,
    institution_name TEXT,
    student_type TEXT,
    referral_source TEXT,
    profile_photo_key TEXT,
    interested_course_id UUID REFERENCES public.courses_t(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create mentors_t table
CREATE TABLE IF NOT EXISTS public.mentors_t (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create batches_t table
CREATE TABLE IF NOT EXISTS public.batches_t (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(250) NOT NULL,
    start_date DATE NOT NULL,
    cutoff_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create course_mentors_t join table
CREATE TABLE IF NOT EXISTS public.course_mentors_t (
    course_id UUID NOT NULL REFERENCES public.courses_t(id) ON DELETE CASCADE,
    mentor_id UUID NOT NULL REFERENCES public.mentors_t(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, mentor_id)
);

-- Create user_roles_t table
CREATE TABLE IF NOT EXISTS public.user_roles_t (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_role UNIQUE (user_id)
);

-- Create slots_t table
CREATE TABLE IF NOT EXISTS public.slots_t (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed deterministic default slots
INSERT INTO public.slots_t (id, start_time, end_time)
VALUES 
    ('d1b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd1', '10:00:00', '12:00:00'),
    ('d2b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd2', '14:00:00', '16:00:00'),
    ('d3b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd3', '16:00:00', '18:00:00')
ON CONFLICT (id) DO UPDATE SET
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time;

-- Create system_settings_t table
CREATE TABLE IF NOT EXISTS public.system_settings_t (
    key VARCHAR PRIMARY KEY,
    value VARCHAR NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default global settings for capacity limits
INSERT INTO public.system_settings_t (key, value)
VALUES
    ('max_student_per_slot_all_mentor_all_course', '40'),
    ('max_student_per_slot_per_mentor', '12')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Seed default batches
INSERT INTO public.batches_t (id, name, start_date, cutoff_date)
VALUES 
    ('2026_july_batch_1', '2026 July Batch 1', '2026-07-01', '2026-07-14'),
    ('2026_july_batch_2', '2026 July Batch 2', '2026-07-15', '2026-07-31')
ON CONFLICT (id) DO NOTHING;

-- Create mentor_schedules_t table
CREATE TABLE IF NOT EXISTS public.mentor_schedules_t (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID NOT NULL REFERENCES public.mentors_t(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses_t(id) ON DELETE CASCADE,
    slot_id UUID NOT NULL REFERENCES public.slots_t(id) ON DELETE CASCADE,
    batch_id TEXT REFERENCES public.batches_t(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT no_mentor_slot_overlap EXCLUDE USING gist (
        mentor_id WITH =,
        slot_id WITH =,
        daterange(start_date, end_date, '[]') WITH &&
    )
);

-- Create enrollments_t table
CREATE TABLE IF NOT EXISTS public.enrollments_t (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students_t(id) ON DELETE CASCADE,
    mentor_schedule_id UUID REFERENCES public.mentor_schedules_t(id) ON DELETE SET NULL,
    batch_id TEXT REFERENCES public.batches_t(id) ON DELETE SET NULL,
    certificate_key TEXT,
    payment_type TEXT,
    status TEXT DEFAULT 'active' NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create payments_t table
CREATE TABLE IF NOT EXISTS public.payments_t (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES public.enrollments_t(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    next_due_date DATE,
    next_due_amount NUMERIC(10, 2),
    payment_method VARCHAR,
    status VARCHAR NOT NULL DEFAULT 'completed',
    transaction_reference VARCHAR,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create certificate_generation_tasks_t table for queue processing
CREATE TABLE IF NOT EXISTS public.certificate_generation_tasks_t (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES public.enrollments_t(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index structures
CREATE INDEX IF NOT EXISTS enrollments_student_id_idx ON public.enrollments_t(student_id);
CREATE INDEX IF NOT EXISTS enrollments_status_idx ON public.enrollments_t(status);
CREATE INDEX IF NOT EXISTS cert_tasks_status_created_idx ON public.certificate_generation_tasks_t(status, created_at);

-- Create get_user_role in internal schema with search_path set to prevent mutable search path vulnerability
CREATE OR REPLACE FUNCTION internal.get_user_role(u_id UUID)
RETURNS text AS $$
DECLARE
    u_role text;
BEGIN
    SELECT role::text INTO u_role FROM public.user_roles_t WHERE user_id = u_id;
    RETURN u_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Revoke general public execution and grant only to database roles evaluating RLS
REVOKE EXECUTE ON FUNCTION internal.get_user_role(UUID) FROM public;
GRANT EXECUTE ON FUNCTION internal.get_user_role(UUID) TO anon, authenticated, service_role;

-- Create handle_new_user in internal schema with secure search_path
CREATE OR REPLACE FUNCTION internal.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
    assigned_role public.user_role;
BEGIN
    user_email := NEW.email;
    
    IF user_email IS NOT NULL AND user_email LIKE '%@genlab.cc' THEN
        assigned_role := 'admin'::public.user_role;
    ELSIF user_email IS NOT NULL AND user_email LIKE '%.genlab@gmail.com' THEN
        assigned_role := 'mentor'::public.user_role;
    ELSE
        assigned_role := 'student'::public.user_role;
    END IF;

    INSERT INTO public.user_roles_t (user_id, role)
    VALUES (NEW.id, assigned_role)
    ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION internal.handle_new_user() FROM public;

-- Recreate trigger pointing to the secure internal function on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION internal.handle_new_user();

-- Enable RLS on all tables
ALTER TABLE public.students_t ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors_t ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses_t ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches_t ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_mentors_t ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles_t ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots_t ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings_t ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_schedules_t ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments_t ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments_t ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_generation_tasks_t ENABLE ROW LEVEL SECURITY;

-- ─── STUDENTS RLS ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow select for self, mentors, and admins" ON public.students_t;
CREATE POLICY "Allow select for self, mentors, and admins" ON public.students_t
    FOR SELECT USING (
        (select auth.uid()) = id OR 
        internal.get_user_role((select auth.uid())) IN ('mentor', 'admin')
    );

DROP POLICY IF EXISTS "Allow insert for admins only" ON public.students_t;
CREATE POLICY "Allow insert for admins only" ON public.students_t
    FOR INSERT WITH CHECK (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

DROP POLICY IF EXISTS "Allow update for admins only" ON public.students_t;
CREATE POLICY "Allow update for admins only" ON public.students_t
    FOR UPDATE USING (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

DROP POLICY IF EXISTS "Allow delete for admins only" ON public.students_t;
CREATE POLICY "Allow delete for admins only" ON public.students_t
    FOR DELETE USING (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

-- ─── MENTORS RLS ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow select for self and admins" ON public.mentors_t;
CREATE POLICY "Allow select for self and admins" ON public.mentors_t
    FOR SELECT USING (
        (select auth.uid()) = id OR 
        internal.get_user_role((select auth.uid())) = 'admin'
    );

DROP POLICY IF EXISTS "Allow insert for admins only" ON public.mentors_t;
CREATE POLICY "Allow insert for admins only" ON public.mentors_t
    FOR INSERT WITH CHECK (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

DROP POLICY IF EXISTS "Allow update for admins only" ON public.mentors_t;
CREATE POLICY "Allow update for admins only" ON public.mentors_t
    FOR UPDATE USING (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

DROP POLICY IF EXISTS "Allow delete for admins only" ON public.mentors_t;
CREATE POLICY "Allow delete for admins only" ON public.mentors_t
    FOR DELETE USING (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

-- ─── BATCHES RLS ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow authenticated users to read batches" ON public.batches_t;
CREATE POLICY "Allow authenticated users to read batches" ON public.batches_t
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to modify batches" ON public.batches_t;
CREATE POLICY "Allow authenticated users to modify batches" ON public.batches_t
    FOR ALL TO authenticated USING (true);

-- ─── COURSES RLS ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow public select" ON public.courses_t;
CREATE POLICY "Allow public select" ON public.courses_t
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert for admins only" ON public.courses_t;
CREATE POLICY "Allow insert for admins only" ON public.courses_t
    FOR INSERT WITH CHECK (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

DROP POLICY IF EXISTS "Allow update for admins only" ON public.courses_t;
CREATE POLICY "Allow update for admins only" ON public.courses_t
    FOR UPDATE USING (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

DROP POLICY IF EXISTS "Allow delete for admins only" ON public.courses_t;
CREATE POLICY "Allow delete for admins only" ON public.courses_t
    FOR DELETE USING (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

-- ─── COURSE_MENTORS RLS ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow select for everyone" ON public.course_mentors_t;
CREATE POLICY "Allow select for everyone" ON public.course_mentors_t
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert for admins only" ON public.course_mentors_t;
CREATE POLICY "Allow insert for admins only" ON public.course_mentors_t
    FOR INSERT WITH CHECK (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

DROP POLICY IF EXISTS "Allow update for admins only" ON public.course_mentors_t;
CREATE POLICY "Allow update for admins only" ON public.course_mentors_t
    FOR UPDATE USING (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

DROP POLICY IF EXISTS "Allow delete for admins only" ON public.course_mentors_t;
CREATE POLICY "Allow delete for admins only" ON public.course_mentors_t
    FOR DELETE USING (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

-- ─── USER_ROLES RLS ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow select for self and admins" ON public.user_roles_t;
CREATE POLICY "Allow select for self and admins" ON public.user_roles_t
    FOR SELECT USING (
        (select auth.uid()) = user_id OR 
        internal.get_user_role((select auth.uid())) = 'admin'
    );

DROP POLICY IF EXISTS "Allow insert for admins only" ON public.user_roles_t;
CREATE POLICY "Allow insert for admins only" ON public.user_roles_t
    FOR INSERT WITH CHECK (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

DROP POLICY IF EXISTS "Allow update for admins only" ON public.user_roles_t;
CREATE POLICY "Allow update for admins only" ON public.user_roles_t
    FOR UPDATE USING (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

DROP POLICY IF EXISTS "Allow delete for admins only" ON public.user_roles_t;
CREATE POLICY "Allow delete for admins only" ON public.user_roles_t
    FOR DELETE USING (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

-- ─── SLOTS RLS ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow select for everyone" ON public.slots_t;
CREATE POLICY "Allow select for everyone" ON public.slots_t
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write for admins only" ON public.slots_t;
CREATE POLICY "Allow write for admins only" ON public.slots_t
    FOR ALL USING (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

-- ─── SYSTEM_SETTINGS RLS ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow select for everyone" ON public.system_settings_t;
CREATE POLICY "Allow select for everyone" ON public.system_settings_t
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write for admins only" ON public.system_settings_t;
CREATE POLICY "Allow write for admins only" ON public.system_settings_t
    FOR ALL USING (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

-- ─── MENTOR_SCHEDULES RLS ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow select for everyone" ON public.mentor_schedules_t;
CREATE POLICY "Allow select for everyone" ON public.mentor_schedules_t
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write for admins only" ON public.mentor_schedules_t;
CREATE POLICY "Allow write for admins only" ON public.mentor_schedules_t
    FOR ALL USING (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

-- ─── ENROLLMENTS RLS ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow select for self, mentors, and admins" ON public.enrollments_t;
CREATE POLICY "Allow select for self, mentors, and admins" ON public.enrollments_t
    FOR SELECT USING (
        (select auth.uid()) = student_id OR 
        internal.get_user_role((select auth.uid())) IN ('mentor', 'admin')
    );

DROP POLICY IF EXISTS "Allow insert for admins only" ON public.enrollments_t;
CREATE POLICY "Allow insert for admins only" ON public.enrollments_t
    FOR INSERT WITH CHECK (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

DROP POLICY IF EXISTS "Allow update for admins only" ON public.enrollments_t;
CREATE POLICY "Allow update for admins only" ON public.enrollments_t
    FOR UPDATE USING (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

DROP POLICY IF EXISTS "Allow delete for admins only" ON public.enrollments_t;
CREATE POLICY "Allow delete for admins only" ON public.enrollments_t
    FOR DELETE USING (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

-- ─── PAYMENTS RLS ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins select payments" ON public.payments_t;
CREATE POLICY "Admins select payments" ON public.payments_t
    FOR SELECT USING (internal.get_user_role((select auth.uid())) = 'admin');

DROP POLICY IF EXISTS "Mentors select payments" ON public.payments_t;
CREATE POLICY "Mentors select payments" ON public.payments_t
    FOR SELECT USING (internal.get_user_role((select auth.uid())) = 'mentor');

DROP POLICY IF EXISTS "Students read own payments" ON public.payments_t;
CREATE POLICY "Students read own payments" ON public.payments_t
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.enrollments_t e
            WHERE e.id = enrollment_id
              AND e.student_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Admins write payments" ON public.payments_t;
CREATE POLICY "Admins write payments" ON public.payments_t
    FOR ALL USING (internal.get_user_role((select auth.uid())) = 'admin');

-- ─── CERTIFICATE GENERATION TASKS RLS ────────────────────────────────────────
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
