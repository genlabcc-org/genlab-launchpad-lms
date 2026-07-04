import { useEffect, useState } from 'react';
import { COUNTRY_OPTIONS, type CountryOption } from '../data/countries';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { apiClient } from '../api/client';

import { useSettingsStore } from '../store/settingsStore';

export function useLogin() {
  const [identifier, setIdentifier] = useState('');
  const [rawInput, setRawInput] = useState('');
  const [isPhoneMode, setIsPhoneMode] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(COUNTRY_OPTIONS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [otpToken, setOtpToken] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { setSession, clearSession } = useAuthStore();
  const { theme, setTheme } = useSettingsStore();

  useEffect(() => {
    // Automatically trigger backend cookie clearance when landing on login page
    const clearAuthCookie = async () => {
      try {
        await apiClient.post('/auth/logout');
      } catch (e) {
        // Ignore network errors on logout
      }
      clearSession();
    };
    clearAuthCookie();
  }, [clearSession]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleInputChange = (val: string) => {
    setErrorMessage(null);

    let cleanVal = val;
    const code = selectedCountry.code;

    // Detect if paste or input starts with +91 or +
    if (cleanVal.startsWith('+91')) {
      cleanVal = cleanVal.slice(3).trim();
    } else if (cleanVal.startsWith('+')) {
      cleanVal = cleanVal.replace(/^\+\d+\s*/, '').trim();
    }

    // Check if input consists of phone digits (or spaces/dashes) without email/letters
    const hasLettersOrAt = /[a-zA-Z@]/.test(cleanVal);
    const isDigitPattern = /^[0-9\s\-\(\)]+$/.test(cleanVal);

    if (isDigitPattern && !hasLettersOrAt && cleanVal.length > 0) {
      const digitsOnly = cleanVal.replace(/\D/g, '').slice(0, 10);
      setRawInput(digitsOnly);
      setIsPhoneMode(true);
      setIdentifier(`${code}${digitsOnly}`);
    } else {
      setRawInput(val);
      setIsPhoneMode(false);
      setIdentifier(val);
    }
  };

  const handleCountrySelect = (country: CountryOption) => {
    if (!country.enabled) return;
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    if (isPhoneMode) {
      setIdentifier(`${country.code}${rawInput}`);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const role = authService.identifyRole(identifier);
    if (!role) {
      setErrorMessage('Invalid credentials. Please verify your details.');
      return;
    }

    setLoading(true);
    try {
      await authService.sendOtp(identifier);
      setSuccessMessage('Verification code sent successfully.');
      setStep('verify');
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Please verify your details.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    setLoading(true);
    try {
      const { role, data } = await authService.verifyOtp(identifier, otpToken);
      setSuccessMessage('Authenticated successfully. Redirecting...');
      setTimeout(() => {
        setSession(role, data);
      }, 800);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message ||
        err.message ||
        'Invalid verification code. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetStep = () => {
    setStep('request');
    setOtpToken('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return {
    identifier,
    rawInput,
    isPhoneMode,
    selectedCountry,
    isDropdownOpen,
    otpToken,
    step,
    loading,
    errorMessage,
    successMessage,
    theme,
    toggleTheme,
    handleInputChange,
    handleCountrySelect,
    handleRequestOtp,
    handleVerifyOtp,
    resetStep,
    setIsDropdownOpen,
    setOtpToken,
    setErrorMessage,
  };
}

export type UseLoginReturn = ReturnType<typeof useLogin>;
