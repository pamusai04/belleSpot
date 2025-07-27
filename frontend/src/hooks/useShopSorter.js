import { useState, useEffect } from 'react';
import { sortShopsByDistance, paginateShops } from '../utils/shopSortUtils';

export const useShopSorter = (initialShops = [], initialPosition) => {
  const [sortedShops, setSortedShops] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [position, setPosition] = useState(initialPosition);
  const shopsPerPage = 10;

  useEffect(() => {
    if (initialShops.length > 0) {
      const sorted = sortShopsByDistance(initialShops, position);
      setSortedShops(sorted);
      setCurrentPage(1); // Reset to first page when shops change
    }
  }, [initialShops, position]);

  const paginatedShops = paginateShops(sortedShops, currentPage, shopsPerPage);
  const totalPages = Math.ceil(sortedShops.length / shopsPerPage);

  return {
    sortedShops,
    paginatedShops,
    currentPage,
    totalPages,
    setCurrentPage,
    setPosition
  };
};