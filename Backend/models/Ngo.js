const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema({
  organizationName: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  address: String,
  latitude: Number,
  longitude: Number,
  role: { type: String, default: 'ngo' }
});

module.exports = mongoose.model('Ngo', ngoSchema);
