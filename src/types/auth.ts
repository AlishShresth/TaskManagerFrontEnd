export interface User {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  loading: boolean;
  error: string | null;
}

export interface ApiError {
  detail?: string;
  email?: string[];
  [key: string]: any;
}
