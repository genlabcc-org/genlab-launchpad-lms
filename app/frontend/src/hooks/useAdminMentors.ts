/**
 * useAdminMentors — Data & State Layer
 *
 * Single-responsibility hook for the Admin Mentors Dashboard.
 * Owns state, API calls, filtering, and CRUD operations.
 *
 * SOLID S: one hook, one purpose.
 * SOLID D: views depend on this interface, not on adminApi directly.
 */
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '../api/admin';
import { fallbackMentors, fallbackCourses } from '../data/courseFallbacks';
import { fallbackStudents } from '../data/studentFallbacks';
import type { MentorDto, MentorScheduleDto, CourseDto } from '../api/types';
import type { StatusMessage } from '../components/dashboards/shared/directory/shared';

// ─── Public types ─────────────────────────────────────────────────────────────

export type MentorView = 'list' | 'create';

export interface MentorFormState {
  name: string;
  email: string;
}

export interface UseAdminMentorsReturn {
  // Data
  mentors: MentorDto[];
  filteredMentors: MentorDto[];
  selectedMentor: MentorDto | null;
  selectedMentorId: string | null;
  selectedMentorSchedules: MentorScheduleDto[];
  courses: CourseDto[];

  // Loading / Status
  isLoading: boolean;
  isSaving: boolean;
  isLoadingSchedules: boolean;
  message: StatusMessage;

  // View
  view: MentorView;
  isEditing: boolean;

  // Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedFilterId: string;
  setSelectedFilterId: (id: string) => void;

  // Form
  form: MentorFormState;
  setFormField: <K extends keyof MentorFormState>(key: K, value: MentorFormState[K]) => void;

