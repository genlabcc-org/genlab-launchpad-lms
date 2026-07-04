import { describe, it, expect } from 'vitest';
import { SETTINGS_SECTIONS, filterSectionsByRole } from '../settings.config';

describe('settings.config - filterSectionsByRole', () => {
  it('should return empty array if role is null', () => {
    const result = filterSectionsByRole(SETTINGS_SECTIONS, null);
    expect(result).toEqual([]);
  });

  it('should return all sections for admin role', () => {
    const result = filterSectionsByRole(SETTINGS_SECTIONS, 'admin');
    expect(result).toHaveLength(5);
    expect(result.map((s) => s.id)).toEqual([
      'appearance',
      'account',
      'platform',
      'accessibility',
      'security',
    ]);
  });

  it('should exclude platform config for mentor role', () => {
    const result = filterSectionsByRole(SETTINGS_SECTIONS, 'mentor');
    expect(result).toHaveLength(4);
    expect(result.map((s) => s.id)).toEqual([
      'appearance',
      'account',
      'accessibility',
      'security',
    ]);
    expect(result.find((s) => s.id === 'platform')).toBeUndefined();
  });

  it('should only return appearance and account for student role', () => {
    const result = filterSectionsByRole(SETTINGS_SECTIONS, 'student');
    expect(result).toHaveLength(3);
    expect(result.map((s) => s.id)).toEqual(['appearance', 'account', 'accessibility']);
    expect(result.find((s) => s.id === 'platform')).toBeUndefined();
    expect(result.find((s) => s.id === 'security')).toBeUndefined();
  });
});
