import { useEffect, useState, useMemo } from 'react';
import {
  Search, Calendar, RefreshCw, CheckCircle, AlertCircle
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import type { StudentDto, CourseDto, BatchDto, CourseCapacityDto } from '../../api/types';

export function AdminSchedulingDashboard() {
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [batchesList, setBatchesList] = useState<BatchDto[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  
  // Selection
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  
  // Bulk Assign Targets
  const [bulkCourseId, setBulkCourseId] = useState('');
  const [bulkMentorId, setBulkMentorId] = useState('');
  const [bulkSlotId, setBulkSlotId] = useState('');
  const [bulkBatchId, setBulkBatchId] = useState('');
  
  // Matrix states
  const [capacityMatrix, setCapacityMatrix] = useState<CourseCapacityDto | null>(null);
  const [loadingCapacity, setLoadingCapacity] = useState(false);
  const [bulkAssigning, setBulkAssigning] = useState(false);
  
  // Loading/Messages
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const [fetchedStudents, fetchedCourses, , , fetchedBatches] = await Promise.all([
        adminApi.getAllStudents(),
        adminApi.getAllCourses(),
        adminApi.getAllMentors(),
        adminApi.getAllSlots(),
        adminApi.getAllBatches()
      ]);

      // Only care about unscheduled students (assignedMentorId is null)
      setStudents(fetchedStudents.filter((s: StudentDto) => !s.assignedMentorId) || []);
      setCourses(fetchedCourses || []);
      setBatchesList(fetchedBatches || []);
    } catch (e: any) {
      console.error('Failed to load data for Scheduling Hub', e);
      setMessage({ text: 'Failed to load scheduling data from backend.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Snapped Dates Alignment
  const calculatedDates = useMemo(() => {
    if (!bulkBatchId || !bulkCourseId) return null;
    const batch = batchesList.find(b => b.id === bulkBatchId);
    const course = courses.find(c => c.id === bulkCourseId);
    if (!batch || !course) return null;

    const startDate = new Date(batch.startDate);
    const duration = course.durationInDays || 90;
    
    const rawEndDate = new Date(startDate.getTime());
    rawEndDate.setDate(rawEndDate.getDate() + duration);

    let snappedEndDate = new Date(rawEndDate.getTime());
    const startDay = startDate.getDate();

    if (startDay === 1) {
      snappedEndDate = new Date(rawEndDate.getFullYear(), rawEndDate.getMonth() + 1, 0);
    } else if (startDay === 15) {
      if (rawEndDate.getDate() <= 15) {
        snappedEndDate = new Date(rawEndDate.getFullYear(), rawEndDate.getMonth(), 15);
      } else {
        snappedEndDate = new Date(rawEndDate.getFullYear(), rawEndDate.getMonth() + 1, 15);
      }
    }

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    return {
      startDate: formatDate(startDate),
      endDate: formatDate(snappedEndDate),
    };
  }, [bulkBatchId, bulkCourseId, batchesList, courses]);

  // Fetch Matrix
  useEffect(() => {
    if (bulkCourseId && calculatedDates) {
      setLoadingCapacity(true);
      adminApi.getCourseCapacity(bulkCourseId, calculatedDates.startDate, calculatedDates.endDate)
        .then(setCapacityMatrix)
        .catch(err => console.error('Failed to fetch capacity', err))
        .finally(() => setLoadingCapacity(false));
    } else {
      setCapacityMatrix(null);
    }
  }, [bulkCourseId, calculatedDates]);

  // Filter out mismatched selected students when course track changes
  useEffect(() => {
    if (bulkCourseId) {
      setSelectedStudentIds(prev =>
        prev.filter(id => {
          const student = students.find(s => s.id === id);
          if (!student) return false;
          return student.interestedCourseId === bulkCourseId || student.registeredCourseId === bulkCourseId;
        })
      );
    }
  }, [bulkCourseId, students]);


  // Filtered Students
  const filteredStudents = useMemo(() => {
    let result = students;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        (s.name || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q)
      );
    }
    if (courseFilter !== 'all') {
      result = result.filter(s => s.interestedCourseId === courseFilter || s.registeredCourseId === courseFilter);
    }
    return result;
  }, [students, searchQuery, courseFilter]);

  const handleBulkSubmit = async () => {
    if (!bulkCourseId || !bulkBatchId || !bulkMentorId || !bulkSlotId || selectedStudentIds.length === 0) return;
    setBulkAssigning(true);
    setMessage(null);
    try {
      await adminApi.bulkAssignEnrollments({
        studentIds: selectedStudentIds,
        courseId: bulkCourseId,
        mentorId: bulkMentorId,
        slotId: bulkSlotId,
        batchId: bulkBatchId,
      });

      setMessage({ text: `Successfully scheduled ${selectedStudentIds.length} students to the selected slot!`, type: 'success' });
      setSelectedStudentIds([]);
      setBulkCourseId('');
      setBulkMentorId('');
      setBulkSlotId('');
      setBulkBatchId('');
      loadData();
    } catch (e: any) {
      console.error('Failed bulk assignment', e);
      setMessage({
        text: e.response?.data?.message || e.message || 'Failed to complete bulk slot assignment.',
        type: 'error',
      });
    } finally {
      setBulkAssigning(false);
    }
  };

  const getCourseName = (id?: string) => {
    return courses.find(c => c.id === id)?.title || 'Not Enrolled';
  };

  const formatTimeObj = (t: any) => {
    if (!t) return '';
    if (typeof t === 'string') {
      return t.substring(0, 5);
    }
    const h = String(t.hour ?? 0).padStart(2, '0');
    const m = String(t.minute ?? 0).padStart(2, '0');
    return `${h}:${m}`;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Pinned Header */}
      <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-border-subtle/60 bg-background/30 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-foreground">Visual Scheduling Hub</h2>
          <p className="text-[10px] text-muted">Select unassigned/pending students and assign them slots based on batch limits.</p>
        </div>
      </div>

      {/* Main Layout Split */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Pending Student Selection */}
        <div className="w-full lg:w-[45%] flex flex-col border-r border-border-subtle/50 bg-background overflow-hidden">
          {/* Filters Bar */}
          <div className="p-3 border-b border-border-subtle/40 flex flex-wrap gap-2 items-center bg-card-bg/60">
            <div className="relative flex-1 min-w-[120px]">
              <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search pending students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-[11px] bg-background border border-border-subtle rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
              />
            </div>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="py-1 px-2 text-[11px] bg-background border border-border-subtle rounded-md text-foreground focus:outline-none"
            >
              <option value="all">All Interested Courses</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-muted font-medium">Loading unassigned students...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted font-medium">No pending students awaiting scheduling.</div>
            ) : (
              <div className="divide-y divide-border-subtle/25">
                {filteredStudents.map(student => {
                  const isSelected = selectedStudentIds.includes(student.id!);
                  const isMismatch = !!bulkCourseId && 
                    student.interestedCourseId !== bulkCourseId && 
                    student.registeredCourseId !== bulkCourseId;
                  return (
                    <label
                      key={student.id}
                      className={`flex items-start gap-3 p-3.5 transition-colors ${
                        isMismatch ? 'opacity-60 cursor-not-allowed bg-muted/5' : 'cursor-pointer hover:bg-primary/5'
                      } ${
                        isSelected ? 'bg-primary/5 border-l-2 border-primary' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isMismatch}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudentIds(prev => [...prev, student.id!]);
                          } else {
                            setSelectedStudentIds(prev => prev.filter(id => id !== student.id));
                          }
                        }}
                        className="accent-primary w-3.5 h-3.5 mt-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-foreground block truncate">{student.name}</span>
                        <span className="text-[10px] text-muted block truncate mt-0.5">{student.email}</span>
                        <span className="text-[9px] text-primary font-bold uppercase block mt-1">
                          Interested In: {getCourseName(student.interestedCourseId || student.registeredCourseId)}
                        </span>
                        {isMismatch && (
                          <span className="text-[9px] text-rose-500 font-bold mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            Course Mismatch (Interested: {getCourseName(student.interestedCourseId || student.registeredCourseId)})
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Checklist progress */}
          {selectedStudentIds.length > 0 && (
            <div className="p-3 bg-primary/5 border-t border-primary/20 flex items-center justify-between text-xs font-semibold shrink-0">
              <span className="text-foreground">{selectedStudentIds.length} students selected</span>
              <button
                onClick={() => setSelectedStudentIds([])}
                className="text-[10px] text-muted hover:text-foreground"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Interactive Capacity Assignment Matrix */}
        <div className="flex-1 flex flex-col overflow-y-auto p-5 space-y-4">
          {message && (
            <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-4.5 h-4.5" /> : <AlertCircle className="w-4.5 h-4.5" />}
              <span>{message.text}</span>
            </div>
          )}

          <div className="flex flex-col gap-5">
            {/* 1. Setup Card Container */}
            <div className="bg-card-bg p-5 border border-border-subtle/60 rounded-2xl space-y-3">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">1. Setup</span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                {/* Left Column: Dropdowns Box + Button */}
                <div className="flex flex-col justify-between gap-3">
                  {/* Selectors Card */}
                  <div className="bg-background/40 p-4 border border-border-subtle/50 rounded-xl space-y-3 flex-1 flex flex-col justify-center">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-muted uppercase tracking-wider block">Select Course Track</label>
                      <select
                        value={bulkCourseId}
                        onChange={(e) => {
                          setBulkCourseId(e.target.value);
                          setBulkMentorId('');
                          setBulkSlotId('');
                        }}
                        className="w-full py-2 px-3 bg-background border border-border-subtle rounded-xl text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                      >
                        <option value="">-- Choose Course --</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-muted uppercase tracking-wider block">Select Intake Batch</label>
                      <select
                        value={bulkBatchId}
                        onChange={(e) => setBulkBatchId(e.target.value)}
                        className="w-full py-2 px-3 bg-background border border-border-subtle rounded-xl text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                      >
                        <option value="">-- Choose Intake Batch --</option>
                        {batchesList.map(b => <option key={b.id} value={b.id}>{b.name} ({b.startDate})</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Confirm Button */}
                  <button
                    onClick={handleBulkSubmit}
                    disabled={bulkAssigning || selectedStudentIds.length === 0 || !bulkCourseId || !bulkBatchId || !bulkMentorId || !bulkSlotId}
                    className="w-full py-2.5 px-4 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl text-xs shadow-sm transition disabled:opacity-50 cursor-pointer"
                  >
                    {bulkAssigning ? 'Assigning...' : `Confirm Slot Assignment (${selectedStudentIds.length})`}
                  </button>
                </div>

                {/* Right Column: Calculated Schedule Limits / Summary Card */}
                <div className="bg-background/40 p-4 border border-border-subtle/50 rounded-xl flex flex-col justify-between min-h-[160px]">
                  <span className="text-[9px] font-bold text-primary uppercase tracking-wider block">Calculated Schedule Limits</span>

                  {calculatedDates ? (
                    <div className="space-y-2.5 my-auto">
                      <div className="flex justify-between items-center py-1.5 border-b border-border-subtle/30">
                        <span className="text-xs text-muted">Start Date</span>
                        <span className="text-xs font-bold text-foreground">{calculatedDates.startDate}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-border-subtle/30">
                        <span className="text-xs text-muted">Snapped End Date</span>
                        <span className="text-xs font-bold text-foreground">{calculatedDates.endDate}</span>
                      </div>
                      {bulkMentorId && bulkSlotId && (
                        <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1.5 pt-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Slot &amp; Mentor Selected
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="my-auto text-center py-4 text-muted text-xs font-medium space-y-1">
                      <Calendar className="w-7 h-7 mx-auto text-muted/40 mb-1" />
                      <p>Select a Course Track and Intake Batch to calculate schedule limits.</p>
                    </div>
                  )}

                  <div className="text-[9px] text-muted/70 pt-2 border-t border-border-subtle/20">
                    Automatic end-date snapping based on batch start date &amp; course duration.
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Interactive Capacity Matrix — full-width */}
            <div className="w-full border border-border-subtle/60 bg-card-bg p-5 rounded-2xl flex flex-col">
              <div className="flex items-center justify-between mb-3 border-b border-border-subtle/30 pb-2">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">2. Interactive Capacity Matrix</span>
              </div>

              {!bulkCourseId || !bulkBatchId ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8 text-muted text-xs font-semibold">
                  <Calendar className="w-9 h-9 text-muted/50 mb-2" />
                  <span>Choose Course Track & Intake Batch to load matrix</span>
                </div>
              ) : loadingCapacity ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-muted text-xs font-semibold gap-2">
                  <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                  <span>Calculating overlapping capacities...</span>
                </div>
              ) : !capacityMatrix || capacityMatrix.mentors.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-8 text-muted text-xs font-semibold">
                  <span>No mentors assigned to this course yet.</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[10px] font-semibold text-foreground">
                    <thead>
                      <tr className="border-b border-border-subtle/40 text-muted">
                        <th className="py-2 pr-4 font-bold">Slot Time</th>
                        {capacityMatrix.mentors.map(m => (
                          <th key={m.id} className="py-2 px-3 font-bold text-center">{m.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle/20">
                      {capacityMatrix.slots.map(slot => (
                        <tr key={slot.id} className="hover:bg-primary/5">
                          <td className="py-3 pr-4 font-bold text-foreground">
                            {formatTimeObj(slot.startTime)} - {formatTimeObj(slot.endTime)}
                          </td>
                          {capacityMatrix.mentors.map(mentor => {
                            const cell = capacityMatrix.matrix[slot.id!]?.[mentor.id!];
                            const current = cell?.currentEnrollments ?? 0;
                            const max = cell?.maxCapacity ?? 12;
                            const isFull = cell?.isFull ?? false;
                            const isSelected = bulkMentorId === mentor.id && bulkSlotId === slot.id;

                            return (
                              <td key={mentor.id} className="py-2 px-1.5 text-center">
                                <button
                                  type="button"
                                  disabled={isFull}
                                  onClick={() => {
                                    setBulkMentorId(mentor.id!);
                                    setBulkSlotId(slot.id!);
                                  }}
                                  className={`w-full py-1.5 px-2.5 rounded-xl border font-bold text-[10px] transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : isFull
                                      ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 opacity-50 cursor-not-allowed'
                                      : 'bg-background/50 text-foreground border-border-subtle hover:border-primary/50'
                                  }`}
                                >
                                  {current} / {max}
                                  {isFull && <span className="block text-[8px] font-normal text-rose-400">FULL</span>}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSchedulingDashboard;
