import { create } from 'zustand';
import { slotsApi } from '../api/slots';
import type { SlotDto, CreateSlotRequest } from '../api/types';

interface SlotsState {
  slots: SlotDto[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadSlots: () => Promise<void>;
  addSlot: (payload: CreateSlotRequest) => Promise<void>;
  updateSlot: (id: string, payload: CreateSlotRequest) => Promise<void>;
  removeSlot: (id: string) => Promise<void>;
}

export const useSlotsStore = create<SlotsState>((set) => ({
  slots: [],

  isLoading: false,
  error: null,

  loadSlots: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await slotsApi.fetchSlots();
      set({ slots: data || [], isLoading: false });
    } catch (err: any) {
      console.error('Failed to load slots', err);
      set({ error: err.message || 'Failed to fetch slots presets', isLoading: false });
    }
  },

  addSlot: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const newSlot = await slotsApi.createSlot(payload);
      set((state) => ({
        slots: [...state.slots, newSlot],
        isLoading: false,
      }));
    } catch (err: any) {
      console.error('Failed to create slot', err);
      set({ error: err.message || 'Failed to create slot preset', isLoading: false });
      throw err;
    }
  },

  updateSlot: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updatedSlot = await slotsApi.updateSlot(id, payload);
      set((state) => ({
        slots: state.slots.map((s) => (s.id === id ? updatedSlot : s)),
        isLoading: false,
      }));
    } catch (err: any) {
      console.error('Failed to update slot', err);
      set({ error: err.message || 'Failed to update slot preset', isLoading: false });
      throw err;
    }
  },

  removeSlot: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await slotsApi.deleteSlot(id);
      set((state) => ({
        slots: state.slots.filter((s) => s.id !== id),
        isLoading: false,
      }));
    } catch (err: any) {
      console.error('Failed to delete slot', err);
      set({ error: err.message || 'Failed to delete slot preset', isLoading: false });
      throw err;
    }
  },
}));

export default useSlotsStore;
