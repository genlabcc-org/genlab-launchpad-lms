import type { components } from './openapi';

export type StudentDto = components['schemas']['StudentDto'] & { interestedCourseId?: string };
export type CourseDto = components['schemas']['CourseDto'] & {
  isActive?: boolean;
  durationInDays?: number;
  activityMetrics?: number[];
};
export type EnrollmentDto = components['schemas']['EnrollmentDto'];
export type MentorDto = components['schemas']['MentorDto'];
export type PaymentDto = components['schemas']['PaymentDto'];
export type SlotDto = components['schemas']['SlotDto'];
export type StudentScheduleDto = components['schemas']['StudentScheduleDto'];

export interface BatchDto {
  id: string;
  name: string;
  startDate: string;
  cutoffDate?: string;
  createdAt?: string;
}

export interface WorkspaceOverviewDto {
  slotsCount: number;
  coursesCount: number;
  mentorsCount: number;
  batchesCount: number;
  studentsCount: number;
}

export interface CourseCapacityDto {
  slots: SlotDto[];
  mentors: MentorDto[];
  matrix: Record<string, Record<string, {
    currentEnrollments: number;
    maxCapacity: number;
    isFull: boolean;
  }>>;
}

// Extract literal union types from OpenAPI schemas
export type Gender = NonNullable<StudentDto['gender']>;
export type StudentType = NonNullable<StudentDto['studentType']>;
export type PaymentType = NonNullable<StudentDto['paymentType']>;
export type PaymentMethod = NonNullable<PaymentDto['paymentMethod']>;
export type PaymentStatus = NonNullable<PaymentDto['status']>;

// Extended UI & schedule structures
export interface MentorScheduleDto {
  id: string;
  slot: SlotDto;
  course: CourseDto;
  mentor: MentorDto;
  startDate: string;
  endDate: string;
  batchId?: string;
  students: StudentDto[];
}

export interface StudentEnrollmentDto {
  id: string;
  status: string;
  paymentType: string;
  totalAmount: number;
  pendingAmount: number;
  course: CourseDto;
  mentorSchedule: StudentScheduleDto;
  payments: PaymentDto[];
  certificateUrl: string | null;
  createdAt: string;
  batchId?: string;
}
