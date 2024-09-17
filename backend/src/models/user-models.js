const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  emailVerifiedAt: { type: Date, default: null },
  phone: { type: String, required: false, unique: true ,default: null },
  phoneVerifiedAt: { type: Date, default: null },
  photo: { type: String }, // Optional field to store profile picture URL
});

const User = mongoose.model('User', userSchema);
module.exports = User;
