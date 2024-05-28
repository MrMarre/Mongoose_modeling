const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: String,
  streetNumber: Number,
  city: String,
  zipCode: String,
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  email: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now },
  addresses: [addressSchema],
});

const User = mongoose.model('User', userSchema);
const Address = mongoose.model('a');
