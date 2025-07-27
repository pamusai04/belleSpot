
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/slices/authSlice';
import filterReducer from '../features/filter/filterSlice';
import useReducers from '../features/user/userSlice';
import shopReducer from '../redux/slices/shopSlice';
import offerReducer from '../redux/slices/offerSlice';
import adminReducer from '../redux/slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    filter: filterReducer,
    user : useReducers,
    shop: shopReducer,
    offer: offerReducer,
    admin: adminReducer
  }
});
