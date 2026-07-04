import React, { useState } from 'react';
import {
  Plus,
  CreditCard,
  DollarSign,
  AlertCircle,
  Search,
  RefreshCw,
  Calendar,
  User,
  Sparkles,
  ArrowDownCircle,
  ArrowUpRight,
  TrendingUp,
  BarChart3,
  ChevronDown,
  ChevronUp,
  BookOpen,
  AlertTriangle,
  X,
} from 'lucide-react';
import type { PaymentDto } from '../../../api/types';
import type { PaymentStats, PaymentResolvedInfo } from '../../../hooks/useAdminPayments';

interface PaymentListViewProps {
  filteredPayments: PaymentDto[];
  getPaymentInfo: (p: PaymentDto) => PaymentResolvedInfo;
  stats: PaymentStats;
  isLoading: boolean;
  searchQuery: string;
  statusFilter: string;
  methodFilter: string;
  showStats: boolean;
  selectedPaymentId: string | null;
  onSearchChange: (q: string) => void;
  onStatusFilterChange: (s: string) => void;
  onMethodFilterChange: (m: string) => void;
  onToggleStats: () => void;
  onSelectPayment: (id: string | null) => void;
  onOpenCreate: () => void;
  onRefresh: () => Promise<void>;
  onDeletePayment: (id: string) => Promise<void>;
}