  // Actions
  openCreateView: () => void;
  closeCreateView: () => void;
  selectMentor: (id: string | null) => void;
  loadMentors: () => Promise<void>;
  handleCreateMentor: (e: React.FormEvent) => Promise<void>;
  handleDeleteMentor: (id: string) => Promise<void>;
  handleStartEdit: () => void;
  handleCancelEdit: () => void;
  handleSaveChanges: () => Promise<void>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_FORM: MentorFormState = { name: '', email: '' };

const extractError = (err: any, fallback: string): string =>
  err?.response?.data?.message ?? err?.message ?? fallback;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAdminMentors(): UseAdminMentorsReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mentors, setMentors] = useState<MentorDto[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<MentorDto | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<StatusMessage>(null);

  const [selectedMentorSchedules, setSelectedMentorSchedules] = useState<MentorScheduleDto[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [courses, setCourses] = useState<CourseDto[]>([]);

  const [view, setView] = useState<MentorView>('list');
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterId, setSelectedFilterId] = useState('all');

  const [form, setForm] = useState<MentorFormState>(EMPTY_FORM);

  // ── Load ──────────────────────────────────────────────────────────────────

  const loadCourses = async () => {
    try {
      const fetched = await adminApi.getAllCourses();
      setCourses(fetched.length ? fetched : fallbackCourses);
    } catch {
      setCourses(fallbackCourses);
    }
  };

  const loadMentors = async () => {
    setIsLoading(true);
    try {
      const fetched = await adminApi.getAllMentors();
      setMentors(fetched.length ? fetched : fallbackMentors);
    } catch {
      setMentors(fallbackMentors);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    loadMentors(); 
    loadCourses();
    if (searchParams.get('create') === 'true') {
      setView('create');
      setSearchParams({}, { replace: true });
    }
  }, []);

  // ── Derived: filtered list ────────────────────────────────────────────────

  const filteredMentors = useMemo(() => {
    let list = mentors;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          (m.name ?? '').toLowerCase().includes(q) ||
          (m.email ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [mentors, searchQuery, selectedFilterId]);

  // ── Form helpers ──────────────────────────────────────────────────────────

  const setFormField = <K extends keyof MentorFormState>(key: K, value: MentorFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ── Actions ───────────────────────────────────────────────────────────────

  const openCreateView = () => {
    setForm(EMPTY_FORM);
    setView('create');
    setIsEditing(false);
    setMessage(null);
  };

  const closeCreateView = () => {
    setView('list');
    setMessage(null);
  };

  const getFallbackSchedules = (mentorId: string): MentorScheduleDto[] => {
    // Filter students assigned to this mentor in mock fallback list
    const assignedStudents = fallbackStudents.filter((s) => s.assignedMentorId === mentorId);
    if (assignedStudents.length === 0) return [];

    // Group by course + slot + dates
    const groups: {
      [key: string]: {
        courseId: string;
        slotId: string;
        startDate: string;
        endDate: string;
        students: typeof fallbackStudents;
      };
    } = {};

    assignedStudents.forEach((student) => {
      if (!student.registeredCourseId || !student.timeSlotId) return;
      const key = `${student.registeredCourseId}_${student.timeSlotId}_${student.startDate}_${student.endDate}`;
      if (!groups[key]) {
        groups[key] = {
          courseId: student.registeredCourseId,
          slotId: student.timeSlotId,
          startDate: student.startDate ?? '',
          endDate: student.endDate ?? '',
          students: [],
        };
      }
      groups[key].students.push(student);
    });

    return Object.values(groups).map((g, index) => {
      const course = fallbackCourses.find((c) => c.id === g.courseId) || {
        id: g.courseId,
        title: 'GenLab Creator Launchpad (Beta)',
        price: 699.00,
        isActive: true,
      };
      const slot = {
        id: g.slotId,
        name: g.slotId === 'd1b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd1' ? '10:00 AM – 12:00 PM' : '2:00 PM – 4:00 PM',
        startTime: g.slotId === 'd1b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd1' ? { hour: 10, minute: 0 } : { hour: 14, minute: 0 },
        endTime: g.slotId === 'd1b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd1' ? { hour: 12, minute: 0 } : { hour: 16, minute: 0 },
      };
      const mentor = fallbackMentors.find((m) => m.id === mentorId) || {
        id: mentorId,
        name: 'Anika Sen',
        email: 'anika.sen@genlab.cc',
      };

      return {
        id: `mock-schedule-${mentorId}-${index}`,
        mentor,
        course,
        slot,
        startDate: g.startDate,
        endDate: g.endDate,
        batchId: '2026_july_batch_1',
        students: g.students,
      };
    });
  };

  const loadMentorSchedules = async (mentorId: string) => {
    setIsLoadingSchedules(true);
    try {
      const schedules = await adminApi.getMentorSlots(mentorId);
      if (schedules.length === 0) {
        setSelectedMentorSchedules(getFallbackSchedules(mentorId));
      } else {
        setSelectedMentorSchedules(schedules);
      }
    } catch (err) {
      console.error('Failed to load mentor schedules', err);
      setSelectedMentorSchedules(getFallbackSchedules(mentorId));
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  const selectMentor = (id: string | null) => {
    setSelectedMentorId(id);
    setSelectedMentor(id ? (mentors.find((m) => m.id === id) ?? null) : null);
    setIsEditing(false);
    if (id) {
      loadMentorSchedules(id);
    } else {
      setSelectedMentorSchedules([]);
    }
  };

  const handleCreateMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      await adminApi.createMentor({ name: form.name, email: form.email });
      setMessage({ text: 'Mentor created successfully.', type: 'success' });
      await loadMentors();
      setView('list');
    } catch (err) {
      setMessage({ text: extractError(err, 'Failed to create mentor.'), type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMentor = async (id: string) => {
    try {
      await adminApi.deleteMentor(id);
      setMentors((prev) => prev.filter((m) => m.id !== id));
      if (selectedMentorId === id) selectMentor(null);
    } catch (err) {
      setMessage({ text: extractError(err, 'Failed to delete mentor.'), type: 'error' });
    }
  };

  // ── Edit Handlers ─────────────────────────────────────────────────────────

  const handleStartEdit = () => {
    if (!selectedMentor) return;
    setForm({
      name: selectedMentor.name ?? '',
      email: selectedMentor.email ?? '',
    });
    setIsEditing(true);
    setMessage(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setMessage(null);
  };

  const handleSaveChanges = async () => {
    if (!selectedMentorId) return;
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await adminApi.updateMentor(selectedMentorId, {
        name: form.name,
        email: form.email,
      });
      setSelectedMentor(updated);
      setMentors((prev) => prev.map((m) => (m.id === selectedMentorId ? updated : m)));
      setMessage({ text: 'Changes saved successfully.', type: 'success' });
      setTimeout(() => {
        setIsEditing(false);
        setMessage(null);
      }, 1000);
    } catch (err) {
      setMessage({ text: extractError(err, 'Failed to save changes.'), type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    mentors, filteredMentors, selectedMentor, selectedMentorId,
    selectedMentorSchedules,
    courses,
    isLoading, isSaving, isLoadingSchedules, message,
    view, isEditing,
    searchQuery, setSearchQuery, selectedFilterId, setSelectedFilterId,
    form, setFormField,
    openCreateView, closeCreateView, selectMentor,
    loadMentors, handleCreateMentor, handleDeleteMentor,
    handleStartEdit, handleCancelEdit, handleSaveChanges,
  };
}
