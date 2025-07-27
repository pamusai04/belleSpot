const express = require('express');
const userRouter = express.Router();

const { getallShops, addToCart, getCart, updateProfile, getUserForEdit, removeFromCart, toggle_favorite, favorites } = require('../controllers/userController');
const { userMiddleware } = require('../middleware');
const { uploadUserPhoto } = require('../middleware/uploadMiddleware');
const { rateShop } = require('../controllers/ratingController');

userRouter.get('/getShops', userMiddleware, getallShops);
userRouter.get('/cart', userMiddleware, getCart);
userRouter.post('/cart', userMiddleware, addToCart);
userRouter.delete('/cart', userMiddleware, removeFromCart);
userRouter.get('/edit-profile', userMiddleware, getUserForEdit);
userRouter.patch('/update-profile', userMiddleware, uploadUserPhoto, updateProfile);
userRouter.patch('/toggle-favorite', userMiddleware, toggle_favorite);
userRouter.get('/favorites', userMiddleware, favorites);
userRouter.post('/rate-shop', userMiddleware, rateShop);

module.exports = userRouter;