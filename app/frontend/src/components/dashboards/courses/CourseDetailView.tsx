/**
 * CourseDetailView — View Layer
 *
 * Renders the master-detail split screen via shared DirectoryLayout.
 * Uses shared primitives from `./shared.tsx` for StatusBanner, Accordion,
 * MentorCheckboxGrid, SyllabusBuilder, and CourseFormFields.
 *
 * SOLID S: owns the course detail experience only.
 * DRY: layout chrome delegated to shared/directory/DirectoryLayout.
 */
import { useState } from 'react';
import {
  Plus, Search, ArrowLeft, BookOpen,
  Save, X, MoreHorizontal,
} from 'lucide-react';
import type { CourseDto } from '../../../api/types';
import type { CourseFormState, DetailTab, StatusMessage } from '../../../hooks/useAdminCourses';
import { StatusBanner, Accordion, CourseFormFields } from './shared';
import { DirectoryLayout } from '../shared/directory/DirectoryLayout';

// ─── Public props ─────────────────────────────────────────────────────────────

interface Props {
  filteredCourses: CourseDto[];
  selectedCourseId: string | null;
  selectedCourse: CourseDto | null;
  mentors: import('../../../api/types').MentorDto[];
  form: CourseFormState;
  isLoadingDetails: boolean;
  isSaving: boolean;
  message: StatusMessage;
  isEditing: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectCourse: (id: string | null) => void;
  onOpenCreate: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveChanges: () => Promise<void>;
  onDeleteCourse: () => Promise<void>;
  onSetTitle: (v: string) => void;
  onSetDescription: (v: string) => void;
  onSetPrice: (v: number) => void;
  onToggleMentor: (id: string) => void;
  onAddSyllabusItem: () => void;
  onUpdateSyllabusItem: (index: number, value: string) => void;
  onRemoveSyllabusItem: (index: number) => void;
  onToggleActive: (v: boolean) => void;
}

// ─── Root component ───────────────────────────────────────────────────────────

