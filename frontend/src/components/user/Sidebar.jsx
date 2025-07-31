
import { useState } from 'react';
import { Heart, Filter, LogOut, HousePlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
 
import { useFilter } from '../../hooks/useFilter';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';


const Sidebar = () => {
  const {
    activeButton,
    handleFilterChange,
    homeServiceFilter,
    toggleHomeService: handleHomeServiceToggle,
    handleSortChange: handleDropdownSelect,
    applyFilters,
    removeDate
  } = useFilter();
  const { loading } = useSelector((state) => state.filter);
  const { logout } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  
  const handleLogout = async() => {
    await logout();
    removeDate([]);
    toast.success('Logged out successfully!');
    navigate('/login')
  };


  const handleGenderFilter = (filter) => {
    handleFilterChange(filter);
    applyFilters(); 
  };

  return (
    <div className="hidden md:block fixed top-0 left-0 h-full bg-gray-200 text-gray-600 w-64 z-40 pt-16 cursor-pointer">
      <div className="flex flex-col items-start pt-6 space-y-6 px-4 h-full">
        
        {/* Men Item */}
        <Link
          to="/"
          className={`flex items-center w-full p-2 rounded-md transition-colors duration-300 ease-in-out my-2 hover:bg-pink-100 ${
            activeButton === 'male' ? 'hover:bg-purple-300 hover:text-purple-600' : 'hover:text-pink-500 hover:bg-pink-200'
          }`}
          onClick={() => handleGenderFilter('male')}
          aria-disabled={loading}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <span className="ml-4 text-lg font-medium">Men</span>
        </Link>

        {/* Women Item */}
        <Link
          to="/"
          className={`flex items-center w-full p-2 rounded-md transition-colors duration-300 ease-in-out my-2 hover:bg-pink-100 ${activeButton === 'male' ? 'hover:bg-purple-300 hover:text-purple-600' : 'hover:text-pink-500 hover:bg-pink-200'}`}
          onClick={() => handleGenderFilter('female')}
          aria-disabled={loading}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <span className="ml-4 text-lg font-medium">Women</span>
        </Link>
        
        {/* Home Item */}
        <Link
          to="/"
           onClick={() => {handleGenderFilter('all'); applyFilters()}}
          className={`flex items-center w-full p-2 rounded-md transition-colors duration-300 ease-in-out my-2 ${
            activeButton === 'male'
              ? 'hover:bg-purple-300 hover:text-purple-600'
              : 'hover:text-pink-500 hover:bg-pink-200'
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
          <span className="ml-4 text-lg font-medium">Home</span>
        </Link>


        {/* Bookings Item */}
        <Link
          to="/bookings"
          className={`flex items-center w-full p-2 rounded-md transition-colors duration-300 ease-in-out my-2 ${activeButton === 'male' ? 'hover:bg-purple-300 hover:text-purple-600' : 'hover:text-pink-500 hover:bg-pink-200'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="ml-4 text-lg font-medium">Bookings</span>
        </Link>

        {/* Favourites Item */}
        <Link
          to="/favorites"
          className={`flex items-center w-full p-2 rounded-md transition-colors duration-300 ease-in-out my-2 ${activeButton === 'male' ? 'hover:bg-purple-300 hover:text-purple-600' : 'hover:text-pink-500 hover:bg-pink-200'}`}
        >
          <Heart className="w-6 h-6" />
          <span className="ml-4 text-lg font-medium">Favourites</span>
        </Link>

        {/* Home Service */}
        <div
          className={`flex gap-2 items-center w-full p-2 rounded-md transition-colors duration-300 ease-in-out my-2 ${activeButton === 'male' ? 'hover:bg-purple-300 hover:text-purple-600' : 'hover:text-pink-500 hover:bg-pink-200'}`}
        >
          <div className="flex items-center">
            <HousePlus className="w-6 h-6" />
            <span className="ml-4 text-lg font-medium">Home Service</span>
          </div>
          <div>
            <input
              checked={homeServiceFilter}
              onChange={() => {
                handleHomeServiceToggle();
                applyFilters();
              }}
              type="checkbox"
              className="toggle toggle-md bg-pink-200 border-gray-500 [--tglbg:gray-100] checked:bg-pink-500 checked:border-pink-500 checked:[--tglbg:gray-100] hover:bg-pink-300 checked:hover:bg-pink-600 rounded-full transition-all duration-300 ease-in-out"
              disabled={loading}
            />
          </div>
        </div>

        {/* Filters Item */}
        <div className="flex flex-col w-full relative">
          <div
            className={`flex items-center p-2 rounded-md transition-colors duration-300 ease-in-out my-2 ${activeButton === 'male' ? 'hover:bg-purple-300 hover:text-purple-600' : 'hover:text-pink-500 hover:bg-pink-200'} cursor-pointer`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-6 h-6" />
            <span className="ml-4 text-lg font-medium">Filters</span>
          </div>
          {showFilters && (
            <div className="ml-10 space-y-2 flex flex-col absolute top-[52px]">
              {/* Rating Dropdown */}
              <div className="dropdown dropdown-right">
                <div
                  tabIndex={0}
                  role="button"
                  className={`btn btn-md border-0 btn-ghost text-gray-600  transition-all duration-300 ease-in-out ${activeButton === 'male' ? 'hover:bg-purple-300 hover:text-purple-600' : 'hover:text-pink-500 hover:bg-pink-200'}`}
                  aria-disabled={loading}
                >
                  Rating
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M7 10 L12 15 L17 10" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
                <ul
                  tabIndex={0}
                  className={`dropdown-content menu p-2 shadow  rounded-box w-[100px] text-gray-800 transition-all duration-300 ease-in-out ${activeButton==='male'? 'bg-purple-200' : 'bg-pink-200'}`}
                >
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <li key={rating}>
                      <a
                        onClick={() => {
                          handleDropdownSelect(rating);
                          applyFilters();
                        }}
                        className="hover:bg-gray-100 transition-all duration-300 ease-in-out"
                      >
                        {rating}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sort By Dropdown */}
              <div className="dropdown dropdown-right w-full">
                <div
                  tabIndex={0}
                  role="button"
                  className={`btn btn-md btn-ghost border-0 text-gray-600  transition-all duration-300 ease-in-out ${activeButton === 'male' ? 'hover:bg-purple-300 hover:text-purple-600' : 'hover:text-pink-500 hover:bg-pink-200'}`}
                  aria-disabled={loading}
                >
                  Sort By
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M7 10 L12 15 L17 10" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
                <ul
                  tabIndex={0}
                  className={`dropdown-content menu p-2 shadow  rounded-box w-[100px] text-gray-800 transition-all duration-300 ease-in-out  ${activeButton==='male'? 'bg-purple-200' : 'bg-pink-200'}`}
                >
                  <li>
                    <a
                      onClick={() => {
                        handleDropdownSelect('Nearest');
                        applyFilters();
                      }}
                      className="hover:bg-gray-100 transition-all duration-300 ease-in-out"
                    >
                      Nearest
                    </a>
                  </li>
                  <li>
                    <a onClick={() => { handleDropdownSelect('Newest'); applyFilters();}}
                      className="hover:bg-gray-100 transition-all duration-300 ease-in-out"
                    >Newest
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => {
                        handleDropdownSelect('Name');
                        applyFilters();
                      }}
                      className="hover:bg-gray-100 transition-all duration-300 ease-in-out"
                    >
                      Name
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => {
                        handleDropdownSelect('Rating');
                        applyFilters();
                      }}
                      className="hover:bg-gray-100 transition-all duration-300 ease-in-out"
                    >
                      Rating
                    </a>
                  </li>
                  
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Logout Item */}
        <div
          className={`flex items-center w-full p-2 rounded-md transition-colors duration-300 ease-in-out my-2 mt-auto ${activeButton === 'male' ? 'hover:bg-purple-300 hover:text-purple-600' : 'hover:text-pink-500 hover:bg-pink-200'}`}
          onClick={handleLogout}
        >
          <LogOut className="w-6 h-6" />
          <span className="ml-4 text-lg font-medium">Logout</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;