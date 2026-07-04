/**
 * CatalogListView — View Layer
 *
 * Odoo-style flat list for Courses. Uses shared directory primitives for
 * the header toolbar, table chrome, and pagination footer.
 * Course-specific columns and CSV export logic remain local.
 *
 * SOLID S: renders the courses list — no API calls, no business logic.
 * SOLID D: depends on shared primitives, not on duplicated inline markup.
 * DRY: header/table/pagination shared with Students and Mentors.
 */
import { useState, useEffect, useMemo } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import type { CourseDto, MentorDto } from '../../../api/types';
import { DirectoryHeader, type FilterItem } from '../shared/directory/DirectoryHeader';
import { DirectoryTable, type ColumnDef } from '../shared/directory/DirectoryTable';
import { DirectoryPagination } from '../shared/directory/DirectoryPagination';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  filteredCourses: CourseDto[];
  isLoadingList: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectCourse: (id: string | null) => void;
  onOpenCreate: () => void;
  onRefresh: () => void;
  selectedFilterId: string;
  onSelectFilter: (id: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_ITEMS: FilterItem[] = [
  { id: 'all', label: 'All Courses' },
  { id: 'active', label: 'Active Courses' },
  { id: 'inactive', label: 'Inactive Courses' },
  { id: 'free', label: 'Free Courses' },
  { id: 'assigned', label: 'Assigned Courses' },
  { id: 'unassigned', label: 'Unassigned Courses' },
];

type SortKey = 'title' | 'code' | 'price' | 'syllabus' | 'createdAt';

// ─── Component ────────────────────────────────────────────────────────────────

export function CatalogListView({
  filteredCourses,
  isLoadingList,
  searchQuery,
  onSearchChange,
  onSelectCourse,
  onOpenCreate,
  onRefresh,
  selectedFilterId,
  onSelectFilter,
  favorites,
  onToggleFavorite,
}: Props) {
  const [sortBy, setSortBy] = useState<SortKey>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(new Set());
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Sorting ──────────────────────────────────────────────────────────────
  const sortedCourses = useMemo<CourseDto[]>(() => {
    return [...filteredCourses].sort((a, b) => {
      let valA: any = sortBy === 'code' ? (a as any).code ?? '' : sortBy === 'syllabus' ? a.syllabus?.length ?? 0 : a[sortBy as keyof CourseDto];
      let valB: any = sortBy === 'code' ? (b as any).code ?? '' : sortBy === 'syllabus' ? b.syllabus?.length ?? 0 : b[sortBy as keyof CourseDto];
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;
      if (typeof valA === 'string') return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [filteredCourses, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedCourses.length / rowsPerPage));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedCourses = useMemo<CourseDto[]>(
    () => sortedCourses.slice((activePage - 1) * rowsPerPage, activePage * rowsPerPage),
    [sortedCourses, activePage, rowsPerPage],
  );

  useEffect(() => { setCurrentPage(1); }, [searchQuery, sortBy, sortOrder, rowsPerPage, selectedFilterId]);

  // ── Selection ─────────────────────────────────────────────────────────────
  const pageCourseIds = useMemo(() => paginatedCourses.map((c) => c.id!).filter(Boolean), [paginatedCourses]);
  const isAllPageSelected = pageCourseIds.length > 0 && pageCourseIds.every((id) => selectedCourseIds.has(id));

  const handleSelectAll = (checked: boolean) => {
    const next = new Set(selectedCourseIds);
    pageCourseIds.forEach((id) => checked ? next.add(id) : next.delete(id));
    setSelectedCourseIds(next);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const next = new Set(selectedCourseIds);
    checked ? next.add(id) : next.delete(id);
    setSelectedCourseIds(next);
  };

  // ── Sort toggle ───────────────────────────────────────────────────────────
  const handleSort = (key: string) => {
    const k = key as SortKey;
    if (sortBy === k) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(k); setSortOrder('asc'); }
  };

  // ── CSV Export ────────────────────────────────────────────────────────────
  const exportToCsv = () => {
    const headers = ['Course ID','Title','Description','Base Price (₹)','Track Code','Syllabus Modules Count','Syllabus Modules List','Assigned Mentors Count','Mentors Detail','Created Time'];
    const toExport = selectedCourseIds.size > 0 ? sortedCourses.filter((c) => c.id && selectedCourseIds.has(c.id)) : sortedCourses;
    const rows = toExport.map((c) => {
      const code = (c as any).code ?? 'GL-LMS-TRACK';
      const mentorsDetail = c.mentors?.map((m: MentorDto) => `${m.name} (${m.email ?? 'no-email'})`).join('; ') ?? '';
      const syllabusList = c.syllabus?.join('; ') ?? '';
      return [c.id ?? '', `"${(c.title ?? '').replace(/"/g, '""')}"`, `"${(c.description ?? '').replace(/"/g, '""')}"`, c.price ?? 0, code, c.syllabus?.length ?? 0, `"${syllabusList}"`, c.mentors?.length ?? 0, `"${mentorsDetail}"`, c.createdAt ?? ''];
    });
    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url; a.download = `courses_catalog_${new Date().toISOString().split('T')[0]}.csv`;
    a.style.visibility = 'hidden'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  // ── Column definitions ────────────────────────────────────────────────────
  const columns: ColumnDef<CourseDto>[] = [
    {
      key: 'title', header: 'Course Title', sortable: true,
      render: (c) => <span className="text-primary font-semibold hover:underline">{c.title}</span>,
    },
    {
      key: 'code', header: 'Track Code', sortable: true,
      render: (c) => <span className="text-muted font-mono">{(c as any).code ?? 'GL-LMS-TRACK'}</span>,
    },
    {
      key: 'price', header: 'Base Price (₹)', sortable: true,
      render: (c) => <span className="font-mono text-foreground">₹{c.price?.toFixed(2) ?? '0.00'}</span>,
    },
    {
      key: 'syllabus', header: 'Syllabus Modules', sortable: true,
      render: (c) => <span className="text-foreground">{c.syllabus?.length ?? 0}</span>,
    },
    {
      key: 'mentors', header: 'Assigned Mentors', sortable: false,
      render: (c) => c.mentors?.length
        ? <span className="text-muted truncate max-w-[200px] block" title={c.mentors.map((m: MentorDto) => m.name).join(', ')}>{c.mentors.map((m: MentorDto) => m.name).join(', ')}</span>
        : <span className="italic text-muted/60">Not Assigned</span>,
    },
  ];

  // ── Overflow action menu ──────────────────────────────────────────────────
  const actionMenu = (
    <>
      <button
        onClick={exportToCsv}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-medium hover:bg-foreground/5 transition-all cursor-pointer w-full"
      >
        <Download className="w-3.5 h-3.5" /> Export CSV
      </button>
      <div className="my-1 border-t border-border-subtle/30" />
      <button
        onClick={() => { setSortBy('createdAt'); setSortOrder('desc'); setSelectedCourseIds(new Set()); onRefresh(); }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-medium hover:bg-foreground/5 transition-all cursor-pointer w-full"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Refresh List
      </button>
    </>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-card-bg">

      {/* ── Shared header ── */}
      <DirectoryHeader
        title="Courses Catalog"
        subtitle="Manage and organize course tracks, pricing, mentors and syllabuses."
        recordCount={filteredCourses.length}
        selectedCount={selectedCourseIds.size}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search catalog..."
        filterItems={FILTER_ITEMS}
        selectedFilterId={selectedFilterId}
        onSelectFilter={onSelectFilter}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
        onNewClick={onOpenCreate}
        actionMenuSlot={actionMenu}
      />

      {/* ── Shared table ── */}
      <DirectoryTable
        data={paginatedCourses}
        columns={columns}
        isLoading={isLoadingList}
        emptyMessage="No courses found in catalog."
        loadingMessage="Loading courses database..."
        selectedIds={selectedCourseIds}
        isAllSelected={isAllPageSelected}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectRow}
        getId={(c) => c.id ?? ''}
        onRowClick={(c) => onSelectCourse(c.id ?? null)}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      {/* ── Shared pagination ── */}
      {sortedCourses.length > 0 && (
        <DirectoryPagination
          totalRecords={sortedCourses.length}
          rowsPerPage={rowsPerPage}
          currentPage={activePage}
          onRowsPerPageChange={(n) => { setRowsPerPage(n); setCurrentPage(1); }}
          onPageChange={setCurrentPage}
        />
      )}

    </div>
  );
}
