/**
 * DirectoryLayout — Shared Primitive
 *
 * Controls the top-level flex container that switches between:
 *   - Full-width list mode (no item selected)
 *   - Split pane mode (item selected → detail panel opens on right)
 *
 * SOLID S: single concern — layout structure only, no data/logic.
 * KISS: two variants, zero internal state.
 */
import type { ReactNode } from 'react';

interface DirectoryLayoutProps {
  /** The main list table area */
  listSlot: ReactNode;
  /** The detail panel — rendered only when isDetailOpen is true */
  detailSlot?: ReactNode;
  /** Whether to show split-pane (list + detail) or full-width list */
  isDetailOpen: boolean;
}

export function DirectoryLayout({ listSlot, detailSlot, isDetailOpen }: DirectoryLayoutProps) {
  if (isDetailOpen && detailSlot) {
    return (
      <div className="flex-1 flex overflow-hidden bg-card-bg">
        {detailSlot}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {listSlot}
    </div>
  );
}
