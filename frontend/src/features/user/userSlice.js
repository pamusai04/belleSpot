
import { createSlice } from '@reduxjs/toolkit';
import { getUserProfile, updateUserProfile, getCart, addToCart, removeFromCart, toggleFavoriteShop, getFavoriteShops, rateShop } from '../../redux/slices/authThunks';

const initialState = {
  profile: null,
  cart: [],
  favorites: [],
  loading: false,
  cartLoading: false,
  favoritesLoading: false,
  ratingLoading: false,
  error: null,
  cartError: null,
  favoritesError: null,
  ratingError: null,
  successMessage: null,
  cartMessage: null,
  favoritesMessage: null,
  ratingMessage: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    clearUserSuccess: (state) => {
      state.successMessage = null;
    },
    clearCartError: (state) => {
      state.cartError = null;
    },
    clearCartMessage: (state) => {
      state.cartMessage = null;
    },
    resetProfile: (state) => {
      state.profile = null;
      state.cart = [];
    },
    clearFavoritesError: (state) => {
      state.favoritesError = null;
    },
    clearFavoritesMessage: (state) => {
      state.favoritesMessage = null;
    },
    clearRatingError: (state) => {
      state.ratingError = null;
    },
    clearRatingMessage: (state) => {
      state.ratingMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Profile
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.successMessage = 'Profile updated successfully';
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Cart
      .addCase(getCart.pending, (state) => {
        state.cartLoading = true;
        state.cartError = null;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.cartLoading = false;
        state.cart = action.payload;
      })
      .addCase(getCart.rejected, (state, action) => {
        state.cartLoading = false;
        state.cartError = action.payload;
      })
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.cartLoading = true;
        state.cartError = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.cartLoading = false;
        state.cartMessage = action.payload.message;
        state.cart = action.payload.data;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.cartLoading = false;
        state.cartError = action.payload;
      })
      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.cartLoading = true;
        state.cartError = null;
        state.cartMessage = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.cartLoading = false;
        state.cartMessage = action.payload.message;
        const { shopName, serviceId } = action.meta.arg;
        state.cart = state.cart.map(shop => {
          if (shop.shopName === shopName) {
            return {
              ...shop,
              services: shop.services.filter(service => service.service_id.toString() !== serviceId),
            };
          }
          return shop;
        }).filter(shop => shop.services.length > 0);
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.cartLoading = false;
        state.cartError = action.payload;
      })
      // Toggle Favorite
      .addCase(toggleFavoriteShop.pending, (state) => {
        state.favoritesLoading = true;
        state.favoritesError = null;
        state.favoritesMessage = null;
      })
      .addCase(toggleFavoriteShop.fulfilled, (state, action) => {
        state.favoritesLoading = false;
        state.favoritesMessage = action.payload.message;
        if (action.payload.favorites) {
          state.favorites = action.payload.favorites;
        }
      })
      .addCase(toggleFavoriteShop.rejected, (state, action) => {
        state.favoritesLoading = false;
        state.favoritesError = action.payload;
      })
      // Get Favorites
      .addCase(getFavoriteShops.pending, (state) => {
        state.favoritesLoading = true;
        state.favoritesError = null;
      })
      .addCase(getFavoriteShops.fulfilled, (state, action) => {
        state.favoritesLoading = false;
        state.favorites = action.payload;
      })
      .addCase(getFavoriteShops.rejected, (state) => {
        state.favoritesLoading = false;
        state.favoritesError = action.payload;
      })
      // Rate Shop
      .addCase(rateShop.pending, (state) => {
        state.ratingLoading = true;
        state.ratingError = null;
      })
      .addCase(rateShop.fulfilled, (state, action) => {
        state.ratingLoading = false;
        state.ratingMessage = action.payload.message;
      })
      .addCase(rateShop.rejected, (state, action) => {
        state.ratingLoading = false;
        state.ratingError = action.payload.message;
      });
  },
});

export const {
  clearUserError,
  clearUserSuccess,
  clearCartError,
  clearCartMessage,
  resetProfile,
  clearFavoritesError,
  clearFavoritesMessage,
  clearRatingError,
  clearRatingMessage,
} = userSlice.actions;

export default userSlice.reducer;
