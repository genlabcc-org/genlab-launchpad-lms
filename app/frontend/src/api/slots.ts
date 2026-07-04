import { apiClient } from './client';
import type { SlotDto, CreateSlotRequest } from './types';

export interface SlotRecord {
  id?: string;
  name: string;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}

export const slotsApi = {
  fetchSlots(): Promise<SlotDto[]> {
    return apiClient.get('/api/admin/slots').then((res) => res.data);
  },

  fetchSlotById(id: string): Promise<SlotDto> {
    return apiClient.get(`/api/admin/slots/${id}`).then((res) => res.data);
  },

  createSlot(payload: CreateSlotRequest): Promise<SlotDto> {
    return apiClient.post('/api/admin/slots', payload).then((res) => res.data);
  },

  updateSlot(id: string, payload: CreateSlotRequest): Promise<SlotDto> {
    return apiClient.put(`/api/admin/slots/${id}`, payload).then((res) => res.data);
  },

  deleteSlot(id: string): Promise<void> {
    return apiClient.delete(`/api/admin/slots/${id}`).then((res) => res.data);
  },
};

export default slotsApi;
