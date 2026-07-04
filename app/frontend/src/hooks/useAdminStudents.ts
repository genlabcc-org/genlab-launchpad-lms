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
import { fallbackStudents } from '../data/studentFallbacks';
import { fallbackMentors, fallbackCourses } from '../data/courseFallbacks';
import type { StudentDto, MentorDto, CourseDto, EnrollmentDto, PaymentDto } from '../api/types';
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

  const getFallbackEnrollments = (): EnrollmentDto[] => {
    // Mirrors the due-warning tiers in seed.sql (as of ~2026-07-04):
    //  Local Student  →  next_due 2026-06-30  →  OVERDUE   🔴🔴
    //  Bob Smith      →  no next due          →  no warn    ✅  (full payment)
    //  Alice Johnson  →  next_due 2026-07-20  →  no warn    ✅  (>10 days)
    //  Charlie Brown  →  next_due 2026-07-09  →  🟡 yellow  (≤10 days)
    //  Evan Wright    →  next_due 2026-07-06  →  🔴 urgent  (≤3 days)
    return fallbackStudents.map((s) => {
      const payments: PaymentDto[] = [];

      if (s.id === '00000000-0000-0000-0000-000000000003') {
        // Local Student — OVERDUE: next due was 2026-06-30 (past)
        payments.push({
          id: '01b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd1',
          enrollmentId: 'f1b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd1',
          amount: 200.00,
          paymentDate: '2026-06-20',
          nextDueDate: '2026-06-30',
          nextDueAmount: 499.00,
          paymentMethod: 'bank transfer',
          status: 'completed',
          transactionReference: 'TXN778899',
          notes: 'First installment received. Next due has now PASSED — overdue case.',
        });
      } else if (s.id === '3b3d31be-696a-49e4-b06d-76079c064e6a') {
        // Bob Smith — No warning: full payment, no next due
        payments.push({
          id: '02b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd2',
          enrollmentId: 'f2b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd2',
          amount: 699.00,
          paymentDate: '2026-07-01',
          paymentMethod: 'upi',
          status: 'completed',
          transactionReference: 'UPI112233',
          notes: 'Full course payment completed. No next due — no warning shown.',
        });
      } else if (s.id === 'd7feb61f-0381-42aa-81aa-692947b8711c') {
        // Alice Johnson — No warning: next due 2026-07-20 (>10 days away)
        payments.push({
          id: '03b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd3',
          enrollmentId: 'f3b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd3',
          amount: 200.00,
          paymentDate: '2026-07-01',
          nextDueDate: '2026-07-20',
          nextDueAmount: 499.00,
          paymentMethod: 'upi',
          status: 'completed',
          transactionReference: 'UPI112244',
          notes: 'First installment received. Next due in 16 days — no warning shown (>10d).',
        });
      } else if (s.id === 'b67cdcf9-bd87-4911-b3e9-a26de6bc6797') {
        // Charlie Brown — Yellow warning: next due 2026-07-09 (5 days away, ≤10d)
        payments.push({
          id: '04b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd4',
          enrollmentId: 'f4b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd4',
          amount: 600.00,
          paymentDate: '2026-07-01',
          nextDueDate: '2026-07-09',
          nextDueAmount: 299.00,
          paymentMethod: 'bank transfer',
          status: 'completed',
          transactionReference: 'TXN334455',
          notes: 'First installment received. Next due in 5 days — yellow warning (≤10d).',
        });
      } else if (s.id === '08d2d5a3-79a1-4a7b-9e41-99f78cfecaf7') {
        // Evan Wright — Urgent red warning: next due 2026-07-06 (2 days away, ≤3d)
        payments.push({
          id: '05b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd5',
          enrollmentId: 'f5b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd5',
          amount: 500.00,
          paymentDate: '2026-07-01',
          nextDueDate: '2026-07-06',
          nextDueAmount: 199.00,
          paymentMethod: 'upi',
          status: 'completed',
          transactionReference: 'UPI556677',
          notes: 'First installment received. Next due in 2 days — urgent red warning (≤3d).',
        });
      }

      return {
        id: `mock-enrollment-${s.id}`,
        student: s,
        status: 'active',
        paymentType: s.paymentType ?? '',
        totalAmount: s.totalAmount ?? 0,
        pendingAmount: s.pendingAmount ?? 0,
        payments,
        createdAt: s.createdAt ?? '',
      };
    });
  };

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const [fetchedStudents, fetchedMentors, fetchedCourses, fetchedEnrollments] = await Promise.all([
        adminApi.getAllStudents(),
        adminApi.getAllMentors(),
        adminApi.getAllCourses(),
        adminApi.getAllEnrollments(),
      ]);
      setStudents(fetchedStudents.length ? fetchedStudents : fallbackStudents);
      setMentors(fetchedMentors.length ? fetchedMentors : fallbackMentors);
      setCourses(fetchedCourses.length ? fetchedCourses : fallbackCourses);
      setEnrollments(fetchedEnrollments.length ? fetchedEnrollments : getFallbackEnrollments());
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
      paymentType: form.paymentType || undefined,
      interestedCourseId: form.interestedCourseId || undefined,
      registeredCourseId: form.registeredCourseId || undefined,
      assignedMentorId: form.assignedMentorId || undefined,
      timeSlotId: form.timeSlotId || undefined,
      totalAmount: form.totalAmount,
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
