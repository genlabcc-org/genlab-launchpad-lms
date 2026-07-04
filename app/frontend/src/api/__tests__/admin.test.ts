import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../setupTests';
import { adminApi } from '../admin';
import {
  BASE_URL,
  IDS,
  mockMessage,
  mockCourse,
  mockCourseRequest,
  mockEnrollment,
  mockEnrollmentRequest,
  mockMentor,
  mockCreateUserRequest,
  mockCreateUserResponse,
  mockUpdateMentorRequest,
  mockPayment,
  mockRecordPaymentRequest,
  mockUpdatePaymentRequest,
  mockSlot,
  mockCreateSlotRequest,
  mockStudent,
  mockUpdateStudentRequest,
  mockPresignedUrl,
} from '../mocks/fixtures';

// ─── Helpers ───────────────────────────────────────────────────────

/** Creates an MSW handler that captures the request body for assertion. */
function capturePostHandler<T>(url: string, response: unknown, status = 200) {
  let captured: T | undefined;
  const handler = http.post(url, async ({ request }) => {
    captured = (await request.json()) as T;
    return HttpResponse.json(response as any, { status });
  });
  return { handler, getCaptured: () => captured };
}

function capturePutHandler<T>(url: string, response: unknown) {
  let captured: T | undefined;
  const handler = http.put(url, async ({ request }) => {
    captured = (await request.json()) as T;
    return HttpResponse.json(response as any);
  });
  return { handler, getCaptured: () => captured };
}

// ─── Dashboard ─────────────────────────────────────────────────────

describe('adminApi – Dashboard', () => {
  it('should GET /api/admin/dashboard and return message', async () => {
    server.use(
      http.get(`${BASE_URL}/api/admin/dashboard`, () =>
        HttpResponse.json(mockMessage),
      ),
    );

    const result = await adminApi.getDashboard();
    expect(result).toEqual(mockMessage);
  });

  it('should reject on 401 Unauthorized', async () => {
    server.use(
      http.get(`${BASE_URL}/api/admin/dashboard`, () =>
        new HttpResponse(null, { status: 401 }),
      ),
    );

    await expect(adminApi.getDashboard()).rejects.toThrow();
  });

  it('should reject on 403 Forbidden', async () => {
    server.use(
      http.get(`${BASE_URL}/api/admin/dashboard`, () =>
        new HttpResponse(null, { status: 403 }),
      ),
    );

    await expect(adminApi.getDashboard()).rejects.toThrow();
  });
});

// ─── Courses ───────────────────────────────────────────────────────

