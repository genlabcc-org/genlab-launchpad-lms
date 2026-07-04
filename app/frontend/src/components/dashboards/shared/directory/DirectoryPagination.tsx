/**
 * DirectoryPagination — Shared Primitive
 *
 * Sticky footer rendered below the directory table.
 * Shows rows-per-page selector, range description, and page navigation.
 *
 * SOLID S: only concerned with pagination UI — no data or filter logic.
 * DRY: one canonical footer for all three directory views.
 */

interface DirectoryPaginationProps {
  totalRecords: number;
  rowsPerPage: number;
  currentPage: number;
  onRowsPerPageChange: (n: number) => void;
  onPageChange: (page: number) => void;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

export function DirectoryPagination({
  totalRecords,
  rowsPerPage,
  currentPage,
  onRowsPerPageChange,
  onPageChange,
}: DirectoryPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const activePage = Math.min(currentPage, totalPages);

  const rangeStart = totalRecords > 0 ? (activePage - 1) * rowsPerPage + 1 : 0;
  const rangeEnd = Math.min(activePage * rowsPerPage, totalRecords);

  const btnClass =
    'p-1 px-2 border border-border-subtle/60 rounded-md text-muted hover:text-foreground hover:bg-slate-800/10 dark:hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted cursor-pointer disabled:cursor-not-allowed text-[11px] transition-colors';

  return (
    <div className="flex items-center justify-between px-5 py-2.5 border-t border-border-subtle/60 bg-background/20 text-xs text-muted font-medium shrink-0 select-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            className="bg-background border border-border-subtle rounded px-1.5 py-0.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 text-[11px]"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <span className="text-slate-400">
          Showing {rangeStart}–{rangeEnd} of {totalRecords} records
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button onClick={() => onPageChange(1)} disabled={activePage === 1} className={btnClass}>First</button>
        <button onClick={() => onPageChange(activePage - 1)} disabled={activePage === 1} className={btnClass}>Prev</button>
        <span className="px-2 text-[11px] text-slate-300">Page {activePage} of {totalPages}</span>
        <button onClick={() => onPageChange(activePage + 1)} disabled={activePage === totalPages} className={btnClass}>Next</button>
        <button onClick={() => onPageChange(totalPages)} disabled={activePage === totalPages} className={btnClass}>Last</button>
      </div>
    </div>
  );
}
