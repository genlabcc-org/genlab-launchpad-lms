/**
 * settingsStore — Data Layer
 * Single source of truth for all user preferences and platform configuration.
 * Owns: theme, activeCrmTheme, density, accessibility, platformConfig.
 *
 * authStore is ONLY authentication state.
 * This store is ONLY preference/settings state (SRP).
 */
import { create } from 'zustand';
import { getSettings, updateSettings } from '../api/settings';

// ─── Types ─────────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark';
export type CrmTheme = 'genlab' | 'zoho-crm' | 'odoo-crm' | 'sap-crm';
export type Density = 'comfortable' | 'compact';
export type FontSize = 'small' | 'medium' | 'large';

export interface AccessibilityPrefs {
  reduceMotion: boolean;
  fontSize: FontSize;
  highContrast: boolean;
}

export interface PlatformConfig {
  orgName: string;
  acceptedPaymentMethods: string[];
  studentTypes: string[];
  slotTimePresets: string[];
  enrollmentStatuses: string[];
  referralSources: string[];
  maxStudentPerSlotAllMentorAllCourse: number;
  maxStudentPerSlotPerMentor: number;
}

// ─── Platform config key constants (DRY — single definition) ──────────────

const PLATFORM_KEYS = {
  orgName: 'org.name',
  acceptedPaymentMethods: 'payment.accepted_methods',
  studentTypes: 'student.types',
  slotTimePresets: 'slot.time_presets',
  enrollmentStatuses: 'enrollment.statuses',
  referralSources: 'referral.sources',
  maxStudentPerSlotAllMentorAllCourse: 'max_student_per_slot_all_mentor_all_course',
  maxStudentPerSlotPerMentor: 'max_student_per_slot_per_mentor',
} as const;

const DEFAULT_PLATFORM_CONFIG: PlatformConfig = {
  orgName: 'PEC Developers Initiative',
  acceptedPaymentMethods: ['cash', 'upi', 'card', 'bank transfer'],
  studentTypes: ['studying student', 'fresher', 'professional'],
  slotTimePresets: ['10am-12pm', '2pm-4pm', '4pm-6pm'],
  enrollmentStatuses: ['active', 'suspended', 'completed'],
  referralSources: ['direct', 'school', 'college', 'existing student', 'other'],
  maxStudentPerSlotAllMentorAllCourse: 40,
  maxStudentPerSlotPerMentor: 12,
};

// ─── Helper: map backend key-value map → PlatformConfig ───────────────────

function mapToPlatformConfig(raw: Record<string, string>): PlatformConfig {
  const splitOrDefault = (key: string, fallback: string[]) => {
    const val = raw[key];
    return val ? val.split(',').map((s) => s.trim()).filter(Boolean) : fallback;
  };

  const parseIntOrDefault = (key: string, fallback: number) => {
    const val = raw[key];
    return val ? parseInt(val, 10) : fallback;
  };

  return {
    orgName: raw[PLATFORM_KEYS.orgName] ?? DEFAULT_PLATFORM_CONFIG.orgName,
    acceptedPaymentMethods: splitOrDefault(PLATFORM_KEYS.acceptedPaymentMethods, DEFAULT_PLATFORM_CONFIG.acceptedPaymentMethods),
    studentTypes: splitOrDefault(PLATFORM_KEYS.studentTypes, DEFAULT_PLATFORM_CONFIG.studentTypes),
    slotTimePresets: splitOrDefault(PLATFORM_KEYS.slotTimePresets, DEFAULT_PLATFORM_CONFIG.slotTimePresets),
    enrollmentStatuses: splitOrDefault(PLATFORM_KEYS.enrollmentStatuses, DEFAULT_PLATFORM_CONFIG.enrollmentStatuses),
    referralSources: splitOrDefault(PLATFORM_KEYS.referralSources, DEFAULT_PLATFORM_CONFIG.referralSources),
    maxStudentPerSlotAllMentorAllCourse: parseIntOrDefault(PLATFORM_KEYS.maxStudentPerSlotAllMentorAllCourse, DEFAULT_PLATFORM_CONFIG.maxStudentPerSlotAllMentorAllCourse),
    maxStudentPerSlotPerMentor: parseIntOrDefault(PLATFORM_KEYS.maxStudentPerSlotPerMentor, DEFAULT_PLATFORM_CONFIG.maxStudentPerSlotPerMentor),
  };
}

// ─── Helper: map PlatformConfig → backend key-value payload ───────────────

