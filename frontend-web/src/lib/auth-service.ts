import { api } from './api';

export interface UserProfile {
  id: string;
  phone: string;
  display_name: string | null;
  location: string;
  bank_name: string | null;
  bank_account_number: string | null;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: UserProfile;
}

export const authService = {
  sendOtp: async (phone: string) => {
    return api.post<{ success: boolean; message: string }>('/auth/otp/send', { phone }, { skipAuth: true });
  },

  verifyOtp: async (phone: string, otp: string) => {
    const data = await api.post<AuthResponse>('/auth/otp/verify', { phone, otp }, { skipAuth: true });
    localStorage.setItem('fitnaija-access-token', data.access_token);
    localStorage.setItem('fitnaija-refresh-token', data.refresh_token);
    return data;
  },

  refresh: async (refreshToken: string) => {
    return api.post<{ access_token: string; refresh_token: string }>(
      '/auth/refresh',
      { refresh_token: refreshToken },
      { skipAuth: true }
    );
  },

  getProfile: async () => {
    return api.get<UserProfile>('/users/me');
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    return api.post<UserProfile>('/users/profile', data);
  },

  logout: () => {
    localStorage.removeItem('fitnaija-access-token');
    localStorage.removeItem('fitnaija-refresh-token');
  },
};