describe('adminApi – Courses', () => {
  describe('getAllCourses', () => {
    it('should GET /api/admin/courses and return array', async () => {
      server.use(
        http.get(`${BASE_URL}/api/admin/courses`, () =>
          HttpResponse.json([mockCourse]),
        ),
      );

      const result = await adminApi.getAllCourses();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Full Stack Development');
      expect(result[0].mentors).toHaveLength(1);
      expect(result[0].syllabus).toContain('React');
    });

    it('should return empty array when no courses exist', async () => {
      server.use(
        http.get(`${BASE_URL}/api/admin/courses`, () =>
          HttpResponse.json([]),
        ),
      );

      const result = await adminApi.getAllCourses();
      expect(result).toEqual([]);
    });

    it('should reject on server error', async () => {
      server.use(
        http.get(`${BASE_URL}/api/admin/courses`, () =>
          new HttpResponse(null, { status: 500 }),
        ),
      );

      await expect(adminApi.getAllCourses()).rejects.toThrow();
    });
  });

  describe('getCourseById', () => {
    it('should GET /api/admin/courses/:id and return single course', async () => {
      server.use(
        http.get(`${BASE_URL}/api/admin/courses/${IDS.course}`, () =>
          HttpResponse.json(mockCourse),
        ),
      );

      const result = await adminApi.getCourseById(IDS.course);
      expect(result).toEqual(mockCourse);
      expect(result.id).toBe(IDS.course);
    });

    it('should reject on 404 (course not found)', async () => {
      server.use(
        http.get(`${BASE_URL}/api/admin/courses/${IDS.course}`, () =>
          HttpResponse.json({ message: 'Not found' }, { status: 404 }),
        ),
      );

      await expect(adminApi.getCourseById(IDS.course)).rejects.toThrow();
    });
  });

  describe('createCourse', () => {
    it('should POST to /api/admin/courses and return created course', async () => {
      const { handler, getCaptured } = capturePostHandler(
        `${BASE_URL}/api/admin/courses`,
        mockCourse,
      );
      server.use(handler);

      const result = await adminApi.createCourse(mockCourseRequest);
      expect(result).toEqual(mockCourse);
      expect(getCaptured()).toEqual(mockCourseRequest);
    });

    it('should reject on 400 Bad Request (validation error)', async () => {
      server.use(
        http.post(`${BASE_URL}/api/admin/courses`, () =>
          HttpResponse.json({ message: 'Validation failed' }, { status: 400 }),
        ),
      );

      await expect(adminApi.createCourse(mockCourseRequest)).rejects.toThrow();
    });
  });

  describe('updateCourse', () => {
    it('should PUT to /api/admin/courses/:id and return updated course', async () => {
      const updatedCourse = { ...mockCourse, title: 'Updated Title' };
      const updateRequest = { ...mockCourseRequest, title: 'Updated Title' };
      const { handler, getCaptured } = capturePutHandler(
        `${BASE_URL}/api/admin/courses/${IDS.course}`,
        updatedCourse,
      );
      server.use(handler);

      const result = await adminApi.updateCourse(IDS.course, updateRequest);
      expect(result.title).toBe('Updated Title');
      expect(getCaptured()).toEqual(updateRequest);
    });

    it('should reject on 404', async () => {
      server.use(
        http.put(`${BASE_URL}/api/admin/courses/${IDS.course}`, () =>
          new HttpResponse(null, { status: 404 }),
        ),
      );

      await expect(
        adminApi.updateCourse(IDS.course, mockCourseRequest),
      ).rejects.toThrow();
    });
  });

  describe('deleteCourse', () => {
    it('should DELETE /api/admin/courses/:id', async () => {
      server.use(
        http.delete(`${BASE_URL}/api/admin/courses/${IDS.course}`, () =>
          new HttpResponse(null, { status: 204 }),
        ),
      );

      // Should resolve without error
      await expect(adminApi.deleteCourse(IDS.course)).resolves.not.toThrow();
    });

    it('should reject on 404 (course not found)', async () => {
      server.use(
        http.delete(`${BASE_URL}/api/admin/courses/${IDS.course}`, () =>
          new HttpResponse(null, { status: 404 }),
        ),
      );

      await expect(adminApi.deleteCourse(IDS.course)).rejects.toThrow();
    });

    it('should reject on 409 Conflict (course in use)', async () => {
      server.use(
        http.delete(`${BASE_URL}/api/admin/courses/${IDS.course}`, () =>
          HttpResponse.json({ message: 'Course has active enrollments' }, { status: 409 }),
        ),
      );

      await expect(adminApi.deleteCourse(IDS.course)).rejects.toThrow();
    });
  });
});

// ─── Enrollments ───────────────────────────────────────────────────

