/**
 * authStore — Data Layer
 * Responsible ONLY for authentication state (SRP).
 * Theme, CRM skin, and all preferences are in settingsStore.
 */
import { create } from 'zustand';

export type UserRole = 'admin' | 'mentor' | 'student';

interface AuthState {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  userId: string | null;
  email: string | null;
  phone: string | null;
  currentPath: string;

  // Actions
  setSession: (role: UserRole, session: any) => void;
  clearSession: () => void;
  navigate: (path: string) => void;
  initialize: () => void;
}

const getInitialState = () => {
  const savedRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') as UserRole | null : null;
  const savedUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
  const savedPhone = typeof window !== 'undefined' ? localStorage.getItem('userPhone') : null;

  if (savedRole && savedUserId) {
    return {
      isAuthenticated: true,
      userRole: savedRole,
      userId: savedUserId,
      email: savedEmail,
      phone: savedPhone,
      currentPath: `/${savedRole}/dashboard`,
    };
  }
  return {
    isAuthenticated: false,
    userRole: null,
    userId: null,
    email: null,
    phone: null,
    currentPath: '/login',
  };
};

const initialState = getInitialState();

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,

  setSession: (role, session) => {
    const user = session?.user || {};
    const token = session?.access_token;
    set({
      isAuthenticated: true,
      userRole: role,
      userId: user.id || null,
      email: user.email || null,
      phone: user.phone || null,
      currentPath: `/${role}/dashboard`,
    });
    localStorage.setItem('userRole', role);
    localStorage.setItem('userId', user.id || '');
    localStorage.setItem('userEmail', user.email || '');
    localStorage.setItem('userPhone', user.phone || '');
    if (token) {
      localStorage.setItem('accessToken', token);
    }
    // Record login timestamp for Security section session age display
    if (!localStorage.getItem('loginAt')) {
      localStorage.setItem('loginAt', new Date().toISOString());
    }
  },

  clearSession: () => {
    set({
      isAuthenticated: false,
      userRole: null,
      userId: null,
      email: null,
      phone: null,
      currentPath: '/login',
    });
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('loginAt');
    localStorage.removeItem('accessToken');
    document.cookie = 'authToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;';
  },

  navigate: (path) => {
    set({ currentPath: path });
  },

  initialize: () => {
    const state = getInitialState();
    set(state);
  },
}));

export default useAuthStore;
