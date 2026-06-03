const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    websiteName: {
      type: String,
      default: 'White Ocean E-Commerce',
    },
    deliveryCharge: {
      type: Number,
      default: 40,
    },
    freeDeliveryMin: {
      type: Number,
      default: 500,
    },
    taxPercentage: {
      type: Number,
      default: 5,
    },
    contactEmail: {
      type: String,
      default: 'support@whiteocean.com',
    },
    contactPhone: {
      type: String,
      default: '+1 (800) 555-GROCERY',
    },
    banners: {
      type: [String],
      default: [
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=1200&q=80'
      ],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Settings', settingsSchema);
