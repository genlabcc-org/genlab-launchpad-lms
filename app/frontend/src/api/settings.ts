/**
 * Settings API Layer
 * Responsible for raw Axios-based API requests for system settings.
 * All communication is exclusively through the Spring Boot backend — never directly to Supabase.
 */
import { apiClient } from './client';

/**
 * Fetches all system settings as a key-value map from the backend.
 * Only accessible by admin role (enforced server-side via @RequiresRole).
 */
export async function getSettings(): Promise<Record<string, string>> {
  const response = await apiClient.get<Record<string, string>>('/admin/settings');
  return response.data;
}

/**
 * Upserts one or more system settings on the backend.
 * Only accessible by admin role (enforced server-side via @RequiresRole).
 */
export async function updateSettings(payload: Record<string, string>): Promise<void> {
  await apiClient.put('/admin/settings', payload);
}
