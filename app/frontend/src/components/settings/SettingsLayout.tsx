import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@heroui/react';
import { Search, X, ChevronLeft, Settings2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { SETTINGS_SECTIONS, filterSectionsByRole } from './settings.config';
import SettingsNav from './SettingsNav';

export function SettingsLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useAuthStore();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Role-filtered sections
  const allowedSections = filterSectionsByRole(SETTINGS_SECTIONS, userRole);

  // Search filtered sections
  const filteredSections = allowedSections.filter((section) =>
    section.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Hotkey "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if the user is typing in an input/textarea
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClose = () => {
    // Navigate back to role's dashboard
    if (userRole) {
      navigate(`/${userRole}/dashboard`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-background text-foreground">
      {/* Settings Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-card-bg shadow-sm shrink-0 z-10">
        {/* Left Side Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-foreground transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="h-4 w-px bg-border-subtle" />
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primary animate-spin-slow" />
            <span className="text-sm font-bold tracking-tight">System Settings</span>
          </div>
        </div>

        {/* Center Search Input */}
        <div className="relative w-full max-w-md mx-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search settings (Press '/' to focus)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 w-full bg-background border border-border-subtle/60 rounded-xl text-xs text-foreground placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>

        {/* Right Close Button */}
        <div>
          <button
            type="button"
            onClick={handleClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-subtle text-xs font-semibold hover:bg-slate-800/10 dark:hover:bg-white/5 transition-all cursor-pointer"
            title="Exit Settings"
          >
            <X className="w-4 h-4" />
            <span>Close Settings</span>
          </button>
        </div>
      </header>

      {/* Main Settings Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Panel */}
        <aside className="w-64 border-r border-border-subtle bg-card-bg flex flex-col shrink-0">
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <SettingsNav sections={filteredSections} activeRoute={location.pathname} />
          </div>
        </aside>

        {/* Right Settings Content Panel */}
        <main className="flex-1 overflow-y-auto bg-background/50 p-8">
          <div className="max-w-4xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default SettingsLayout;
