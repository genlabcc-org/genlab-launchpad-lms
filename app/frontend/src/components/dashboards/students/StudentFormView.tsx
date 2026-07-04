/**
 * StudentFormView — View Layer
 *
 * Full-screen student onboarding form. Uses StatusBanner from shared
 * directory primitives. Layout mirrors CourseFormView for visual consistency.
 *
 * SOLID S: only renders the creation form, no state or API calls.
 */
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import type { StudentFormState } from '../../../hooks/useAdminStudents';
import type { CourseDto } from '../../../api/types';
import { StatusBanner } from '../shared/directory/shared';
import type { StatusMessage } from '../shared/directory/shared';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  form: StudentFormState;
  courses?: CourseDto[];
  setFormField: <K extends keyof StudentFormState>(key: K, value: StudentFormState[K]) => void;
  isSaving: boolean;
  message: StatusMessage;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StudentFormView({ form, courses = [], setFormField, isSaving, message, onSubmit, onCancel }: Props) {
  const fieldClass = 'flex flex-col gap-1.5';
  const labelClass = 'text-[11px] font-bold uppercase tracking-wider text-muted';
  const inputClass = 'px-3 py-2.5 text-xs bg-background border border-border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all';
  const selectClass = `${inputClass} cursor-pointer`;

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
              <UserPlus className="w-4 h-4 text-primary" />
              Enroll New Student
            </h2>
            <p className="text-[10px] text-muted mt-0.5">Fill in the student's details to register them in the system.</p>
          </div>
        </div>
        <button
          type="submit"
          form="student-form"
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary-hover shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? 'Saving...' : 'Register Student'}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <form id="student-form" onSubmit={onSubmit} className="flex flex-col gap-5 max-w-3xl mx-auto">
          {message && <StatusBanner message={message} />}

          {/* Course & Program Selection */}
          <Section title="Course & Program Selection">
            <div className="grid grid-cols-1 gap-4">
              <div className={fieldClass}>
                <label className={labelClass}>Interested Course <span className="text-rose-500 font-bold ml-0.5">*</span></label>
                <select
                  required
                  value={form.interestedCourseId}
                  onChange={(e) => setFormField('interestedCourseId', e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select interested course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Section>

          {/* Personal Information */}
          <Section title="Personal Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={fieldClass}>
                <label className={labelClass}>Full Name <span className="text-rose-500 font-bold ml-0.5">*</span></label>
                <input required type="text" placeholder="e.g. Alice Johnson" value={form.name} onChange={(e) => setFormField('name', e.target.value)} className={inputClass} />
              </div>
              <div className={fieldClass}>
                <label className={labelClass}>Email <span className="text-rose-500 font-bold ml-0.5">*</span></label>
                <input required type="email" placeholder="alice@example.com" value={form.email} onChange={(e) => setFormField('email', e.target.value)} className={inputClass} />
              </div>
              <div className={fieldClass}>
                <label className={labelClass}>Phone <span className="text-rose-500 font-bold ml-0.5">*</span></label>
                <input required type="tel" placeholder="+91 9876543210" value={form.phone} onChange={(e) => setFormField('phone', e.target.value)} className={inputClass} />
              </div>
              <div className={fieldClass}>
                <label className={labelClass}>Emergency Contact</label>
                <input type="tel" placeholder="+91 9876543211" value={form.emergencyMobile} onChange={(e) => setFormField('emergencyMobile', e.target.value)} className={inputClass} />
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
                <input type="text" placeholder="123 Design Street, City" value={form.address} onChange={(e) => setFormField('address', e.target.value)} className={inputClass} />
              </div>
            </div>
          </Section>

          {/* Academic / Professional */}
          <Section title="Academic & Professional">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={fieldClass}>
                <label className={labelClass}>Institution / Company</label>
                <input type="text" placeholder="e.g. VIT Chennai" value={form.institutionName} onChange={(e) => setFormField('institutionName', e.target.value)} className={inputClass} />
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

          {/* Payment */}
          <Section title="Payment Information">
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
        </form>
      </div>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

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
