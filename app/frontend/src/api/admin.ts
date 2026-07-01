import { apiClient } from './client';
import type {
  MessageResponse,
  CourseDto,
  CourseRequest,
  EnrollmentDto,
  EnrollmentRequest,
  MentorDto,
  CreateUserRequest,
  CreateUserResponse,
  UpdateMentorRequest,
  PaymentDto,
  RecordPaymentRequest,
  UpdatePaymentRequest,
  SlotDto,
  CreateSlotRequest,
  StudentDto,
  UpdateStudentRequest,
  PresignedUrlResponse,
} from './types';

export const adminApi = {
  // ─── Dashboard ───────────────────────────────────────────────
  getDashboard(): Promise<MessageResponse> {
    return apiClient.get('/api/admin/dashboard').then((res) => res.data);
  },

  // ─── Courses ─────────────────────────────────────────────────
  getAllCourses(): Promise<CourseDto[]> {
    return apiClient.get('/api/admin/courses').then((res) => res.data);
  },

  getCourseById(id: string): Promise<CourseDto> {
    return apiClient.get(`/api/admin/courses/${id}`).then((res) => res.data);
  },

  createCourse(request: CourseRequest): Promise<CourseDto> {
    return apiClient.post('/api/admin/courses', request).then((res) => res.data);
  },

  updateCourse(id: string, request: CourseRequest): Promise<CourseDto> {
    return apiClient.put(`/api/admin/courses/${id}`, request).then((res) => res.data);
  },

  deleteCourse(id: string): Promise<void> {
    return apiClient.delete(`/api/admin/courses/${id}`).then((res) => res.data);
  },

  // ─── Enrollments ─────────────────────────────────────────────
  getAllEnrollments(): Promise<EnrollmentDto[]> {
    return apiClient.get('/api/admin/enrollments').then((res) => res.data);
  },

  getEnrollmentById(id: string): Promise<EnrollmentDto> {
    return apiClient.get(`/api/admin/enrollments/${id}`).then((res) => res.data);
  },

  createEnrollment(request: EnrollmentRequest): Promise<EnrollmentDto> {
    return apiClient.post('/api/admin/enrollments', request).then((res) => res.data);
  },

  createEnrollmentsBulk(requests: EnrollmentRequest[]): Promise<EnrollmentDto[]> {
    return apiClient.post('/api/admin/enrollments/bulk', requests).then((res) => res.data);
  },

  updateEnrollment(id: string, request: EnrollmentRequest): Promise<EnrollmentDto> {
    return apiClient.put(`/api/admin/enrollments/${id}`, request).then((res) => res.data);
  },

  deleteEnrollment(id: string): Promise<void> {
    return apiClient.delete(`/api/admin/enrollments/${id}`).then((res) => res.data);
  },

  generateCertificate(enrollmentId: string): Promise<MessageResponse> {
    return apiClient.post(`/api/admin/enrollments/${enrollmentId}/certificate/generate`).then((res) => res.data);
  },

  // ─── Mentors ─────────────────────────────────────────────────
  getAllMentors(): Promise<MentorDto[]> {
    return apiClient.get('/api/admin/mentors').then((res) => res.data);
  },

  getMentorById(id: string): Promise<MentorDto> {
    return apiClient.get(`/api/admin/mentors/${id}`).then((res) => res.data);
  },

  createMentor(request: CreateUserRequest): Promise<CreateUserResponse> {
    return apiClient.post('/api/admin/mentors', request).then((res) => res.data);
  },

  updateMentor(id: string, request: UpdateMentorRequest): Promise<MentorDto> {
    return apiClient.put(`/api/admin/mentors/${id}`, request).then((res) => res.data);
  },

  deleteMentor(id: string): Promise<void> {
    return apiClient.delete(`/api/admin/mentors/${id}`).then((res) => res.data);
  },

  // ─── Payments ────────────────────────────────────────────────
  recordPayment(request: RecordPaymentRequest): Promise<PaymentDto> {
    return apiClient.post('/api/admin/payments', request).then((res) => res.data);
  },

  listPayments(): Promise<PaymentDto[]> {
    return apiClient.get('/api/admin/payments').then((res) => res.data);
  },

  getPendingPayments(): Promise<PaymentDto[]> {
    return apiClient.get('/api/admin/payments/pending').then((res) => res.data);
  },

  getPayment(id: string): Promise<PaymentDto> {
    return apiClient.get(`/api/admin/payments/${id}`).then((res) => res.data);
  },

  updatePayment(id: string, request: UpdatePaymentRequest): Promise<PaymentDto> {
    return apiClient.put(`/api/admin/payments/${id}`, request).then((res) => res.data);
  },

  deletePayment(id: string): Promise<void> {
    return apiClient.delete(`/api/admin/payments/${id}`).then((res) => res.data);
  },

  // ─── Settings ────────────────────────────────────────────────
  updateSettings(body: Record<string, string>): Promise<MessageResponse> {
    return apiClient.put('/api/admin/settings', body).then((res) => res.data);
  },

  // ─── Slots ───────────────────────────────────────────────────
  getAllSlots(): Promise<SlotDto[]> {
    return apiClient.get('/api/admin/slots').then((res) => res.data);
  },

  getSlotById(id: string): Promise<SlotDto> {
    return apiClient.get(`/api/admin/slots/${id}`).then((res) => res.data);
  },

  createSlot(request: CreateSlotRequest): Promise<SlotDto> {
    return apiClient.post('/api/admin/slots', request).then((res) => res.data);
  },

  updateSlot(id: string, request: CreateSlotRequest): Promise<SlotDto> {
    return apiClient.put(`/api/admin/slots/${id}`, request).then((res) => res.data);
  },

  deleteSlot(id: string): Promise<void> {
    return apiClient.delete(`/api/admin/slots/${id}`).then((res) => res.data);
  },

  // ─── Students ────────────────────────────────────────────────
  getAllStudents(): Promise<StudentDto[]> {
    return apiClient.get('/api/admin/students').then((res) => res.data);
  },

  getStudentById(id: string): Promise<StudentDto> {
    return apiClient.get(`/api/admin/students/${id}`).then((res) => res.data);
  },

  createStudent(request: CreateUserRequest): Promise<CreateUserResponse> {
    return apiClient.post('/api/admin/students', request).then((res) => res.data);
  },

  updateStudent(id: string, request: UpdateStudentRequest): Promise<StudentDto> {
    return apiClient.put(`/api/admin/students/${id}`, request).then((res) => res.data);
  },

  deleteStudent(id: string): Promise<void> {
    return apiClient.delete(`/api/admin/students/${id}`).then((res) => res.data);
  },

  // ─── Assets ──────────────────────────────────────────────────
  getProfilePhotoUploadUrl(contentType: string = 'image/jpeg'): Promise<PresignedUrlResponse> {
    return apiClient.get('/api/assets/student/profile-photo/presign-upload', { params: { contentType } }).then((res) => res.data);
  },

  getAddressProofUploadUrl(contentType: string = 'image/jpeg'): Promise<PresignedUrlResponse> {
    return apiClient.get('/api/assets/student/address-proof/presign-upload', { params: { contentType } }).then((res) => res.data);
  },
};
export default adminApi;
