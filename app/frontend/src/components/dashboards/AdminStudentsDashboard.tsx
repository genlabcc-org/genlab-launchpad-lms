/**
 * AdminStudentsDashboard — Top-level orchestrator
 *
 * Thin shell that:
 *  1. Calls `useAdminStudents` for all state and actions.
 *  2. Routes to StudentListView, StudentDetailView, or StudentFormView.
 *
 * No JSX data manipulation — the hook owns state, views own rendering.
 *
 * SOLID S: orchestrates routing between views, zero UI logic.
 * SOLID D: depends on the hook interface, not on adminApi directly.
 */
import { useAdminStudents } from '../../hooks/useAdminStudents';
import { StudentListView } from './students/StudentListView';
import { StudentDetailView } from './students/StudentDetailView';
import { StudentFormView } from './students/StudentFormView';

export function AdminStudentsDashboard() {
  const s = useAdminStudents();

  // ── Form view ─────────────────────────────────────────────────────────────
  if (s.view === 'create') {
    return (
      <StudentFormView
        form={s.form}
        courses={s.courses}
        setFormField={s.setFormField}
        isSaving={s.isSaving}
        message={s.message}
        onSubmit={s.handleCreateStudent}
        onCancel={s.closeCreateView}
      />
    );
  }

  // ── Detail view ───────────────────────────────────────────────────────────
  if (s.selectedStudentId) {
    return (
      <StudentDetailView
        filteredStudents={s.filteredStudents}
        selectedStudentId={s.selectedStudentId}
        selectedStudent={s.selectedStudent}
        mentors={s.mentors}
        courses={s.courses}
        enrollments={s.enrollments}
        form={s.form}
        setFormField={s.setFormField}
        message={s.message}
        isLoading={s.isLoading}
        isSaving={s.isSaving}
        isEditing={s.isEditing}
        searchQuery={s.searchQuery}
        onSearchChange={s.setSearchQuery}
        onSelectStudent={s.selectStudent}
        onOpenCreate={s.openCreateView}
        onDeleteStudent={s.handleDeleteStudent}
        onDeleteEnrollment={s.handleDeleteEnrollment}
        onStartEdit={s.handleStartEdit}
        onCancelEdit={s.handleCancelEdit}
        onSaveChanges={s.handleSaveChanges}
      />
    );
  }

  // ── List view (default) ───────────────────────────────────────────────────
  return (
    <StudentListView
      filteredStudents={s.filteredStudents}
      isLoading={s.isLoading}
      searchQuery={s.searchQuery}
      onSearchChange={s.setSearchQuery}
      selectedFilterId={s.selectedFilterId}
      onSelectFilter={s.setSelectedFilterId}
      selectedStudentId={s.selectedStudentId}
      onSelectStudent={s.selectStudent}
      onOpenCreate={s.openCreateView}
      onRefresh={s.loadStudents}
      enrollments={s.enrollments}
    />
  );
}

export default AdminStudentsDashboard;
