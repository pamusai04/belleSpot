
const express = require('express');
const shopeRouter = express.Router();
const { createShop, shopCheck, getService, updateService, deleteService, updateShopStatus, addSubService } = require('../controllers/shopController');
const { addOffer, getOffers, deleteOffer, updateOffer } = require('../controllers/offerController');
const { uploadShopAndServiceImages } = require('../middleware/shopUpload');
const { serviceMiddleware, validateProviderAndShop } = require('../middleware');

shopeRouter.post('/services', serviceMiddleware, uploadShopAndServiceImages, createShop);
shopeRouter.get('/services', serviceMiddleware, getService);
shopeRouter.patch('/services', serviceMiddleware, uploadShopAndServiceImages, updateService);
shopeRouter.post('/delete-service', serviceMiddleware, deleteService);
shopeRouter.patch('/status', serviceMiddleware, updateShopStatus);
shopeRouter.get('/check', serviceMiddleware, shopCheck);
shopeRouter.post('/sub-services', serviceMiddleware, uploadShopAndServiceImages, addSubService);
shopeRouter.post('/offers', validateProviderAndShop, addOffer);
shopeRouter.get('/offers', validateProviderAndShop, getOffers);
shopeRouter.patch('/offers', validateProviderAndShop, updateOffer);
shopeRouter.delete('/offers', validateProviderAndShop, deleteOffer);

module.exports = shopeRouter;