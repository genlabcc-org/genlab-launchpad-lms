/**
 * StudentDetailView — View Layer
 *
 * Master-detail split for Students with tabbed section panels:
 *   OVERVIEW   — identity card + personal info accordion + contact details accordion
 *   ENROLLMENT — course, mentor, time slot, dates
 *   PAYMENT    — payment type, totals, pending balance
 *
 * Visual layout matches CourseDetailView, now with full inline editing capability.
 *
 * SOLID S: renders student details & edit form, no API calls.
 * DRY: uses DetailTabBar, SectionCard, StatRow, Accordion from shared primitives.
 */
import { useState } from 'react';
import {
  ArrowLeft, Plus, Search, User, MoreHorizontal, X, Save,
  Clock, Layers, Lock, AlertCircle, Trash2, BookOpen, Users, Calendar,
} from 'lucide-react';
import type { StudentDto, MentorDto, CourseDto, EnrollmentDto } from '../../../api/types';
import type { StudentFormState } from '../../../hooks/useAdminStudents';
import { DirectoryLayout } from '../shared/directory/DirectoryLayout';
import {
  StatusBanner, DetailTabBar, SectionCard, StatRow, Accordion,
} from '../shared/directory/shared';
import type { StatusMessage, TabDef } from '../shared/directory/shared';

// ─── Tab definitions ──────────────────────────────────────────────────────────

type StudentTab = 'overview' | 'enrollment' | 'payment';

