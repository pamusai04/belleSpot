import { createSlice } from '@reduxjs/toolkit';
import {
  registerUser,
  registerServiceProvider,
  registerAdmin,
  loginUser,
  checkAuth,
  logoutUser,
} from './authThunks';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  successMessage: null,
  loginAttempts: 0, 
  isLocked: false, 

};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
      state.isLocked = false;
    },
    logout: (state) => { // Add logout reducer
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    }
  },
  extraReducers: (builder) => {
    builder
      // Registration cases
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.successMessage = action.payload.message || 'Registration successful!';
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
      })

      .addCase(registerServiceProvider.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.successMessage = action.payload.message || 'Service provider registration successful!';
        state.error = null;
      })
      .addCase(registerServiceProvider.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Service provider registration failed';
      })

      .addCase(registerAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.successMessage = action.payload.message || 'Admin registration successful!';
        state.error = null;
      })
      .addCase(registerAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Admin registration failed';
      })

      // Login cases with comprehensive error handling
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        state.loginAttempts = 0; // Reset on successful login
        state.isLocked = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
        state.loginAttempts += 1;
        
        // Lock account after 3 failed attempts (example)
        if (state.loginAttempts >= 3) {
          state.isLocked = true;
          state.error = 'Account temporarily locked due to multiple failed attempts';
        }
      })

      // Auth check cases
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload || 'Authentication check failed';
      })

      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.successMessage = 'Logged out successfully';
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Logout failed';
      });
  },
});

export const { 
  clearError, 
  clearSuccessMessage,
  resetLoginAttempts 
} = authSlice.actions;

export default authSlice.reducer;