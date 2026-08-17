/**
 * Authentication State Store (Placeholder)
 * Manages user login state, token, and user profile data.
 * Can be integrated with Zustand, Redux Toolkit, or React Context.
 */

import { User } from '@/types/auth';

export interface AuthStoreState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

// Initial state placeholder
export const initialAuthState: AuthStoreState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  setUser: (user: User | null) => {
    console.log('[authStore] setUser called:', user);
  },
  setToken: (token: string | null) => {
    console.log('[authStore] setToken called:', token);
  },
  logout: () => {
    console.log('[authStore] logout called');
  },
};

export default initialAuthState;
