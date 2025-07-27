const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minLength : 3,
    maxLength : 20
  },
  lastName: {
    type: String,
    // required: [true, 'Last name is required'],
    trim: true,
    minLength : 3,
    maxLength : 20
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    // required: [true, 'Gender is required']
  },
  emailId: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim:true,
    immutable:true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
    trim:true
  },
  role: {
    type: String,
    enum: ['user', 'serviceProvider', 'admin'],
    default: 'user',
    required: true
  },
 
  profilePhoto: {
    url: {
      type: String,
      default: process.env.DEFAULT_PROFILE_PHOTO
    },
    public_id: {
      type: String,
      default: null
    }
  },
  
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  favorites: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'Shop'
    }],
    default: []
  },
  cart: {
    type: [
      {
        shopName: {
          type: String,
          required: true,
          ref: 'Shop' 
        },
        services: [
          {
            service_id: {
              type: Schema.Types.ObjectId,
              ref: 'Service',
              required: true
            },
            name: {
              type: String,
              required: true
            },
            image: {
              type: String,
              required: true
            },
            price: {
              type: Number,
              required: true,
              min: 0
            },
            duration:{
              type: Number,
              required: true,
              min: 0
            },
            quantity: {
              type: Number,
              required: true,
              min: 1,
              max: 1,
              default: 1
            },
            addedAt: {
              type: Date,
              default: Date.now
            }
          }
        ],
        createdAt: {
          type: Date,
          default: Date.now,
          immutable: true
        },
        updatedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
  default: []
}

}, {
  timestamps: true
});

const User = mongoose.model('user', userSchema);
module.exports = User;