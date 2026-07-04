/**
 * MentorFormView — View Layer
 *
 * Simplified mentor onboarding form. Uses StatusBanner from shared primitives.
 * Layout mirrors StudentFormView / CourseFormView for visual consistency.
 *
 * SOLID S: renders the creation form only, no state or API calls.
 */
import { ArrowLeft, Save, Users } from 'lucide-react';
import type { MentorFormState } from '../../../hooks/useAdminMentors';
import { StatusBanner } from '../shared/directory/shared';
import type { StatusMessage } from '../shared/directory/shared';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  form: MentorFormState;
  setFormField: <K extends keyof MentorFormState>(key: K, value: MentorFormState[K]) => void;
  isSaving: boolean;
  message: StatusMessage;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MentorFormView({ form, setFormField, isSaving, message, onSubmit, onCancel }: Props) {
  const fieldClass = 'flex flex-col gap-1.5';
  const labelClass = 'text-[11px] font-bold uppercase tracking-wider text-muted';
  const inputClass = 'px-3 py-2.5 text-xs bg-background border border-border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all';

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-card-bg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle/60 bg-background/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-muted hover:bg-foreground/10 hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Add New Mentor
            </h2>
            <p className="text-[10px] text-muted mt-0.5">Invite a new mentor to the platform by providing their details.</p>
          </div>
        </div>
        <button
          type="submit"
          form="mentor-form"
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary-hover shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? 'Saving...' : 'Create Mentor'}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <form id="mentor-form" onSubmit={onSubmit} className="flex flex-col gap-5 max-w-3xl mx-auto">
          {message && <StatusBanner message={message} />}

          <div className="border border-border-subtle/60 rounded-2xl overflow-hidden bg-background/10">
            <div className="px-4 py-2.5 border-b border-border-subtle/30 bg-background/20">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted">Mentor Details</h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={fieldClass}>
                <label className={labelClass}>Full Name <span className="text-rose-500 font-bold ml-0.5">*</span></label>
                <input
                  required type="text" placeholder="e.g. Dr. Priya Sharma"
                  value={form.name} onChange={(e) => setFormField('name', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className={fieldClass}>
                <label className={labelClass}>Email Address <span className="text-rose-500 font-bold ml-0.5">*</span></label>
                <input
                  required type="email" placeholder="priya.sharma@genlab.cc"
                  value={form.email} onChange={(e) => setFormField('email', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
