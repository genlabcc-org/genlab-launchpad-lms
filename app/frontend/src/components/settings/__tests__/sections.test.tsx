import { describe, it, expect } from 'vitest';
import { AppearanceSettings } from '../sections/AppearanceSettings';
import { AccountSettings } from '../sections/AccountSettings';
import { PlatformSettings } from '../sections/PlatformSettings';
import { AccessibilitySettings } from '../sections/AccessibilitySettings';
import { SecuritySettings } from '../sections/SecuritySettings';

describe('Settings Sections Exports', () => {
  it('AppearanceSettings component should be defined and a function', () => {
    expect(AppearanceSettings).toBeDefined();
    expect(typeof AppearanceSettings).toBe('function');
  });

  it('AccountSettings component should be defined and a function', () => {
    expect(AccountSettings).toBeDefined();
    expect(typeof AccountSettings).toBe('function');
  });

  it('PlatformSettings component should be defined and a function', () => {
    expect(PlatformSettings).toBeDefined();
    expect(typeof PlatformSettings).toBe('function');
  });

  it('AccessibilitySettings component should be defined and a function', () => {
    expect(AccessibilitySettings).toBeDefined();
    expect(typeof AccessibilitySettings).toBe('function');
  });

  it('SecuritySettings component should be defined and a function', () => {
    expect(SecuritySettings).toBeDefined();
    expect(typeof SecuritySettings).toBe('function');
  });
});
