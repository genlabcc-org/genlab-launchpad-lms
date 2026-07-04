import { describe, it, expect } from 'vitest';
import { SettingsDrawer } from '../SettingsDrawer';

describe('SettingsDrawer component', () => {
  it('should export SettingsDrawer component successfully', () => {
    expect(SettingsDrawer).toBeDefined();
    expect(typeof SettingsDrawer).toBe('function');
  });
});
