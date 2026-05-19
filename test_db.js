const mongoose = require('mongoose');
const User = require('./Server/models/User');
require('dotenv').config({ path: './Server/.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const users = await User.find();
  console.log("Profile images in DB:", users.map(u => u.profileImage));
  mongoose.disconnect();
}).catch(err => console.error(err));
