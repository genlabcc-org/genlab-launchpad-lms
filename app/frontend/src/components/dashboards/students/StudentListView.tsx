/**
 * StudentListView — View Layer
 *
 * Full-width Odoo-style list of students. Uses shared directory primitives for
 * header, table chrome, and pagination. Student-specific column definitions
 * and CSV export stay local to this file.
 *
 * SOLID S: renders the student list only, zero API calls.
 * DRY: delegates layout chrome to shared/directory primitives.
 */
import { useState, useMemo, useEffect } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import type { StudentDto, EnrollmentDto } from '../../../api/types';
import { DirectoryHeader, type FilterItem } from '../shared/directory/DirectoryHeader';
import { DirectoryTable, type ColumnDef } from '../shared/directory/DirectoryTable';
import { DirectoryPagination } from '../shared/directory/DirectoryPagination';
import { getDuesStatus, getStudentDueDate } from './StudentDetailView';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  filteredStudents: StudentDto[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedFilterId: string;
  onSelectFilter: (id: string) => void;
  selectedStudentId: string | null;
  onSelectStudent: (id: string | null) => void;
  onOpenCreate: () => void;
  onRefresh: () => void;
  enrollments: EnrollmentDto[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_ITEMS: FilterItem[] = [
  { id: 'all', label: 'All Students' },
  { id: 'active', label: 'Assigned (Active)' },
  { id: 'pending', label: 'Pending Assignment' },
  { id: 'full', label: 'Full Payment' },
  { id: 'partial', label: 'Partial / Monthly' },
];

type SortKey = 'name' | 'email' | 'studentType' | 'paymentType' | 'totalAmount' | 'createdAt';

// ─── Badge helper ─────────────────────────────────────────────────────────────

function TypeBadge({ label }: { label?: string }) {
  if (!label) return <span className="italic text-muted/60">—</span>;
  const colours: Record<string, string> = {
    student: 'bg-blue-500/10 text-blue-400',
    fresher: 'bg-emerald-500/10 text-emerald-400',
    professional: 'bg-violet-500/10 text-violet-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${colours[label] ?? 'bg-muted/10 text-muted'}`}>
      {label}
    </span>
  );
}

function PaymentBadge({ label, pending }: { label?: string; pending?: number }) {
  const hasPending = (pending ?? 0) > 0;
  const colours = hasPending ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400';
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${colours}`}>
      {label ?? '—'}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StudentListView({
  filteredStudents, isLoading,
  searchQuery, onSearchChange,
  selectedFilterId, onSelectFilter,
  selectedStudentId,
  onSelectStudent, onOpenCreate, onRefresh, enrollments,
}: Props) {
  const [sortBy, setSortBy] = useState<SortKey>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const sortedStudents = useMemo<StudentDto[]>(() => {
    return [...filteredStudents].sort((a, b) => {
      const valA: any = a[sortBy as keyof StudentDto] ?? '';
      const valB: any = b[sortBy as keyof StudentDto] ?? '';
      if (typeof valA === 'string') return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [filteredStudents, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedStudents.length / rowsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedStudents = useMemo(
    () => sortedStudents.slice((activePage - 1) * rowsPerPage, activePage * rowsPerPage),
    [sortedStudents, activePage, rowsPerPage],
  );

  useEffect(() => { setCurrentPage(1); }, [searchQuery, sortBy, sortOrder, rowsPerPage, selectedFilterId]);

  // Selection
  const pageIds = useMemo(() => paginatedStudents.map((s) => s.id!).filter(Boolean), [paginatedStudents]);
  const isAllSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));

  const handleSelectAll = (checked: boolean) => {
    const next = new Set(selectedIds);
    pageIds.forEach((id) => checked ? next.add(id) : next.delete(id));
    setSelectedIds(next);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    checked ? next.add(id) : next.delete(id);
    setSelectedIds(next);
  };

  const handleSort = (key: string) => {
    const k = key as SortKey;
    if (sortBy === k) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(k); setSortOrder('asc'); }
  };

  // CSV Export
  const exportToCsv = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Student Type', 'Payment Type', 'Total (₹)', 'Pending (₹)', 'Institution', 'Registered'];
    const toExport = selectedIds.size > 0 ? sortedStudents.filter((s) => s.id && selectedIds.has(s.id)) : sortedStudents;
    const rows = toExport.map((s) => [
      s.id ?? '', `"${(s.name ?? '').replace(/"/g, '""')}"`, s.email ?? '',
      s.phone ?? '', s.studentType ?? '', s.paymentType ?? '',
      s.totalAmount ?? 0, s.pendingAmount ?? 0,
      `"${(s.institutionName ?? '').replace(/"/g, '""')}"`, s.createdAt ?? '',
    ]);
    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url; a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    a.style.visibility = 'hidden'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  // Columns
  const columns: ColumnDef<StudentDto>[] = [
    {
      key: 'name', header: 'Name', sortable: true,
      render: (s) => <span className="text-primary font-semibold hover:underline">{s.name}</span>,
    },
    {
      key: 'email', header: 'Email', sortable: true,
      render: (s) => <span className="text-muted">{s.email ?? '—'}</span>,
    },
    {
      key: 'studentType', header: 'Type', sortable: true,
      render: (s) => <TypeBadge label={s.studentType} />,
    },
    {
      key: 'paymentType', header: 'Payment', sortable: true,
      render: (s) => <PaymentBadge label={s.paymentType} pending={s.pendingAmount} />,
    },
    {
      key: 'totalAmount', header: 'Amount (₹)', sortable: true,
      render: (s) => (
        <span className="font-mono text-foreground">
          ₹{s.totalAmount?.toFixed(2) ?? '0.00'}
          {(() => {
            const dueDate = getStudentDueDate(s.id, enrollments);
            const status = getDuesStatus(s.pendingAmount, dueDate);
            if (!status.show) return null;
            const textClass = status.priority === 'overdue' || status.priority === 'urgent' ? 'text-rose-500 font-bold' : 'text-amber-400 font-semibold';
            return (
              <span className={`${textClass} ml-1 text-[10px]`}>
                ({status.sidebarText})
              </span>
            );
          })()}
        </span>
      ),
    },
    {
      key: 'institutionName', header: 'Institution', sortable: false,
      render: (s) => <span className="text-muted truncate max-w-[180px] block">{s.institutionName ?? '—'}</span>,
    },
  ];

  const actionMenu = (
    <>
      <button onClick={exportToCsv} className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-medium hover:bg-foreground/5 transition-all cursor-pointer w-full">
        <Download className="w-3.5 h-3.5" /> Export CSV
      </button>
      <div className="my-1 border-t border-border-subtle/30" />
      <button onClick={() => { setSortBy('createdAt'); setSortOrder('desc'); setSelectedIds(new Set()); onRefresh(); }} className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-medium hover:bg-foreground/5 transition-all cursor-pointer w-full">
        <RefreshCw className="w-3.5 h-3.5" /> Refresh List
      </button>
    </>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-card-bg">
      <DirectoryHeader
        title="Students Directory"
        subtitle="Manage registered students, track course enrollments and payment status."
        recordCount={filteredStudents.length}
        selectedCount={selectedIds.size}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search students..."
        filterItems={FILTER_ITEMS}
        selectedFilterId={selectedFilterId}
        onSelectFilter={onSelectFilter}
        onNewClick={onOpenCreate}
        actionMenuSlot={actionMenu}
      />
      <DirectoryTable
        data={paginatedStudents}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No students found."
        loadingMessage="Loading students database..."
        selectedIds={selectedIds}
        isAllSelected={isAllSelected}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectRow}
        getId={(s) => s.id ?? ''}
        onRowClick={(s) => onSelectStudent(s.id ?? null)}
        activeId={selectedStudentId}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
      {sortedStudents.length > 0 && (
        <DirectoryPagination
          totalRecords={sortedStudents.length}
          rowsPerPage={rowsPerPage}
          currentPage={activePage}
          onRowsPerPageChange={(n) => { setRowsPerPage(n); setCurrentPage(1); }}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
