import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../setupTests';
import { slotsApi } from '../slots';
import type { CreateSlotRequest } from '../types';
import {
  BASE_URL,
  mockSlot,
  IDS,
} from '../mocks/fixtures';

describe('slotsApi', () => {
  describe('fetchSlots()', () => {
    it('should GET /api/admin/slots and return list of slots', async () => {
      server.use(
        http.get(`${BASE_URL}/api/admin/slots`, () =>
          HttpResponse.json([mockSlot]),
        ),
      );

      const result = await slotsApi.fetchSlots();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockSlot);
    });

    it('should reject on error', async () => {
      server.use(
        http.get(`${BASE_URL}/api/admin/slots`, () =>
          new HttpResponse(null, { status: 500 }),
        ),
      );

      await expect(slotsApi.fetchSlots()).rejects.toThrow();
    });
  });

  describe('fetchSlotById()', () => {
    it('should GET /api/admin/slots/:id and return single slot', async () => {
      server.use(
        http.get(`${BASE_URL}/api/admin/slots/${IDS.slot}`, () =>
          HttpResponse.json(mockSlot),
        ),
      );

      const result = await slotsApi.fetchSlotById(IDS.slot);
      expect(result).toEqual(mockSlot);
    });
  });

  describe('createSlot()', () => {
    it('should POST /api/admin/slots and return created slot', async () => {
      const payload: CreateSlotRequest = {
        startTime: { hour: 9, minute: 0 },
        endTime: { hour: 10, minute: 0 },
      };

      server.use(
        http.post(`${BASE_URL}/api/admin/slots`, async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(payload);
          return HttpResponse.json(mockSlot, { status: 201 });
        }),
      );

      const result = await slotsApi.createSlot(payload);
      expect(result).toEqual(mockSlot);
    });
  });

  describe('updateSlot()', () => {
    it('should PUT /api/admin/slots/:id and return updated slot', async () => {
      const payload: CreateSlotRequest = {
        startTime: { hour: 10, minute: 0 },
        endTime: { hour: 11, minute: 0 },
      };

      server.use(
        http.put(`${BASE_URL}/api/admin/slots/${IDS.slot}`, async ({ request }) => {
          const body = await request.json();

          expect(body).toEqual(payload);
          return HttpResponse.json(mockSlot);
        }),
      );

      const result = await slotsApi.updateSlot(IDS.slot, payload);
      expect(result).toEqual(mockSlot);
    });
  });

  describe('deleteSlot()', () => {
    it('should DELETE /api/admin/slots/:id', async () => {
      server.use(
        http.delete(`${BASE_URL}/api/admin/slots/${IDS.slot}`, () =>
          new HttpResponse(null, { status: 204 }),
        ),
      );

      await expect(slotsApi.deleteSlot(IDS.slot)).resolves.toBe('');
    });
  });
});

