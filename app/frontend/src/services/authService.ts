import authApi from '../api/auth';
import type { MessageResponse } from '../api/types';
import type { UserRole } from '../store/authStore';

export interface RoleAuthStrategy {
  role: UserRole;
  matches: (input: string) => boolean;
  formatIdentifier: (input: string) => string;
  sendOtp: (identifier: string) => Promise<MessageResponse>;
  verifyOtp: (identifier: string, token: string) => Promise<Record<string, any>>;
}

/**
 * Strategy for Student Authentication (Phone OTP)
 */
export const studentAuthStrategy: RoleAuthStrategy = {
  role: 'student',
  matches: (input: string) => /^\+?[0-9\s\-()]{10,20}$/.test(input.trim()),
  formatIdentifier: (input: string) => {
    let formatted = input.trim();
    if (!formatted.startsWith('+')) {
      formatted = '+' + formatted;
    }
    return formatted;
  },
  sendOtp: (phone: string) => {
    const formattedPhone = studentAuthStrategy.formatIdentifier(phone);
    return authApi.studentSendOtp({ phone: formattedPhone });
  },
  verifyOtp: (phone: string, token: string) => {
    const formattedPhone = studentAuthStrategy.formatIdentifier(phone);
    return authApi.studentVerifyOtp({ phone: formattedPhone, token: token.trim() });
  },
};

/**
 * Strategy for Mentor Authentication (Email OTP)
 */
export const mentorAuthStrategy: RoleAuthStrategy = {
  role: 'mentor',
  matches: (input: string) => input.trim().toLowerCase().endsWith('.genlab@gmail.com'),
  formatIdentifier: (input: string) => input.trim(),
  sendOtp: (email: string) => {
    return authApi.mentorSendOtp({ email: email.trim() });
  },
  verifyOtp: (email: string, token: string) => {
    return authApi.mentorVerifyOtp({ email: email.trim(), token: token.trim() });
  },
};

/**
 * Strategy for Admin Authentication (Email OTP)
 */
export const adminAuthStrategy: RoleAuthStrategy = {
  role: 'admin',
  matches: (input: string) => input.trim().toLowerCase().endsWith('@genlab.cc'),
  formatIdentifier: (input: string) => input.trim(),
  sendOtp: (email: string) => {
    return authApi.adminSendOtp({ email: email.trim() });
  },
  verifyOtp: (email: string, token: string) => {
    return authApi.adminVerifyOtp({ email: email.trim(), token: token.trim() });
  },
};

/**
 * Strategy Registry for resolving role-based auth mechanisms
 */
export const ROLE_STRATEGIES: RoleAuthStrategy[] = [
  adminAuthStrategy,
  mentorAuthStrategy,
  studentAuthStrategy,
];

export const authService = {
  /**
   * Identifies user role based on input pattern matching
   */
  identifyRole(input: string): UserRole | null {
    const strategy = ROLE_STRATEGIES.find((s) => s.matches(input));
    return strategy ? strategy.role : null;
  },

  /**
   * Resolves strategy for a given role or input
   */
  getStrategy(inputOrRole: string | UserRole): RoleAuthStrategy | null {
    const directRole = ROLE_STRATEGIES.find((s) => s.role === inputOrRole);
    if (directRole) return directRole;
    return ROLE_STRATEGIES.find((s) => s.matches(inputOrRole)) || null;
  },

  /**
   * Sends OTP using appropriate role strategy
   */
  async sendOtp(identifier: string): Promise<{ role: UserRole; response: MessageResponse }> {
    const strategy = this.getStrategy(identifier);
    if (!strategy) {
      throw new Error('Invalid credentials. Please verify your details.');
    }
    const response = await strategy.sendOtp(identifier);
    return { role: strategy.role, response };
  },

  /**
   * Verifies OTP using appropriate role strategy
   */
  async verifyOtp(
    identifier: string,
    token: string
  ): Promise<{ role: UserRole; data: Record<string, any> }> {
    const strategy = this.getStrategy(identifier);
    if (!strategy) {
      throw new Error('Invalid identifier session. Please refresh.');
    }
    const data = await strategy.verifyOtp(identifier, token);
    return { role: strategy.role, data };
  },
};

export default authService;
