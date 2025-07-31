import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Star, Clock, SendHorizontal, Image as ImageIcon, CircleArrowLeft, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import processCardData from '../../utils/processCardData'; 
import { useFilter } from '../../hooks/useFilter';  
import { ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import { useUser } from '../../hooks/useUser'; 

const SalonDetail = () => {
  const { 
    addItemToCart, 
    rateShop: rateShopAction, 
  } = useUser();
  
  const { activeButton } = useFilter();
  const { salonName } = useParams();
  const navigate = useNavigate();
  const { shops, filteredShops } = useSelector((state) => state.filter);
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showOffers, setShowOffers] = useState(false); // Offers closed by default

  
  const handleAddToCart = async (service) => {
    try {
      addItemToCart({ shopName: card.shopName, serviceId: service._id });
      toast.success(`Added ${service.name} to your cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };
  
  
  const handleRateShop = async (rating) => {
    try {
      const result =  rateShopAction({ shopId: card._id, rating });
      
      if (result?.payload?.success) {
        setCard(prev => {
          const existingIndex = prev.globalRating.ratings.findIndex(
            r => r.userId === 'current-user'
          );
          
          const updatedRatings = existingIndex >= 0 
            ? prev.globalRating.ratings.map((r, i) => 
                i === existingIndex ? { ...r, score: rating } : r
              )
            : [...prev.globalRating.ratings, { userId: 'current-user', score: rating }];
          
          return {
            ...prev,
            globalRating: {
              ...prev.globalRating,
              avg_rating: result.payload.averageRating,
              ratings: updatedRatings,
              ratingCount: updatedRatings.length
            }
          };
        });
      }
    } catch (error) {
      console.error('Error rating shop:', error);
      toast.error('Failed to rate shop');
    }
  };

  useEffect(() => {
    const decodedSalonName = decodeURIComponent(salonName);
    const foundSalon = filteredShops.find(shop => shop.shopName === decodedSalonName) || 
                      shops.find(shop => shop.shopName === decodedSalonName);

    if (foundSalon) {
      const processedCard = processCardData(foundSalon, currentTime);
      setCard(processedCard);
      
      if (processedCard.services?.length > 0) {
        setExpandedCategories({
          [processedCard.services[0].category]: true,
        });
      }
    } else {
      toast.error('Salon not found');
    }
    setLoading(false);
  }, [salonName, filteredShops, shops, currentTime]);

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleOffers = () => {
    setShowOffers(prev => !prev);
  };

  const renderStars = (rating, onClick, userRating = null) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-5 h-5 cursor-pointer ${onClick ? 'hover:text-yellow-400' : ''} ${
          star <= (userRating !== null ? userRating : rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
        onClick={onClick ? () => onClick(star) : undefined}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex-1 md:ml-64 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600">Loading salon details...</p>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex-1 md:ml-64 py-8 text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Salon Not Found</h1>
        <p className="text-gray-600 mb-4">No data found for this salon.</p>
        <Link to="/" className="text-pink-500 hover:underline text-sm font-medium">Back to Home</Link>
      </div>
    );
  }

  

  const userShopRating = card.globalRating?.ratings?.find(
    r => r.userId === 'current-user'
  )?.score;

  return (
    <div className="flex-1 md:ml-64 pt-2 pb-4 px-2 sm:px-6 lg:px-8 mb-6 sm:mb-0">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <button 
        onClick={() => navigate('/')}
        className={`flex items-center bg-gray-300 text-gray-600 font-semibold ${activeButton==='male' ? ' bg-purple-300 hover:bg-purple-300 hover:text-purple-700' : 'hover:text-pink-400 hover:bg-pink-200'} px-6 py-2 rounded-md mb-4 transition-colors ease-in-out`}
      >
        <CircleArrowLeft className="w-5 h-5 mr-1" />
        Back
      </button>

      <div className="flex flex-col lg:flex-row gap-2 w-full max-w-4xl mx-auto">
        <div className="lg:w-1/2 w-full">
          <figure className="relative h-48 sm:h-64 rounded-xl overflow-hidden">
            <img
              src={card.shopImage || 'https://static.vecteezy.com/system/resources/previews/009/784/989/original/picture-icon-isolated-on-white-background-free-vector.jpg'}
              alt={card.shopName}
              className="w-full h-full object-cover"
              
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center mt-2">
                <Star className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" />
                <span className="text-white font-medium text-sm">
                  {card.globalRating?.avg_rating || 'No rating'} ({card.globalRating?.ratings?.length || 0} reviews)
                </span>
              </div>
              
              <div className="mt-2 flex items-center">
                <span className="text-white text-sm mr-2">rating matters..!</span>
                <div className="flex">
                  {renderStars(0, handleRateShop, userShopRating)}
                </div>
              </div>
            </div>
          </figure>

          
        </div>
        
        <div className="lg:w-1/2 w-full p-2 flex flex-col">
          <div>
            <h1 className="text-md font-bold text-gray-700">{card.shopName}</h1>
            <p className="text-gray-600 text-sm">
              {card.location?.address}, {card.location?.city}, {card.location?.pincode}
            </p>
          </div>
          <div>
            {card?.services?.map((service) => (
              <span key={service._id} className='text-gray-500 pl-2'>• {service?.category}</span>
            ))}
          </div>
          <div className="pt-3 flex md:flex-row gap-1 w-fit">
            {card.homeService && (
              <span className={`${activeButton === 'male' ? 'bg-purple-200 text-purple-700' : 'bg-pink-100 text-pink-600'} px-4 py-2 rounded-md text-sm font-medium`}>
                Home Service Available
              </span>
            )}
            <span className={`${activeButton === 'male' ? 'bg-purple-200 text-purple-700' : 'bg-pink-100 text-pink-600'} px-4 py-2 rounded-md text-sm font-medium`}>
              {card.genderSpecific === 'female' ? 'Women Only' : card.genderSpecific === 'male' ? 'Men Only' : 'Unisex'}
            </span>
          </div>

          <div className="mt-4">
            <div className="tooltip sm:tooltip-right" data-tip={`Closes at ${card.timeInfo?.closingTime || 'N/A'}`}>
              {card.timeInfo?.remainingMinutes > 0 ? (
                card.timeInfo.remainingMinutes > 60 ? (
                  <div className="flex items-center gap-1 bg-green-100 rounded-md px-4 py-2 w-fit">
                    <div className="relative">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-ping"></div>
                      <div className="absolute inset-0 h-2 w-2 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-green-600 font-medium flex gap-1 items-center">
                      Shop Available <Clock className="h-5" />
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-yellow-100 rounded-md px-4 py-2 w-fit">
                    <div className="relative">
                      <div className="h-2 w-2 bg-yellow-500 rounded-full animate-ping"></div>
                      <div className="absolute inset-0 h-2 w-2 bg-yellow-500 rounded-full"></div>
                    </div>
                    <span className="text-yellow-600 font-medium flex gap-1 items-center">
                      {card.timeInfo.remainingMinutes} min • Available <Clock className="h-5" />
                    </span>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-1 bg-red-100 rounded-md px-4 py-2 w-fit text-red-500 font-bold">
                  Closed {card.realTimeStatus?.closureReason ? `(${card.realTimeStatus.closureReason})` : ''}
                  <Clock className="h-5" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-dashed border-gray-500 w-full max-w-4xl mx-auto my-2"></div>
      
      <div className="w-full max-w-4xl mx-auto">
        <h2 className="text-lg sm:text-2xl font-bold mb-4 text-gray-800">Services</h2>
        <div className="pb-5">
          {card.services?.map((service) => (
            <div key={service._id} className="border-1 rounded-lg m-1  overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => toggleCategory(service.category)}
                className="w-full p-4 bg-pink-50 border-b flex items-center justify-between hover:bg-pink-100 transition-colors"
              >
                <div className="flex items-center">
                  <SendHorizontal className="w-5 h-5 text-pink-500" />
                  <h3 className="ml-3 text-lg font-semibold text-gray-800">{service.category}</h3>
                </div>
                {expandedCategories[service.category] ? (
                  <ChevronUp className="w-5 h-5 text-pink-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-pink-500" />
                )}
              </button>

              {expandedCategories[service.category] && (
                <div className="space-y-4 p-4">
                  {service.subServices?.length > 0 ? (
                    service.subServices.map((subService) => (
                      <div
                        key={subService._id}
                        className="border rounded-lg p-4 bg-gray-100 hover:bg-pink-50 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{subService.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              ₹{subService.price} • {subService.duration} min
                              {subService.offer && (
                                <span className="ml-2 inline-block bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded">
                                  {subService.offer.discountType === 'percentage' 
                                    ? `${subService.offer.discountValue}% OFF` 
                                    : `₹${subService.offer.discountValue} OFF`}
                                </span>
                              )}
                            </p>
                            <div className="flex items-center mt-1">
                              <Star className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" />
                              <span className="text-sm text-gray-600">
                                {subService.avg_rating || 'No rating'} ({subService.ratings?.length || 0} reviews)
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col relative">
                            <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                              {subService.serviceImage ? (
                                <img
                                  src={subService.serviceImage}
                                  alt={subService.name}
                                  className="w-full h-full object-cover rounded"
                                  
                                />
                              ) : (
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                              )}
                            </div>
                            <button
                              className="w-full bg-pink-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-pink-700 transition-colors duration-300 mt-2"
                              onClick={() => handleAddToCart(subService)}
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 p-4">No sub-services available</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {card?.offers.length > 0 && (
          <div className="mt-6">
            <button
              onClick={toggleOffers}
              className="w-full p-4 bg-pink-50 border-1 rounded-md border-pink-200 hover:border-pink-400 flex items-center justify-between hover:bg-pink-100 transition-colors"
            >
              <div className="flex items-center">
                <Tag className="w-5 h-5 text-pink-500" />
                <h2 className="ml-3 text-lg sm:text-xl font-bold text-gray-800">Service Offers</h2>
              </div>
              {showOffers ? (
                <ChevronUp className="w-5 h-5 text-pink-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-pink-500" />
              )}
            </button>

            {showOffers && (
              <div className="space-y-4 p-4 bg-white  rounded-lg shadow-md mt-2">
                {card?.offers.map((offer, index) => (
                  <div key={index} className="border border-pink-200 rounded-lg p-4 bg-gradient-to-r from-pink-50 to-purple-50">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-pink-700">{offer.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{offer.description}</p>
                        <p className="text-pink-600 font-medium mt-1">
                          ₹{offer.minOrderValue} • {offer.duration} min
                        </p>
                        {/* {offer.discountValue && (
                          <span className="inline-block bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded mt-1">
                            {offer.discountType === 'percentage' 
                              ? `${offer.discountValue}% OFF` 
                              : `₹${offer.discountValue} OFF`}
                          </span>
                        )} */}
                      </div>
              
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalonDetail;