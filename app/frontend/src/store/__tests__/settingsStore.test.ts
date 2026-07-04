import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSettingsStore } from '../settingsStore';
import * as settingsApi from '../../api/settings';

vi.mock('../../api/settings', () => ({
  getSettings: vi.fn(),
  updateSettings: vi.fn(),
}));

describe('settingsStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    
    // Reset Zustand store state before each test
    useSettingsStore.setState({
      theme: 'dark',
      activeCrmTheme: 'genlab',
      density: 'comfortable',
      sidebarCollapsedByDefault: false,
      accessibility: {
        reduceMotion: false,
        fontSize: 'medium',
        highContrast: false,
      },
      platformConfig: {
        orgName: 'PEC Developers Initiative',
        acceptedPaymentMethods: ['cash', 'upi', 'card', 'bank transfer'],
        studentTypes: ['studying student', 'fresher', 'professional'],
        slotTimePresets: ['10am-12pm', '2pm-4pm', '4pm-6pm'],
        enrollmentStatuses: ['active', 'suspended', 'completed'],
        referralSources: ['direct', 'school', 'college', 'existing student', 'other'],
        maxStudentPerSlotAllMentorAllCourse: 40,
        maxStudentPerSlotPerMentor: 12,
      },
      platformConfigLoading: false,
      platformConfigError: null,
    });
  });

  describe('setTheme', () => {
    it('should update theme state and persist to localStorage', () => {
      useSettingsStore.getState().setTheme('light');
      expect(useSettingsStore.getState().theme).toBe('light');
      expect(localStorage.getItem('settings.theme')).toBe('light');
    });
  });

  describe('setDensity', () => {
    it('should update density state and persist to localStorage', () => {
      useSettingsStore.getState().setDensity('compact');
      expect(useSettingsStore.getState().density).toBe('compact');
      expect(localStorage.getItem('settings.density')).toBe('compact');
    });
  });

  describe('setAccessibility', () => {
    it('should update accessibility state partially and persist to localStorage', () => {
      useSettingsStore.getState().setAccessibility({ reduceMotion: true });
      expect(useSettingsStore.getState().accessibility.reduceMotion).toBe(true);
      expect(useSettingsStore.getState().accessibility.fontSize).toBe('medium');

      const saved = JSON.parse(localStorage.getItem('settings.accessibility') || '{}');
      expect(saved.reduceMotion).toBe(true);
      expect(saved.fontSize).toBe('medium');
    });
  });

  describe('initialize', () => {
    it('should load states from localStorage when present', () => {
      localStorage.setItem('settings.theme', 'light');
      localStorage.setItem('settings.density', 'compact');
      localStorage.setItem('settings.sidebarCollapsedByDefault', 'true');
      localStorage.setItem(
        'settings.accessibility',
        JSON.stringify({ reduceMotion: true, fontSize: 'large', highContrast: true })
      );

      useSettingsStore.getState().initialize();

      expect(useSettingsStore.getState().theme).toBe('light');
      expect(useSettingsStore.getState().density).toBe('compact');
      expect(useSettingsStore.getState().sidebarCollapsedByDefault).toBe(true);
      expect(useSettingsStore.getState().accessibility).toEqual({
        reduceMotion: true,
        fontSize: 'large',
        highContrast: true,
      });
    });
  });

  describe('fetchPlatformConfig', () => {
    it('should fetch settings from API and hydrate platformConfig', async () => {
      const mockBackendSettings = {
        'org.name': 'Custom Org Name',
        'payment.accepted_methods': 'cash,upi,card',
        'student.types': 'freshers,seniors',
      };

      vi.mocked(settingsApi.getSettings).mockResolvedValue(mockBackendSettings);

      await useSettingsStore.getState().fetchPlatformConfig();

      expect(useSettingsStore.getState().platformConfig.orgName).toBe('Custom Org Name');
      expect(useSettingsStore.getState().platformConfig.acceptedPaymentMethods).toEqual([
        'cash',
        'upi',
        'card',
      ]);
      expect(useSettingsStore.getState().platformConfig.studentTypes).toEqual([
        'freshers',
        'seniors',
      ]);
      expect(useSettingsStore.getState().platformConfigLoading).toBe(false);
      expect(useSettingsStore.getState().platformConfigError).toBeNull();
    });

    it('should handle API errors and set platformConfigError state', async () => {
      vi.mocked(settingsApi.getSettings).mockRejectedValue(new Error('Network error'));

      await useSettingsStore.getState().fetchPlatformConfig();

      expect(useSettingsStore.getState().platformConfigError).toBe('Network error');
      expect(useSettingsStore.getState().platformConfigLoading).toBe(false);
    });
  });

  describe('savePlatformConfig', () => {
    it('should map platformConfig to key-value payload and send via API', async () => {
      vi.mocked(settingsApi.updateSettings).mockResolvedValue();

      const newConfig = {
        orgName: 'New Org Name',
        acceptedPaymentMethods: ['upi'],
        studentTypes: ['fresher'],
        slotTimePresets: ['1pm-2pm'],
        enrollmentStatuses: ['active'],
        referralSources: ['other'],
        maxStudentPerSlotAllMentorAllCourse: 40,
        maxStudentPerSlotPerMentor: 12,
      };

      await useSettingsStore.getState().savePlatformConfig(newConfig);

      expect(settingsApi.updateSettings).toHaveBeenCalledWith({
        'org.name': 'New Org Name',
        'payment.accepted_methods': 'upi',
        'student.types': 'fresher',
        'slot.time_presets': '1pm-2pm',
        'enrollment.statuses': 'active',
        'referral.sources': 'other',
        'max_student_per_slot_all_mentor_all_course': '40',
        'max_student_per_slot_per_mentor': '12',
      });
      expect(useSettingsStore.getState().platformConfig).toEqual(newConfig);
    });
  });
});
