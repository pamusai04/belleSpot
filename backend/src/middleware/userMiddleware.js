const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../config/redis');

const userMiddleware = async (req, res, next) => {
  try {
    console.log('Middleware: Cookies received:', req.cookies); // Already present
    const { token } = req.cookies;
    if (!token) {
      console.error('Middleware: No token in cookies', { url: req.url, headers: req.headers }); // Debug log
      throw new Error("Token is not Present");
    }
    const payload = jwt.verify(token, process.env.JWT_KEY);
    console.log('Middleware: Token payload:', payload); // Already present
    const { _id } = payload;
    if (!_id) {
      console.error('Middleware: Invalid token payload', { payload }); // Debug log
      throw new Error("Invalid token");
    }
    const isBlocked = await redisClient.exists(`token:${token}`);
    if (isBlocked) {
      console.error('Middleware: Token is blocked', { token }); // Debug log
      throw new Error("Invalid Token");
    }
    const result = await User.findById(_id);
    if (!result) {
      console.error('Middleware: User not found', { userId: _id }); // Debug log
      throw new Error("User Doesn't Exist");
    }
    req.result = result;
    next();
  } catch (err) {
    console.error('Middleware error:', { message: err.message, url: req.url }); // Debug log
    res.status(401).json({
      success: false,
      message: err.message || "Unauthorized",
    });
  }
};

module.exports = userMiddleware;