describe('adminApi – Enrollments', () => {
  describe('getAllEnrollments', () => {
    it('should GET /api/admin/enrollments and return array', async () => {
      server.use(
        http.get(`${BASE_URL}/api/admin/enrollments`, () =>
          HttpResponse.json([mockEnrollment]),
        ),
      );

      const result = await adminApi.getAllEnrollments();
      expect(result).toHaveLength(1);
      expect(result[0].student).toBeDefined();
      expect(result[0].payments).toHaveLength(1);
    });

    it('should return empty array', async () => {
      server.use(
        http.get(`${BASE_URL}/api/admin/enrollments`, () =>
          HttpResponse.json([]),
        ),
      );

      const result = await adminApi.getAllEnrollments();
      expect(result).toEqual([]);
    });
  });

  describe('getEnrollmentById', () => {
    it('should GET a single enrollment', async () => {
      server.use(
        http.get(`${BASE_URL}/api/admin/enrollments/${IDS.enrollment}`, () =>
          HttpResponse.json(mockEnrollment),
        ),
      );

      const result = await adminApi.getEnrollmentById(IDS.enrollment);
      expect(result).toEqual(mockEnrollment);
    });

    it('should reject on 404', async () => {
      server.use(
        http.get(`${BASE_URL}/api/admin/enrollments/${IDS.enrollment}`, () =>
          new HttpResponse(null, { status: 404 }),
        ),
      );

      await expect(adminApi.getEnrollmentById(IDS.enrollment)).rejects.toThrow();
    });
  });

  describe('createEnrollment', () => {
    it('should POST and return created enrollment', async () => {
      const { handler, getCaptured } = capturePostHandler(
        `${BASE_URL}/api/admin/enrollments`,
        mockEnrollment,
      );
      server.use(handler);

      const result = await adminApi.createEnrollment(mockEnrollmentRequest);
      expect(result).toEqual(mockEnrollment);
      expect(getCaptured()).toEqual(mockEnrollmentRequest);
    });

    it('should reject on 400 Bad Request', async () => {
      server.use(
        http.post(`${BASE_URL}/api/admin/enrollments`, () =>
          HttpResponse.json({ message: 'Validation failed' }, { status: 400 }),
        ),
      );

      await expect(adminApi.createEnrollment(mockEnrollmentRequest)).rejects.toThrow();
    });
  });

  describe('createEnrollmentsBulk', () => {
    it('should POST array of requests and return array of enrollments', async () => {
      const bulkRequests = [mockEnrollmentRequest, { ...mockEnrollmentRequest, studentId: 'student-2' }];
      const bulkResponse = [mockEnrollment, { ...mockEnrollment, id: 'enrollment-2' }];

      const { handler, getCaptured } = capturePostHandler(
        `${BASE_URL}/api/admin/enrollments/bulk`,
        bulkResponse,
      );
      server.use(handler);

      const result = await adminApi.createEnrollmentsBulk(bulkRequests);
      expect(result).toHaveLength(2);
      expect(getCaptured()).toEqual(bulkRequests);
    });

    it('should reject on 400 for invalid bulk data', async () => {
      server.use(
        http.post(`${BASE_URL}/api/admin/enrollments/bulk`, () =>
          HttpResponse.json({ message: 'Validation failed' }, { status: 400 }),
        ),
      );

      await expect(adminApi.createEnrollmentsBulk([])).rejects.toThrow();
    });
  });

  describe('updateEnrollment', () => {
    it('should PUT and return updated enrollment', async () => {
      const updated = { ...mockEnrollment, status: 'completed' };
      const { handler } = capturePutHandler(
        `${BASE_URL}/api/admin/enrollments/${IDS.enrollment}`,
        updated,
      );
      server.use(handler);

      const result = await adminApi.updateEnrollment(IDS.enrollment, mockEnrollmentRequest);
      expect(result.status).toBe('completed');
    });
  });

  describe('deleteEnrollment', () => {
    it('should DELETE an enrollment', async () => {
      server.use(
        http.delete(`${BASE_URL}/api/admin/enrollments/${IDS.enrollment}`, () =>
          new HttpResponse(null, { status: 204 }),
        ),
      );

      await expect(adminApi.deleteEnrollment(IDS.enrollment)).resolves.not.toThrow();
    });

    it('should reject on 404', async () => {
      server.use(
        http.delete(`${BASE_URL}/api/admin/enrollments/${IDS.enrollment}`, () =>
          new HttpResponse(null, { status: 404 }),
        ),
      );

      await expect(adminApi.deleteEnrollment(IDS.enrollment)).rejects.toThrow();
    });
  });

  describe('generateCertificate', () => {
    it('should POST to generate certificate and return message', async () => {
      server.use(
        http.post(
          `${BASE_URL}/api/admin/enrollments/${IDS.enrollment}/certificate/generate`,
          () => HttpResponse.json(mockMessage),
        ),
      );

      const result = await adminApi.generateCertificate(IDS.enrollment);
      expect(result).toEqual(mockMessage);
    });

    it('should reject on 404 (enrollment not found)', async () => {
      server.use(
        http.post(
          `${BASE_URL}/api/admin/enrollments/${IDS.enrollment}/certificate/generate`,
          () => new HttpResponse(null, { status: 404 }),
        ),
      );

      await expect(adminApi.generateCertificate(IDS.enrollment)).rejects.toThrow();
    });
  });
});

// ─── Mentors ───────────────────────────────────────────────────────

