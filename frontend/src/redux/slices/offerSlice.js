import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../utils/axiosClient';

export const createOffer = createAsyncThunk(
  'offer/createOffer',
  async (offerData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/shop/offers', offerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchOffers = createAsyncThunk(
  'offer/fetchOffers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/shop/offers');
      
      return { data: response.data.offers || [] }; // Extract offers array
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateOffer = createAsyncThunk(
  'offer/updateOffer',
  async (offerData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch('/shop/offers', offerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const deleteOffer = createAsyncThunk(
  'offer/deleteOffer',
  async (offerId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.delete('/shop/offers', {
        data: { _id: offerId },
      });
      return { offerId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const offerSlice = createSlice({
  name: 'offer',
  initialState: {
    offers: [],
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
      .addCase(createOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.offers.push(action.payload.data);
      })
      .addCase(createOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(fetchOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.offers = Array.isArray(action.payload.data) ? action.payload.data : [];
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(updateOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOffer.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOffer = action.payload.data;
        state.offers = state.offers.map((offer) =>
          offer._id === updatedOffer._id ? updatedOffer : offer
        );
      })
      .addCase(updateOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(deleteOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.offers = state.offers.filter((offer) => offer._id !== action.payload.offerId);
      })
      .addCase(deleteOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });
  },
});


export const { clearError } = offerSlice.actions;
export default offerSlice.reducer;