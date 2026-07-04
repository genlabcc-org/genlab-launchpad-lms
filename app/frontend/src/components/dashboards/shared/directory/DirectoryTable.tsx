/**
 * DirectoryTable — Shared Primitive
 *
 * Generic table shell: standard cell padding, striped rows, hover states,
 * multi-select checkboxes (page-level + per-row), and column sort headers.
 * Each caller defines their own columns and row rendering via ColumnDef.
 *
 * SOLID S: only renders a table — no data fetching, no filtering.
 * SOLID O: column definitions are provided by callers, not hard-coded.
 * SOLID I: callers receive only props they need.
 * DRY: eliminates repeated <table> boilerplate across all three directories.
 */
import type { ReactNode } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

// ─── Column definition ────────────────────────────────────────────────────────

export interface ColumnDef<T> {
  /** Unique key for the column (used for sort matching) */
  key: string;
  /** Column header label */
  header: string;
  /** Whether this column can be clicked to sort */
  sortable?: boolean;
  /** Custom cell renderer — receives the row item */
  render: (row: T) => ReactNode;
  /** Optional fixed width CSS class e.g. "w-10" */
  widthClass?: string;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DirectoryTableProps<T> {
  /** Paginated rows to render */
  data: T[];
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Loading state */
  isLoading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Loading message */
  loadingMessage?: string;

  // ── Selection ─────────────────────────────────────────────────────────────
  /** IDs of currently selected rows */
  selectedIds: Set<string>;
  /** Whether all visible rows are selected */
  isAllSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  /** Extracts the ID from a row item */
  getId: (row: T) => string;
  /** Callback when a row body is clicked (not checkbox) */
  onRowClick?: (row: T) => void;
  /** Optionally highlight a specific row as active */
  activeId?: string | null;

  // ── Sorting ───────────────────────────────────────────────────────────────
  sortBy?: string | null;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DirectoryTable<T>({
  data,
  columns,
  isLoading = false,
  emptyMessage = 'No records found.',
  loadingMessage = 'Loading...',
  selectedIds,
  isAllSelected,
  onSelectAll,
  onSelectRow,
  getId,
  onRowClick,
  activeId,
  sortBy,
  sortOrder,
  onSort,
}: DirectoryTableProps<T>) {

  const renderSortIcon = (key: string) => {
    if (!onSort) return null;
    if (sortBy !== key) return <ArrowUpDown className="w-3 h-3 text-muted/50" />;
    return sortOrder === 'asc'
      ? <ArrowUp className="w-3 h-3 text-primary" />
      : <ArrowDown className="w-3 h-3 text-primary" />;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xs text-muted font-medium">{loadingMessage}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xs text-muted font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm">
          <tr className="border-b border-border-subtle/50 text-[10px] uppercase font-bold text-muted tracking-wider">
            {/* Select-all checkbox */}
            <th className="py-2.5 px-4 w-10">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="accent-primary cursor-pointer"
              />
            </th>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-2.5 px-3 ${col.widthClass ?? ''} ${col.sortable && onSort ? 'cursor-pointer select-none hover:text-foreground transition-colors' : ''}`}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && renderSortIcon(col.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-xs font-medium">
          {data.map((row, idx) => {
            const id = getId(row);
            const isSelected = selectedIds.has(id);
            const isActive = activeId === id;
            return (
              <tr
                key={id}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-border-subtle/30 hover:bg-primary/5 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-primary/15 hover:bg-primary/20'
                    : isSelected
                    ? 'bg-primary/10 hover:bg-primary/15'
                    : idx % 2 === 0
                    ? 'bg-transparent'
                    : 'bg-background/20'
                }`}
              >
                {/* Per-row checkbox */}
                <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelectRow(id, e.target.checked)}
                    className="accent-primary cursor-pointer"
                  />
                </td>
                {columns.map((col) => (
                  <td key={col.key} className="py-4 px-3">
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