function mapToPayload(config: PlatformConfig): Record<string, string> {
  return {
    [PLATFORM_KEYS.orgName]: config.orgName,
    [PLATFORM_KEYS.acceptedPaymentMethods]: config.acceptedPaymentMethods?.join(',') ?? '',
    [PLATFORM_KEYS.studentTypes]: config.studentTypes?.join(',') ?? '',
    [PLATFORM_KEYS.slotTimePresets]: config.slotTimePresets?.join(',') ?? '',
    [PLATFORM_KEYS.enrollmentStatuses]: config.enrollmentStatuses?.join(',') ?? '',
    [PLATFORM_KEYS.referralSources]: config.referralSources?.join(',') ?? '',
    [PLATFORM_KEYS.maxStudentPerSlotAllMentorAllCourse]: String(config.maxStudentPerSlotAllMentorAllCourse ?? DEFAULT_PLATFORM_CONFIG.maxStudentPerSlotAllMentorAllCourse),
    [PLATFORM_KEYS.maxStudentPerSlotPerMentor]: String(config.maxStudentPerSlotPerMentor ?? DEFAULT_PLATFORM_CONFIG.maxStudentPerSlotPerMentor),
  };
}

// ─── Store Interface ───────────────────────────────────────────────────────

interface SettingsState {
  // Appearance prefs (localStorage)
  theme: Theme;
  activeCrmTheme: CrmTheme;
  density: Density;
  sidebarCollapsedByDefault: boolean;

  // Accessibility prefs (localStorage)
  accessibility: AccessibilityPrefs;

  // Platform config (backend-synced, admin only)
  platformConfig: PlatformConfig;
  platformConfigLoading: boolean;
  platformConfigError: string | null;

  // Actions — Appearance
  setTheme: (theme: Theme) => void;
  setCrmTheme: (skin: CrmTheme) => void;
  setDensity: (density: Density) => void;
  setSidebarCollapsedByDefault: (collapsed: boolean) => void;

  // Actions — Accessibility
  setAccessibility: (partial: Partial<AccessibilityPrefs>) => void;

  // Actions — Platform Config
  fetchPlatformConfig: () => Promise<void>;
  savePlatformConfig: (draft: PlatformConfig) => Promise<void>;

  // Lifecycle
  initialize: () => void;
}

// ─── Store Implementation ──────────────────────────────────────────────────

export const useSettingsStore = create<SettingsState>((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────────
  theme: 'dark',
  activeCrmTheme: 'genlab',
  density: 'comfortable',
  sidebarCollapsedByDefault: false,
  accessibility: {
    reduceMotion: false,
    fontSize: 'medium',
    highContrast: false,
  },
  platformConfig: { ...DEFAULT_PLATFORM_CONFIG },
  platformConfigLoading: false,
  platformConfigError: null,

  // ── Appearance Actions ─────────────────────────────────────────────
  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem('settings.theme', theme);
  },

  setCrmTheme: (skin) => {
    set({ activeCrmTheme: skin });
    localStorage.setItem('settings.activeCrmTheme', skin);
  },

  setDensity: (density) => {
    set({ density });
    localStorage.setItem('settings.density', density);
  },

  setSidebarCollapsedByDefault: (collapsed) => {
    set({ sidebarCollapsedByDefault: collapsed });
    localStorage.setItem('settings.sidebarCollapsedByDefault', String(collapsed));
  },

  // ── Accessibility Actions ──────────────────────────────────────────
  setAccessibility: (partial) => {
    const next = { ...get().accessibility, ...partial };
    set({ accessibility: next });
    localStorage.setItem('settings.accessibility', JSON.stringify(next));
  },

  // ── Platform Config Actions ────────────────────────────────────────
  fetchPlatformConfig: async () => {
    set({ platformConfigLoading: true, platformConfigError: null });
    try {
      const raw = await getSettings();
      set({ platformConfig: mapToPlatformConfig(raw), platformConfigLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load settings';
      set({ platformConfigLoading: false, platformConfigError: message });
    }
  },

  savePlatformConfig: async (draft) => {
    set({ platformConfigLoading: true, platformConfigError: null });
    try {
      await updateSettings(mapToPayload(draft));
      set({ platformConfig: draft, platformConfigLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save settings';
      set({ platformConfigLoading: false, platformConfigError: message });
      throw err; // re-throw so UI can show toast
    }
  },

  // ── Lifecycle ─────────────────────────────────────────────────────
  initialize: () => {
    const theme = (localStorage.getItem('settings.theme') as Theme) ?? 'dark';
    const activeCrmTheme = (localStorage.getItem('settings.activeCrmTheme') as CrmTheme) ?? 'genlab';
    const density = (localStorage.getItem('settings.density') as Density) ?? 'comfortable';
    const sidebarCollapsedByDefault =
      localStorage.getItem('settings.sidebarCollapsedByDefault') === 'true';
    const rawAccessibility = localStorage.getItem('settings.accessibility');
    const accessibility: AccessibilityPrefs = rawAccessibility
      ? (JSON.parse(rawAccessibility) as AccessibilityPrefs)
      : { reduceMotion: false, fontSize: 'medium', highContrast: false };

    set({ theme, activeCrmTheme, density, sidebarCollapsedByDefault, accessibility });
  },
}));

export default useSettingsStore;
