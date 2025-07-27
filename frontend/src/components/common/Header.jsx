import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, ShoppingCart, LogOut } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import { useFilter } from '../../hooks/useFilter';
import { useAuth } from '../../hooks/useAuth';
import { useUser } from '../../hooks/useUser';
const Header = () => {
  const { 
    activeButton, 
    searchQuery, 
    handleSearchChange,
    applyFilters,
    removeDate
  } = useFilter();
  const {cart, profile} = useUser();
  const { user, logout } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const searchInputRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();
  
  const handleSearch = (e) => {
    const searchTerm = e.target.value;
    handleSearchChange(searchTerm);
    applyFilters();
  };
  
  let totalServices = cart.reduce((sum, item) => sum + item.services.length, 0);


  const handleLogout = () => {
    logout();
    removeDate([]);
    navigate('/login'); // Redirect to login page after logout
    setShowProfileDropdown(false); // Close dropdown after logout
  };

  // Mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      // For mobile search
      if (isMobile && showSearch && searchInputRef.current && 
          !searchInputRef.current.contains(event.target)) {
        setShowSearch(false);
      }
      
      // For profile dropdown
      if (showProfileDropdown && profileDropdownRef.current && 
          !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, showSearch, showProfileDropdown]);

  return (
    <div className="fixed bg-gray-100 top-0 left-0 right-0 z-50">
      <div className="navbar shadow-sm relative transition-all duration-300 ease-in-out md:px-10">
        {/* Logo/Brand */}
        <div className="flex-1">
          <Link to="/" className="text-center p-0 normal-case text-xl">
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
          </Link>
        </div>

        {/* Navigation Icons */}
        <div className="flex-none flex items-center gap-0.5 md:gap-3">
          {/* Search Area */}
          <div className="flex items-center">
            {!isMobile && (
              <div className="mr-2 transition-all duration-300 ease-in-out">
                <div className="relative">
                  <input
                    value={searchQuery}
                    onChange={handleSearch}
                    type="text"
                    placeholder="Search for shops or services..."
                    className={`min-[425px]:w-80 w-64 pl-10 pr-4 py-2 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 ${activeButton==='male' ? 'focus:ring-purple-500 focus:border-transparen text-purple-700 ' :'focus:ring-pink-500 text-pink-700 focus:border-transparen' } t transition-all duration-300 ease-in-out `}
                    autoFocus
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}
            {isMobile && (
              <button 
                className={`btn  btn-circle border-1  hover:bg-pink-100 ${activeButton==='male'?'hover:text-purple-500 hover:border-purple-500' :'hover:text-pink-500 hover:border-pink-500' } transition-all duration-300 ease-in-out`}
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Location Marker */}
          <Link to="/location">
            <button className={`btn btn-circle sm:border-1.5 transition-all duration-300 ease-in-out ${activeButton==='male'?'hover:border-purple-500 hover:bg-purple-100 hover:text-purple-500' : 'hover:border-pink-500 hover:bg-pink-100 hover:text-pink-500'}`}>
              <MapPin className="h-5 w-5"/>
            </button>
          </Link>
          
          {/* Shopping Cart */}
          <div className="dropdown dropdown-end mr-2">
            <div tabIndex={0} role="button" className={`btn btn-circle relative transition-all duration-300 ease-in-out ${activeButton==='male'?'hover:border-purple-500 hover:bg-purple-100 hover:text-purple-500' : 'hover:border-pink-500 hover:bg-pink-100 hover:text-pink-500'}`}>
              <ShoppingCart className="h-5 w-5" />
              <span className={`absolute -top-1 -right-1 badge badge-md text-white border-none w-4 h-4 flex items-center justify-center p-0 ${activeButton==='male'? 'bg-primary': 'bg-secondary'}`}>{ totalServices || user?.cart_length || 0}</span>
            </div>
            <div tabIndex={0} className="card card-compact dropdown-content z-50 mt-3 w-52 shadow transition-all duration-300 ease-in-out">
              <div className="card-body bg-purple-100 text-gray-600 rounded-lg">
                <span className="text-lg font-bold">{totalServices || user?.cart_length || 0} Items</span>
                <Link to="/cart" className="card-actions">
                  <button className={`btn btn-block border-0 transition-all duration-300 ease-in-out ${activeButton==='male'? 'bg-purple-400 hover:bg-purple-600': 'bg-pink-400 hover:bg-pink-600'}`}>View cart</button>
                </Link>
              </div>
            </div>
          </div>

         
          {/* Mobile: Show dropdown */}
          <div className="relative " ref={profileDropdownRef}>
            <button 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="btn btn-ghost btn-circle hover:bg-gray-200 transition-all duration-300 ease-in-out border-2 border-black hover:border-pink-500"
            >
              <div className="w-10 rounded-full border-2">
                <img
                  className="rounded-full"
                  alt="User profile"
                  src={
                    profile?.profilePhoto?.url ||
                    user?.profilePhoto ||
                    "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                  }
                />
              </div>

            </button>
            
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 p-3">
                <Link 
                  to="/profile" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-100 hover:text-purple-700 rounded-md font-semibold transition-all duration-200"
                  onClick={() => setShowProfileDropdown(false)}
                >
                  My Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="block w-full font-semibold rounded-md text-left px-4 py-2 text-sm text-pink-600 bg-pink-100 hover:bg-pink-500 hover:text-white transition-all duration-200 my-2"
                >
                  Sign out
                </button>
                {user.role === 'serviceProvider' ? (
                  <Link 
                    to="/provider-dashboard" 
                    className="block w-full font-semibold rounded-md text-left px-4 py-2 text-sm text-pink-600 bg-pink-100 hover:bg-pink-500 hover:text-white transition-all duration-200 my-2"
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    Provider Dashboard
                  </Link>
                ) : ''}
                {user.role === 'admin' ? (
                  <Link 
                    to="/admin-dashboard" 
                    className="block w-full font-semibold rounded-md text-left px-4 py-2 text-sm text-pink-600 bg-pink-100 hover:bg-pink-500 hover:text-white transition-all duration-200 my-2"
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    Admin Dashboard
                  </Link>
                ) : ''}
                </div>

            )}
          </div>
        </div>
      </div>

      {/* Search Bar for Mobile (below header) */}
      {isMobile && showSearch && (
        <div className="absolute left-0 right-0 top-full bg-white px-6 py-4 shadow-md border-t border-gray-200 z-50 animate-in fade-in duration-300">
          <div className="relative max-w-4xl mx-auto font-semibold" ref={searchInputRef}>
            <input
              value={searchQuery}
              onChange={handleSearch}
              type="text"
              placeholder="Search for shops or services..."
              className={`min-[425px]:w-full w-64 pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 ${activeButton==='male' ? 'focus:ring-purple-500 focus:border-transparen text-purple-500 ' :'focus:ring-pink-500 text-pink-700 focus:border-transparen' } t transition-all duration-300 ease-in-out`}
              autoFocus
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;