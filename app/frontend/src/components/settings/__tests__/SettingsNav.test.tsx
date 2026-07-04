import { describe, it, expect } from 'vitest';
import { SettingsNav } from '../SettingsNav';

describe('SettingsNav component', () => {
  it('should export SettingsNav component successfully', () => {
    expect(SettingsNav).toBeDefined();
    expect(typeof SettingsNav).toBe('function');
  });
});
