import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../services/authService', () => ({
  authService: {
    identifyRole: vi.fn(),
    sendOtp: vi.fn(),
    verifyOtp: vi.fn(),
  },
}));

describe('useLogin input logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Pure helper replicating the input processing in useLogin
  function processInput(val: string, countryCode = '+91') {
    let cleanVal = val;
    if (cleanVal.startsWith('+91')) {
      cleanVal = cleanVal.slice(3).trim();
    } else if (cleanVal.startsWith('+')) {
      cleanVal = cleanVal.replace(/^\+\d+\s*/, '').trim();
    }

    const hasLettersOrAt = /[a-zA-Z@]/.test(cleanVal);
    const isDigitPattern = /^[0-9\s\-\(\)]+$/.test(cleanVal);

    if (isDigitPattern && !hasLettersOrAt && cleanVal.length > 0) {
      const digitsOnly = cleanVal.replace(/\D/g, '').slice(0, 10);
      return {
        isPhoneMode: true,
        rawInput: digitsOnly,
        identifier: `${countryCode}${digitsOnly}`,
      };
    } else {
      return {
        isPhoneMode: false,
        rawInput: val,
        identifier: val,
      };
    }
  }

  it('should detect 10-digit Indian mobile numbers and switch to phone mode', () => {
    const result = processInput('9876543210');
    expect(result.isPhoneMode).toBe(true);
    expect(result.rawInput).toBe('9876543210');
    expect(result.identifier).toBe('+919876543210');
  });

  it('should strip leading +91 prefix from pasted input', () => {
    const result = processInput('+919876543210');
    expect(result.isPhoneMode).toBe(true);
    expect(result.rawInput).toBe('9876543210');
    expect(result.identifier).toBe('+919876543210');
  });

  it('should remain in email mode for mentor and admin emails', () => {
    const resultAdmin = processInput('admin@genlab.cc');
    expect(resultAdmin.isPhoneMode).toBe(false);
    expect(resultAdmin.identifier).toBe('admin@genlab.cc');

    const resultMentor = processInput('mentor.genlab@gmail.com');
    expect(resultMentor.isPhoneMode).toBe(false);
    expect(resultMentor.identifier).toBe('mentor.genlab@gmail.com');
  });
});
