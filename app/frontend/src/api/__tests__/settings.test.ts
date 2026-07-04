import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../setupTests';
import { getSettings, updateSettings } from '../settings';
import { BASE_URL } from '../mocks/fixtures';

describe('settingsApi – getSettings', () => {
  it('should GET /admin/settings and return the key-value map', async () => {
    const mockSettings = {
      'org.name': 'PEC Developers Initiative',
      'payment.accepted_methods': 'cash,upi',
    };

    server.use(
      http.get(`${BASE_URL}/admin/settings`, () => {
        return HttpResponse.json(mockSettings);
      }),
    );

    const result = await getSettings();

    expect(result).toEqual(mockSettings);
    expect(result['org.name']).toBe('PEC Developers Initiative');
  });

  it('should return an empty object when no settings exist', async () => {
    server.use(
      http.get(`${BASE_URL}/admin/settings`, () => {
        return HttpResponse.json({});
      }),
    );

    const result = await getSettings();
    expect(result).toEqual({});
  });
});

describe('settingsApi – updateSettings', () => {
  it('should PUT /admin/settings with the correct payload', async () => {
    let capturedBody: Record<string, string> | undefined;

    server.use(
      http.put(`${BASE_URL}/admin/settings`, async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, string>;
        return HttpResponse.json({ message: 'Settings updated successfully' });
      }),
    );

    await updateSettings({ 'org.name': 'New Org Name' });

    expect(capturedBody).toEqual({ 'org.name': 'New Org Name' });
  });

  it('should resolve without error on successful PUT', async () => {
    server.use(
      http.put(`${BASE_URL}/admin/settings`, () => {
        return HttpResponse.json({ message: 'Settings updated successfully' });
      }),
    );

    await expect(updateSettings({ 'org.name': 'Test' })).resolves.toBeUndefined();
  });
});
