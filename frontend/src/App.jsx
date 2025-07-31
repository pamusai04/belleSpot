import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Signup from './components/auth/Signup';
import Login from './components/auth/Login';
import Home from './components/user/Home';
import Layout from './components/common/Layout';
import Bookings from './components/user/Bookings';
import Favorites from './components/user/Favorites';
import UserProfile from './components/user/UserProfile';
import Cart from './components/user/Cart';
import Location from './components/user/Location';
import SalonDetail from './components/user/SalonDetail';
import LoadingSpinner from './components/common/LoadingSpinner';
import ProviderDashboard from './components/service-provider/ProviderDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import Header from './components/common/Header';
import SimpleHeader from './components/common/SimpleHeader';
import { useAuth } from './hooks/useAuth';
import CreateShop from './components/service-provider/CreateShop';
import ManageShop from './components/service-provider/ManageShop';
import ViewShop from './components/service-provider/ViewShop';
import ManageOffers from './components/service-provider/ManageOffers';
import { clearSuccessMessage } from './redux/slices/authSlice';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const { checkAuthentication } = useAuth();
  const hasCheckedAuth = useRef(false); 

  useEffect(() => {
    const checkAuthAndHandleRateLimit = async () => {
      
      if (isAuthenticated || hasCheckedAuth.current) return;
      
      hasCheckedAuth.current = true; 
      try {
        
         checkAuthentication().unwrap();
      } catch (error) {
        
        if (error.status === 429) {
          const retryAfter = error.data?.retryAfter || 60;
          toast.error(`Too many requests. Please try again in ${retryAfter} seconds.`, {
            autoClose: Math.min(retryAfter * 1000, 10000),
            position: 'top-center',
            closeButton: false,
            draggable: false,
            closeOnClick: false,
          });
        } else if (error.status !== 401) {
         toast.error(error.data?.error || 'Authentication check failed', {
            autoClose: 3000,
            position: 'top-center',
          });
        }
      }
    };

    checkAuthAndHandleRateLimit();
  }, [checkAuthentication, isAuthenticated]); 

  useEffect(() => {
    if (window.location.pathname === '/login' || window.location.pathname === '/signup') {
      dispatch(clearSuccessMessage());
    }
  }, [dispatch]);

  const getHomePath = () => {
    if (!isAuthenticated) return '/login';
    switch (user?.role) {
      case 'admin':
        return '/admin-dashboard';
      case 'serviceProvider':
        return '/provider-dashboard';
      default:
        return '/';
    }
  };

  // Dynamic header rendering
  const getHeader = () => {
    if (!isAuthenticated) return null;
    return user?.role === 'user' ? <Header /> : <SimpleHeader />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br bg-gray-100">
        <div className="flex flex-col items-center justify-center space-y-6">
          <LoadingSpinner />
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              BelleSpot
            </h2>
            <div className="flex justify-center">
              <span className="loading loading-dots loading-lg text-pink-500"></span>
            </div>
            <div className="relative">
              <p className="text-sm text-gray-600 font-medium">
                Loading your beauty experience
                <span className="inline-block ml-1 animate-bounce">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </p>
              <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden mt-2 mx-auto">
                <div className="h-full bg-gradient-to-r from-pink-400 to-purple-500"></div>
              </div>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <>
      {getHeader()}
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to={getHomePath()} replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to={getHomePath()} replace /> : <Signup />}
        />

        {/* User Routes (Accessible to all authenticated users) */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Layout />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<Home />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="cart" element={<Cart />} />
          <Route path="location" element={<Location />} />
          <Route path="/salon/:salonName" element={<SalonDetail />} />
        </Route>

        {/* Service Provider Routes (Protected) */}
        <Route
          path="/provider-dashboard"
          element={
            isAuthenticated && user?.role === 'serviceProvider' ? (
              <ProviderDashboard />
            ) : (
              <Navigate to={getHomePath()} replace />
            )
          }
        >
          <Route path="create-shop" element={<CreateShop />} />
          <Route path="manage-shop" element={<ManageShop />} />
          <Route path="view-shop" element={<ViewShop />} />
          <Route path="manage-offers" element={<ManageOffers />} />
        </Route>

        {/* Admin Routes (Protected) */}
        <Route
          path="/admin-dashboard/*"
          element={
            isAuthenticated && user?.role === 'admin' ? (
              <AdminDashboard />
            ) : (
              <Navigate to={getHomePath()} replace />
            )
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to={getHomePath()} replace />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;