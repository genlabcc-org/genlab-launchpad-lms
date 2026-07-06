/**
 * shared/directory/shared.tsx — Shared UI Atoms
 *
 * Small, stateless primitives reused across all three admin directories
 * (Courses, Students, Mentors). Each component has a single visual concern.
 *
 * KISS: keep each primitive under 30 lines. No logic, no state.
 * DRY: any pattern appearing in 2+ places lives here instead.
 */
import { AlertCircle, CheckCircle, ChevronUp, ChevronDown, Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

// ─── EmptyState ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export function EmptyState({
  title = 'No records found',
  message = 'There are no items to show in this directory right now.',
}: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center min-h-[350px]">
      <div className="group relative mb-6">
        {/* Glow effect behind the icon container */}
        <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Glassmorphic Icon Container */}
        <div className="relative w-16 h-16 rounded-2xl bg-card-bg border border-border-subtle flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:border-primary/50 transition-all duration-300">
          <Inbox className="w-8 h-8 text-primary transition-transform duration-300 group-hover:translate-y-[-2px]" strokeWidth={1.5} />
        </div>
      </div>
      
      <h3 className="text-sm font-bold text-foreground mb-2 tracking-wide uppercase">
        {title}
      </h3>
      <p className="text-xs text-muted max-w-xs leading-relaxed">
        {message}
      </p>
    </div>
  );
}

// ─── StatusBanner ─────────────────────────────────────────────────────────────

export type StatusMessage = { text: string; type: 'success' | 'error' } | null;

interface StatusBannerProps {
  message: StatusMessage;
  compact?: boolean;
}

export function StatusBanner({ message, compact = false }: StatusBannerProps) {
  if (!message) return null;
  const isError = message.type === 'error';
  const Icon = isError ? AlertCircle : CheckCircle;
  const colours = isError
    ? 'bg-red-500/5 border-red-500/25 text-red-500'
    : 'bg-emerald-500/5 border-emerald-500/25 text-emerald-500';

  return (
    <div className={`rounded-2xl flex items-start gap-2.5 border ${compact ? 'p-3.5' : 'p-4 gap-3'} ${colours}`}>
      <Icon className={`shrink-0 mt-0.5 ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
      <div>
        {!compact && <span className="font-bold">{isError ? 'Error' : 'Success'}</span>}
        <p className={`leading-relaxed ${compact ? 'text-[11px]' : 'text-xs mt-0.5'}`}>
          {message.text}
        </p>
      </div>
    </div>
  );
}

// ─── Accordion ────────────────────────────────────────────────────────────────

interface AccordionProps {
  label: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function Accordion({ label, isExpanded, onToggle, children }: AccordionProps) {
  return (
    <div className="border border-border-subtle bg-card-bg rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-all duration-200">
      <button
        onClick={onToggle}
        className="w-full px-4 py-2.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted hover:bg-foreground/2 border-b border-border-subtle/50 focus:outline-none cursor-pointer"
      >
        <span>{label}</span>
        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {isExpanded && children}
    </div>
  );
}

// ─── DetailTabBar ─────────────────────────────────────────────────────────────
// Canonical tab strip used by all three detail panels.
// Callers define their own TabId union — SOLID I (interface segregation).

export interface TabDef {
  id: string;
  label: string;
}

interface DetailTabBarProps {
  tabs: TabDef[];
  activeTab: string;
  onSetTab: (id: string) => void;
}

export function DetailTabBar({ tabs, activeTab, onSetTab }: DetailTabBarProps) {
  return (
    <div className="px-5 bg-card-bg border-b border-border-subtle flex gap-5 shrink-0 select-none">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSetTab(tab.id)}
          className={`py-2.5 text-[11px] tracking-wide uppercase font-bold cursor-pointer transition-all border-b-2 ${
            activeTab === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-foreground hover:border-border-subtle/50'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ─── SectionCard ──────────────────────────────────────────────────────────────
// A labelled card block used to group related fields in tab content.

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function SectionCard({ title, subtitle, children, className }: SectionCardProps) {
  return (
    <div className={`border border-border-subtle bg-card-bg rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col${className ? ` ${className}` : ''}`}>
      <div className="px-4 py-3 border-b border-border-subtle/50 bg-foreground/1">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted">{title}</h4>
        {subtitle && <p className="text-[10px] text-muted/70 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-4 flex-1">{children}</div>
    </div>
  );
}

// ─── StatRow ──────────────────────────────────────────────────────────────────
// One key-value row inside a SectionCard or Accordion.

interface StatRowProps {
  label: string;
  value: ReactNode;
}

export function StatRow({ label, value }: StatRowProps) {
  return (
    <div className="py-2.5 flex items-center justify-between gap-4 border-b border-border-subtle/40 last:border-0 text-xs font-semibold">
      <span className="text-muted">{label}</span>
      <span className="text-foreground text-right">{value}</span>
    </div>
  );
}

