/**
 * courses/shared.tsx — Course-specific UI Primitives (DRY layer)
 *
 * Course-specific components reused across CatalogListView, CourseDetailView,
 * and CourseFormView.
 *
 * StatusBanner and Accordion are re-exported from the canonical shared
 * directory primitives module to avoid duplication.
 *
 * KISS: keep each primitive focused. No logic, no state.
 * DRY:  any pattern appearing in 2+ places lives in shared/directory/.
 */
import { Plus, Trash2, GraduationCap, ListOrdered, IndianRupee } from 'lucide-react';
import type { MentorDto } from '../../../api/types';
import type { CourseFormState } from '../../../hooks/useAdminCourses';

// Re-export canonical shared primitives so existing imports keep working
export { StatusBanner, Accordion, DetailTabBar, SectionCard, StatRow } from '../shared/directory/shared';
export type { StatusMessage, TabDef } from '../shared/directory/shared';


// ─── MentorCheckboxGrid ───────────────────────────────────────────────────────
// Used by: InlineEditPanel (CourseDetailView), CourseFormView

interface MentorCheckboxGridProps {
  mentors: MentorDto[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  maxHeight?: string;
}

export function MentorCheckboxGrid({
  mentors,
  selectedIds,
  onToggle,
  maxHeight = 'max-h-[140px]',
}: MentorCheckboxGridProps) {
  return (
    <div
      className={`border border-border-subtle bg-background/20 rounded-2xl p-4 ${maxHeight} overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2`}
    >
      {mentors.map((m) => (
        <label
          key={m.id}
          className="flex items-center gap-2 cursor-pointer text-[11px] font-semibold text-neutral-300 hover:text-white"
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(m.id!)}
            onChange={() => onToggle(m.id!)}
            className="accent-primary w-3.5 h-3.5"
          />
          <span>{m.name}</span>
        </label>
      ))}
    </div>
  );
}

// ─── SyllabusBuilder ─────────────────────────────────────────────────────────
// Used by: InlineEditPanel (CourseDetailView), CourseFormView

interface SyllabusBuilderProps {
  items: string[];
  onAdd: () => void;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  placeholder?: string;
  addLabel?: string;
}

export function SyllabusBuilder({
  items,
  onAdd,
  onUpdate,
  onRemove,
  placeholder = 'Module Title or Details',
  addLabel = 'Add Module',
}: SyllabusBuilderProps) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="text-[10px] text-muted font-mono font-bold w-4">{idx + 1}.</span>
          <input
            type="text"
            placeholder={placeholder}
            value={item}
            onChange={(e) => onUpdate(idx, e.target.value)}
            className="flex-1 py-1.5 px-3 bg-background border border-border-subtle rounded-xl text-foreground focus:outline-none text-xs"
          />
          <button
            type="button"
            onClick={() => onRemove(idx)}
            className="p-1 rounded hover:bg-red-500/10 text-muted hover:text-red-500 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="mt-1 flex items-center gap-1.5 self-start text-[10px] font-bold text-primary hover:underline cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        {addLabel}
      </button>
    </div>
  );
}

// ─── CourseFormFields ─────────────────────────────────────────────────────────
// Used by: InlineEditPanel (CourseDetailView), CourseFormView
// Renders title, price, description, mentors, and syllabus in a shared layout.

interface CourseFormFieldsProps {
  form: CourseFormState;
  mentors: MentorDto[];
  gridCols?: string; // 'sm:grid-cols-4' (edit) or 'md:grid-cols-4' (create)
  onSetTitle: (v: string) => void;
  onSetDescription: (v: string) => void;
  onSetPrice: (v: number) => void;
  onToggleMentor: (id: string) => void;
  onAddSyllabusItem: () => void;
  onUpdateSyllabusItem: (index: number, value: string) => void;
  onRemoveSyllabusItem: (index: number) => void;
  onToggleActive?: (v: boolean) => void;
}

export function CourseFormFields({
  form,
  mentors,
  onSetTitle,
  onSetDescription,
  onSetPrice,
  onToggleMentor,
  onAddSyllabusItem,
  onUpdateSyllabusItem,
  onRemoveSyllabusItem,
  onToggleActive,
}: CourseFormFieldsProps) {
  const sectionLabel = "text-muted text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5";

  return (
    <div className="flex flex-col gap-5 text-xs text-foreground font-semibold">
      {/* Title + Price */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="sm:col-span-3 flex flex-col gap-1.5">
          <label className={sectionLabel}>Course Title *</label>
          <input
            type="text"
            placeholder="e.g. Graphic & Layout Design track"
            value={form.title}
            onChange={(e) => onSetTitle(e.target.value)}
            className="w-full py-2 px-3 bg-background border border-border-subtle rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 text-xs transition-all"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={sectionLabel}>Price *</label>
          <div className="relative flex items-center">
            <IndianRupee className="w-3.5 h-3.5 absolute left-3 text-muted" />
            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) => onSetPrice(Number(e.target.value))}
              className="w-full pl-8 pr-3 py-2 bg-background border border-border-subtle rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono text-xs transition-all"
            />
          </div>
        </div>
      </div>

      {/* Active State Toggle */}
      <div className="flex flex-col gap-1.5">
        <label className={sectionLabel}>Status</label>
        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => onToggleActive?.(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-muted/35 rounded-full peer peer-focus:outline-none dark:bg-muted/20 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
            <span className="ml-2 text-xs font-semibold text-foreground">
              {form.isActive ? 'Active' : 'Inactive'}
            </span>
          </label>
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className={sectionLabel}>Description *</label>
        <textarea
          rows={4}
          placeholder="Provide an overview of what the course covers..."
          value={form.description}
          onChange={(e) => onSetDescription(e.target.value)}
          className="w-full py-2 px-3 bg-background border border-border-subtle rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 leading-relaxed text-xs transition-all resize-y"
          required
        />
      </div>

      {/* Mentors */}
      <div className="flex flex-col gap-1.5">
        <span className={sectionLabel}>
          <GraduationCap className="w-3.5 h-3.5" />
          Mentors
        </span>
        <MentorCheckboxGrid
          mentors={mentors}
          selectedIds={form.mentorIds}
          onToggle={onToggleMentor}
        />
      </div>

      {/* Syllabus */}
      <div className="flex flex-col gap-1.5">
        <span className={sectionLabel}>
          <ListOrdered className="w-3.5 h-3.5" />
          Syllabus
        </span>
        <SyllabusBuilder
          items={form.syllabus}
          onAdd={onAddSyllabusItem}
          onUpdate={onUpdateSyllabusItem}
          onRemove={onRemoveSyllabusItem}
        />
      </div>
    </div>
  );
}
