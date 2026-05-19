const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const products = require('../data/products');

dotenv.config();

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    await Product.deleteMany();
    console.log('Old products deleted');

    await Product.insertMany(products);
    console.log(`${products.length} products inserted successfully`);

    process.exit(0);
  } catch (error) {
    console.error('Seeder Error:', error.message);
    process.exit(1);
  }
};

seedProducts();