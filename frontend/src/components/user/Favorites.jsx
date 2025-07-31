import { useEffect, useState,useMemo ,useCallback} from 'react';
import { useUser } from '../../hooks/useUser';
import CardComponent from './CardComponent'; 
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { calculateAverageRating } from '../../utils/ratingUtils';
import { Venus, Mars } from 'lucide-react';
import processCardData from '../../utils/processCardData';
import LoadingSpinner from '../common/LoadingSpinner';

const Favorites = () => {
  const {
    shops,
    favorites,
    fetchFavorites,
    favoritesLoading,
    favoritesError,
    favoritesMessage,
    clearFavoritesError,
    clearFavoritesMessage,
    isFavorite,
    toggleFavorite
  } = useUser();

  const [activeButton, setActiveButton] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());

  // console.log(shops);
  // Update time every 5 minutes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 5 * 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);
  
  useEffect(() => {
    if (favoritesError) {
      toast.error(favoritesError);
      clearFavoritesError();
    }
  }, [favoritesError, clearFavoritesError]);

  useEffect(() => {
    if (favoritesMessage) {
      toast.success(favoritesMessage);
      clearFavoritesMessage();
    }
  }, [favoritesMessage, clearFavoritesMessage]);

   const filterFavoritesByGender = useCallback(
    (cards, gender) => {
      return gender === 'all' 
        ? cards 
        : cards.filter(shop => shop.genderSpecific === gender);
    },
    [] 
  );

 const processedFavorites = shops.filter(shop => favorites.includes(shop._id));
  const processedCards = useMemo(() => {
    return processedFavorites.map(card => processCardData(card, currentTime));
  }, [processedFavorites, currentTime]); // Fixed dependency array

  // Filter favorites by gender
  const filteredFavorites = useMemo(
    () => filterFavoritesByGender(processedCards, activeButton),
    [filterFavoritesByGender, processedCards, activeButton]
  );

  const handleGenderFilter = (filter) => {
    setActiveButton(filter);
  };

  return (
    <div className="flex-1 md:ml-64 py-3 pb-5 mb-5 text-black">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <h1 className="text-2xl font-bold px-4 py-2">My Favorites</h1>
      
      {/* Gender Filter Buttons */}
      <div className="flex justify-center gap-4 px-4 pb-4">
        <button
          onClick={() => handleGenderFilter('all')}
          className={`flex items-center gap-2 px-6 py-2 font-semibold rounded-md ${activeButton === 'all' ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          All
        </button>
        <button
          onClick={() => handleGenderFilter('female')}
          className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-md ${activeButton === 'female' ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          <Venus className="w-5 h-5" />
          Female
        </button>
        <button
          onClick={() => handleGenderFilter('male')}
          className={`flex items-center gap-2 px-4 font-semibold py-2 rounded-md ${activeButton === 'male' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          <Mars className="w-5 h-5" />
          Male
        </button>
      </div>

      {/* Favorites List */}
      {favoritesLoading  ? (
        <div className="w-full text-center py-10">
          <div className="flex flex-col items-center justify-center mx-auto max-w-md space-y-4">
            <LoadingSpinner />
            <div className="space-y-1">
              <h3 className="text-gray-600 text-lg font-medium">Loading favorites...</h3>
              <p className="text-gray-500 text-sm">Please wait while we fetch your favorite salons.</p>
            </div>
          </div>
        </div>
      ) : filteredFavorites.length > 0 ? (
        <div className="flex flex-wrap gap-5 justify-center px-4">
          {filteredFavorites.map(card => (
            <CardComponent 
              key={card._id} 
              card={card} 
              activeButton={card.genderSpecific || 'female'} 
            />
          ))}
        </div>
      ) : (
        <div className="w-full text-center py-10">
          <div className="mx-auto max-w-md">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-gray-400 text-lg font-medium">
              {activeButton === 'all' 
                ? "You haven't added any favorites yet" 
                : `No ${activeButton === 'male' ? "barbershops" : "beauty parlors"} in favorites`}
            </h3>
            <p className="mt-1 text-gray-400">
              {activeButton === 'all' 
                ? "Start by adding your favorite salons to see them here" 
                : `Try browsing ${activeButton === 'male' ? "barbershops" : "beauty parlors"} to add to your favorites`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Favorites;