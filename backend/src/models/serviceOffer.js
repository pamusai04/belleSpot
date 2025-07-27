
const mongoose = require('mongoose');
const { Schema } = mongoose;

const offerSchema = new Schema({

        providerId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: [true, 'Provider ID is required']
        },
        shopId: {
            type: Schema.Types.ObjectId,
            ref: 'Shop',
            required: false 
        },
        name: {
            type: String,
            required: [true, 'Offer name is required'],
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        discountType: {
            type: String,
            enum: ['percentage', 'flat'],
            required: [true, 'Discount type is required']
        },
        discountValue: {
            type: Number,
            required: [true, 'Discount value is required'],
            min: [0, 'Discount cannot be negative']
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required']
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required'],
            validate: {
            validator: function(endDate) {
                return endDate > this.startDate;
            },
            message: 'End date must be after start date'
            }
        },
        isActive: {
            type: Boolean,
            default: true
        },
        minOrderValue: {
            type: Number,
            min: [0, 'Minimum order value cannot be negative']
        },
        
        
}, { 
  timestamps: true 
});


const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;