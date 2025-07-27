import axiosClient from '../../utils/axiosClient';
import { setShops, setOffers, setFilteredShops, setError, setLoading } from './filterSlice'; 
import { getDistance, sortShopsByDistance } from '../../utils/locationUtils';

export const fetchShops = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await axiosClient.get('/user/getShops');
    const shopData = response.data || [];
    dispatch(setShops(shopData));
    dispatch(setOffers(shopData.flatMap(shop => shop.offers || [])));
    dispatch(filterShops());
  } catch (err) {
    dispatch(setError(err.response?.data?.message || err.message));
    console.error('Error fetching shops:', err);
  }finally {
    dispatch(setLoading(false));
  }
};


// Modify your filterShops action
export const filterShops = () => (dispatch, getState) => {
  dispatch(setLoading(true));
  const { filter } = getState();
  const { shops, activeButton, ratingFilter, sortBy, homeServiceFilter, searchQuery, userLocation } = filter;
  
  let filtered = [...shops].filter(shop => {
    const matchesGender = activeButton === 'all' || shop.genderSpecific === activeButton;
    const matchesRating = ratingFilter === null || (shop.globalRating?.avg_rating || 0) >= ratingFilter;
    const matchesHomeService = !homeServiceFilter || shop.homeService === true;
    return matchesGender && matchesRating && matchesHomeService;
  });

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(shop => 
      shop.shopName.toLowerCase().includes(query) ||
      shop.services?.some(service => 
        service.name.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query)
      )
    );
  }

  // Add location-based sorting
  if (sortBy === 'Nearest' && userLocation) {
    filtered = sortShopsByDistance(filtered, userLocation);
  } else if (sortBy) {
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'Newest': return b._id.localeCompare(a._id);
        case 'Name': return a.shopName.localeCompare(b.shopName);
        case 'Rating': return (b.globalRating?.avg_rating || 0) - (a.globalRating?.avg_rating || 0);
        default: return 0;
      }
    });
  }

  dispatch(setFilteredShops(filtered));
  dispatch(setLoading(false));
};