const User = require("../models/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validateUserInput = require("../utils/validateUser");
const redisClient = require('../config/redis');

// Helper function for consistent error responses
const handleErrorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message: message,
    error: message
  });
};
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  maxAge: 60 * 60 * 1000, 
  domain: process.env.NODE_ENV === 'production' ? 'bellespot.onrender.com' : undefined
});

const register = async (req, res) => {
  try {
    const existingUser = await User.findOne({ emailId: req.body.emailId });
    if (existingUser) {
      return handleErrorResponse(res, 400, "Email already registered");
    }

    validateUserInput(req.body);
    
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    const user = await User.create({
      ...req.body,
      password: hashedPassword,
      role: 'user'
    });

    const token = jwt.sign(
      { _id: user._id, emailId: user.emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, getCookieOptions());
    
    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        firstName: user.firstName,
        emailId: user.emailId,
        role: user.role
      }
    });
  } catch (error) {
    return handleErrorResponse(res, 400, error.message);
  }
};

const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;
    
    if (!emailId || !password) {
      return handleErrorResponse(res, 400, "Email and password are required");
    }
    
    const user = await User.findOne({ emailId }).select('+password');
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return handleErrorResponse(res, 401, "Invalid credentials");
    }

    const cart_length = user?.cart?.reduce((total, item) => {
      return total + (item.services?.length || 0);
    }, 0);

    const newToken = jwt.sign(
      { _id: user._id, emailId: user.emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );
    

    res.cookie('token', newToken, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        firstName: user?.firstName,
        role: user?.role,
        cart_length: cart_length,
        profilePhoto:user?.profilePhoto?.url
      }
    });

  } catch (error) {
    return handleErrorResponse(res, 500, "Login failed: " + error.message);
  }
};

const logout = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return handleErrorResponse(res, 400, "No token found");
    }

    const payload = jwt.decode(token);
    if (!payload) {
      return handleErrorResponse(res, 400, "Invalid token");
    }

    await redisClient.set(`token:${token}`, 'Blocked');
    await redisClient.expireAt(`token:${token}`, payload.exp);
    
    res.clearCookie('token', getCookieOptions());
    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    return handleErrorResponse(res, 500, "Logout failed: " + error.message);
  }
};

const ServiceProviderRegister = async (req, res) => {
  try {
    const existingUser = await User.findOne({ emailId: req.body.emailId });
    if (existingUser) {
      return handleErrorResponse(res, 400, "Email already registered");
    }

    validateUserInput(req.body);

    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    const user = await User.create({
      ...req.body,
      password: hashedPassword,
      role: 'serviceProvider'
    });

    const token = jwt.sign(
      { _id: user._id, emailId: user.emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, getCookieOptions());

    return res.status(201).json({
      success: true,
      message: "Service provider registration successful",
      user: {
        firstName: user.firstName,
        emailId: user.emailId,
        role: user.role
      }
    });
  } catch (error) {
    return handleErrorResponse(res, 400, error.message);
  }
};

const adminRegister = async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return handleErrorResponse(res, 403, "Admin already exists");
    }

    validateUserInput(req.body);
     
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    const user = await User.create({
      ...req.body,
      password: hashedPassword,
      role: 'admin'
    });

    const token = jwt.sign(
      { _id: user._id, emailId: user.emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, getCookieOptions());

    return res.status(201).json({
      success: true,
      message: "Admin registration successful",
      user: {
        firstName: user.firstName,
        emailId: user.emailId,
        role: user.role
      }
    });
  } catch (error) {
    return handleErrorResponse(res, 400, error.message);
  }
};

const checkAuth = async (req, res) => {
  try {
    if (!req.result) {
      return handleErrorResponse(res, 401, "Not authenticated");
    }
    
    const cart_length = req.result?.cart?.reduce((total, item) => {
      return total + (item.services?.length || 0);
    }, 0);
    
    return res.status(200).json({
      success: true,
      user: {
        firstName: req.result?.firstName,
        role: req.result?.role,
        cart_length: cart_length,
        profilePhoto:req.result?.profilePhoto?.url
      }
    });
  } catch (error) {
    return handleErrorResponse(res, 500, "Please log in to continue");
  }
};

module.exports = { 
  register, 
  login, 
  logout, 
  ServiceProviderRegister, 
  adminRegister, 
  checkAuth 
};