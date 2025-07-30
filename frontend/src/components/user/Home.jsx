import { Settings2, Mars, Venus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useEffect, useState, useMemo, memo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
// import { calculateTimingInfo } from '../../utils/timeUtils';
import CardComponent from './CardComponent';
import { useFilter } from '../../hooks/useFilter';
import processCardData from '../../utils/processCardData';
import LoadingSpinner from '../common/LoadingSpinner ';
import { getCurrentLocation } from '../map/MapUtils';
import { setUserLocation } from '../../features/filter/filterSlice';
import { useDispatch } from 'react-redux';

const Home = () => {
  const dispatch = useDispatch();
  const {
    activeButton,
    homeServiceFilter,
    toggleHomeService,
    handleFilterChange,
    handleSortChange,
    handleRatingChange,
    filteredShops: filteredCards,
    offers,
    error,
    loading,
    fetchShops,
    applyFilters: originalApplyFilters,
  } = useFilter();

  useEffect(() => {
    // Get user's current location when component mounts
    const fetchUserLocation = async () => {
      try {
        const { lat, lng } = await getCurrentLocation();
        dispatch(setUserLocation([lat, lng]));
      } catch (error) {
        console.error("Couldn't get user location:", error);
      }
    };
    
    fetchUserLocation();
  }, [dispatch]);
  
  // const { loading: filterLoading } = useSelector((state) => state.filter);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Simple debounce implementation
  const debounce = (func, wait) => {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  // Debounced filter application
  const applyFilters = useMemo(
    () => debounce(originalApplyFilters, 300),
    [originalApplyFilters]
  );

  // Process all cards when they change or time updates
  const processedCards = useMemo(() => {
    return filteredCards.map(card => processCardData(card, currentTime));
  }, [filteredCards, currentTime]);

  // Update time every 5 minutes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 5 * 60000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleGenderFilter = (filter) => {
    handleFilterChange(filter);
    applyFilters();
  };

  const resetFilters = () => {
    handleFilterChange('all');
    handleRatingChange(null);
    handleSortChange(null);
    toggleHomeService(false);
    applyFilters();
  };
  

  // Filter offers with useMemo
  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => activeButton === 'all' || offer.genderSpecific === activeButton);
  }, [offers, activeButton]);

  return (
    <div className='cursor-pointer'>
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Offers Carousel */}
      <div className="flex-1 md:ml-64 sm:py-0 sm:px-2 md:px-5">
        <div className={`bg-gradient-to-r ${activeButton === 'male' ? 'via-purple-600/[0.6]' : 'via-pink-500/[0.6]'} flex overflow-x-auto py-3 px-2 justify-center`}>
          <div className="carousel carousel-end rounded-box space-x-4">
            {loading ? (
              <div className="carousel-item bg-pink-50 rounded-lg shadow-md p-2 w-60 flex items-center">
                <div className="h-16 w-16 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="border-l border-dashed border-gray-400 h-16 mx-4"></div>
                <div className="flex-1">
                  <p className="text-md font-medium text-gray-400">Loading offers...</p>
                  <p className="text-sm text-gray-400">Please wait</p>
                </div>
              </div>
            ) : filteredOffers.length > 0 ? (
              filteredOffers.map((offer) => (
                <div key={offer._id} className="carousel-item bg-pink-50 rounded-lg shadow-md p-3 w-60 max-h-[90px] flex items-center">
                  <div className="flex-shrink-0 h-16 w-16 rounded-full overflow-hidden">
                    <img
                      src="https://png.pngtree.com/png-vector/20211028/ourlarge/pngtree-today-offer-with-free-vector-png-image_4012911.png"
                      alt="Beauty Service"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="border-l border-dashed border-gray-400 h-16 mx-3 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0 text-center">
                    <p className={`text-md font-medium truncate ${activeButton === 'male' ? 'text-purple-700' : 'text-pink-700'}`}>
                      {offer.name || 'No Offer Name'}
                    </p>
                    <p className={`text-sm ${activeButton === 'male' ? 'text-purple-700' : 'text-pink-700'} line-clamp-2`}>
                      {offer.description || 'No description available'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="carousel-item bg-pink-50 rounded-lg shadow-md p-2 w-60 flex items-center">
                <div className={`h-16 w-16 md:h-17 md:w-17 ${activeButton === 'male' ? 'bg-purple-400' : 'bg-pink-400'} rounded-full`}></div>
                <div className="border-l border-dashed border-gray-400 h-16 md:h-17 my-1 mx-4"></div>
                <div>
                  <p className={`text-md font-medium ${activeButton === 'male' ? 'text-purple-700' : 'text-pink-700'}`}>
                    No offers available
                  </p>
                  <p className={`text-sm ${activeButton === 'male' ? 'text-purple-700' : 'text-pink-700'}`}>
                    Check back later
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Small Devices Filters */}
        <div className="flex-1 px-1 sm:px-3 md:hidden bg-pink-50 py-0.5">
          <div className="border-t border-dashed border-gray-500"></div>
          <div className="w-full flex flex-row justify-between items-center py-2 px-1">
            <p className="text-sm font-bold text-gray-800 flex-shrink-0 min-w-[120px]">
              {loading ? 'Loading...' : `${filteredCards.length} Salons Found Near You`}
            </p>
            <div className="flex flex-row items-center gap-2 flex-shrink-0">
              <p className="text-sm font-medium text-pink-600 whitespace-nowrap">
                Home Service
              </p>
              <div className="flex-shrink-0">
                <input
                  checked={homeServiceFilter}
                  onChange={() => {
                    toggleHomeService();
                    applyFilters();
                  }}
                  type="checkbox"
                  className="toggle toggle-md bg-pink-200 border-gray-500 [--tglbg:gray-100] checked:bg-pink-500 checked:border-pink-500 checked:[--tglbg:gray-100] hover:bg-pink-300 checked:hover:bg-pink-600 rounded-full transition-all duration-300 ease-in-out"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-0.5  justify-evenly">
            <div className="dropdown dropdown-bottom">
              <div tabIndex={0} role="button" className="flex items-center group bg-gray-200 text-gray-600 border-gray-400 hover:border-pink-500 hover:text-pink-500 cursor-pointer border-1 btn btn-wide px-5">
                <Settings2 className="w-5 h-5 transition-colors duration-300" />
                <span className="text-base font-medium transition-colors duration-300">SortBy</span>
              </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-gray-200 text-gray-800 rounded-box w-30 mt-2">
                <li><a className="hover:bg-pink-200 hover:text-pink-600"  onClick={() => {handleSortChange('Newest');applyFilters()}}>Newest</a></li>
                <li><a className="hover:bg-pink-200 hover:text-pink-600" onClick={() => {handleSortChange('Name'); applyFilters()}}>Name</a></li>
                <li><a className="hover:bg-pink-200 hover:text-pink-600" onClick={() => {handleSortChange('Rating');  applyFilters()}}>Rating</a></li>
                <li><a className="hover:bg-pink-200 hover:text-pink-600" onClick={() => {handleGenderFilter('all'); applyFilters()}}>All</a></li>
              </ul>
            </div>
            <div>

              <button 
                className="btn text-sm bg-white text-gray-600 border-gray-400 hover:border-pink-500 hover:bg-pink-100 hover:text-pink-600 transition-colors duration-300" 
                onClick={() => {
                  handleSortChange('Nearest');
                  applyFilters();
                }} 
                disabled={loading}
              >
                Nearest
              </button>
            </div>
            <div>                                                                                                                                                                                         {/* handleRatingChange(4) */}
              <button className="btn text-sm bg-white text-gray-600 border-gray-400 hover:border-pink-500 hover:bg-pink-100 hover:text-pink-600 transition-colors duration-300" onClick={() => {handleSortChange('4.0'), applyFilters()}} disabled={loading}>
                Rating4.0+
              </button>
            </div>
          </div>
          <div className="border-t border-dashed border-gray-500 mt-2 mb-1"></div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 py-3 pb-5 transition-all duration-300 ease-in-out">
        {loading ? (
          <div className="w-full text-center py-10">
            <div className="flex flex-col items-center justify-center mx-auto w-full max-w-md space-y-3">
              <LoadingSpinner className="mx-auto" />
              <h3 className="text-gray-500 text-lg font-semibold">Loading salons...</h3>
              <p className="text-gray-400">Please wait while we fetch the salons.</p>
            </div>
          </div>

        ) : processedCards.length > 0 ? (
          <div className="flex flex-wrap gap-5 justify-center">
            {processedCards.map(card => (
              <CardComponent key={card._id} card={card} activeButton={activeButton} />
            ))}
          </div>
        ) : (
          <div className="w-full text-center py-10">
            <div className="mx-auto max-w-md">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-gray-400 text-lg font-medium">No Data found</h3>
              <p className="mt-1 text-gray-400">
                {activeButton === 'male' ? "We couldn't find any barbershops matching your criteria" : "We couldn't find any beauty parlors matching your criteria"}
              </p>
              <div className="mt-6">
                <button onClick={resetFilters} className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${activeButton === 'male' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-pink-600 hover:bg-pink-700'}`} disabled={loading}>
                  Reset filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;