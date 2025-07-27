
import { getDistance } from '../../utils/locationUtils';
import { useSelector } from 'react-redux';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { Heart, Star } from "lucide-react";

const CardComponent = memo(({ card, activeButton }) => {
  const { isFavorite, toggleFavorite, favoritesLoading } = useUser();
  const isShopFavorite = isFavorite(card._id);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    toggleFavorite(card._id);
  };
  const userLocation = useSelector(state => state.filter.userLocation);
  
  // Calculate distance if user location is available
  const distance = userLocation ? getDistance(
    userLocation,
    card.location?.coordinates?.coordinates
      ? [
          card.location.coordinates.coordinates[1],
          card.location.coordinates.coordinates[0]
        ]
      : [0, 0]
  ).toFixed(2) : null;
  // console.log(card);
  return (
    <Link 
      to={`/salon/${encodeURIComponent(card.shopName)}`} 
      className="card bg-white w-80 m-1 shadow-sm cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:bg-pink-50 rounded-xl"
    >
      <figure className="relative h-40">
        <img
          src={card.shopImage || 'https://static.vecteezy.com/system/resources/previews/009/784/989/original/picture-icon-isolated-on-white-background-free-vector.jpg'}
          alt={card.shopName || 'Beauty Service'}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-4 w-full flex items-center justify-between px-3">
          <div className='flex gap-2'>
            <Star className='w-5 h-5 text-yellow-400' fill='currentColor'/>
            <span className="text-white font-medium text-sm">
              {card?.globalRating?.avg_rating || 0} Average Rating
            </span>
          </div>

          <button 
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            onClick={handleFavoriteClick}
            disabled={favoritesLoading}
            aria-label={isShopFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart 
              className='w-5 h-5 text-pink-600' 
              fill={isShopFavorite ? 'currentColor' : 'transparent'}
            />
          </button>
        </div>
      </figure>
      
      {/* Rest of your card body remains the same */}
      <div className={`card-body px-5 py-2 border-l border-r border-b border-gray-300 rounded-b-xl ${activeButton === 'male' ? 'hover:border-purple-400' : 'hover:border-pink-400'}`}>
        <div className='flex'>
          <p className="card-title text-sm font-bold text-gray-800">{card.shopName || 'Unknown Salon'}</p>
        {distance && (
          <div className="text-xs text-gray-500 mt-1">
            {distance} km 
          </div>
        )}
        </div>
        <div className="flex justify-between items-start">
          <div className="pr-3">
            <div className="text-gray-600 text-sm tooltip tooltip-right" data-tip={`Closes at ${card?.timeInfo?.closingTime}` || "Currently closed"}>
              {card?.timeInfo.remainingMinutes > 0 ? (
                card?.timeInfo?.remainingMinutes > 60 ? (
                  <div className='flex place-items-baseline gap-1 group relative'>
                    <div className='relative'>
                      <div className='h-2 w-2 bg-green-500 rounded-full animate-[ping_1.3s_infinite]'></div>
                      <div className='absolute inset-0 h-2 w-2 bg-green-500 rounded-full'></div>
                    </div>
                    <span className="text-green-600 font-medium">
                      Shop Available
                    </span>
                  </div>
                ) : (
                  <div className='flex place-items-baseline gap-1'>
                    <div className='relative'>
                      <div className='h-2 w-2 bg-yellow-500 rounded-full animate-[ping_1.5s_infinite]'></div>
                      <div className='absolute inset-0 h-2 w-2 bg-yellow-500 rounded-full'></div>
                    </div>
                    <span className="text-yellow-600 font-medium">
                      {card?.timeInfo?.remainingMinutes} min • Available
                    </span>
                  </div>
                )
              ) : (
                <span className="text-red-500 font-bold">Closed </span>
              )}
            </div>
            <p className="text-gray-700 text-sm font-semibold">
              Starting From{' '}
              <span className={`${activeButton === 'male' ? 'text-purple-600 font-bold' : 'text-pink-600 font-bold'}`}>
                {card.lowestPrice ? `₹${card.lowestPrice} Onwards` : 'Price Not Available'}
              </span>
            </p>
          </div>
          <div className="bg-green-400 py-1 px-2 rounded flex items-center">
            <Star className='w-4 h-4 text-teal-50 mr-2' fill='currentColor'/>
            <span className="text-white font-medium text-sm">
              {card?.globalRating?.avg_rating}
            </span>
          </div>
        </div>
        <div className="border-t border-dashed border-gray-400"></div>
        <div className={`flex items-center ${activeButton === 'male' ? 'bg-purple-200' : 'bg-pink-200'} rounded p-1`}>
          <img
            className="h-7 mr-2"
            src="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/dineout/rx-card/OFFER.png"
            alt="Offer"
            loading="lazy"
          />
          <span className={`${activeButton === 'male' ? 'text-purple-700' : 'text-pink-700'} text-sm font-medium truncate`}>
            {card.bestOffer?.description || 'No Offer Available'}
          </span>
        </div>
      </div>
    </Link>
  );
});

export default CardComponent;