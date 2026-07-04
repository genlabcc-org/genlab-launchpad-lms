/**
 * CourseFormView — View Layer
 *
 * Full-page create-course form. Uses shared primitives (StatusBanner,
 * CourseFormFields) from `./shared.tsx` — no duplication with CourseDetailView.
 *
 * DRY: all form inputs live in CourseFormFields.
 * KISS: this file is only the page chrome (header, submit bar) + StatusBanner.
 */
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import type { MentorDto } from '../../../api/types';
import type { CourseFormState, StatusMessage } from '../../../hooks/useAdminCourses';
import { StatusBanner, CourseFormFields } from './shared';

interface Props {
  form: CourseFormState;
  mentors: MentorDto[];
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
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
}

export function CourseFormView({
  form, mentors, isSaving, message,
  onSetTitle, onSetDescription, onSetPrice, onToggleMentor,
  onAddSyllabusItem, onUpdateSyllabusItem, onRemoveSyllabusItem,
  onToggleActive,
  onSubmit, onCancel,
}: Props) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Header bar — flush to top edge, no outer card wrapper */}
      <div className="flex items-center gap-3 px-5 py-3 bg-background/30 border-b border-border-subtle/60">
        <button
          onClick={onCancel}
          className="p-1.5 rounded-xl hover:bg-border-subtle/40 text-muted hover:text-foreground transition-all cursor-pointer"
          title="Back to List"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-base font-bold text-foreground">Course Catalog Onboarding</h2>
          <p className="text-[10px] text-muted">Onboard a new course module, define settlement rate, and assign active mentors.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full">
        <form onSubmit={onSubmit} className="mx-auto max-w-4xl w-full p-6 flex flex-col gap-6">
          <StatusBanner message={message} />

          {/* Shared form fields — identical contract to InlineEditPanel */}
          <CourseFormFields
            form={form}
            mentors={mentors}
            gridCols="md:grid-cols-4"
            onSetTitle={onSetTitle}
            onSetDescription={onSetDescription}
            onSetPrice={onSetPrice}
            onToggleMentor={onToggleMentor}
            onAddSyllabusItem={onAddSyllabusItem}
            onUpdateSyllabusItem={onUpdateSyllabusItem}
            onRemoveSyllabusItem={onRemoveSyllabusItem}
            onToggleActive={onToggleActive}
          />

          {/* Action bar */}
          <div className="pt-5 border-t border-border-subtle/50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 bg-slate-800/10 border border-border-subtle text-foreground text-xs font-bold rounded-xl hover:bg-slate-800/20 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary-hover shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? 'Creating...' : 'Save Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
