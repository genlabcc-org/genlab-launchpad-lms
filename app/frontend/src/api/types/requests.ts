import type { components } from './openapi';

export type CourseRequest = components['schemas']['CourseRequest'] & { isActive?: boolean };
export type CreateSlotRequest = components['schemas']['CreateSlotRequest'];
export type CreateUserRequest = components['schemas']['CreateUserRequest'] & { interestedCourseId?: string };
export type EmailOtpRequest = components['schemas']['EmailOtpRequest'];
export type EmailVerifyRequest = components['schemas']['EmailVerifyRequest'];
export type EnrollmentRequest = components['schemas']['EnrollmentRequest'];
export type PhoneOtpRequest = components['schemas']['PhoneOtpRequest'];
export type PhoneVerifyRequest = components['schemas']['PhoneVerifyRequest'];
export type RecordPaymentRequest = components['schemas']['RecordPaymentRequest'];
export type UpdateMentorRequest = components['schemas']['UpdateMentorRequest'];
export type UpdatePaymentRequest = components['schemas']['UpdatePaymentRequest'];
export type UpdateStudentRequest = components['schemas']['UpdateStudentRequest'] & { interestedCourseId?: string };
