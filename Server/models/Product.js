const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Fruits",
        "Vegetables",
        "Snacks",
        "Beverages",
        "Dairy",
        "Bakery",
        "Frozen Food",
        "Personal Care",
        "Household",
        "Instant Food",
        "Tea & Coffee",
        "Cleaning",
        "Baby Care",
        "Pet Care",
        "Health",
        "Stationery",
      ],
    },

    sellerName: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    stockQuantity: {
      type: Number,
      default: 100,
      min: 0,
    },

    productImage: {
      type: String,
      required: true,
    },

    images: {
      type: [String],
      default: [],
    },

    rating: {
      type: Number,
      default: () => Number((Math.random() * 5).toFixed(1)),
      min: 0,
      max: 5,
    },

    description: {
      type: String,
      default: "",
    },

    isApproved: {
      type: Boolean,
      default: true,
    },

    isHidden: {
      type: Boolean,
      default: false,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);