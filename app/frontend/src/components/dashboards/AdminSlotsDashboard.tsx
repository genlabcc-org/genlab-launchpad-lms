import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Pencil, Clock, AlertCircle, CheckCircle, Sparkles, CalendarRange } from 'lucide-react';
import { adminApi } from '../../api/admin';
import type { SlotDto } from '../../api/types';

export function AdminSlotsDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [slots, setSlots] = useState<SlotDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);

  const fetchSlots = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const data = await adminApi.getAllSlots();
      setSlots(data || []);
    } catch (e: any) {
      console.error('Failed to load slots', e);
      setMessage({ text: 'Failed to connect to the backend server to retrieve slots.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
    if (searchParams.get('create') === 'true') {
      setIsFormOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, []);

  const formatTimeObj = (t: any): string => {
    if (!t) return '';
    if (typeof t === 'string') {
      return t.substring(0, 5);
    }
    const h = String(t.hour ?? 0).padStart(2, '0');
    const m = String(t.minute ?? 0).padStart(2, '0');
    return `${h}:${m}`;
  };

  const calculateDuration = (startStr: string, endStr: string): string => {
    if (!startStr || !endStr) return '';
    const [sh, sm] = startStr.split(':').map(Number);
    const [eh, em] = endStr.split(':').map(Number);
    let diffMinutes = (eh * 60 + em) - (sh * 60 + sm);
    if (diffMinutes <= 0) diffMinutes += 24 * 60;
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours} ${hours === 1 ? 'hr' : 'hrs'}`;
    return `${mins} mins`;
  };

  const format12Hour = (timeStr: string): string => {
    if (!timeStr) return '';
    const [hStr, mStr] = timeStr.split(':');
    let h = parseInt(hStr, 10);
    if (isNaN(h)) return timeStr;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${mStr} ${ampm}`;
  };

  const resetForm = () => {
    setStartTime('');
    setEndTime('');
    setEditingSlotId(null);
    setIsFormOpen(false);
  };

  const handleStartEdit = (slot: SlotDto) => {
    const startStr = formatTimeObj(slot.startTime);
    const endStr = formatTimeObj(slot.endTime);
    setStartTime(startStr);
    setEndTime(endStr);
    setEditingSlotId(slot.id || null);
    setIsFormOpen(true);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !endTime) return;
    setIsSaving(true);
    setMessage(null);
    try {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);

      const payload = {
        startTime: { hour: sh, minute: sm, second: 0, nano: 0 } as any,
        endTime: { hour: eh, minute: em, second: 0, nano: 0 } as any,
      };

      if (editingSlotId) {
        await adminApi.updateSlot(editingSlotId, payload);
        setMessage({ text: 'Slot timing preset updated successfully!', type: 'success' });
      } else {
        await adminApi.createSlot(payload);
        setMessage({ text: 'Slot timing preset created successfully!', type: 'success' });
      }

      resetForm();
      fetchSlots();
    } catch (err: any) {
      console.error('Failed to save slot', err);
      setMessage({
        text: err.response?.data?.message || err.message || 'Failed to save slot preset.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slot timing preset?')) return;
    setMessage(null);
    try {
      await adminApi.deleteSlot(id);
      setMessage({ text: 'Slot timing preset deleted successfully.', type: 'success' });
      fetchSlots();
    } catch (err: any) {
      console.error('Failed to delete slot', err);
      setMessage({
        text: err.response?.data?.message || err.message || 'Failed to delete slot preset. It may be active in mentor schedules.',
        type: 'error',
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border-subtle/60 bg-background/50 backdrop-blur-md shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground">Slots &amp; Timing Presets</h2>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 rounded-full">
              {slots.length} {slots.length === 1 ? 'Preset' : 'Presets'}
            </span>
          </div>
          <p className="text-xs text-muted mt-0.5">Define time blocks to structure mentor availabilities and batch scheduling.</p>
        </div>
        <button
          onClick={() => {
            if (isFormOpen) {
              resetForm();
            } else {
              setEditingSlotId(null);
              setStartTime('');
              setEndTime('');
              setIsFormOpen(true);
            }
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary-hover shadow-sm transition-all text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {isFormOpen ? 'Cancel' : 'New Preset'}
        </button>
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {message && (
          <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 animate-in fade-in duration-200 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Create / Edit Form Card */}
        {isFormOpen && (
          <form onSubmit={handleSubmit} className="p-5 bg-card-bg border border-border-subtle/80 rounded-2xl space-y-4 shadow-sm animate-in slide-in-from-top duration-200">
            <div className="flex items-center justify-between border-b border-border-subtle/40 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {editingSlotId ? 'Edit Timing Preset' : 'Create Timing Preset'}
                </h3>
              </div>
              {startTime && endTime && (
                <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                  Duration: {calculateDuration(startTime, endTime)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="py-2 px-3 bg-background border border-border-subtle rounded-xl text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="py-2 px-3 bg-background border border-border-subtle rounded-xl text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="py-2 px-4 bg-background border border-border-subtle hover:border-border-subtle/80 text-foreground font-medium rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="py-2 px-5 bg-primary text-primary-foreground font-semibold rounded-xl text-xs hover:bg-primary/90 transition disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isSaving ? 'Saving...' : editingSlotId ? 'Update Preset' : 'Save Preset'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Slot Grid View */}
        {isLoading ? (
          <div className="py-16 text-center text-xs text-muted font-medium">
            Loading slot timing presets...
          </div>
        ) : slots.length === 0 ? (
          <div className="py-12 px-6 text-center bg-card-bg border border-dashed border-border-subtle rounded-2xl space-y-3">
            <CalendarRange className="w-10 h-10 text-muted/40 mx-auto" />
            <h3 className="text-sm font-semibold text-foreground">No Presets Defined</h3>
            <p className="text-xs text-muted max-w-sm mx-auto">Click "New Preset" above to create timing blocks for mentor schedules.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {slots.map((slot) => {
              const startStr = formatTimeObj(slot.startTime);
              const endStr = formatTimeObj(slot.endTime);
              const duration = calculateDuration(startStr, endStr);
              const isBeingEdited = editingSlotId === slot.id;

              return (
                <div
                  key={slot.id}
                  className={`p-4 bg-card-bg border rounded-2xl flex flex-col justify-between gap-3 transition-all group relative ${
                    isBeingEdited
                      ? 'border-primary ring-1 ring-primary/50 shadow-md'
                      : 'border-border-subtle/70 hover:border-primary/50 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    {duration && (
                      <span className="text-[10px] font-bold text-muted bg-background px-2 py-0.5 rounded-md border border-border-subtle/50">
                        {duration}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Time Block</span>
                    <h4 className="text-sm font-bold text-foreground mt-0.5">
                      {format12Hour(startStr)} – {format12Hour(endStr)}
                    </h4>
                    <p className="text-[11px] text-muted/80 font-mono mt-0.5">
                      ({startStr} - {endStr})
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border-subtle/30 flex items-center justify-end gap-1 text-[11px]">
                    <button
                      onClick={() => handleStartEdit(slot)}
                      title="Edit preset"
                      className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(slot.id!)}
                      title="Delete preset"
                      className="p-1.5 rounded-lg text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminSlotsDashboard;