describe('adminApi – Mentors', () => {
  describe('getAllMentors', () => {
    it('should GET /api/admin/mentors and return array', async () => {
      server.use(
        http.get(`${BASE_URL}/api/admin/mentors`, () =>
          HttpResponse.json([mockMentor]),
        ),
      );

      const result = await adminApi.getAllMentors();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Jane Smith');
    });

    it('should return empty array', async () => {
      server.use(
        http.get(`${BASE_URL}/api/admin/mentors`, () => HttpResponse.json([])),
      );

      const result = await adminApi.getAllMentors();
      expect(result).toEqual([]);
    });
  });

  describe('getMentorById', () => {
    it('should GET a single mentor', async () => {
      server.use(
        http.get(`${BASE_URL}/api/admin/mentors/${IDS.mentor}`, () =>
          HttpResponse.json(mockMentor),
        ),
      );

      const result = await adminApi.getMentorById(IDS.mentor);
      expect(result).toEqual(mockMentor);
    });

    it('should reject on 404', async () => {
      server.use(
        http.get(`${BASE_URL}/api/admin/mentors/${IDS.mentor}`, () =>
          new HttpResponse(null, { status: 404 }),
        ),
      );

      await expect(adminApi.getMentorById(IDS.mentor)).rejects.toThrow();
    });
  });

  describe('createMentor', () => {
    it('should POST and return CreateUserResponse', async () => {
      const mentorCreateResponse = {
        ...mockCreateUserResponse,
        role: 'MENTOR',
        name: 'Jane Smith',
      };
      const { handler, getCaptured } = capturePostHandler(
        `${BASE_URL}/api/admin/mentors`,
        mentorCreateResponse,
      );
      server.use(handler);

      const request = { ...mockCreateUserRequest, role: 'MENTOR', name: 'Jane Smith' };
      const result = await adminApi.createMentor(request);
      expect(result.role).toBe('MENTOR');
      expect(getCaptured()).toEqual(request);
    });
  });

  describe('updateMentor', () => {
    it('should PUT and return updated MentorDto', async () => {
      const updated = { ...mockMentor, name: 'Jane Smith Updated' };
      const { handler, getCaptured } = capturePutHandler(
        `${BASE_URL}/api/admin/mentors/${IDS.mentor}`,
        updated,
      );
      server.use(handler);

      const result = await adminApi.updateMentor(IDS.mentor, mockUpdateMentorRequest);
      expect(result.name).toBe('Jane Smith Updated');
      expect(getCaptured()).toEqual(mockUpdateMentorRequest);
    });
  });

  describe('deleteMentor', () => {
    it('should DELETE a mentor', async () => {
      server.use(
        http.delete(`${BASE_URL}/api/admin/mentors/${IDS.mentor}`, () =>
          new HttpResponse(null, { status: 204 }),
        ),
      );

      await expect(adminApi.deleteMentor(IDS.mentor)).resolves.not.toThrow();
    });

    it('should reject on 409 Conflict (mentor has enrollments)', async () => {
      server.use(
        http.delete(`${BASE_URL}/api/admin/mentors/${IDS.mentor}`, () =>
          HttpResponse.json({ message: 'Mentor has active enrollments' }, { status: 409 }),
        ),
      );

      await expect(adminApi.deleteMentor(IDS.mentor)).rejects.toThrow();
    });
  });
});

// ─── Payments ──────────────────────────────────────────────────────

