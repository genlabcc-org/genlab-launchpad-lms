import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../setupTests';
import { mentorApi } from '../mentor';
import type { MentorSlotsParams } from '../mentor';
import {
  BASE_URL,
  mockMentor,
  mockMentorSchedule,
  mockMessage,
} from '../mocks/fixtures';

// ─── getDashboard ──────────────────────────────────────────────────

describe('mentorApi.getDashboard()', () => {
  it('should GET /api/mentor/dashboard and return message', async () => {
    server.use(
      http.get(`${BASE_URL}/api/mentor/dashboard`, () =>
        HttpResponse.json(mockMessage),
      ),
    );

    const result = await mentorApi.getDashboard();
    expect(result).toEqual(mockMessage);
  });

  it('should reject on 401 Unauthorized', async () => {
    server.use(
      http.get(`${BASE_URL}/api/mentor/dashboard`, () =>
        new HttpResponse(null, { status: 401 }),
      ),
    );

    await expect(mentorApi.getDashboard()).rejects.toThrow();
  });

  it('should reject on 500 Internal Server Error', async () => {
    server.use(
      http.get(`${BASE_URL}/api/mentor/dashboard`, () =>
        new HttpResponse(null, { status: 500 }),
      ),
    );

    await expect(mentorApi.getDashboard()).rejects.toThrow();
  });
});

// ─── getProfile ────────────────────────────────────────────────────

describe('mentorApi.getProfile()', () => {
  it('should GET /api/mentor/profile and return MentorDto', async () => {
    server.use(
      http.get(`${BASE_URL}/api/mentor/profile`, () =>
        HttpResponse.json(mockMentor),
      ),
    );

    const result = await mentorApi.getProfile();
    expect(result).toEqual(mockMentor);
    expect(result.name).toBe('Jane Smith');
    expect(result.email).toBe('jane@example.com');
  });

  it('should reject on 401 Unauthorized', async () => {
    server.use(
      http.get(`${BASE_URL}/api/mentor/profile`, () =>
        new HttpResponse(null, { status: 401 }),
      ),
    );

    await expect(mentorApi.getProfile()).rejects.toThrow();
  });

  it('should reject on network failure', async () => {
    server.use(
      http.get(`${BASE_URL}/api/mentor/profile`, () => HttpResponse.error()),
    );

    await expect(mentorApi.getProfile()).rejects.toThrow();
  });
});

// ─── getSlots ──────────────────────────────────────────────────────

describe('mentorApi.getSlots()', () => {
  it('should GET /api/mentor/slots without params and return schedules', async () => {
    const mockSchedules = [mockMentorSchedule];

    server.use(
      http.get(`${BASE_URL}/api/mentor/slots`, () =>
        HttpResponse.json(mockSchedules),
      ),
    );

    const result = await mentorApi.getSlots();
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockMentorSchedule);
    expect(result[0].students).toHaveLength(1);
  });

  it('should pass date query parameter', async () => {
    let capturedUrl: URL | undefined;

    server.use(
      http.get(`${BASE_URL}/api/mentor/slots`, ({ request }) => {
        capturedUrl = new URL(request.url);
        return HttpResponse.json([mockMentorSchedule]);
      }),
    );

    const params: MentorSlotsParams = { date: '2026-07-15' };
    await mentorApi.getSlots(params);

    expect(capturedUrl?.searchParams.get('date')).toBe('2026-07-15');
  });

  it('should pass startDate and endDate query parameters', async () => {
    let capturedUrl: URL | undefined;

    server.use(
      http.get(`${BASE_URL}/api/mentor/slots`, ({ request }) => {
        capturedUrl = new URL(request.url);
        return HttpResponse.json([]);
      }),
    );

    const params: MentorSlotsParams = {
      startDate: '2026-07-01',
      endDate: '2026-07-31',
    };
    await mentorApi.getSlots(params);

    expect(capturedUrl?.searchParams.get('startDate')).toBe('2026-07-01');
    expect(capturedUrl?.searchParams.get('endDate')).toBe('2026-07-31');
  });

  it('should return an empty array when no slots exist', async () => {
    server.use(
      http.get(`${BASE_URL}/api/mentor/slots`, () =>
        HttpResponse.json([]),
      ),
    );

    const result = await mentorApi.getSlots();
    expect(result).toEqual([]);
  });

  it('should reject on 401 Unauthorized', async () => {
    server.use(
      http.get(`${BASE_URL}/api/mentor/slots`, () =>
        new HttpResponse(null, { status: 401 }),
      ),
    );

    await expect(mentorApi.getSlots()).rejects.toThrow();
  });
});
