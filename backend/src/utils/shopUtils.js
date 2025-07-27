const Shop = require('../models/shope');

exports.getShop = async (shopId) => {
  const shop = await Shop.findById(shopId);
  if (!shop) throw new Error('Shop not found');
  return shop;
};



exports.calculateAverageRating = (ratings) => {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((total, rating) => total + rating.score, 0);
  return Number((sum / ratings.length).toFixed(1));
};


exports.updateShopAvgRating = async (shopId, avgRating) => {
  await Shop.updateOne(
    { _id: shopId },
    { $set: { 'globalRating.avg_rating': avgRating } }
  );
};
