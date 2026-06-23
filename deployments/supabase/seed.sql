-- Seed data for students in public.students
INSERT INTO public.students (name, email, phone) VALUES
('Alice Johnson', 'alice.johnson@example.com', NULL),
('Bob Smith', 'bob.smith@example.com', NULL),
('Charlie Brown', 'charlie.brown@example.com', NULL),
('Diana Prince', 'diana.prince@example.com', NULL),
('Evan Wright', 'evan.wright@example.com', NULL)
ON CONFLICT (email) DO NOTHING;

-- Seed data for courses
INSERT INTO public.courses (title, description) VALUES
('Introduction to Computer Science', 'An introductory course covering the basics of computer science, algorithms, and programming.'),
('Web Development Bootcamp', 'Learn HTML, CSS, JavaScript, and modern frameworks to build responsive web applications.'),
('Database Systems & Design', 'Understand relational databases, SQL schema design, and query optimization.'),
('Software Engineering Practices', 'Focus on clean code, design patterns, testing, and continuous integration.'),
('Artificial Intelligence & Machine Learning', 'An overview of machine learning algorithms, neural networks, and AI fundamentals.');

-- Enable extensions if needed
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Seed local mock auth users in auth.users (Supabase local test accounts)
-- 1. Admin account (john.doe@genlab.cc)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'john.doe@genlab.cc',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Local Admin"}',
  now(),
  now(),
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- 2. Mentor account (mentor.genlab@gmail.com)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'mentor.genlab@gmail.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Local Mentor"}',
  now(),
  now(),
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- 3. Student account (Phone: +1234567890)
INSERT INTO auth.users (id, phone, phone_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  '+1234567890',
  now(),
  '{"provider": "phone", "providers": ["phone"]}',
  '{"name": "Local Student"}',
  now(),
  now(),
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Seed student into public.students
INSERT INTO public.students (id, name, email, phone)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'Local Student',
  'local.student@example.com',
  '+1234567890'
) ON CONFLICT (phone) DO NOTHING;

-- Seed mentor into public.mentors
INSERT INTO public.mentors (id, name, email)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Local Mentor',
  'mentor.genlab@gmail.com'
) ON CONFLICT (email) DO NOTHING;
