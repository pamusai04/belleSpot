const Shop = require('../models/shope');
const User = require('../models/user');
const { cloudinary } = require('../config/cloudinary');
const bcrypt = require('bcrypt');
const validator = require('validator');
const mongoose = require('mongoose');


const updateProfile = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    const userEmail = req.result.emailId;
    const { firstName, lastName, gender, location, password, currentPassword } = req.body;

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'First name and last name are required',
      });
    }

    const user = await User.findOne({ emailId: userEmail }).select('password profilePhoto');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const updates = {
      firstName,
      lastName,
      gender: gender || undefined,
    };

    if (location) {
      try {
        const parsedLocation = JSON.parse(location);
        if (parsedLocation.type !== 'Point' || !Array.isArray(parsedLocation.coordinates) || parsedLocation.coordinates.length !== 2) {
          return res.status(400).json({
            success: false,
            message: 'Location must be a GeoJSON Point with [lng, lat] coordinates',
          });
        }
        updates.location = parsedLocation;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid location JSON format',
        });
      }
    }

    if (password) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to update password',
        });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      if (!validator.isStrongPassword(password)) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters with uppercase, lowercase, number, and symbol',
        });
      }

      updates.password = await bcrypt.hash(password, 12);
    }

    if (req.file) {
      try {
        if (user.profilePhoto && user.profilePhoto.public_id) {
          console.log('Deleting old Cloudinary photo:', user.profilePhoto.public_id);
          await cloudinary.uploader.destroy(user.profilePhoto.public_id, { invalidate: true });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'user-profiles',
          width: 500,
          height: 500,
          crop: 'fill',
          gravity: 'face',
          quality: 'auto:good',
        });
        console.log('Cloudinary upload result:', result);

        updates.profilePhoto = {
          url: result.secure_url,
          public_id: result.public_id,
        };
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload profile photo',
          error: uploadError.message,
        });
      }
    } else {
      console.log('No file uploaded for profilePhoto');
    }

    console.log('Updates to apply:', updates);
    const updatedUser = await User.findOneAndUpdate(
      { emailId: userEmail },
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found after update',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    return res.status(statusCode).json({
      success: false,
      message: statusCode === 400 ? error.message : 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};


const getallShops = async (req, res) => {
  try {
    const shops = await Shop.find({})
      .select('shopImage offers services location timings genderSpecific shopName homeService realTimeStatus globalRating')
      .populate({
        path: 'offers',
        select: 'name discountType  discountValue description startDate endDate genderSpecific minOrderValue'
      })
      .populate({
        path: 'services.subServices',
        select: 'name serviceImage duration price ratings'
      });

    res.status(200).json(shops); 

  } catch (error) {
    console.error('Error fetching shops:', error);
    res.status(500).json({
      message: 'Failed to fetch shops',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.result._id;
    const user = await User.findById(userId).select('cart');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user.cart
    });

  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = req.result._id;
    const { shopName, serviceId } = req.body;
    
    if (!shopName || !serviceId) {
      return res.status(400).json({
        success: false,
        message: 'Shop name and Service ID are required'
      });
    }

    const shop = await Shop.findOne({ shopName });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    let serviceDetails = null;
    for (const category of shop.services) {
      const foundService = category.subServices.find(
        sub => sub._id.toString() === serviceId
      );
    
      if (foundService) {
        serviceDetails = {
          name: foundService.name,
          image: foundService.serviceImage,
          price: foundService.price,
          duration : foundService.duration
        };
        break;
      }
    }

    if (!serviceDetails) {
      return res.status(404).json({
        success: false,
        message: 'Service not found in this shop'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const existingServiceIndex = user.cart.findIndex(
      cartItem => cartItem.shopName === shopName && 
                cartItem.services.some(s => s.service_id.toString() === serviceId)
    );
   
    if (existingServiceIndex >= 0) {
      return res.status(400).json({
        success: true,
        message: 'Service already exists in cart'
      });
    }

    const shopInCartIndex = user.cart.findIndex(item => item.shopName === shopName);

    if (shopInCartIndex >= 0) {
      user.cart[shopInCartIndex].services.push({
        service_id: serviceId,
        name: serviceDetails.name,
        image: serviceDetails.image,
        price: serviceDetails.price,
        duration: serviceDetails.duration,
        quantity: 1,
        addedAt: new Date()
      });
      user.cart[shopInCartIndex].updatedAt = new Date();
    } else {
      user.cart.push({
        shopName: shopName,
        services: [{
          service_id: serviceId,
          name: serviceDetails.name,
          image: serviceDetails.image,
          price: serviceDetails.price,
          duration: serviceDetails.duration,
          quantity: 1,
          addedAt: new Date()
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await user.save();

     
    res.status(200).json({
      success: true,
      data:user.cart,
      message: 'Item added to cart successfully'
    });

  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const userId = req.result._id;
    const { shopName, serviceId } = req.body;
    

    if (!shopName || !serviceId) {
      return res.status(400).json({
        success: false,
        message: 'Shop name and Service ID are required',
      });
    }
    
    

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Service ID format',
      });
    }
    

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const shopIndex = user.cart.findIndex((item) => item.shopName === shopName);
    if (shopIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found in cart',
      });
    }
    

    const serviceIndex = user.cart[shopIndex].services.findIndex((s) => s.service_id.toString() === serviceId);
   
    
    if (serviceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Service not found in cart',
      });
    }
    user.cart[shopIndex].services.splice(serviceIndex, 1);
    user.cart[shopIndex].updatedAt = new Date();

    
    if (user.cart[shopIndex].services.length === 0) {
      user.cart.splice(shopIndex, 1);
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Service removed successfully',
      data: user.cart,
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};


const formatLocation = (location) => {
  if (!location || !location.coordinates) return null;
  return {
    type: location.type || 'Point',
    coordinates: location.coordinates
  };
};

const getUserForEdit = async (req, res) => {
  try {
    const userEmail = req.result.emailId;

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const user = await User.findOne({ emailId: userEmail })
      .select('firstName lastName gender password profilePhoto location');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    const userData = {
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      profilePhoto: user.profilePhoto,
      password: user.password ? '••••••••' : undefined,
      location: formatLocation(user?.location)
    };
    return res.status(200).json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error("Profile fetch error:", error);


    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid data format"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile data",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const deleteOldPhoto = async (user) => {
  if (user.profilePhoto && !user.profilePhoto.includes('default')) {
    const publicId = user.profilePhoto.split('/').slice(-2).join('/').split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  }
};

const toggle_favorite =  async (req, res) => {
  try {
    
    const { shopId } = req.body;

    const user = await User.findById(req.result?._id);
    const index = user.favorites.indexOf(shopId);
    if (index === -1) {
      user.favorites.push(shopId);
    } else {
      user.favorites.splice(index, 1);
    }

    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Favorites updated',
      favorites: user.favorites
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const favorites =  async (req, res) => {
  try {
    const user = await User.findById(req.result._id);
    res.status(200).json({
      success: true,
      data: user.favorites
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { updateProfile, deleteOldPhoto, getallShops, addToCart, getCart, getUserForEdit , removeFromCart,favorites, toggle_favorite};


