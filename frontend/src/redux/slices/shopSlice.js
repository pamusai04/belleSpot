import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../utils/axiosClient';

export const createShop = createAsyncThunk(
  'shop/createShop',
  async (shopData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/shop/services', shopData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const checkShopExistence = createAsyncThunk(
  'shop/checkShopExistence',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/shop/check');
      return {
        hasShop: response.data?.hasShop || false,
        shop: response.data?.data || null,
        shopId: response.data?.shopId || null,
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return { hasShop: false, shop: null, shopId: null };
      }
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchShop = createAsyncThunk(
  'shop/fetchShop',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/shop/services');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateShop = createAsyncThunk(
  'shop/updateShop',
  async (updateData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch('/shop/services', updateData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const addSubService = createAsyncThunk(
  'shop/addSubService',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/shop/sub-services', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const deleteService = createAsyncThunk(
  'shop/deleteService',
  async (serviceId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(
        '/shop/delete-service',
        { _id: serviceId },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return { serviceId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const shopSlice = createSlice({
  name: 'shop',
  initialState: {
    shop: null,
    hasShop: false,
    shopId: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createShop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createShop.fulfilled, (state, action) => {
        state.loading = false;
        state.shop = action.payload.data;
        state.hasShop = true;
        state.shopId = action.payload.data._id;
      })
      .addCase(createShop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(checkShopExistence.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkShopExistence.fulfilled, (state, action) => {
        state.loading = false;
        state.hasShop = action.payload.hasShop;
        state.shop = action.payload.shop;
        state.shopId = action.payload.shopId;
      })
      .addCase(checkShopExistence.rejected, (state, action) => {
        state.loading = false;
        if (action.payload?.message && !action.payload.message.includes('404')) {
          state.error = action.payload.message;
        }
      })
      .addCase(fetchShop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShop.fulfilled, (state, action) => {
        state.loading = false;
        state.shop = action.payload.data;
        state.hasShop = !!action.payload.data;
        state.shopId = action.payload.data?._id || null;
      })
      .addCase(fetchShop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        state.hasShop = false;
        state.shopId = null;
      })
      .addCase(updateShop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateShop.fulfilled, (state, action) => {
        state.loading = false;
        state.shop = action.payload.data;
      })
      .addCase(updateShop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(addSubService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSubService.fulfilled, (state, action) => {
        state.loading = false;
        const serviceId = action.meta.arg.get('serviceId');
        const serviceIndex = state.shop?.services?.findIndex(s => s._id === serviceId);
        if (serviceIndex !== -1) {
          state.shop.services[serviceIndex].subServices = action.payload.data;
        }
      })
      .addCase(addSubService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(deleteService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.loading = false;
        if (state.shop && state.shop.services) {
          state.shop.services = state.shop.services.filter(
            (service) => service._id !== action.payload.serviceId
          );
        }
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });
  },
});

export const { clearError } = shopSlice.actions;
export default shopSlice.reducer;