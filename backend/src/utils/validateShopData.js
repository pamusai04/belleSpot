const validateShopData = (data) => {
  const { shopName, emailId, location, timings, services, genderSpecific, homeService } = data;

  if (!shopName || typeof shopName !== 'string' || !shopName.trim()) throw new AppError('Shop name is required', 400);
  if (!emailId || !/\S+@\S+\.\S+/.test(emailId)) throw new AppError('Valid email is required', 400);
  if (!location || typeof location !== 'object') throw new AppError('Location is required', 400);
  const { address, city, pincode, coordinates } = location;
  if (!address?.trim() || !city?.trim() || !pincode) throw new AppError('Address, city, and pincode are required', 400);
  if (!Array.isArray(coordinates) || coordinates.length !== 2 || coordinates.some(isNaN)) throw new AppError('Valid coordinates [latitude, longitude] are required', 400);

  if (!Array.isArray(timings) || timings.length !== 7) throw new AppError('Timings for all 7 days are required', 400);
  timings.forEach((t, i) => {
    const day = t.day.toLowerCase();
    if (!['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(day)) throw new AppError(`Invalid day at index ${i}`, 400);
    if (!t.isClosed && (!t.opens || !t.closes)) throw new AppError(`Opening and closing times are required for ${t.day}`, 400);
  });

  if (!Array.isArray(services) || services.length === 0) throw new AppError('At least one service is required', 400);
  services.forEach((service, i) => {
    if (!service.name?.trim() || !service.category?.trim()) throw new AppError(`Service name and category are required at index ${i}`, 400);
    if (!Array.isArray(service.subServices) || service.subServices.length === 0) throw new AppError(`At least one sub-service is required for service ${i}`, 400);
    service.subServices.forEach((sub, j) => {
      if (!sub.name?.trim() || !sub.duration || !sub.price || isNaN(sub.price)) {
        throw new AppError(`Sub-service name, duration, and valid price are required at service ${i}, sub-service ${j}`, 400);
      }
      // Allow null or string for serviceImage during updates
      if (sub.serviceImage !== null && typeof sub.serviceImage !== 'string' && !(sub.serviceImage instanceof File)) {
        throw new AppError(`Sub-service image must be a string, null, or File at service ${i}, sub-service ${j}`, 400);
      }
    });
  });

  if (!['male', 'female', 'unisex'].includes(genderSpecific)) throw new AppError('Gender specific must be male, female, or unisex', 400);
  if (typeof homeService !== 'boolean') throw new AppError('Home service must be a boolean', 400);
};

module.exports = validateShopData;