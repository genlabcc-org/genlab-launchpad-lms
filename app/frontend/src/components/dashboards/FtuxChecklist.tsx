import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, ArrowRight, Sparkles } from 'lucide-react';
import adminApi from '../../api/admin';
import type { WorkspaceOverviewDto } from '../../api/types';

export function FtuxChecklist() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState<WorkspaceOverviewDto | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCounts = async () => {
    try {
      const data = await adminApi.getOverviewCounts();
      setCounts(data);
    } catch (e) {
      console.error('Failed to load workspace counts for FTUX checklist', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  if (loading || !counts) {
    return null;
  }

  const steps = [
    {
      id: 'slots',
      label: 'Define Slots & Timing Presets',
      description: 'Set up time schedules (e.g. Morning 10AM-12PM) to structure mentor availabilities.',
      isCompleted: counts.slotsCount > 0,
      path: '/admin/slots',
    },
    {
      id: 'courses',
      label: 'Create Course Catalog',
      description: 'Define courses, durations (e.g. 90 days), price tags, and syllabus tracks.',
      isCompleted: counts.coursesCount > 0,
      path: '/admin/courses',
    },
    {
      id: 'mentors',
      label: 'Invite Professional Mentors',
      description: 'Register teachers and assign them to the courses they specialize in.',
      isCompleted: counts.mentorsCount > 0,
      path: '/admin/mentors',
    },
    {
      id: 'batches',
      label: 'Initialize Intake Batches',
      description: 'Create active batches (e.g. 2026_july_batch_1) with custom cutoff dates.',
      isCompleted: counts.batchesCount > 0,
      path: '/admin/batches',
    },
    {
      id: 'students',
      label: 'Onboard Pending Students',
      description: 'Register student accounts with interested courses, awaiting slot assignments.',
      isCompleted: counts.studentsCount > 0,
      path: '/admin/students',
    },
  ];

  const completedCount = steps.filter((s) => s.isCompleted).length;
  const isSetupDone = completedCount === steps.length;

  if (isSetupDone) {
    return null; // hide panel completely when setup is fully complete
  }

  return (
    <div className="shrink-0 p-6 bg-linear-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900 dark:via-card-bg dark:to-slate-950 border border-border-subtle dark:border-primary/25 rounded-3xl shadow-lg relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center p-1 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <h3 className="text-sm font-bold text-foreground tracking-tight uppercase">
              First-Time Workspace Setup Checklist
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1 max-w-xl">
            Welcome to GenLab LMS! Complete these 5 quick onboarding steps to fully activate your system flow.
          </p>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <span className="text-xs font-bold text-primary">
            {completedCount} / 5 Steps Done
          </span>
          <div className="w-32 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-1.5 border border-border-subtle/30">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${(completedCount / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {steps.map((step, idx) => {
          return (
            <button
              key={step.id}
              onClick={() => navigate(step.path)}
              className={`flex flex-col justify-between p-4 text-left border rounded-2xl transition-all duration-300 cursor-pointer ${
                step.isCompleted
                  ? 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10'
                  : 'border-border-subtle/80 bg-slate-100/30 dark:bg-slate-800/5 hover:border-primary/60 dark:hover:border-primary/40 hover:bg-slate-200/50 dark:hover:bg-slate-800/15'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">STEP {idx + 1}</span>
                  {step.isCompleted ? (
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="w-4.5 h-4.5 text-slate-400 dark:text-slate-600 shrink-0" />
                  )}
                </div>

                <h4 className="text-xs font-bold text-foreground leading-snug">{step.label}</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-1 leading-normal line-clamp-2">
                  {step.description}
                </p>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-bold text-primary mt-4 group">
                <span>Configure</span>
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
