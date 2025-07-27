const Shop = require('../models/shope');
const { Types } = require('mongoose');
const AppError = require('../utils/appError');
const validateShopData = require('../utils/validateShopData');
const { isValidObjectId } = require('mongoose');

const addSubService = async (req, res) => {
  try {
    const { _id } = req.result;
    const { serviceId, name, duration, price } = req.body;

    if (!serviceId) {
      throw new AppError('Service ID is required', 400);
    }
    if (!name?.trim() || isNaN(Number(duration)) || isNaN(Number(price))) {
      throw new AppError('Sub-service name, duration, and price are required', 400);
    }

    const shop = await Shop.findOne({ providerId: _id });
    if (!shop) {
      throw new AppError('Shop not found for this provider', 404);
    }

    const serviceIndex = shop.services.findIndex(s => s._id.toString() === serviceId);
    if (serviceIndex === -1) {
      throw new AppError('Service not found', 404);
    }

    let serviceImage = null;
    if (req.files?.subServiceImage?.[0]) {
      serviceImage = req.files.subServiceImage[0].path;
    }

    const newSubService = {
      _id: new Types.ObjectId(),
      name: name.trim(),
      serviceImage,
      duration: Number(duration),
      price: Number(price),
      ratings: [],
      avg_rating: 0,
    };

    shop.services[serviceIndex].subServices.push(newSubService);

    const updatedShop = await shop.save({ validateBeforeSave: true });

    res.status(201).json({
      success: true,
      message: 'Sub-service added successfully',
      data: updatedShop.services[serviceIndex].subServices,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => err.message),
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to add sub-service',
      error: error.message,
    });
  }
};

