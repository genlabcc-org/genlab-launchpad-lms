-- Seed data for students in public.students_t
INSERT INTO public.students_t (name, email, phone) VALUES
('Alice Johnson', 'alice.johnson@example.com', NULL),
('Bob Smith', 'bob.smith@example.com', NULL),
('Charlie Brown', 'charlie.brown@example.com', NULL),
('Diana Prince', 'diana.prince@example.com', NULL),
('Evan Wright', 'evan.wright@example.com', NULL)
ON CONFLICT (email) DO NOTHING;

-- Seed data for courses in public.courses_t
INSERT INTO public.courses_t (title, description, price) VALUES
('Introduction to Computer Science', 'An introductory course covering the basics of computer science, algorithms, and programming.', 499.00),
('Web Development Bootcamp', 'Learn HTML, CSS, JavaScript, and modern frameworks to build responsive web applications.', 699.00),
('Database Systems & Design', 'Understand relational databases, SQL schema design, and query optimization.', 599.00),
('Software Engineering Practices', 'Focus on clean code, design patterns, testing, and continuous integration.', 549.00),
('Artificial Intelligence & Machine Learning', 'An overview of machine learning algorithms, neural networks, and AI fundamentals.', 899.00);

-- Enable extensions if needed
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Seed local mock auth users in auth.users (Supabase local test accounts)
-- 1. Admin account (john.doe@genlab.cc)
INSERT INTO auth.users (instance_id, id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, recovery_token, email_change_token_new, phone_change_token, email_change_token_current, reauthentication_token, email_change, phone_change)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'john.doe@genlab.cc',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Local Admin"}',
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- 2. Mentor account (mentor.genlab@gmail.com)
INSERT INTO auth.users (instance_id, id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, recovery_token, email_change_token_new, phone_change_token, email_change_token_current, reauthentication_token, email_change, phone_change)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000002',
  'mentor.genlab@gmail.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Local Mentor"}',
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- 3. Student account (Phone: +919876543210)
INSERT INTO auth.users (instance_id, id, phone, phone_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, recovery_token, email_change_token_new, phone_change_token, email_change_token_current, reauthentication_token, email_change, phone_change)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000003',
  '+919876543210',
  now(),
  '{"provider": "phone", "providers": ["phone"]}',
  '{"name": "Local Student"}',
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Seed student into public.students_t
INSERT INTO public.students_t (id, name, email, phone)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'Local Student',
  'local.student@example.com',
  '+919876543210'
) ON CONFLICT (phone) DO NOTHING;

-- Seed mentor into public.mentors_t
INSERT INTO public.mentors_t (id, name, email)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Local Mentor',
  'mentor.genlab@gmail.com'
) ON CONFLICT (email) DO NOTHING;

-- Seed corresponding entries in auth.identities for local test logins to be recognized by GoTrue
INSERT INTO auth.identities (id, user_id, provider, provider_id, identity_data, last_sign_in_at, created_at, updated_at) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'email',
  'john.doe@genlab.cc',
  '{"sub": "00000000-0000-0000-0000-000000000001", "email": "john.doe@genlab.cc", "email_verified": true, "phone_verified": false}',
  now(),
  now(),
  now()
),
(
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  'email',
  'mentor.genlab@gmail.com',
  '{"sub": "00000000-0000-0000-0000-000000000002", "email": "mentor.genlab@gmail.com", "email_verified": true, "phone_verified": false}',
  now(),
  now(),
  now()
),
(
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000003',
  'phone',
  '+919876543210',
  '{"sub": "00000000-0000-0000-0000-000000000003", "phone": "+919876543210", "email_verified": false, "phone_verified": true}',
  now(),
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;
