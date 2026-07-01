import { apiClient } from './client';
import type {
  PhoneOtpRequest,
  PhoneVerifyRequest,
  EmailOtpRequest,
  EmailVerifyRequest,
  MessageResponse,
} from './types';

export const authApi = {
  // ─── Student Auth (Phone OTP) ────────────────────────────────
  studentSendOtp(request: PhoneOtpRequest): Promise<MessageResponse> {
    return apiClient.post('/auth/student/send-otp', request).then((res) => res.data);
  },

  studentVerifyOtp(request: PhoneVerifyRequest): Promise<Record<string, any>> {
    return apiClient.post('/auth/student/verify-otp', request).then((res) => res.data);
  },

  // ─── Mentor Auth (Email OTP) ─────────────────────────────────
  mentorSendOtp(request: EmailOtpRequest): Promise<MessageResponse> {
    return apiClient.post('/auth/mentor/send-otp', request).then((res) => res.data);
  },

  mentorVerifyOtp(request: EmailVerifyRequest): Promise<Record<string, any>> {
    return apiClient.post('/auth/mentor/verify-otp', request).then((res) => res.data);
  },

  // ─── Admin Auth (Email OTP) ──────────────────────────────────
  adminSendOtp(request: EmailOtpRequest): Promise<MessageResponse> {
    return apiClient.post('/auth/admin/send-otp', request).then((res) => res.data);
  },

  adminVerifyOtp(request: EmailVerifyRequest): Promise<Record<string, any>> {
    return apiClient.post('/auth/admin/verify-otp', request).then((res) => res.data);
  },
};
export default authApi;
