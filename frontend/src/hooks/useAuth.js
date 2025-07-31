import { useDispatch, useSelector } from 'react-redux';
import {
  registerUser,
  registerServiceProvider,
  registerAdmin,
  loginUser,
  logoutUser,
  checkAuth
 
} from '../redux/slices/authThunks';

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
    register: async (userData) => await dispatch(registerUser(userData)).unwrap(),
    registerProvider: async (providerData) => await dispatch(registerServiceProvider(providerData)).unwrap(),
    registerAdmin: async (adminData) => await dispatch(registerAdmin(adminData)).unwrap(),
    login: async (credentials) => await dispatch(loginUser(credentials)).unwrap(),
    logout: async () => await dispatch(logoutUser()).unwrap(),
    checkAuthentication: async () => await dispatch(checkAuth()).unwrap(),
    clearAuthError: () => dispatch(clearError()),
    clearAuthSuccessMessage: () => dispatch(clearSuccessMessage()),

    // Helper functions
    isAdmin: () => authState.user?.role === 'admin',
    isServiceProvider: () => authState.user?.role === 'provider',
    isRegularUser: () => authState.user?.role === 'user'
  };
};
