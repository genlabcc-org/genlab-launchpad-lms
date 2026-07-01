import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from './setupTests';
import { studentApi } from './student';
import {
  BASE_URL,
  mockStudent,
  mockStudentEnrollment,
  mockMessage,
} from './mocks/fixtures';

// ─── getDashboard ──────────────────────────────────────────────────

describe('studentApi.getDashboard()', () => {
  it('should GET /api/student/dashboard and return message', async () => {
    server.use(
      http.get(`${BASE_URL}/api/student/dashboard`, () =>
        HttpResponse.json(mockMessage),
      ),
    );

    const result = await studentApi.getDashboard();
    expect(result).toEqual(mockMessage);
  });

  it('should reject on 401 Unauthorized', async () => {
    server.use(
      http.get(`${BASE_URL}/api/student/dashboard`, () =>
        new HttpResponse(null, { status: 401 }),
      ),
    );

    await expect(studentApi.getDashboard()).rejects.toThrow();
  });

  it('should reject on 500 Internal Server Error', async () => {
    server.use(
      http.get(`${BASE_URL}/api/student/dashboard`, () =>
        new HttpResponse(null, { status: 500 }),
      ),
    );

    await expect(studentApi.getDashboard()).rejects.toThrow();
  });
});

// ─── getProfile ────────────────────────────────────────────────────

describe('studentApi.getProfile()', () => {
  it('should GET /api/student/profile and return StudentDto', async () => {
    server.use(
      http.get(`${BASE_URL}/api/student/profile`, () =>
        HttpResponse.json(mockStudent),
      ),
    );

    const result = await studentApi.getProfile();
    expect(result).toEqual(mockStudent);
    expect(result.name).toBe('John Doe');
    expect(result.email).toBe('john@example.com');
    expect(result.gender).toBe('male');
    expect(result.studentType).toBe('student');
  });

  it('should handle profile with optional fields undefined', async () => {
    const minimalStudent = {
      id: mockStudent.id,
      name: 'Minimal User',
    };

    server.use(
      http.get(`${BASE_URL}/api/student/profile`, () =>
        HttpResponse.json(minimalStudent),
      ),
    );

    const result = await studentApi.getProfile();
    expect(result.id).toBe(mockStudent.id);
    expect(result.name).toBe('Minimal User');
    expect(result.email).toBeUndefined();
  });

  it('should reject on 401 Unauthorized', async () => {
    server.use(
      http.get(`${BASE_URL}/api/student/profile`, () =>
        new HttpResponse(null, { status: 401 }),
      ),
    );

    await expect(studentApi.getProfile()).rejects.toThrow();
  });

  it('should reject on network failure', async () => {
    server.use(
      http.get(`${BASE_URL}/api/student/profile`, () => HttpResponse.error()),
    );

    await expect(studentApi.getProfile()).rejects.toThrow();
  });
});

// ─── getCurrentEnrollment ──────────────────────────────────────────

describe('studentApi.getCurrentEnrollment()', () => {
  it('should GET /api/student/enrollments/current and return enrollment', async () => {
    server.use(
      http.get(`${BASE_URL}/api/student/enrollments/current`, () =>
        HttpResponse.json(mockStudentEnrollment),
      ),
    );

    const result = await studentApi.getCurrentEnrollment();
    expect(result).toEqual(mockStudentEnrollment);
    expect(result.status).toBe('active');
    expect(result.course).toBeDefined();
    expect(result.mentorSchedule).toBeDefined();
    expect(result.payments).toHaveLength(1);
  });

  it('should reject on 404 (no active enrollment)', async () => {
    server.use(
      http.get(`${BASE_URL}/api/student/enrollments/current`, () =>
        HttpResponse.json({ message: 'No active enrollment' }, { status: 404 }),
      ),
    );

    await expect(studentApi.getCurrentEnrollment()).rejects.toThrow();
  });

  it('should reject on 401 Unauthorized', async () => {
    server.use(
      http.get(`${BASE_URL}/api/student/enrollments/current`, () =>
        new HttpResponse(null, { status: 401 }),
      ),
    );

    await expect(studentApi.getCurrentEnrollment()).rejects.toThrow();
  });
});

// ─── getPastEnrollments ────────────────────────────────────────────

describe('studentApi.getPastEnrollments()', () => {
  it('should GET /api/student/enrollments/past and return an array', async () => {
    const pastEnrollments = [
      { ...mockStudentEnrollment, status: 'completed' },
    ];

    server.use(
      http.get(`${BASE_URL}/api/student/enrollments/past`, () =>
        HttpResponse.json(pastEnrollments),
      ),
    );

    const result = await studentApi.getPastEnrollments();
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('completed');
  });

  it('should return an empty array when no past enrollments exist', async () => {
    server.use(
      http.get(`${BASE_URL}/api/student/enrollments/past`, () =>
        HttpResponse.json([]),
      ),
    );

    const result = await studentApi.getPastEnrollments();
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should reject on server error', async () => {
    server.use(
      http.get(`${BASE_URL}/api/student/enrollments/past`, () =>
        new HttpResponse(null, { status: 500 }),
      ),
    );

    await expect(studentApi.getPastEnrollments()).rejects.toThrow();
  });
});
