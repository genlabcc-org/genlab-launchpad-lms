import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../setupTests';
import { authApi } from '../auth';
import {
  BASE_URL,
  mockMessage,
  mockPhoneOtpRequest,
  mockPhoneVerifyRequest,
  mockEmailOtpRequest,
  mockEmailVerifyRequest,
} from '../mocks/fixtures';

// ─── Helpers ───────────────────────────────────────────────────────

/** Creates an MSW handler that captures the request body for assertion. */
function capturePostHandler<T>(url: string, response: unknown) {
  let captured: T | undefined;
  const handler = http.post(url, async ({ request }) => {
    captured = (await request.json()) as T;
    return HttpResponse.json(response as any);
  });
  return { handler, getCaptured: () => captured };
}

// ─── Student Auth ──────────────────────────────────────────────────

describe('authApi – Student Auth (Phone OTP)', () => {
  describe('studentSendOtp', () => {
    it('should POST phone to /auth/student/send-otp and return message', async () => {
      const { handler, getCaptured } = capturePostHandler(
        `${BASE_URL}/auth/student/send-otp`,
        mockMessage,
      );
      server.use(handler);

      const result = await authApi.studentSendOtp(mockPhoneOtpRequest);

      expect(result).toEqual(mockMessage);
      expect(getCaptured()).toEqual(mockPhoneOtpRequest);
    });

    it('should reject on 400 Bad Request (invalid phone)', async () => {
      server.use(
        http.post(`${BASE_URL}/auth/student/send-otp`, () =>
          HttpResponse.json({ message: 'Invalid phone number' }, { status: 400 }),
        ),
      );

      await expect(authApi.studentSendOtp({ phone: '' })).rejects.toThrow();
    });

    it('should reject on 500 Internal Server Error', async () => {
      server.use(
        http.post(`${BASE_URL}/auth/student/send-otp`, () =>
          new HttpResponse(null, { status: 500 }),
        ),
      );

      await expect(authApi.studentSendOtp(mockPhoneOtpRequest)).rejects.toThrow();
    });

    it('should reject on network failure', async () => {
      server.use(
        http.post(`${BASE_URL}/auth/student/send-otp`, () => HttpResponse.error()),
      );

      await expect(authApi.studentSendOtp(mockPhoneOtpRequest)).rejects.toThrow();
    });
  });

  describe('studentVerifyOtp', () => {
    const mockVerifyResponse = { role: 'STUDENT', userId: 'abc-123' };

    it('should POST phone+token and return session data', async () => {
      const { handler, getCaptured } = capturePostHandler(
        `${BASE_URL}/auth/student/verify-otp`,
        mockVerifyResponse,
      );
      server.use(handler);

      const result = await authApi.studentVerifyOtp(mockPhoneVerifyRequest);

      expect(result).toEqual(mockVerifyResponse);
      expect(getCaptured()).toEqual(mockPhoneVerifyRequest);
    });

    it('should reject on 401 Unauthorized (wrong OTP)', async () => {
      server.use(
        http.post(`${BASE_URL}/auth/student/verify-otp`, () =>
          HttpResponse.json({ message: 'Invalid OTP' }, { status: 401 }),
        ),
      );

      await expect(
        authApi.studentVerifyOtp({ phone: '1234567890', token: 'wrong' }),
      ).rejects.toThrow();
    });

    it('should reject on 429 Too Many Requests (rate-limited)', async () => {
      server.use(
        http.post(`${BASE_URL}/auth/student/verify-otp`, () =>
          new HttpResponse(null, { status: 429 }),
        ),
      );

      await expect(authApi.studentVerifyOtp(mockPhoneVerifyRequest)).rejects.toThrow();
    });
  });
});

// ─── Mentor Auth ───────────────────────────────────────────────────

describe('authApi – Mentor Auth (Email OTP)', () => {
  describe('mentorSendOtp', () => {
    it('should POST email to /auth/mentor/send-otp and return message', async () => {
      const { handler, getCaptured } = capturePostHandler(
        `${BASE_URL}/auth/mentor/send-otp`,
        mockMessage,
      );
      server.use(handler);

      const result = await authApi.mentorSendOtp(mockEmailOtpRequest);

      expect(result).toEqual(mockMessage);
      expect(getCaptured()).toEqual(mockEmailOtpRequest);
    });

    it('should reject on server error', async () => {
      server.use(
        http.post(`${BASE_URL}/auth/mentor/send-otp`, () =>
          new HttpResponse(null, { status: 500 }),
        ),
      );

      await expect(authApi.mentorSendOtp(mockEmailOtpRequest)).rejects.toThrow();
    });
  });

  describe('mentorVerifyOtp', () => {
    const mockVerifyResponse = { role: 'MENTOR', userId: 'mentor-123' };

    it('should POST email+token and return session data', async () => {
      const { handler, getCaptured } = capturePostHandler(
        `${BASE_URL}/auth/mentor/verify-otp`,
        mockVerifyResponse,
      );
      server.use(handler);

      const result = await authApi.mentorVerifyOtp(mockEmailVerifyRequest);

      expect(result).toEqual(mockVerifyResponse);
      expect(getCaptured()).toEqual(mockEmailVerifyRequest);
    });

    it('should reject on 401 Unauthorized', async () => {
      server.use(
        http.post(`${BASE_URL}/auth/mentor/verify-otp`, () =>
          new HttpResponse(null, { status: 401 }),
        ),
      );

      await expect(authApi.mentorVerifyOtp(mockEmailVerifyRequest)).rejects.toThrow();
    });
  });
});

// ─── Admin Auth ────────────────────────────────────────────────────

describe('authApi – Admin Auth (Email OTP)', () => {
  describe('adminSendOtp', () => {
    it('should POST email to /auth/admin/send-otp and return message', async () => {
      const { handler, getCaptured } = capturePostHandler(
        `${BASE_URL}/auth/admin/send-otp`,
        mockMessage,
      );
      server.use(handler);

      const result = await authApi.adminSendOtp(mockEmailOtpRequest);

      expect(result).toEqual(mockMessage);
      expect(getCaptured()).toEqual(mockEmailOtpRequest);
    });

    it('should reject on server error', async () => {
      server.use(
        http.post(`${BASE_URL}/auth/admin/send-otp`, () =>
          new HttpResponse(null, { status: 500 }),
        ),
      );

      await expect(authApi.adminSendOtp(mockEmailOtpRequest)).rejects.toThrow();
    });
  });

  describe('adminVerifyOtp', () => {
    const mockVerifyResponse = { role: 'ADMIN', userId: 'admin-123' };

    it('should POST email+token and return session data', async () => {
      const { handler, getCaptured } = capturePostHandler(
        `${BASE_URL}/auth/admin/verify-otp`,
        mockVerifyResponse,
      );
      server.use(handler);

      const result = await authApi.adminVerifyOtp(mockEmailVerifyRequest);

      expect(result).toEqual(mockVerifyResponse);
      expect(getCaptured()).toEqual(mockEmailVerifyRequest);
    });

    it('should reject on 403 Forbidden (non-admin email)', async () => {
      server.use(
        http.post(`${BASE_URL}/auth/admin/verify-otp`, () =>
          HttpResponse.json({ message: 'Forbidden' }, { status: 403 }),
        ),
      );

      await expect(authApi.adminVerifyOtp(mockEmailVerifyRequest)).rejects.toThrow();
    });
  });
});
