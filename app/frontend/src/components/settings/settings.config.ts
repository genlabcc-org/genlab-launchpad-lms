import { Palette, User, Globe, Accessibility, Shield } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { UserRole } from '../../store/authStore';

export interface SettingsSection {
  id: string;
  label: string;
  icon: LucideIcon;
  route: string;
  roles: UserRole[];
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: 'appearance',
    label: 'Appearance',
    icon: Palette,
    route: '/settings/appearance',
    roles: ['admin', 'mentor', 'student'],
  },
  {
    id: 'account',
    label: 'Account',
    icon: User,
    route: '/settings/account',
    roles: ['admin', 'mentor', 'student'],
  },
  {
    id: 'platform',
    label: 'Platform / Organization',
    icon: Globe,
    route: '/settings/platform',
    roles: ['admin'],
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    icon: Accessibility,
    route: '/settings/accessibility',
    roles: ['admin', 'mentor', 'student'],
  },
  {
    id: 'security',
    label: 'Security / Session',
    icon: Shield,
    route: '/settings/security',
    roles: ['admin', 'mentor'],
  },
];

/**
 * Filter settings sections by current user role.
 * Pure function following DRY/SOLID principles.
 */
export function filterSectionsByRole(sections: SettingsSection[], role: UserRole | null): SettingsSection[] {
  if (!role) return [];
  return sections.filter((section) => section.roles.includes(role));
}
