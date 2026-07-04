import { useState, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Surface, Drawer, Avatar } from '@heroui/react';
import {
  Menu,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Person } from '@gravity-ui/icons';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { apiClient } from '../api/client';
import SidebarNav from './navigation/SidebarNav';
import SettingsDrawer from './settings/SettingsDrawer';

export function DashboardContainer() {
  const { userRole, email, userId, clearSession } = useAuthStore();
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  const activeNavKey = useMemo(() => {
    const parts = location.pathname.split('/');
    const lastPart = parts[parts.length - 1];
    if (lastPart === 'dashboard') {
      return 'home';
    }
    return lastPart || 'home';
  }, [location.pathname]);

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState<boolean>(false);

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    }
    clearSession();
    navigate('/login', { replace: true });
  };

  const username = email ? email.split('@')[0] : 'developerspec25';

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Desktop Fixed Left Panel using Surface */}
      <aside
        className={`hidden md:flex flex-col border-r border-border-subtle transition-all duration-300 z-20 ${
          isSidebarCollapsed ? 'w-14' : 'w-48'
        }`}
      >
        <Surface variant="default" className="h-full w-full flex flex-col justify-between p-0 rounded-none border-none">
          {/* Main Sidebar Component */}
          <div className="flex-1 overflow-hidden">
            <SidebarNav
              isCollapsed={isSidebarCollapsed}
              activeKey={activeNavKey}
              onSelectKey={(key) => {
                navigate(`/${userRole || 'student'}/${key === 'home' ? 'dashboard' : key}`);
              }}
              onQuickCreate={(key) => {
                navigate(`/admin/${key}?create=true`);
              }}
              userRole={userRole}
            />
          </div>

          {/* Desktop Footer Toggle Button */}
          <div className="p-2 border-t border-slate-800/60 bg-(--sidebar-bg,#111111) flex justify-end">
            <button
              type="button"
              onClick={toggleSidebar}
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className="flex items-center justify-center p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-primary/20 transition-colors w-full group"
            >
              {isSidebarCollapsed ? (
                <ChevronsRight className="w-5 h-5" />
              ) : (
                <div className="flex items-center justify-between w-full px-2">
                  <span className="text-xs font-semibold text-neutral-300">Collapse</span>
                  <ChevronsLeft className="w-5 h-5" />
                </div>
              )}
            </button>
          </div>
        </Surface>
      </aside>

      {/* Mobile Navigation Drawer using HeroUI Drawer */}
      <Drawer.Backdrop isOpen={isMobileDrawerOpen} onOpenChange={setIsMobileDrawerOpen}>
        <Drawer.Content placement="left" className="h-full max-w-[270px] w-full p-0">
          <Drawer.Dialog className="h-full w-full bg-(--sidebar-bg,#111111) p-0 border-r border-slate-800 rounded-none">
            <Drawer.Body className="h-full p-0 overflow-hidden">
              <SidebarNav
                isMobile
                activeKey={activeNavKey}
                onSelectKey={(key) => {
                  navigate(`/${userRole || 'student'}/${key === 'home' ? 'dashboard' : key}`);
                  setIsMobileDrawerOpen(false);
                }}
                onQuickCreate={(key) => {
                  navigate(`/admin/${key}?create=true`);
                  setIsMobileDrawerOpen(false);
                }}
                userRole={userRole}
              />
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>

      {/* Settings right drawer */}
      <SettingsDrawer
        isOpen={isSettingsDrawerOpen}
        onClose={() => setIsSettingsDrawerOpen(false)}
        email={email}
        username={username}
        userId={userId}
        handleLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header Bar — explicit h-12 and flex centering to align with sidebar logo */}
        <header className="h-12 flex items-center justify-between px-4 bg-card-bg border-b border-border-subtle shadow-xs z-10 shrink-0">
          {/* Left Brand / Mobile Navigation Trigger */}
          <div className="flex items-center gap-2">
            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-foreground hover:bg-card-bg border border-border-subtle transition-colors"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSettingsDrawerOpen(true)}
              className="hover:scale-105 active:scale-95 transition-all focus:outline-none"
              title="Settings & Profile"
            >
              <Avatar size="sm" className="bg-transparent border border-border-subtle text-slate-400 hover:text-foreground hover:bg-slate-800/10 dark:hover:bg-white/5 transition-all cursor-pointer">
                <Avatar.Fallback className="bg-transparent">
                  <Person className="w-4 h-4 text-slate-400" />
                </Avatar.Fallback>
              </Avatar>
            </button>
          </div>
        </header>

        {/* Main Dashboard Content View */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardContainer;
