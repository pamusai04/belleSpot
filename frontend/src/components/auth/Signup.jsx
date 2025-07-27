// src/components/auth/Signup.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const signupSchema = z.object({
  firstName: z.string().min(3, 'Minimum 3 characters required').max(50, 'Name too long'),
  emailId: z.string().email('Invalid email address').max(100, 'Email too long'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  gender: z.enum(['male', 'female', 'other'], 'Please select a gender')
});

function Signup() {
  const { register: authRegister, registerProvider } = useAuth(); // Renamed to avoid conflict
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('user');
  const navigate = useNavigate();
  const { isAuthenticated, loading, successMessage, error } = useSelector((state) => state.auth);

  const { register,  handleSubmit, formState: { errors }, reset} = useForm({ resolver: zodResolver(signupSchema)});

  useEffect(() => {
    if (isAuthenticated && successMessage) {
      toast.success(successMessage);
      const timer = setTimeout(() => {
        navigate('/');
      }, 2000);
      return () => clearTimeout(timer);
    }
    
    if (error) {
      toast.error(error);
    }
  }, [isAuthenticated, error, successMessage, navigate]);

  useEffect(() => {
      if (error) {
        toast.error(error.message || 'Registration failed');
      }
      if (successMessage) {
          toast.success(successMessage);
      }
  }, [error, successMessage]);

  const onSubmit = async (data) => {
      try {
          if (role === 'user') {
              authRegister(data);
          } else {
              registerProvider(data);
          }
          reset();
      } catch (err) {
          // Error is already handled by the thunk and shown via toast
          console.error('Registration error:', err);
      }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Logo Section */}
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
            <h2 className="font-bold text-2xl tracking-tight bg-gradient-to-r from-gray-300 to-pink-500 bg-clip-text text-transparent">Sign Up</h2>
            <span className="text-sm text-gray-500">Create your beauty account</span>
          </div>

          {/* Role Selection */}
          <div className="flex justify-center gap-4 mb-4">
            <button
              type="button"
              className={`btn w-32 ${role === 'user' ? 'bg-pink-600 text-white hover:bg-pink-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setRole('user')}
            >
              User
            </button>
            <button
              type="button"
              className={`btn w-32 ${role === 'provider' ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setRole('provider')}
            >
              Provider
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* First Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">First Name</span>
              </label>
              <input
                type="text"
                placeholder="John"
                className={`input input-bordered w-full ${errors.firstName ? 'input-error' : ''}`}
                {...register('firstName')}
              />
              {errors.firstName && (
                <span className="text-error text-sm mt-1">{errors.firstName.message}</span>
              )}
            </div>

            {/* Email */}
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

            {/* Password */}
            <div className="form-control">
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

            {/* Gender */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Gender</span>
              </label>
              <select
                className={`select select-bordered w-full ${errors.gender ? 'select-error' : ''}`}
                {...register('gender')}
              >
                <option value="">Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <span className="text-error text-sm mt-1">{errors.gender.message}</span>
              )}
            </div>

            {/* Submit Button */}
            <div className="form-control mt-6 flex justify-center">
              <button
                type="submit"
                className={`btn w-full ${role === 'user' ? 'bg-pink-600 hover:bg-pink-700' : 'bg-purple-600 hover:bg-purple-700'} ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Signing up...' : `Sign Up as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
              </button>
            </div>
          </form>

          <div className="text-center mt-6">
            <span className="text-sm">
              Already have an account?{' '}
              <NavLink to="/login" className="link link-primary">
                Login
              </NavLink>
            </span>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Signup;