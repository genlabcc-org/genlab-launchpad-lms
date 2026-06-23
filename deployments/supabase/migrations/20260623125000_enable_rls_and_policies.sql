-- Create internal schema to hide security definer helper functions from public API exposure
CREATE SCHEMA IF NOT EXISTS internal;
REVOKE ALL ON SCHEMA internal FROM public;
GRANT USAGE ON SCHEMA internal TO anon, authenticated;

-- Create get_user_role in internal schema with search_path set to prevent mutable search path vulnerability
CREATE OR REPLACE FUNCTION internal.get_user_role(u_id UUID)
RETURNS text AS $$
DECLARE
    u_role text;
BEGIN
    SELECT role::text INTO u_role FROM public.user_roles WHERE user_id = u_id;
    RETURN u_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Revoke general public execution and grant only to database roles evaluating RLS
REVOKE EXECUTE ON FUNCTION internal.get_user_role(UUID) FROM public;
GRANT EXECUTE ON FUNCTION internal.get_user_role(UUID) TO anon, authenticated, service_role;

-- Drop old trigger and public schema function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

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

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, assigned_role)
    ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION internal.handle_new_user() FROM public;

-- Recreate trigger pointing to the secure internal function
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION internal.handle_new_user();


-- ─── STUDENTS RLS ────────────────────────────────────────────────────────────
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for self, mentors, and admins" ON public.students;
CREATE POLICY "Allow select for self, mentors, and admins" ON public.students
    FOR SELECT USING (
        (select auth.uid()) = id OR 
        internal.get_user_role((select auth.uid())) IN ('mentor', 'admin')
    );

DROP POLICY IF EXISTS "Allow write for admins only" ON public.students;
DROP POLICY IF EXISTS "Allow insert for admins only" ON public.students;
CREATE POLICY "Allow insert for admins only" ON public.students
    FOR INSERT WITH CHECK (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

DROP POLICY IF EXISTS "Allow update for admins only" ON public.students;
CREATE POLICY "Allow update for admins only" ON public.students
    FOR UPDATE USING (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

DROP POLICY IF EXISTS "Allow delete for admins only" ON public.students;
CREATE POLICY "Allow delete for admins only" ON public.students
    FOR DELETE USING (
        internal.get_user_role((select auth.uid())) = 'admin'
    );


-- ─── MENTORS RLS ─────────────────────────────────────────────────────────────
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for self and admins" ON public.mentors;
CREATE POLICY "Allow select for self and admins" ON public.mentors
    FOR SELECT USING (
        (select auth.uid()) = id OR 
        internal.get_user_role((select auth.uid())) = 'admin'
    );

DROP POLICY IF EXISTS "Allow write for admins only" ON public.mentors;
DROP POLICY IF EXISTS "Allow insert for admins only" ON public.mentors;
CREATE POLICY "Allow insert for admins only" ON public.mentors
    FOR INSERT WITH CHECK (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

DROP POLICY IF EXISTS "Allow update for admins only" ON public.mentors;
CREATE POLICY "Allow update for admins only" ON public.mentors
    FOR UPDATE USING (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

DROP POLICY IF EXISTS "Allow delete for admins only" ON public.mentors;
CREATE POLICY "Allow delete for admins only" ON public.mentors
    FOR DELETE USING (
        internal.get_user_role((select auth.uid())) = 'admin'
    );


-- ─── COURSES RLS ─────────────────────────────────────────────────────────────
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select" ON public.courses;
CREATE POLICY "Allow public select" ON public.courses
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write for admins only" ON public.courses;
DROP POLICY IF EXISTS "Allow insert for admins only" ON public.courses;
CREATE POLICY "Allow insert for admins only" ON public.courses
    FOR INSERT WITH CHECK (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

DROP POLICY IF EXISTS "Allow update for admins only" ON public.courses;
CREATE POLICY "Allow update for admins only" ON public.courses
    FOR UPDATE USING (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

DROP POLICY IF EXISTS "Allow delete for admins only" ON public.courses;
CREATE POLICY "Allow delete for admins only" ON public.courses
    FOR DELETE USING (
        internal.get_user_role((select auth.uid())) = 'admin'
    );


-- ─── USER_ROLES RLS ──────────────────────────────────────────────────────────
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Allow select for self and admins" ON public.user_roles;
CREATE POLICY "Allow select for self and admins" ON public.user_roles
    FOR SELECT USING (
        (select auth.uid()) = user_id OR 
        internal.get_user_role((select auth.uid())) = 'admin'
    );

DROP POLICY IF EXISTS "Allow write for admins only" ON public.user_roles;
DROP POLICY IF EXISTS "Allow insert for admins only" ON public.user_roles;
CREATE POLICY "Allow insert for admins only" ON public.user_roles
    FOR INSERT WITH CHECK (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

DROP POLICY IF EXISTS "Allow update for admins only" ON public.user_roles;
CREATE POLICY "Allow update for admins only" ON public.user_roles
    FOR UPDATE USING (
        internal.get_user_role((select auth.uid())) = 'admin'
    );

DROP POLICY IF EXISTS "Allow delete for admins only" ON public.user_roles;
CREATE POLICY "Allow delete for admins only" ON public.user_roles
    FOR DELETE USING (
        internal.get_user_role((select auth.uid())) = 'admin'
    );
