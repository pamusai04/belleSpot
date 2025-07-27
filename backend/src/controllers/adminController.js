
const mongoose = require('mongoose');
const User = require('../models/user');
const Shop = require('../models/shope');
const Offer = require('../models/serviceOffer');

const handleAdminError = (res, error) => {
  let status = 500;
  let message = 'Operation failed';
  let errors = null;

  if (error.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
    errors = Object.keys(error.errors).reduce((acc, key) => {
      acc[key] = error.errors[key].message;
      return acc;
    }, {});
  } else if (error.message.includes('not found')) {
    status = 404;
    message = error.message;
  } else if (error.name === 'MongoServerError' && error.code === 11000) {
    status = 409;
    message = 'Duplicate data detected';
  }

  
  if (process.env.NODE_ENV === 'development') {
    console.error('Admin error:', error);
  }

  return res.status(status).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
};


const getAllServicesAndProfiles = async (req, res) => {
  try {
    
    const shops = await Shop.find()
      .populate({
        path: 'providerId',
        select: 'firstName -_id'
      })
      .select('shopName shopImage globalRating.avg_rating -_id') 
      .lean();

    if (!shops.length) {
      return res.status(200).json({
        success: true,
        message: 'No shops found',
        data: { shops: [] }
      });
    }

 
    const sanitizedShops = shops.map(shop => ({
      shopName: shop.shopName,
      shopImage: shop.shopImage,
      globalRating: {
        avg_rating: shop.globalRating?.avg_rating || 0
      },
      providerName: shop.providerId?.firstName || 'Unknown'
    }));

    return res.status(200).json({
      success: true,
      message: 'Shops retrieved successfully',
      data: { shops: sanitizedShops }
    });
  } catch (error) {
    return handleAdminError(res, error);
  }
};

const getAllUserAndProfiles = async (req, res) => {
  try {

    const users = await User.find()
      .select('firstName gender profilePhoto -_id') 
      .lean();

    if (!users.length) {
      return res.status(200).json({
        success: true,
        message: 'No users found',
        data: { users: [] }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: { users }
    });
  } catch (error) {
    return handleAdminError(res, error);
  }
};


module.exports = { getAllServicesAndProfiles, getAllUserAndProfiles };