const updateService = async (req, res) => {
  try {
    const { _id } = req.result;
    const updateData = req.body;

    if (typeof updateData.timings === 'string') updateData.timings = JSON.parse(updateData.timings);
    if (typeof updateData.services === 'string') updateData.services = JSON.parse(updateData.services);

    if (Object.keys(updateData).length === 0 && !req.files?.shopImage && !req.files?.subServiceImages) {
      return res.status(400).json({ success: false, message: 'Please provide at least one field to update' });
    }

    const shop = await Shop.findOne({ providerId: _id });
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found for this provider' });

    const subServiceImageMap = {};
    if (req.files?.subServiceImages) {
      for (const file of req.files.subServiceImages) {
        const match = file.fieldname.match(/subServiceImages\[(.+?)\]/);
        if (match) subServiceImageMap[match[1]] = file.path;
      }
    }

    if (updateData.services && Array.isArray(updateData.services)) {
      for (const serviceUpdate of updateData.services) {
        if (!serviceUpdate._id) {
          // Adding a new main service
          if (!serviceUpdate.name?.trim() || !serviceUpdate.category?.trim()) {
            throw new AppError('Service name and category are required', 400);
          }
          if (!Array.isArray(serviceUpdate.subServices) || serviceUpdate.subServices.length === 0) {
            throw new AppError('At least one sub-service is required', 400);
          }

          const newSubServices = serviceUpdate.subServices.map(ss => {
            if (!ss.name?.trim() || isNaN(Number(ss.duration)) || isNaN(Number(ss.price))) {
              throw new AppError('Invalid sub-service data', 400);
            }
            return {
              _id: new Types.ObjectId(),
              name: ss.name.trim(),
              serviceImage: subServiceImageMap[ss.imageKey] || null, // Image is optional
              duration: Number(ss.duration),
              price: Number(ss.price),
              ratings: [],
              avg_rating: 0,
            };
          });

          shop.services.push({
            _id: new Types.ObjectId(),
            name: serviceUpdate.name.trim(),
            category: serviceUpdate.category.trim(),
            subServices: newSubServices,
          });
          continue;
        }

        // Updating an existing service
        const existingServiceIndex = shop.services.findIndex(s => s._id.toString() === serviceUpdate._id);
        if (existingServiceIndex === -1) continue;

        const existingService = shop.services[existingServiceIndex];
        if (serviceUpdate.name) existingService.name = serviceUpdate.name.trim();
        if (serviceUpdate.category) existingService.category = serviceUpdate.category.trim();

        const updatedSubServices = [];
        for (const subUpdate of serviceUpdate.subServices) {
          const existingSubIndex = existingService.subServices.findIndex(ss => ss._id?.toString() === subUpdate._id);
          if (existingSubIndex === -1) {
            // Adding a new sub-service to existing service
            if (!subUpdate.name?.trim() || isNaN(Number(subUpdate.duration)) || isNaN(Number(subUpdate.price))) {
              throw new AppError('Invalid sub-service data', 400);
            }
            updatedSubServices.push({
              _id: new Types.ObjectId(),
              name: subUpdate.name.trim(),
              serviceImage: subServiceImageMap[subUpdate.imageKey] || null, // Image is optional
              duration: Number(subUpdate.duration),
              price: Number(subUpdate.price),
              ratings: [],
              avg_rating: 0,
            });
          } else {
            // Updating existing sub-service
            const existingSub = existingService.subServices[existingSubIndex];
            existingSub.name = subUpdate.name?.trim() || existingSub.name;
            existingSub.duration = Number(subUpdate.duration) || existingSub.duration;
            existingSub.price = Number(subUpdate.price) || existingSub.price;
            if (subUpdate.imageKey && subServiceImageMap[subUpdate.imageKey]) {
              existingSub.serviceImage = subServiceImageMap[subUpdate.imageKey];
            } else if (subUpdate.serviceImage === null) {
              existingSub.serviceImage = null; // Allow clearing image
            }
            updatedSubServices.push(existingSub);
          }
        }
        existingService.subServices = updatedSubServices;
      }
    }

    if (updateData.shopName) shop.shopName = updateData.shopName;
    if (updateData.genderSpecific && ['male', 'female', 'unisex'].includes(updateData.genderSpecific)) {
      shop.genderSpecific = updateData.genderSpecific;
    }
    if (updateData.timings) shop.timings = updateData.timings;
    if ('homeService' in updateData) shop.homeService = updateData.homeService === 'true' || updateData.homeService === true;
    if (req.files?.shopImage?.[0]) shop.shopImage = req.files.shopImage[0].path;

    const updatedShop = await shop.save({ validateBeforeSave: true });

    res.status(200).json({
      success: true,
      message: 'Shop details updated successfully',
      data: updatedShop,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => err.message),
      });
    }
    res.status(500).json({
      success: false,
      message: 'Update failed',
      error: error.message,
    });
  }
};

// Other functions remain unchanged
const createShop = async (req, res) => {
  try {
    const shopData = {
      shopName: req.body.shopName,
      emailId: req.body.emailId,
      location: req.body.location ? JSON.parse(req.body.location) : null,
      timings: req.body.timings
        ? JSON.parse(req.body.timings).map(t => ({
            ...t,
            day: t.day.toLowerCase(),
            opens: t.isClosed ? '' : t.opens,
            closes: t.isClosed ? '' : t.closes,
          }))
        : null,
      services: req.body.services ? JSON.parse(req.body.services) : null,
      providerId: req.result?._id,
      genderSpecific: req.body.genderSpecific || 'female',
      homeService: req.body.homeService === 'true' || req.body.homeService === true,
    };

    if (req.files?.shopImage?.[0]) {
      shopData.shopImage = req.files.shopImage[0].path;
    } else {
      throw new AppError('Shop image is required', 400);
    }

    if (req.files?.subServiceImages) {
      const subServiceImageUrls = req.files.subServiceImages.map(file => file.path);
      let imageIndex = 0;
      shopData.services = shopData.services.map(service => ({
        ...service,
        subServices: service.subServices.map(subService => ({
          ...subService,
          serviceImage: subServiceImageUrls[imageIndex++] || null,
        })),
      }));
    }

    validateShopData(shopData);

    const shop = await Shop.create(shopData);

    res.status(201).json({
      status: 'success',
      data: shop,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => err.message),
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        status: 'error',
        message: 'Email already exists',
      });
    }
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create shop',
      error: error.message,
    });
  }
};

