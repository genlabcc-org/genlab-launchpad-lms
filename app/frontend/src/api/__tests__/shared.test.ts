import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../setupTests';
import { sharedApi } from '../shared';
import {
  BASE_URL,
  IDS,
  mockPayment,
} from '../mocks/fixtures';

// ─── getEnrollmentPayments ─────────────────────────────────────────

describe('sharedApi.getEnrollmentPayments()', () => {
  const url = `${BASE_URL}/api/enrollments/${IDS.enrollment}/payments`;

  it('should GET payments for an enrollment and return array', async () => {
    server.use(
      http.get(url, () => HttpResponse.json([mockPayment])),
    );

    const result = await sharedApi.getEnrollmentPayments(IDS.enrollment);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockPayment);
    expect(result[0].status).toBe('completed');
  });

  it('should return an empty array when no payments exist', async () => {
    server.use(
      http.get(url, () => HttpResponse.json([])),
    );

    const result = await sharedApi.getEnrollmentPayments(IDS.enrollment);
    expect(result).toEqual([]);
  });

  it('should interpolate the enrollmentId correctly in the URL', async () => {
    let capturedUrl: string | undefined;

    server.use(
      http.get(`${BASE_URL}/api/enrollments/:enrollmentId/payments`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([]);
      }),
    );

    await sharedApi.getEnrollmentPayments(IDS.enrollment);
    expect(capturedUrl).toContain(`/api/enrollments/${IDS.enrollment}/payments`);
  });

  it('should reject on 404 (enrollment not found)', async () => {
    server.use(
      http.get(url, () =>
        HttpResponse.json({ message: 'Enrollment not found' }, { status: 404 }),
      ),
    );

    await expect(sharedApi.getEnrollmentPayments(IDS.enrollment)).rejects.toThrow();
  });

  it('should reject on 401 Unauthorized', async () => {
    server.use(
      http.get(url, () => new HttpResponse(null, { status: 401 })),
    );

    await expect(sharedApi.getEnrollmentPayments(IDS.enrollment)).rejects.toThrow();
  });
});

// ─── getEnrollmentPaymentDetails ───────────────────────────────────

describe('sharedApi.getEnrollmentPaymentDetails()', () => {
  const url = `${BASE_URL}/api/enrollments/${IDS.enrollment}/payments/${IDS.payment}`;

  it('should GET a single payment by enrollmentId + paymentId', async () => {
    server.use(
      http.get(url, () => HttpResponse.json(mockPayment)),
    );

    const result = await sharedApi.getEnrollmentPaymentDetails(IDS.enrollment, IDS.payment);
    expect(result).toEqual(mockPayment);
    expect(result.id).toBe(IDS.payment);
    expect(result.enrollmentId).toBe(IDS.enrollment);
  });

  it('should interpolate both IDs correctly in the URL', async () => {
    let capturedUrl: string | undefined;

    server.use(
      http.get(
        `${BASE_URL}/api/enrollments/:enrollmentId/payments/:paymentId`,
        ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json(mockPayment);
        },
      ),
    );

    await sharedApi.getEnrollmentPaymentDetails(IDS.enrollment, IDS.payment);
    expect(capturedUrl).toContain(`/api/enrollments/${IDS.enrollment}/payments/${IDS.payment}`);
  });

  it('should reject on 404 (payment not found)', async () => {
    server.use(
      http.get(url, () =>
        HttpResponse.json({ message: 'Payment not found' }, { status: 404 }),
      ),
    );

    await expect(
      sharedApi.getEnrollmentPaymentDetails(IDS.enrollment, IDS.payment),
    ).rejects.toThrow();
  });

  it('should reject on server error', async () => {
    server.use(
      http.get(url, () => new HttpResponse(null, { status: 500 })),
    );

    await expect(
      sharedApi.getEnrollmentPaymentDetails(IDS.enrollment, IDS.payment),
    ).rejects.toThrow();
  });
});

// ─── getHealth ─────────────────────────────────────────────────────

describe('sharedApi.getHealth()', () => {
  it('should GET /health and return message', async () => {
    const healthResponse = { message: 'UP' };

    server.use(
      http.get(`${BASE_URL}/health`, () =>
        HttpResponse.json(healthResponse),
      ),
    );

    const result = await sharedApi.getHealth();
    expect(result).toEqual(healthResponse);
    expect(result.message).toBe('UP');
  });

  it('should reject on 503 Service Unavailable', async () => {
    server.use(
      http.get(`${BASE_URL}/health`, () =>
        new HttpResponse(null, { status: 503 }),
      ),
    );

    await expect(sharedApi.getHealth()).rejects.toThrow();
  });

  it('should reject on network failure', async () => {
    server.use(
      http.get(`${BASE_URL}/health`, () => HttpResponse.error()),
    );

    await expect(sharedApi.getHealth()).rejects.toThrow();
  });
});
