// hooks/useFilter.js
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import {setActiveButton, setRatingFilter, setSortBy, toggleHomeService, setSearchQuery , setFilteredShops} from '../features/filter/filterSlice';

import { filterShops, fetchShops } from '../features/filter/filterThunks';  

export const useFilter = () => {
  const dispatch = useDispatch();
  const filterState = useSelector(state => state.filter);

  // console.log(filterState);
  // Memoize all dispatch functions
  
  const memoizedFetchShops = useCallback(() => dispatch(fetchShops()), [dispatch]);
  const memoizedFilterShops = useCallback(() => dispatch(filterShops()), [dispatch]);  


  return {
    ...filterState,
    handleFilterChange: (filter) => dispatch(setActiveButton(filter)),
    handleRatingChange: (rating) => dispatch(setRatingFilter(rating)),
    handleSortChange: (sort) => dispatch(setSortBy(sort)),
    toggleHomeService: () => dispatch(toggleHomeService()),
    handleSearchChange: (query) => dispatch(setSearchQuery(query)),
    applyFilters: memoizedFilterShops,
    fetchShops: memoizedFetchShops,
    removeDate : ()=>dispatch(setFilteredShops([]))
    
  };
};