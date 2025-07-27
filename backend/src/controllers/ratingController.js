const { validationResult } = require('express-validator');
const Shop = require('../models/shope');
const {getShop,calculateAverageRating, updateShopAvgRating} = require('../utils/shopUtils');


const validateRequest = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw {
      status: 400,
      message: 'Validation errors',
      errors: errors.array(),
    };
  }
};

const handleError = (res, error) => {
  console.error(error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Server error',
    errors: error.errors,
  });
};

// ⭐ SHOP Rating
const rateShop = async (req, res) => {
  try {
    validateRequest(req);

    const { shopId, rating } = req.body;
    const userId = req.result._id;

    const updated = await Shop.findOneAndUpdate(
      {
        _id: shopId,
        'globalRating.ratings.userId': userId,
      },
      {
        $set: {
          'globalRating.ratings.$.score': rating,
        },
      },
      { new: true }
    );

    if (!updated) {
      await Shop.findByIdAndUpdate(
        shopId,
        {
          $push: {
            'globalRating.ratings': { userId, score: rating },
          },
        },
        { new: true }
      );
    }

    const shop = await getShop(shopId);
    const avgRating = calculateAverageRating(shop.globalRating.ratings);


    await updateShopAvgRating(shopId, avgRating);

    return res.status(200).json({
      success: true,
      message: updated ? 'Rating updated successfully' : 'Rating submitted successfully',
      averageRating: avgRating,
      totalRatings: shop.globalRating.ratings.length,
    });

  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {rateShop};
