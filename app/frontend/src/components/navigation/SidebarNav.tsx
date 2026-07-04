import React from 'react';
import { ScrollShadow } from '@heroui/react';
import {
  Home,
  Users,
  BookOpen,
  GraduationCap,
  CreditCard,
  Calendar,
  ClipboardList,
  Plus,
  Clock,
  CalendarRange,
} from 'lucide-react';
import logoFullName from '../../assets/brand/logo-white-full-name.png';
import logoWhite from '../../assets/brand/logo-white.svg';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hasPlus?: boolean;
  badge?: string;
}

const mainNavItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'students', label: 'Students', icon: Users, hasPlus: true },
  { id: 'courses', label: 'Courses', icon: BookOpen, hasPlus: true },
  { id: 'mentors', label: 'Mentors', icon: GraduationCap, hasPlus: true },
  { id: 'batches', label: 'Batches', icon: ClipboardList, hasPlus: true },
  { id: 'slots', label: 'Slots', icon: Clock, hasPlus: true },
  { id: 'scheduling', label: 'Scheduling', icon: Calendar },
  { id: 'schedule-inspector', label: 'Schedule Inspector', icon: CalendarRange },
  { id: 'enrollments', label: 'Enrollments', icon: ClipboardList },
  { id: 'payments', label: 'Payments', icon: CreditCard, hasPlus: true },
];

interface SidebarNavProps {
  isCollapsed?: boolean;
  isMobile?: boolean;
  activeKey?: string;
  onSelectKey?: (key: string) => void;
  onQuickCreate?: (key: string) => void;
  userRole?: 'admin' | 'mentor' | 'student' | null;
}

export function SidebarNav({
  isCollapsed = false,
  isMobile = false,
  activeKey = 'home',
  onSelectKey,
  onQuickCreate,
  userRole,
}: SidebarNavProps) {
  const collapsed = isCollapsed && !isMobile;

  const filteredItems = React.useMemo(() => {
    if (userRole === 'mentor') {
      return mainNavItems.filter((item) => item.id === 'home' || item.id === 'scheduling');
    }
    if (userRole === 'student') {
      return mainNavItems.filter((item) => item.id === 'home' || item.id === 'enrollments');
    }
    return mainNavItems.filter((item) => item.id !== 'enrollments'); // admin has all other controls
  }, [userRole]);

  const adminGroups = React.useMemo(() => {
    return [
      {
        title: 'Overview',
        items: mainNavItems.filter((i) => i.id === 'home'),
      },
      {
        title: 'Directory',
        items: mainNavItems.filter((i) => i.id === 'students' || i.id === 'mentors' || i.id === 'courses'),
      },
      {
        title: 'Operations',
        items: mainNavItems.filter((i) => i.id === 'batches' || i.id === 'slots' || i.id === 'scheduling' || i.id === 'schedule-inspector'),
      },
      {
        title: 'Financials',
        items: mainNavItems.filter((i) => i.id === 'payments'),
      },
    ];
  }, []);


  const renderNavList = (items: NavItem[], ariaLabel: string) => (
    <ul aria-label={ariaLabel} className="w-full flex flex-col gap-1.5">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeKey === item.id;

        return (
          <li key={item.id} className="w-full">
            <button
              onClick={() => onSelectKey?.(item.id)}
              className={`group flex items-center justify-between w-full rounded-md text-left transition-colors cursor-pointer focus:outline-none ${
                collapsed ? 'h-8 w-8 justify-center mx-auto' : 'h-7 pl-6 pr-0'
              } ${
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'text-neutral-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {!collapsed ? (
                <div className="flex items-center justify-between w-full h-full">
                  <div className="flex items-center gap-2.5 min-w-0 pr-2.5">
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                        isActive ? 'text-primary-foreground' : 'text-neutral-400 group-hover:text-white'
                      }`}
                    />
                    <span
                      className={`text-[11px] font-semibold truncate leading-none ${
                        isActive ? 'text-primary-foreground' : 'text-neutral-300 group-hover:text-white'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  {item.hasPlus && userRole === 'admin' && !isMobile && (
                    <span
                      title={`New ${item.label}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickCreate?.(item.id);
                      }}
                      className={`h-full w-7 flex items-center justify-center transition-all ${
                        isActive
                          ? 'hover:bg-white/15 text-primary-foreground rounded-r-md'
                          : 'opacity-0 group-hover:opacity-100 border-l border-white/10 bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white rounded-r-md'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                    </span>
                  )}
                </div>
              ) : (
                <div
                  title={item.label}
                  className="flex items-center justify-center w-full h-full"
                >
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-primary-foreground' : 'text-neutral-400 group-hover:text-white'
                    }`}
                  />
                </div>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="flex flex-col h-full w-full bg-(--sidebar-bg,#111111) text-slate-100 select-none overflow-hidden">
      {/* Header / Logo Section */}
      <div
        className={`flex items-center h-12 px-4 bg-black/50 border-b border-neutral-800/80 ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {!collapsed ? (
          <div className="flex items-center gap-2 p-1">
            <img
              src={logoFullName}
              alt="GenLab Portal"
              className="h-5.5 object-contain transition-all"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center p-1.5">
            <img
              src={logoWhite}
              alt="GenLab Portal"
              className="h-5.5 w-auto object-contain transition-all"
            />
          </div>
        )}
      </div>

      {/* Main Nav Content wrapped in ScrollShadow */}
      <ScrollShadow
        hideScrollBar
        className="flex-1 px-1.5 py-3 space-y-4 [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {userRole === 'admin' && !collapsed ? (
          adminGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="px-3 py-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                {group.title}
              </div>
              <div className="px-0.5">{renderNavList(group.items, `${group.title} Navigation`)}</div>
            </div>
          ))
        ) : (
          <div className="px-0.5">{renderNavList(filteredItems, 'Sidebar Navigation')}</div>
        )}
      </ScrollShadow>
    </div>
  );
}

export default SidebarNav;
