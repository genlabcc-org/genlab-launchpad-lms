-- Enable pgcrypto extension for password encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Seed courses with deterministic UUIDs
INSERT INTO public.courses_t (id, title, description, price) VALUES
('c1b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd1', 'Introduction to Computer Science', 'An introductory course covering the basics of computer science, algorithms, and programming.', 499.00),
('c2b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd2', 'Web Development Bootcamp', 'Learn HTML, CSS, JavaScript, and modern frameworks to build responsive web applications.', 699.00),
('c3b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd3', 'Database Systems & Design', 'Understand relational databases, SQL schema design, and query optimization.', 599.00),
('c4b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd4', 'Software Engineering Practices', 'Focus on clean code, design patterns, testing, and continuous integration.', 549.00),
('c5b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd5', 'Artificial Intelligence & Machine Learning', 'An overview of machine learning algorithms, neural networks, and AI fundamentals.', 899.00)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    price = EXCLUDED.price;

-- 2. Seed mock auth users in auth.users (Supabase local test accounts)
-- Admin account (john.doe@genlab.cc)
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
  '', '', '', '', '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

-- Mentor 1 account (mentor.genlab@gmail.com)
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
  '', '', '', '', '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

-- Mentor 2 account (sarah.jenkins.genlab@gmail.com)
INSERT INTO auth.users (instance_id, id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, recovery_token, email_change_token_new, phone_change_token, email_change_token_current, reauthentication_token, email_change, phone_change)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000007',
  'sarah.jenkins.genlab@gmail.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Sarah Jenkins"}',
  now(),
  now(),
  'authenticated',
  'authenticated',
  '', '', '', '', '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

-- Student 1 (alice.johnson@example.com)
INSERT INTO auth.users (instance_id, id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, recovery_token, email_change_token_new, phone_change_token, email_change_token_current, reauthentication_token, email_change, phone_change)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'd7feb61f-0381-42aa-81aa-692947b8711c',
  'alice.johnson@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Alice Johnson"}',
  now(),
  now(),
  'authenticated',
  'authenticated',
  '', '', '', '', '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

-- Student 2 (bob.smith@example.com)
INSERT INTO auth.users (instance_id, id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, recovery_token, email_change_token_new, phone_change_token, email_change_token_current, reauthentication_token, email_change, phone_change)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '3b3d31be-696a-49e4-b06d-76079c064e6a',
  'bob.smith@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Bob Smith"}',
  now(),
  now(),
  'authenticated',
  'authenticated',
  '', '', '', '', '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

-- Student 3 (charlie.brown@example.com)
INSERT INTO auth.users (instance_id, id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, recovery_token, email_change_token_new, phone_change_token, email_change_token_current, reauthentication_token, email_change, phone_change)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'b67cdcf9-bd87-4911-b3e9-a26de6bc6797',
  'charlie.brown@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Charlie Brown"}',
  now(),
  now(),
  'authenticated',
  'authenticated',
  '', '', '', '', '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

-- Student 4 (local.student@example.com)
INSERT INTO auth.users (instance_id, id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, recovery_token, email_change_token_new, phone_change_token, email_change_token_current, reauthentication_token, email_change, phone_change)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000003',
  'local.student@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Local Student"}',
  now(),
  now(),
  'authenticated',
  'authenticated',
  '', '', '', '', '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

-- 3. Seed students into public.students_t
INSERT INTO public.students_t (id, name, email, phone) VALUES
('d7feb61f-0381-42aa-81aa-692947b8711c', 'Alice Johnson', 'alice.johnson@example.com', '+919876543201'),
('3b3d31be-696a-49e4-b06d-76079c064e6a', 'Bob Smith', 'bob.smith@example.com', '+919876543202'),
('b67cdcf9-bd87-4911-b3e9-a26de6bc6797', 'Charlie Brown', 'charlie.brown@example.com', '+919876543203'),
('08d2d5a3-79a1-4a7b-9e41-99f78cfecaf7', 'Evan Wright', 'evan.wright@example.com', '+919876543204'),
('00000000-0000-0000-0000-000000000003', 'Local Student', 'local.student@example.com', '+919876543210')
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone;

-- 4. Seed mentors into public.mentors_t
INSERT INTO public.mentors_t (id, name, email) VALUES
('00000000-0000-0000-0000-000000000002', 'Local Mentor', 'mentor.genlab@gmail.com'),
('00000000-0000-0000-0000-000000000007', 'Sarah Jenkins', 'sarah.jenkins.genlab@gmail.com')
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name;

