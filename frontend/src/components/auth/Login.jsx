// src/components/auth/Login.jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useEffect, useState } from 'react';
import { clearError } from '../../redux/slices/authSlice';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

const loginSchema = z.object({
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password is too weak"),
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const { register, handleSubmit, formState: { errors } } = useForm({ 
    resolver: zodResolver(loginSchema),
  });
  const { login } = useAuth();

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
  try {
    setLocalLoading(true);
    await login(data);
    toast.success('Login successful!'); 
  } catch (err) {
    toast.error(err || 'Login failed');
  } finally {
    setLocalLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Improved Logo Section */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute w-full h-full rounded-full border-4 border-pink-300"></div>
                <div className="relative flex items-center justify-center w-8 h-8">
                  <div className="absolute w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-purple-500"></div>
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-purple-500"></div>
                </div>
              </div>
              <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                BelleSpot
              </span>
            </div>
            <h2 className="font-bold text-2xl tracking-tight bg-gradient-to-r from-gray-300 to-pink-500 bg-clip-text text-transparent">Login</h2>
            <span className="text-sm text-gray-500">Welcome back to Beauty Connections</span>
          </div>

          {error && (
            <div className="alert alert-error mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                className={`input input-bordered w-full ${errors.emailId ? 'input-error' : ''}`}
                {...register('emailId')}
              />
              {errors.emailId && (
                <span className="text-error text-sm mt-1">{errors.emailId.message}</span>
              )}
            </div>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`input input-bordered w-full pr-10 ${errors.password ? 'input-error' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    < Eye className="h-5 w-5" />
                  ) : (
                    < EyeOff className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-error text-sm mt-1">{errors.password.message}</span>
              )}
            </div>

            <div className="form-control mt-8 flex justify-center">
              <button
                type="submit"
                className={`btn bg-purple-600 w-full ${localLoading ? 'loading' : ''}`}
                disabled={localLoading}
              >
                {localLoading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
          <div className="text-center mt-6">
            <span className="text-sm">
              Don't have an account?{' '}
              <NavLink to="/signup" className="link link-primary">
                Sign Up
              </NavLink>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;