// features/filter/filterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeButton: 'all',
  ratingFilter: null,
  sortBy: null,
  homeServiceFilter: false,
  searchQuery: '',
  filteredShops: [],
  shops: [],
  offers: [],
  loading: false,
  error: null,
  userLocation: null // Add userLocation to initial state
};

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setActiveButton: (state, action) => {
      state.activeButton = action.payload;
    },
    setRatingFilter: (state, action) => {
      state.ratingFilter = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    toggleHomeService: (state) => {
      state.homeServiceFilter = !state.homeServiceFilter;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setShops: (state, action) => {
      state.shops = action.payload;
    },
    setOffers: (state, action) => {
      state.offers = action.payload;
    },
    setFilteredShops: (state, action) => {
      state.filteredShops = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    updateShops: (state, action) => {
      const updatedShop = action.payload;
      state.shops = state.shops.map((shop) =>
        shop._id === updatedShop._id ? updatedShop : shop
      );
      state.filteredShops = state.filteredShops.map((shop) =>
        shop._id === updatedShop._id ? updatedShop : shop
      );
    },
    setUserLocation: (state, action) => { // Add this new reducer
      state.userLocation = action.payload;
    }
  }
});

export const { 
  setActiveButton, 
  setRatingFilter, 
  setSortBy, 
  toggleHomeService, 
  setSearchQuery, 
  setShops, 
  setOffers, 
  setFilteredShops, 
  setError, 
  setLoading,
  updateShops,
  setUserLocation // Export the new action
} = filterSlice.actions;
export default filterSlice.reducer;