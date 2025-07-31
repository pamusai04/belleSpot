import axiosClient from '../../utils/axiosClient';
import { createAsyncThunk } from '@reduxjs/toolkit';

const getErrorMessage = (error) => {
  if (error.response?.status === 429) {
    return error.response?.data?.message || 'Too many requests, please try again later.';
  }
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Please check your connection and try again.';
  }
  if (error.response?.data?.errors) {
    return Object.values(error.response.data.errors)
      .map((err) => err.message || err)
      .join('\n');
  }
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    'Request failed'
  );
};

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      
      const response = profileData instanceof FormData
        ? await axiosClient.patch('/user/update-profile', profileData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        : await axiosClient.patch('/user/update-profile', profileData);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Profile update failed');
      }

      const updatedProfile = await axiosClient.get('/user/edit-profile');
      if (!updatedProfile.data.success) {
        throw new Error(updatedProfile.data.message || 'Failed to fetch updated profile');
      }

      return updatedProfile.data.data;
    } catch (error) {
     
      return rejectWithValue({
        message: getErrorMessage(error),
        status: error.response?.status,
        isNetworkError: !error.response,
      });
    }
  }
);

// Other thunks (unchanged, included for completeness)
export const getUserProfile = createAsyncThunk(
  'user/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/user/edit-profile');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch profile');
      }
      return response.data.data;
    } catch (error) {
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'] || 5;
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        return getUserProfile(_, { rejectWithValue });
      }
      return rejectWithValue({
        message: getErrorMessage(error),
        status: error.response?.status,
        isNetworkError: !error.response,
      });
    }
  }
);

export const getCart = createAsyncThunk(
  'cart/get',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/user/cart');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/add',
  async ({ shopName, serviceId }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/cart', { shopName, serviceId });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/remove',
  async ({ shopName, serviceId }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.delete('/user/cart', { data: { shopName, serviceId } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item from cart');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/auth/login', credentials);
      if (!response.data.success || !response.data.user) {
        throw new Error(response.data.message || 'Invalid response from server');
      }
      
      return response.data.user;
    } catch (error) {
      console.log(error.response?.data?.message || 'Login failed');
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/auth/check');
      return response.data.user;
    } catch (error) {
      if (error.response?.status !== 401) {
        return rejectWithValue(getErrorMessage(error));
      }
      return null;
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post('/auth/logout');
      return null;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const toggleFavoriteShop = createAsyncThunk(
  'user/toggleFavorite',
  async (shopId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch('/user/toggle-favorite', { shopId });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to toggle favorite');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: getErrorMessage(error),
        status: error.response?.status,
        isNetworkError: !error.response,
      });
    }
  }
);

export const getFavoriteShops = createAsyncThunk(
  'user/getFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/user/favorites');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch favorites');
      }
      return response.data.data;
    } catch (error) {
      return rejectWithValue({
        message: getErrorMessage(error),
        status: error.response?.status,
        isNetworkError: !error.response,
      });
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue({
          message: error.response.data.message || 'Registration failed',
          status: error.response.status,
        });
      }
      return rejectWithValue({
        message: error.message || 'Network error occurred',
        status: error.request ? 503 : 500,
      });
    }
  }
);

export const registerServiceProvider = createAsyncThunk(
  'auth/service/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/auth/service/register', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const registerAdmin = createAsyncThunk(
  'auth/admin/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/auth/admin/register', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const rateShop = createAsyncThunk(
  'user/rateShop',
  async ({ shopId, rating }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/rate-shop', { shopId, rating });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to rate shop');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: getErrorMessage(error),
        status: error.response?.status,
        isNetworkError: !error.response,
      });
    }
  }
);
