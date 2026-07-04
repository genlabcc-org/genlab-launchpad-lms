import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  Calendar,
  CreditCard,
  Trash2,
  FileText,
  Search,
  BookOpen,
  Mail,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import type { PaymentDto } from '../../../api/types';
import type { PaymentResolvedInfo } from '../../../hooks/useAdminPayments';

interface PaymentDetailViewProps {
  filteredPayments: PaymentDto[];
  selectedPaymentId: string;
  selectedPayment: PaymentDto | null;
  getPaymentInfo: (p: PaymentDto) => PaymentResolvedInfo;
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectPayment: (id: string | null) => void;
  onOpenCreate: () => void;
  onDeletePayment: (id: string) => Promise<void>;
}

export const PaymentDetailView: React.FC<PaymentDetailViewProps> = ({
  filteredPayments,
  selectedPaymentId,
  selectedPayment,
  getPaymentInfo,
  isLoading,
  searchQuery,
  onSearchChange,
  onSelectPayment,
  onOpenCreate,
  onDeletePayment,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedInfo = selectedPayment ? getPaymentInfo(selectedPayment) : null;

  const formatCurrency = (amt?: number) => {
    return `₹${(amt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
      case undefined:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      case 'failed':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
      case 'refunded':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/25';
      default:
        return 'bg-muted/10 text-muted border-border-subtle';
    }
  };

  const handleDelete = async () => {
    if (!selectedPayment?.id) return;
    setIsDeleting(true);
    try {
      await onDeletePayment(selectedPayment.id);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
      {/* Left Column: Selectable List */}
      <div className="w-full md:w-80 lg:w-96 border-r border-border-subtle/60 flex flex-col bg-background/30 shrink-0">
        {/* Header & Search */}
        <div className="p-4 border-b border-border-subtle/60 space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onSelectPayment(null)}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Full List</span>
            </button>
            <button
              onClick={onOpenCreate}
              className="px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary-hover transition cursor-pointer"
            >
              + Record
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student, course..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border-subtle rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Scrollable Transaction List */}
        <div className="flex-1 overflow-y-auto divide-y divide-border-subtle/30">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-muted">Loading payments...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted">No transactions match search.</div>
          ) : (
            filteredPayments.map((p) => {
              const info = getPaymentInfo(p);
              const isSelected = p.id === selectedPaymentId;

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setConfirmDelete(false);
                    onSelectPayment(p.id!);
                  }}
                  className={`p-3.5 cursor-pointer transition-colors space-y-1.5 ${
                    isSelected ? 'bg-primary/10 border-l-4 border-primary' : 'hover:bg-primary/5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-foreground truncate">
                      {info.studentName}
                    </span>
                    <span className="font-bold text-xs text-emerald-400 shrink-0">
                      {formatCurrency(p.amount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-muted font-medium truncate">
                    <BookOpen className="w-3 h-3 text-primary shrink-0" />
                    <span className="truncate">{info.courseTitle}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted pt-0.5">
                    <span className="capitalize">{p.paymentMethod || 'UPI'}</span>
                    <span className="font-mono">{p.paymentDate || '—'}</span>
                  </div>

                  {p.nextDueDate && (
                    <div className="text-[10px] text-amber-400 font-mono flex items-center justify-between pt-0.5 border-t border-border-subtle/20">
                      <span>Due: {p.nextDueDate}</span>
                      {p.nextDueAmount ? <span>({formatCurrency(p.nextDueAmount)})</span> : null}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Detailed Transaction View */}
      <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6 bg-background">
        {!selectedPayment || !selectedInfo ? (
          <div className="m-auto text-center space-y-2 py-16">
            <CreditCard className="w-12 h-12 text-muted/30 mx-auto" />
            <h3 className="text-sm font-semibold text-foreground">No Payment Selected</h3>
            <p className="text-xs text-muted max-w-xs mx-auto">
              Select a payment record from the left sidebar to view student receipt details.
            </p>
          </div>
        ) : (
          <>
            {/* Header Banner */}
            <div className="p-6 bg-card-bg border border-border-subtle rounded-3xl flex flex-wrap gap-4 items-center justify-between shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted">Receipt ID: {selectedPayment.id || '—'}</span>
                  <span className={`px-2.5 py-0.5 rounded-lg border font-semibold text-[10px] uppercase tracking-wider ${getStatusBadge(selectedPayment.status)}`}>
                    {selectedPayment.status || 'completed'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  {formatCurrency(selectedPayment.amount)}
                </h2>
                <p className="text-xs text-muted">
                  Recorded on <span className="font-mono text-foreground">{selectedPayment.paymentDate || 'N/A'}</span> via <span className="uppercase font-semibold text-foreground">{selectedPayment.paymentMethod || 'UPI'}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" /> Verified Ledger Entry
                </span>
              </div>
            </div>

            {/* Content Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Student Metadata Card */}
              <div className="p-5 bg-card-bg border border-border-subtle rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center gap-2 border-b border-border-subtle/50 pb-2">
                  <User className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Student Details</h3>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-muted block text-[10px] uppercase tracking-wider font-bold">Student Name</span>
                    <span className="font-bold text-foreground text-sm">{selectedInfo.studentName}</span>
                  </div>

                  <div>
                    <span className="text-muted block text-[10px] uppercase tracking-wider font-bold">Email Address</span>
                    <div className="flex items-center gap-1.5 text-foreground font-mono mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-muted shrink-0" />
                      <span>{selectedInfo.studentEmail}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-muted block text-[10px] uppercase tracking-wider font-bold">Enrolled Course</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-xl font-bold text-xs flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        {selectedInfo.courseTitle}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="text-muted block text-[10px] uppercase tracking-wider font-bold">Enrollment ID</span>
                    <span className="text-foreground font-mono text-[11px] block">{selectedPayment.enrollmentId || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Next Due Date Highlight Card */}
              <div className="p-5 bg-card-bg border border-border-subtle rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center gap-2 border-b border-border-subtle/50 pb-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Upcoming Schedule Dues</h3>
                </div>

                {selectedPayment.nextDueDate ? (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Next Installment Due Date</span>
                    <span className="text-lg font-bold text-amber-300 block font-mono">{selectedPayment.nextDueDate}</span>
                    {selectedPayment.nextDueAmount ? (
                      <span className="text-xs text-amber-200/80 block">
                        Installment Amount: <strong className="text-foreground">{formatCurrency(selectedPayment.nextDueAmount)}</strong>
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-muted italic">
                    No next due date scheduled for this payment receipt.
                  </div>
                )}
              </div>

              {/* Transaction Reference & Remarks */}
              <div className="p-5 bg-card-bg border border-border-subtle rounded-2xl space-y-3 md:col-span-2 shadow-xs">
                <div className="flex items-center gap-2 border-b border-border-subtle/50 pb-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Reference & Notes</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted block text-[10px] uppercase tracking-wider font-bold">Transaction Reference / UTR</span>
                    <span className="font-mono font-bold text-foreground">{selectedPayment.transactionReference || 'N/A'}</span>
                  </div>

                  <div>
                    <span className="text-muted block text-[10px] uppercase tracking-wider font-bold">Payment Method</span>
                    <span className="uppercase font-semibold text-foreground">{selectedPayment.paymentMethod || 'UPI'}</span>
                  </div>

                  <div className="md:col-span-2">
                    <span className="text-muted block text-[10px] uppercase tracking-wider font-bold">Administrative Remarks</span>
                    <p className="text-foreground/90 text-xs mt-1 bg-background/50 p-3 rounded-xl border border-border-subtle/40">
                      {selectedPayment.notes || 'No notes added for this payment.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── DANGER ZONE CARD ────────────────────────────────────────── */}
              <div className="p-5 bg-rose-500/5 border border-rose-500/25 rounded-2xl space-y-4 md:col-span-2 shadow-xs">
                <div className="flex items-center justify-between border-b border-rose-500/20 pb-2.5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider">Danger Zone</h3>
                  </div>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full uppercase tracking-wider">
                    Destructive Action
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-0.5 max-w-xl">
                    <h4 className="text-xs font-bold text-foreground">Permanently Delete Payment Receipt</h4>
                    <p className="text-[11px] text-muted leading-relaxed">
                      Once deleted, this transaction record will be permanently purged from the ledger. Corresponding student dues and fee status will be recalculated immediately.
                    </p>
                  </div>

                  {!confirmDelete ? (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 font-semibold text-xs rounded-xl transition cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Payment Record
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 animate-in fade-in duration-200">
                      <span className="text-[11px] font-bold text-rose-400">Confirm Deletion?</span>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                      >
                        {isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="px-3 py-1.5 bg-background border border-border-subtle hover:border-border-subtle/80 text-foreground text-xs font-medium rounded-xl transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentDetailView;