describe('adminApi – Payments', () => {
  describe('recordPayment', () => {
    it('should POST and return created PaymentDto', async () => {
      const { handler, getCaptured } = capturePostHandler(
        `${BASE_URL}/api/admin/payments`,
        mockPayment,
      );
      server.use(handler);

      const result = await adminApi.recordPayment(mockRecordPaymentRequest);
      expect(result).toEqual(mockPayment);
      expect(getCaptured()).toEqual(mockRecordPaymentRequest);
    });

    it('should reject on 400 Bad Request', async () => {
      server.use(
        http.post(`${BASE_URL}/api/admin/payments`, () =>
          HttpResponse.json({ message: 'Invalid payment data' }, { status: 400 }),
        ),
      );

      await expect(adminApi.recordPayment(mockRecordPaymentRequest)).rejects.toThrow();
    });
  });

  describe('listPayments', () => {
    it('should GET /api/admin/payments and return array', async () => {
      server.use(
        http.get(`${BASE_URL}/api/admin/payments`, () =>
          HttpResponse.json([mockPayment]),
        ),
      );

      const result = await adminApi.listPayments();
      expect(result).toHaveLength(1);
      expect(result[0].paymentMethod).toBe('upi');
    });

    it('should return empty array when no payments exist', async () => {
      server.use(
        http.get(`${BASE_URL}/api/admin/payments`, () => HttpResponse.json([])),
      );

      const result = await adminApi.listPayments();
      expect(result).toEqual([]);
    });
  });

  describe('getPendingPayments', () => {
    it('should GET /api/admin/payments/pending and return filtered array', async () => {
      const pendingPayment = { ...mockPayment, status: 'pending' };

      server.use(
        http.get(`${BASE_URL}/api/admin/payments/pending`, () =>
          HttpResponse.json([pendingPayment]),
        ),
      );

      const result = await adminApi.getPendingPayments();
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('pending');
    });
  });

  describe('getPayment', () => {
    it('should GET a single payment by ID', async () => {
      server.use(
        http.get(`${BASE_URL}/api/admin/payments/${IDS.payment}`, () =>
          HttpResponse.json(mockPayment),
        ),
      );

      const result = await adminApi.getPayment(IDS.payment);
      expect(result).toEqual(mockPayment);
    });

    it('should reject on 404', async () => {
      server.use(
        http.get(`${BASE_URL}/api/admin/payments/${IDS.payment}`, () =>
          new HttpResponse(null, { status: 404 }),
        ),
      );

      await expect(adminApi.getPayment(IDS.payment)).rejects.toThrow();
    });
  });

  describe('updatePayment', () => {
    it('should PUT and return updated PaymentDto', async () => {
      const updated = { ...mockPayment, status: 'completed' };
      const { handler, getCaptured } = capturePutHandler(
        `${BASE_URL}/api/admin/payments/${IDS.payment}`,
        updated,
      );
      server.use(handler);

      const result = await adminApi.updatePayment(IDS.payment, mockUpdatePaymentRequest);
      expect(result.status).toBe('completed');
      expect(getCaptured()).toEqual(mockUpdatePaymentRequest);
    });
  });

  describe('deletePayment', () => {
    it('should DELETE a payment', async () => {
      server.use(
        http.delete(`${BASE_URL}/api/admin/payments/${IDS.payment}`, () =>
          new HttpResponse(null, { status: 204 }),
        ),
      );

      await expect(adminApi.deletePayment(IDS.payment)).resolves.not.toThrow();
    });

    it('should reject on 404', async () => {
      server.use(
        http.delete(`${BASE_URL}/api/admin/payments/${IDS.payment}`, () =>
          new HttpResponse(null, { status: 404 }),
        ),
      );

      await expect(adminApi.deletePayment(IDS.payment)).rejects.toThrow();
    });
  });
});

// ─── Settings ──────────────────────────────────────────────────────

describe('adminApi – Settings', () => {
  describe('updateSettings', () => {
    it('should PUT settings and return message', async () => {
      const settings = { siteName: 'GenLab LMS', timezone: 'Asia/Kolkata' };
      const { handler, getCaptured } = capturePutHandler(
        `${BASE_URL}/api/admin/settings`,
        mockMessage,
      );
      server.use(handler);

      const result = await adminApi.updateSettings(settings);
      expect(result).toEqual(mockMessage);
      expect(getCaptured()).toEqual(settings);
    });

    it('should reject on 400 Bad Request', async () => {
      server.use(
        http.put(`${BASE_URL}/api/admin/settings`, () =>
          HttpResponse.json({ message: 'Invalid settings' }, { status: 400 }),
        ),
      );

      await expect(adminApi.updateSettings({})).rejects.toThrow();
    });
  });
});

// ─── Slots ─────────────────────────────────────────────────────────

