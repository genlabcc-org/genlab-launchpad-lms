import { apiClient } from './client';
import type {
  MessageResponse,
  MentorDto,
  MentorScheduleDto,
} from './types';

export interface MentorSlotsParams {
  date?: string; // YYYY-MM-DD
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}

export const mentorApi = {
  getDashboard(): Promise<MessageResponse> {
    return apiClient.get('/api/mentor/dashboard').then((res) => res.data);
  },

  getProfile(): Promise<MentorDto> {
    return apiClient.get('/api/mentor/profile').then((res) => res.data);
  },

  getSlots(params?: MentorSlotsParams): Promise<MentorScheduleDto[]> {
    return apiClient.get('/api/mentor/slots', { params }).then((res) => res.data);
  },
};
export default mentorApi;
