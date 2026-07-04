import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Drawer, Input, Avatar } from '@heroui/react';
import { Search, X, Settings2, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { SETTINGS_SECTIONS, filterSectionsByRole } from './settings.config';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  email: string | null;
  username: string;
  userId: string | null;
  handleLogout: () => void;
}

export function SettingsDrawer({
  isOpen,
  onClose,
  email,
  username,
  userId,
  handleLogout,
}: SettingsDrawerProps) {
  const navigate = useNavigate();
  const { userRole } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = filterSectionsByRole(SETTINGS_SECTIONS, userRole).filter((section) =>
    section.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNavigate = (route: string) => {
    onClose();
    navigate(route);
  };

  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={onClose} className="flex justify-end z-50">
        <Drawer.Content placement="right" className="h-full max-w-sm w-full ml-auto p-0 overflow-x-hidden">
          <Drawer.Dialog className="h-full w-full bg-card-bg text-foreground p-0 border-l border-border-subtle overflow-y-auto overflow-x-hidden flex flex-col justify-between">
            <Drawer.Body className="p-5 flex flex-col gap-5 h-full overflow-x-hidden">
              {/* Profile Block */}
              <div className="flex flex-col gap-3 pb-4 border-b border-border-subtle/60">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar size="lg" className="shrink-0 bg-primary/10 text-primary border border-border-subtle">
                      <Avatar.Fallback>
                        {username ? username.substring(0, 2).toUpperCase() : 'US'}
                      </Avatar.Fallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h2 className="text-base font-bold text-foreground leading-tight truncate">
                        {username}
                      </h2>
                      <p className="text-xs text-slate-400 font-medium truncate">
                        {email || 'developerspec25@gmail.com'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 font-medium leading-relaxed truncate">
                  User ID: <span className="text-slate-300 font-semibold">{userId || '60046230054'}</span>
                </p>
              </div>

              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Settings2 className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-bold text-foreground">Settings</h2>
                </div>
              </div>

              {/* Search Settings */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                <Input
                  type="text"
                  placeholder="Search Settings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2.5 w-full bg-background border border-border-subtle/60 rounded-xl text-xs text-foreground placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              {/* All Settings Direct Navigation Link */}
              <button
                type="button"
                onClick={() => handleNavigate('/settings')}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 transition-all text-xs font-semibold text-primary text-center cursor-pointer"
              >
                Go to Dedicated Settings Page
              </button>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5">
                {filteredSections.length > 0 ? (
                  filteredSections.map((section) => {
                    const SectionIcon = section.icon;
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => handleNavigate(section.route)}
                        className="flex items-center gap-3.5 p-3 rounded-xl border border-border-subtle/40 bg-slate-800/10 hover:bg-primary/10 hover:border-primary/20 hover:text-primary transition-all text-left w-full group cursor-pointer"
                      >
                        <div className="p-2 rounded-lg bg-slate-800/20 text-slate-400 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                          <SectionIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-foreground group-hover:text-primary truncate block">
                            {section.label}
                          </span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 text-center py-6">No matching settings found</p>
                )}
              </div>

              {/* Sign Out Button at the Bottom */}
              <div className="pt-3 border-t border-border-subtle/60 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    handleLogout();
                  }}
                  className="text-xs font-semibold text-red-500 hover:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer w-full justify-center py-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
  );
}

export default SettingsDrawer;
