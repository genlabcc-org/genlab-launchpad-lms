-- Alter students table to add phone column and make email nullable (since students authenticate via phone OTP)
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE;
ALTER TABLE public.students ALTER COLUMN email DROP NOT NULL;

-- Create mentors table
CREATE TABLE IF NOT EXISTS public.mentors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_role enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('student', 'mentor', 'admin');
    END IF;
END$$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_role UNIQUE (user_id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policy
DROP POLICY IF EXISTS "Users read own role" ON public.user_roles;
CREATE POLICY "Users read own role" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- Create handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