-- 5. Link mentors and courses in course_mentors_t
INSERT INTO public.course_mentors_t (course_id, mentor_id) VALUES
('c2b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd2', '00000000-0000-0000-0000-000000000002'), -- Local Mentor -> Web Dev
('c3b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd3', '00000000-0000-0000-0000-000000000002'), -- Local Mentor -> Database
('c1b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd1', '00000000-0000-0000-0000-000000000007'), -- Sarah Jenkins -> Intro CS
('c4b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd4', '00000000-0000-0000-0000-000000000007'), -- Sarah Jenkins -> SoftEng
('c5b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd5', '00000000-0000-0000-0000-000000000007')  -- Sarah Jenkins -> AI/ML
ON CONFLICT DO NOTHING;

-- 6. Seed corresponding entries in auth.identities for local test logins to be recognized by GoTrue
INSERT INTO auth.identities (id, user_id, provider, provider_id, identity_data, last_sign_in_at, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'email', 'john.doe@genlab.cc', '{"sub": "00000000-0000-0000-0000-000000000001", "email": "john.doe@genlab.cc", "email_verified": true, "phone_verified": false}', now(), now(), now()),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'email', 'mentor.genlab@gmail.com', '{"sub": "00000000-0000-0000-0000-000000000002", "email": "mentor.genlab@gmail.com", "email_verified": true, "phone_verified": false}', now(), now(), now()),
('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000007', 'email', 'sarah.jenkins.genlab@gmail.com', '{"sub": "00000000-0000-0000-0000-000000000007", "email": "sarah.jenkins.genlab@gmail.com", "email_verified": true, "phone_verified": false}', now(), now(), now()),
('00000000-0000-0000-0000-000000000004', 'd7feb61f-0381-42aa-81aa-692947b8711c', 'email', 'alice.johnson@example.com', '{"sub": "d7feb61f-0381-42aa-81aa-692947b8711c", "email": "alice.johnson@example.com", "email_verified": true, "phone_verified": false}', now(), now(), now()),
('00000000-0000-0000-0000-000000000005', '3b3d31be-696a-49e4-b06d-76079c064e6a', 'email', 'bob.smith@example.com', '{"sub": "3b3d31be-696a-49e4-b06d-76079c064e6a", "email": "bob.smith@example.com", "email_verified": true, "phone_verified": false}', now(), now(), now()),
('00000000-0000-0000-0000-000000000006', 'b67cdcf9-bd87-4911-b3e9-a26de6bc6797', 'email', 'charlie.brown@example.com', '{"sub": "b67cdcf9-bd87-4911-b3e9-a26de6bc6797", "email": "charlie.brown@example.com", "email_verified": true, "phone_verified": false}', now(), now(), now()),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'email', 'local.student@example.com', '{"sub": "00000000-0000-0000-0000-000000000003", "email": "local.student@example.com", "email_verified": true, "phone_verified": false}', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- 7. Seed Mentor Schedules in mentor_schedules_t
INSERT INTO public.mentor_schedules_t (id, mentor_id, course_id, slot_id, start_date, end_date) VALUES
('e1b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd1', '00000000-0000-0000-0000-000000000002', 'c2b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd2', 'd1b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd1', '2026-07-01', '2026-10-01'),
('e2b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd2', '00000000-0000-0000-0000-000000000007', 'c1b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd1', 'd2b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd2', '2026-07-01', '2026-10-01')
ON CONFLICT (id) DO UPDATE SET
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date;

-- 8. Seed Student Enrollments in enrollments_t
INSERT INTO public.enrollments_t (id, student_id, mentor_schedule_id, payment_type, status, total_amount, created_at) VALUES
('f1b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd1', '00000000-0000-0000-0000-000000000003', 'e1b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd1', 'partial', 'active', 699.00, now() - interval '2 days'),
('f2b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd2', '3b3d31be-696a-49e4-b06d-76079c064e6a', 'e1b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd1', 'full', 'active', 699.00, now() - interval '1 days')
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    total_amount = EXCLUDED.total_amount;

-- 9. Seed payments in payments_t
INSERT INTO public.payments_t (id, enrollment_id, amount, payment_date, next_due_date, next_due_amount, payment_method, status, transaction_reference, notes) VALUES
('01b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd1', 'f1b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd1', 200.00, '2026-07-01', '2026-08-01', 499.00, 'bank_transfer', 'completed', 'TXN778899', 'First installment payment received.'),
('02b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd2', 'f2b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd2', 699.00, '2026-07-01', NULL, NULL, 'upi', 'completed', 'UPI112233', 'Full course payment completed.')
ON CONFLICT (id) DO UPDATE SET
    amount = EXCLUDED.amount,
    status = EXCLUDED.status;
