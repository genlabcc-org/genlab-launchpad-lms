import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../authService';
import authApi from '../../api/auth';

vi.mock('../../api/auth', () => ({
  default: {
    studentSendOtp: vi.fn(),
    studentVerifyOtp: vi.fn(),
    mentorSendOtp: vi.fn(),
    mentorVerifyOtp: vi.fn(),
    adminSendOtp: vi.fn(),
    adminVerifyOtp: vi.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('identifyRole', () => {
    it('should identify admin users from @genlab.cc email', () => {
      expect(authService.identifyRole('alex@genlab.cc')).toBe('admin');
    });

    it('should identify mentor users from .genlab@gmail.com email', () => {
      expect(authService.identifyRole('john.genlab@gmail.com')).toBe('mentor');
    });

    it('should identify student users from phone number format', () => {
      expect(authService.identifyRole('+919876543210')).toBe('student');
      expect(authService.identifyRole('9876543210')).toBe('student');
    });

    it('should return null for invalid format', () => {
      expect(authService.identifyRole('random@gmail.com')).toBeNull();
    });
  });

  describe('sendOtp', () => {
    it('should route student phone to studentSendOtp with formatted phone', async () => {
      vi.mocked(authApi.studentSendOtp).mockResolvedValue({ message: 'OTP sent' });

      const result = await authService.sendOtp('+919876543210');

      expect(result.role).toBe('student');
      expect(authApi.studentSendOtp).toHaveBeenCalledWith({ phone: '+919876543210' });
    });

    it('should format student phone missing plus prefix', async () => {
      vi.mocked(authApi.studentSendOtp).mockResolvedValue({ message: 'OTP sent' });

      await authService.sendOtp('919876543210');

      expect(authApi.studentSendOtp).toHaveBeenCalledWith({ phone: '+919876543210' });
    });

    it('should route mentor email to mentorSendOtp', async () => {
      vi.mocked(authApi.mentorSendOtp).mockResolvedValue({ message: 'OTP sent' });

      const result = await authService.sendOtp('mentor.genlab@gmail.com');

      expect(result.role).toBe('mentor');
      expect(authApi.mentorSendOtp).toHaveBeenCalledWith({ email: 'mentor.genlab@gmail.com' });
    });

    it('should route admin email to adminSendOtp', async () => {
      vi.mocked(authApi.adminSendOtp).mockResolvedValue({ message: 'OTP sent' });

      const result = await authService.sendOtp('hr@genlab.cc');

      expect(result.role).toBe('admin');
      expect(authApi.adminSendOtp).toHaveBeenCalledWith({ email: 'hr@genlab.cc' });
    });

    it('should throw error for unknown role credentials', async () => {
      await expect(authService.sendOtp('unknown@domain.com')).rejects.toThrow(
        'Invalid credentials. Please verify your details.'
      );
    });
  });

  describe('verifyOtp', () => {
    it('should route student verify request', async () => {
      vi.mocked(authApi.studentVerifyOtp).mockResolvedValue({ user: { id: '1' } });

      const result = await authService.verifyOtp('+919876543210', '123456');

      expect(result.role).toBe('student');
      expect(authApi.studentVerifyOtp).toHaveBeenCalledWith({
        phone: '+919876543210',
        token: '123456',
      });
    });
  });
});
