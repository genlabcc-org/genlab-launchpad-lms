import { apiClient } from './client';
import type {
  PaymentDto,
  MessageResponse,
} from './types';

export const sharedApi = {
  getEnrollmentPayments(enrollmentId: string): Promise<PaymentDto[]> {
    return apiClient.get(`/api/enrollments/${enrollmentId}/payments`).then((res) => res.data);
  },

  getEnrollmentPaymentDetails(enrollmentId: string, paymentId: string): Promise<PaymentDto> {
    return apiClient.get(`/api/enrollments/${enrollmentId}/payments/${paymentId}`).then((res) => res.data);
  },

  getHealth(): Promise<MessageResponse> {
    return apiClient.get('/health').then((res) => res.data);
  },
};
export default sharedApi;
