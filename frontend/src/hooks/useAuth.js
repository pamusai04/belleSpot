// hooks/useAuth.js
import { useDispatch, useSelector } from 'react-redux';
import {
  registerUser,
  registerServiceProvider,
  registerAdmin,
  loginUser,
  logoutUser,
  checkAuth,
  // clearError,
  // clearSuccessMessage
} from '../redux/slices/authThunks'; //../features/auth/authThunks

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector(state => state.auth);

  return {
    // State
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    loading: authState.loading,
    error: authState.error,
    successMessage: authState.successMessage,

    // Actions
    register: (userData) => dispatch(registerUser(userData)),
    registerProvider: (providerData) => dispatch(registerServiceProvider(providerData)),
    registerAdmin: (adminData) => dispatch(registerAdmin(adminData)),
    login: (credentials) => dispatch(loginUser(credentials)),
    logout: () => dispatch(logoutUser()),
    checkAuthentication: () => dispatch(checkAuth()),
    clearAuthError: () => dispatch(clearError()),
    clearAuthSuccessMessage: () => dispatch(clearSuccessMessage()),

    // Helper functions
    isAdmin: () => authState.user?.role === 'admin',
    isServiceProvider: () => authState.user?.role === 'provider',
    isRegularUser: () => authState.user?.role === 'user'
  };
};