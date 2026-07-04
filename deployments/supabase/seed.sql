-- Enable pgcrypto extension for password encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Seed courses with deterministic UUIDs
INSERT INTO public.courses_t (id, title, description, price, is_active) VALUES
('c1b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd1', 'Introduction to Computer Science', 'An introductory course covering the basics of computer science, algorithms, and programming.', 499.00, true),
('c2b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd2', 'GenLab Creator Launchpad (Beta)', 'Learn essential skills in digital art, design principles, media composition, and audience scaling tailored for Gen Z creators.', 699.00, true),
('c3b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd3', 'Database Systems & Design', 'Understand relational databases, SQL schema design, and query optimization.', 599.00, false),
('c4b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd4', 'Software Engineering Practices', 'Focus on clean code, design patterns, testing, and continuous integration.', 549.00, true),
('c5b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd5', 'Artificial Intelligence & Machine Learning', 'An overview of machine learning algorithms, neural networks, and AI fundamentals.', 899.00, true)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    is_active = EXCLUDED.is_active;

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

-- Mentor 1 account (anika.sen@genlab.cc)
INSERT INTO auth.users (instance_id, id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, recovery_token, email_change_token_new, phone_change_token, email_change_token_current, reauthentication_token, email_change, phone_change)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000002',
  'anika.sen@genlab.cc',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Anika Sen"}',
  now(),
  now(),
  'authenticated',
  'authenticated',
  '', '', '', '', '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

-- Mentor 2 account (sarah.c@genlab.cc)
INSERT INTO auth.users (instance_id, id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, recovery_token, email_change_token_new, phone_change_token, email_change_token_current, reauthentication_token, email_change, phone_change)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000007',
  'sarah.c@genlab.cc',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Sarah Connor"}',
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

-- Student 4 (local.student@example.com with phone)
INSERT INTO auth.users (instance_id, id, email, phone, phone_confirmed_at, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, recovery_token, email_change_token_new, phone_change_token, email_change_token_current, reauthentication_token, email_change, phone_change)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000003',
  'local.student@example.com',
  '+919003032644',
  now(),
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider": "phone", "providers": ["phone", "email"]}',
  '{"name": "Local Student"}',
  now(),
  now(),
  'authenticated',
  'authenticated',
  '', '', '', '', '', '', '', ''
) ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, phone_confirmed_at = EXCLUDED.phone_confirmed_at, raw_app_meta_data = EXCLUDED.raw_app_meta_data;

-- 3. Seed students into public.students_t
INSERT INTO public.students_t (id, name, email, phone, gender, emergency_mobile, address, institution_name, student_type, referral_source) VALUES
('d7feb61f-0381-42aa-81aa-692947b8711c', 'Alice Johnson', 'alice.johnson@example.com', '+919876543201', 'female', '+919876543211', '123 Creative Street, Design District', 'National School of Design', 'student', 'college'),
('3b3d31be-696a-49e4-b06d-76079c064e6a', 'Bob Smith', 'bob.smith@example.com', '+919876543202', 'male', '+919876543212', '456 Tech Boulevard, Silicon Valley', 'Vellore Institute of Technology', 'student', 'school'),
('b67cdcf9-bd87-4911-b3e9-a26de6bc6797', 'Charlie Brown', 'charlie.brown@example.com', '+919876543203', 'male', '+919876543213', '789 Business Road, Finance Park', 'Delhi University', 'working professional', 'referral'),
('08d2d5a3-79a1-4a7b-9e41-99f78cfecaf7', 'Evan Wright', 'evan.wright@example.com', '+919876543204', 'male', '+919876543214', '321 Science Avenue, Research Center', 'Indian Institute of Technology', 'student', 'social media'),
('00000000-0000-0000-0000-000000000003', 'Local Student', 'local.student@example.com', '+919003032644', 'female', '+919003032645', '77 GenLab Way, Innovation Lab', 'Hindustan University', 'student', 'website')
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    gender = EXCLUDED.gender,
    emergency_mobile = EXCLUDED.emergency_mobile,
    address = EXCLUDED.address,
    institution_name = EXCLUDED.institution_name,
    student_type = EXCLUDED.student_type,
    referral_source = EXCLUDED.referral_source;

