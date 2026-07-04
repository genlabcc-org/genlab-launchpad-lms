import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, Calendar, FileText, AlertCircle, Save, X, RefreshCw } from 'lucide-react';
import adminApi from '../../api/admin';
import type { BatchDto } from '../../api/types';

export function AdminBatchesDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [batches, setBatches] = useState<BatchDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<BatchDto | null>(null);
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formCutoffDate, setFormCutoffDate] = useState('');

  const loadBatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAllBatches();
      setBatches(data);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
    if (searchParams.get('create') === 'true') {
      handleOpenCreate();
      setSearchParams({}, { replace: true });
    }
  }, []);

  // Auto-generate Batch ID from Display Name
  useEffect(() => {
    if (!editingBatch && formName) {
      const normalized = formName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s_]/g, '') // remove special chars
        .replace(/\s+/g, '_'); // spaces to underscores
      setFormId(normalized);
    }
  }, [formName, editingBatch]);

  const handleOpenCreate = () => {
    setEditingBatch(null);
    setFormId('');
    setFormName('');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormCutoffDate(new Date().toISOString().split('T')[0]);
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (batch: BatchDto) => {
    setEditingBatch(batch);
    setFormId(batch.id);
    setFormName(batch.name);
    setFormStartDate(batch.startDate);
    setFormCutoffDate(batch.cutoffDate || '');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formId || !formName || !formStartDate || !formCutoffDate) {
      setError('All fields are required');
      return;
    }

    // Validate ID format: YYYY_month_batch_N
    const idRegex = /^[0-9]{4}_[a-z]+_batch_[0-9]+$/;
    if (!idRegex.test(formId)) {
      setError('Batch ID must be in format YYYY_month_batch_N (e.g. 2026_july_batch_1)');
      return;
    }

    try {
      if (editingBatch) {
        // Update batch (excluding ID)
        await adminApi.updateBatch(editingBatch.id, {
          name: formName,
          startDate: formStartDate,
          cutoffDate: formCutoffDate,
        });
        setSuccess('Batch updated successfully!');
      } else {
        // Create batch
        await adminApi.createBatch({
          id: formId,
          name: formName,
          startDate: formStartDate,
          cutoffDate: formCutoffDate,
        });
        setSuccess('Batch created successfully!');
      }
      setIsModalOpen(false);
      loadBatches();
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to save batch');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete batch "${id}"?`)) {
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      await adminApi.deleteBatch(id);
      setSuccess('Batch deleted successfully!');
      loadBatches();
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to delete batch');
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Title block */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Intake Batches & Operation Limits</h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage student intake batches, schedules, and active registration cutoff bounds.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadBatches}
            className="p-2 border border-border-subtle bg-slate-800/10 rounded-xl hover:bg-slate-800/25 transition cursor-pointer text-muted hover:text-foreground"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl text-xs shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Intake Batch
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-xs font-semibold animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs font-semibold animate-in fade-in duration-200">
          {success}
        </div>
      )}

      {/* Grid of Batches */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Fetching active intake schedules...</span>
        </div>
      ) : batches.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-border-subtle/50 rounded-3xl py-20 px-4 text-center bg-card-bg/10">
          <Calendar className="w-12 h-12 text-slate-600 mb-4" />
          <h3 className="text-sm font-semibold text-foreground mb-1">No Intake Batches Created</h3>
          <p className="text-xs text-slate-500 max-w-sm font-medium mb-6">
            You must define at least one intake batch with cutoff dates before onboarding students or bulk assigning mentor slots.
          </p>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl text-xs shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Initialize First Batch
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch) => {
            const isCutoffPassed = batch.cutoffDate ? new Date() > new Date(batch.cutoffDate) : false;
            return (
              <div
                key={batch.id}
                className="group flex flex-col justify-between p-5 rounded-2xl border border-border-subtle/70 bg-card-bg/40 backdrop-blur-md hover:border-primary/40 hover:bg-card-bg/60 transition-all duration-300 shadow-sm relative overflow-hidden"
              >
                {/* Visual indicator bar */}
                <div
                  className={`absolute top-0 left-0 w-full h-[3px] transition-colors ${
                    isCutoffPassed ? 'bg-amber-500/80' : 'bg-primary'
                  }`}
                />

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-foreground text-sm tracking-tight">{batch.name}</h4>
                      <code className="text-[10px] text-primary font-semibold select-all mt-0.5 block bg-primary/5 border border-primary/10 rounded px-1.5 py-0.5 w-fit uppercase font-mono">
                        {batch.id}
                      </code>
                    </div>
                    <span
                      className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                        isCutoffPassed
                          ? 'border-amber-500/20 bg-amber-500/10 text-amber-500'
                          : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
                      }`}
                    >
                      {isCutoffPassed ? 'Cutoff Passed' : 'Active Intake'}
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-1 text-xs font-semibold text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Starts: <span className="text-foreground">{batch.startDate}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Cutoff: <span className="text-foreground">{batch.cutoffDate || 'N/A'}</span></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5 mt-5 pt-3.5 border-t border-border-subtle/30 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEdit(batch)}
                    className="p-1.5 hover:bg-slate-800/40 rounded-lg text-slate-400 hover:text-foreground cursor-pointer transition"
                    title="Edit batch"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(batch.id)}
                    className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 cursor-pointer transition"
                    title="Delete batch"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Save / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card-bg border border-border-subtle rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-border-subtle/60">
              <h3 className="text-sm font-bold tracking-tight text-foreground uppercase">
                {editingBatch ? 'Edit Batch Details' : 'Create New Intake Batch'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-foreground rounded-lg cursor-pointer hover:bg-slate-800/30 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026 July Batch 1"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-800/10 border border-border-subtle/50 px-3.5 py-2 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Batch ID / Code</label>
                <input
                  type="text"
                  disabled={!!editingBatch}
                  required
                  placeholder="2026_july_batch_1"
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  className="w-full bg-slate-800/10 border border-border-subtle/50 px-3.5 py-2 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                />
                {!editingBatch && (
                  <span className="text-[10px] text-slate-500 font-medium block">
                    Must follow format <code>YYYY_month_batch_N</code>. Auto-completed from name.
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full bg-slate-800/10 border border-border-subtle/50 px-3 py-2 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Cutoff Date</label>
                  <input
                    type="date"
                    required
                    value={formCutoffDate}
                    onChange={(e) => setFormCutoffDate(e.target.value)}
                    className="w-full bg-slate-800/10 border border-border-subtle/50 px-3 py-2 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-border-subtle/50 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 border border-border-subtle bg-slate-800/10 hover:bg-slate-800/25 rounded-xl text-xs font-semibold text-muted hover:text-foreground cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl text-xs shadow-sm cursor-pointer transition"
                >
                  <Save className="w-3.5 h-3.5" /> Save Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
