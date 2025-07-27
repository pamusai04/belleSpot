import 'leaflet/dist/leaflet.css';
import { Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { DefaultIcon } from '../map/MapUtils';
import PropTypes from 'prop-types';

const ShopMarker = ({ shop, activeButton }) => {
  const map = useMap();

  // Validate shop data and provide fallbacks
  if (!shop || !shop.location?.coordinates?.coordinates || !shop.shopName) {
    console.warn('Invalid shop data:', shop);
    return null; // Skip rendering if shop data is incomplete
  }

  const shopPosition = [
    shop.location.coordinates.coordinates[1], // latitude
    shop.location.coordinates.coordinates[0], // longitude
  ];

  // Fallback for realTimeStatus
  const isOpen = shop.realTimeStatus?.isOpen ?? false;

  return (
    <Marker
      position={shopPosition}
      icon={DefaultIcon}
      eventHandlers={{
        click: () => {
          map.flyTo(shopPosition, 18, {
            duration: 1,
            easeLinearity: 0.25,
          });
        },
      }}
    >
      <Popup className="custom-popup" maxWidth={300} minWidth={200}>
        <div className="rounded-lg shadow-md overflow-hidden">
          <div className="p-1 space-y-2">
            <h1
              className={`block text-md font-bold hover:underline ${
                activeButton === 'male' ? 'text-purple-600' : 'text-pink-600'
              }`}
            >
              {shop.shopName}
            </h1>
            <div className="flex items-center space-x-2">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  isOpen ? 'bg-green-500' : 'bg-red-500'
                }`}
              ></span>
              <span className="text-sm text-gray-600">{isOpen ? 'Open now' : 'Closed'}</span>
            </div>
            <Link
              to={`/salon/${encodeURIComponent(shop.shopName)}`}
              className={`block mt-3 text-center py-2 rounded-md text-sm font-medium transition-colors ${
                activeButton === 'male'
                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
              }`}
            >
              View Salon
            </Link>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

ShopMarker.propTypes = {
  shop: PropTypes.shape({
    shopName: PropTypes.string.isRequired,
    location: PropTypes.shape({
      coordinates: PropTypes.shape({
        coordinates: PropTypes.arrayOf(PropTypes.number).isRequired,
      }).isRequired,
    }).isRequired,
    realTimeStatus: PropTypes.shape({
      isOpen: PropTypes.bool,
    }),
  }).isRequired,
  activeButton: PropTypes.oneOf(['male', 'female']).isRequired,
};

export default ShopMarker;