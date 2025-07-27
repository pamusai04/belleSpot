import { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useFilter } from '../../hooks/useFilter';
import { DraggableMarker, MapHandler } from '../../components/map/MapComponents';
import { Link } from 'react-router-dom';
import ShopMarker from './ShopMarker';
import { DefaultIcon, searchLocation, reverseGeocode, getCurrentLocation } from '../map/MapUtils';
import { getCoordinates, getDistance, sortShopsByDistance, getPaginatedData } from '../../utils/locationUtils';
import 'leaflet/dist/leaflet.css';
import { calculateTimingInfo } from '../../utils/timeUtils';

const Location = () => {
  const { activeButton, filteredShops } = useFilter();
  const [position, setPosition] = useState([28.6139, 77.2090]);
  const [searchQuery, setSearchQuery] = useState('');
  const [address, setAddress] = useState('Current location');
  const [nearestShops, setNearestShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const shopsPerPage = 10;

  // Get current location on mount
  useEffect(() => {
    const fetchCurrentLocation = async () => {
      try {
        setLoading(true);
        const { lat, lng } = await getCurrentLocation();
        setPosition([lat, lng]);
        const locationData = await reverseGeocode(lat, lng);
        setAddress(locationData.display_name || "Current location");
      } catch (error) {
        console.error("Location error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrentLocation();
  }, []);

  // Update nearest shops when position changes
  useEffect(() => {
    if (filteredShops.length > 0) {
      const sortedShops = sortShopsByDistance(filteredShops, position);
      setNearestShops(sortedShops);
      setCurrentPage(1);
    }
  }, [position, filteredShops]);

  // Get paginated data
  const { currentItems: currentShops, totalPages } = getPaginatedData(
    nearestShops,
    currentPage,
    shopsPerPage
  );

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const data = await searchLocation(searchQuery);
      if (data[0]) {
        const { lat, lon, display_name } = data[0];
        setPosition([parseFloat(lat), parseFloat(lon)]);
        setAddress(display_name);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (e) => {
    const newPosition = e.target.getLatLng();
    setPosition([newPosition.lat, newPosition.lng]);
    try {
      const locationData = await reverseGeocode(newPosition.lat, newPosition.lng);
      setAddress(locationData.display_name || "Selected location");
    } catch (error) {
      setAddress("Selected location");
    }
  };

  return (
    <div className="flex-1 md:ml-64 py-3 pb-5 relative">
      <div className="px-4 space-y-4">
        <h1 className="text-xl font-bold text-gray-600">
          {activeButton === 'male' 
            ? "Men's Grooming Services Nearby" 
            : "Beauty Parlors & Salons Near You"}
        </h1>
        
        <div className='flex flex-col lg:flex-row gap-4 pb-5 lg:h-[70vh]'>
          <div className='"w-full lg:w-1/2 space-y-4 h-full overflow-auto'>
            <form onSubmit={handleSearch} className="flex gap-2 flex-col sm:flex-row p-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search area or landmark..."
                className={`flex-1 p-2 font-semibold border  border-gray-300 rounded-md focus:outline-none focus:ring-2 ${
                  activeButton === 'male' ? 'text-purple-600 focus:ring-purple-500' : 'text-pink-600 focus:ring-pink-500'
                } focus:border-transparent transition-colors`}
              />
              <button
                type="submit"
                disabled={loading}
                className={`text-white p-2 sm:px-5 rounded-md transition-colors ${
                  activeButton==='male' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-pink-500 hover:bg-pink-600'
                } ease-in-out duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>

            <div className="bg-pink-50 p-3 rounded-md">
              <p className="font-medium text-gray-800">Selected Location:</p>
              <p className="truncate text-gray-600">{address}</p>
            </div>

            {/* Carousel-style shop list with pagination */}
            {nearestShops.length > 0 && (
              <div className="bg-gray-100 p-3 rounded-md shadow-sm">
                <h3 className="font-medium text-gray-800 mb-2">Nearest Salons:</h3>
                
                <div className="carousel carousel-vertical rounded-box h-60 w-full">
                  {currentShops.map((shop) => (
                    <div key={shop._id} className="carousel-item w-full">
                      <Link
                        to={`/salon/${encodeURIComponent(shop.shopName)}`}
                        className={`block p-4 w-full rounded-md transition-colors ${
                          activeButton === 'male'
                            ? 'hover:bg-purple-100 text-purple-700'
                            : 'hover:bg-pink-100 text-pink-700'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{shop.shopName}</span>
                          <span className={`text-xs px-4 py-2 rounded-md ${calculateTimingInfo(shop?.timings)?.remainingMinutes> 0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                            {calculateTimingInfo(shop?.timings)?.remainingMinutes> 0 ? 'Open' : 'Closed'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {shop.location.address}
                        </p>
                        <p className="text-xs mt-1">
                          Distance: {getDistance(position, [
                            shop.location.coordinates.coordinates[1],
                            shop.location.coordinates.coordinates[0]
                          ]).toFixed(2)} km
                        </p>
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-4">
                    <div className="btn-group">
                      <button 
                        onClick={() => paginate(currentPage - 1)} 
                        disabled={currentPage === 1}
                        className="btn btn-sm"
                      >
                        «
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`btn btn-sm ${currentPage === number ? 'btn-active' : ''}`}
                        >
                          {number}
                        </button>
                      ))}
                      <button 
                        onClick={() => paginate(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                        className="btn btn-sm"
                      >
                        »
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className='w-full lg:w-1/2 h-[42vh] lg:h-full rounded-lg overflow-hidden shadow-md relative z-0'>
            <MapContainer
              center={position}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              tap={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              
              <DraggableMarker position={position} setPosition={setPosition} onDragEnd={handleDragEnd}/>
              
              {filteredShops.map((shop) => (
                <ShopMarker 
                  key={shop._id} 
                  shop={shop} 
                  activeButton={activeButton} 
                />
              ))}
              
              <MapHandler position={position} />
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Location;