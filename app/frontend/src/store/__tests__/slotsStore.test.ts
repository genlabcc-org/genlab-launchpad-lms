import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSlotsStore } from '../slotsStore';
import { slotsApi } from '../../api/slots';
import type { SlotDto } from '../../api/types';

vi.mock('../../api/slots', () => ({
  slotsApi: {
    fetchSlots: vi.fn(),
    createSlot: vi.fn(),
    updateSlot: vi.fn(),
    deleteSlot: vi.fn(),
  },
}));

const mockSlot: SlotDto = {
  id: 'c123b456-c789-d012-e345-f67890123456',
  name: '9:00 AM – 10:00 AM',
  startTime: { hour: 9, minute: 0, second: 0, nano: 0 },
  endTime: { hour: 10, minute: 0, second: 0, nano: 0 },
};

describe('slotsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSlotsStore.setState({
      slots: [],
      isLoading: false,
      error: null,
    });
  });

  describe('loadSlots', () => {
    it('should load slots successfully', async () => {
      vi.mocked(slotsApi.fetchSlots).mockResolvedValue([mockSlot]);

      await useSlotsStore.getState().loadSlots();

      expect(useSlotsStore.getState().slots).toEqual([mockSlot]);
      expect(useSlotsStore.getState().isLoading).toBe(false);
      expect(useSlotsStore.getState().error).toBeNull();
    });

    it('should set error on load failure', async () => {
      vi.mocked(slotsApi.fetchSlots).mockRejectedValue(new Error('Network Error'));

      await useSlotsStore.getState().loadSlots();

      expect(useSlotsStore.getState().slots).toEqual([]);
      expect(useSlotsStore.getState().isLoading).toBe(false);
      expect(useSlotsStore.getState().error).toBe('Network Error');
    });
  });

  describe('addSlot', () => {
    it('should create slot and add to local state', async () => {
      const payload = { startTime: { hour: 9, minute: 0 }, endTime: { hour: 10, minute: 0 } };
      vi.mocked(slotsApi.createSlot).mockResolvedValue(mockSlot);

      await useSlotsStore.getState().addSlot(payload);

      expect(useSlotsStore.getState().slots).toEqual([mockSlot]);
    });
  });

  describe('updateSlot', () => {
    it('should update slot in local state', async () => {
      useSlotsStore.setState({ slots: [mockSlot] });
      const updatedSlot = { ...mockSlot, name: '10:00 AM – 11:00 AM' };
      vi.mocked(slotsApi.updateSlot).mockResolvedValue(updatedSlot);

      await useSlotsStore.getState().updateSlot(mockSlot.id!, { startTime: { hour: 10, minute: 0 }, endTime: { hour: 11, minute: 0 } });

      expect(useSlotsStore.getState().slots[0]).toEqual(updatedSlot);
    });
  });


  describe('removeSlot', () => {
    it('should delete slot from local state', async () => {
      useSlotsStore.setState({ slots: [mockSlot] });
      vi.mocked(slotsApi.deleteSlot).mockResolvedValue();

      await useSlotsStore.getState().removeSlot(mockSlot.id!);

      expect(useSlotsStore.getState().slots).toEqual([]);
    });
  });
});
