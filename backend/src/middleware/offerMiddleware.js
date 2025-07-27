// middleware/validateProviderAndShop.js
const jwt = require('jsonwebtoken');
const Shop = require('../models/shope');
const User = require('../models/user');
const redisClient = require('../config/redis');

const validateProviderAndShop = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required',
      });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_KEY);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    const { _id, role, emailId } = payload;

    if (!_id || !role || !emailId) {
      throw new Error('Invalid token');
    }

    if (role !== 'serviceProvider') {
      throw new Error('Access restricted to serviceProvider');
    }

    const isBlocked = await redisClient.exists(`token:${token}`);
    if (isBlocked) {
      throw new Error('Invalid Token');
    }

    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    const shop = await Shop.findOne({ emailId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found for this provider',
      });
    }

    req.provider = {
      _id: user._id,
      emailId,
      providerId:shop.providerId,
      shopId: shop._id,
      hasShop: !!shop,
    };

    next();
  } catch (error) {
    console.error('Middleware validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Validation failed',
      error: error.message,
    });
  }
};

module.exports = validateProviderAndShop;