const TABS: TabDef[] = [
  { id: 'overview',    label: 'Overview' },
  { id: 'enrollment',  label: 'Enrollment' },
  { id: 'payment',     label: 'Payment' },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  filteredStudents: StudentDto[];
  selectedStudentId: string | null;
  selectedStudent: StudentDto | null;
  mentors: MentorDto[];
  courses: CourseDto[];
  enrollments: EnrollmentDto[];
  form: StudentFormState;
  setFormField: <K extends keyof StudentFormState>(key: K, value: StudentFormState[K]) => void;
  message: StatusMessage;
  isLoading: boolean;
  isSaving: boolean;
  isEditing: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectStudent: (id: string | null) => void;
  onOpenCreate: () => void;
  onDeleteStudent: (id: string) => Promise<void>;
  onDeleteEnrollment?: (enrollmentId: string) => Promise<void>;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveChanges: () => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StudentDetailView({
  filteredStudents, selectedStudentId, selectedStudent, mentors, courses, enrollments,
  form, setFormField, message, isLoading, isSaving, isEditing,
  searchQuery, onSearchChange,
  onSelectStudent, onOpenCreate, onDeleteStudent, onDeleteEnrollment,
  onStartEdit, onCancelEdit, onSaveChanges,
}: Props) {
  const [activeTab, setActiveTab] = useState<StudentTab>('overview');
  const [aboutExpanded, setAboutExpanded] = useState(true);
  const [contactExpanded, setContactExpanded] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const mentor = mentors.find((m) => m.id === selectedStudent?.assignedMentorId);
  const course = courses.find((c) => c.id === selectedStudent?.registeredCourseId);
  const enrollment = enrollments.find((e) => e.student?.id === selectedStudent?.id);

  // ── Left sidebar ────────────────────────────────────────────────────────────
  const leftSidebar = (
    <div className="w-80 border-r border-border-subtle/60 flex flex-col shrink-0 bg-background/20 overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle/60 flex items-center justify-between gap-2 shrink-0 bg-background/30">
        <button
          onClick={() => onSelectStudent(null)}
          className="flex items-center gap-1.5 font-bold text-foreground text-xs hover:text-primary transition-colors focus:outline-none cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Students List</span>
        </button>
        <button
          onClick={onOpenCreate}
          className="bg-primary text-primary-foreground p-1.5 rounded-lg hover:bg-primary-hover shadow-xs transition-colors cursor-pointer"
          title="New Student"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3 border-b border-border-subtle/40 shrink-0 bg-background/10">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8.5 pr-3 py-1.5 text-[11px] bg-background border border-border-subtle rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-border-subtle/25">
        {filteredStudents.map((s) => {
          const isSelected = selectedStudentId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => { onSelectStudent(s.id ?? null); setActiveTab('overview'); }}
              className={`p-3.5 flex items-start gap-3 w-full hover:bg-primary/5 transition-all text-left cursor-pointer border-l-2 ${
                isSelected ? 'bg-primary/10 border-primary shadow-xs' : 'bg-transparent border-transparent'
              }`}
            >
              <div className="min-w-0 flex-1">
                <span className="text-primary font-semibold text-xs leading-snug truncate block">{s.name}</span>
                <span className="text-[10px] text-muted font-medium block mt-0.5 truncate">{s.email}</span>
                {(() => {
                  const dueDate = getStudentDueDate(s.id, enrollments);
                  const status = getDuesStatus(s.pendingAmount, dueDate);
                  if (!status.show) return null;
                  const textClass = status.priority === 'overdue' || status.priority === 'urgent' ? 'text-rose-500 font-bold' : 'text-amber-400 font-semibold';
                  return (
                    <span className={`text-[10px] ${textClass} block mt-0.5`}>
                      {status.sidebarText}
                    </span>
                  );
                })()}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── Right panel ─────────────────────────────────────────────────────────────
  const rightPanel = (
    <div className="flex-1 bg-background flex flex-col overflow-hidden">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-xs text-muted font-medium">
          Loading student details...
        </div>
      ) : !selectedStudent ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted gap-2 bg-background/10">
          <User className="w-10 h-10 text-border-subtle" />
          <span className="text-xs font-semibold">No Student Selected</span>
          <span className="text-[10px]">Click a student from the list to view their profile</span>
        </div>
      ) : isEditing ? (
        <InlineEditPanel
          selectedStudent={selectedStudent}
          mentors={mentors}
          courses={courses}
          enrollment={enrollment}
          form={form}
          setFormField={setFormField}
          isSaving={isSaving}
          message={message}
          onSaveChanges={onSaveChanges}
          onCancelEdit={onCancelEdit}
          onDeleteEnrollment={onDeleteEnrollment}
        />
      ) : (
        <>
          {/* ── Panel header ── */}
          <div className="px-5 py-3 border-b border-border-subtle/60 flex items-center justify-between gap-4 shrink-0 bg-background/30 relative z-20">
            <h3 className="text-sm font-bold text-foreground leading-tight truncate max-w-sm">
              {selectedStudent.name}
            </h3>
            <div className="flex items-center gap-1.5">
              <button
                onClick={onStartEdit}
                className="px-3 py-1.5 bg-background border border-border-subtle text-foreground rounded-lg hover:bg-foreground/10 text-[11px] font-bold cursor-pointer transition-colors focus:outline-none"
              >
                Edit
              </button>

              {/* More (delete) dropdown */}
              <div className="relative">
                <button
                  onClick={() => setMoreOpen((v) => !v)}
                  className="px-2.5 py-1.5 border border-border-subtle text-muted hover:text-foreground hover:bg-foreground/10 rounded-lg cursor-pointer focus:outline-none"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
                {moreOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
                    <div className="absolute right-0 mt-1.5 w-36 bg-card-bg border border-border-subtle rounded-xl shadow-xl z-50 overflow-hidden text-[10px] font-semibold text-foreground">
                      {!confirmDelete ? (
                        <button
                          onClick={() => setConfirmDelete(true)}
                          className="w-full text-left px-3.5 py-2.5 text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                        >
                          Delete Student
                        </button>
                      ) : (
                        <div className="flex flex-col gap-0.5 p-1.5">
                          <span className="text-muted px-2 py-1">Are you sure?</span>
                          <button
                            onClick={async () => { await onDeleteStudent(selectedStudent.id!); setMoreOpen(false); setConfirmDelete(false); }}
                            className="w-full text-left px-3.5 py-2.5 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer font-bold"
                          >
                            Yes, Delete
                          </button>
                          <button onClick={() => setConfirmDelete(false)} className="w-full text-left px-3.5 py-2.5 text-muted hover:bg-foreground/5 rounded-lg cursor-pointer">
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => onSelectStudent(null)}
                className="p-1.5 text-muted hover:text-foreground rounded-lg cursor-pointer"
                title="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Tab bar ── */}
          <DetailTabBar tabs={TABS} activeTab={activeTab} onSetTab={(id) => setActiveTab(id as StudentTab)} />

          {/* ── Status banner ── */}
          {message && (
            <div className="px-5 pt-4">
              <StatusBanner message={message} compact />
            </div>
          )}

          {/* ── Tab content ── */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'overview' && (
              <OverviewTab
                student={selectedStudent}
                enrollment={enrollment}
                aboutExpanded={aboutExpanded}
                contactExpanded={contactExpanded}
                onToggleAbout={() => setAboutExpanded((v) => !v)}
                onToggleContact={() => setContactExpanded((v) => !v)}
              />
            )}
            {activeTab === 'enrollment' && <EnrollmentTab student={selectedStudent} mentor={mentor} course={course} enrollment={enrollment} />}
            {activeTab === 'payment' && <PaymentTab student={selectedStudent} enrollment={enrollment} />}
          </div>
        </>
      )}
    </div>
  );

  return (
    <DirectoryLayout
      isDetailOpen={true}
      listSlot={null}
      detailSlot={
        <div className="flex-1 flex overflow-hidden bg-card-bg">
          {leftSidebar}
          {rightPanel}
        </div>
      }
    />
  );
}

// ─── Inline Edit Panel ────────────────────────────────────────────────────────

interface InlineEditPanelProps {
  selectedStudent: StudentDto;
  mentors: MentorDto[];
  courses: CourseDto[];
  enrollment?: EnrollmentDto;
  form: StudentFormState;
  setFormField: <K extends keyof StudentFormState>(key: K, value: StudentFormState[K]) => void;
  isSaving: boolean;
  message: StatusMessage;
  onSaveChanges: () => Promise<void>;
  onCancelEdit: () => void;
  onDeleteEnrollment?: (enrollmentId: string) => Promise<void>;
}

function InlineEditPanel({
  selectedStudent, mentors, courses, enrollment, form, setFormField, isSaving, message,
  onSaveChanges, onCancelEdit, onDeleteEnrollment,
}: InlineEditPanelProps) {
  const fieldClass = 'flex flex-col gap-1.5';
  const labelClass = 'text-[11px] font-bold uppercase tracking-wider text-muted';
  const inputClass = 'px-3 py-2.5 text-xs bg-background border border-border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all';
  const selectClass = `${inputClass} cursor-pointer`;

  const isEnrolled = Boolean(enrollment?.id);
  const enrolledCourse = courses.find((c) => c.id === selectedStudent.registeredCourseId);
  const assignedMentor = mentors.find((m) => m.id === selectedStudent.assignedMentorId);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle/80 flex items-center justify-between gap-3 shrink-0 bg-background/25">
        <div>
          <h3 className="text-sm font-bold text-foreground">Edit Student Profile</h3>
          <p className="text-[10px] text-muted">Modify layout and configurations for {selectedStudent.name}.</p>
        </div>
        <button onClick={onCancelEdit} className="p-1.5 rounded-xl hover:bg-border-subtle/40 text-muted hover:text-foreground cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Fields */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <StatusBanner message={message} compact />

        {/* Course & Program Selection */}
        <Section title="Course & Program Selection">
          <div className="grid grid-cols-1 gap-4">
            <div className={fieldClass}>
              <label className={labelClass}>Interested Course</label>
              {isEnrolled ? (
                <div className="p-3.5 rounded-xl bg-background/50 border border-border-subtle/50 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">Enrolled in Course</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                      Active Enrollment
                    </span>
                  </div>
                  <p className="text-[10px] text-muted leading-relaxed">
                    Interested course is cleared once a student is enrolled in a course. To modify course interest, remove the active course enrollment below.
                  </p>
                </div>
              ) : (
                <select value={form.interestedCourseId} onChange={(e) => setFormField('interestedCourseId', e.target.value)} className={selectClass}>
                  <option value="">No Interested Course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </Section>

        {/* Personal Details */}
        <Section title="Personal Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={fieldClass}>
              <label className={labelClass}>Full Name <span className="text-rose-500 font-bold ml-0.5">*</span></label>
              <input required type="text" value={form.name} onChange={(e) => setFormField('name', e.target.value)} className={inputClass} />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Email <span className="text-rose-500 font-bold ml-0.5">*</span></label>
              <input required type="email" value={form.email} onChange={(e) => setFormField('email', e.target.value)} className={inputClass} />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Phone <span className="text-rose-500 font-bold ml-0.5">*</span></label>
              <input required type="tel" value={form.phone} onChange={(e) => setFormField('phone', e.target.value)} className={inputClass} />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Emergency Contact</label>
              <input type="tel" value={form.emergencyMobile} onChange={(e) => setFormField('emergencyMobile', e.target.value)} className={inputClass} />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Gender</label>
              <select value={form.gender} onChange={(e) => setFormField('gender', e.target.value as StudentFormState['gender'])} className={selectClass}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
              </select>
            </div>
            <div className={`${fieldClass} sm:col-span-2`}>
              <label className={labelClass}>Address</label>
              <input type="text" value={form.address} onChange={(e) => setFormField('address', e.target.value)} className={inputClass} />
            </div>
          </div>
        </Section>

        {/* Academic / Professional */}
        <Section title="Academic & Professional">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={fieldClass}>
              <label className={labelClass}>Institution / Company</label>
              <input type="text" value={form.institutionName} onChange={(e) => setFormField('institutionName', e.target.value)} className={inputClass} />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Student Type</label>
              <select value={form.studentType} onChange={(e) => setFormField('studentType', e.target.value as StudentFormState['studentType'])} className={selectClass}>
                <option value="">Select type</option>
                <option value="student">Student</option>
                <option value="fresher">Fresher</option>
                <option value="professional">Professional</option>
              </select>
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Referral Source</label>
              <select value={form.referralSource} onChange={(e) => setFormField('referralSource', e.target.value)} className={selectClass}>
                <option value="">Select source</option>
                <option value="college">College</option>
                <option value="school">School</option>
                <option value="direct">Direct</option>
                <option value="existing student">Existing Student</option>
                <option value="social media">Social Media</option>
              </select>
            </div>
          </div>
        </Section>

        {/* Course Assignment Details */}
        <Section title="Course & Mentor Assignment">
          {isEnrolled ? (
            <div className="p-4 rounded-2xl bg-background/40 border border-border-subtle/60 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">Enrolled Course</span>
                  <span className="text-sm font-bold text-foreground block mt-0.5">{enrolledCourse?.title ?? 'Active Course'}</span>
                </div>
                <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> Active Cohort
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-border-subtle/30">
                <div>
                  <span className="text-muted block text-[10px] uppercase font-bold">Assigned Mentor</span>
                  <span className="font-bold text-foreground block">{assignedMentor?.name ?? 'No Mentor Assigned'}</span>
                </div>
                <div>
                  <span className="text-muted block text-[10px] uppercase font-bold">Intake Batch</span>
                  <span className="font-mono text-foreground block">{enrollment?.batchId ?? 'Default Batch'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border-subtle/30 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[10px] text-muted max-w-md">
                  Direct editing of course assignment is disabled. Remove this enrollment to return the student to unassigned status and select a new course/slot in Operations &gt; Scheduling.
                </p>
                {enrollment?.id && (
                  <button
                    type="button"
                    onClick={() => {
                      if (enrollment?.id && confirm('Are you sure you want to remove this student\'s course enrollment? They will return to unassigned status.')) {
                        onDeleteEnrollment?.(enrollment.id);
                      }
                    }}
                    className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold text-[11px] rounded-xl transition cursor-pointer shrink-0 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Enrollment
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-background/40 border border-border-subtle/60 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-muted">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold text-foreground">No Active Course Enrollment</span>
              </div>
              <p className="text-[11px] text-muted leading-relaxed">
                Direct course assignment is disabled from student profile. Select an <strong>Interested Course</strong> at the top, then assign a mentor &amp; time slot via <strong>Operations &gt; Scheduling</strong>.
              </p>
            </div>
          )}
        </Section>

        {/* Payment */}
        <Section title="Payment & Settings">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={fieldClass}>
              <label className={labelClass}>Payment Type</label>
              <select value={form.paymentType} onChange={(e) => setFormField('paymentType', e.target.value as StudentFormState['paymentType'])} className={selectClass}>
                <option value="">Select type</option>
                <option value="full payment">Full Payment</option>
                <option value="monthly">Monthly</option>
                <option value="partial">Partial</option>
              </select>
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Total Amount (₹)</label>
              <input type="number" min="0" step="0.01" value={form.totalAmount} onChange={(e) => setFormField('totalAmount', Number(e.target.value))} className={inputClass} />
            </div>
          </div>

        </Section>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-t border-border-subtle/80 bg-background/25 flex justify-end items-center gap-3 shrink-0">
        <button
          onClick={onSaveChanges}
          disabled={isSaving}
          className="flex items-center gap-1 px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary-hover shadow-xs text-xs cursor-pointer disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        <button onClick={onCancelEdit} className="px-5 py-2 bg-slate-800/10 border border-border-subtle rounded-xl text-foreground hover:bg-slate-800/20 text-xs cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border-subtle/60 rounded-2xl overflow-hidden bg-background/10">
      <div className="px-4 py-2.5 border-b border-border-subtle/30 bg-background/20">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted">{title}</h3>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  student, enrollment, aboutExpanded, contactExpanded, onToggleAbout, onToggleContact,
}: {
  student: StudentDto;
  enrollment?: EnrollmentDto;
  aboutExpanded: boolean;
  contactExpanded: boolean;
  onToggleAbout: () => void;
  onToggleContact: () => void;
}) {
  const hasPending = (student.pendingAmount ?? 0) > 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 p-6">
      {/* Left column */}
      <div className="xl:col-span-2 flex flex-col gap-4">
        {/* Identity card */}
        <div className="p-4 bg-card-bg border border-border-subtle rounded-2xl flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-foreground text-xs leading-snug truncate">{student.name}</h4>
            <span className="text-[10px] text-muted font-semibold mt-0.5 block truncate">{student.email}</span>
            <div className="flex items-center gap-1.5 mt-1">
              <TypeBadge label={student.studentType} />
              {(() => {
                const dueDate = getStudentDueDate(student.id, enrollment ? [enrollment] : []);
                const status = getDuesStatus(student.pendingAmount, dueDate);
                if (!status.show) return null;
                return (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${status.badgeClass}`}>
                    {status.sidebarText}
                  </span>
                );
              })()}
            </div>
          </div>
        </div>

        {/* About accordion */}
        <Accordion label="Personal Info" isExpanded={aboutExpanded} onToggle={onToggleAbout}>
          <div className="p-4 flex flex-col gap-0">
            <StatRow label="Gender" value={student.gender ?? '—'} />
            <StatRow label="Institution" value={student.institutionName ?? '—'} />
            <StatRow label="Student Type" value={student.studentType ?? '—'} />
            <StatRow label="Referral Source" value={student.referralSource ?? '—'} />

          </div>
        </Accordion>

        {/* Contact accordion */}
        <Accordion label="Contact Details" isExpanded={contactExpanded} onToggle={onToggleContact}>
          <div className="p-4 flex flex-col gap-0">
            <StatRow label="Phone" value={student.phone ?? '—'} />
            <StatRow label="Emergency Contact" value={student.emergencyMobile ?? '—'} />
            <StatRow label="Address" value={student.address ?? '—'} />
          </div>
        </Accordion>
      </div>

      {/* Right column */}
      <div className="xl:col-span-3 flex flex-col gap-4">
        <SectionCard title="Student Activity" subtitle="Enrollment and payment status at a glance">
          <div className="divide-y divide-border-subtle/20">
            <StatRow label="Interested Course" value={student.interestedCourseId ? 'Selected' : <span className="italic text-muted/60">None / Enrolled</span>} />
            <StatRow label="Assigned Course" value={enrollment?.id ? 'Assigned' : <span className="italic text-muted/60">Pending</span>} />
            <StatRow label="Assigned Mentor" value={student.assignedMentorId ? 'Assigned' : <span className="italic text-muted/60">Pending</span>} />
            <StatRow label="Payment Type" value={student.paymentType ?? '—'} />
            <StatRow
              label="Payment Status"
              value={
                hasPending
                  ? <span className="text-amber-400 font-bold">₹{student.pendingAmount?.toFixed(2)} pending</span>
                  : <span className="text-emerald-400 font-bold">Fully paid</span>
              }
            />
          </div>
        </SectionCard>

        <SectionCard title="Registration Info" subtitle="System metadata">
          <div className="divide-y divide-border-subtle/20">
            <StatRow label="Student ID" value={<span className="font-mono text-[10px]">{student.id}</span>} />
            <StatRow label="Registered On" value={student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '—'} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ─── Enrollment Tab ───────────────────────────────────────────────────────────

function EnrollmentTab({
  student,
  mentor,
  course,
  enrollment,
}: {
  student: StudentDto;
  mentor?: MentorDto;
  course?: CourseDto;
  enrollment?: EnrollmentDto;
}) {
  const schedule = enrollment?.mentorSchedule;
  const slot = schedule?.slot;

  const formatTimeObj = (t: any) => {
    if (!t) return '';
    if (typeof t === 'string') return t.substring(0, 5);
    const h = String(t.hour ?? 0).padStart(2, '0');
    const m = String(t.minute ?? 0).padStart(2, '0');
    return `${h}:${m}`;
  };

  const slotTimeString = slot?.startTime && slot?.endTime 
    ? `${formatTimeObj(slot.startTime)} - ${formatTimeObj(slot.endTime)}`
    : (student.timeSlotId ? 'Assigned Slot' : 'No Slot Assigned');

  const daysOfWeek = (slot as any)?.daysOfWeek ? (slot as any).daysOfWeek.join(', ') : 'Monday to Friday';

  const isActiveEnrollment = Boolean(enrollment?.id);

  return (
    <div className="p-6 space-y-6">
      {/* ── VISUAL READ-ONLY SLOT & SCHEDULE CARD ── */}
      {isActiveEnrollment ? (
        <div className="p-5 bg-card-bg border border-border-subtle/80 rounded-3xl space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle/40 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">Registered Class Schedule & Slot</h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Read-Only Schedule
                  </span>
                </div>
                <p className="text-[10px] text-muted">Class timings, mentor assignment, and cohort schedule details</p>
              </div>
            </div>

            {enrollment?.batchId && (
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5 font-mono">
                <Layers className="w-3.5 h-3.5" />
                {enrollment.batchId}
              </span>
            )}
          </div>

          {/* Schedule Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-background/50 border border-border-subtle/50 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                <Clock className="w-3 h-3 text-primary" /> Class Timing Slot
              </span>
              <span className="font-bold text-foreground block text-sm">{slotTimeString}</span>
              <span className="text-[10px] text-muted block">{daysOfWeek}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-background/50 border border-border-subtle/50 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-emerald-400" /> Enrolled Course
              </span>
              <span className="font-bold text-foreground block truncate">{course?.title ?? '—'}</span>
              <span className="text-[10px] font-mono text-muted block">{student.registeredCourseId ? `ID: ${student.registeredCourseId.substring(0, 8)}...` : '—'}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-background/50 border border-border-subtle/50 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                <Users className="w-3 h-3 text-violet-400" /> Assigned Mentor
              </span>
              <span className="font-bold text-foreground block truncate">{mentor?.name ?? '—'}</span>
              <span className="text-[10px] text-muted block truncate">{mentor?.email ?? '—'}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-border-subtle/30 flex items-center justify-between text-[10px] text-muted">
            <span>Schedule updates are managed through Operations &gt; Scheduling.</span>
            <span className="font-mono text-emerald-400 font-semibold">Active Enrollment</span>
          </div>
        </div>
      ) : (
        <div className="p-5 bg-card-bg border border-border-subtle/60 rounded-3xl space-y-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">No Active Course Enrollment</h3>
              <p className="text-[10px] text-muted">This student has not been assigned to a mentor schedule or time slot yet.</p>
            </div>
          </div>
          <p className="text-[11px] text-muted leading-relaxed border-t border-border-subtle/30 pt-3">
            To enroll this student, assign them a mentor &amp; time slot via <strong className="text-foreground">Operations &gt; Scheduling</strong>. Once enrolled, their class schedule, mentor, and cohort details will appear here.
          </p>
        </div>
      )}

      {/* Structured Details Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <SectionCard title="Course Assignment">
          <div className="divide-y divide-border-subtle/20">
            <StatRow label="Assigned Course" value={course?.title ?? <span className="italic text-muted/60">No Course Assigned</span>} />
            <StatRow label="Course ID" value={<span className="font-mono text-[10px]">{student.registeredCourseId ?? '—'}</span>} />
            <StatRow label="Time Slot ID" value={<span className="font-mono text-[10px]">{student.timeSlotId ?? '—'}</span>} />
          </div>
        </SectionCard>

        <SectionCard title="Mentor Assignment">
          {mentor ? (
            <div className="divide-y divide-border-subtle/20">
              <StatRow label="Mentor Name" value={mentor.name ?? '—'} />
              <StatRow label="Mentor Email" value={mentor.email ?? '—'} />
              <StatRow label="Mentor ID" value={<span className="font-mono text-[10px]">{mentor.id}</span>} />
            </div>
          ) : (
            <p className="text-xs text-muted italic">No mentor assigned yet.</p>
          )}
        </SectionCard>

        <SectionCard title="Student Profile">
          <div className="divide-y divide-border-subtle/20">
            <StatRow label="Institution" value={student.institutionName ?? '—'} />
            <StatRow label="Student Type" value={student.studentType ?? '—'} />
            <StatRow label="Referral Source" value={student.referralSource ?? '—'} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ─── Payment Tab ──────────────────────────────────────────────────────────────

function PaymentTab({ student, enrollment }: { student: StudentDto; enrollment?: EnrollmentDto }) {
  const hasPending = (student.pendingAmount ?? 0) > 0;
  const paidAmount = (student.totalAmount ?? 0) - (student.pendingAmount ?? 0);
  const payments = enrollment?.payments ?? [];

  // Find the latest completed payment with next due info
  const nextPayment = payments
    .filter((p) => p.nextDueDate && p.nextDueAmount && p.status === 'completed')
    .sort((a, b) => new Date(b.paymentDate ?? '').getTime() - new Date(a.paymentDate ?? '').getTime())[0];

  return (
    <div className="p-6 flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        <SectionCard title="Payment Summary">
          <div className="divide-y divide-border-subtle/20">
            <StatRow label="Payment Type" value={
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${hasPending ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {student.paymentType ?? '—'}
              </span>
            } />
            <StatRow label="Total Amount" value={<span className="font-mono font-bold text-foreground">₹{student.totalAmount?.toFixed(2) ?? '0.00'}</span>} />
            <StatRow label="Amount Paid" value={<span className="font-mono text-emerald-400 font-bold">₹{paidAmount.toFixed(2)}</span>} />
            <StatRow label="Pending Amount" value={
              hasPending
                ? <span className="font-mono text-amber-400 font-bold">₹{student.pendingAmount?.toFixed(2)}</span>
                : <span className="font-mono text-emerald-400 font-bold">₹0.00</span>
            } />
            {hasPending && nextPayment?.nextDueAmount && (
              <StatRow label="Next Installment" value={<span className="font-mono font-bold text-amber-400">₹{nextPayment.nextDueAmount.toFixed(2)}</span>} />
            )}
            {hasPending && nextPayment?.nextDueDate && (
              <StatRow label="Installment Deadline" value={
                <span className="text-amber-400 font-semibold">
                  {new Date(nextPayment.nextDueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              } />
            )}
            <StatRow
              label="Balance Status"
              value={(() => {
                const dueDate = nextPayment?.nextDueDate;
                const status = getDuesStatus(student.pendingAmount, dueDate);
                if (status.show) {
                  return (
                    <span className={`flex items-center gap-1.5 font-bold ${status.priority === 'overdue' || status.priority === 'urgent' ? 'text-rose-500' : 'text-amber-400'}`}>
                      <span className={`w-2 h-2 rounded-full ${status.dotClass || 'bg-amber-400'}`} />
                      {status.text}
                    </span>
                  );
                }
                return (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {status.text}
                  </span>
                );
              })()}
            />
          </div>
        </SectionCard>

        <SectionCard title="Verification">
          <div className="divide-y divide-border-subtle/20">
            <StatRow label="Address Proof" value={student.addressProofKey ? <span className="text-emerald-400 font-bold">✓ Uploaded</span> : <span className="text-muted italic">Not provided</span>} />
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Payment Transaction History" subtitle="List of recorded payment transactions">
        {payments.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted italic">
            No transactions found for this student.
          </div>
        ) : (
          <div className="overflow-x-auto border border-border-subtle/40 rounded-xl bg-background/5">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-subtle/40 bg-background/30 text-[9px] uppercase font-bold text-muted tracking-wider">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Next Due</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Txn Reference</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/20">
                {payments.map((p) => {
                  const pDate = p.paymentDate
                    ? new Date(p.paymentDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                    : '—';
                  const nextDueStr = p.nextDueAmount && p.nextDueDate
                    ? `₹${p.nextDueAmount.toFixed(2)} on ${new Date(p.nextDueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`
                    : '—';
                  return (
                    <tr key={p.id} className="hover:bg-foreground/5 transition-colors">
                      <td className="py-3 px-3 font-semibold text-foreground">{pDate}</td>
                      <td className="py-3 px-3 font-mono font-bold text-foreground">₹{p.amount?.toFixed(2) ?? '0.00'}</td>
                      <td className="py-3 px-3 font-semibold text-amber-400/90 text-[11px]">{nextDueStr}</td>
                      <td className="py-3 px-3 capitalize">
                        <span className="bg-foreground/5 px-2 py-0.5 rounded-md border border-border-subtle/25 font-semibold text-muted text-[10px]">
                          {p.paymentMethod ?? '—'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[10px] text-muted">{p.transactionReference ?? '—'}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold capitalize ${
                          p.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                          p.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-rose-500/10 text-rose-400'
                        }`}>
                          {p.status ?? '—'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-muted/80 text-[11px]" title={p.notes ?? ''}>{p.notes ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ─── Badge helper ─────────────────────────────────────────────────────────────

function TypeBadge({ label }: { label?: string }) {
  if (!label) return null;
  const colours: Record<string, string> = {
    student: 'bg-blue-500/10 text-blue-400',
    fresher: 'bg-emerald-500/10 text-emerald-400',
    professional: 'bg-violet-500/10 text-violet-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${colours[label] ?? 'bg-muted/10 text-muted'}`}>
      {label}
    </span>
  );
}

export interface DuesStatusResult {
  show: boolean;
  priority?: 'warning' | 'urgent' | 'overdue';
  colorClass: string;
  dotClass?: string;
  text: string;
  sidebarText: string;
  badgeClass: string;
}

export function getDuesStatus(pendingAmount: number | undefined, dueDateStr: string | undefined): DuesStatusResult {
  if (!pendingAmount || pendingAmount <= 0) {
    return { show: false, text: 'Fully cleared', sidebarText: '', colorClass: '', badgeClass: '' };
  }
  if (!dueDateStr) {
    return { show: false, text: 'Dues pending', sidebarText: '', colorClass: '', badgeClass: '' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      show: true,
      priority: 'overdue',
      colorClass: 'text-rose-500 bg-rose-500/10 border border-rose-500/30 animate-pulse font-extrabold uppercase tracking-wider',
      dotClass: 'bg-rose-500 animate-pulse',
      text: 'OVERDUE',
      sidebarText: `₹${pendingAmount.toFixed(0)} OVERDUE`,
      badgeClass: 'bg-rose-500/10 text-rose-500 border border-rose-500/30 animate-pulse font-bold'
    };
  } else if (diffDays <= 3) {
    return {
      show: true,
      priority: 'urgent',
      colorClass: 'text-rose-500 bg-rose-500/10 border border-rose-500/20 font-bold',
      dotClass: 'bg-rose-500',
      text: 'Due soon (Urgent)',
      sidebarText: `₹${pendingAmount.toFixed(0)} due`,
      badgeClass: 'bg-rose-500/10 text-rose-500 font-bold'
    };
  } else if (diffDays <= 10) {
    return {
      show: true,
      priority: 'warning',
      colorClass: 'text-amber-400 bg-amber-500/10 border border-amber-500/20 font-semibold',
      dotClass: 'bg-amber-400',
      text: 'Dues pending',
      sidebarText: `₹${pendingAmount.toFixed(0)} due`,
      badgeClass: 'bg-amber-500/10 text-amber-400 font-semibold'
    };
  }

  return { show: false, text: 'Dues pending', sidebarText: '', colorClass: '', badgeClass: '' };
}

export function getStudentDueDate(studentId: string | undefined, enrollments: EnrollmentDto[]): string | undefined {
  if (!studentId || !enrollments) return undefined;
  const enrollment = enrollments.find((e) => e.student?.id === studentId);
  const payments = enrollment?.payments ?? [];
  const nextPayment = payments
    .filter((p) => p.nextDueDate && p.nextDueAmount && p.status === 'completed')
    .sort((a, b) => new Date(b.paymentDate ?? '').getTime() - new Date(a.paymentDate ?? '').getTime())[0];
  return nextPayment?.nextDueDate;
}
