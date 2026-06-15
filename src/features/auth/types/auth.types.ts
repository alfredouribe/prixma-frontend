export interface User {
  id: string;
  email: string;
  status: 'active' | 'suspended' | 'banned';
  onboarding_completed: boolean;
  email_verified_at: string | null;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  password_confirmation: string;
  date_of_birth: string;
  terms_accepted: boolean;
  privacy_accepted: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}
