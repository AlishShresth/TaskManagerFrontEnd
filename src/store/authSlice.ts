import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import {
  type User,
  type AuthTokens,
  type ApiError,
  type AuthState,
} from '../types/auth';

export const login = createAsyncThunk<
  { user: User; tokens: AuthTokens },
  { email: string; password: string },
  { rejectValue: ApiError }
>('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await api.post<AuthTokens>('/token/', { email, password });
    const tokens = response.data;
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    const user: User = jwtDecode(tokens.access);
    return { user, tokens };
  } catch (error: any) {
    return rejectWithValue(error.response.data || { detail: 'Login failed' });
  }
});

export const register = createAsyncThunk<
  { user: User; tokens: AuthTokens },
  {
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    password: string;
    password2: string;
  },
  { rejectValue: ApiError }
>('auth/register', async (data, { rejectWithValue, dispatch }) => {
  try {
    await api.post('/register/', {
      ...data,
    });
    // Login after registration
    const loginResponse = await dispatch(
      login({ email: data.email, password: data.password })
    ).unwrap();
    return loginResponse;
  } catch (error: any) {
    return rejectWithValue(
      error.response.data || { detail: 'Registration failed' }
    );
  }
});

const initialState: AuthState = {
  user: null,
  tokens: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state: AuthState) => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      state.user = null;
      state.tokens = null;
      state.error = null;
    },
  },
  extraReducers: (builder: any) => {
    builder
      .addCase(login.pending, (state: AuthState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state: AuthState, action: any) => {
        state.loading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
      })
      .addCase(login.rejected, (state: AuthState, action: any) => {
        state.loading = false;
        state.error = action.payload?.detail || 'Login failed';
      })
      .addCase(register.pending, (state: AuthState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state: AuthState, action: any) => {
        state.loading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
      })
      .addCase(register.rejected, (state: AuthState, action: any) => {
        state.loading = false;
        state.error =
          action.payload?.email?.[0] ||
          action.payload?.detail ||
          'Registration failed';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
