import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../utils/axiosClient';

// Fetch all users (admin only)
export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/admin/user-profiles');
      return { data: response.data.data.users || [] };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Fetch all shops (admin only)
export const fetchAllShops = createAsyncThunk(
  'admin/fetchAllShops',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/admin/services-profiles');
      return { data: response.data.data.shops || [] };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    users: [],
    shops: [],
    loading: false,
    error: null,
    usersLoading: false,
    shopsLoading: false,
    usersError: null,
    shopsError: null
  },
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
      state.usersError = null;
      state.shopsError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Users reducers
      .addCase(fetchAllUsers.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = Array.isArray(action.payload.data) ? action.payload.data : [];
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.payload?.message || 'Failed to fetch users';
      })
      
      // Shops reducers
      .addCase(fetchAllShops.pending, (state) => {
        state.shopsLoading = true;
        state.shopsError = null;
      })
      .addCase(fetchAllShops.fulfilled, (state, action) => {
        state.shopsLoading = false;
        state.shops = Array.isArray(action.payload.data) ? action.payload.data : [];
      })
      .addCase(fetchAllShops.rejected, (state, action) => {
        state.shopsLoading = false;
        state.shopsError = action.payload?.message || 'Failed to fetch shops';
      });
  }
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;