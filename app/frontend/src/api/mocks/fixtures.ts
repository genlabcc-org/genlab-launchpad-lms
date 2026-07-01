/**
 * Centralized mock data fixtures for API layer tests.
 * Every fixture mirrors the OpenAPI-generated DTO shapes from types/openapi.ts.
 */
import type {
  StudentDto,
  CourseDto,
  EnrollmentDto,
  MentorDto,
  PaymentDto,
  SlotDto,
  StudentEnrollmentDto,
  StudentScheduleDto,
  MentorScheduleDto,
  MessageResponse,
  CreateUserResponse,
  PresignedUrlResponse,
  CourseRequest,
  CreateSlotRequest,
  CreateUserRequest,
  EnrollmentRequest,
  RecordPaymentRequest,
  UpdatePaymentRequest,
  UpdateMentorRequest,
  UpdateStudentRequest,
  EmailOtpRequest,
  EmailVerifyRequest,
  PhoneOtpRequest,
  PhoneVerifyRequest,
} from '../types';

// ─── Base URL ──────────────────────────────────────────────────────
export const BASE_URL = 'http://localhost:8080';

// ─── IDs ───────────────────────────────────────────────────────────
export const IDS = {
  student: 'd9b23b14-0d35-4424-9b5a-94071b7b7a14',
  mentor: 'b123b456-c789-d012-e345-f67890123456',
  course: 'a123b456-c789-d012-e345-f67890123456',
  slot: 'c123b456-c789-d012-e345-f67890123456',
  enrollment: 'e123b456-c789-d012-e345-f67890123456',
  payment: 'f123b456-c789-d012-e345-f67890123456',
} as const;

// ─── Model Fixtures ────────────────────────────────────────────────

export const mockMentor: MentorDto = {
  id: IDS.mentor,
  name: 'Jane Smith',
  email: 'jane@example.com',
};

export const mockSlot: SlotDto = {
  id: IDS.slot,
  name: '9:00 AM – 10:00 AM',
  startTime: { hour: 9, minute: 0, second: 0, nano: 0 },
  endTime: { hour: 10, minute: 0, second: 0, nano: 0 },
};

export const mockCourse: CourseDto = {
  id: IDS.course,
  title: 'Full Stack Development',
  description: 'Learn full-stack web development',
  price: 15000,
  mentors: [mockMentor],
  syllabus: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
  createdAt: '2026-06-01T12:00:00Z',
};

export const mockStudent: StudentDto = {
  id: IDS.student,
  name: 'John Doe',
  email: 'john@example.com',
  phone: '1234567890',
  gender: 'male',
  personalMobile: '1234567890',
  emergencyMobile: '0987654321',
  address: '123 Test St',
  addressProofKey: undefined,
  addressProofUrl: undefined,
  institutionName: 'Test University',
  studentType: 'student',
  referralSource: 'Search',
  paymentType: 'full payment',
  registeredCourseId: IDS.course,
  assignedMentorId: IDS.mentor,
  timeSlotId: IDS.slot,
  startDate: '2026-07-01',
  endDate: '2026-08-01',
  totalAmount: 15000,
  pendingAmount: 0,
  profilePhotoKey: undefined,
  profilePhotoUrl: undefined,
  termsAccepted: true,
  createdAt: '2026-07-01T12:00:00Z',
};

export const mockPayment: PaymentDto = {
  id: IDS.payment,
  enrollmentId: IDS.enrollment,
  amount: 15000,
  paymentDate: '2026-07-01',
  nextDueDate: undefined,
  nextDueAmount: undefined,
  paymentMethod: 'upi',
  status: 'completed',
  transactionReference: 'TXN-001',
  notes: 'Full payment',
};

export const mockStudentSchedule: StudentScheduleDto = {
  id: IDS.slot,
  slot: mockSlot,
  mentor: mockMentor,
  startDate: '2026-07-01',
  endDate: '2026-08-01',
};

export const mockEnrollment: EnrollmentDto = {
  id: IDS.enrollment,
  student: mockStudent,
  mentorSchedule: mockStudentSchedule,
  status: 'active',
  paymentType: 'full payment',
  totalAmount: 15000,
  pendingAmount: 0,
  payments: [mockPayment],
  certificateUrl: undefined,
  createdAt: '2026-07-01T12:00:00Z',
};

export const mockStudentEnrollment: StudentEnrollmentDto = {
  id: IDS.enrollment,
  status: 'active',
  paymentType: 'full payment',
  totalAmount: 15000,
  pendingAmount: 0,
  course: mockCourse,
  mentorSchedule: mockStudentSchedule,
  payments: [mockPayment],
  certificateUrl: null,
  createdAt: '2026-07-01T12:00:00Z',
};

export const mockMentorSchedule: MentorScheduleDto = {
  id: IDS.enrollment,
  slot: mockSlot,
  course: mockCourse,
  mentor: mockMentor,
  startDate: '2026-07-01',
  endDate: '2026-08-01',
  students: [mockStudent],
};

export const mockMessage: MessageResponse = { message: 'OK' };

export const mockCreateUserResponse: CreateUserResponse = {
  userId: IDS.student,
  role: 'STUDENT',
  name: 'John Doe',
  message: 'User created successfully',
};

export const mockPresignedUrl: PresignedUrlResponse = {
  url: 'https://s3.example.com/upload?token=xyz',
  key: 'students/profile-photo/abc.jpg',
};

// ─── Request Fixtures ──────────────────────────────────────────────

export const mockCourseRequest: CourseRequest = {
  title: 'Full Stack Development',
  description: 'Learn full-stack web development',
  price: 15000,
  syllabus: ['HTML', 'CSS', 'JavaScript'],
  mentorIds: [IDS.mentor],
};

export const mockCreateSlotRequest: CreateSlotRequest = {
  startTime: { hour: 9, minute: 0, second: 0, nano: 0 },
  endTime: { hour: 10, minute: 0, second: 0, nano: 0 },
};

export const mockCreateUserRequest: CreateUserRequest = {
  role: 'STUDENT',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '1234567890',
  gender: 'male',
};

export const mockEnrollmentRequest: EnrollmentRequest = {
  studentId: IDS.student,
  courseId: IDS.course,
  mentorId: IDS.mentor,
  slotId: IDS.slot,
  startDate: '2026-07-01',
  endDate: '2026-08-01',
  paymentType: 'full payment',
  totalAmount: 15000,
  status: 'active',
};

export const mockRecordPaymentRequest: RecordPaymentRequest = {
  enrollmentId: IDS.enrollment,
  amount: 15000,
  paymentDate: '2026-07-01',
  paymentMethod: 'upi',
  status: 'completed',
  transactionReference: 'TXN-001',
  notes: 'Full payment',
};

export const mockUpdatePaymentRequest: UpdatePaymentRequest = {
  amount: 15000,
  paymentDate: '2026-07-01',
  status: 'completed',
};

export const mockUpdateMentorRequest: UpdateMentorRequest = {
  name: 'Jane Smith Updated',
  email: 'jane.updated@example.com',
};

export const mockUpdateStudentRequest: UpdateStudentRequest = {
  name: 'John Doe Updated',
  email: 'john.updated@example.com',
};

export const mockPhoneOtpRequest: PhoneOtpRequest = { phone: '1234567890' };
export const mockPhoneVerifyRequest: PhoneVerifyRequest = { phone: '1234567890', token: '123456' };
export const mockEmailOtpRequest: EmailOtpRequest = { email: 'test@example.com' };
export const mockEmailVerifyRequest: EmailVerifyRequest = { email: 'test@example.com', token: '123456' };
