import React from 'react';
import { ArrowLeft, Sparkles, DollarSign, Calendar, CreditCard, User, FileText, Clock } from 'lucide-react';
import type { PaymentFormState } from '../../../hooks/useAdminPayments';
import type { StudentDto } from '../../../api/types';
import type { StatusMessage } from '../shared/directory/shared';

interface PaymentFormViewProps {
  form: PaymentFormState;
  students: StudentDto[];
  isSaving: boolean;
  message: StatusMessage;
  setFormField: <K extends keyof PaymentFormState>(key: K, value: PaymentFormState[K]) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
}

export const PaymentFormView: React.FC<PaymentFormViewProps> = ({
  form,
  students,
  isSaving,
  message,
  setFormField,
  onSubmit,
  onCancel,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl bg-background border border-border-subtle hover:border-border-subtle/80 text-foreground transition cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">Record Student Fee Payment</h2>
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs text-muted mt-0.5">Record offline or digital fee transactions and update student dues.</p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold ${
          message.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
            : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
        }`}>
          {message.text}
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={onSubmit} className="bg-card-bg border border-border-subtle rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-muted uppercase tracking-wider border-b border-border-subtle/50 pb-2">
            1. Student & Transaction Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student Selector */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" />
                Select Student / Enrollment
              </label>
              <select
                value={form.enrollmentId}
                onChange={(e) => setFormField('enrollmentId', e.target.value)}
                className="w-full py-2.5 px-3 bg-background border border-border-subtle rounded-xl text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                <option value="">-- Direct / Unassigned Student Payment --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Amount Received (₹) <span className="text-rose-500 font-bold ml-0.5">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 15000"
                value={form.amount}
                onChange={(e) => setFormField('amount', e.target.value)}
                className="w-full py-2.5 px-3 bg-background border border-border-subtle rounded-xl text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                required
              />
            </div>

            {/* Payment Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                Payment Date <span className="text-rose-500 font-bold ml-0.5">*</span>
              </label>
              <input
                type="date"
                value={form.paymentDate}
                onChange={(e) => setFormField('paymentDate', e.target.value)}
                className="w-full py-2.5 px-3 bg-background border border-border-subtle rounded-xl text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                required
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-violet-400" />
                Payment Method <span className="text-rose-500 font-bold ml-0.5">*</span>
              </label>
              <select
                value={form.paymentMethod}
                onChange={(e) => setFormField('paymentMethod', e.target.value as any)}
                className="w-full py-2.5 px-3 bg-background border border-border-subtle rounded-xl text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                required
              >
                <option value="upi">UPI / GPay / PhonePe</option>
                <option value="card">Credit / Debit Card</option>
                <option value="bank transfer">Bank Transfer (IMPS/NEFT)</option>
                <option value="cash">Cash Collection</option>
                <option value="other">Other Payment Method</option>
              </select>
            </div>

            {/* Payment Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Transaction Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setFormField('status', e.target.value as any)}
                className="w-full py-2.5 px-3 bg-background border border-border-subtle rounded-xl text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                <option value="completed">Completed / Received</option>
                <option value="pending">Pending Confirmation</option>
                <option value="failed">Failed / Declined</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Schedule Dues */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider border-b border-border-subtle/50 pb-2">
            2. Next Installment Dues (Optional)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Next Due Date
              </label>
              <input
                type="date"
                value={form.nextDueDate}
                onChange={(e) => setFormField('nextDueDate', e.target.value)}
                className="w-full py-2.5 px-3 bg-background border border-border-subtle rounded-xl text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                Next Due Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 299"
                value={form.nextDueAmount}
                onChange={(e) => setFormField('nextDueAmount', e.target.value)}
                className="w-full py-2.5 px-3 bg-background border border-border-subtle rounded-xl text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              />
            </div>
          </div>
        </div>

        {/* References & Remarks */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-muted uppercase tracking-wider border-b border-border-subtle/50 pb-2">
            3. References & Remarks
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-muted" />
                Transaction Reference / UTR Number
              </label>
              <input
                type="text"
                placeholder="e.g. UTR89123456 or Receipt #104"
                value={form.transactionReference}
                onChange={(e) => setFormField('transactionReference', e.target.value)}
                className="w-full py-2.5 px-3 bg-background border border-border-subtle rounded-xl text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Remarks / Payment Notes</label>
              <textarea
                placeholder="Add any internal administrative notes regarding this fee transaction..."
                value={form.notes}
                onChange={(e) => setFormField('notes', e.target.value)}
                className="w-full py-2.5 px-3 bg-background border border-border-subtle rounded-xl text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 h-24 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
          <button
            type="button"
            onClick={onCancel}
            className="py-2.5 px-5 bg-background border border-border-subtle hover:border-border-subtle/80 text-foreground font-medium rounded-xl text-xs transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="py-2.5 px-6 bg-primary text-primary-foreground font-semibold rounded-xl text-xs hover:bg-primary/90 transition cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isSaving ? 'Saving Transaction...' : 'Record Payment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentFormView;
