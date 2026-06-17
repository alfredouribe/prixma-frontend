import api from '../../../lib/api';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/auth.types';

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<{ data: User; token: string }>('/auth/register', payload);
    return { user: data.data, token: data.token };
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<{ data: User; token: string }>('/auth/login', payload);
    return { user: data.data, token: data.token };
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(payload: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> {
    await api.post('/auth/reset-password', payload);
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<{ data: User }>('/auth/me');
    return data.data;
  },
};
