import { Mars, Venus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { useFilter } from '../../hooks/useFilter';


const MobileNavigation = () => {
  const { handleFilterChange, applyFilters, activeButton } = useFilter();
  const { loading } = useSelector((state) => state.filter); // Access loading state
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Helper to handle filter change and apply filters
  const handleGenderFilter = (filter) => {
    handleFilterChange(filter);
    applyFilters(); // Trigger filter application
  };

  return (
    <>
      {/* Mobile Filter Buttons - only on home page */}
      {isHomePage && (
        <div className="md:hidden fixed bottom-[52px] left-0 w-full flex justify-center items-center py-1 z-100 transition-all duration-300 ease-in-out">
          <div
            className={`flex flex-row btn w-[120px] border-0 items-center transition-colors duration-300 ease-in-out  ${
              activeButton === 'male'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-300 text-gray-800 hover:bg-purple-500 hover:text-white'
            }`}
            onClick={() => handleGenderFilter('male')}
            aria-disabled={loading}
          >
            <Mars />
            <span className="text-md font-semibold mt-1">Men</span>
          </div>
          <div
            className={`flex flex-row btn ml-2 w-[120px] border-0 items-center transition-colors duration-300 ease-in-out ${
              activeButton === 'female'
                ? 'bg-pink-500 text-pink-100'
                : 'bg-gray-300 text-gray-800 hover:bg-pink-500 hover:text-pink-100'
            }`}
            onClick={() => handleGenderFilter('female')}
            aria-disabled={loading}
          >
            <Venus />
            <span className="text-md font-semibold mt-1">Women</span>
          </div>
        </div>
      )}

      {/* Bottom Navigation - always visible */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-gray-800 text-white flex justify-around items-center py-1 z-40 transition-all duration-300 ease-in-out">
        <Link
          to="/"
          className={`flex flex-col items-center transition-colors duration-300 ease-in-out ${
            location.pathname === '/' ? 'text-pink-400' : 'hover:text-pink-400'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link
          to="/bookings"
          className={`flex flex-col items-center transition-colors duration-300 ease-in-out ${
            location.pathname === '/bookings' ? 'text-pink-400' : 'hover:text-pink-400'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs mt-1">Bookings</span>
        </Link>
        <Link
          to="/favorites"
          className={`flex flex-col items-center transition-colors duration-300 ease-in-out ${
            location.pathname === '/favorites' ? 'text-pink-400' : 'hover:text-pink-400'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className="text-xs mt-1">Favourites</span>
        </Link>
      </div>
    </>
  );
};

export default MobileNavigation;