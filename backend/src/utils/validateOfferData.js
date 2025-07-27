// utils/validateOfferData.js
const validateOfferData = (data) => {
  const requiredFields = ['name', 'discountType', 'discountValue', 'startDate', 'endDate'];
  const errors = {};

  requiredFields.forEach((field) => {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors[field] = `${field} is required`;
    }
  });

  if (data.discountType && !['percentage', 'flat'].includes(data.discountType)) {
    errors.discountType = 'Discount type must be "percentage" or "flat"';
  }

  if (data.discountValue !== undefined && (isNaN(data.discountValue) || data.discountValue < 0)) {
    errors.discountValue = 'Discount value must be a non-negative number';
  }

  if (data.minOrderValue !== undefined && (isNaN(data.minOrderValue) || data.minOrderValue < 0)) {
    errors.minOrderValue = 'Minimum order value must be a non-negative number';
  }

  if (Object.keys(errors).length > 0) {
    const error = new Error('Validation failed');
    error.errors = errors;
    throw error;
  }
};

module.exports = validateOfferData;