-- 4. Seed mentors into public.mentors_t
INSERT INTO public.mentors_t (id, name, email) VALUES
('00000000-0000-0000-0000-000000000002', 'Anika Sen', 'anika.sen@genlab.cc'),
('00000000-0000-0000-0000-000000000007', 'Sarah Connor', 'sarah.c@genlab.cc')
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name;

-- 5. Link mentors and courses in course_mentors_t
INSERT INTO public.course_mentors_t (course_id, mentor_id) VALUES
('c2b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd2', '00000000-0000-0000-0000-000000000002'), -- Anika Sen -> Creator Launchpad
('c3b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd3', '00000000-0000-0000-0000-000000000002'), -- Anika Sen -> Database
('c1b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd1', '00000000-0000-0000-0000-000000000007'), -- Sarah Connor -> Intro CS
('c4b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd4', '00000000-0000-0000-0000-000000000007'), -- Sarah Connor -> SoftEng
('c5b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd5', '00000000-0000-0000-0000-000000000007')  -- Sarah Connor -> AI/ML
ON CONFLICT DO NOTHING;

-- 6. Seed corresponding entries in auth.identities for local test logins to be recognized by GoTrue
INSERT INTO auth.identities (id, user_id, provider, provider_id, identity_data, last_sign_in_at, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'email', 'john.doe@genlab.cc', '{"sub": "00000000-0000-0000-0000-000000000001", "email": "john.doe@genlab.cc", "email_verified": true, "phone_verified": false}', now(), now(), now()),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'email', 'anika.sen@genlab.cc', '{"sub": "00000000-0000-0000-0000-000000000002", "email": "anika.sen@genlab.cc", "email_verified": true, "phone_verified": false}', now(), now(), now()),
('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000007', 'email', 'sarah.c@genlab.cc', '{"sub": "00000000-0000-0000-0000-000000000007", "email": "sarah.c@genlab.cc", "email_verified": true, "phone_verified": false}', now(), now(), now()),
('00000000-0000-0000-0000-000000000004', 'd7feb61f-0381-42aa-81aa-692947b8711c', 'email', 'alice.johnson@example.com', '{"sub": "d7feb61f-0381-42aa-81aa-692947b8711c", "email": "alice.johnson@example.com", "email_verified": true, "phone_verified": false}', now(), now(), now()),
('00000000-0000-0000-0000-000000000005', '3b3d31be-696a-49e4-b06d-76079c064e6a', 'email', 'bob.smith@example.com', '{"sub": "3b3d31be-696a-49e4-b06d-76079c064e6a", "email": "bob.smith@example.com", "email_verified": true, "phone_verified": false}', now(), now(), now()),
('00000000-0000-0000-0000-000000000006', 'b67cdcf9-bd87-4911-b3e9-a26de6bc6797', 'email', 'charlie.brown@example.com', '{"sub": "b67cdcf9-bd87-4911-b3e9-a26de6bc6797", "email": "charlie.brown@example.com", "email_verified": true, "phone_verified": false}', now(), now(), now()),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'email', 'local.student@example.com', '{"sub": "00000000-0000-0000-0000-000000000003", "email": "local.student@example.com", "email_verified": true, "phone_verified": false}', now(), now(), now()),
('00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000003', 'phone', '+919003032644', '{"sub": "00000000-0000-0000-0000-000000000003", "phone": "+919003032644", "phone_verified": true}', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- 7. Seed Mentor Schedules in mentor_schedules_t
INSERT INTO public.mentor_schedules_t (id, mentor_id, course_id, slot_id, start_date, end_date, batch_id) VALUES
('e1b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd1', '00000000-0000-0000-0000-000000000002', 'c2b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd2', 'd1b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd1', '2026-07-01', '2026-10-01', '2026_july_batch_1'),
('e2b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd2', '00000000-0000-0000-0000-000000000007', 'c1b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd1', 'd2b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd2', '2026-07-01', '2026-10-01', '2026_july_batch_1')
ON CONFLICT (id) DO UPDATE SET
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    batch_id = EXCLUDED.batch_id;

-- 8. Seed Student Enrollments in enrollments_t
INSERT INTO public.enrollments_t (id, student_id, mentor_schedule_id, payment_type, status, total_amount, batch_id, created_at) VALUES
('f1b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd1', '00000000-0000-0000-0000-000000000003', 'e1b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd1', 'partial', 'active', 699.00, '2026_july_batch_1', now() - interval '2 days'),
('f2b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd2', '3b3d31be-696a-49e4-b06d-76079c064e6a', 'e1b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd1', 'full', 'active', 699.00, '2026_july_batch_1', now() - interval '1 days'),
('f3b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd3', 'd7feb61f-0381-42aa-81aa-692947b8711c', 'e1b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd1', 'full', 'active', 699.00, '2026_july_batch_1', now() - interval '3 days'),
('f4b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd4', 'b67cdcf9-bd87-4911-b3e9-a26de6bc6797', NULL, 'monthly', 'active', 899.00, NULL, now() - interval '4 days'),
('f5b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd5', '08d2d5a3-79a1-4a7b-9e41-99f78cfecaf7', NULL, 'partial', 'active', 699.00, NULL, now() - interval '5 days')
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    total_amount = EXCLUDED.total_amount,
    mentor_schedule_id = EXCLUDED.mentor_schedule_id,
    payment_type = EXCLUDED.payment_type,
    batch_id = EXCLUDED.batch_id;

-- 9. Seed payments in payments_t
--    Each row demonstrates a different due-warning urgency tier (as of ~2026-07-04):
--
--    Payment 01  →  Local Student  →  next_due 2026-06-30  →  4 days PAST   →  🔴🔴 OVERDUE
--    Payment 02  →  Bob Smith      →  (no next due)        →  full payment   →  ✅  No warning
--    Payment 03  →  Alice Johnson  →  next_due 2026-07-20  →  16 days away   →  ✅  No warning (>10d)
--    Payment 04  →  Charlie Brown  →  next_due 2026-07-09  →  5 days away    →  🟡  Yellow warning (≤10d)
--    Payment 05  →  Evan Wright    →  next_due 2026-07-06  →  2 days away    →  🔴  Urgent warning (≤3d)
INSERT INTO public.payments_t (id, enrollment_id, amount, payment_date, next_due_date, next_due_amount, payment_method, status, transaction_reference, notes) VALUES
('01b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd1', 'f1b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd1', 200.00, '2026-06-20', '2026-06-30', 499.00, 'bank_transfer', 'completed', 'TXN778899', 'First installment received. Next due has now PASSED — overdue case.'),
('02b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd2', 'f2b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd2', 699.00, '2026-07-01', NULL, NULL, 'upi', 'completed', 'UPI112233', 'Full course payment completed. No next due — no warning shown.'),
('03b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd3', 'f3b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd3', 200.00, '2026-07-01', '2026-07-20', 499.00, 'upi', 'completed', 'UPI112244', 'First installment received. Next due in 16 days — no warning shown (>10d).'),
('04b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd4', 'f4b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd4', 600.00, '2026-07-01', '2026-07-09', 299.00, 'bank_transfer', 'completed', 'TXN334455', 'First installment received. Next due in 5 days — yellow warning (≤10d).'),
('05b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd5', 'f5b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd5', 500.00, '2026-07-01', '2026-07-06', 199.00, 'upi', 'completed', 'UPI556677', 'First installment received. Next due in 2 days — urgent red warning (≤3d).')
ON CONFLICT (id) DO UPDATE SET
    amount = EXCLUDED.amount,
    payment_date = EXCLUDED.payment_date,
    next_due_date = EXCLUDED.next_due_date,
    next_due_amount = EXCLUDED.next_due_amount,
    payment_method = EXCLUDED.payment_method,
    status = EXCLUDED.status,
    notes = EXCLUDED.notes;
