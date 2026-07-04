/**
 * AdminPaymentsDashboard — Top-level orchestrator for Payments
 *
 * Thin shell component that:
 *  1. Calls `useAdminPayments` for all state, sorting, and actions.
 *  2. Routes to PaymentListView, PaymentDetailView, or PaymentFormView based on hook state.
 *
 * SOLID S: orchestrates routing between views, zero UI logic.
 * SOLID D: depends on the hook interface, not directly on API calls.
 */
import { useAdminPayments } from '../../hooks/useAdminPayments';
import { PaymentListView } from './payments/PaymentListView';
import { PaymentDetailView } from './payments/PaymentDetailView';
import { PaymentFormView } from './payments/PaymentFormView';

export function AdminPaymentsDashboard() {
  const p = useAdminPayments();

  // ── 1. Create / Record Form View ──────────────────────────────────────────
  if (p.view === 'create') {
    return (
      <PaymentFormView
        form={p.form}
        students={p.students}
        isSaving={p.isSaving}
        message={p.message}
        setFormField={p.setFormField}
        onSubmit={p.handleRecordPayment}
        onCancel={p.closeCreateView}
      />
    );
  }

  // ── 2. Master-Detail Split Screen View ────────────────────────────────────
  if (p.selectedPaymentId) {
    return (
      <PaymentDetailView
        filteredPayments={p.filteredPayments}
        selectedPaymentId={p.selectedPaymentId}
        selectedPayment={p.selectedPayment}
        getPaymentInfo={p.getPaymentInfo}
        isLoading={p.isLoading}
        searchQuery={p.searchQuery}
        onSearchChange={p.setSearchQuery}
        onSelectPayment={p.selectPayment}
        onOpenCreate={p.openCreateView}
        onDeletePayment={p.handleDeletePayment}
      />
    );
  }

  // ── 3. List View (Default with Option for Stats) ─────────────────────────
  return (
    <PaymentListView
      filteredPayments={p.filteredPayments}
      getPaymentInfo={p.getPaymentInfo}
      stats={p.stats}
      isLoading={p.isLoading}
      searchQuery={p.searchQuery}
      statusFilter={p.statusFilter}
      methodFilter={p.methodFilter}
      showStats={p.showStats}
      selectedPaymentId={p.selectedPaymentId}
      onSearchChange={p.setSearchQuery}
      onStatusFilterChange={p.setStatusFilter}
      onMethodFilterChange={p.setMethodFilter}
      onToggleStats={() => p.setShowStats((prev) => !prev)}
      onSelectPayment={p.selectPayment}
      onOpenCreate={p.openCreateView}
      onRefresh={p.loadData}
      onDeletePayment={p.handleDeletePayment}
    />
  );
}

export default AdminPaymentsDashboard;
