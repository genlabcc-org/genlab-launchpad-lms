import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Sliders, EyeOff } from 'lucide-react';
import { useAuthStore } from './store/authStore';
import { useSettingsStore } from './store/settingsStore';
import Login from './components/Login';
import DashboardContainer from './components/DashboardContainer';
import AdminDashboard from './components/dashboards/AdminDashboard';
import MentorDashboard from './components/dashboards/MentorDashboard';
import StudentDashboard from './components/dashboards/StudentDashboard';
import AdminStudentsDashboard from './components/dashboards/AdminStudentsDashboard';
import AdminCoursesDashboard from './components/dashboards/AdminCoursesDashboard';
import AdminMentorsDashboard from './components/dashboards/AdminMentorsDashboard';
import AdminSlotsDashboard from './components/dashboards/AdminSlotsDashboard';
import AdminPaymentsDashboard from './components/dashboards/AdminPaymentsDashboard';
import { AdminBatchesDashboard } from './components/dashboards/AdminBatchesDashboard';
import { AdminSchedulingDashboard } from './components/dashboards/AdminSchedulingDashboard';
import { AdminScheduleInspectorDashboard } from './components/dashboards/AdminScheduleInspectorDashboard';
import MentorSlotsDashboard from './components/dashboards/MentorSlotsDashboard';
import StudentEnrollmentsDashboard from './components/dashboards/StudentEnrollmentsDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicOnlyRoute from './components/auth/PublicOnlyRoute';
import NotFound from './components/NotFound';
import SettingsLayout from './components/settings/SettingsLayout';
import AppearanceSettings from './components/settings/sections/AppearanceSettings';
import AccountSettings from './components/settings/sections/AccountSettings';
import PlatformSettings from './components/settings/sections/PlatformSettings';
import AccessibilitySettings from './components/settings/sections/AccessibilitySettings';
import SecuritySettings from './components/settings/sections/SecuritySettings';

