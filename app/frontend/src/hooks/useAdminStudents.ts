/**
 * useAdminStudents — Data & State Layer
 *
 * Single-responsibility hook that owns ALL state, API orchestration, and
 * business logic for the Admin Students Dashboard. View layer must NEVER
 * import adminApi directly.
 *
 * SOLID compliance:
 *  S — one hook, one purpose: students feature state.
 *  O — add new handlers without touching view components.
 *  D — view depends on this hook's interface, not concrete API calls.
 */
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '../api/admin';
import type { StudentDto, MentorDto, CourseDto, EnrollmentDto } from '../api/types';
import type { StatusMessage } from '../components/dashboards/shared/directory/shared';

// ─── Public types ─────────────────────────────────────────────────────────────

export type StudentView = 'list' | 'create';

export interface StudentFormState {
  name: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'non-binary' | '';
  emergencyMobile: string;
  address: string;
  institutionName: string;
  studentType: 'student' | 'fresher' | 'professional' | '';
  referralSource: string;
  paymentType: 'full payment' | 'monthly' | 'partial' | '';
  interestedCourseId: string;
  registeredCourseId: string;
  assignedMentorId: string;
  timeSlotId: string;
  totalAmount: number;
}

export interface UseAdminStudentsReturn {
  // Data
  students: StudentDto[];
  mentors: MentorDto[];
  courses: CourseDto[];
  filteredStudents: StudentDto[];
  selectedStudent: StudentDto | null;
  selectedStudentId: string | null;
  enrollments: EnrollmentDto[];

  // Loading / Status
  isLoading: boolean;
  isSaving: boolean;
  message: StatusMessage;

  // View
  view: StudentView;
  isEditing: boolean;

  // Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedFilterId: string;
  setSelectedFilterId: (id: string) => void;

  // Form
  form: StudentFormState;
  setFormField: <K extends keyof StudentFormState>(key: K, value: StudentFormState[K]) => void;

  // Actions
  openCreateView: () => void;
  closeCreateView: () => void;
  selectStudent: (id: string | null) => void;
  loadStudents: () => Promise<void>;
  handleCreateStudent: (e: React.FormEvent) => Promise<void>;
  handleDeleteStudent: (id: string) => Promise<void>;
  handleDeleteEnrollment: (enrollmentId: string) => Promise<void>;
  handleStartEdit: () => void;
  handleCancelEdit: () => void;
  handleSaveChanges: () => Promise<void>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_FORM: StudentFormState = {
  name: '', email: '', phone: '', gender: '',
  emergencyMobile: '',
  address: '', institutionName: '',
  studentType: '', referralSource: '',
  paymentType: '', interestedCourseId: '', registeredCourseId: '',
  assignedMentorId: '', timeSlotId: '',
  totalAmount: 699,
};

const extractError = (err: any, fallback: string): string =>
  err?.response?.data?.message ?? err?.message ?? fallback;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAdminStudents(): UseAdminStudentsReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [mentors, setMentors] = useState<MentorDto[]>([]);
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentDto[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentDto | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<StatusMessage>(null);

  const [view, setView] = useState<StudentView>('list');
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterId, setSelectedFilterId] = useState('all');

  const [form, setForm] = useState<StudentFormState>(EMPTY_FORM);

