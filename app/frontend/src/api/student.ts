import { apiClient } from './client';
import type {
  MessageResponse,
  StudentDto,
  StudentEnrollmentDto,
} from './types';

export const studentApi = {
  getDashboard(): Promise<MessageResponse> {
    return apiClient.get('/api/student/dashboard').then((res) => res.data);
  },

  getProfile(): Promise<StudentDto> {
    return apiClient.get('/api/student/profile').then((res) => res.data);
  },

  getCurrentEnrollment(): Promise<StudentEnrollmentDto> {
    return apiClient.get('/api/student/enrollments/current').then((res) => res.data);
  },

  getPastEnrollments(): Promise<StudentEnrollmentDto[]> {
    return apiClient.get('/api/student/enrollments/past').then((res) => res.data);
  },
};
export default studentApi;
