const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Please add a message'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please add a type'],
      enum: ['promotional', 'alert', 'offer'],
    },
    status: {
      type: String,
      enum: ['Active', 'Expired'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