export const PaymentListView: React.FC<PaymentListViewProps> = ({
  filteredPayments,
  getPaymentInfo,
  stats,
  isLoading,
  searchQuery,
  statusFilter,
  methodFilter,
  showStats,
  selectedPaymentId,
  onSearchChange,
  onStatusFilterChange,
  onMethodFilterChange,
  onToggleStats,
  onSelectPayment,
  onOpenCreate,
  onRefresh,
  onDeletePayment,
}) => {
  const [deleteTarget, setDeleteTarget] = useState<PaymentDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatCurrency = (amt?: number) => {
    return `₹${(amt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getMethodBadge = (method?: string) => {
    switch (method) {
      case 'upi':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'bank transfer':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'card':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'cash':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-muted/10 text-muted border-muted/20';
    }
  };


  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setIsDeleting(true);
    try {
      await onDeletePayment(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const targetInfo = deleteTarget ? getPaymentInfo(deleteTarget) : null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Pinned Control Bar */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border-subtle/60 bg-background/50 backdrop-blur-md shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground">Student Payment Ledger</h2>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 rounded-full">
              {stats.totalCount} {stats.totalCount === 1 ? 'Record' : 'Records'}
            </span>
          </div>
          <p className="text-xs text-muted mt-0.5">Comprehensive history of fee payments, student dues, and receipts sorted by nearest due date.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Option for Stats Toggle Button */}
          <button
            onClick={onToggleStats}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-semibold transition cursor-pointer ${
              showStats
                ? 'bg-primary/10 text-primary border-primary/25'
                : 'bg-background text-muted border-border-subtle hover:text-foreground'
            }`}
            title="Toggle Financial Stats Overview"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Stats</span>
            {showStats ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
          </button>

          <button
            onClick={onRefresh}
            title="Refresh Transactions"
            className="p-2 bg-background border border-border-subtle hover:border-border-subtle/80 text-foreground rounded-xl text-xs transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary-hover shadow-xs transition-all text-xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Record Payment
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Toggleable Financial KPI Stats Overview */}
        {showStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
            <div className="p-4 bg-card-bg border border-border-subtle/70 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Total Revenue</span>
                <span className="text-xl font-bold text-foreground mt-1 block">
                  {formatCurrency(stats.totalCollected)}
                </span>
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
                  <ArrowDownCircle className="w-3 h-3" /> {stats.completedCount} Completed
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-card-bg border border-border-subtle/70 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Pending Installments</span>
                <span className="text-xl font-bold text-foreground mt-1 block">
                  {formatCurrency(stats.totalPendingAmount)}
                </span>
                <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" /> {stats.pendingCount} Pending Dues
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-card-bg border border-border-subtle/70 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Avg. Ticket Size</span>
                <span className="text-xl font-bold text-foreground mt-1 block">
                  {formatCurrency(stats.averageTransaction)}
                </span>
                <span className="text-[10px] text-primary font-medium flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" /> Per Student Receipt
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-card-bg border border-border-subtle/70 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Recorded Ledger</span>
                <span className="text-xl font-bold text-foreground mt-1 block">
                  {stats.totalCount} Transactions
                </span>
                <span className="text-[10px] text-indigo-400 font-medium flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3" /> Nearest Due First
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="p-4 bg-card-bg border border-border-subtle/60 rounded-2xl flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student name, email, course, UTR reference, or notes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-border-subtle rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="py-1.5 px-3 text-xs bg-background border border-border-subtle rounded-xl text-foreground focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            <select
              value={methodFilter}
              onChange={(e) => onMethodFilterChange(e.target.value)}
              className="py-1.5 px-3 text-xs bg-background border border-border-subtle rounded-xl text-foreground focus:outline-none"
            >
              <option value="all">All Methods</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="bank transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Payment Ledger Data Table */}
        <div className="bg-card-bg border border-border-subtle/60 rounded-2xl overflow-hidden shadow-xs">
          {isLoading ? (
            <div className="py-16 text-center text-xs text-muted font-medium">
              Loading payment transactions...
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="py-16 px-6 text-center space-y-2">
              <CreditCard className="w-10 h-10 text-muted/40 mx-auto" />
              <h3 className="text-sm font-semibold text-foreground">No Payment Records Found</h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                No payment transactions match your search criteria. Click "Record Payment" to add a new student transaction.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-medium">
                <thead>
                  <tr className="border-b border-border-subtle/40 bg-background/40 text-muted text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-4 font-bold">Student Name</th>
                    <th className="py-3 px-4 font-bold">Enrolled Course</th>
                    <th className="py-3 px-4 font-bold">Amount Paid</th>
                    <th className="py-3 px-4 font-bold">Method</th>
                    <th className="py-3 px-4 font-bold">Payment Date</th>
                    <th className="py-3 px-4 font-bold">Next Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/25">
                  {filteredPayments.map((p) => {
                    const info = getPaymentInfo(p);
                    const isSelected = selectedPaymentId === p.id;

                    return (
                      <tr
                        key={p.id}
                        onClick={() => onSelectPayment(p.id!)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/10' : 'hover:bg-primary/5'
                        }`}
                      >
                        {/* Student Column */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <span className="font-bold text-foreground block truncate">
                                {info.studentName}
                              </span>
                              <span className="text-[10px] text-muted block truncate font-mono">
                                {info.studentEmail}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Enrolled Course Column */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-foreground font-semibold">
                            <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="truncate max-w-[180px]">{info.courseTitle}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-bold text-foreground text-sm">
                            {formatCurrency(p.amount)}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-lg border font-semibold text-[10px] uppercase tracking-wider inline-block ${getMethodBadge(p.paymentMethod)}`}>
                            {p.paymentMethod || 'other'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-muted font-mono text-[11px]">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-muted/60" />
                            <span>{p.paymentDate || '—'}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px]">
                          {p.nextDueDate ? (
                            <div>
                              <span className="font-bold text-amber-400 block">{p.nextDueDate}</span>
                              {p.nextDueAmount ? (
                                <span className="text-[10px] text-muted block">{formatCurrency(p.nextDueAmount)} due</span>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-muted/50 text-[10px] italic">No due date</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* DANGER ZONE CONFIRMATION MODAL */}
      {deleteTarget && targetInfo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card-bg border border-rose-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                <h3 className="text-sm font-bold text-rose-500 uppercase tracking-wider">Danger Zone: Confirm Deletion</h3>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="p-1 rounded-lg text-muted hover:text-foreground transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Target Payment Receipt</span>
                <span className="font-bold text-foreground block">{targetInfo.studentName} — {formatCurrency(deleteTarget.amount)}</span>
                <span className="text-muted block text-[11px] font-mono">Course: {targetInfo.courseTitle}</span>
              </div>

              <p className="text-muted text-[11px] leading-relaxed">
                Deleting this payment record will permanently purge it from the fee ledger. Student dues will be recalculated immediately. This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-border-subtle/50">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="py-2 px-4 bg-background border border-border-subtle hover:border-border-subtle/80 text-foreground font-medium rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="py-2 px-5 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700 transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentListView;
