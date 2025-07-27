
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Home as HomeIcon, LogOut } from "lucide-react";

const SimpleHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const goToDashboard = () => {
  if (user?.role === 'admin') navigate('/admin-dashboard');
  if (user?.role === 'serviceProvider') navigate('/provider-dashboard');
};

  const goToHome = () => navigate('/');

  return (
    <div className="fixed bg-gray-100 top-0 left-0 right-0 z-50">
      <div className="navbar shadow-sm px-5">
        {/* Logo/Dashboard Link */}
        <div className="flex-1 cursor-pointer">
          <div onClick={goToDashboard} className="text-center p-0 normal-case text-xl">
            <div className="flex items-center space-x-2">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute w-full h-full rounded-full border-4 border-pink-300"></div>
                <div className="relative flex items-center justify-center w-8 h-8">
                  <div className="absolute w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-purple-500"></div>
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-purple-500"></div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  BelleSpot
                </span>
                <span className="hidden md:block text-xs -mt-1 text-gray-500">Beauty Connections</span>
              </div>
            </div>
          </div>
        </div>
        

        {/* Right Side */}
        <div className="flex gap-2" >
          <button 
            onClick={goToHome}
            className=" tooltip tooltip-bottom btn btn-circle text-purple-600 transition-all duration-300 ease-in-out border-gray-600 bg-purple-100 hover:bg-purple-800 hover:text-white"
            data-tip="Home"
          >
            <HomeIcon className="h-5 w-5" />
          </button>

          <button 
            onClick={logout}
            className=" tooltip tooltip-bottom btn btn-circle text-pink-600 transition-all duration-300 ease-in-out border-gray-600 bg-purple-100 hover:bg-pink-500 hover:text-white"
            data-tip="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleHeader;