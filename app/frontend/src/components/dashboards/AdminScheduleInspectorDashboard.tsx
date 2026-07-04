import { useEffect, useState, useMemo } from 'react';
import { Calendar, Clock, BookOpen, User, AlertCircle, RefreshCw, CalendarRange } from 'lucide-react';
import { adminApi } from '../../api/admin';
import type { EnrollmentDto, CourseDto } from '../../api/types';

interface GroupedSlot {
  slotId: string;
  startMinutes: number;
  timeRangeLabel: string;
  durationLabel: string;
  courseTitle: string;
  students: { id: string; name: string; email: string }[];
}

interface GroupedMentor {
  mentorId: string;
  mentorName: string;
  mentorEmail: string;
  slots: GroupedSlot[];
}

export function AdminScheduleInspectorDashboard() {
  const [enrollments, setEnrollments] = useState<EnrollmentDto[]>([]);
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedEnrollments, fetchedCourses] = await Promise.all([
        adminApi.getAllEnrollments(),
        adminApi.getAllCourses(),
      ]);
      setEnrollments(fetchedEnrollments || []);
      setCourses(fetchedCourses || []);
    } catch (e: any) {
      console.error('Failed to load schedule inspector data', e);
      setError('Failed to connect to the backend server to retrieve schedule details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

  const format12Hour = (timeStr: string): string => {
    if (!timeStr) return '';
    const [hStr, mStr] = timeStr.split(':');
    let h = parseInt(hStr, 10);
    if (isNaN(h)) return timeStr;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${mStr} ${ampm}`;
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

  // Group and sort active slots chronologically by mentor
  const groupedData = useMemo((): GroupedMentor[] => {
    if (!enrollments.length) return [];

    // 1. Filter enrollments active on the selected date
    const activeEnrollments = enrollments.filter((e) => {
      if (!e.mentorSchedule || !e.mentorSchedule.startDate || !e.mentorSchedule.endDate) {
        return false;
      }
      const { startDate, endDate } = e.mentorSchedule;
      return selectedDate >= startDate && selectedDate <= endDate;
    });

    // 2. Map & group active enrollments by mentor + slot
    const mentorMap: Record<string, { mentorName: string; mentorEmail: string; slotsMap: Record<string, GroupedSlot> }> = {};

    activeEnrollments.forEach((e) => {
      const schedule = e.mentorSchedule!;
      const mentor = schedule.mentor;
      const slot = schedule.slot;
      const student = e.student;

      if (!mentor || !slot || !student) return;

      const mentorId = mentor.id || 'unknown-mentor';
      const mentorName = mentor.name || 'Unassigned Mentor';
      const mentorEmail = mentor.email || '';
      const slotId = slot.id || 'unknown-slot';

      const startStr = formatTimeObj(slot.startTime);
      const endStr = formatTimeObj(slot.endTime);
      const startMinutes = (() => {
        if (!startStr) return 0;
        const [h, m] = startStr.split(':').map(Number);
        return h * 60 + m;
      })();

      const courseId = student.registeredCourseId || student.interestedCourseId || '';
      const courseTitle = courses.find((c) => c.id === courseId)?.title || 'Unassigned Course';

      if (!mentorMap[mentorId]) {
        mentorMap[mentorId] = {
          mentorName,
          mentorEmail,
          slotsMap: {},
        };
      }

      if (!mentorMap[mentorId].slotsMap[slotId]) {
        mentorMap[mentorId].slotsMap[slotId] = {
          slotId,
          startMinutes,
          timeRangeLabel: `${format12Hour(startStr)} - ${format12Hour(endStr)}`,
          durationLabel: calculateDuration(startStr, endStr),
          courseTitle,
          students: [],
        };
      }

      // Add student details to the slot
      mentorMap[mentorId].slotsMap[slotId].students.push({
        id: student.id || '',
        name: student.name || 'Anonymous Student',
        email: student.email || '',
      });
    });

    // 3. Convert mapped structure to sorted array format
    return Object.entries(mentorMap).map(([mentorId, data]) => {
      const sortedSlots = Object.values(data.slotsMap).sort((a, b) => a.startMinutes - b.startMinutes);
      return {
        mentorId,
        mentorName: data.mentorName,
        mentorEmail: data.mentorEmail,
        slots: sortedSlots,
      };
    }).sort((a, b) => a.mentorName.localeCompare(b.mentorName));
  }, [enrollments, courses, selectedDate]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 border-b border-border-subtle/60 bg-background/50 backdrop-blur-md shrink-0">
        <div>
          <h2 className="text-base font-bold text-foreground">Daily Schedule Inspector</h2>
          <p className="text-xs text-muted mt-0.5">Inspect all active mentoring slot allocations grouped by mentor.</p>
        </div>

        {/* Date Selector input */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-9 pr-4 py-2 bg-card-bg border border-border-subtle rounded-xl text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 font-semibold cursor-pointer"
            />
          </div>
          <button
            onClick={loadData}
            title="Refresh schedule data"
            className="p-2 bg-card-bg border border-border-subtle rounded-xl text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {error && (
          <div className="p-4 bg-rose-500/10 text-rose-400 border border-rose-500/25 rounded-2xl text-xs font-semibold flex items-center gap-3 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-xs text-muted font-medium">
            <RefreshCw className="w-6 h-6 text-primary animate-spin" />
            <span>Loading schedule data...</span>
          </div>
        ) : groupedData.length === 0 ? (
          <div className="py-20 px-6 text-center bg-card-bg border border-dashed border-border-subtle rounded-3xl space-y-3 max-w-lg mx-auto mt-6">
            <CalendarRange className="w-12 h-12 text-muted/30 mx-auto animate-pulse" />
            <h3 className="text-sm font-bold text-foreground">No Active Slots Found</h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              There are no active student enrollments scheduled for the date <span className="font-semibold text-primary">{selectedDate}</span>.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedData.map((group) => (
              <div key={group.mentorId} className="space-y-3">
                {/* Mentor section title */}
                <div className="flex items-center gap-2 pb-1 border-b border-border-subtle/30">
                  <User className="w-4.5 h-4.5 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">{group.mentorName}</h3>
                  <span className="text-[10px] text-muted font-normal">({group.mentorEmail})</span>
                  <span className="ml-auto px-2 py-0.5 text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 rounded-full">
                    {group.slots.length} {group.slots.length === 1 ? 'Slot' : 'Slots'}
                  </span>
                </div>

                {/* Slots grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {group.slots.map((slot) => (
                    <div
                      key={slot.slotId}
                      className="p-4 bg-card-bg border border-border-subtle/60 rounded-2xl flex flex-col justify-between gap-3 hover:border-primary/50 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                          <Clock className="w-4 h-4 text-primary shrink-0" />
                          <span>{slot.timeRangeLabel}</span>
                        </div>
                        <span className="text-[9px] font-bold text-muted bg-background px-2 py-0.5 rounded-md border border-border-subtle/50">
                          {slot.durationLabel}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-muted uppercase tracking-wider block">Course Track</span>
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-foreground">
                          <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate">{slot.courseTitle}</span>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-border-subtle/30">
                        <span className="text-[9px] font-bold text-muted uppercase tracking-wider block mb-1">
                          Enrolled Students ({slot.students.length})
                        </span>
                        <ul className="space-y-1 max-h-24 overflow-y-auto pr-1">
                          {slot.students.map((student) => (
                            <li key={student.id} className="text-[10px] text-foreground leading-normal flex items-start gap-1">
                              <span className="text-primary mt-0.5 shrink-0">•</span>
                              <div className="min-w-0">
                                <span className="font-semibold block truncate">{student.name}</span>
                                <span className="text-[9px] text-muted block truncate">{student.email}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminScheduleInspectorDashboard;
