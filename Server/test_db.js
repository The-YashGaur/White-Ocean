const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const users = await User.find();
  console.log("Profile images in DB:", users.map(u => ({ email: u.email, profileImage: u.profileImage })));
  mongoose.disconnect();
}).catch(err => console.error(err));
