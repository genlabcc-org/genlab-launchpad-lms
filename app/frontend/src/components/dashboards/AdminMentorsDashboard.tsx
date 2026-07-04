/**
 * AdminMentorsDashboard — Top-level orchestrator
 *
 * Thin shell that routes between MentorListView, MentorDetailView, and
 * MentorFormView driven by `useAdminMentors` state.
 *
 * SOLID S: orchestrates routing only, zero UI logic.
 * SOLID D: depends on hook interface, not on adminApi.
 */
import { useAdminMentors } from '../../hooks/useAdminMentors';
import { MentorListView } from './mentors/MentorListView';
import { MentorDetailView } from './mentors/MentorDetailView';
import { MentorFormView } from './mentors/MentorFormView';

export function AdminMentorsDashboard() {
  const m = useAdminMentors();

  // ── Form view ─────────────────────────────────────────────────────────────
  if (m.view === 'create') {
    return (
      <MentorFormView
        form={m.form}
        setFormField={m.setFormField}
        isSaving={m.isSaving}
        message={m.message}
        onSubmit={m.handleCreateMentor}
        onCancel={m.closeCreateView}
      />
    );
  }

  // ── Detail view ───────────────────────────────────────────────────────────
  if (m.selectedMentorId) {
    return (
      <MentorDetailView
        filteredMentors={m.filteredMentors}
        selectedMentorId={m.selectedMentorId}
        selectedMentor={m.selectedMentor}
        schedules={m.selectedMentorSchedules}
        isLoadingSchedules={m.isLoadingSchedules}
        courses={m.courses}
        form={m.form}
        setFormField={m.setFormField}
        message={m.message}
        isLoading={m.isLoading}
        isSaving={m.isSaving}
        isEditing={m.isEditing}
        searchQuery={m.searchQuery}
        onSearchChange={m.setSearchQuery}
        onSelectMentor={m.selectMentor}
        onOpenCreate={m.openCreateView}
        onDeleteMentor={m.handleDeleteMentor}
        onStartEdit={m.handleStartEdit}
        onCancelEdit={m.handleCancelEdit}
        onSaveChanges={m.handleSaveChanges}
      />
    );
  }

  // ── List view (default) ───────────────────────────────────────────────────
  return (
    <MentorListView
      filteredMentors={m.filteredMentors}
      isLoading={m.isLoading}
      searchQuery={m.searchQuery}
      onSearchChange={m.setSearchQuery}
      selectedFilterId={m.selectedFilterId}
      onSelectFilter={m.setSelectedFilterId}
      selectedMentorId={m.selectedMentorId}
      onSelectMentor={m.selectMentor}
      onOpenCreate={m.openCreateView}
      onRefresh={m.loadMentors}
    />
  );
}

export default AdminMentorsDashboard;
