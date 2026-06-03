const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const User = require('../models/User');
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

    // Seed default system administrator
    let admin = await User.findOne({ email: 'admin@whiteocean.com' });
    if (!admin) {
      admin = new User({
        firstName: 'System',
        lastName: 'Admin',
        email: 'admin@whiteocean.com',
        phone: '9999999999',
        address: 'White Ocean HQ, New Delhi',
        agreeToTerms: true,
        role: 'admin',
        status: 'Active',
        isEmailVerified: true,
        EmailVer: 1
      });
    }
    // Enforce default password
    admin.password = 'admin123';
    await admin.save();
    console.log('Default system administrator seeded/reset: admin@whiteocean.com / admin123');

    process.exit(0);
  } catch (error) {
    console.error('Seeder Error:', error.message);
    process.exit(1);
  }
};

seedProducts();