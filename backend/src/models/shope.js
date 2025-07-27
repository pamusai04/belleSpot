const mongoose = require('mongoose');
const { Schema } = mongoose;

const subServiceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  serviceImage: { type: String, default: null, trim: true }, 
  duration: {
    type: Number,
    required: [true, 'Duration is required (minutes).'],
    min: [5, 'Minimum duration is 5 minutes.'],
    max: [720, 'Maximum duration is 12 hours.'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required.'],
    min: [0, 'Price cannot be negative.'],
  },
  ratings: [{
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    score: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1.'],
      max: [5, 'Rating cannot exceed 5.'],
    },
  }],
  avg_rating: {
    type: Number,
    default: 0,
    min: [0, 'Average rating cannot be negative.'],
    max: [5, 'Average rating cannot exceed 5.'],
  },
});

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required.'],
    trim: true,
    minlength: [2, 'Service name must be at least 2 characters.'],
  },
  category: { type: String, required: [true, 'Service category is required.'], trim: true },
  subServices: {
    type: [subServiceSchema],
    required: true,
    validate: {
      validator: (arr) => arr.length > 0,
      message: 'At least one sub-service is required.',
    },
  },
});

const timingSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  },
  opens: { type: String, default: '' },
  closes: { type: String, default: '' },
  isClosed: { type: Boolean, default: false },
});

const locationSchema = new mongoose.Schema({
  address: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  pincode: { type: String, required: true, trim: true },
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
});

const shopSchema = new mongoose.Schema({
  providerId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Provider ID is required.'],
  },
  shopName: {
    type: String,
    required: [true, 'Shop name is required.'],
    trim: true,
    minlength: [3, 'Shop name must be at least 3 characters.'],
    maxlength: [30, 'Shop name cannot exceed 30 characters.'],
  },
  shopImage: {
    type: String,
    required: [true, 'Shop image URL is required.'],
  },
  
  genderSpecific: {
    type: String,
    enum: ['male', 'female', 'unisex'],
    default: 'female',
    required: true,
  },
  location: { type: locationSchema, required: true },
  emailId: {
    type: String,
    required: [true, 'Email is required.'],
    unique: true,
    lowercase: true,
    trim: true,
    immutable: true,
  },
  timings: {
    type: [timingSchema],
    required: true,
    validate: {
      validator: (arr) => arr.length === 7,
      message: 'Timings for all 7 days are required.',
    },
  },
  services: {
    type: [serviceSchema],
    required: true,
    validate: {
      validator: (arr) => arr.length > 0,
      message: 'At least one service is required.',
    },
  },
  offers: [{ type: Schema.Types.ObjectId, ref: 'Offer' }],
  homeService: {
    type: Boolean,
    default: false,
    required: [true, 'Home service availability is required.'],
  },
  homeServiceRequests: [{
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    serviceName: { type: String, required: true, trim: true },
    subServiceName: { type: String, required: true, trim: true },
    preferredTime: {
      type: Date,
      required: true,
      validate: {
        validator: (v) => v > new Date(),
        message: 'Preferred time must be in the future.',
      },
    },
    address: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      pincode: { type: String, required: true, trim: true },
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
      },
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
      required: true,
    },
    createdAt: { type: Date, default: Date.now, immutable: true },
  }],
  globalRating: {
    ratings: [{
      userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
      score: {
        type: Number,
        required: true,
        min: [1, 'Rating must be at least 1.'],
        max: [5, 'Rating cannot exceed 5.'],
      },
    }],
    avg_rating: {
      type: Number,
      default: 0,
      min: [0, 'Average rating cannot be negative.'],
      max: [5, 'Average rating cannot exceed 5.'],
    },
  },
}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);