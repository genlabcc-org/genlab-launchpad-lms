/**
 * AdminCoursesDashboard — View Layer (Orchestrator)
 *
 * Thin component: calls `useAdminCourses()` and routes to the correct sub-view.
 * Contains NO business logic, NO API calls, and NO direct state manipulation.
 *
 * SOLID:
 *  S — single responsibility: route between views.
 *  D — depends on hook abstraction, not on concrete API or data modules.
 */
import { useAdminCourses } from '../../hooks/useAdminCourses';
import { CatalogListView } from './courses/CatalogListView';
import { CourseDetailView } from './courses/CourseDetailView';
import { CourseFormView } from './courses/CourseFormView';

export function AdminCoursesDashboard() {
  const courses = useAdminCourses();

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">

      {courses.view === 'create' ? (
        /* ── 3. Full-page create form ── */
        <CourseFormView
          form={courses.form}
          mentors={courses.mentors}
          isSaving={courses.isSaving}
          message={courses.message}
          onSetTitle={(v) => courses.setFormField('title', v)}
          onSetDescription={(v) => courses.setFormField('description', v)}
          onSetPrice={(v) => courses.setFormField('price', v)}
          onToggleMentor={courses.handleToggleMentor}
          onAddSyllabusItem={courses.handleAddSyllabusItem}
          onUpdateSyllabusItem={courses.handleUpdateSyllabusItem}
          onRemoveSyllabusItem={courses.handleRemoveSyllabusItem}
          onToggleActive={(v) => courses.setFormField('isActive', v)}
          onSubmit={courses.handleCreateCourse}
          onCancel={courses.closeCreateView}
        />
      ) : courses.selectedCourseId === null ? (
        /* ── 1. Full-width catalog directory table ── */
        <CatalogListView
          filteredCourses={courses.filteredCourses}
          isLoadingList={courses.isLoadingList}
          searchQuery={courses.searchQuery}
          onSearchChange={courses.setSearchQuery}
          onSelectCourse={courses.selectCourse}
          onOpenCreate={courses.openCreateView}
          onRefresh={courses.loadCourses}
          selectedFilterId={courses.selectedFilterId}
          onSelectFilter={courses.setSelectedFilterId}
          favorites={courses.favorites}
          onToggleFavorite={courses.toggleFavorite}
        />
      ) : (
        /* ── 2. Master-detail split screen ── */
        <CourseDetailView
          filteredCourses={courses.filteredCourses}
          selectedCourseId={courses.selectedCourseId}
          selectedCourse={courses.selectedCourse}
          mentors={courses.mentors}
          form={courses.form}
          isLoadingDetails={courses.isLoadingDetails}
          isSaving={courses.isSaving}
          message={courses.message}
          isEditing={courses.isEditing}
          searchQuery={courses.searchQuery}
          onSearchChange={courses.setSearchQuery}
          onSelectCourse={courses.selectCourse}
          onOpenCreate={courses.openCreateView}
          onStartEdit={courses.handleStartEdit}
          onCancelEdit={courses.handleCancelEdit}
          onSaveChanges={courses.handleSaveChanges}
          onDeleteCourse={courses.handleDeleteCourse}
          onSetTitle={(v) => courses.setFormField('title', v)}
          onSetDescription={(v) => courses.setFormField('description', v)}
          onSetPrice={(v) => courses.setFormField('price', v)}
          onToggleMentor={courses.handleToggleMentor}
          onAddSyllabusItem={courses.handleAddSyllabusItem}
          onUpdateSyllabusItem={courses.handleUpdateSyllabusItem}
          onRemoveSyllabusItem={courses.handleRemoveSyllabusItem}
          onToggleActive={(v) => courses.setFormField('isActive', v)}
        />
      )}

    </div>
  );
}

export default AdminCoursesDashboard;
