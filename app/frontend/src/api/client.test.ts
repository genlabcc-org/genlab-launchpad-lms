import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from './setupTests';
import { apiClient, SESSION_DURATION_DAYS } from './client';

const BASE_URL = 'http://localhost:8080';

// ─── Configuration ─────────────────────────────────────────────────

describe('apiClient – Configuration', () => {
  it('should have withCredentials set to true (cookie-based auth)', () => {
    expect(apiClient.defaults.withCredentials).toBe(true);
  });

  it('should have Content-Type set to application/json', () => {
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('should have a 15-second timeout', () => {
    expect(apiClient.defaults.timeout).toBe(15000);
  });

  it('should use localhost:8080 as default baseURL', () => {
    expect(apiClient.defaults.baseURL).toBe(BASE_URL);
  });

  it('should export SESSION_DURATION_DAYS as 30', () => {
    expect(SESSION_DURATION_DAYS).toBe(30);
  });
});

// ─── 401 Interceptor ──────────────────────────────────────────────

describe('apiClient – 401 Response Interceptor', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should clear userRole from localStorage on 401 response', async () => {
    localStorage.setItem('userRole', 'ADMIN');
    expect(localStorage.getItem('userRole')).toBe('ADMIN');

    server.use(
      http.get(`${BASE_URL}/api/test-401`, () =>
        new HttpResponse(null, { status: 401 }),
      ),
    );

    await expect(apiClient.get('/api/test-401')).rejects.toThrow();
    expect(localStorage.getItem('userRole')).toBeNull();
  });

  it('should NOT clear userRole on non-401 errors', async () => {
    localStorage.setItem('userRole', 'STUDENT');

    server.use(
      http.get(`${BASE_URL}/api/test-500`, () =>
        new HttpResponse(null, { status: 500 }),
      ),
    );

    await expect(apiClient.get('/api/test-500')).rejects.toThrow();
    expect(localStorage.getItem('userRole')).toBe('STUDENT');
  });

  it('should NOT clear userRole on 403 Forbidden', async () => {
    localStorage.setItem('userRole', 'STUDENT');

    server.use(
      http.get(`${BASE_URL}/api/test-403`, () =>
        new HttpResponse(null, { status: 403 }),
      ),
    );

    await expect(apiClient.get('/api/test-403')).rejects.toThrow();
    expect(localStorage.getItem('userRole')).toBe('STUDENT');
  });

  it('should still propagate the rejection after clearing localStorage', async () => {
    localStorage.setItem('userRole', 'MENTOR');

    server.use(
      http.get(`${BASE_URL}/api/test-auth`, () =>
        new HttpResponse(null, { status: 401 }),
      ),
    );

    const promise = apiClient.get('/api/test-auth');
    await expect(promise).rejects.toThrow();
    // Verify the error has the correct status
    try {
      await apiClient.get('/api/test-auth');
    } catch (error: any) {
      expect(error.response.status).toBe(401);
    }
  });

  it('should handle 401 gracefully when userRole is not in localStorage', async () => {
    // No userRole set at all
    expect(localStorage.getItem('userRole')).toBeNull();

    server.use(
      http.get(`${BASE_URL}/api/test-no-role`, () =>
        new HttpResponse(null, { status: 401 }),
      ),
    );

    await expect(apiClient.get('/api/test-no-role')).rejects.toThrow();
    expect(localStorage.getItem('userRole')).toBeNull();
  });

  it('should pass through successful responses unchanged', async () => {
    const mockData = { message: 'success' };

    server.use(
      http.get(`${BASE_URL}/api/test-success`, () =>
        HttpResponse.json(mockData),
      ),
    );

    const response = await apiClient.get('/api/test-success');
    expect(response.data).toEqual(mockData);
    expect(response.status).toBe(200);
  });

  it('should handle network errors (no response object)', async () => {
    server.use(
      http.get(`${BASE_URL}/api/test-network`, () =>
        HttpResponse.error(),
      ),
    );

    // Network errors have no response.status, so userRole should NOT be cleared
    localStorage.setItem('userRole', 'ADMIN');

    await expect(apiClient.get('/api/test-network')).rejects.toThrow();
    // The interceptor checks error.response && error.response.status === 401
    // Network errors have no response, so userRole should remain
    expect(localStorage.getItem('userRole')).toBe('ADMIN');
  });
});

// ─── Request Defaults ──────────────────────────────────────────────

describe('apiClient – Request Defaults', () => {
  it('should send JSON Content-Type header with requests', async () => {
    let capturedContentType: string | null = null;

    server.use(
      http.post(`${BASE_URL}/api/test-headers`, ({ request }) => {
        capturedContentType = request.headers.get('Content-Type');
        return HttpResponse.json({ ok: true });
      }),
    );

    await apiClient.post('/api/test-headers', { key: 'value' });
    expect(capturedContentType).toContain('application/json');
  });
});
