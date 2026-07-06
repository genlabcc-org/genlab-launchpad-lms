/**
 * useAdminCourses — Data & State Layer
 *
 * Single-responsibility hook that owns ALL state, API orchestration, and
 * business logic for the Admin Courses Dashboard.  The view layer must
 * NEVER import `adminApi` or `fallbackCourses` directly.
 *
 * SOLID compliance:
 *  S — one hook, one purpose: courses feature state.
 *  O — add new handlers without touching view components.
 *  D — view depends on this hook's interface, not on concrete API calls.
 */
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '../api/admin';
import type { CourseDto, CourseRequest, MentorDto } from '../api/types';

// ─── Public types ────────────────────────────────────────────────────────────

export type DashboardView = 'split' | 'create';
export type DetailTab = 'overview' | 'syllabus' | 'mentors';
export type StatusMessage = { text: string; type: 'success' | 'error' } | null;

export interface CourseFormState {
  title: string;
  description: string;
  price: number;
  mentorIds: string[];
  syllabus: string[];
  isActive: boolean;
}

export interface UseAdminCoursesReturn {
  // ── Data ─────────────────────────────────────────
  courses: CourseDto[];
  mentors: MentorDto[];
  filteredCourses: CourseDto[];
  selectedCourse: CourseDto | null;
  selectedCourseId: string | null;

  // ── Loading / Status ─────────────────────────────
  isLoadingList: boolean;
  isLoadingDetails: boolean;
  isSaving: boolean;
  message: StatusMessage;

  // ── Navigation ───────────────────────────────────
  view: DashboardView;
  isEditing: boolean;

  // ── Filters ──────────────────────────────────────
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedFilterId: string;
  setSelectedFilterId: (id: string) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;

  // ── Form state ───────────────────────────────────
  form: CourseFormState;
  setFormField: <K extends keyof CourseFormState>(key: K, value: CourseFormState[K]) => void;



