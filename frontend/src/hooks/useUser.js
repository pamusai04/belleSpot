
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfile, updateUserProfile, getCart, addToCart, removeFromCart, toggleFavoriteShop, getFavoriteShops, rateShop } from '../redux/slices/authThunks';
import { 
  clearUserError, 
  clearUserSuccess, 
  clearCartError, 
  clearCartMessage,
  clearFavoritesError,
  clearFavoritesMessage,
  clearRatingError, 
  clearRatingMessage,
  resetProfile
} from '../features/user/userSlice';
import { useCallback } from 'react';

export const useUser = () => {
  const dispatch = useDispatch();
  const { 
    profile, 
    cart,
    favorites,
    loading, 
    cartLoading,
    favoritesLoading,
    ratingLoading,
    error, 
    cartError,
    favoritesError,
    ratingError,
    successMessage,
    cartMessage,
    favoritesMessage,
    ratingMessage,
  } = useSelector((state) => state.user);
  const { shops } = useSelector((state) => state.filter);

  // Profile actions
  const fetchProfile = useCallback(() => dispatch(getUserProfile()), [dispatch]);
  const updateProfile = useCallback((profileData) => dispatch(updateUserProfile(profileData)), [dispatch]);
  const resetUserProfile = useCallback(() => dispatch(resetProfile()), [dispatch]); // Added resetProfile
  
  // Cart actions
  const fetchCart = useCallback(() => dispatch(getCart()), [dispatch]);
  const addItemToCart = useCallback((cartItem) => dispatch(addToCart(cartItem)), [dispatch]);
  const removeItemFromCart = useCallback(({ shopName, serviceId }) => dispatch(removeFromCart({ shopName, serviceId })), [dispatch]);
  
  // Favorites actions
  const fetchFavorites = useCallback(() => dispatch(getFavoriteShops()), [dispatch]);
  const toggleFavorite = useCallback((shopId) => dispatch(toggleFavoriteShop(shopId)), [dispatch]);
  const isFavorite = useCallback((shopId) => favorites?.includes(shopId), [favorites]);
  
  // Rating actions
  const rateShopAction = useCallback(({ shopId, rating }) => dispatch(rateShop({ shopId, rating })), [dispatch]);

  // Calculate cart total (fixed price access)
  const cartTotal = cart?.reduce((total, shop) => {
    const shopTotal = shop.services.reduce((sum, service) => {
      return sum + (service.price || 0) * service.quantity;
    }, 0);
    return total + shopTotal;
  }, 0) || 0;

  // Count total items in cart
  const cartItemCount = cart?.reduce((count, shop) => {
    return count + shop.services.reduce((sum, service) => sum + service.quantity, 0);
  }, 0) || 0;

  return {
    // Profile related
    shops,
    profile,
    profileLoading: loading,
    profileError: error,
    profileSuccess: successMessage,
    fetchProfile,
    updateProfile,
    resetProfile: resetUserProfile, // Added resetProfile
    clearProfileError: () => dispatch(clearUserError()),
    clearProfileSuccess: () => dispatch(clearUserSuccess()),
    hasProfile: !!profile,
    getProfileImage: () => profile?.profilePhoto || '/default-avatar.jpg',

    // Cart related
    cart,
    cartLoading,
    cartError,
    cartMessage,
    cartTotal,
    cartItemCount,
    fetchCart,
    addItemToCart,
    removeItemFromCart,
    clearCartError: () => dispatch(clearCartError()),
    clearCartMessage: () => dispatch(clearCartMessage()),

    // Favorites related
    favorites,
    favoritesLoading,
    favoritesError,
    favoritesMessage,
    fetchFavorites,
    toggleFavorite,
    isFavorite,
    clearFavoritesError: () => dispatch(clearFavoritesError()),
    clearFavoritesMessage: () => dispatch(clearFavoritesMessage()),

    // Rating related
    ratingLoading, 
    ratingError, 
    ratingMessage, 
    rateShop: rateShopAction, 
    clearRatingError: () => dispatch(clearRatingError()), 
    clearRatingMessage: () => dispatch(clearRatingMessage())
  };
};