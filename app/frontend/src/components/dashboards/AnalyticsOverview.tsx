import { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  Layers,
  Percent,
  Coins
} from 'lucide-react';
import adminApi from '../../api/admin';
import { resolvePaymentInfo } from '../../hooks/useAdminPayments';
import type { PaymentDto, StudentDto, CourseDto, EnrollmentDto, WorkspaceOverviewDto } from '../../api/types';

export function AnalyticsOverview() {
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [counts, setCounts] = useState<WorkspaceOverviewDto | null>(null);
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentDto[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAnalyticsData() {
      setIsLoading(true);
      try {
        const [fetchedPayments, fetchedCounts, fetchedStudents, fetchedCourses, fetchedEnrollments] = await Promise.all([
          adminApi.listPayments(),
          adminApi.getOverviewCounts(),
          adminApi.getAllStudents(),
          adminApi.getAllCourses(),
          adminApi.getAllEnrollments(),
        ]);

        setPayments(fetchedPayments || []);
        setCounts(fetchedCounts || null);
        setStudents(fetchedStudents || []);
        setCourses(fetchedCourses || []);
        setEnrollments(fetchedEnrollments || []);
      } catch (err) {
        console.error('Failed to load data for analytics overview', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAnalyticsData();
  }, []);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/25';
      case 'failed':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/25';
      case 'refunded':
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/25';
      default:
        return 'bg-muted/10 text-muted border border-border-subtle';
    }
  };

  // 1. Calculate main KPIs strictly from database
  const stats = useMemo(() => {
    let totalCollected = 0;
    let totalPendingAmount = 0;
    let completedCount = 0;
    let pendingCount = 0;
    let failedCount = 0;
    
    payments.forEach((p) => {
      const amt = p.amount || 0;
      const status = p.status || 'completed';
      if (status === 'completed') {
        totalCollected += amt;
        completedCount++;
      } else if (status === 'pending') {
        totalPendingAmount += p.nextDueAmount || amt;
        pendingCount++;
      } else if (status === 'failed') {
        failedCount++;
      }
    });
    
    const totalCount = payments.length;
    const averageTransaction = completedCount > 0 ? totalCollected / completedCount : 0;
    const successRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    
    return {
      totalCollected,
      totalPendingAmount,
      completedCount,
      pendingCount,
      failedCount,
      totalCount,
      averageTransaction,
      successRate,
    };
  }, [payments]);

  // 2. Monthly collections over time from database completed payments
  const monthlyRevenue = useMemo(() => {
    const monthsData: Record<string, number> = {};
    const currentDate = new Date(2026, 6, 4); // Fixed current date 2026-07-04
    
    // Initialize past 6 months chronologically
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const label = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      monthsData[label] = 0;
    }
    
    payments.forEach((p) => {
      if (p.status === 'completed' && p.paymentDate) {
        const date = new Date(p.paymentDate);
        if (!isNaN(date.getTime())) {
          const label = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
          if (monthsData[label] !== undefined) {
            monthsData[label] += p.amount || 0;
          }
        }
      }
    });
    
    return Object.entries(monthsData).map(([month, amount]) => ({
      month,
      amount,
    }));
  }, [payments]);

  // Max revenue for bar scaling
  const maxRevenue = useMemo(() => {
    return Math.max(...monthlyRevenue.map((m) => m.amount), 1);
  }, [monthlyRevenue]);

  // 3. Payment Method Distribution strictly from completed payments
  const methodDistribution = useMemo(() => {
    const methodsData: Record<string, number> = {
      'upi': 0,
      'bank transfer': 0,
      'card': 0,
      'cash': 0,
      'other': 0,
    };
    
    let totalCompletedAmount = 0;
    payments.forEach((p) => {
      if (p.status === 'completed') {
        const method = (p.paymentMethod || 'other').toLowerCase();
        const normalizedMethod = methodsData[method] !== undefined ? method : 'other';
        methodsData[normalizedMethod] += p.amount || 0;
        totalCompletedAmount += p.amount || 0;
      }
    });
    
    return Object.entries(methodsData)
      .map(([method, amount]) => {
        const percentage = totalCompletedAmount > 0 ? (amount / totalCompletedAmount) * 100 : 0;
        return {
          method,
          amount,
          percentage,
        };
      })
      .filter((item) => item.amount > 0) // Only display active methods with collections
      .sort((a, b) => b.amount - a.amount);
  }, [payments]);

  // 4. Top 5 recent transactions from database
  const recentTransactions = useMemo(() => {
    const sorted = [...payments].sort((a, b) => {
      const dateA = a.paymentDate || '';
      const dateB = b.paymentDate || '';
      return dateB.localeCompare(dateA);
    });
    
    const top5 = sorted.slice(0, 5);
    
    return top5.map((p) => {
      const info = resolvePaymentInfo(p, enrollments, students, courses);
      return {
        ...p,
        studentName: info.studentName,
        courseTitle: info.courseTitle,
      };
    });
  }, [payments, enrollments, students, courses]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 gap-3 text-muted min-h-[300px]">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold tracking-wide">Loading real-time financial stats...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Header section */}
      <div>
        <h3 className="text-base font-bold text-foreground">Financial & Revenue Analytics</h3>
        <p className="text-xs text-muted">Comprehensive review of tuition fee collections, accounts receivable, and transaction histories.</p>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue */}
        <div className="p-6 bg-card-bg border border-border-subtle rounded-3xl shadow-xs hover:border-primary/45 hover:shadow-md transition-all duration-300 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Total Revenue</span>
            <span className="text-2xl font-bold text-foreground mt-1">{formatCurrency(stats.totalCollected)}</span>
            <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {stats.completedCount} Completed
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 shrink-0 border border-emerald-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Pending dues */}
        <div className="p-6 bg-card-bg border border-border-subtle rounded-3xl shadow-xs hover:border-primary/45 hover:shadow-md transition-all duration-300 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Outstanding Dues</span>
            <span className="text-2xl font-bold text-foreground mt-1">{formatCurrency(stats.totalPendingAmount)}</span>
            <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5" /> {stats.pendingCount} Invoices Pending
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-400 shrink-0 border border-amber-500/20">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Average Transaction Size */}
        <div className="p-6 bg-card-bg border border-border-subtle rounded-3xl shadow-xs hover:border-primary/45 hover:shadow-md transition-all duration-300 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Avg Transaction</span>
            <span className="text-2xl font-bold text-foreground mt-1">{formatCurrency(stats.averageTransaction)}</span>
            <span className="text-[10px] text-primary font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> Per Receipt
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-primary/10 text-primary shrink-0 border border-primary/20">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Success Rate */}
        <div className="p-6 bg-card-bg border border-border-subtle rounded-3xl shadow-xs hover:border-primary/45 hover:shadow-md transition-all duration-300 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Success Rate</span>
            <span className="text-2xl font-bold text-foreground mt-1">{stats.successRate.toFixed(1)}%</span>
            <span className="text-[10px] text-indigo-400 font-semibold flex items-center gap-1 mt-1">
              <Percent className="w-3.5 h-3.5" /> {stats.totalCount} Total Txns
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 shrink-0 border border-indigo-500/20">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Graphs & Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Collection Trend Bar Chart */}
        <div className="p-6 bg-card-bg border border-border-subtle rounded-3xl flex flex-col justify-between min-h-[260px]">
          <div>
            <h4 className="text-sm font-bold text-foreground">Monthly Revenue Trend</h4>
            <p className="text-xs text-muted">Intake and tuition collections over the past 6 months</p>
          </div>
          {payments.filter((p) => p.status === 'completed').length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-muted font-semibold py-12">
              No revenue collections recorded for this period
            </div>
          ) : (
            <div className="h-36 flex items-end gap-3 mt-8 pt-4">
              {monthlyRevenue.map((item, idx) => {
                const heightPercent = maxRevenue > 0 ? (item.amount / maxRevenue) * 100 : 0;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                    {/* High-contrast tooltip pill on hover */}
                    <span className="absolute -top-7 text-[10px] font-bold text-white bg-slate-900 border border-slate-700 shadow-md px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                      {formatCurrency(item.amount)}
                    </span>
                    
                    {/* Always visible price label above non-zero bars when not hovering */}
                    <span className="text-[10px] font-bold text-foreground/80 group-hover:opacity-0 transition-opacity h-4 flex items-center whitespace-nowrap">
                      {item.amount > 0 ? formatCurrency(item.amount) : ''}
                    </span>

                    <div className="w-full bg-border-subtle/30 rounded-t-lg h-24 flex items-end overflow-hidden">
                      <div 
                        style={{ height: `${heightPercent || 2}%` }} 
                        className={`w-full ${item.amount > 0 ? 'bg-primary' : 'bg-muted/40'} hover:opacity-85 transition-all duration-500 ease-out`}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-muted group-hover:text-foreground tracking-tight transition-colors">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Revenue by Payment Method */}
        <div className="p-6 bg-card-bg border border-border-subtle rounded-3xl flex flex-col justify-between min-h-[260px]">
          <div>
            <h4 className="text-sm font-bold text-foreground">Revenue by Payment Method</h4>
            <p className="text-xs text-muted font-semibold">Distribution mapping of completed tuition transactions</p>
          </div>
          {methodDistribution.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-muted font-semibold py-12">
              No completed payment transactions recorded
            </div>
          ) : (
            <div className="flex flex-col gap-4 mt-6">
              {methodDistribution.map((item) => {
                const getBarColor = (method: string) => {
                  switch (method) {
                    case 'upi':
                      return 'bg-violet-500';
                    case 'bank transfer':
                      return 'bg-blue-500';
                    case 'card':
                      return 'bg-indigo-500';
                    case 'cash':
                      return 'bg-emerald-500';
                    default:
                      return 'bg-slate-500';
                  }
                };
                return (
                  <div key={item.method} className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-foreground capitalize">{item.method}</span>
                      <span className="text-muted text-[10px] font-bold">
                        {formatCurrency(item.amount)} ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-border-subtle/30 rounded-full overflow-hidden border border-border-subtle/10">
                      <div 
                        style={{ width: `${item.percentage || 2}%` }} 
                        className={`h-full ${getBarColor(item.method)} rounded-full transition-all duration-500 ease-out`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Ledger Table */}
      <div className="p-6 bg-card-bg border border-border-subtle rounded-3xl flex flex-col gap-4">
        <div>
          <h4 className="text-sm font-bold text-foreground">Recent Financial Transactions</h4>
          <p className="text-xs text-muted">Latest payment allocations recorded on the platform ledger</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle/60 text-[10px] font-bold text-muted uppercase tracking-wider">
                <th className="py-3 px-2">Student</th>
                <th className="py-3 px-2">Course</th>
                <th className="py-3 px-2">Date & Method</th>
                <th className="py-3 px-2">Ref Reference</th>
                <th className="py-3 px-2 text-right">Amount</th>
                <th className="py-3 px-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/30 text-xs font-medium">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-muted font-bold">
                    No transactions recorded in the system database
                  </td>
                </tr>
              ) : (
                recentTransactions.map((txn, idx) => (
                  <tr key={txn.id || idx} className="hover:bg-slate-800/10 transition-colors">
                    <td className="py-3.5 px-2">
                      <span className="font-bold text-foreground block">{txn.studentName}</span>
                    </td>
                    <td className="py-3.5 px-2 text-muted truncate max-w-[180px]" title={txn.courseTitle}>
                      {txn.courseTitle}
                    </td>
                    <td className="py-3.5 px-2">
                      <span className="text-foreground block">{txn.paymentDate}</span>
                      <span className="text-[10px] text-muted capitalize block font-bold">{txn.paymentMethod}</span>
                    </td>
                    <td className="py-3.5 px-2 text-[10px] font-mono text-muted font-bold">
                      {txn.transactionReference || '—'}
                    </td>
                    <td className="py-3.5 px-2 text-right font-bold text-foreground">
                      {formatCurrency(txn.amount || 0)}
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusBadgeClass(txn.status)}`}>
                        {txn.status || 'completed'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Secondary Operational Metrics Section */}
      <div className="p-6 bg-card-bg border border-border-subtle rounded-3xl flex flex-col gap-4">
        <div>
          <h4 className="text-xs font-bold text-foreground tracking-wide uppercase">Core Operational Metrics</h4>
          <p className="text-[10px] text-muted">Platform capacities and scheduling presets summary</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-4 bg-background/50 border border-border-subtle rounded-2xl flex items-center justify-between gap-2 shadow-xs hover:border-primary/20 transition-all duration-300">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-bold text-muted uppercase tracking-wider">Students</span>
              <span className="text-lg font-bold text-foreground mt-0.5">{counts?.studentsCount ?? 0}</span>
            </div>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/10">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="p-4 bg-background/50 border border-border-subtle rounded-2xl flex items-center justify-between gap-2 shadow-xs hover:border-primary/20 transition-all duration-300">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-bold text-muted uppercase tracking-wider">Courses</span>
              <span className="text-lg font-bold text-foreground mt-0.5">{counts?.coursesCount ?? 0}</span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/10">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>

          <div className="p-4 bg-background/50 border border-border-subtle rounded-2xl flex items-center justify-between gap-2 shadow-xs hover:border-primary/20 transition-all duration-300">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-bold text-muted uppercase tracking-wider">Mentors</span>
              <span className="text-lg font-bold text-foreground mt-0.5">{counts?.mentorsCount ?? 0}</span>
            </div>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/10">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>

          <div className="p-4 bg-background/50 border border-border-subtle rounded-2xl flex items-center justify-between gap-2 shadow-xs hover:border-primary/20 transition-all duration-300">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-bold text-muted uppercase tracking-wider">Schedules</span>
              <span className="text-lg font-bold text-foreground mt-0.5">{counts?.slotsCount ?? 0}</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/10">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          <div className="p-4 bg-background/50 border border-border-subtle rounded-2xl flex items-center justify-between gap-2 shadow-xs hover:border-primary/20 transition-all duration-300 col-span-2 md:col-span-1">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-bold text-muted uppercase tracking-wider">Intake Batches</span>
              <span className="text-lg font-bold text-foreground mt-0.5">{counts?.batchesCount ?? 0}</span>
            </div>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/10">
              <Coins className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsOverview;
