import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { User } from '../features/auth/types/auth.types';

const TOKEN_KEY = 'auth_token';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  restoreAuth: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setAuth: async (user, token) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    set({ user, isAuthenticated: true });
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ user: null, isAuthenticated: false });
  },

  restoreAuth: async () => {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
}));