  // ── Load ──────────────────────────────────────────────────────────────────


  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const [fetchedStudents, fetchedMentors, fetchedCourses, fetchedEnrollments] = await Promise.all([
        adminApi.getAllStudents(),
        adminApi.getAllMentors(),
        adminApi.getAllCourses(),
        adminApi.getAllEnrollments(),
      ]);
      setStudents(fetchedStudents || []);
      setMentors(fetchedMentors || []);
      setCourses(fetchedCourses || []);
      setEnrollments(fetchedEnrollments || []);
    } catch {
      setStudents([]);
      setMentors([]);
      setCourses([]);
      setEnrollments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
    if (searchParams.get('create') === 'true') {
      setView('create');
      setSearchParams({}, { replace: true });
    }
  }, []);

  // ── Derived: filtered list ────────────────────────────────────────────────

  const filteredStudents = useMemo(() => {
    let list = students;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          (s.name ?? '').toLowerCase().includes(q) ||
          (s.email ?? '').toLowerCase().includes(q) ||
          (s.phone ?? '').toLowerCase().includes(q) ||
          (s.institutionName ?? '').toLowerCase().includes(q),
      );
    }
    switch (selectedFilterId) {
      case 'active':
        return list.filter((s) => s.assignedMentorId);
      case 'pending':
        return list.filter((s) => !s.assignedMentorId);
      case 'full':
        return list.filter((s) => s.paymentType === 'full payment');
      case 'partial':
        return list.filter((s) => s.paymentType === 'partial' || s.paymentType === 'monthly');
      default:
        return list;
    }
  }, [students, searchQuery, selectedFilterId]);

  // ── Form helpers ──────────────────────────────────────────────────────────

  const setFormField = <K extends keyof StudentFormState>(key: K, value: StudentFormState[K]) => {
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

  const selectStudent = (id: string | null) => {
    setSelectedStudentId(id);
    setSelectedStudent(id ? (students.find((s) => s.id === id) ?? null) : null);
    setIsEditing(false);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      await adminApi.createStudent({
        name: form.name,
        email: form.email,
        phone: form.phone,
        gender: form.gender || undefined,
        emergencyMobile: form.emergencyMobile || undefined,
        address: form.address || undefined,
        institutionName: form.institutionName || undefined,
        studentType: form.studentType || undefined,
        referralSource: form.referralSource || undefined,
        paymentType: form.paymentType || undefined,
        interestedCourseId: form.interestedCourseId || undefined,
        registeredCourseId: form.registeredCourseId || undefined,
        assignedMentorId: form.assignedMentorId || undefined,
        timeSlotId: form.timeSlotId || undefined,
        totalAmount: form.totalAmount,
      });
      setMessage({ text: 'Student registered successfully.', type: 'success' });
      await loadStudents();
      setView('list');
    } catch (err) {
      setMessage({ text: extractError(err, 'Failed to register student.'), type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      await adminApi.deleteStudent(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
      if (selectedStudentId === id) selectStudent(null);
    } catch (err) {
      setMessage({ text: extractError(err, 'Failed to delete student.'), type: 'error' });
    }
  };

  const handleDeleteEnrollment = async (enrollmentId: string) => {
    try {
      await adminApi.deleteEnrollment(enrollmentId);
      setMessage({ text: 'Course enrollment removed. Student is now unassigned.', type: 'success' });
      await loadStudents();
      if (selectedStudentId) {
        const updated = await adminApi.getStudentById(selectedStudentId);
        setSelectedStudent(updated);
        setForm((prev) => ({
          ...prev,
          registeredCourseId: '',
          assignedMentorId: '',
          timeSlotId: '',
        }));
      }
    } catch (err) {
      setMessage({ text: extractError(err, 'Failed to remove course enrollment.'), type: 'error' });
    }
  };

  // ── Edit Handlers ─────────────────────────────────────────────────────────

  const handleStartEdit = () => {
    if (!selectedStudent) return;
    setForm({
      name: selectedStudent.name ?? '',
      email: selectedStudent.email ?? '',
      phone: selectedStudent.phone ?? '',
      gender: (selectedStudent.gender as StudentFormState['gender']) ?? '',
      emergencyMobile: selectedStudent.emergencyMobile ?? '',
      address: selectedStudent.address ?? '',
      institutionName: selectedStudent.institutionName ?? '',
      studentType: (selectedStudent.studentType as StudentFormState['studentType']) ?? '',
      referralSource: selectedStudent.referralSource ?? '',
      paymentType: (selectedStudent.paymentType as StudentFormState['paymentType']) ?? '',
      interestedCourseId: selectedStudent.interestedCourseId ?? '',
      registeredCourseId: selectedStudent.registeredCourseId ?? '',
      assignedMentorId: selectedStudent.assignedMentorId ?? '',
      timeSlotId: selectedStudent.timeSlotId ?? '',
      totalAmount: selectedStudent.totalAmount ?? 699,
    });
    setIsEditing(true);
    setMessage(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setMessage(null);
  };

  const handleSaveChanges = async () => {
    if (!selectedStudentId) return;
    setIsSaving(true);
    setMessage(null);

    const hasEnrollment = enrollments.some((e) => e.student?.id === selectedStudentId);
    const isEnrolling = Boolean(form.registeredCourseId);
    const includeEnrollmentFields = hasEnrollment || isEnrolling;

    // Map form fields to UpdateStudentRequest
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      gender: form.gender || undefined,
      emergencyMobile: form.emergencyMobile || undefined,
      address: form.address || undefined,
      institutionName: form.institutionName || undefined,
      studentType: form.studentType || undefined,
      referralSource: form.referralSource || undefined,
      paymentType: includeEnrollmentFields ? (form.paymentType || undefined) : undefined,
      interestedCourseId: form.interestedCourseId || undefined,
      registeredCourseId: form.registeredCourseId || undefined,
      assignedMentorId: form.assignedMentorId || undefined,
      timeSlotId: form.timeSlotId || undefined,
      totalAmount: includeEnrollmentFields ? form.totalAmount : undefined,
    };

    try {
      const updated = await adminApi.updateStudent(selectedStudentId, payload);
      setSelectedStudent(updated);
      setStudents((prev) => prev.map((s) => (s.id === selectedStudentId ? updated : s)));
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
    students, mentors, courses, filteredStudents, selectedStudent, selectedStudentId, enrollments,
    isLoading, isSaving, message,
    view, isEditing,
    searchQuery, setSearchQuery, selectedFilterId, setSelectedFilterId,
    form, setFormField,
    openCreateView, closeCreateView, selectStudent,
    loadStudents, handleCreateStudent, handleDeleteStudent, handleDeleteEnrollment,
    handleStartEdit, handleCancelEdit, handleSaveChanges,
  };
}