describe('adminApi – Slots', () => {
  describe('getAllSlots', () => {
    it('should GET /api/admin/slots and return array', async () => {
      server.use(
        http.get(`${BASE_URL}/api/admin/slots`, () =>
          HttpResponse.json([mockSlot]),
        ),
      );

      const result = await adminApi.getAllSlots();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('9:00 AM – 10:00 AM');
      expect(result[0].startTime?.hour).toBe(9);
    });

    it('should return empty array', async () => {
      server.use(
        http.get(`${BASE_URL}/api/admin/slots`, () => HttpResponse.json([])),
      );

      const result = await adminApi.getAllSlots();
      expect(result).toEqual([]);
    });
  });

  describe('getSlotById', () => {
    it('should GET a single slot by ID', async () => {
      server.use(
        http.get(`${BASE_URL}/api/admin/slots/${IDS.slot}`, () =>
          HttpResponse.json(mockSlot),
        ),
      );

      const result = await adminApi.getSlotById(IDS.slot);
      expect(result).toEqual(mockSlot);
    });

    it('should reject on 404', async () => {
      server.use(
        http.get(`${BASE_URL}/api/admin/slots/${IDS.slot}`, () =>
          new HttpResponse(null, { status: 404 }),
        ),
      );

      await expect(adminApi.getSlotById(IDS.slot)).rejects.toThrow();
    });
  });

  describe('createSlot', () => {
    it('should POST and return created SlotDto', async () => {
      const { handler, getCaptured } = capturePostHandler(
        `${BASE_URL}/api/admin/slots`,
        mockSlot,
      );
      server.use(handler);

      const result = await adminApi.createSlot(mockCreateSlotRequest);
      expect(result).toEqual(mockSlot);
      expect(getCaptured()).toEqual(mockCreateSlotRequest);
    });
  });

  describe('updateSlot', () => {
    it('should PUT and return updated SlotDto', async () => {
      const updatedSlot = { ...mockSlot, name: '10:00 AM – 11:00 AM' };
      const { handler } = capturePutHandler(
        `${BASE_URL}/api/admin/slots/${IDS.slot}`,
        updatedSlot,
      );
      server.use(handler);

      const result = await adminApi.updateSlot(IDS.slot, mockCreateSlotRequest);
      expect(result.name).toBe('10:00 AM – 11:00 AM');
    });
  });

  describe('deleteSlot', () => {
    it('should DELETE a slot', async () => {
      server.use(
        http.delete(`${BASE_URL}/api/admin/slots/${IDS.slot}`, () =>
          new HttpResponse(null, { status: 204 }),
        ),
      );

      await expect(adminApi.deleteSlot(IDS.slot)).resolves.not.toThrow();
    });

    it('should reject on 409 Conflict (slot in use)', async () => {
      server.use(
        http.delete(`${BASE_URL}/api/admin/slots/${IDS.slot}`, () =>
          HttpResponse.json({ message: 'Slot is in use' }, { status: 409 }),
        ),
      );

      await expect(adminApi.deleteSlot(IDS.slot)).rejects.toThrow();
    });
  });
});

// ─── Students ──────────────────────────────────────────────────────

describe('adminApi – Students', () => {
  describe('getAllStudents', () => {
    it('should GET /api/admin/students and return array', async () => {
      server.use(
        http.get(`${BASE_URL}/api/admin/students`, () =>
          HttpResponse.json([mockStudent]),
        ),
      );

      const result = await adminApi.getAllStudents();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('John Doe');
      expect(result[0].gender).toBe('male');
    });

    it('should return empty array', async () => {
      server.use(
        http.get(`${BASE_URL}/api/admin/students`, () => HttpResponse.json([])),
      );

      const result = await adminApi.getAllStudents();
      expect(result).toEqual([]);
    });
  });

  describe('getStudentById', () => {
    it('should GET a single student by ID', async () => {
      server.use(
        http.get(`${BASE_URL}/api/admin/students/${IDS.student}`, () =>
          HttpResponse.json(mockStudent),
        ),
      );

      const result = await adminApi.getStudentById(IDS.student);
      expect(result).toEqual(mockStudent);
    });

    it('should reject on 404', async () => {
      server.use(
        http.get(`${BASE_URL}/api/admin/students/${IDS.student}`, () =>
          new HttpResponse(null, { status: 404 }),
        ),
      );

      await expect(adminApi.getStudentById(IDS.student)).rejects.toThrow();
    });
  });

  describe('createStudent', () => {
    it('should POST and return CreateUserResponse', async () => {
      const { handler, getCaptured } = capturePostHandler(
        `${BASE_URL}/api/admin/students`,
        mockCreateUserResponse,
      );
      server.use(handler);

      const result = await adminApi.createStudent(mockCreateUserRequest);
      expect(result).toEqual(mockCreateUserResponse);
      expect(result.role).toBe('STUDENT');
      expect(getCaptured()).toEqual(mockCreateUserRequest);
    });

    it('should reject on 400 Bad Request (duplicate email)', async () => {
      server.use(
        http.post(`${BASE_URL}/api/admin/students`, () =>
          HttpResponse.json({ message: 'Email already exists' }, { status: 400 }),
        ),
      );

      await expect(adminApi.createStudent(mockCreateUserRequest)).rejects.toThrow();
    });
  });

  describe('updateStudent', () => {
    it('should PUT and return updated StudentDto', async () => {
      const updated = { ...mockStudent, name: 'John Doe Updated' };
      const { handler, getCaptured } = capturePutHandler(
        `${BASE_URL}/api/admin/students/${IDS.student}`,
        updated,
      );
      server.use(handler);

      const result = await adminApi.updateStudent(IDS.student, mockUpdateStudentRequest);
      expect(result.name).toBe('John Doe Updated');
      expect(getCaptured()).toEqual(mockUpdateStudentRequest);
    });
  });

  describe('deleteStudent', () => {
    it('should DELETE a student', async () => {
      server.use(
        http.delete(`${BASE_URL}/api/admin/students/${IDS.student}`, () =>
          new HttpResponse(null, { status: 204 }),
        ),
      );

      await expect(adminApi.deleteStudent(IDS.student)).resolves.not.toThrow();
    });

    it('should reject on 409 Conflict (student has enrollments)', async () => {
      server.use(
        http.delete(`${BASE_URL}/api/admin/students/${IDS.student}`, () =>
          HttpResponse.json({ message: 'Student has active enrollments' }, { status: 409 }),
        ),
      );

      await expect(adminApi.deleteStudent(IDS.student)).rejects.toThrow();
    });
  });
});

