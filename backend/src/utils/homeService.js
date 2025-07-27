const mongoose = require('mongoose');
const Shop = require('../models/shope');
const moment = require('moment');

const handleShopError = (res, error) => {
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
  } else if (error.message.includes('Cast to ObjectId failed')) {
    status = 400;
    message = 'Invalid reference ID';
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('Shop error:', error);
  }

  return res.status(status).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
};


const requestHomeService = async (req, res) => {
  try {
    const { shopId } = req.body;
    const { serviceName, subServiceName, preferredTime, address } = req.body;
    const userId = req.user._id; 

    if (!mongoose.Types.ObjectId.isValid(shopId)) {
      return res.status(400).json({ success: false, message: 'Invalid shop ID' });
    }
    if (!serviceName || !subServiceName) {
      return res.status(400).json({ success: false, message: 'Service name and subservice name are required' });
    }
    if (!preferredTime) {
      return res.status(400).json({ success: false, message: 'Preferred time is required' });
    }
    if (!address || !address.street || !address.city || !address.pincode) {
      return res.status(400).json({ success: false, message: 'Complete address (street, city, pincode) is required' });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    if (!shop.homeService) {
      return res.status(400).json({ success: false, message: 'This shop does not offer home services' });
    }


    if (!shop.realTimeStatus.isOpen) {
      return res.status(400).json({ success: false, message: `Shop is currently closed: ${shop.realTimeStatus.closureReason || 'No reason provided'}` });
    }

    const service = shop.services.find(s => s.name === serviceName);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    const subService = service.subServices.find(ss => ss.name === subServiceName);
    if (!subService) {
      return res.status(404).json({ success: false, message: 'Subservice not found' });
    }

    const parsedTime = moment(preferredTime, ['YYYY-MM-DD HH:mm', 'DD/MM/YYYY HH:mm'], true).toDate();
    if (!parsedTime || parsedTime <= new Date()) {
      return res.status(400).json({ success: false, message: 'Preferred time must be a valid future date and time (e.g., "2025-06-23 14:00")' });
    }

    const existingRequest = shop.homeServiceRequests.find(
      r => r.userId.toString() === userId.toString() &&
           r.serviceName === serviceName &&
           r.subServiceName === subServiceName &&
           r.status === 'pending'
    );
    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'You already have a pending request for this service' });
    }

    const request = {
      userId,
      serviceName,
      subServiceName,
      preferredTime: parsedTime,
      address: {
        street: address.street,
        city: address.city,
        pincode: address.pincode,
        coordinates: address.coordinates || { type: 'Point', coordinates: [0, 0] }
      },
      status: 'pending'
    };

    shop.homeServiceRequests.push(request);
    await shop.save();

    return res.status(201).json({
      success: true,
      message: 'Home service request submitted successfully',
      data: {
        shopId: shop._id,
        requestId: shop.homeServiceRequests[shop.homeServiceRequests.length - 1]._id,
        serviceName,
        subServiceName,
        preferredTime: parsedTime,
        address: request.address,
        status: 'pending'
      }
    });
  } catch (error) {
    return handleShopError(res, error);
  }
};

module.exports = { requestHomeService };
