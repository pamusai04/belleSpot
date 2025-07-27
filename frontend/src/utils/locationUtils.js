// locationUtils.js

// Robust coordinate extraction
export const getCoordinates = (pos) => {
  if (!pos) return [0, 0];
  if (Array.isArray(pos)) return pos;
  if (pos.lat && pos.lng) return [pos.lat, pos.lng];
  if (pos.latitude && pos.longitude) return [pos.latitude, pos.longitude];
  return [0, 0];
};

// Haversine distance calculation
export const getDistance = (pos1, pos2) => {
  try {
    const [lat1, lon1] = getCoordinates(pos1);
    const [lat2, lon2] = getCoordinates(pos2);
    
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  } catch (error) {
    console.error('Distance calculation error:', error);
    return Infinity; // Return large distance if calculation fails
  }
};

// Sort shops by distance
export const sortShopsByDistance = (shops, position) => {
  return [...shops]
    .filter(shop => shop.location?.coordinates?.coordinates)
    .sort((a, b) => {
      const distA = getDistance(position, [
        a.location.coordinates.coordinates[1],
        a.location.coordinates.coordinates[0]
      ]);
      const distB = getDistance(position, [
        b.location.coordinates.coordinates[1],
        b.location.coordinates.coordinates[0]
      ]);
      return distA - distB;
    });
};

// Pagination utility
export const getPaginatedData = (data, currentPage, itemsPerPage) => {
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  return {
    currentItems: data.slice(indexOfFirstItem, indexOfLastItem),
    totalPages: Math.ceil(data.length / itemsPerPage)
  };
};