  // ── Action handlers ──────────────────────────────
  openCreateView: () => void;
  closeCreateView: () => void;
  selectCourse: (id: string | null) => void;
  loadCourses: () => Promise<void>;
  handleStartEdit: () => void;
  handleCancelEdit: () => void;
  handleSaveChanges: () => Promise<void>;
  handleCreateCourse: (e: React.FormEvent) => Promise<void>;
  handleDeleteCourse: () => Promise<void>;
  handleAddSyllabusItem: () => void;
  handleUpdateSyllabusItem: (index: number, value: string) => void;
  handleRemoveSyllabusItem: (index: number) => void;
  handleToggleMentor: (mentorId: string) => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

/** Base empty form — also the initial state. */
const EMPTY_FORM: CourseFormState = { title: '', description: '', price: 0, mentorIds: [], syllabus: [], isActive: true };

/** Pre-filled defaults used when opening the create view. */
const DEFAULT_FORM: CourseFormState = { ...EMPTY_FORM, price: 499, syllabus: ['Introduction Module'], isActive: true };

/** Extract a human-readable message from any thrown API error. */
const extractErrorMessage = (err: any, fallback: string): string =>
  err?.response?.data?.message ?? err?.message ?? fallback;

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAdminCourses(): UseAdminCoursesReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  // Data
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [mentors, setMentors] = useState<MentorDto[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseDto | null>(null);

  // Loading / status
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<StatusMessage>(null);

  // Navigation
  const [view, setView] = useState<DashboardView>('split');
  const [isEditing, setIsEditing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterId, setSelectedFilterId] = useState('all');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('settings.viewFavorites');
    return saved ? JSON.parse(saved) : ['all', 'active'];
  });

  const toggleFavorite = (id: string) => {
    let updated: string[];
    if (favorites.includes(id)) {
      updated = favorites.filter((fav) => fav !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    localStorage.setItem('settings.viewFavorites', JSON.stringify(updated));
  };

  // Form state (shared by create + edit)
  const [form, setForm] = useState<CourseFormState>(EMPTY_FORM);

  // ── Derived ────────────────────────────────────────────────────────────────

  const filteredCourses = useMemo(() => {
    let list = courses;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          (c.title || '').toLowerCase().includes(q) ||
          (c.description || '').toLowerCase().includes(q),
      );
    }
    return list.filter((course) => {
      switch (selectedFilterId) {
        case 'all':
          return true;
        case 'active':
          return course.isActive !== false;
        case 'inactive':
          return course.isActive === false;
        case 'free':
          return (course.price ?? 0) === 0;
        case 'assigned':
          return (course.mentors?.length ?? 0) > 0;
        case 'unassigned':
          return (course.mentors?.length ?? 0) === 0;
        default:
          return true;
      }
    });
  }, [courses, searchQuery, selectedFilterId]);

  // ── API helpers ────────────────────────────────────────────────────────────

  const loadCourses = async () => {
    setIsLoadingList(true);
    try {
      const fetched = await adminApi.getAllCourses();
      setCourses(fetched || []);
    } catch {
      setCourses([]);
    } finally {
      setIsLoadingList(false);
    }
  };

  const loadMentors = async () => {
    try {
      const fetched = await adminApi.getAllMentors();
      setMentors(fetched || []);
    } catch {
      setMentors([]);
    }
  };

  const loadCourseDetails = async (id: string) => {
    setIsLoadingDetails(true);
    setMessage(null);
    try {
      const details = await adminApi.getCourseById(id);
      setSelectedCourse(details);
    } catch {
      const local = courses.find((c) => c.id === id) ?? null;
      setSelectedCourse(local);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    loadCourses();
    loadMentors();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadCourseDetails(selectedCourseId);
      setIsEditing(false);
    } else {
      setSelectedCourse(null);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setView('create');
      setForm(DEFAULT_FORM);
      setMessage(null);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // ── Generic form field setter ──────────────────────────────────────────────

  const setFormField = <K extends keyof CourseFormState>(key: K, value: CourseFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ── Navigation handlers ────────────────────────────────────────────────────

  const openCreateView = () => {
    setForm(DEFAULT_FORM);
    setMessage(null);
    setView('create');
  };

  const closeCreateView = () => {
    setView('split');
  };

  const selectCourse = (id: string | null) => {
    setSelectedCourseId(id);
  };

  // ── Edit handlers ──────────────────────────────────────────────────────────

  const handleStartEdit = () => {
    if (!selectedCourse) return;
    setForm({
      title: selectedCourse.title ?? '',
      description: selectedCourse.description ?? '',
      price: selectedCourse.price ?? 0,
      mentorIds: selectedCourse.mentors?.map((m) => m.id!).filter(Boolean) ?? [],
      syllabus: selectedCourse.syllabus ?? [],
      isActive: selectedCourse.isActive !== false,
    });
    setIsEditing(true);
    setMessage(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setMessage(null);
  };

  // ── Syllabus handlers ──────────────────────────────────────────────────────

  const handleAddSyllabusItem = () => {
    setForm((prev) => ({ ...prev, syllabus: [...prev.syllabus, ''] }));
  };

  const handleUpdateSyllabusItem = (index: number, value: string) => {
    setForm((prev) => {
      const updated = [...prev.syllabus];
      updated[index] = value;
      return { ...prev, syllabus: updated };
    });
  };

  const handleRemoveSyllabusItem = (index: number) => {
    setForm((prev) => ({ ...prev, syllabus: prev.syllabus.filter((_, i) => i !== index) }));
  };

  // ── Mentor handler ─────────────────────────────────────────────────────────

  const handleToggleMentor = (mentorId: string) => {
    setForm((prev) => ({
      ...prev,
      mentorIds: prev.mentorIds.includes(mentorId)
        ? prev.mentorIds.filter((id) => id !== mentorId)
        : [...prev.mentorIds, mentorId],
    }));
  };



  // ── CRUD handlers ──────────────────────────────────────────────────────────

  /** Maps current form state to the API request shape. */
  const buildPayload = (): CourseRequest => ({
    ...form,
    syllabus: form.syllabus.filter((item) => item.trim() !== ''),
    isActive: form.isActive,
  });

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setMessage({ text: 'Title and Description are required fields.', type: 'error' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const created = await adminApi.createCourse(buildPayload());
      setMessage({ text: 'Course successfully added to catalog!', type: 'success' });

      setTimeout(async () => {
        setIsLoadingList(true);
        try {
          const fresh = await adminApi.getAllCourses();
          setCourses(fresh);
        } catch {
          setCourses((prev) => [...prev, created]);
        }
        setSelectedCourseId(created.id ?? null);
        setView('split');
        setIsLoadingList(false);
      }, 1500);
    } catch (err: any) {
      setMessage({ text: extractErrorMessage(err, 'Failed to register course in database.'), type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedCourseId || !form.title.trim() || !form.description.trim()) {
      setMessage({ text: 'Title and Description cannot be blank.', type: 'error' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const updated = await adminApi.updateCourse(selectedCourseId, buildPayload());
      setSelectedCourse(updated);
      setCourses((prev) => prev.map((c) => (c.id === selectedCourseId ? updated : c)));
      setMessage({ text: 'Changes saved successfully.', type: 'success' });
      setTimeout(() => {
        setIsEditing(false);
        setMessage(null);
      }, 1000);
    } catch (err: any) {
      setMessage({ text: extractErrorMessage(err, 'Failed to save changes.'), type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourseId) return;
    if (
      !confirm(
        'Are you sure you want to permanently delete this course? This action cannot be undone.',
      )
    )
      return;

    setIsLoadingDetails(true);
    try {
      await adminApi.deleteCourse(selectedCourseId);
      setCourses((prev) => prev.filter((c) => c.id !== selectedCourseId));
      setSelectedCourseId(null);
      setSelectedCourse(null);
    } catch (err: any) {
      alert(extractErrorMessage(err, 'Failed to delete course.'));
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // ── Public interface ───────────────────────────────────────────────────────

  return {
    courses,
    mentors,
    filteredCourses,
    selectedCourse,
    selectedCourseId,
    isLoadingList,
    isLoadingDetails,
    isSaving,
    message,
    view,
    isEditing,
    searchQuery,
    setSearchQuery,
    selectedFilterId,
    setSelectedFilterId,
    favorites,
    toggleFavorite,
    form,
    setFormField,
    openCreateView,
    closeCreateView,
    selectCourse,
    loadCourses,
    handleStartEdit,
    handleCancelEdit,
    handleSaveChanges,
    handleCreateCourse,
    handleDeleteCourse,
    handleAddSyllabusItem,
    handleUpdateSyllabusItem,
    handleRemoveSyllabusItem,
    handleToggleMentor,
  };
}