function App() {
  const navigate = useNavigate();
  const { isAuthenticated, userRole, setSession, initialize: initAuth } = useAuthStore();
  const [showSandboxTools, setShowSandboxTools] = useState(() => {
    return localStorage.getItem('settings.showSandboxTools') !== 'false';
  });

  const toggleSandboxTools = () => {
    const nextVal = !showSandboxTools;
    setShowSandboxTools(nextVal);
    localStorage.setItem('settings.showSandboxTools', String(nextVal));
  };
  const {
    theme,
    activeCrmTheme,
    density,
    accessibility,
    setTheme,
    setCrmTheme,
    initialize: initSettings,
  } = useSettingsStore();

  // Initialize both stores from localStorage on mount
  useEffect(() => {
    initAuth();
    initSettings();
  }, [initAuth, initSettings]);

  // Sync light/dark + CRM theme classes to <html> whenever they change
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Light / Dark
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }

    // CRM theme skin
    const crmClasses = ['genlab-theme', 'theme-zoho-crm', 'theme-odoo-crm', 'theme-sap-crm'];
    crmClasses.forEach((cls) => {
      root.classList.remove(cls);
      body.classList.remove(cls);
    });
    const targetClass = activeCrmTheme === 'genlab' ? 'genlab-theme' : `theme-${activeCrmTheme}`;
    root.classList.add(targetClass);
    body.classList.add(targetClass);
  }, [theme, activeCrmTheme]);

  // Sync density token to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('density-comfortable', 'density-compact');
    root.classList.add(`density-${density}`);
  }, [density]);

  // Sync accessibility tokens to <html>
  useEffect(() => {
    const root = document.documentElement;

    // Reduce motion
    if (accessibility.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // High contrast
    if (accessibility.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Font size
    root.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    root.classList.add(`font-size-${accessibility.fontSize}`);
  }, [accessibility]);

  const envSandboxFlag = import.meta.env.VITE_ENABLE_SANDBOX_TOOLS;
  const isSandboxToolsEnabled = envSandboxFlag ? envSandboxFlag === 'true' : import.meta.env.DEV;

  const defaultRedirect = isAuthenticated && userRole ? `/${userRole}/dashboard` : '/login';

  return (
    <>
      <Routes>
        {/* Default Root Redirect */}
        <Route path="/" element={<Navigate to={defaultRedirect} replace />} />

        {/* Public-Only Route */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />

        {/* Settings Routes — full-screen takeover, protected for authenticated users */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['admin', 'mentor', 'student']}>
              <SettingsLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="appearance" replace />} />
          <Route path="appearance" element={<AppearanceSettings />} />
          <Route path="account" element={<AccountSettings />} />
          <Route
            path="platform"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PlatformSettings />
              </ProtectedRoute>
            }
          />
          <Route path="accessibility" element={<AccessibilitySettings />} />
          <Route
            path="security"
            element={
              <ProtectedRoute allowedRoles={['admin', 'mentor']}>
                <SecuritySettings />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Admin Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardContainer />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudentsDashboard />} />
          <Route path="courses" element={<AdminCoursesDashboard />} />
          <Route path="mentors" element={<AdminMentorsDashboard />} />
          <Route path="slots" element={<AdminSlotsDashboard />} />
          <Route path="scheduling" element={<AdminSchedulingDashboard />} />
          <Route path="schedule-inspector" element={<AdminScheduleInspectorDashboard />} />
          <Route path="payments" element={<AdminPaymentsDashboard />} />
          <Route path="batches" element={<AdminBatchesDashboard />} />
        </Route>

        {/* Mentor Protected Routes */}
        <Route
          path="/mentor"
          element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <DashboardContainer />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<MentorDashboard />} />
          <Route path="scheduling" element={<MentorSlotsDashboard />} />
        </Route>

        {/* Student Protected Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardContainer />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="enrollments" element={<StudentEnrollmentsDashboard />} />
        </Route>

        {/* 404 Catch-All Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Developer Sandbox Tools (enabled in dev or via VITE_ENABLE_SANDBOX_TOOLS=true) */}
      {isSandboxToolsEnabled && (
        showSandboxTools ? (
          <>
            <button
              onClick={toggleSandboxTools}
              className="fixed bottom-40 right-4 z-50 p-2 bg-card-bg/90 backdrop-blur-md border border-border-subtle rounded-full shadow-lg text-muted hover:text-foreground hover:bg-foreground/10 cursor-pointer transition-all flex items-center justify-center"
              title="Hide Developer Sandbox Tools"
              aria-label="Hide Developer Sandbox Tools"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>

            <div className="fixed bottom-28 right-4 z-50 flex items-center gap-1 bg-card-bg/90 backdrop-blur-md border border-border-subtle p-1.5 rounded-full shadow-lg text-xs font-medium">
              <span className="px-2 text-muted hidden sm:inline">Mode:</span>
              {(
                [
                  { id: 'light', label: 'Light' },
                  { id: 'dark', label: 'Dark' },
                ] as const
              ).map((item) => {
                const isActive = theme === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTheme(item.id)}
                    className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                        : 'text-foreground hover:bg-muted/20'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="fixed bottom-16 right-4 z-50 flex items-center gap-1 bg-card-bg/90 backdrop-blur-md border border-border-subtle p-1.5 rounded-full shadow-lg text-xs font-medium">
              <span className="px-2 text-muted hidden sm:inline">Role:</span>
              {(
                [
                  { id: 'admin', label: 'Admin' },
                  { id: 'mentor', label: 'Mentor' },
                  { id: 'student', label: 'Student' },
                ] as const
              ).map((item) => {
                const isActive = userRole === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSession(item.id, {
                        user: { id: `sandbox-${item.id}-id`, email: `${item.id}@genlab.cc` },
                      });
                      navigate(`/${item.id}/dashboard`, { replace: true });
                    }}
                    className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                        : 'text-foreground hover:bg-muted/20'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1 bg-card-bg/90 backdrop-blur-md border border-border-subtle p-1.5 rounded-full shadow-lg text-xs font-medium">
              <span className="px-2 text-muted hidden sm:inline">Theme:</span>
              {(
                [
                  { id: 'genlab', label: 'GenLab (Primary)' },
                  { id: 'zoho-crm', label: 'Zoho' },
                  { id: 'odoo-crm', label: 'Odoo' },
                  { id: 'sap-crm', label: 'SAP Fiori' },
                ] as const
              ).map((item) => {
                const isActive = activeCrmTheme === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCrmTheme(item.id)}
                    className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                        : 'text-foreground hover:bg-muted/20'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <button
            onClick={toggleSandboxTools}
            className="fixed bottom-4 right-4 z-50 p-2 bg-card-bg/90 backdrop-blur-md border border-border-subtle rounded-full shadow-lg text-muted hover:text-foreground hover:bg-foreground/10 cursor-pointer transition-all flex items-center justify-center animate-pulse"
            title="Show Developer Sandbox Tools"
            aria-label="Show Developer Sandbox Tools"
          >
            <Sliders className="w-4 h-4" />
          </button>
        )
      )}
    </>
  );
}

export default App;