// ─── Assets ────────────────────────────────────────────────────────

describe('adminApi – Assets (Presigned URLs)', () => {
  describe('getProfilePhotoUploadUrl', () => {
    it('should GET presigned URL with default contentType', async () => {
      let capturedUrl: URL | undefined;

      server.use(
        http.get(`${BASE_URL}/api/assets/student/profile-photo/presign-upload`, ({ request }) => {
          capturedUrl = new URL(request.url);
          return HttpResponse.json(mockPresignedUrl);
        }),
      );

      const result = await adminApi.getProfilePhotoUploadUrl();
      expect(result).toEqual(mockPresignedUrl);
      expect(result.url).toContain('https://s3.example.com');
      expect(result.key).toBeDefined();
      expect(capturedUrl?.searchParams.get('contentType')).toBe('image/jpeg');
    });

    it('should pass custom contentType as query param', async () => {
      let capturedUrl: URL | undefined;

      server.use(
        http.get(`${BASE_URL}/api/assets/student/profile-photo/presign-upload`, ({ request }) => {
          capturedUrl = new URL(request.url);
          return HttpResponse.json(mockPresignedUrl);
        }),
      );

      await adminApi.getProfilePhotoUploadUrl('image/png');
      expect(capturedUrl?.searchParams.get('contentType')).toBe('image/png');
    });

    it('should reject on 401 Unauthorized', async () => {
      server.use(
        http.get(`${BASE_URL}/api/assets/student/profile-photo/presign-upload`, () =>
          new HttpResponse(null, { status: 401 }),
        ),
      );

      await expect(adminApi.getProfilePhotoUploadUrl()).rejects.toThrow();
    });
  });

  describe('getAddressProofUploadUrl', () => {
    it('should GET presigned URL with default contentType', async () => {
      let capturedUrl: URL | undefined;

      server.use(
        http.get(`${BASE_URL}/api/assets/student/address-proof/presign-upload`, ({ request }) => {
          capturedUrl = new URL(request.url);
          return HttpResponse.json(mockPresignedUrl);
        }),
      );

      const result = await adminApi.getAddressProofUploadUrl();
      expect(result).toEqual(mockPresignedUrl);
      expect(capturedUrl?.searchParams.get('contentType')).toBe('image/jpeg');
    });

    it('should pass custom contentType as query param', async () => {
      let capturedUrl: URL | undefined;

      server.use(
        http.get(`${BASE_URL}/api/assets/student/address-proof/presign-upload`, ({ request }) => {
          capturedUrl = new URL(request.url);
          return HttpResponse.json(mockPresignedUrl);
        }),
      );

      await adminApi.getAddressProofUploadUrl('application/pdf');
      expect(capturedUrl?.searchParams.get('contentType')).toBe('application/pdf');
    });

    it('should reject on server error', async () => {
      server.use(
        http.get(`${BASE_URL}/api/assets/student/address-proof/presign-upload`, () =>
          new HttpResponse(null, { status: 500 }),
        ),
      );

      await expect(adminApi.getAddressProofUploadUrl()).rejects.toThrow();
    });
  });
});