export function CourseDetailView({
  filteredCourses, selectedCourseId, selectedCourse, mentors,
  form,
  isLoadingDetails, isSaving, message, isEditing,
  searchQuery, onSearchChange,
  onSelectCourse, onOpenCreate, onStartEdit, onCancelEdit,
  onSaveChanges, onDeleteCourse,
  onSetTitle, onSetDescription, onSetPrice,
  onToggleMentor, onAddSyllabusItem, onUpdateSyllabusItem, onRemoveSyllabusItem,
  onToggleActive,
}: Props) {
  // UI-only state — no business logic here
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [isAboutExpanded, setIsAboutExpanded] = useState(true);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(true);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <DirectoryLayout
      isDetailOpen={true}
      listSlot={null}
      detailSlot={
        <div className="flex-1 flex overflow-hidden bg-card-bg">

      {/* ── LEFT SIDEBAR ── */}
      <div className="w-80 border-r border-border-subtle/60 flex flex-col shrink-0 bg-background/20 overflow-hidden">
        <div className="px-4 py-3 border-b border-border-subtle/60 flex items-center justify-between gap-2 shrink-0 bg-background/30">
          <button
            onClick={() => onSelectCourse(null)}
            className="flex items-center gap-1.5 font-bold text-foreground text-xs hover:text-primary transition-colors focus:outline-none cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Catalog List</span>
          </button>
          <button
            onClick={onOpenCreate}
            className="bg-primary text-primary-foreground p-1.5 rounded-lg hover:bg-primary-hover shadow-xs transition-colors cursor-pointer"
            title="New Course"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-3 border-b border-border-subtle/40 shrink-0 bg-background/10">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 text-[11px] bg-background border border-border-subtle rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border-subtle/25">
          {filteredCourses.map((c) => {
            const isSelected = selectedCourseId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelectCourse(c.id ?? null)}
                className={`p-3.5 flex items-start gap-3 w-full hover:bg-primary/5 transition-all text-left cursor-pointer border-l-2 ${
                  isSelected
                    ? 'bg-primary/10 border-primary shadow-xs'
                    : 'bg-transparent border-transparent'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <span className="text-primary font-semibold hover:underline text-xs leading-snug truncate block">{c.title}</span>
                  <span className="text-[10px] text-muted font-mono font-semibold block mt-0.5">₹{c.price?.toFixed(2)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 bg-background flex flex-col overflow-hidden">
        {isLoadingDetails ? (
          <div className="flex-1 flex items-center justify-center text-xs text-muted font-medium">Loading course details...</div>
        ) : !selectedCourse ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted gap-2 bg-background/10">
            <BookOpen className="w-10 h-10 text-border-subtle" />
            <span className="text-xs font-semibold">No Course Selected</span>
          </div>
        ) : isEditing ? (
          <InlineEditPanel
            selectedCourse={selectedCourse}
            mentors={mentors}
            form={form}
            isSaving={isSaving}
            message={message}
            onSetTitle={onSetTitle}
            onSetDescription={onSetDescription}
            onSetPrice={onSetPrice}
            onToggleMentor={onToggleMentor}
            onAddSyllabusItem={onAddSyllabusItem}
            onUpdateSyllabusItem={onUpdateSyllabusItem}
            onRemoveSyllabusItem={onRemoveSyllabusItem}
            onToggleActive={onToggleActive}
            onSaveChanges={onSaveChanges}
            onCancelEdit={onCancelEdit}
          />
        ) : (
          <DetailPanel
            selectedCourse={selectedCourse}
            activeTab={activeTab}
            isAboutExpanded={isAboutExpanded}
            isDetailsExpanded={isDetailsExpanded}
            actionsOpen={actionsOpen}
            moreOpen={moreOpen}
            onSetActiveTab={setActiveTab}
            onToggleAbout={() => setIsAboutExpanded((v) => !v)}
            onToggleDetails={() => setIsDetailsExpanded((v) => !v)}
            onToggleActions={() => setActionsOpen((v) => !v)}
            onToggleMore={() => setMoreOpen((v) => !v)}
            onStartEdit={() => { setMoreOpen(false); onStartEdit(); }}
            onDeleteCourse={() => { setMoreOpen(false); onDeleteCourse(); }}
            onClose={() => onSelectCourse(null)}
          />
        )}
      </div>
        </div>
      }
    />
  );
}

// ─── InlineEditPanel ──────────────────────────────────────────────────────────

interface InlineEditPanelProps {
  selectedCourse: CourseDto;
  mentors: import('../../../api/types').MentorDto[];
  form: CourseFormState;
  isSaving: boolean;
  message: StatusMessage;
  onSetTitle: (v: string) => void;
  onSetDescription: (v: string) => void;
  onSetPrice: (v: number) => void;
  onToggleMentor: (id: string) => void;
  onAddSyllabusItem: () => void;
  onUpdateSyllabusItem: (index: number, value: string) => void;
  onRemoveSyllabusItem: (index: number) => void;
  onToggleActive: (v: boolean) => void;
  onSaveChanges: () => Promise<void>;
  onCancelEdit: () => void;
}

function InlineEditPanel({
  selectedCourse, mentors, form, isSaving, message,
  onSetTitle, onSetDescription, onSetPrice, onToggleMentor,
  onAddSyllabusItem, onUpdateSyllabusItem, onRemoveSyllabusItem,
  onToggleActive,
  onSaveChanges, onCancelEdit,
}: InlineEditPanelProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-border-subtle/80 flex items-center justify-between gap-3 shrink-0 bg-background/25">
        <div>
          <h3 className="text-sm font-bold text-foreground">Edit Course Catalog</h3>
          <p className="text-[10px] text-muted">Modify layout and configurations for {selectedCourse.title}.</p>
        </div>
        <button onClick={onCancelEdit} className="p-1.5 rounded-xl hover:bg-border-subtle/40 text-muted hover:text-foreground cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <StatusBanner message={message} compact />
        {/* Reuses the shared form fields — DRY: no duplication with CourseFormView */}
        <CourseFormFields
          form={form}
          mentors={mentors}
          gridCols="sm:grid-cols-4"
          onSetTitle={onSetTitle}
          onSetDescription={onSetDescription}
          onSetPrice={onSetPrice}
          onToggleMentor={onToggleMentor}
          onAddSyllabusItem={onAddSyllabusItem}
          onUpdateSyllabusItem={onUpdateSyllabusItem}
          onRemoveSyllabusItem={onRemoveSyllabusItem}
          onToggleActive={onToggleActive}
        />
      </div>

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

// ─── DetailPanel ──────────────────────────────────────────────────────────────

const TABS: { id: DetailTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'syllabus', label: 'Syllabus' },
  { id: 'mentors', label: 'Assigned Mentors' },
];

interface DetailPanelProps {
  selectedCourse: CourseDto;
  activeTab: DetailTab;
  isAboutExpanded: boolean;
  isDetailsExpanded: boolean;
  actionsOpen: boolean;
  moreOpen: boolean;
  onSetActiveTab: (t: DetailTab) => void;
  onToggleAbout: () => void;
  onToggleDetails: () => void;
  onToggleActions: () => void;
  onToggleMore: () => void;
  onStartEdit: () => void;
  onDeleteCourse: () => void;
  onClose: () => void;
}

function DetailPanel({
  selectedCourse,
  activeTab, isAboutExpanded, isDetailsExpanded, moreOpen,
  onSetActiveTab, onToggleAbout, onToggleDetails, onToggleMore,
  onStartEdit, onDeleteCourse, onClose,
}: DetailPanelProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border-subtle/60 flex items-center justify-between gap-4 shrink-0 bg-background/30 relative z-20">
        <h3 className="text-sm font-bold text-foreground leading-tight truncate max-w-sm">{selectedCourse.title}</h3>
        <div className="flex items-center gap-1.5">
          <button onClick={onStartEdit} className="px-3 py-1.5 bg-background border border-border-subtle text-foreground rounded-lg hover:bg-foreground/10 text-[11px] font-bold cursor-pointer transition-colors focus:outline-none">Edit</button>


          {/* More dropdown */}
          <div className="relative">
            <button onClick={onToggleMore} className="px-2.5 py-1.5 border border-border-subtle text-muted hover:text-foreground hover:bg-foreground/10 rounded-lg cursor-pointer focus:outline-none">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
            {moreOpen && (
              <div className="absolute right-0 mt-1.5 w-28 bg-card-bg border border-border-subtle rounded-xl shadow-xl z-50 overflow-hidden text-[10px] font-semibold text-foreground">
                <button onClick={onDeleteCourse} className="w-full text-left px-3.5 py-2.5 text-rose-500 hover:bg-rose-500/10 cursor-pointer">Delete Course</button>
              </div>
            )}
          </div>

          <button onClick={onClose} className="p-1.5 text-muted hover:text-foreground rounded-lg cursor-pointer" title="Close panel"><X className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="px-5 bg-background/10 border-b border-border-subtle/40 flex gap-5 shrink-0 select-none">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSetActiveTab(tab.id)}
            className={`py-2 text-[11px] tracking-wide uppercase font-bold cursor-pointer transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-foreground hover:border-border-subtle/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && (
          <OverviewTab
            course={selectedCourse}
            isAboutExpanded={isAboutExpanded}
            isDetailsExpanded={isDetailsExpanded}
            onToggleAbout={onToggleAbout}
            onToggleDetails={onToggleDetails}
          />
        )}
        {activeTab === 'syllabus' && <SyllabusTab course={selectedCourse} />}
        {activeTab === 'mentors' && <MentorsTab course={selectedCourse} />}

      </div>
    </div>
  );
}

// ─── Tab panels ───────────────────────────────────────────────────────────────

function OverviewTab({
  course, isAboutExpanded, isDetailsExpanded, onToggleAbout, onToggleDetails,
}: {
  course: CourseDto;
  isAboutExpanded: boolean;
  isDetailsExpanded: boolean;
  onToggleAbout: () => void;
  onToggleDetails: () => void;
}) {
  const catalogStats = [
    {
      label: 'Status',
      value: course.isActive ? (
        <span className="flex items-center gap-1.5 text-emerald-500 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Active
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-rose-500 font-bold">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          Inactive
        </span>
      )
    },
    { label: 'Base Price', value: <span className="font-bold font-mono text-foreground">₹{course.price?.toFixed(2)}</span> },
    { label: 'Assigned Mentors', value: <span className="font-bold text-foreground">{course.mentors?.length ?? 0}</span> },
    { label: 'Total Modules', value: <span className="font-bold text-foreground">{course.syllabus?.length ?? 0}</span> },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 p-6">
      {/* Left column */}
      <div className="xl:col-span-2 flex flex-col gap-4">
        {/* Identity card */}
        <div className="p-4 bg-card-bg border border-border-subtle rounded-2xl flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-foreground text-xs leading-snug truncate">{course.title}</h4>
              <span className="text-[10px] text-muted font-semibold mt-0.5 block">{(course as any).code ?? 'GL-LMS-TRACK'}</span>
            </div>
          </div>
        </div>

        {/* Accordions — reuses shared primitive, no duplication */}
        <Accordion label="About this Course" isExpanded={isAboutExpanded} onToggle={onToggleAbout}>
          <div className="p-4 text-xs leading-relaxed text-foreground font-semibold bg-card-bg">{course.description}</div>
        </Accordion>

        <Accordion label="Catalog Details" isExpanded={isDetailsExpanded} onToggle={onToggleDetails}>
          <div className="p-4 divide-y divide-border-subtle/30 text-xs font-semibold bg-card-bg">
            {catalogStats.map(({ label, value }) => (
              <div key={label} className="py-2.5 flex items-center justify-between gap-4">
                <span className="text-muted">{label}</span>
                {value}
              </div>
            ))}
          </div>
        </Accordion>
      </div>

      {/* Right column */}
      <div className="xl:col-span-3 flex flex-col gap-4">
        {/* Syllabus checklist preview */}
        <div className="border border-border-subtle bg-card-bg rounded-2xl overflow-hidden shadow-xs">
          <div className="px-4 py-3 bg-foreground/1 border-b border-border-subtle/50 text-[10px] uppercase font-bold text-muted tracking-wider">Syllabus Checklist</div>
          {!course.syllabus?.length ? (
            <p className="p-4 text-xs text-muted italic">No syllabus steps configured.</p>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-subtle/35 bg-foreground/1 text-[9px] uppercase font-bold text-muted">
                  <th className="py-2.5 px-4">Module Details</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/25 font-semibold">
                {course.syllabus.slice(0, 3).map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-4 truncate max-w-[200px]" title={item}>{item}</td>
                    <td className="py-2.5 px-4 text-right text-emerald-500 font-bold text-[10px]">Published</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Activity chart */}
        <div className="p-5 border border-border-subtle bg-card-bg rounded-2xl flex flex-col justify-between shadow-xs">
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Course Activity</h4>
            <p className="text-[10px] text-muted">Weekly active student learning metrics</p>
          </div>
          <div className="h-24 flex items-end gap-2.5 mt-5">
            {(() => {
              const metrics = course.activityMetrics && course.activityMetrics.length > 0
                ? course.activityMetrics
                : [0, 0, 0, 0, 0, 0, 0];
              const maxVal = Math.max(...metrics, 1);
              return metrics.map((val, idx) => (
                <div key={idx} className="flex-1 h-full flex flex-col justify-end items-center gap-1.5 group" title={`${val} active students`}>
                  <div style={{ height: `${(val / maxVal) * 100}%` }} className="w-full bg-primary/20 hover:bg-primary/80 transition-all rounded-t-md duration-300" />
                  <span className="text-[9px] text-muted font-bold">W{idx + 1}</span>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

function SyllabusTab({ course }: { course: CourseDto }) {
  return (
    <div className="p-6 space-y-4">
      <div>
        <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Syllabus Directory</h4>
        <p className="text-[10px] text-muted">Active modules configured for student learning paths.</p>
      </div>
      {!course.syllabus?.length ? (
        <p className="text-xs text-muted italic">No syllabus modules defined.</p>
      ) : (
        <div className="space-y-2.5">
          {course.syllabus.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3.5 bg-card-bg border border-border-subtle rounded-2xl font-semibold shadow-xs">
              <span className="text-[10px] font-bold font-mono text-primary bg-primary/10 w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
              <span className="text-xs text-foreground leading-relaxed pt-0.5">{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MentorsTab({ course }: { course: CourseDto }) {
  return (
    <div className="p-6 space-y-4">
      <div>
        <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Course Instructors</h4>
        <p className="text-[10px] text-muted">Registered mentors assigned to coordinate this track catalog.</p>
      </div>
      {!course.mentors?.length ? (
        <p className="text-xs text-muted italic">No instructors assigned to this course.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {course.mentors.map((m) => (
            <div key={m.id} className="flex items-center gap-3 p-3 bg-card-bg border border-border-subtle rounded-2xl font-semibold shadow-xs">
              <div className="w-8 h-8 rounded-full bg-slate-800/40 text-slate-300 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {m.name?.substring(0, 2)}
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-bold text-foreground truncate">{m.name}</h5>
                <p className="text-[10px] text-muted truncate">{m.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