const shopCheck = async (req, res) => {
  try {
    const { _id } = req.result;
    const shop = await Shop.findOne({ providerId: _id });
    return res.status(200).json({
      success: true,
      hasShop: !!shop,
      shopId: shop?._id || null,
      data: shop || null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const getService = async (req, res) => {
  try {
    const { _id } = req.result;
    const shop = await Shop.findOne({ providerId: _id })
      .populate('offers')
      .lean();

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found for this provider',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Shop details retrieved successfully',
      data: shop,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve shop details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

const updateShopStatus = async (req, res) => {
  try {
    const { _id: providerId } = req.result;
    const inputData = req.body;

    const allowedFields = ['isOpen', 'override', 'closureReason'];
    const filteredStatus = Object.keys(inputData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => ({ ...obj, [key]: inputData[key] }), {});

    if (Object.keys(filteredStatus).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one valid field to update (isOpen, override, closureReason)',
      });
    }

    const shop = await Shop.findOne({ providerId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found for this provider',
      });
    }

    const updates = {
      realTimeStatus: {
        ...shop.realTimeStatus?.toObject() || {},
        ...filteredStatus,
        lastUpdated: new Date(),
      },
    };

    const updatedShop = await Shop.findOneAndUpdate(
      { providerId },
      { $set: updates },
      { new: true, runValidators: true, context: 'query' }
    );

    return res.status(200).json({
      success: true,
      message: 'Shop status updated successfully',
      data: updatedShop.realTimeStatus,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {}),
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Status update failed',
      error: error.message,
    });
  }
};

const deleteService = async (req, res) => {
  try {
    const { _id: serviceId } = req.body;
    const { _id: providerId } = req.result;

    if (!serviceId || !isValidObjectId(serviceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID',
        error: 'ID must be a valid ObjectId',
      });
    }
    if (!isValidObjectId(providerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid provider ID',
        error: 'Provider ID must be a valid ObjectId',
      });
    }

    const shop = await Shop.findOne({ providerId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found for this provider',
      });
    }

    const serviceIndex = shop.services.findIndex(service => service._id.toString() === serviceId);
    if (serviceIndex !== -1) {
      if (shop.services.length === 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last service. At least one service is required.',
        });
      }

      const updatedShop = await Shop.findOneAndUpdate(
        { providerId },
        { $pull: { services: { _id: new Types.ObjectId(serviceId) } } },
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Service deleted successfully',
        data: updatedShop.toObject(),
      });
    }

    let found = false;
    for (let service of shop.services) {
      const subServiceIndex = service.subServices.findIndex(subService => subService._id.toString() === serviceId);
      if (subServiceIndex !== -1) {
        found = true;

        const updatedShop = await Shop.findOneAndUpdate(
          { providerId, 'services._id': new Types.ObjectId(service._id) },
          { $pull: { 'services.$.subServices': { _id: new Types.ObjectId(serviceId) } } },
          { new: true, runValidators: true }
        );

        if (!updatedShop) {
          return res.status(500).json({
            success: false,
            message: 'Failed to update shop after sub-service deletion',
          });
        }

        const updatedService = updatedShop.services.find(s => s._id.toString() === service._id.toString());
        if (updatedService && updatedService.subServices.length === 0) {
          const finalShop = await Shop.findOneAndUpdate(
            { providerId },
            { $pull: { services: { _id: new Types.ObjectId(service._id) } } },
            { new: true, runValidators: true }
          );

          return res.status(200).json({
            success: true,
            message: 'Sub-service and empty parent service deleted successfully',
            data: finalShop.toObject(),
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Sub-service deleted successfully',
          data: updatedShop.toObject(),
        });
      }
    }

    if (!found) {
      return res.status(404).json({
        success: false,
        message: 'Service or sub-service not found',
      });
    }
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => err.message),
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid service or provider ID',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to delete service',
      error: error.message,
    });
  }
};

module.exports = { createShop, addSubService, shopCheck, getService, updateService, deleteService, updateShopStatus };