/**
 * MentorDetailView — View Layer
 *
 * Master-detail split for Mentors with tabbed section panels:
 *   PROFILE  — identity card + profile details accordion
 *   COURSES  — courses this mentor is assigned to
 *   ACCOUNT  — system metadata, IDs
 *
 * Visual layout matches CourseDetailView & StudentDetailView, with inline editing capability.
 *
 * SOLID S: pure view — renders details and editing, no API.
 * DRY: uses DetailTabBar, SectionCard, StatRow, Accordion from shared primitives.
 */
import { useState } from 'react';
import { ArrowLeft, Plus, Search, User, MoreHorizontal, X, BookOpen, Save, Clock, Calendar, Users } from 'lucide-react';
import type { MentorDto, MentorScheduleDto, CourseDto } from '../../../api/types';
import type { MentorFormState } from '../../../hooks/useAdminMentors';
import { DirectoryLayout } from '../shared/directory/DirectoryLayout';
import {
  StatusBanner, DetailTabBar, SectionCard, StatRow, Accordion,
} from '../shared/directory/shared';
import type { StatusMessage, TabDef } from '../shared/directory/shared';

// ─── Tab definitions ──────────────────────────────────────────────────────────

type MentorTab = 'profile' | 'courses' | 'account';

const TABS: TabDef[] = [
  { id: 'profile',  label: 'Profile' },
  { id: 'courses',  label: 'Assigned Courses' },
  { id: 'account',  label: 'Account' },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  filteredMentors: MentorDto[];
  selectedMentorId: string | null;
  selectedMentor: MentorDto | null;
  schedules: MentorScheduleDto[];
  isLoadingSchedules: boolean;
  courses: CourseDto[];
  form: MentorFormState;
  setFormField: <K extends keyof MentorFormState>(key: K, value: MentorFormState[K]) => void;
  message: StatusMessage;
  isLoading: boolean;
  isSaving: boolean;
  isEditing: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectMentor: (id: string | null) => void;
  onOpenCreate: () => void;
  onDeleteMentor: (id: string) => Promise<void>;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveChanges: () => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MentorDetailView({
  filteredMentors, selectedMentorId, selectedMentor,
  schedules, isLoadingSchedules, courses,
  form, setFormField, message, isLoading, isSaving, isEditing,
  searchQuery, onSearchChange,
  onSelectMentor, onOpenCreate, onDeleteMentor,
  onStartEdit, onCancelEdit, onSaveChanges,
}: Props) {
  const [activeTab, setActiveTab] = useState<MentorTab>('profile');
  const [profileExpanded, setProfileExpanded] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // ── Left sidebar ────────────────────────────────────────────────────────────
  const leftSidebar = (
    <div className="w-80 border-r border-border-subtle/60 flex flex-col shrink-0 bg-background/20 overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle/60 flex items-center justify-between gap-2 shrink-0 bg-background/30">
        <button
          onClick={() => onSelectMentor(null)}
          className="flex items-center gap-1.5 font-bold text-foreground text-xs hover:text-primary transition-colors focus:outline-none cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Mentors List</span>
        </button>
        <button
          onClick={onOpenCreate}
          className="bg-primary text-primary-foreground p-1.5 rounded-lg hover:bg-primary-hover shadow-xs transition-colors cursor-pointer"
          title="Add New Mentor"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3 border-b border-border-subtle/40 shrink-0 bg-background/10">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search mentors..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8.5 pr-3 py-1.5 text-[11px] bg-background border border-border-subtle rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-border-subtle/25">
        {filteredMentors.map((m) => {
          const isSelected = selectedMentorId === m.id;
          return (
            <button
              key={m.id}
              onClick={() => { onSelectMentor(m.id ?? null); setActiveTab('profile'); }}
              className={`p-3.5 flex items-start gap-3 w-full hover:bg-primary/5 transition-all text-left cursor-pointer border-l-2 ${
                isSelected ? 'bg-primary/10 border-primary shadow-xs' : 'bg-transparent border-transparent'
              }`}
            >
              <div className="min-w-0 flex-1">
                <span className="text-primary font-semibold text-xs leading-snug truncate block">{m.name}</span>
                <span className="text-[10px] text-muted font-medium block mt-0.5 truncate">{m.email}</span>
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
          Loading mentor details...
        </div>
      ) : !selectedMentor ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted gap-2 bg-background/10">
          <User className="w-10 h-10 text-border-subtle" />
          <span className="text-xs font-semibold">No Mentor Selected</span>
          <span className="text-[10px]">Click a mentor from the list to view their profile</span>
        </div>
      ) : isEditing ? (
        <InlineEditPanel
          selectedMentor={selectedMentor}
          form={form}
          setFormField={setFormField}
          isSaving={isSaving}
          message={message}
          onSaveChanges={onSaveChanges}
          onCancelEdit={onCancelEdit}
        />
      ) : (
        <>
          {/* ── Panel header ── */}
          <div className="px-5 py-3 border-b border-border-subtle/60 flex items-center justify-between gap-4 shrink-0 bg-background/30 relative z-20">
            <h3 className="text-sm font-bold text-foreground leading-tight truncate max-w-sm">
              {selectedMentor.name}
            </h3>
            <div className="flex items-center gap-1.5">
              <button
                onClick={onStartEdit}
                className="px-3 py-1.5 bg-background border border-border-subtle text-foreground rounded-lg hover:bg-foreground/10 text-[11px] font-bold cursor-pointer transition-colors focus:outline-none"
              >
                Edit
              </button>

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
                          Delete Mentor
                        </button>
                      ) : (
                        <div className="flex flex-col gap-0.5 p-1.5">
                          <span className="text-muted px-2 py-1">Are you sure?</span>
                          <button
                            onClick={async () => { await onDeleteMentor(selectedMentor.id!); setMoreOpen(false); setConfirmDelete(false); }}
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
                onClick={() => onSelectMentor(null)}
                className="p-1.5 text-muted hover:text-foreground rounded-lg cursor-pointer"
                title="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Tab bar ── */}
          <DetailTabBar tabs={TABS} activeTab={activeTab} onSetTab={(id) => setActiveTab(id as MentorTab)} />

          {/* ── Status banner ── */}
          {message && (
            <div className="px-5 pt-4">
              <StatusBanner message={message} compact />
            </div>
          )}

          {/* ── Tab content ── */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'profile' && (
              <ProfileTab
                mentor={selectedMentor}
                schedules={schedules}
                isLoadingSchedules={isLoadingSchedules}
                profileExpanded={profileExpanded}
                onToggleProfile={() => setProfileExpanded((v) => !v)}
              />
            )}
            {activeTab === 'courses' && <CoursesTab mentor={selectedMentor} courses={courses} />}
            {activeTab === 'account' && <AccountTab mentor={selectedMentor} />}
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
  selectedMentor: MentorDto;
  form: MentorFormState;
  setFormField: <K extends keyof MentorFormState>(key: K, value: MentorFormState[K]) => void;
  isSaving: boolean;
  message: StatusMessage;
  onSaveChanges: () => Promise<void>;
  onCancelEdit: () => void;
}

function InlineEditPanel({
  selectedMentor, form, setFormField, isSaving, message,
  onSaveChanges, onCancelEdit,
}: InlineEditPanelProps) {
  const fieldClass = 'flex flex-col gap-1.5';
  const labelClass = 'text-[11px] font-bold uppercase tracking-wider text-muted';
  const inputClass = 'px-3 py-2.5 text-xs bg-background border border-border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all';

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle/80 flex items-center justify-between gap-3 shrink-0 bg-background/25">
        <div>
          <h3 className="text-sm font-bold text-foreground">Edit Mentor Profile</h3>
          <p className="text-[10px] text-muted">Modify layout and configurations for {selectedMentor.name}.</p>
        </div>
        <button onClick={onCancelEdit} className="p-1.5 rounded-xl hover:bg-border-subtle/40 text-muted hover:text-foreground cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Fields */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <StatusBanner message={message} compact />

        <Section title="Mentor Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={fieldClass}>
              <label className={labelClass}>Full Name *</label>
              <input required type="text" value={form.name} onChange={(e) => setFormField('name', e.target.value)} className={inputClass} />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Email *</label>
              <input required type="email" value={form.email} onChange={(e) => setFormField('email', e.target.value)} className={inputClass} />
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

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab({
  mentor, schedules, isLoadingSchedules, profileExpanded, onToggleProfile,
}: {
  mentor: MentorDto;
  schedules: MentorScheduleDto[];
  isLoadingSchedules: boolean;
  profileExpanded: boolean;
  onToggleProfile: () => void;
}) {
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
            <h4 className="font-bold text-foreground text-xs leading-snug truncate">{mentor.name}</h4>
            <span className="text-[10px] text-muted font-semibold mt-0.5 block truncate">{mentor.email}</span>
          </div>
        </div>

        {/* Profile accordion */}
        <Accordion label="Mentor Details" isExpanded={profileExpanded} onToggle={onToggleProfile}>
          <div className="p-4 flex flex-col gap-0">
            <StatRow label="Full Name" value={mentor.name ?? '—'} />
            <StatRow label="Email" value={mentor.email ?? '—'} />
            <StatRow label="Role" value="Mentor" />
          </div>
        </Accordion>
      </div>

      {/* Right column */}
      <div className="xl:col-span-3 flex flex-col gap-4">
        <SectionCard title="Active Schedule / Slots" subtitle="Assigned classes and timings">
          {isLoadingSchedules ? (
            <div className="text-[10px] text-muted p-4">Loading schedule...</div>
          ) : schedules.length === 0 ? (
            <div className="text-[10px] text-muted italic p-4 text-center">
              No active schedules assigned.
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border-subtle/20">
              {schedules.map((sch) => {
                const formatTimeObj = (t: any) => {
                  if (!t) return '';
                  if (typeof t === 'string') return t.substring(0, 5);
                  const h = String(t.hour ?? 0).padStart(2, '0');
                  const m = String(t.minute ?? 0).padStart(2, '0');
                  return `${h}:${m}`;
                };
                const slotTime = `${formatTimeObj(sch.slot?.startTime)} - ${formatTimeObj(sch.slot?.endTime)}`;
                
                return (
                  <div key={sch.id} className="py-3 px-1 flex flex-col gap-1.5 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-foreground">
                        {sch.course?.title}
                      </span>
                      {sch.batchId && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 text-primary uppercase shrink-0">
                          {sch.batchId}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted font-semibold mt-1">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-muted/75" />
                        <span>{slotTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-muted/75" />
                        <span>{sch.startDate} to {sch.endDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-muted/75" />
                        <span className="text-foreground">{sch.students?.length ?? 0} Enrolled</span>
                      </div>
                    </div>

                    {sch.students && sch.students.length > 0 && (
                      <div className="mt-2 pl-3 border-l-2 border-border-subtle/40 flex flex-col gap-1">
                        <span className="text-[9px] uppercase font-bold text-muted/65 tracking-wider">Students:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {sch.students.map((student) => (
                            <span key={student.id} className="text-[10px] font-medium text-foreground bg-foreground/5 px-2 py-0.5 rounded-lg border border-border-subtle/30" title={student.email}>
                              {student.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

// ─── Courses Tab ──────────────────────────────────────────────────────────────

function CoursesTab({ mentor, courses }: { mentor: MentorDto; courses: CourseDto[] }) {
  const assignedCourses = courses.filter((c) =>
    c.mentors?.some((m) => m.id === mentor.id)
  );

  return (
    <div className="p-6 flex flex-col gap-5 max-w-2xl">
      <SectionCard
        title="Assigned Courses"
        subtitle="Courses this mentor is associated with"
      >
        {assignedCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
            <BookOpen className="w-8 h-8 text-border-subtle" />
            <p className="text-xs text-muted font-semibold">
              No courses assigned to this mentor yet.
            </p>
            <p className="text-[10px] text-muted/70 max-w-xs">
              To assign a course, open a course in the <strong>Courses Catalog</strong> and assign {mentor.name} as a mentor.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle/20">
            {assignedCourses.map((c) => (
              <div key={c.id} className="py-3.5 flex flex-col gap-1 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-foreground">{c.title}</span>
                  <div className="flex items-center gap-2">
                    {c.durationInDays && (
                      <span className="text-[10px] font-semibold text-muted bg-foreground/5 px-2 py-0.5 rounded-md border border-border-subtle/30">
                        {c.durationInDays} Days
                      </span>
                    )}
                    <span className="font-mono text-[10px] font-bold text-primary">
                      ₹{c.price?.toFixed(2) ?? '0.00'}
                    </span>
                  </div>
                </div>
                {c.description && (
                  <p className="text-[10px] text-muted line-clamp-2 mt-0.5">{c.description}</p>
                )}
                {c.syllabus && c.syllabus.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {c.syllabus.map((syl, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-background border border-border-subtle/20 text-muted"
                      >
                        {syl}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ─── Account Tab ──────────────────────────────────────────────────────────────

function AccountTab({ mentor }: { mentor: MentorDto }) {
  return (
    <div className="p-6 flex flex-col gap-5 max-w-2xl">
      <SectionCard title="Account Information" subtitle="System-level identifiers and metadata">
        <div className="divide-y divide-border-subtle/20">
          <StatRow label="Mentor ID" value={<span className="font-mono text-[10px] break-all">{mentor.id ?? '—'}</span>} />
          <StatRow label="Name" value={mentor.name ?? '—'} />
          <StatRow label="Email" value={mentor.email ?? '—'} />
          <StatRow label="Role" value="MENTOR" />
        </div>
      </SectionCard>
    </div>
  );
}
