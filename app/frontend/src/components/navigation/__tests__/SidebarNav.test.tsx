import { describe, it, expect } from 'vitest';
import { useUIStore } from '../../../store/uiStore';
import { SidebarNav } from '../SidebarNav';

describe('SidebarNav component', () => {
  it('exports SidebarNav function component', () => {
    expect(SidebarNav).toBeDefined();
    expect(typeof SidebarNav).toBe('function');
  });
});

describe('useUIStore', () => {
  it('toggles sidebar collapse state', () => {
    useUIStore.getState().setSidebarCollapsed(false);
    expect(useUIStore.getState().isSidebarCollapsed).toBe(false);

    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().isSidebarCollapsed).toBe(true);

    useUIStore.getState().setSidebarCollapsed(false);
    expect(useUIStore.getState().isSidebarCollapsed).toBe(false);
  });
});
