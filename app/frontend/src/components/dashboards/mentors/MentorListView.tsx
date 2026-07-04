/**
 * MentorListView — View Layer
 *
 * Odoo-style list view for the Mentors directory.
 * Uses shared directory primitives; mentor-specific columns defined locally.
 *
 * SOLID S: renders the mentor list only, zero API calls.
 * DRY: delegates layout chrome to shared/directory primitives.
 */
import { useState, useMemo, useEffect } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import type { MentorDto } from '../../../api/types';
import { DirectoryHeader, type FilterItem } from '../shared/directory/DirectoryHeader';
import { DirectoryTable, type ColumnDef } from '../shared/directory/DirectoryTable';
import { DirectoryPagination } from '../shared/directory/DirectoryPagination';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  filteredMentors: MentorDto[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedFilterId: string;
  onSelectFilter: (id: string) => void;
  selectedMentorId: string | null;
  onSelectMentor: (id: string | null) => void;
  onOpenCreate: () => void;
  onRefresh: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_ITEMS: FilterItem[] = [
  { id: 'all', label: 'All Mentors' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function MentorListView({
  filteredMentors, isLoading,
  searchQuery, onSearchChange,
  selectedFilterId, onSelectFilter,
  selectedMentorId,
  onSelectMentor, onOpenCreate, onRefresh,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(filteredMentors.length / rowsPerPage));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedMentors = useMemo(
    () => filteredMentors.slice((activePage - 1) * rowsPerPage, activePage * rowsPerPage),
    [filteredMentors, activePage, rowsPerPage],
  );

  useEffect(() => { setCurrentPage(1); }, [searchQuery, rowsPerPage, selectedFilterId]);

  // Selection
  const pageIds = useMemo(() => paginatedMentors.map((m) => m.id!).filter(Boolean), [paginatedMentors]);
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

  // CSV Export
  const exportToCsv = () => {
    const headers = ['ID', 'Name', 'Email'];
    const toExport = selectedIds.size > 0
      ? filteredMentors.filter((m) => m.id && selectedIds.has(m.id))
      : filteredMentors;
    const rows = toExport.map((m) => [m.id ?? '', `"${(m.name ?? '').replace(/"/g, '""')}"`, m.email ?? '']);
    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url; a.download = `mentors_${new Date().toISOString().split('T')[0]}.csv`;
    a.style.visibility = 'hidden'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  // Columns
  const columns: ColumnDef<MentorDto>[] = [
    {
      key: 'name', header: 'Name', sortable: false,
      render: (m) => <span className="text-primary font-semibold hover:underline">{m.name}</span>,
    },
    {
      key: 'email', header: 'Email', sortable: false,
      render: (m) => <span className="text-muted">{m.email ?? '—'}</span>,
    },
    {
      key: 'id', header: 'Mentor ID', sortable: false,
      render: (m) => <span className="font-mono text-[10px] text-muted">{m.id ?? '—'}</span>,
    },
  ];

  const actionMenu = (
    <>
      <button onClick={exportToCsv} className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-medium hover:bg-foreground/5 transition-all cursor-pointer w-full">
        <Download className="w-3.5 h-3.5" /> Export CSV
      </button>
      <div className="my-1 border-t border-border-subtle/30" />
      <button onClick={() => { setSelectedIds(new Set()); onRefresh(); }} className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-medium hover:bg-foreground/5 transition-all cursor-pointer w-full">
        <RefreshCw className="w-3.5 h-3.5" /> Refresh List
      </button>
    </>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-card-bg">
      <DirectoryHeader
        title="Mentors Directory"
        subtitle="Manage registered mentors and their assignments."
        recordCount={filteredMentors.length}
        selectedCount={selectedIds.size}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search mentors..."
        filterItems={FILTER_ITEMS}
        selectedFilterId={selectedFilterId}
        onSelectFilter={onSelectFilter}
        onNewClick={onOpenCreate}
        actionMenuSlot={actionMenu}
      />
      <DirectoryTable
        data={paginatedMentors}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No mentors found."
        loadingMessage="Loading mentors database..."
        selectedIds={selectedIds}
        isAllSelected={isAllSelected}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectRow}
        getId={(m) => m.id ?? ''}
        onRowClick={(m) => onSelectMentor(m.id ?? null)}
        activeId={selectedMentorId}
      />
      {filteredMentors.length > 0 && (
        <DirectoryPagination
          totalRecords={filteredMentors.length}
          rowsPerPage={rowsPerPage}
          currentPage={activePage}
          onRowsPerPageChange={(n) => { setRowsPerPage(n); setCurrentPage(1); }}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
