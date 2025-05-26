import {
  createSlice,
  createAsyncThunk,
  type ActionReducerMapBuilder,
  type PayloadAction,
} from '@reduxjs/toolkit';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import {
  type User,
  type AuthTokens,
  type ApiError,
  type AuthState,
} from '../types/auth';

export const login = createAsyncThunk<
  { user: User; tokens: AuthTokens }, // Return type of the thunk (fulfilled)
  { email: string; password: string }, // Argument type (payload sent to thunk)
  { rejectValue: ApiError } // thunkapi config (custom reject type)
>('auth/login', async ({ email, password }, { rejectWithValue }) => {
  // action type string ('auth/login') and payload creator function which receives the payload and thunkAPI helpers (like rejectWithValue, dispatch).
  try {
    const response = await api.post<AuthTokens>('/login/', { email, password });
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
  { user: User; tokens: AuthTokens }, // Return type of the thunk (fulfilled)
  {
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    password: string;
    password2: string;
  }, // Argument type (payload sent to thunk)
  { rejectValue: ApiError } // thunkapi config (custom reject type)
>('auth/register', async (data, { rejectWithValue, dispatch }) => {
  // action type string ('auth/register') and payload creator function which receives the payload and thunkAPI helpers (like rejectWithValue, dispatch).
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

export const logout = createAsyncThunk<void, void, { rejectValue: ApiError }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        await api.post('/logout/', { refresh });
      }
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } catch (error: any) {
      return rejectWithValue(
        error.response.data || { detail: 'Logout failed' }
      );
    }
  }
);

const access = localStorage.getItem('access_token');
const refresh = localStorage.getItem('refresh_token');
let user = null;

if (access) {
  try {
    const decoded: any = jwtDecode(access);
    user = decoded.user_id ? { id: decoded.user_id } : null;
  } catch {}
}

const initialState: AuthState = {
  user,
  tokens: access && refresh ? { access, refresh } : null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<AuthState>) => {
    builder
      .addCase(login.pending, (state: AuthState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (
          state: AuthState,
          action: PayloadAction<{ user: User; tokens: AuthTokens }>
        ) => {
          state.loading = false;
          state.user = action.payload.user;
          state.tokens = action.payload.tokens;
        }
      )
      .addCase(
        login.rejected,
        (state: AuthState, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload?.detail || 'Login failed';
        }
      )
      .addCase(register.pending, (state: AuthState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        register.fulfilled,
        (
          state: AuthState,
          action: PayloadAction<{ user: User; tokens: AuthTokens }>
        ) => {
          state.loading = false;
          state.user = action.payload.user;
          state.tokens = action.payload.tokens;
        }
      )
      .addCase(
        register.rejected,
        (state: AuthState, action: PayloadAction<any>) => {
          state.loading = false;
          state.error =
            action.payload?.email?.[0] ||
            action.payload?.detail ||
            'Registration failed';
        }
      )
      .addCase(logout.pending, (state: AuthState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state: AuthState) => {
        state.user = null;
        state.tokens = null;
        state.error = null;
        state.loading = false;
      })
      .addCase(
        logout.rejected,
        (state: AuthState, action: PayloadAction<any>) => {
          state.error = action.payload?.detail || 'Logout failed';
          state.loading = false;
        }
      );
  },
});

export default authSlice.reducer;
