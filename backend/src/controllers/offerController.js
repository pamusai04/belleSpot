
const Shop = require('../models/shope');
const Offer = require('../models/serviceOffer');
const { Types } = require('mongoose');
const validateOfferData = require('../utils/validateOfferData');
const { isValidObjectId, filterAllowedFields, isValidDate } = require('../utils/helper');
const moment = require('moment');

const addOffer = async (req, res) => {
  try {
    validateOfferData(req.body);
    const { _id: providerId, shopId } = req.provider;

    const offerData = {
      ...req.body,
      providerId,
      shopId,
      startDate: moment(req.body.startDate, ['YYYY-MM-DD', moment.ISO_8601], true).utc().startOf('day').toDate(),
      endDate: moment(req.body.endDate, ['YYYY-MM-DD', moment.ISO_8601], true).utc().startOf('day').toDate(),
      isActive: req.body.isActive !== false,
      description: req.body.description ? req.body.description.trim() : undefined,
    };

    if (!isValidDate(offerData.startDate) || !isValidDate(offerData.endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format',
        errors: {
          startDate: !isValidDate(offerData.startDate) ? 'Start date must be in YYYY-MM-DD or ISO 8601 format' : undefined,
          endDate: !isValidDate(offerData.endDate) ? 'End date must be in YYYY-MM-DD or ISO 8601 format' : undefined,
        },
      });
    }

    if (offerData.endDate <= offerData.startDate) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date',
        errors: { endDate: 'End date must be after start date' },
      });
    }

    const newOffer = await Offer.create(offerData);

    if (shopId) {
      await Shop.findByIdAndUpdate(
        shopId,
        { $addToSet: { offers: newOffer._id } },
        { new: true },
      );
    }

    res.status(201).json({
      success: true,
      message: 'Offer created successfully',
      data: newOffer,
    });
  } catch (error) {
    console.error('Add offer error:', error);
    handleOfferError(res, error);
  }
};

const getOffers = async (req, res) => {
  try {
    if (!req.provider.hasShop) {
      return res.status(200).json({
        success: false,
        message: 'No shop found. Please create a shop to manage offers.',
        offers: [],
      });
    }

    const offers = await Offer.find({ shopId: req.provider.shopId });
    return res.status(200).json({
      success: true,
      offers,
    });
  } catch (error) {
    console.error('Error fetching offers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch offers',
      error: error.message,
    });
  }
};

const updateOffer = async (req, res) => {
  try {
    const { _id: providerId, shopId } = req.provider;
    const { _id: offerId, ...inputData } = req.body;

    if (!offerId || !isValidObjectId(offerId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid Offer ID is required',
        errors: { offerId: 'Offer ID must be a valid ObjectId' },
      });
    }

    const allowedFields = [
      'name',
      'description',
      'discountType',
      'discountValue',
      'startDate',
      'endDate',
      'isActive',
      'minOrderValue',
    ];

    const filteredData = filterAllowedFields(inputData, allowedFields);

    if (Object.keys(filteredData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one valid field to update',
      });
    }


    const existingOffer = await Offer.findById(offerId);
    if (!existingOffer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found',
      });
    }


    if (existingOffer.providerId.toString() !== providerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Offer not owned by this provider',
      });
    }

    const updateData = {
      name: filteredData.name !== undefined ? filteredData.name : existingOffer.name,
      discountType:
        filteredData.discountType !== undefined ? filteredData.discountType : existingOffer.discountType,
      discountValue:
        filteredData.discountValue !== undefined ? Number(filteredData.discountValue) : existingOffer.discountValue,
      startDate:
        filteredData.startDate !== undefined
          ? moment(filteredData.startDate, ['YYYY-MM-DD', moment.ISO_8601], true)
              .utc()
              .startOf('day')
              .toDate()
          : existingOffer.startDate,
      endDate:
        filteredData.endDate !== undefined
          ? moment(filteredData.endDate, ['YYYY-MM-DD', moment.ISO_8601], true)
              .utc()
              .startOf('day')
              .toDate()
          : existingOffer.endDate,
      description: filteredData.description !== undefined ? filteredData.description.trim() : existingOffer.description,
      isActive: filteredData.isActive !== undefined ? filteredData.isActive : existingOffer.isActive,
      minOrderValue:
        filteredData.minOrderValue !== undefined ? Number(filteredData.minOrderValue) : existingOffer.minOrderValue,
    };


    try {
      validateOfferData({
        name: updateData.name,
        discountType: updateData.discountType,
        discountValue: updateData.discountValue,
        startDate: updateData.startDate,
        endDate: updateData.endDate,
      });
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationError.errors,
      });
    }


    if (!isValidDate(updateData.startDate) || !isValidDate(updateData.endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format',
        errors: {
          startDate: !isValidDate(updateData.startDate) ? 'Start date must be a valid date' : undefined,
          endDate: !isValidDate(updateData.endDate) ? 'End date must be a valid date' : undefined,
        },
      });
    }

    if (updateData.endDate <= updateData.startDate) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date',
        errors: { endDate: 'End date must be after start date' },
      });
    }


    existingOffer.name = updateData.name;
    existingOffer.discountType = updateData.discountType;
    existingOffer.discountValue = updateData.discountValue;
    existingOffer.startDate = updateData.startDate;
    existingOffer.endDate = updateData.endDate;
    existingOffer.description = updateData.description;
    existingOffer.isActive = updateData.isActive;
    existingOffer.minOrderValue = updateData.minOrderValue;

    const updatedOffer = await existingOffer.save();

    res.status(200).json({
      success: true,
      message: 'Offer updated successfully',
      data: updatedOffer,
    });
  } catch (error) {
    console.error('=== FULL ERROR DETAILS ===');
    console.error({
      message: error.message,
      stack: error.stack,
      name: error.name,
      errors: error.errors,
      code: error.code,
    });

    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).reduce((acc, key) => {
        acc[key] = error.errors[key].message;
        return acc;
      }, {});
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update offer',
      error: error.message,
    });
  }
};

const deleteOffer = async (req, res) => {
  try {
    
    const { _id: offerId } = req.body;
    const { shopId, providerId } = req.provider;
    if (!offerId || !isValidObjectId(offerId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid Offer ID is required',
        errors: { offerId: 'Offer ID must be a valid ObjectId' },
      });
    }


    const offer = await Offer.findOne({ _id: offerId, providerId });
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found or not owned by this provider',
      });
    }


    if (shopId) {
      const shopUpdate = await Shop.findByIdAndUpdate(
        shopId,
        { $pull: { offers: new Types.ObjectId(offerId) } },
        { new: true },
      );
      console.log('Shop update result:', shopUpdate); // Debug log
    }

    await Offer.findByIdAndDelete(offerId);

    res.status(200).json({
      success: true,
      message: 'Offer deleted successfully',
      data: { _id: offerId },
    });
  } catch (error) {
    console.error('Delete offer error:', error);
    handleOfferError(res, error);
  }
};

const handleOfferError = (res, error) => {
  let status = 500;
  let message = 'Operation failed';

  if (error.name === 'ValidationError' || error.message.includes('required') || error.message.includes('must be')) {
    status = 400;
    message = error.message;
  } else if (error.message.includes('not found')) {
    status = 404;
    message = error.message;
  }

  res.status(status).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
};

module.exports = {
  addOffer,
  getOffers,
  updateOffer,
  deleteOffer,
};