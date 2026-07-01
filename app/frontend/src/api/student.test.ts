import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from './setupTests';
import { studentApi } from './student';
import type { StudentDto } from './types';

describe('studentApi.getProfile()', () => {
  it('should intercept getProfile call and return mock profile payload', async () => {
    const mockStudent: StudentDto = {
      id: 'd9b23b14-0d35-4424-9b5a-94071b7b7a14',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      gender: 'male',
      personalMobile: '1234567890',
      emergencyMobile: '0987654321',
      address: '123 Test St',
      addressProofKey: undefined,
      addressProofUrl: undefined,
      institutionName: 'Test University',
      studentType: 'student',
      referralSource: 'Search',
      paymentType: 'full payment',
      registeredCourseId: 'a123b456-c789-d012-e345-f67890123456',
      assignedMentorId: 'b123b456-c789-d012-e345-f67890123456',
      timeSlotId: 'c123b456-c789-d012-e345-f67890123456',
      startDate: '2026-07-01',
      endDate: '2026-08-01',
      totalAmount: 1000,
      pendingAmount: 0,
      profilePhotoKey: undefined,
      profilePhotoUrl: undefined,
      termsAccepted: true,
      createdAt: '2026-07-01T12:00:00Z',
    };

    // Intercept GET /api/student/profile
    server.use(
      http.get('http://localhost:8080/api/student/profile', () => {
        return HttpResponse.json(mockStudent);
      })
    );

    const profile = await studentApi.getProfile();
    expect(profile).toEqual(mockStudent);
    expect(profile.name).toBe('John Doe');
    expect(profile.email).toBe('john@example.com');
  });

  it('should propagate network/server errors correctly', async () => {
    server.use(
      http.get('http://localhost:8080/api/student/profile', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    await expect(studentApi.getProfile()).rejects.toThrow();
  });
});
