const express = require('express');
const { adminMiddleware } = require('../middleware');
const { getAllServicesAndProfiles,getAllUserAndProfiles } = require('../controllers/adminController');

// ================
// Admin Routes
// ================
const adminRouter = express.Router();

adminRouter.get('/services-profiles', adminMiddleware, getAllServicesAndProfiles);
adminRouter.get('/user-profiles', adminMiddleware, getAllUserAndProfiles);

module.exports = adminRouter;
